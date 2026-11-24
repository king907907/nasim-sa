export type RainLevel = "light" | "moderate" | "heavy" | "extreme";

export const RAIN_LABEL: Record<RainLevel, string> = {
  light: "أمطار خفيفة",
  moderate: "أمطار متوسطة",
  heavy: "أمطار غزيرة",
  extreme: "أمطار غزيرة جداً",
};

export type SeedClip = {
  id: string;
  regionId: string;
  place: string;
  level: RainLevel;
  src: string;
  caption: string;
  at: string;
};

export const SEED_CLIPS: SeedClip[] = [];

export function describeRain(level: RainLevel, place: string, region: string): string {
  const where = `${place} في ${region}`;
  if (level === "extreme") return `أمطار غزيرة جداً على ${where}. الهطول كثيف، والمياه ظاهرة على الأرض.`;
  if (level === "heavy") return `أمطار غزيرة على ${where}. المطر قوي والسطوح مبتلة.`;
  if (level === "moderate") return `أمطار متوسطة على ${where}. الهطول مستمر وواضح.`;
  return `أمطار خفيفة على ${where}. زخات خفيفة مرت على المكان.`;
}

export function formatClipStamp(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "";
  const day = new Intl.DateTimeFormat("ar-u-ca-gregory-nu-latn", {
    timeZone: "Asia/Riyadh",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
  return `${day} · ${time}`;
}

const LEVELS: RainLevel[] = ["light", "moderate", "heavy", "extreme"];

export function isRainLevel(value: string): value is RainLevel {
  return LEVELS.includes(value as RainLevel);
}

export type RainVerdict = { ok: true; level: RainLevel; score: number } | { ok: false; reason: string };

/** Gray frames, tightly packed, row-major. Used by the upload check. */
export function classifyGray(packed: Uint8Array, width: number, height: number, count: number): RainVerdict {
  const frame = width * height;
  if (count < 3 || packed.length < frame * count) {
    return { ok: false, reason: "الفيديو قصير وما يبيّن مطراً" };
  }
  const details: number[] = [];
  for (let n = 0; n < count - 1; n += 1) {
    const a = n * frame;
    const b = (n + 1) * frame;
    if (meanAbs(packed, a, b, width, height, 2) > 36) continue;
    const ba = blur(packed, a, width, height);
    const bb = blur(packed, b, width, height);
    const [dx, dy] = bestShift(ba, bb, width, height);
    const structure = shiftedMean(ba, 0, bb, 0, width, height, dx, dy);
    const detail = detailShift(packed, a, b, ba, bb, width, height, dx, dy);
    if (structure > 6.5) continue;
    if (detail >= 2.15 && detail > structure * 1.05) details.push(detail);
  }
  if (details.length >= 2) {
    const detail = avg(details);
    const peak = Math.max(...details);
    let level: RainLevel = "light";
    if (detail >= 3.7 && peak >= 4.6) level = "extreme";
    else if (detail >= 3) level = "heavy";
    else if (detail >= 2.45) level = "moderate";
    return { ok: true, level, score: detail };
  }
  const drops = glassDrops(packed, width, height, count);
  const strong = drops.filter((value) => value >= 22).length;
  if (strong >= Math.min(4, count - 1)) {
    const amount = avg(drops);
    const level: RainLevel = amount >= 120 ? "extreme" : amount >= 36 ? "heavy" : "moderate";
    return { ok: true, level, score: amount };
  }
  return { ok: false, reason: "الفيديو لا يظهر مطراً أو حالة جوية" };
}

function glassDrops(src: Uint8Array, width: number, height: number, count: number): number[] {
  const frame = width * height;
  const y0 = Math.floor(height * 0.22);
  const y1 = Math.floor(height * 0.78);
  const counts: number[] = [];
  for (let n = 0; n < count; n += 1) {
    const offset = n * frame;
    let drops = 0;
    for (let y = y0; y < y1; y += 2) {
      for (let x = 6; x < width - 6; x += 2) {
        const i = offset + y * width + x;
        const center = src[i] ?? 0;
        let sum = 0;
        let darker = 0;
        let samples = 0;
        for (let dy = -2; dy <= 2; dy += 1) {
          for (let dx = -2; dx <= 2; dx += 1) {
            if (!dx && !dy) continue;
            const value = src[i + dy * width + dx] ?? 0;
            sum += value;
            samples += 1;
            if (center + 3 < value) darker += 1;
          }
        }
        const contrast = sum / samples - center;
        const edge = Math.abs((src[i + 4] ?? 0) - (src[i - 4] ?? 0)) + Math.abs((src[i + 4 * width] ?? 0) - (src[i - 4 * width] ?? 0));
        if (contrast > 4 && contrast < 26 && darker > 14 && edge < 36) drops += 1;
      }
    }
    counts.push(drops);
  }
  return counts;
}

function avg(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function meanAbs(data: Uint8Array, a: number, b: number, width: number, height: number, step: number): number {
  let sum = 0;
  let n = 0;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = y * width + x;
      sum += Math.abs((data[a + i] ?? 0) - (data[b + i] ?? 0));
      n += 1;
    }
  }
  return n ? sum / n : 0;
}

function blur(data: Uint8Array, offset: number, width: number, height: number): Float32Array {
  const out = new Float32Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let sum = 0;
      for (let dy = -2; dy <= 2; dy += 1) {
        const yy = Math.min(height - 1, Math.max(0, y + dy));
        for (let dx = -2; dx <= 2; dx += 1) {
          const xx = Math.min(width - 1, Math.max(0, x + dx));
          sum += data[offset + yy * width + xx] ?? 0;
        }
      }
      out[y * width + x] = sum / 25;
    }
  }
  return out;
}

