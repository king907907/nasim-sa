import { SA_REGIONS, timezoneFor } from "./cities";
import type { AlertLevel } from "./format";
import type { Field, Forecast, Hour, Place } from "./types";

const UA = "Naseem/1.0 (https://naseem.grok.me; Arabic weather)";

type CacheBox = {
  store: Map<string, { exp: number; body: string }>;
  inflight: Map<string, Promise<string>>;
};

const globalBox = globalThis as typeof globalThis & { __naseemCache?: CacheBox };

function box(): CacheBox {
  globalBox.__naseemCache ??= { store: new Map(), inflight: new Map() };
  return globalBox.__naseemCache;
}

function remember(key: string, body: string, ttlMs: number) {
  const cache = box();
  cache.store.set(key, { exp: Date.now() + ttlMs, body });
  if (cache.store.size > 40) {
    const oldest = cache.store.keys().next().value;
    if (oldest) cache.store.delete(oldest);
  }
}

async function cached(key: string, ttlMs: number, load: () => Promise<string>): Promise<string> {
  const cache = box();
  const hit = cache.store.get(key);
  if (hit && hit.exp > Date.now()) return hit.body;
  const pending = cache.inflight.get(key);
  if (pending) return pending;
  const job = load()
    .then((body) => {
      remember(key, body, ttlMs);
      return body;
    })
    .finally(() => {
      cache.inflight.delete(key);
    });
  cache.inflight.set(key, job);
  return job;
}

function coord(value: number): number {
  return Math.round(value * 10000) / 10000;
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`upstream ${response.status}`);
  return response.json();
}

type MetDetails = Record<string, number | undefined>;
type MetStep = {
  time?: string;
  data?: {
    instant?: { details?: MetDetails };
    next_1_hours?: { summary?: { symbol_code?: string }; details?: MetDetails };
    next_6_hours?: { summary?: { symbol_code?: string }; details?: MetDetails };
    next_12_hours?: { summary?: { symbol_code?: string }; details?: MetDetails };
  };
};

function asSteps(payload: unknown): { updated: string; steps: MetStep[] } {
  const root = payload as { properties?: { meta?: { updated_at?: string }; timeseries?: MetStep[] } };
  return {
    updated: root.properties?.meta?.updated_at ?? new Date().toISOString(),
    steps: root.properties?.timeseries ?? [],
  };
}

function num(value: number | undefined, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

const r1 = (value: number) => Math.round(value * 10) / 10;
const r2 = (value: number) => Math.round(value * 100) / 100;

function toHour(step: MetStep): Hour | null {
  const time = step.time;
  const details = step.data?.instant?.details;
  if (!time || !details) return null;
  const next1 = step.data?.next_1_hours;
  const next6 = step.data?.next_6_hours;
  const symbol = next1?.summary?.symbol_code || next6?.summary?.symbol_code || step.data?.next_12_hours?.summary?.symbol_code || "cloudy";
  const hourly = Boolean(next1);
  const temp = num(details.air_temperature);
  const rain = hourly ? num(next1?.details?.precipitation_amount) : num(next6?.details?.precipitation_amount);
  const tmin = hourly ? temp : num(next6?.details?.air_temperature_min, temp);
  const tmax = hourly ? temp : num(next6?.details?.air_temperature_max, temp);
  return {
    t: time,
    temp: r1(temp),
    feels: r1(num(details.apparent_air_temperature, temp)),
    rh: r1(num(details.relative_humidity)),
    wind: r1(num(details.wind_speed)),
    dir: r1(num(details.wind_from_direction)),
    pres: r1(num(details.air_pressure_at_sea_level, 1013)),
    cloud: r1(num(details.cloud_area_fraction)),
    dew: r1(num(details.dew_point_temperature, temp)),
    uv: r1(num(details.ultraviolet_index_clear_sky)),
    fog: r1(num(details.fog_area_fraction)),
    rain: r1(rain),
    span: hourly ? 1 : 6,
    symbol,
    tmin: r1(Math.min(tmin, temp)),
    tmax: r1(Math.max(tmax, temp)),
  };
}

export async function getForecast(lat: number, lon: number): Promise<Forecast> {
  const latitude = coord(lat);
  const longitude = coord(lon);
  const body = await cached(`fx:${latitude.toFixed(2)}:${longitude.toFixed(2)}`, 10 * 60 * 1000, async () => {
    const parsed = asSteps(await fetchJson(`https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${latitude}&lon=${longitude}`));
    const hours = parsed.steps.map(toHour).filter((hour): hour is Hour => hour !== null).slice(0, 80);
    if (hours.length === 0) throw new Error("empty forecast");
    return JSON.stringify({ updated: parsed.updated, lat: latitude, lon: longitude, hours } satisfies Forecast);
  });
  return JSON.parse(body) as Forecast;
}

type Cell = { temp: number; u: number; v: number; rain: number; cloud: number; pres: number };

function vectorFrom(step: MetStep): { t: string; cell: Cell } | null {
  const details = step.data?.instant?.details;
  if (!step.time || !details) return null;
  const speed = num(details.wind_speed);
  const dir = num(details.wind_from_direction) * (Math.PI / 180);
  const next1 = step.data?.next_1_hours;
  const next6 = step.data?.next_6_hours;
  const rain = next1 ? num(next1.details?.precipitation_amount) : num(next6?.details?.precipitation_amount) / 6;
  return {
    t: step.time,
    cell: {
      temp: r1(num(details.air_temperature)),
      u: r2(-Math.sin(dir) * speed),
      v: r2(-Math.cos(dir) * speed),
      rain: r2(rain),
      cloud: r1(num(details.cloud_area_fraction)),
      pres: r1(num(details.air_pressure_at_sea_level, 1013)),
    },
  };
}

async function pool<T>(items: T[], size: number, task: (item: T, index: number) => Promise<void>) {
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        await task(items[index] as T, index);
      }
    }),
  );
}

