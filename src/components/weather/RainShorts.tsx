import { Plus, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SA_REGIONS } from "@/lib/weather/cities";
import { RAIN_LABEL, RAIN_MAX_BYTES, SEED_CLIPS, classifyGray, describeRain, formatClipStamp, type RainLevel } from "@/lib/weather/rain";

export type RainClip = {
  id: string;
  regionId: string;
  place: string;
  level: RainLevel;
  src: string;
  caption: string;
  at: string;
};

const DB_NAME = "naseem-rain";
const CHUNK = 256 * 1024;

function toBase64(bytes: Uint8Array): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let out = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const a = bytes[index] ?? 0;
    const b = index + 1 < bytes.length ? (bytes[index + 1] ?? 0) : 0;
    const c = index + 2 < bytes.length ? (bytes[index + 2] ?? 0) : 0;
    const triple = (a << 16) | (b << 8) | c;
    out += alphabet[(triple >> 18) & 63];
    out += alphabet[(triple >> 12) & 63];
    out += index + 1 < bytes.length ? alphabet[(triple >> 6) & 63] : "=";
    out += index + 2 < bytes.length ? alphabet[triple & 63] : "=";
  }
  return out;
}

function waitMedia(video: HTMLVideoElement, event: string, ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("play")), ms);
    const done = () => {
      window.clearTimeout(timer);
      resolve();
    };
    video.addEventListener(event, done, { once: true });
    video.addEventListener("error", () => {
      window.clearTimeout(timer);
      reject(new Error("play"));
    }, { once: true });
  });
}

function addClipAudio(video: HTMLVideoElement, stream: MediaStream): () => void {
  const AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return () => {};
  const ctx = new AudioContextCtor();
  try {
    const source = ctx.createMediaElementSource(video);
    const dest = ctx.createMediaStreamDestination();
    const silent = ctx.createGain();
    silent.gain.value = 0;
    source.connect(dest);
    source.connect(silent);
    silent.connect(ctx.destination);
    for (const track of dest.stream.getAudioTracks()) stream.addTrack(track);
    void ctx.resume();
    return () => {
      source.disconnect();
      void ctx.close();
    };
  } catch {
    void ctx.close();
    return () => {};
  }
}
async function sampleRain(file: File): Promise<{ frames: Uint8Array; upload: File }> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  const note = document.createElement("p");
  note.textContent = "يحضّر نسخة 720… لا تقفل الشاشة";
  note.style.cssText = "position:fixed;left:0;right:0;bottom:32px;z-index:81;margin:0;text-align:center;color:#fff;font:600 16px/1.4 sans-serif;";
  let recorder: MediaRecorder | null = null;
  let releaseAudio = () => {};
  const chunks: Blob[] = [];
  try {
    video.muted = false;
    video.volume = 1;
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    video.preload = "auto";
    video.style.cssText = "position:fixed;inset:0;width:100%;height:100%;object-fit:contain;background:#000;z-index:40;";
    document.body.append(video, note);
    const stream = typeof MediaStream !== "undefined" ? new MediaStream() : null;
    if (stream) releaseAudio = addClipAudio(video, stream);
    video.src = url;
    const startedPlay = video.play().catch(() => null);
    if (video.readyState < 1) await waitMedia(video, "loadedmetadata", 15000);
    if (Number.isFinite(video.duration) && video.duration > 45) throw new Error("long");
    if (Number.isFinite(video.duration) && video.duration > 0 && video.duration < 1.2) throw new Error("short");
    if (!video.videoWidth) await waitMedia(video, "loadeddata", 8000);
    const small = document.createElement("canvas");
    small.width = 160;
    small.height = 284;
    const sample = small.getContext("2d", { willReadFrequently: true });
    if (!sample) throw new Error("frames");
    const long = Math.max(video.videoWidth || 1280, video.videoHeight || 720);
    const scale = Math.min(1, 1280 / long);
    const width = evenSize((video.videoWidth || 720) * scale);
    const height = evenSize((video.videoHeight || 1280) * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const paint = canvas.getContext("2d", { alpha: false });
    const mime = recorderMime();
    if (paint && mime && stream) {
      try {
        const canvasStream = canvas.captureStream(30);
        const videoTrack = canvasStream.getVideoTracks()[0];
        if (videoTrack) stream.addTrack(videoTrack);
        recorder = openRecorder(stream, mime);
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };
      } catch {
        recorder = null;
      }
    }
    if (video.paused) {
      try {
        video.muted = false;
        await video.play();
      } catch {
        video.muted = true;
        await startedPlay;
        if (video.paused) {
          try {
            await video.play();
          } catch {
            throw new Error("play");
          }
        }
      }
    }
    if (recorder && recorder.state === "inactive") recorder.start(250);
    const snaps: Uint8Array[] = [];
    let last = 0;
    let tooLong = false;
    const started = performance.now();
    await new Promise<void>((resolve) => {
      const kill = window.setTimeout(resolve, 48000);
      const tick = () => {
        const now = performance.now();
        if (Number.isFinite(video.duration) && video.duration > 45) tooLong = true;
        if (paint && video.readyState >= 2) paint.drawImage(video, 0, 0, width, height);
        if (now - last > 400 && snaps.length < 30 && video.readyState >= 2) {
          sample.drawImage(video, 0, 0, 160, 284);
          const pixels = sample.getImageData(0, 0, 160, 284).data;
          const gray = new Uint8Array(160 * 284);
          for (let pixel = 0, cell = 0; pixel < pixels.length; pixel += 4, cell += 1) {
            gray[cell] = Math.round(((pixels[pixel] ?? 0) + (pixels[pixel + 1] ?? 0) + (pixels[pixel + 2] ?? 0)) / 3);
          }
          snaps.push(gray);
          last = now;
        }
        const elapsed = (now - started) / 1000;
        const limit = Number.isFinite(video.duration) && video.duration > 0 ? Math.min(video.duration, 45) : 45;
        if (tooLong || video.ended || elapsed >= limit) {
          window.clearTimeout(kill);
          resolve();
          return;
        }
        window.requestAnimationFrame(tick);
      };
      tick();
    });
    video.pause();
    if (tooLong) throw new Error("long");
    if (snaps.length < 3) throw new Error("frames");
    const frames = new Uint8Array(160 * 284 * 6);
    for (let index = 0; index < 6; index += 1) {
      const from = snaps[Math.min(snaps.length - 1, Math.floor(((index + 0.5) * snaps.length) / 6))] ?? snaps[snaps.length - 1];
      frames.set(from, index * 160 * 284);
    }
    const stopped = recorder && recorder.state !== "inactive"
      ? new Promise<void>((resolve) => {
          recorder?.addEventListener("stop", () => resolve(), { once: true });
          recorder?.stop();
        })
      : Promise.resolve();
    await stopped;
    const blob = new Blob(chunks, { type: "video/mp4" });
    const upload = blob.size > 8000 ? new File([blob], "rain-720.mp4", { type: "video/mp4" }) : file;
    return { frames, upload };
  } finally {
    releaseAudio();
    if (recorder && recorder.state === "recording") recorder.stop();
    video.pause();
    video.removeAttribute("src");
    video.load();
    video.remove();
    note.remove();
    URL.revokeObjectURL(url);
  }
}