function bestShift(a: Float32Array, b: Float32Array, width: number, height: number): [number, number] {
  let best = 1e9;
  let pick: [number, number] = [0, 0];
  const score = (dx: number, dy: number, step: number) => {
    let sum = 0;
    let n = 0;
    const y0 = Math.max(0, -dy);
    const y1 = Math.min(height, height - dy);
    const x0 = Math.max(0, -dx);
    const x1 = Math.min(width, width - dx);
    for (let y = y0; y < y1; y += step) {
      for (let x = x0; x < x1; x += step) {
        sum += Math.abs((a[y * width + x] ?? 0) - (b[(y + dy) * width + (x + dx)] ?? 0));
        n += 1;
      }
    }
    return n ? sum / n : 1e9;
  };
  for (let dy = -10; dy <= 10; dy += 2) {
    for (let dx = -10; dx <= 10; dx += 2) {
      const value = score(dx, dy, 2);
      if (value < best) {
        best = value;
        pick = [dx, dy];
      }
    }
  }
  const [cx, cy] = pick;
  for (let dy = cy - 1; dy <= cy + 1; dy += 1) {
    for (let dx = cx - 1; dx <= cx + 1; dx += 1) {
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) continue;
      const value = score(dx, dy, 1);
      if (value < best) {
        best = value;
        pick = [dx, dy];
      }
    }
  }
  return pick;
}

function shiftedMean(a: Float32Array, ao: number, b: Float32Array, bo: number, width: number, height: number, dx: number, dy: number): number {
  let sum = 0;
  let n = 0;
  const y0 = Math.max(0, -dy);
  const y1 = Math.min(height, height - dy);
  const x0 = Math.max(0, -dx);
  const x1 = Math.min(width, width - dx);
  for (let y = y0; y < y1; y += 2) {
    for (let x = x0; x < x1; x += 2) {
      sum += Math.abs((a[ao + y * width + x] ?? 0) - (b[bo + (y + dy) * width + (x + dx)] ?? 0));
      n += 1;
    }
  }
  return n ? sum / n : 0;
}

function detailShift(src: Uint8Array, a: number, b: number, ba: Float32Array, bb: Float32Array, width: number, height: number, dx: number, dy: number): number {
  let sum = 0;
  let n = 0;
  const y0 = Math.max(0, -dy);
  const y1 = Math.min(height, height - dy);
  const x0 = Math.max(0, -dx);
  const x1 = Math.min(width, width - dx);
  for (let y = y0; y < y1; y += 2) {
    for (let x = x0; x < x1; x += 2) {
      const i = y * width + x;
      const j = (y + dy) * width + (x + dx);
      const da = (src[a + i] ?? 0) - (ba[i] ?? 0);
      const db = (src[b + j] ?? 0) - (bb[j] ?? 0);
      sum += Math.abs(da - db);
      n += 1;
    }
  }
  return n ? sum / n : 0;
}

export const RAIN_MAX_BYTES = 240 * 1024 * 1024;

export async function sampleVideo(file: File): Promise<{ gray: Uint8Array; width: number; height: number; count: number; duration: number }> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
  video.setAttribute("muted", "");
  video.preload = "auto";
  video.style.cssText = "position:fixed;left:-2400px;top:0;width:360px;height:640px;opacity:1;pointer-events:none";
  const source = document.createElement("source");
  const name = file.name.toLowerCase();
  source.type = file.type.startsWith("video/") ? file.type : name.endsWith(".mov") || name.endsWith(".qt") ? "video/quicktime" : "video/mp4";
  source.src = url;
  video.appendChild(source);
  document.body.appendChild(video);
  try {
    await waitMedia(video, "loadedmetadata", 15000);
    let duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) {
      await waitMedia(video, "durationchange", 6000).catch(() => undefined);
      duration = video.duration;
    }
    if (!Number.isFinite(duration) || duration <= 0) duration = await durationFromPlay(video);
    if (duration < 1.2) throw new Error("الفيديو قصير جداً");
    if (duration > 45) throw new Error("الشورت لازم يكون أقل من ٤٥ ثانية");
    const gray = await grabFrames(video, duration);
    return { gray, width: 160, height: 284, count: 6, duration };
  } finally {
    video.pause();
    video.removeAttribute("src");
    video.querySelectorAll("source").forEach((node) => node.remove());
    video.load();
    video.remove();
    URL.revokeObjectURL(url);
  }
}

