import type { Field, FieldSample, Layer } from "./types";

type RGB = [number, number, number];

type Stop = { t: number; c: RGB };

function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function ramp(stops: Stop[], value: number): RGB {
  const first = stops[0];
  const last = stops[stops.length - 1];
  if (!first || !last) return [0, 0, 0];
  if (value <= first.t) return first.c;
  for (let i = 1; i < stops.length; i++) {
    const prev = stops[i - 1];
    const next = stops[i];
    if (!prev || !next) continue;
    if (value <= next.t) {
      const u = (value - prev.t) / (next.t - prev.t || 1);
      return mix(prev.c, next.c, u);
    }
  }
  return last.c;
}

const WIND: Stop[] = [
  { t: 0, c: [18, 42, 72] },
  { t: 8, c: [24, 110, 150] },
  { t: 18, c: [40, 210, 170] },
  { t: 32, c: [236, 196, 70] },
  { t: 50, c: [244, 120, 70] },
];

const TEMP: Stop[] = [
  { t: 6, c: [18, 52, 120] },
  { t: 14, c: [28, 130, 168] },
  { t: 22, c: [48, 186, 150] },
  { t: 30, c: [232, 176, 64] },
  { t: 36, c: [214, 96, 48] },
  { t: 44, c: [150, 32, 48] },
];

const RAIN: Stop[] = [
  { t: 0, c: [18, 48, 68] },
  { t: 0.4, c: [29, 78, 137] },
  { t: 2, c: [61, 143, 209] },
  { t: 8, c: [159, 212, 239] },
  { t: 20, c: [242, 247, 251] },
];

const CLOUD: Stop[] = [
  { t: 0, c: [16, 28, 40] },
  { t: 35, c: [90, 112, 130] },
  { t: 70, c: [168, 184, 196] },
  { t: 100, c: [232, 238, 243] },
];

const ALPHA: Record<Layer, number> = {
  wind: 0.62,
  temp: 0.78,
  clouds: 0.55,
  rain: 0.8,
  accum: 0.84,
};

export function layerScalar(layer: Layer, sample: FieldSample): number {
  if (layer === "wind") return Math.hypot(sample.u, sample.v) * 3.6;
  if (layer === "temp") return sample.temp;
  if (layer === "rain" || layer === "accum") return sample.rain;
  return sample.cloud;
}

export function colorCss(layer: Layer, value: number): string {
  const table = layer === "wind" ? WIND : layer === "temp" ? TEMP : layer === "clouds" ? CLOUD : RAIN;
  const [r, g, b] = ramp(table, value);
  let alpha = ALPHA[layer];
  if (layer === "wind") alpha = 0.18 + Math.min(0.7, value / 48);
  if (layer === "clouds") alpha = 0.08 + Math.min(0.72, value / 110);
  if (layer === "rain") alpha = value < 0.05 ? 0 : Math.min(0.9, 0.32 + value / 6);
  if (layer === "accum") alpha = value < 0.15 ? 0 : Math.min(0.9, 0.34 + value / 18);
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha})`;
}

export function particleCss(kmh: number): string {
  const [r, g, b] = ramp(WIND, kmh);
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},0.9)`;
}

export const LEGEND: Record<Layer, { label: string; stops: string[] }> = {
  wind: { label: "توقع الرياح", stops: ["0", "15", "30", "50"] },
  temp: { label: "توقع الحرارة", stops: ["10°", "20°", "30°", "40°"] },
  clouds: { label: "توقع السحب", stops: ["0", "50", "100"] },
  rain: { label: "توقع المطر مم/س", stops: ["0", "1", "5", "15"] },
  accum: { label: "مطر تراكمي مم", stops: ["0", "5", "20", "40"] },
};