function evenSize(value: number): number {
  return Math.max(2, Math.round(value / 2) * 2);
}

function recorderMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const types = ["video/mp4;codecs=avc1.4d0028,mp4a.40.2", "video/mp4;codecs=avc1", "video/mp4"];
  return types.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function openRecorder(stream: MediaStream, mime: string): MediaRecorder {
  try {
    return new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 2_500_000 });
  } catch {
    for (const track of stream.getAudioTracks()) {
      stream.removeTrack(track);
      track.stop();
    }
    try {
      return new MediaRecorder(new MediaStream(stream.getVideoTracks()), { mimeType: "video/mp4", videoBitsPerSecond: 2_500_000 });
    } catch {
      throw new Error("record");
    }
  }
}

function shrinkMessage(error: unknown): string {
  const code = error instanceof Error ? error.message : "";
  if (code === "long") return "الشورت لازم يكون أقل من ٤٥ ثانية";
  if (code === "short") return "الفيديو قصير جداً";
  if (code === "frames" || code === "play") return "ما قدر يقرأ المطر من المقطع. أعد المحاولة.";
  if (code === "record") return "ما قدر يجهز نسخة 720 على الجهاز. أعد المحاولة وخلّ الشاشة مفتوحة.";
  return "ما قدر يجهز المقطع. أعد المحاولة من زر تحليل ورفع.";
}

function regionName(id: string): string {
  return SA_REGIONS.find((region) => region.id === id)?.name ?? "";
}