function waitMedia(video: HTMLVideoElement, event: string, timeout: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("تعذر قراءة فيديو MOV"));
    }, timeout);
    const done = () => {
      cleanup();
      resolve();
    };
    const fail = () => {
      cleanup();
      reject(new Error("الآيفون ما فتح هذا الملف. استخدم فيديو الكاميرا العادي بصيغة MOV أو MP4، مو ProRes."));
    };
    const cleanup = () => {
      window.clearTimeout(timer);
      video.removeEventListener(event, done);
      video.removeEventListener("error", fail);
    };
    video.addEventListener(event, done);
    video.addEventListener("error", fail);
    if (event === "loadedmetadata" && video.readyState >= 1) done();
  });
}

function durationFromPlay(video: HTMLVideoElement): Promise<number> {
  return new Promise((resolve, reject) => {
    const stop = window.setTimeout(() => {
      cleanup();
      reject(new Error("تعذر قراءة مدة الفيديو"));
    }, 8000);
    const check = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        cleanup();
        video.pause();
        resolve(video.duration);
      }
    };
    const cleanup = () => {
      window.clearTimeout(stop);
      video.removeEventListener("durationchange", check);
      video.removeEventListener("timeupdate", check);
    };
    video.addEventListener("durationchange", check);
    video.addEventListener("timeupdate", check);
    void video.play().catch(() => {
      cleanup();
      reject(new Error("تعذر تشغيل فيديو MOV"));
    });
  });
}

async function grabFrames(video: HTMLVideoElement, duration: number): Promise<Uint8Array> {
  const width = 160;
  const height = 284;
  const count = 6;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("تعذر تحليل الفيديو");
  const gray = new Uint8Array(width * height * count);
  const paint = (index: number) => {
    if (!video.videoWidth) return false;
    ctx.drawImage(video, 0, 0, width, height);
    const pixels = ctx.getImageData(0, 0, width, height).data;
    const base = index * width * height;
    for (let pixel = 0, cell = 0; pixel < pixels.length; pixel += 4, cell += 1) {
      gray[base + cell] = Math.round(((pixels[pixel] ?? 0) + (pixels[pixel + 1] ?? 0) + (pixels[pixel + 2] ?? 0)) / 3);
    }
    return true;
  };

  let played = false;
  try {
    await video.play();
    played = true;
  } catch {
    played = false;
  }

  if (played) {
    const targets = Array.from({ length: count }, (_, index) => (duration * (index + 0.5)) / count);
    let next = 0;
    await new Promise<void>((resolve) => {
      const stop = window.setTimeout(resolve, Math.min(22000, (duration + 3) * 1000));
      const step = () => {
        if (next < count && video.currentTime + 0.06 >= (targets[next] ?? 0) && paint(next)) next += 1;
        if (next >= count || video.ended) {
          window.clearTimeout(stop);
          resolve();
          return;
        }
        const frame = video.requestVideoFrameCallback?.bind(video);
        if (frame) frame(() => step());
        else requestAnimationFrame(step);
      };
      step();
    });
    video.pause();
    if (next >= 3) {
      const frameBytes = width * height;
      for (let index = next; index < count; index += 1) gray.copyWithin(index * frameBytes, (next - 1) * frameBytes, next * frameBytes);
      return gray;
    }
  }

  for (let index = 0; index < count; index += 1) {
    await seekTo(video, (duration * (index + 0.5)) / count);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    if (!paint(index) && index === 0) throw new Error("ما قدر يقرأ فيديو 4K. استخدم MOV أو MP4 من الكاميرا، مو ProRes.");
  }
  return gray;
}

function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  const duration = video.duration;
  const target = Number.isFinite(duration) ? Math.min(Math.max(0, time), Math.max(0, duration - 0.05)) : Math.max(0, time);
  if (!Number.isFinite(target)) return Promise.reject(new Error("تعذر قراءة مدة الفيديو"));
  if (Math.abs(video.currentTime - target) < 0.08 && video.readyState >= 2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const done = () => {
      window.clearTimeout(timer);
      video.removeEventListener("seeked", done);
      resolve();
    };
    const timer = window.setTimeout(done, 2500);
    video.addEventListener("seeked", done);
    try {
      video.currentTime = target;
    } catch {
      window.clearTimeout(timer);
      video.removeEventListener("seeked", done);
      reject(new Error("تعذر قراءة فيديو MOV"));
    }
  });
}
