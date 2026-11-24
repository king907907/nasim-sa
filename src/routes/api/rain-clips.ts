import { createFileRoute } from "@tanstack/react-router";
import { mkdtemp, open, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getSql } from "@/lib/db";
import { SA_REGIONS } from "@/lib/weather/cities";
import { RAIN_MAX_BYTES, SEED_CLIPS, classifyGray, describeRain, isRainLevel, type RainLevel } from "@/lib/weather/rain";
import { prepareClip, toPhoneMp4, ensurePhoneMp4, isH264 } from "@/lib/weather/rain.server";
import { flattenPhoneMp4, isFragmentedMp4 } from "@/lib/weather/mp4-flat";

type Row = { id: string; region_id: string; place: string; intensity: string; created_at?: string | Date; mime?: string; bytes?: Uint8Array | Buffer };
type Upload = { path: string; dir: string; regionId: string; place: string; name: string; size: number; received: number };

const REGISTRY = join(tmpdir(), "naseem-rain-registry.json");
const CHUNK_MAX = 1024 * 1024;

function asClip(row: Row) {
  const level: RainLevel = isRainLevel(row.intensity) ? row.intensity : "moderate";
  const region = SA_REGIONS.find((item) => item.id === row.region_id)?.name ?? "";
  const at = row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at ?? new Date().toISOString());
  return {
    id: row.id,
    regionId: row.region_id,
    place: row.place,
    level,
    src: `/api/rain-clips?id=${encodeURIComponent(row.id)}&v=2`,
    caption: describeRain(level, row.place, region),
    at,
  };
}

const FORGET_BEFORE = "2026-11-11T07:40:00.000Z";

async function forgetOldClips(): Promise<void> {
  const sql = await getSql();
  await sql`delete from rain_clips where created_at < ${FORGET_BEFORE}`;
}

async function listRows(): Promise<Row[]> {
  const sql = await getSql();
  return sql<Row>`select id, region_id, place, intensity, created_at from rain_clips order by created_at desc limit 80`;
}

function videoResponse(bytes: Uint8Array, mime: string, request: Request): Response {
  const total = bytes.byteLength;
  const headers = {
    "content-type": mime || "video/mp4",
    "accept-ranges": "bytes",
    "cache-control": "public, max-age=86400",
    "content-disposition": "inline",
  };
  const range = request.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (!match || (match[1] === "" && match[2] === "")) {
      return new Response(null, { status: 416, headers: { "content-range": `bytes */${total}` } });
    }
    let start = match[1] ? Number(match[1]) : 0;
    let end = match[2] ? Number(match[2]) : total - 1;
    if (match[1] === "") {
      start = Math.max(0, total - Number(match[2]));
      end = total - 1;
    }
    if (!Number.isFinite(start) || !Number.isFinite(end) || start >= total || start > end) {
      return new Response(null, { status: 416, headers: { "content-range": `bytes */${total}` } });
    }
    end = Math.min(end, total - 1);
    const slice = bytes.subarray(start, end + 1);
    return new Response(asBlob(slice), {
      status: 206,
      headers: {
        ...headers,
        "content-length": String(slice.byteLength),
        "content-range": `bytes ${start}-${end}/${total}`,
      },
    });
  }
  return new Response(asBlob(bytes), {
    status: 200,
    headers: { ...headers, "content-length": String(total) },
  });
}

function asBlob(bytes: Uint8Array): Blob {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return new Blob([copy]);
}

