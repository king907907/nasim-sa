import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { appendFile, mkdtemp, open, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { classifyGray, type RainVerdict } from "@/lib/weather/rain";

const WIDTH = 160;
const HEIGHT = 284;
const COUNT = 6;

function ffmpegBin(): string {
  if (existsSync("/usr/local/bin/ffmpeg")) return "/usr/local/bin/ffmpeg";
  if (existsSync("/usr/bin/ffmpeg")) return "/usr/bin/ffmpeg";
  return "ffmpeg";
}

async function note(line: string): Promise<void> {
  await appendFile(join(tmpdir(), "naseem-rain.log"), `${new Date().toISOString()} ${line}\n`).catch(() => undefined);
}

const PHONE_SCALE = "scale=1280:1280:force_original_aspect_ratio=decrease:flags=lanczos,scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p";

export function isH264(bytes: Uint8Array): boolean {
  const end = bytes.byteLength;
  const head = Buffer.from(bytes.subarray(0, Math.min(end, 2_000_000))).toString("latin1");
  const tail = Buffer.from(bytes.subarray(Math.max(0, end - 2_000_000))).toString("latin1");
  const text = head + tail;
  if (text.includes("hvc1") || text.includes("hev1") || text.includes("hvcC")) return false;
  return text.includes("avc1") || text.includes("avc3") || text.includes("avcC");
}

export async function ensurePhoneMp4(bytes: Uint8Array): Promise<Uint8Array> {
  if (isH264(bytes)) return bytes;
  const dir = await mkdtemp(join(tmpdir(), "naseem-fix-"));
  try {
    const input = join(dir, "in.bin");
    const output = join(dir, "out.mp4");
    await writeFile(input, bytes);
    await toPhoneMp4(input, output);
    return new Uint8Array(await readFile(output));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

export async function toPhoneMp4(input: string, output: string): Promise<void> {
  const video = [
    "-vf",
    PHONE_SCALE,
    "-fps_mode",
    "cfr",
    "-r",
    "30",
    "-c:v",
    "libx264",
    "-profile:v",
    "main",
    "-level",
    "4.0",
    "-pix_fmt",
    "yuv420p",
    "-preset",
    "veryfast",
    "-crf",
    "20",
    "-g",
    "30",
    "-movflags",
    "+faststart",
    output,
  ];
  const base = ["-y", "-i", input, "-map", "0:v:0"];
  try {
    await ffmpeg([...base, "-map", "0:a:0?", "-c:a", "aac", "-b:a", "96k", "-ac", "2", ...video], 180000);
  } catch (error) {
    await note(`audio ${error instanceof Error ? error.message.slice(0, 240) : "fail"}`);
    await ffmpeg([...base, "-an", ...video], 180000);
  }
}

export async function prepareClip(input: string, output: string): Promise<RainVerdict> {
  const dir = await mkdtemp(join(tmpdir(), "naseem-frames-"));
  const grayPath = join(dir, "frames.gray");
  try {
    const header = await readHeader(input);
    const info = await stat(input);
    await note(`header=${header.hex} tag=${header.tag} bytes=${info.size}`);
    if (!header.movie) return { ok: false, reason: "الملف وصل ناقصاً. أعد الرفع وخلّ الشاشة مفتوحة حتى يكتمل." };
    const duration = await probeDuration(input);
    if (!Number.isFinite(duration) || duration < 1.2) return { ok: false, reason: "الفيديو قصير جداً أو ما انقرأ" };
    if (duration > 45) return { ok: false, reason: "الشورت لازم يكون أقل من ٤٥ ثانية" };
    const fps = (COUNT / Math.min(duration, 45)).toFixed(5);
    const grayFilter = `fps=${fps},scale=${WIDTH}:${HEIGHT}:flags=fast_bilinear,format=gray`;
    await ffmpeg(["-y", "-i", input, "-map", "0:v:0", "-vf", grayFilter, "-frames:v", String(COUNT), "-f", "rawvideo", "-pix_fmt", "gray", grayPath], 120000);
    const gray = new Uint8Array(await readFile(grayPath));
    const frame = WIDTH * HEIGHT;
    if (gray.length < frame * 3) return { ok: false, reason: "تعذر قراءة صورة المطر من الفيديو" };
    const packed = new Uint8Array(frame * COUNT);
    const got = Math.min(COUNT, Math.floor(gray.length / frame));
    packed.set(gray.subarray(0, got * frame));
    for (let index = got; index < COUNT; index += 1) packed.set(packed.subarray((got - 1) * frame, got * frame), index * frame);
    const verdict = classifyGray(packed, WIDTH, HEIGHT, COUNT);
    if (!verdict.ok) return verdict;
    await toPhoneMp4(input, output);
    return verdict;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await note(`prepare ${message.slice(0, 500)}`);
    console.error("[naseem] rain prepare", message);
    return { ok: false, reason: "ما قدر يحلّل المقطع. أعد الرفع وخلّ الشاشة مفتوحة، وMOV من كاميرا الآيفون يشتغل." };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function readHeader(input: string): Promise<{ hex: string; tag: string; movie: boolean }> {
  const handle = await open(input, "r");
  try {
    const head = Buffer.alloc(64);
    const { bytesRead } = await handle.read(head, 0, 64, 0);
    const slice = head.subarray(0, bytesRead);
    const tag = slice.length >= 8 ? slice.subarray(4, 8).toString("latin1") : "";
    const text = slice.toString("latin1");
    return { hex: slice.toString("hex"), tag, movie: text.includes("ftyp") || text.includes("moov") || text.includes("mdat") };
  } finally {
    await handle.close();
  }
}

function probeDuration(input: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegBin(), ["-hide_banner", "-probesize", "50M", "-analyzeduration", "50M", "-i", input], { stdio: ["ignore", "ignore", "pipe"] });
    let text = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("probe-timeout"));
    }, 45000);
    child.stderr.on("data", (chunk: Buffer) => {
      text += chunk.toString();
      if (text.length > 30000) text = text.slice(-30000);
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", () => {
      clearTimeout(timer);
      const match = text.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/i) ?? text.match(/DURATION\s*:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/i);
      if (!match) reject(new Error(`duration ${text.slice(-300).replace(/\s+/g, " ")}`));
      else resolve(Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]));
    });
  });
}

function ffmpeg(args: string[], timeoutMs = 60000): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegBin(), ["-hide_banner", "-loglevel", "error", ...args], { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("ffmpeg timeout"));
    }, timeoutMs);
    child.stderr.on("data", (chunk: Buffer) => {
      err += chunk.toString();
      if (err.length > 4000) err = err.slice(-4000);
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(err.trim() || `ffmpeg ${code}`));
    });
  });
}