export async function getField(south: number, west: number, north: number, east: number): Promise<Field> {
  const s = coord(Math.min(south, north));
  const n = coord(Math.max(south, north));
  const w = coord(Math.min(west, east));
  const e = coord(Math.max(west, east));
  const rows = 4;
  const cols = 5;
  const body = await cached(`fd5:${s}:${w}:${n}:${e}`, 15 * 60 * 1000, async () => {
    const lats = Array.from({ length: rows }, (_, row) => s + ((n - s) * row) / 3);
    const lons = Array.from({ length: cols }, (_, col) => w + ((e - w) * col) / 4);
    const points = lats.flatMap((lat) => lons.map((lon) => ({ lat: coord(lat), lon: coord(lon) })));
    const series: (Map<string, Cell> | null)[] = points.map(() => null);
    await pool(points, 4, async (point, index) => {
      try {
        const steps = asSteps(await fetchJson(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${point.lat}&lon=${point.lon}`)).steps;
        const origin = Date.parse(steps.find((step) => step.time)?.time ?? "");
        const map = new Map<string, Cell>();
        for (const step of steps) {
          if (!step.time) continue;
          if (Number.isFinite(origin) && (Date.parse(step.time) - origin) / 3_600_000 > 78) break;
          const row = vectorFrom(step);
          if (row) map.set(step.time, row.cell);
        }
        series[index] = map;
      } catch (error) {
        console.error("[naseem] field point failed", point, error);
        series[index] = null;
      }
    });
    const master = series.find((entry) => entry && entry.size > 0);
    if (!master) throw new Error("field unavailable");
    const times = [...master.keys()];
    const span = times.map((time, index) => {
      const current = Date.parse(time);
      const next = Date.parse(times[index + 1] ?? "");
      const prev = Date.parse(times[index - 1] ?? "");
      const hours = Number.isFinite(next) ? Math.round((next - current) / 3_600_000) : Number.isFinite(prev) ? Math.round((current - prev) / 3_600_000) : 1;
      return Math.min(6, Math.max(1, hours));
    });
    const grids: (Array<Cell | null> | null)[] = series.map((entry) => (entry ? times.map((time) => entry.get(time) ?? null) : null));
    for (let pass = 0; pass < 3; pass += 1) {
      for (let i = 0; i < grids.length; i += 1) {
        if (grids[i]?.every(Boolean)) continue;
        const row = Math.floor(i / cols);
        const col = i % cols;
        const neighbors = [[1, 0], [-1, 0], [0, 1], [0, -1]]
          .map(([dr, dc]) => {
            const rr = row + (dr ?? 0);
            const cc = col + (dc ?? 0);
            if (rr < 0 || cc < 0 || rr >= rows || cc >= cols) return null;
            return grids[rr * cols + cc];
          })
          .filter((entry): entry is Array<Cell | null> => Boolean(entry));
        if (neighbors.length === 0) continue;
        grids[i] = times.map((_, timeIndex) => {
          const existing = grids[i]?.[timeIndex];
          if (existing) return existing;
          const vals = neighbors.map((neighbor) => neighbor[timeIndex]).filter((sample): sample is Cell => Boolean(sample));
          if (vals.length === 0) return null;
          const avg = (pick: (sample: Cell) => number) => r2(vals.reduce((sum, sample) => sum + pick(sample), 0) / vals.length);
          return { temp: avg((sample) => sample.temp), u: avg((sample) => sample.u), v: avg((sample) => sample.v), rain: avg((sample) => sample.rain), cloud: avg((sample) => sample.cloud), pres: avg((sample) => sample.pres) };
        });
      }
    }
    const empty: Cell = { temp: 0, u: 0, v: 0, rain: 0, cloud: 0, pres: 1013 };
    const pack = (pick: (sample: Cell) => number) => grids.map((column) => times.map((_, index) => pick(column?.[index] ?? empty)));
    const field: Field = {
      times,
      cols,
      rows,
      west: lons[0] ?? w,
      east: lons[lons.length - 1] ?? e,
      south: lats[0] ?? s,
      north: lats[lats.length - 1] ?? n,
      temp: pack((sample) => sample.temp),
      u: pack((sample) => sample.u),
      v: pack((sample) => sample.v),
      rain: pack((sample) => sample.rain),
      cloud: pack((sample) => sample.cloud),
      pres: pack((sample) => sample.pres),
      span,
    };
    return JSON.stringify(field);
  });
  return JSON.parse(body) as Field;
}

type GeoRow = { id?: number; name?: string; latitude?: number; longitude?: number; admin1?: string; country?: string; timezone?: string };
type NominatimRow = { place_id?: number; lat?: string; lon?: string; name?: string; display_name?: string; address?: { state?: string; country?: string; city?: string; town?: string; village?: string } };

function placeFromGeo(row: GeoRow): Place | null {
  if (typeof row.latitude !== "number" || typeof row.longitude !== "number" || !row.name) return null;
  return { id: `g:${row.id ?? `${row.latitude},${row.longitude}`}`, name: row.name, admin: row.admin1 ?? "", country: row.country ?? "", lat: row.latitude, lon: row.longitude, timezone: timezoneFor(row.longitude, row.timezone) };
}

export async function searchPlaces(query: string): Promise<Place[]> {
  const q = query.trim().slice(0, 60);
  if (q.length < 2) return [];
  try {
    const payload = (await fetchJson(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=ar`)) as { results?: GeoRow[] };
    const places = (payload.results ?? []).map(placeFromGeo).filter((place): place is Place => place !== null);
    if (places.length > 0) return places;
  } catch (error) {
    console.error("[naseem] geocode failed", error);
  }
  try {
    const rows = (await fetchJson(`https://nominatim.openstreetmap.org/search?format=jsonv2&accept-language=ar&limit=8&q=${encodeURIComponent(q)}`)) as NominatimRow[];
    return rows
      .map((row) => {
        const lat = Number(row.lat);
        const lon = Number(row.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
        return { id: `n:${row.place_id ?? `${lat},${lon}`}`, name: row.name || row.display_name?.split(",")[0] || q, admin: row.address?.state ?? "", country: row.address?.country ?? "", lat, lon, timezone: timezoneFor(lon) };
      })
      .filter((place): place is Place => place !== null);
  } catch (error) {
    console.error("[naseem] nominatim failed", error);
    return [];
  }
}

export async function reversePlace(lat: number, lon: number): Promise<Place> {
  const latitude = coord(lat);
  const longitude = coord(lon);
  try {
    const payload = (await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=ar&lat=${latitude}&lon=${longitude}`, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    }).then((response) => {
      if (!response.ok) throw new Error(String(response.status));
      return response.json();
    })) as NominatimRow;
    const address = payload.address;
    return {
      id: `n:${payload.place_id ?? `${latitude},${longitude}`}`,
      name: address?.city || address?.town || address?.village || payload.name || "موقع محدد",
      admin: address?.state ?? "",
      country: address?.country ?? "",
      lat: latitude,
      lon: longitude,
      timezone: timezoneFor(longitude),
    };
  } catch (error) {
    console.error("[naseem] reverse failed", error);
    return { id: `pin:${latitude},${longitude}`, name: "موقع محدد", admin: "", country: "", lat: latitude, lon: longitude, timezone: timezoneFor(longitude) };
  }
}

const NCM_TO_REGION: Record<string, string> = {
  الرياض: "SA-01",
  "مكة المكرمة": "SA-02",
  "المدينة المنورة": "SA-03",
  الشرقية: "SA-04",
  القصيم: "SA-05",
  حائل: "SA-06",
  تبوك: "SA-07",
  "الحدود الشمالية": "SA-08",
  جازان: "SA-09",
  نجران: "SA-10",
  الباحة: "SA-11",
  الجوف: "SA-12",
  عسير: "SA-14",
};

function riyadhDay(offset: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(Date.now() + offset * 86_400_000));
}

export type OfficialAlert = {
  id: string;
  regionId: string;
  region: string;
  level: AlertLevel;
  typeName: string;
  kind: string;
  places: string;
  hazards: string;
  from: string;
  to: string;
  url: string;
};

type NcmRaw = {
  id?: string | number;
  fromDate?: string;
  toDate?: string;
  alert_type?: { ar?: string; color?: string };
  alert_status?: { ar?: string };
  region?: { ar?: string };
  governorates?: { name_ar?: string }[];
  alert_hazard?: { name_ar?: string }[];
};

export async function regionAlertLevels(): Promise<{ source: string; day: string; regions: { id: string; name: string; level: AlertLevel; title: string }[]; alerts: OfficialAlert[] }> {
  const from = riyadhDay(0);
  const to = riyadhDay(3);
  const body = await cached(`ncm:${from}:${to}`, 5 * 60 * 1000, async () => JSON.stringify(await fetchJson(`https://www.ncm.gov.sa/manned-alerts?from_date=${from}&to_date=${to}&lang=ar`)));
  const payload = JSON.parse(body) as { data?: NcmRaw[] };
  const rank: Record<AlertLevel, number> = { green: 0, yellow: 1, orange: 2, red: 3 };
  const alerts: OfficialAlert[] = [];
  for (const item of payload.data ?? []) {
    const end = Date.parse(`${String(item.toDate ?? "").replace(" ", "T")}+03:00`);
    if (!Number.isFinite(end) || end < Date.now()) continue;
    const color = item.alert_type?.color;
    const level: AlertLevel = color === "red" || color === "orange" || color === "yellow" ? color : "yellow";
    const regionName = item.region?.ar ?? "";
    const key = regionName.replace(/^المنطقة\s+/, "").replace(/^منطقة\s+/, "").trim();
    const names = (item.governorates ?? []).map((place) => place.name_ar).filter((name): name is string => Boolean(name));
    const hazards = (item.alert_hazard ?? []).map((hazard) => hazard.name_ar).filter((name): name is string => Boolean(name));
    alerts.push({
      id: String(item.id ?? ""),
      regionId: NCM_TO_REGION[key] ?? "",
      region: regionName,
      level,
      typeName: item.alert_type?.ar ?? "إنذار",
      kind: item.alert_status?.ar ?? "حالة جوية",
      places: names.join(" - "),
      hazards: hazards.join("، "),
      from: String(item.fromDate ?? ""),
      to: String(item.toDate ?? ""),
      url: `https://www.ncm.gov.sa/ar/early-warning/${item.id ?? ""}`,
    });
  }
  alerts.sort((a, b) => rank[b.level] - rank[a.level]);
  const regions = SA_REGIONS.map((region) => {
    const mine = alerts.filter((alert) => alert.regionId === region.id);
    const level = mine.reduce<AlertLevel>((worst, alert) => (rank[alert.level] > rank[worst] ? alert.level : worst), "green");
    return { id: region.id, name: region.name, level, title: mine[0]?.kind ?? "" };
  });
  return { source: "ncm", day: from, regions, alerts };
}

export type RadarFrame = { time: number; url: string };

export async function radarFrames(): Promise<RadarFrame[]> {
  const body = await cached("radar-frames", 4 * 60 * 1000, async () => {
    const payload = (await fetchJson("https://api.rainviewer.com/public/weather-maps.json")) as { host?: string; radar?: { past?: { time?: number; path?: string }[] } };
    const host = payload.host;
    const frames = (payload.radar?.past ?? []).filter((frame) => host && frame.path && typeof frame.time === "number").map((frame) => ({ time: frame.time as number, url: `${host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png` }));
    return JSON.stringify(frames);
  });
  return JSON.parse(body) as RadarFrame[];
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": status === 200 ? "public, max-age=120" : "no-store" },
  });
}

export function readCoord(value: string | null, min: number, max: number): number | null {
  if (value == null) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) return null;
  return number;
}