function noStore(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function watchPage(fileSrc: string): Response {
  const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>تشغيل</title>
<style>
  html,body{margin:0;height:100%;background:#000;color:#fff;font-family:-apple-system,sans-serif}
  video{width:100%;height:100%;background:#000;object-fit:contain}
  a,button{position:fixed;z-index:2;border:0;border-radius:999px;background:#f4f1ea;color:#111;font-weight:700;text-decoration:none}
  a{top:16px;right:16px;padding:10px 14px}
  button{top:42%;left:50%;transform:translate(-50%,-50%);min-width:120px;height:64px;font-size:22px}
</style>
</head>
<body>
<a href="javascript:history.back()">رجوع</a>
<video id="clip" src="${fileSrc}" controls playsinline webkit-playsinline preload="auto"></video>
<button id="go" type="button">تشغيل</button>
<script>
  const video = document.getElementById("clip");
  const button = document.getElementById("go");
  const start = () => {
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.muted = true;
    const pending = video.play();
    if (!pending) { button.remove(); return; }
    pending.then(() => { button.remove(); video.muted = false; }).catch(() => { video.controls = true; });
  };
  button.addEventListener("click", start);
  video.addEventListener("click", start);
  video.addEventListener("ended", () => { video.pause(); });
</script>
</body>
</html>`;
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

export const Route = createFileRoute("/api/rain-clips")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("watch") === "1") {
          const watchId = url.searchParams.get("id") ?? "";
          const file = url.searchParams.get("file") ?? "";
          if (/^[a-z0-9-]+$/i.test(watchId)) return watchPage(`/api/rain-clips?id=${encodeURIComponent(watchId)}`);
          if (/^\/rain\/[a-z0-9._-]+$/i.test(file)) return watchPage(file);
          return new Response("missing", { status: 404 });
        }
        const id = url.searchParams.get("id");
        try {
          if (id) {
            const sql = await getSql();
            await forgetOldClips();
            const rows = await sql<Row>`select mime, bytes from rain_clips where id = ${id} limit 1`;
            const row = rows[0];
            if (!row?.bytes) return new Response("missing", { status: 404 });
            const raw = row.bytes instanceof Uint8Array ? row.bytes : new Uint8Array(row.bytes);
            let copy = new Uint8Array(raw.byteLength);
            copy.set(raw);
            if (isFragmentedMp4(copy) || !isH264(copy)) {
              try {
                const fixed = isFragmentedMp4(copy) ? flattenPhoneMp4(copy) : await ensurePhoneMp4(copy);
                const next = new Uint8Array(fixed.byteLength);
                next.set(fixed);
                await sql`update rain_clips set bytes = ${Buffer.from(next)}, mime = 'video/mp4' where id = ${id}`;
                copy = next;
              } catch (error) {
                console.error("[naseem] repair video", error);
              }
            }
            return videoResponse(copy, "video/mp4", request);
          }
          await forgetOldClips();
          const rows = await listRows();
          return noStore({ clips: [...SEED_CLIPS, ...rows.map(asClip)] });
        } catch (error) {
          console.error("[naseem] rain list", error);
          return noStore({ clips: SEED_CLIPS });
        }
      },
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as Record<string, unknown>;
          const phase = String(body.phase ?? "");
          if (phase === "start") return await startUpload(body);
          if (phase === "chunk") {
            const raw = Buffer.from(String(body.data ?? ""), "base64");
            return await saveChunk(String(body.id ?? ""), Number(body.offset ?? 0), raw);
          }
          if (phase === "finish") return await finishUpload(body);
          return noStore({ error: "طلب غير مفهوم" }, 400);
        } catch (error) {
          console.error("[naseem] rain upload", error);
          return noStore({ error: "تعذر حفظ الفيديو" }, 500);
        }
      },
    },
  },
});

function lock<T>(task: () => Promise<T>): Promise<T> {
  const g = globalThis as typeof globalThis & { __naseemUpLock?: Promise<unknown> };
  const prev = g.__naseemUpLock ?? Promise.resolve();
  const run = prev.catch(() => undefined).then(task);
  g.__naseemUpLock = run.then(() => undefined, () => undefined);
  return run;
}

async function readRegistry(): Promise<Record<string, Upload>> {
  try {
    return JSON.parse(await readFile(REGISTRY, "utf8")) as Record<string, Upload>;
  } catch {
    return {};
  }
}

async function writeRegistry(all: Record<string, Upload>): Promise<void> {
  await writeFile(REGISTRY, JSON.stringify(all));
}

async function startUpload(body: Record<string, unknown>): Promise<Response> {
  const regionId = String(body.regionId ?? "");
  const place = String(body.place ?? "").trim().slice(0, 40);
  const name = String(body.name ?? "clip.mov").slice(0, 120);
  const size = Number(body.size);
  if (!SA_REGIONS.some((item) => item.id === regionId)) return noStore({ error: "اختر المنطقة" }, 400);
  if (place.length < 2) return noStore({ error: "اكتب اسم المكان" }, 400);
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (!["mov", "mp4", "m4v", "webm", "qt"].includes(ext)) return noStore({ error: "الصيغة لازم MOV أو MP4" }, 400);
  if (!Number.isFinite(size) || size < 1 || size > RAIN_MAX_BYTES) return noStore({ error: "حجم الفيديو غير مقبول" }, 400);
  return lock(async () => {
    const all = await readRegistry();
    if (Object.keys(all).length > 12) return noStore({ error: "الرفع مشغول. حاول بعد لحظات." }, 429);
    const dir = await mkdtemp(join(tmpdir(), "naseem-up-"));
    const id = `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    const path = join(dir, "in.mov");
    await writeFile(path, Buffer.alloc(0));
    all[id] = { path, dir, regionId, place, name, size, received: 0 };
    await writeRegistry(all);
    return noStore({ id });
  });
}

async function saveChunk(id: string, offset: number, bytes: Uint8Array): Promise<Response> {
  if (!/^u[a-z0-9]+$/.test(id)) return noStore({ error: "جلسة الرفع غير صالحة" }, 400);
  if (!Number.isInteger(offset) || offset < 0 || bytes.byteLength < 1 || bytes.byteLength > CHUNK_MAX) {
    return noStore({ error: "جزء الرفع غير صالح" }, 400);
  }
  return lock(async () => {
    const all = await readRegistry();
    const upload = all[id];
    if (!upload) return noStore({ error: "انتهت جلسة الرفع. أعد المحاولة." }, 400);
    if (offset > upload.received || offset + bytes.byteLength > upload.size) {
      return noStore({ error: "ترتيب الرفع اختل. أعد المحاولة." }, 409);
    }
    const handle = await open(upload.path, "r+");
    try {
      let pending = bytes;
      let pos = offset;
      while (pending.byteLength > 0) {
        const { bytesWritten } = await handle.write(pending, 0, pending.byteLength, pos);
        if (bytesWritten <= 0) return noStore({ error: "تعذر كتابة جزء من الفيديو" }, 500);
        pos += bytesWritten;
        pending = pending.subarray(bytesWritten);
      }
    } finally {
      await handle.close();
    }
    const end = offset + bytes.byteLength;
    if (end > upload.received) upload.received = end;
    all[id] = upload;
    await writeRegistry(all);
    return noStore({ received: upload.received });
  });
}

async function finishUpload(body: Record<string, unknown>): Promise<Response> {
  const id = String(body.id ?? "");
  if (!/^u[a-z0-9]+$/.test(id)) return noStore({ error: "جلسة الرفع غير صالحة" }, 400);
  const upload = await lock(async () => {
    const all = await readRegistry();
    const found = all[id];
    if (!found) return null;
    delete all[id];
    await writeRegistry(all);
    return found;
  });
  if (!upload) return noStore({ error: "انتهت جلسة الرفع. أعد المحاولة." }, 400);
  try {
    if (upload.received !== upload.size) return noStore({ error: "الملف وصل ناقص. أعد الرفع." }, 400);
    const frameBytes = 160 * 284 * 6;
    const packed = Buffer.from(String(body.frames ?? ""), "base64");
    let level: RainLevel;
    let bytes: Buffer;
    let mime = "video/mp4";
    if (packed.length >= frameBytes) {
      const verdict = classifyGray(new Uint8Array(packed.subarray(0, frameBytes)), 160, 284, 6);
      if (!verdict.ok) return noStore({ error: verdict.reason }, 422);
      bytes = Buffer.from(await readFile(upload.path));
      if (bytes.length < 800) return noStore({ error: "نسخة 720 وصلت ناقصة. أعد المحاولة." }, 400);
      level = verdict.level;
      if (isFragmentedMp4(bytes)) {
        try {
          bytes = Buffer.from(flattenPhoneMp4(bytes));
        } catch (error) {
          console.error("[naseem] flatten", error);
        }
      }
      if (!isH264(new Uint8Array(bytes))) {
        const play = join(upload.dir, "play.mp4");
        try {
          await toPhoneMp4(upload.path, play);
          bytes = Buffer.from(await readFile(play));
          mime = "video/mp4";
        } catch (error) {
          console.error("[naseem] phone mp4", error);
          return noStore({ error: "ما قدر يجهز نسخة 720. أعد الرفع وخلّ الشاشة مفتوحة حتى يخلص." }, 422);
        }
      }
    } else {
      const play = join(upload.dir, "play.mp4");
      const verdict = await prepareClip(upload.path, play);
      if (!verdict.ok) return noStore({ error: verdict.reason }, 422);
      level = verdict.level;
      bytes = Buffer.from(await readFile(play));
    }
    const sql = await getSql();
    const clipId = `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
    const rows = await sql<{ created_at: string | Date }>`insert into rain_clips (id, region_id, place, intensity, mime, bytes) values (${clipId}, ${upload.regionId}, ${upload.place}, ${level}, ${mime}, ${bytes}) returning created_at`;
    await sql`delete from rain_clips where id in (select id from rain_clips order by created_at desc offset 80)`;
    const atRaw = rows[0]?.created_at;
    const at = atRaw instanceof Date ? atRaw.toISOString() : String(atRaw ?? new Date().toISOString());
    const region = SA_REGIONS.find((item) => item.id === upload.regionId)?.name ?? "";
    return noStore({
      clip: {
        id: clipId,
        regionId: upload.regionId,
        place: upload.place,
        level,
        src: `/api/rain-clips?id=${encodeURIComponent(clipId)}&v=2`,
        caption: describeRain(level, upload.place, region),
        at,
      },
    });
  } finally {
    await rm(upload.dir, { recursive: true, force: true });
  }
}
