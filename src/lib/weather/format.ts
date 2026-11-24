import type { Hour, Place, Units } from "./types";

const WEEKDAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const EN_DAY: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export type LocalParts = {
  key: string;
  hour: number;
  minute: number;
  weekday: number;
};

export function localParts(iso: string, tz: string): LocalParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const hour = Number(get("hour"));
  return {
    key: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number.isFinite(hour) ? hour : 0,
    minute: Number(get("minute")) || 0,
    weekday: EN_DAY[get("weekday")] ?? 0,
  };
}

export function fmt(n: number, digits = 0): string {
  if (!Number.isFinite(n)) return "—";
  if (digits === 0) return String(Math.round(n));
  return n.toFixed(digits);
}

export function tempOf(celsius: number, unit: Units): number {
  if (unit === "f") return (celsius * 9) / 5 + 32;
  if (unit === "k") return celsius + 273.15;
  return celsius;
}

export function windKmh(ms: number): number {
  return ms * 3.6;
}

const DIRS = ["شمال", "شمال شرق", "شرق", "جنوب شرق", "جنوب", "جنوب غرب", "غرب", "شمال غرب"];

export function dirName(deg: number): string {
  const i = Math.round((((deg % 360) + 360) % 360) / 45) % 8;
  return DIRS[i] ?? "شمال";
}

export function windWord(kmh: number): string {
  if (kmh < 6) return "ساكنة";
  if (kmh < 20) return "خفيفة";
  if (kmh < 40) return "معتدلة";
  if (kmh < 60) return "نشطة";
  return "قوية";
}

export function formatHour(iso: string, tz: string): string {
  const { hour } = localParts(iso, tz);
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12} ${hour < 12 ? "ص" : "م"}`;
}

export function formatStamp(iso: string, tz: string): string {
  const parts = localParts(iso, tz);
  const [, monthRaw, dayRaw] = parts.key.split("-");
  const month = MONTHS[(Number(monthRaw) || 1) - 1] ?? "";
  const hour12 = parts.hour % 12 === 0 ? 12 : parts.hour % 12;
  const hh = String(hour12).padStart(2, "0");
  const mm = String(parts.minute).padStart(2, "0");
  return `${WEEKDAYS[parts.weekday]}, ${Number(dayRaw)} ${month}, ${hh}:${mm} ${parts.hour < 12 ? "ص" : "م"}`;
}

export function formatWhen(iso: string, tz: string): string {
  const parts = localParts(iso, tz);
  return `${WEEKDAYS[parts.weekday]} · ${formatHour(iso, tz)}`;
}

export function formatClock(iso: string, tz: string): string {
  const { hour, minute } = localParts(iso, tz);
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const mm = String(minute).padStart(2, "0");
  return `${h12}:${mm} ${hour < 12 ? "ص" : "م"}`;
}

function shiftKey(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, (m ?? 1) - 1, (d ?? 1) + days));
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${dt.getUTCFullYear()}-${mm}-${dd}`;
}

export function dayLabel(key: string, todayKey: string): string {
  if (key === todayKey) return "اليوم";
  if (key === shiftKey(todayKey, 1)) return "غداً";
  const [y, m, d] = key.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1)).getUTCDay();
  return WEEKDAYS[weekday] ?? key;
}

export type DaySummary = {
  key: string;
  label: string;
  min: number;
  max: number;
  rain: number;
  symbol: string;
  wind: number;
};

export function buildDays(hours: Hour[], tz: string, nowIso: string): DaySummary[] {
  const todayKey = localParts(nowIso, tz).key;
  const buckets = new Map<string, DaySummary & { scoreHour: number; bestDist: number }>();
  for (const hour of hours) {
    const parts = localParts(hour.t, tz);
    let bucket = buckets.get(parts.key);
    if (!bucket) {
      bucket = {
        key: parts.key,
        label: dayLabel(parts.key, todayKey),
        min: hour.tmin,
        max: hour.tmax,
        rain: 0,
        symbol: hour.symbol,
        wind: hour.wind,
        scoreHour: parts.hour,
        bestDist: Math.abs(parts.hour - 14),
      };
      buckets.set(parts.key, bucket);
    }
    bucket.min = Math.min(bucket.min, hour.tmin, hour.temp);
    bucket.max = Math.max(bucket.max, hour.tmax, hour.temp);
    bucket.rain += hour.rain;
    bucket.wind = Math.max(bucket.wind, hour.wind);
    const dist = Math.abs(parts.hour - 14);
    if (dist < bucket.bestDist) {
      bucket.bestDist = dist;
      bucket.symbol = hour.symbol;
      bucket.scoreHour = parts.hour;
    }
  }
  return [...buckets.values()].slice(0, 8).map(({ scoreHour: _s, bestDist: _d, ...day }) => day);
}