async function localClips(): Promise<RainClip[]> {
  const db = await openDb();
  return new Promise((resolve) => {
    const request = db.transaction("clips").objectStore("clips").getAll();
    request.onsuccess = () => {
      const rows = (request.result as { id: string; regionId: string; place: string; level: RainLevel; blob: Blob; caption?: string; at?: string }[]) ?? [];
      resolve(rows.map((row) => ({
        id: row.id,
        regionId: row.regionId,
        place: row.place,
        level: row.level,
        src: URL.createObjectURL(row.blob),
        caption: row.caption || describeRain(row.level, row.place, regionName(row.regionId)),
        at: row.at || new Date().toISOString(),
      })));
    };
    request.onerror = () => resolve([]);
  });
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 4);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (db.objectStoreNames.contains("clips")) db.deleteObjectStore("clips");
      db.createObjectStore("clips", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

type UploadReply = { id?: string; error?: string; clip?: RainClip; received?: number };

async function readJson(response: Response): Promise<UploadReply> {
  const text = await response.text();
  if (!text) return { error: "انقطع الاتصال أثناء الرفع. أعد المحاولة." };
  try {
    const data = JSON.parse(text) as UploadReply;
    if (!response.ok && !data.error) return { error: "تعذر رفع الفيديو" };
    return data;
  } catch {
    return { error: "تعذر رفع الفيديو" };
  }
}

async function postJson(body: Record<string, string | number>): Promise<UploadReply> {
  const response = await fetch("/api/rain-clips", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return readJson(response);
}

async function postChunk(id: string, offset: number, bytes: Uint8Array): Promise<UploadReply> {
  return postJson({ phase: "chunk", id, offset, data: toBase64(bytes) });
}

export function RainShorts({ regionId }: { regionId: string }) {
  const [region, setRegion] = useState(regionId);
  const [clips, setClips] = useState<RainClip[]>(SEED_CLIPS);
  const [muted, setMuted] = useState(true);
  const [upload, setUpload] = useState(false);
  const [place, setPlace] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const prepRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let dead = false;
    void (async () => {
      const local = await localClips().catch(() => []);
      if (dead) return;
      setClips((current) => merge(current, local));
      try {
        const response = await fetch("/api/rain-clips");
        const data = (await response.json()) as { clips?: RainClip[] };
        if (!dead && Array.isArray(data.clips)) setClips((current) => merge(data.clips ?? [], current.filter((clip) => clip.id.startsWith("local-"))));
      } catch {
        /* seeds and local clips stay */
      }
    })();
    return () => {
      dead = true;
    };
  }, []);

  const shown = useMemo(() => clips.filter((clip) => clip.regionId === region), [clips, region]);

  const submit = async (file: File | undefined) => {
    setError("");
    if (!file) return;
    if (!place.trim() || place.trim().length < 2) {
      setError("اكتب اسم المكان");
      return;
    }
    if (file.size > RAIN_MAX_BYTES || file.size < 1) {
      setError("الفيديو أكبر من ٢٤٠ ميجا. 4K العادي يمر، أما ProRes فحجمه أكبر من اللازم.");
      return;
    }
    const preview = prepRef.current;
    if (!preview) return;
    setBusy("يحضّر نسخة 720…");
    let frames: Uint8Array;
    let phone = file;
    try {
      const prepared = await sampleRain(file);
      frames = prepared.frames;
      phone = prepared.upload;
    } catch (error) {
      setBusy("");
      setError(shrinkMessage(error));
      return;
    }
    const verdict = classifyGray(frames, 160, 284, 6);
    if (!verdict.ok) {
      setBusy("");
      setError(verdict.reason);
      return;
    }
    setBusy("يرفع المقطع… 0%");
    try {
      const started = await postJson({ phase: "start", regionId: region, place: place.trim(), name: phone.name, size: phone.size });
      const uploadId = started.id;
      if (!uploadId) {
        setBusy("");
        setError(started.error || "تعذر بدء الرفع");
        return;
      }
      for (let offset = 0; offset < phone.size; offset += CHUNK) {
        setBusy(`يرفع المقطع… ${Math.min(99, Math.round((offset / phone.size) * 100))}%`);
        const bytes = new Uint8Array(await phone.slice(offset, offset + CHUNK).arrayBuffer());
        let sent = false;
        let reason = "انقطع الرفع. أعد المحاولة.";
        for (let attempt = 0; attempt < 3 && !sent; attempt += 1) {
          const data = await postChunk(uploadId, offset, bytes);
          if (!data.error) sent = true;
          else reason = data.error;
        }
        if (!sent) {
          setBusy("");
          setError(reason);
          return;
        }
      }
      setBusy("يحفظ المقطع…");
      const done = await postJson({ phase: "finish", id: uploadId, frames: toBase64(frames) });
      if (!done.clip) {
        setBusy("");
        setError(done.error || "تعذر رفع الفيديو");
        return;
      }
      setClips((current) => merge(current, [done.clip as RainClip]));
      setUpload(false);
      setPlace("");
      setBusy("");
    } catch {
      setBusy("");
      setError("انقطع الرفع. أعد المحاولة.");
    }
  };

  return (
    <div className="rain-screen">
      <header className="rain-bar">
        <strong>شورتات المطر</strong>
        <button type="button" className="icon-btn" onClick={() => { setUpload(true); setError(""); }} aria-label="رفع فيديو مطر">
          <Plus size={18} />
        </button>
      </header>
      <div className="rain-regions">
        {SA_REGIONS.map((item) => (
          <button key={item.id} type="button" className={item.id === region ? "chip on" : "chip"} onClick={() => setRegion(item.id)}>
            {item.name}
            {clips.some((clip) => clip.regionId === item.id) ? <i /> : null}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <div className="rain-empty">
          <p>ما فيه شورتات مطر في {regionName(region)} بعد</p>
          <button type="button" className="install-entry" onClick={() => setUpload(true)}>
            <span>ارفع فيديو مطر</span>
            <small>المنطقة والمكان بس، والقوة يحددها التحليل</small>
          </button>
        </div>
      ) : (
        <div className="rain-feed">
          {shown.map((clip) => (
            <article key={clip.id} className="rain-slide" data-id={clip.id}>
              <RainVideo src={clip.src} muted={muted} />
              <div className="rain-caption">
                <strong className={`rain-level ${clip.level}`}>{RAIN_LABEL[clip.level]}</strong>
                <span>{clip.place}</span>
                <p>{clip.caption}</p>
                <small>{formatClipStamp(clip.at)}</small>
              </div>
            </article>
          ))}
        </div>
      )}
      <button type="button" className="rain-sound" onClick={() => setMuted((value) => !value)} aria-label={muted ? "تشغيل الصوت" : "كتم"}>
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
      {upload && (
        <form
          className="rain-upload"
          onSubmit={(event) => {
            event.preventDefault();
            const input = event.currentTarget.elements.namedItem("video");
            const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined;
            void submit(file);
          }}
        >
          <strong>رفع فيديو مطر</strong>
          <video ref={prepRef} className="rain-prep" playsInline muted preload="auto" />
          <label>
            المنطقة
            <select value={region} onChange={(event) => setRegion(event.target.value)}>
              {SA_REGIONS.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          <label>
            المكان
            <input value={place} onChange={(event) => setPlace(event.target.value)} placeholder="اسم الحي أو الموقع" maxLength={40} required />
          </label>
          <label className="file-pick">
            فيديو المطر
            <input name="video" type="file" accept="video/mp4,video/quicktime,.mov,.mp4,.m4v,video/*" required />
          </label>
          <p className="muted">حتى لو كان المقطع 4K، تنعرض نسخة 720 واضحة وتشتغل لحاله.</p>
          {busy && <p>{busy}</p>}
          {error && <p className="rain-error">{error}</p>}
          <div className="rain-actions">
            <button type="button" onClick={() => !busy && setUpload(false)}>إلغاء</button>
            <button type="submit" disabled={Boolean(busy)}>تحليل ورفع</button>
          </div>
        </form>
      )}
    </div>
  );
}

function isIphone(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function RainVideo({ src, muted }: { src: string; muted: boolean }) {
  return isIphone() ? <IphoneVideo src={src} muted={muted} /> : <AndroidVideo src={src} muted={muted} />;
}

function applyMute(node: HTMLVideoElement | null, muted: boolean) {
  if (!node) return;
  node.muted = muted;
  node.defaultMuted = muted;
  if (muted) node.setAttribute("muted", "");
  else node.removeAttribute("muted");
}

function IphoneVideo({ src, muted }: { src: string; muted: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    applyMute(ref.current, muted);
  }, [muted]);
  return <video ref={ref} src={src} playsInline muted={muted} preload="auto" controls />;
}

function AndroidVideo({ src, muted }: { src: string; muted: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    applyMute(ref.current, muted);
  }, [muted]);
  const start = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    const node = ref.current;
    if (!node) return;
    document.querySelectorAll(".rain-slide video").forEach((other) => {
      if (other instanceof HTMLVideoElement && other !== node) other.pause();
    });
    if (!node.paused && !node.ended) return;
    node.playsInline = true;
    applyMute(node, muted);
    if (node.ended) node.currentTime = 0;
    const pending = node.play();
    void pending?.then(() => setPlaying(true)).catch(() => setPlaying(false));
  };
  return (
    <>
      <video
        ref={ref}
        src={src}
        playsInline
        muted={muted}
        preload="metadata"
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      {!playing ? (
        <button type="button" className="rain-play" onClick={start}>تشغيل</button>
      ) : null}
    </>
  );
}

function merge(base: RainClip[], extra: RainClip[]): RainClip[] {
  const map = new Map<string, RainClip>();
  for (const clip of [...base, ...extra]) map.set(clip.id, clip);
  return [...map.values()];
}