export function sampleField(field: Field, lat: number, lon: number, index: number): FieldSample | null {
  const { west, east, south, north, cols, rows } = field;
  if (cols < 2 || rows < 2) return null;
  const gx = ((lon - west) / (east - west || 1)) * (cols - 1);
  const gy = ((lat - south) / (north - south || 1)) * (rows - 1);
  if (gx < -0.75 || gy < -0.75 || gx > cols - 0.25 || gy > rows - 0.25) return null;
  const cx = Math.min(cols - 1, Math.max(0, gx));
  const cy = Math.min(rows - 1, Math.max(0, gy));
  const x0 = Math.min(cols - 1, Math.max(0, Math.floor(cx)));
  const y0 = Math.min(rows - 1, Math.max(0, Math.floor(cy)));
  const x1 = Math.min(cols - 1, x0 + 1);
  const y1 = Math.min(rows - 1, y0 + 1);
  const tx = cx - x0;
  const ty = cy - y0;
  const at = (grid: number[][], x: number, y: number) => grid[y * cols + x]?.[index] ?? 0;
  const bilerp = (grid: number[][]) => {
    const a = at(grid, x0, y0) * (1 - tx) + at(grid, x1, y0) * tx;
    const b = at(grid, x0, y1) * (1 - tx) + at(grid, x1, y1) * tx;
    return a * (1 - ty) + b * ty;
  };
  return {
    temp: bilerp(field.temp),
    u: bilerp(field.u),
    v: bilerp(field.v),
    rain: bilerp(field.rain),
    cloud: bilerp(field.cloud),
    pres: bilerp(field.pres),
  };
}

export function sampleAccumRain(field: Field, lat: number, lon: number, hours: number): number | null {
  const { west, east, south, north, cols, rows, rain, span } = field;
  if (cols < 2 || rows < 2) return null;
  const gx = ((lon - west) / (east - west || 1)) * (cols - 1);
  const gy = ((lat - south) / (north - south || 1)) * (rows - 1);
  if (gx < -0.75 || gy < -0.75 || gx > cols - 0.25 || gy > rows - 0.25) return null;
  const cx = Math.min(cols - 1, Math.max(0, gx));
  const cy = Math.min(rows - 1, Math.max(0, gy));
  const x0 = Math.min(cols - 1, Math.max(0, Math.floor(cx)));
  const y0 = Math.min(rows - 1, Math.max(0, Math.floor(cy)));
  const x1 = Math.min(cols - 1, x0 + 1);
  const y1 = Math.min(rows - 1, y0 + 1);
  const tx = cx - x0;
  const ty = cy - y0;
  const sumAt = (x: number, y: number) => {
    const series = rain[y * cols + x];
    if (!series) return 0;
    let left = hours;
    let total = 0;
    for (let i = 0; i < series.length && left > 0; i++) {
      const step = span?.[i] ?? 1;
      const take = Math.min(step, left);
      total += (series[i] ?? 0) * take;
      left -= take;
    }
    return total;
  };
  const a = sumAt(x0, y0) * (1 - tx) + sumAt(x1, y0) * tx;
  const b = sumAt(x0, y1) * (1 - tx) + sumAt(x1, y1) * tx;
  return a * (1 - ty) + b * ty;
}

export const chartInk = {
  accent: "#3dceb4",
  rain: "#7eb6d6",
  muted: "#93a0ae",
  line: "#243040",
};

export function quantizeBounds(input: { s: number; w: number; n: number; e: number }) {
  const q = (value: number) => Math.round(value * 2) / 2;
  let s = q(Math.min(input.s, input.n));
  let n = q(Math.max(input.s, input.n));
  let w = q(Math.min(input.w, input.e));
  let e = q(Math.max(input.w, input.e));
  if (n - s < 1.5) {
    const c = (n + s) / 2;
    s = q(c - 1);
    n = q(c + 1);
  }
  if (e - w < 1.5) {
    const c = (e + w) / 2;
    w = q(c - 1);
    e = q(c + 1);
  }
  if (n - s > 36) {
    const c = (n + s) / 2;
    s = q(c - 18);
    n = q(c + 18);
  }
  if (e - w > 36) {
    const c = (e + w) / 2;
    w = q(c - 18);
    e = q(c + 18);
  }
  s = Math.max(-70, s);
  n = Math.min(75, n);
  w = Math.max(-179, w);
  e = Math.min(179, e);
  if (n <= s) n = s + 2;
  if (e <= w) e = w + 2;
  return { s, w, n, e };
}