export function uvLabel(uv: number): string {
  if (uv < 3) return "منخفض";
  if (uv < 6) return "متوسط";
  if (uv < 8) return "مرتفع";
  if (uv < 11) return "عالٍ جداً";
  return "شديد";
}

export type AlertTone = "warn" | "danger";

export type WeatherAlert = { tone: AlertTone; title: string; detail: string };

export function buildAlerts(hour: Hour, place: Place): WeatherAlert[] {
  const out: WeatherAlert[] = [];
  const kmh = windKmh(hour.wind);
  if (hour.temp >= 45) {
    out.push({ tone: "danger", title: "حر شديد", detail: "درجة الحرارة مرتفعة جداً. قلّل التعرض للشمس." });
  } else if (hour.temp >= 40) {
    out.push({ tone: "warn", title: "حرارة مرتفعة", detail: "يُفضّل تجنب المجهود في وقت الذروة." });
  }
  if (hour.symbol.includes("thunder")) {
    out.push({ tone: "danger", title: "عواصف رعدية", detail: "احتمال برق وأمطار غزيرة خلال الفترة." });
  } else if (hour.rain >= 5) {
    out.push({ tone: "warn", title: "أمطار غزيرة", detail: "كميات مطر عالية متوقعة. انتبه للطرق." });
  } else if (hour.rain >= 1) {
    out.push({ tone: "warn", title: "أمطار", detail: "هطول متوقع خلال الفترة." });
  }
  if (kmh >= 55) out.push({ tone: "danger", title: "رياح قوية", detail: "هبات قد تؤثر على القيادة والأجسام الخفيفة." });
  else if (kmh >= 40) out.push({ tone: "warn", title: "رياح نشطة", detail: "الرياح أقوى من المعتاد." });
  if (hour.fog >= 40) out.push({ tone: "warn", title: "ضباب", detail: "تدنٍ محتمل في مدى الرؤية." });
  if (hour.uv >= 8 && hour.temp >= 28) {
    out.push({ tone: "warn", title: "أشعة مرتفعة", detail: "استخدم واقياً إذا خرجت وقت الظهيرة." });
  }
  const arabia = place.lat > 12 && place.lat < 35 && place.lon > 34 && place.lon < 60;
  if (arabia && hour.rh < 30 && hour.cloud < 45 && hour.fog < 15 && kmh >= 35 && hour.rain < 0.2) {
    out.push({
      tone: "warn",
      title: "احتمال غبار",
      detail: "رياح جافة قد تثير الغبار. هذا تقدير تقريبي وليس قياساً ميدانياً.",
    });
  }
  return out.slice(0, 3);
}

export type AlertLevel = "green" | "yellow" | "orange" | "red";

export function alertLevel(hour: Hour, place: Place): AlertLevel {
  const items = buildAlerts(hour, place);
  if (items.some((item) => item.tone === "danger")) return "red";
  if (items.some((item) => item.title === "أمطار غزيرة" || item.title === "حرارة مرتفعة")) return "orange";
  if (items.length > 0) return "yellow";
  return "green";
}

export function blurb(hour: Hour): string {
  const kmh = windKmh(hour.wind);
  const bits: string[] = [];
  if (hour.temp >= 40) bits.push("الجو حار جداً");
  else if (hour.temp >= 33) bits.push("الجو حار");
  else if (hour.temp >= 24) bits.push("الجو دافئ");
  else if (hour.temp >= 16) bits.push("الجو معتدل");
  else bits.push("الجو بارد");
  if (hour.rain >= 0.5) bits.push("مع هطول");
  else if (hour.cloud >= 70) bits.push("والسماء غائمة");
  else if (hour.cloud <= 20) bits.push("والسماء صافية");
  if (kmh >= 40) bits.push("ورياح نشطة");
  return bits.join(" ");
}

export function nearestTimeIndex(times: string[], iso: string): number {
  const target = Date.parse(iso);
  let best = 0;
  let bestDelta = Number.POSITIVE_INFINITY;
  for (let i = 0; i < times.length; i++) {
    const delta = Math.abs(Date.parse(times[i] ?? "") - target);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = i;
    }
  }
  return best;
}
