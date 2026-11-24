//#region node_modules/.nitro/vite/services/ssr/assets/met.server-4E0qbmIX.js
function timezoneFor(lon, tz) {
	if (tz) try {
		Intl.DateTimeFormat("en-US", { timeZone: tz });
		return tz;
	} catch {}
	const h = Math.max(-12, Math.min(14, Math.round(lon / 15)));
	if (h === 3) return "Asia/Riyadh";
	return `Etc/GMT${h >= 0 ? "-" : "+"}${Math.abs(h)}`;
}
function p(id, name, admin, country, lat, lon, timezone = "Asia/Riyadh") {
	return {
		id,
		name,
		admin,
		country,
		lat,
		lon,
		timezone
	};
}
var JEDDAH = p("jeddah", "جدة", "مكة المكرمة", "السعودية", 21.5433, 39.1728);
var PLACES = [
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
	p("london", "لندن", "لندن", "بريطانيا", 51.5074, -.1278, "Europe/London"),
	p("paris", "باريس", "باريس", "فرنسا", 48.8566, 2.3522, "Europe/Paris")
];
var SA_REGIONS = [
	{
		id: "SA-01",
		name: "الرياض",
		placeId: "riyadh"
	},
	{
		id: "SA-02",
		name: "مكة المكرمة",
		placeId: "makkah"
	},
	{
		id: "SA-03",
		name: "المدينة المنورة",
		placeId: "madinah"
	},
	{
		id: "SA-05",
		name: "القصيم",
		placeId: "buraidah"
	},
	{
		id: "SA-04",
		name: "الشرقية",
		placeId: "dammam"
	},
	{
		id: "SA-14",
		name: "عسير",
		placeId: "abha"
	},
	{
		id: "SA-07",
		name: "تبوك",
		placeId: "tabuk"
	},
	{
		id: "SA-06",
		name: "حائل",
		placeId: "hail"
	},
	{
		id: "SA-08",
		name: "الحدود الشمالية",
		placeId: "arar"
	},
	{
		id: "SA-09",
		name: "جازان",
		placeId: "jazan"
	},
	{
		id: "SA-10",
		name: "نجران",
		placeId: "najran"
	},
	{
		id: "SA-11",
		name: "الباحة",
		placeId: "bahah"
	},
	{
		id: "SA-12",
		name: "الجوف",
		placeId: "sakaka"
	}
];
function regionCities(name, placeId) {
	return [...PLACES.filter((place) => place.country === "السعودية" && place.admin === name)].sort((a, b) => a.id === placeId ? -1 : b.id === placeId ? 1 : a.name.localeCompare(b.name, "ar"));
}
var FEATURED = SA_REGIONS.map((region) => PLACES.find((place) => place.id === region.placeId)).filter((place) => Boolean(place));
function normName(value) {
	return value.trim().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/[ً-ْ]/g, "").toLowerCase();
}
function filterPlaces(query) {
	const q = normName(query);
	if (!q) return FEATURED;
	return PLACES.filter((place) => {
		return normName(`${place.name} ${place.admin} ${place.country}`).includes(q);
	});
}
var UA = "Naseem/1.0 (https://naseem.grok.me; Arabic weather)";
var globalBox = globalThis;
function box() {
	globalBox.__naseemCache ??= {
		store: /* @__PURE__ */ new Map(),
		inflight: /* @__PURE__ */ new Map()
	};
	return globalBox.__naseemCache;
}
function remember(key, body, ttlMs) {
	const cache = box();
	cache.store.set(key, {
		exp: Date.now() + ttlMs,
		body
	});
	if (cache.store.size > 40) {
		const oldest = cache.store.keys().next().value;
		if (oldest) cache.store.delete(oldest);
	}
}
async function cached(key, ttlMs, load) {
	const cache = box();
	const hit = cache.store.get(key);
	if (hit && hit.exp > Date.now()) return hit.body;
	const pending = cache.inflight.get(key);
	if (pending) return pending;
	const job = load().then((body) => {
		remember(key, body, ttlMs);
		return body;
	}).finally(() => {
		cache.inflight.delete(key);
	});
	cache.inflight.set(key, job);
	return job;
}
function coord(value) {
	return Math.round(value * 1e4) / 1e4;
}
async function fetchJson(url) {
	const response = await fetch(url, {
		headers: {
			"User-Agent": UA,
			Accept: "application/json"
		},
		signal: AbortSignal.timeout(12e3)
	});
	if (!response.ok) throw new Error(`upstream ${response.status}`);
	return response.json();
}
function asSteps(payload) {
	const root = payload;
	return {
		updated: root.properties?.meta?.updated_at ?? (/* @__PURE__ */ new Date()).toISOString(),
		steps: root.properties?.timeseries ?? []
	};
}
function num(value, fallback = 0) {
	return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
var r1 = (value) => Math.round(value * 10) / 10;
var r2 = (value) => Math.round(value * 100) / 100;
function toHour(step) {
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
		tmax: r1(Math.max(tmax, temp))
	};
}
async function getForecast(lat, lon) {
	const latitude = coord(lat);
	const longitude = coord(lon);
	const body = await cached(`fx:${latitude.toFixed(2)}:${longitude.toFixed(2)}`, 6e5, async () => {
		const parsed = asSteps(await fetchJson(`https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${latitude}&lon=${longitude}`));
		const hours = parsed.steps.map(toHour).filter((hour) => hour !== null).slice(0, 80);
		if (hours.length === 0) throw new Error("empty forecast");
		return JSON.stringify({
			updated: parsed.updated,
			lat: latitude,
			lon: longitude,
			hours
		});
	});
	return JSON.parse(body);
}
function vectorFrom(step) {
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
			pres: r1(num(details.air_pressure_at_sea_level, 1013))
		}
	};
}
async function pool(items, size, task) {
	let cursor = 0;
	await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
		while (cursor < items.length) {
			const index = cursor;
			cursor += 1;
			await task(items[index], index);
		}
	}));
}
async function getField(south, west, north, east) {
	const s = coord(Math.min(south, north));
	const n = coord(Math.max(south, north));
	const w = coord(Math.min(west, east));
	const e = coord(Math.max(west, east));
	const rows = 4;
	const cols = 5;
	const body = await cached(`fd5:${s}:${w}:${n}:${e}`, 9e5, async () => {
		const lats = Array.from({ length: rows }, (_, row) => s + (n - s) * row / 3);
		const lons = Array.from({ length: cols }, (_, col) => w + (e - w) * col / 4);
		const points = lats.flatMap((lat) => lons.map((lon) => ({
			lat: coord(lat),
			lon: coord(lon)
		})));
		const series = points.map(() => null);
		await pool(points, 4, async (point, index) => {
			try {
				const steps = asSteps(await fetchJson(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${point.lat}&lon=${point.lon}`)).steps;
				const origin = Date.parse(steps.find((step) => step.time)?.time ?? "");
				const map = /* @__PURE__ */ new Map();
				for (const step of steps) {
					if (!step.time) continue;
					if (Number.isFinite(origin) && (Date.parse(step.time) - origin) / 36e5 > 78) break;
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
			const hours = Number.isFinite(next) ? Math.round((next - current) / 36e5) : Number.isFinite(prev) ? Math.round((current - prev) / 36e5) : 1;
			return Math.min(6, Math.max(1, hours));
		});
		const grids = series.map((entry) => entry ? times.map((time) => entry.get(time) ?? null) : null);
		for (let pass = 0; pass < 3; pass += 1) for (let i = 0; i < grids.length; i += 1) {
			if (grids[i]?.every(Boolean)) continue;
			const row = Math.floor(i / cols);
			const col = i % cols;
			const neighbors = [
				[1, 0],
				[-1, 0],
				[0, 1],
				[0, -1]
			].map(([dr, dc]) => {
				const rr = row + (dr ?? 0);
				const cc = col + (dc ?? 0);
				if (rr < 0 || cc < 0 || rr >= rows || cc >= cols) return null;
				return grids[rr * cols + cc];
			}).filter((entry) => Boolean(entry));
			if (neighbors.length === 0) continue;
			grids[i] = times.map((_, timeIndex) => {
				const existing = grids[i]?.[timeIndex];
				if (existing) return existing;
				const vals = neighbors.map((neighbor) => neighbor[timeIndex]).filter((sample) => Boolean(sample));
				if (vals.length === 0) return null;
				const avg = (pick) => r2(vals.reduce((sum, sample) => sum + pick(sample), 0) / vals.length);
				return {
					temp: avg((sample) => sample.temp),
					u: avg((sample) => sample.u),
					v: avg((sample) => sample.v),
					rain: avg((sample) => sample.rain),
					cloud: avg((sample) => sample.cloud),
					pres: avg((sample) => sample.pres)
				};
			});
		}
		const empty = {
			temp: 0,
			u: 0,
			v: 0,
			rain: 0,
			cloud: 0,
			pres: 1013
		};
		const pack = (pick) => grids.map((column) => times.map((_, index) => pick(column?.[index] ?? empty)));
		const field = {
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
			span
		};
		return JSON.stringify(field);
	});
	return JSON.parse(body);
}
function placeFromGeo(row) {
	if (typeof row.latitude !== "number" || typeof row.longitude !== "number" || !row.name) return null;
	return {
		id: `g:${row.id ?? `${row.latitude},${row.longitude}`}`,
		name: row.name,
		admin: row.admin1 ?? "",
		country: row.country ?? "",
		lat: row.latitude,
		lon: row.longitude,
		timezone: timezoneFor(row.longitude, row.timezone)
	};
}
async function searchPlaces(query) {
	const q = query.trim().slice(0, 60);
	if (q.length < 2) return [];
	try {
		const places = ((await fetchJson(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=ar`)).results ?? []).map(placeFromGeo).filter((place) => place !== null);
		if (places.length > 0) return places;
	} catch (error) {
		console.error("[naseem] geocode failed", error);
	}
	try {
		return (await fetchJson(`https://nominatim.openstreetmap.org/search?format=jsonv2&accept-language=ar&limit=8&q=${encodeURIComponent(q)}`)).map((row) => {
			const lat = Number(row.lat);
			const lon = Number(row.lon);
			if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
			return {
				id: `n:${row.place_id ?? `${lat},${lon}`}`,
				name: row.name || row.display_name?.split(",")[0] || q,
				admin: row.address?.state ?? "",
				country: row.address?.country ?? "",
				lat,
				lon,
				timezone: timezoneFor(lon)
			};
		}).filter((place) => place !== null);
	} catch (error) {
		console.error("[naseem] nominatim failed", error);
		return [];
	}
}
async function reversePlace(lat, lon) {
	const latitude = coord(lat);
	const longitude = coord(lon);
	try {
		const payload = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=ar&lat=${latitude}&lon=${longitude}`, {
			headers: {
				"User-Agent": UA,
				Accept: "application/json"
			},
			signal: AbortSignal.timeout(8e3)
		}).then((response) => {
			if (!response.ok) throw new Error(String(response.status));
			return response.json();
		});
		const address = payload.address;
		return {
			id: `n:${payload.place_id ?? `${latitude},${longitude}`}`,
			name: address?.city || address?.town || address?.village || payload.name || "موقع محدد",
			admin: address?.state ?? "",
			country: address?.country ?? "",
			lat: latitude,
			lon: longitude,
			timezone: timezoneFor(longitude)
		};
	} catch (error) {
		console.error("[naseem] reverse failed", error);
		return {
			id: `pin:${latitude},${longitude}`,
			name: "موقع محدد",
			admin: "",
			country: "",
			lat: latitude,
			lon: longitude,
			timezone: timezoneFor(longitude)
		};
	}
}
var NCM_TO_REGION = {
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
	عسير: "SA-14"
};
function riyadhDay(offset) {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Riyadh",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).format(new Date(Date.now() + offset * 864e5));
}
async function regionAlertLevels() {
	const from = riyadhDay(0);
	const to = riyadhDay(3);
	const body = await cached(`ncm:${from}:${to}`, 3e5, async () => JSON.stringify(await fetchJson(`https://www.ncm.gov.sa/manned-alerts?from_date=${from}&to_date=${to}&lang=ar`)));
	const payload = JSON.parse(body);
	const rank = {
		green: 0,
		yellow: 1,
		orange: 2,
		red: 3
	};
	const alerts = [];
	for (const item of payload.data ?? []) {
		const end = Date.parse(`${String(item.toDate ?? "").replace(" ", "T")}+03:00`);
		if (!Number.isFinite(end) || end < Date.now()) continue;
		const color = item.alert_type?.color;
		const level = color === "red" || color === "orange" || color === "yellow" ? color : "yellow";
		const regionName = item.region?.ar ?? "";
		const key = regionName.replace(/^المنطقة\s+/, "").replace(/^منطقة\s+/, "").trim();
		const names = (item.governorates ?? []).map((place) => place.name_ar).filter((name) => Boolean(name));
		const hazards = (item.alert_hazard ?? []).map((hazard) => hazard.name_ar).filter((name) => Boolean(name));
		alerts.push({
			id: String(item.id ?? ""),
			regionId: NCM_TO_REGION[key] ?? "",
			region: regionName,
			level,
			kind: item.alert_status?.ar ?? item.alert_type?.ar ?? "إنذار",
			places: names.length > 4 ? `${names.slice(0, 3).join("، ")} +${names.length - 3}` : names.join("، "),
			hazards: hazards.slice(0, 3).join("، "),
			from: String(item.fromDate ?? ""),
			to: String(item.toDate ?? ""),
			url: `https://www.ncm.gov.sa/ar/early-warning/${item.id ?? ""}`
		});
	}
	alerts.sort((a, b) => rank[b.level] - rank[a.level]);
	return {
		source: "ncm",
		regions: SA_REGIONS.map((region) => {
			const mine = alerts.filter((alert) => alert.regionId === region.id);
			const level = mine.reduce((worst, alert) => rank[alert.level] > rank[worst] ? alert.level : worst, "green");
			return {
				id: region.id,
				name: region.name,
				level,
				title: mine[0]?.kind ?? ""
			};
		}),
		alerts
	};
}
async function radarFrames() {
	const body = await cached("radar-frames", 24e4, async () => {
		const payload = await fetchJson("https://api.rainviewer.com/public/weather-maps.json");
		const host = payload.host;
		const frames = (payload.radar?.past ?? []).filter((frame) => host && frame.path && typeof frame.time === "number").map((frame) => ({
			time: frame.time,
			url: `${host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`
		}));
		return JSON.stringify(frames);
	});
	return JSON.parse(body);
}
function jsonResponse(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": status === 200 ? "public, max-age=120" : "no-store"
		}
	});
}
function readCoord(value, min, max) {
	if (value == null) return null;
	const number = Number(value);
	if (!Number.isFinite(number) || number < min || number > max) return null;
	return number;
}
//#endregion
export { filterPlaces as a, jsonResponse as c, regionAlertLevels as d, regionCities as f, SA_REGIONS as i, radarFrames as l, searchPlaces as m, JEDDAH as n, getField as o, reversePlace as p, PLACES as r, getForecast as s, FEATURED as t, readCoord as u };
