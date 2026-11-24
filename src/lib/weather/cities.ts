import type { Place } from "./types";

export function timezoneFor(lon: number, tz?: string): string {
  if (tz) {
    try {
      Intl.DateTimeFormat("en-US", { timeZone: tz });
      return tz;
    } catch {
      /* fall through */
    }
  }
  const h = Math.max(-12, Math.min(14, Math.round(lon / 15)));
  if (h === 3) return "Asia/Riyadh";
  const sign = h >= 0 ? "-" : "+";
  return `Etc/GMT${sign}${Math.abs(h)}`;
}

function p(
  id: string,
  name: string,
  admin: string,
  country: string,
  lat: number,
  lon: number,
  timezone = "Asia/Riyadh",
): Place {
  return { id, name, admin, country, lat, lon, timezone };
}

export const JEDDAH = p("jeddah", "جدة", "مكة المكرمة", "السعودية", 21.5433, 39.1728);

export const PLACES: Place[] = [
  JEDDAH,
  p("riyadh", "الرياض", "الرياض", "السعودية", 24.7136, 46.6753),
  p("makkah", "مكة المكرمة", "مكة المكرمة", "السعودية", 21.3891, 39.8579),
  p("madinah", "المدينة المنورة", "المدينة المنورة", "السعودية", 24.5247, 39.5692),
  p("dammam", "الدمام", "الشرقية", "السعودية", 26.4207, 50.0888),
  p("khobar", "الخبر", "الشرقية", "السعودية", 26.2172, 50.1971),
  p("taif", "الطائف", "مكة المكرمة", "السعودية", 21.2703, 40.4158),
  p("abha", "أبها", "عسير", "السعودية", 18.2164, 42.5053),
  p("khamis", "خميس مشيط", "عسير", "السعودية", 18.3, 42.7333),
  p("jazan", "جازان", "جازان", "السعودية", 16.8892, 42.5511),
  p("tabuk", "تبوك", "تبوك", "السعودية", 28.3838, 36.555),
  p("hail", "حائل", "حائل", "السعودية", 27.5114, 41.7208),
  p("buraidah", "بريدة", "القصيم", "السعودية", 26.326, 43.975),
  p("najran", "نجران", "نجران", "السعودية", 17.4924, 44.1277),
  p("arar", "عرعر", "الحدود الشمالية", "السعودية", 30.9753, 41.0381),
  p("sakaka", "سكاكا", "الجوف", "السعودية", 29.9697, 40.2064),
  p("yanbu", "ينبع", "المدينة المنورة", "السعودية", 24.0895, 38.0618),
  p("alula", "العلا", "المدينة المنورة", "السعودية", 26.6085, 37.9232),
  p("jubail", "الجبيل", "الشرقية", "السعودية", 27.0046, 49.6225),
  p("ahsa", "الأحساء", "الشرقية", "السعودية", 25.383, 49.586),
  p("qatif", "القطيف", "الشرقية", "السعودية", 26.5654, 49.9962),
  p("bahah", "الباحة", "الباحة", "السعودية", 20.0129, 41.4677),
  p("dubai", "دبي", "دبي", "الإمارات", 25.2048, 55.2708, "Asia/Dubai"),
  p("doha", "الدوحة", "الدوحة", "قطر", 25.2854, 51.531, "Asia/Qatar"),
  p("kuwait", "الكويت", "العاصمة", "الكويت", 29.3759, 47.9774, "Asia/Kuwait"),
  p("manama", "المنامة", "العاصمة", "البحرين", 26.2235, 50.5876, "Asia/Bahrain"),
  p("muscat", "مسقط", "مسقط", "عُمان", 23.588, 58.3829, "Asia/Muscat"),
  p("cairo", "القاهرة", "القاهرة", "مصر", 30.0444, 31.2357, "Africa/Cairo"),
  p("amman", "عمّان", "عمّان", "الأردن", 31.9454, 35.9284, "Asia/Amman"),
  p("istanbul", "إسطنبول", "إسطنبول", "تركيا", 41.0082, 28.9784, "Europe/Istanbul"),
  p("london", "لندن", "لندن", "بريطانيا", 51.5074, -0.1278, "Europe/London"),
  p("paris", "باريس", "باريس", "فرنسا", 48.8566, 2.3522, "Europe/Paris"),
];

export const SA_REGIONS: { id: string; name: string; placeId: string }[] = [
  { id: "SA-01", name: "الرياض", placeId: "riyadh" },
  { id: "SA-02", name: "مكة المكرمة", placeId: "makkah" },
  { id: "SA-03", name: "المدينة المنورة", placeId: "madinah" },
  { id: "SA-05", name: "القصيم", placeId: "buraidah" },
  { id: "SA-04", name: "الشرقية", placeId: "dammam" },
  { id: "SA-14", name: "عسير", placeId: "abha" },
  { id: "SA-07", name: "تبوك", placeId: "tabuk" },
  { id: "SA-06", name: "حائل", placeId: "hail" },
  { id: "SA-08", name: "الحدود الشمالية", placeId: "arar" },
  { id: "SA-09", name: "جازان", placeId: "jazan" },
  { id: "SA-10", name: "نجران", placeId: "najran" },
  { id: "SA-11", name: "الباحة", placeId: "bahah" },
  { id: "SA-12", name: "الجوف", placeId: "sakaka" },
];

export function regionCities(name: string, placeId: string): Place[] {
  const list = PLACES.filter((place) => place.country === "السعودية" && place.admin === name);
  return [...list].sort((a, b) => (a.id === placeId ? -1 : b.id === placeId ? 1 : a.name.localeCompare(b.name, "ar")));
}

export const FEATURED = SA_REGIONS.map((region) => PLACES.find((place) => place.id === region.placeId)).filter((place): place is Place => Boolean(place));

export function normName(value: string): string {
  return value
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ً-ْ]/g, "")
    .toLowerCase();
}

export function filterPlaces(query: string): Place[] {
  const q = normName(query);
  if (!q) return FEATURED;
  return PLACES.filter((place) => {
    const blob = normName(`${place.name} ${place.admin} ${place.country}`);
    return blob.includes(q);
  });
}
