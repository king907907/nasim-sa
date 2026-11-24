import { o as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { a as filterPlaces, f as regionCities, i as SA_REGIONS, n as JEDDAH, r as PLACES, t as FEATURED } from "./met.server-4E0qbmIX.mjs";
import { A as CloudRain, C as Info, D as Cloud, E as Download, F as Check, I as Bell, L as ArrowUp, M as CloudLightning, N as CloudFog, O as CloudSun, P as ChevronLeft, R as ArrowRight, S as LocateFixed, T as Globe, _ as Pause, a as Sunset, b as Map$1, c as SunMedium, d as Share, f as Settings, g as Play, h as Plus, i as Thermometer, j as CloudMoon, k as CloudSnow, l as Star, m as Search, n as Volume2, o as Sunrise, p as Send, r as TriangleAlert, s as Sun, t as VolumeX, u as Smartphone, v as Moon, w as House, x as MapPin, y as Minus, z as ArrowDown } from "../_libs/lucide-react.mjs";
import { i as keepPreviousData } from "../_libs/tanstack__query-core.mjs";
import { a as describeRain, i as SEED_CLIPS, n as RAIN_LABEL, o as formatClipStamp, s as Route$7 } from "./router-BvJdqAW8.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { a as Bar, i as Area, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as ComposedChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-jS8HFSfK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function mix(a, b, t) {
	return [
		a[0] + (b[0] - a[0]) * t,
		a[1] + (b[1] - a[1]) * t,
		a[2] + (b[2] - a[2]) * t
	];
}
function ramp(stops, value) {
	const first = stops[0];
	const last = stops[stops.length - 1];
	if (!first || !last) return [
		0,
		0,
		0
	];
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
var WIND = [
	{
		t: 0,
		c: [
			18,
			42,
			72
		]
	},
	{
		t: 8,
		c: [
			24,
			110,
			150
		]
	},
	{
		t: 18,
		c: [
			40,
			210,
			170
		]
	},
	{
		t: 32,
		c: [
			236,
			196,
			70
		]
	},
	{
		t: 50,
		c: [
			244,
			120,
			70
		]
	}
];
var TEMP = [
	{
		t: 6,
		c: [
			18,
			52,
			120
		]
	},
	{
		t: 14,
		c: [
			28,
			130,
			168
		]
	},
	{
		t: 22,
		c: [
			48,
			186,
			150
		]
	},
	{
		t: 30,
		c: [
			232,
			176,
			64
		]
	},
	{
		t: 36,
		c: [
			214,
			96,
			48
		]
	},
	{
		t: 44,
		c: [
			150,
			32,
			48
		]
	}
];
var RAIN = [
	{
		t: 0,
		c: [
			18,
			48,
			68
		]
	},
	{
		t: .4,
		c: [
			29,
			78,
			137
		]
	},
	{
		t: 2,
		c: [
			61,
			143,
			209
		]
	},
	{
		t: 8,
		c: [
			159,
			212,
			239
		]
	},
	{
		t: 20,
		c: [
			242,
			247,
			251
		]
	}
];
var CLOUD = [
	{
		t: 0,
		c: [
			16,
			28,
			40
		]
	},
	{
		t: 35,
		c: [
			90,
			112,
			130
		]
	},
	{
		t: 70,
		c: [
			168,
			184,
			196
		]
	},
	{
		t: 100,
		c: [
			232,
			238,
			243
		]
	}
];
var ALPHA = {
	wind: .62,
	temp: .78,
	clouds: .55,
	rain: .8,
	accum: .84
};
function layerScalar(layer, sample) {
	if (layer === "wind") return Math.hypot(sample.u, sample.v) * 3.6;
	if (layer === "temp") return sample.temp;
	if (layer === "rain" || layer === "accum") return sample.rain;
	return sample.cloud;
}
function colorCss(layer, value) {
	const [r, g, b] = ramp(layer === "wind" ? WIND : layer === "temp" ? TEMP : layer === "clouds" ? CLOUD : RAIN, value);
	let alpha = ALPHA[layer];
	if (layer === "wind") alpha = .18 + Math.min(.7, value / 48);
	if (layer === "clouds") alpha = .08 + Math.min(.72, value / 110);
	if (layer === "rain") alpha = value < .05 ? 0 : Math.min(.9, .32 + value / 6);
	if (layer === "accum") alpha = value < .15 ? 0 : Math.min(.9, .34 + value / 18);
	return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha})`;
}
function particleCss(kmh) {
	const [r, g, b] = ramp(WIND, kmh);
	return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},0.9)`;
}
var LEGEND = {
	wind: {
		label: "توقع الرياح",
		stops: [
			"0",
			"15",
			"30",
			"50"
		]
	},
	temp: {
		label: "توقع الحرارة",
		stops: [
			"10°",
			"20°",
			"30°",
			"40°"
		]
	},
	clouds: {
		label: "توقع السحب",
		stops: [
			"0",
			"50",
			"100"
		]
	},
	rain: {
		label: "توقع المطر مم/س",
		stops: [
			"0",
			"1",
			"5",
			"15"
		]
	},
	accum: {
		label: "مطر تراكمي مم",
		stops: [
			"0",
			"5",
			"20",
			"40"
		]
	}
};
function sampleField(field, lat, lon, index) {
	const { west, east, south, north, cols, rows } = field;
	if (cols < 2 || rows < 2) return null;
	const gx = (lon - west) / (east - west || 1) * (cols - 1);
	const gy = (lat - south) / (north - south || 1) * (rows - 1);
	if (gx < -.75 || gy < -.75 || gx > cols - .25 || gy > rows - .25) return null;
	const cx = Math.min(cols - 1, Math.max(0, gx));
	const cy = Math.min(rows - 1, Math.max(0, gy));
	const x0 = Math.min(cols - 1, Math.max(0, Math.floor(cx)));
	const y0 = Math.min(rows - 1, Math.max(0, Math.floor(cy)));
	const x1 = Math.min(cols - 1, x0 + 1);
	const y1 = Math.min(rows - 1, y0 + 1);
	const tx = cx - x0;
	const ty = cy - y0;
	const at = (grid, x, y) => grid[y * cols + x]?.[index] ?? 0;
	const bilerp = (grid) => {
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
		pres: bilerp(field.pres)
	};
}
function sampleAccumRain(field, lat, lon, hours) {
	const { west, east, south, north, cols, rows, rain, span } = field;
	if (cols < 2 || rows < 2) return null;
	const gx = (lon - west) / (east - west || 1) * (cols - 1);
	const gy = (lat - south) / (north - south || 1) * (rows - 1);
	if (gx < -.75 || gy < -.75 || gx > cols - .25 || gy > rows - .25) return null;
	const cx = Math.min(cols - 1, Math.max(0, gx));
	const cy = Math.min(rows - 1, Math.max(0, gy));
	const x0 = Math.min(cols - 1, Math.max(0, Math.floor(cx)));
	const y0 = Math.min(rows - 1, Math.max(0, Math.floor(cy)));
	const x1 = Math.min(cols - 1, x0 + 1);
	const y1 = Math.min(rows - 1, y0 + 1);
	const tx = cx - x0;
	const ty = cy - y0;
	const sumAt = (x, y) => {
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
var chartInk = {
	accent: "#3dceb4",
	rain: "#7eb6d6",
	muted: "#93a0ae",
	line: "#243040"
};
function quantizeBounds(input) {
	const q = (value) => Math.round(value * 2) / 2;
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
	return {
		s,
		w,
		n,
		e
	};
}
var WEEKDAYS = [
	"الأحد",
	"الإثنين",
	"الثلاثاء",
	"الأربعاء",
	"الخميس",
	"الجمعة",
	"السبت"
];
var MONTHS = [
	"يناير",
	"فبراير",
	"مارس",
	"أبريل",
	"مايو",
	"يونيو",
	"يوليو",
	"أغسطس",
	"سبتمبر",
	"أكتوبر",
	"نوفمبر",
	"ديسمبر"
];
var EN_DAY = {
	Sun: 0,
	Mon: 1,
	Tue: 2,
	Wed: 3,
	Thu: 4,
	Fri: 5,
	Sat: 6
};
function localParts(iso, tz) {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: tz,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
		weekday: "short"
	}).formatToParts(new Date(iso));
	const get = (type) => parts.find((part) => part.type === type)?.value ?? "";
	const hour = Number(get("hour"));
	return {
		key: `${get("year")}-${get("month")}-${get("day")}`,
		hour: Number.isFinite(hour) ? hour : 0,
		minute: Number(get("minute")) || 0,
		weekday: EN_DAY[get("weekday")] ?? 0
	};
}
function fmt(n, digits = 0) {
	if (!Number.isFinite(n)) return "—";
	if (digits === 0) return String(Math.round(n));
	return n.toFixed(digits);
}
function tempOf(celsius, unit) {
	if (unit === "f") return celsius * 9 / 5 + 32;
	if (unit === "k") return celsius + 273.15;
	return celsius;
}
function windKmh(ms) {
	return ms * 3.6;
}
var DIRS = [
	"شمال",
	"شمال شرق",
	"شرق",
	"جنوب شرق",
	"جنوب",
	"جنوب غرب",
	"غرب",
	"شمال غرب"
];
function dirName(deg) {
	return DIRS[Math.round((deg % 360 + 360) % 360 / 45) % 8] ?? "شمال";
}
function windWord(kmh) {
	if (kmh < 6) return "ساكنة";
	if (kmh < 20) return "خفيفة";
	if (kmh < 40) return "معتدلة";
	if (kmh < 60) return "نشطة";
	return "قوية";
}
function formatHour(iso, tz) {
	const { hour } = localParts(iso, tz);
	return `${hour % 12 === 0 ? 12 : hour % 12} ${hour < 12 ? "ص" : "م"}`;
}
function formatStamp(iso, tz) {
	const parts = localParts(iso, tz);
	const [, monthRaw, dayRaw] = parts.key.split("-");
	const month = MONTHS[(Number(monthRaw) || 1) - 1] ?? "";
	const hour12 = parts.hour % 12 === 0 ? 12 : parts.hour % 12;
	const hh = String(hour12).padStart(2, "0");
	const mm = String(parts.minute).padStart(2, "0");
	return `${WEEKDAYS[parts.weekday]}, ${Number(dayRaw)} ${month}, ${hh}:${mm} ${parts.hour < 12 ? "ص" : "م"}`;
}
function formatWhen(iso, tz) {
	return `${WEEKDAYS[localParts(iso, tz).weekday]} · ${formatHour(iso, tz)}`;
}
function formatClock(iso, tz) {
	const { hour, minute } = localParts(iso, tz);
	return `${hour % 12 === 0 ? 12 : hour % 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "ص" : "م"}`;
}
function shiftKey(key, days) {
	const [y, m, d] = key.split("-").map(Number);
	const dt = new Date(Date.UTC(y, (m ?? 1) - 1, (d ?? 1) + days));
	const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
	const dd = String(dt.getUTCDate()).padStart(2, "0");
	return `${dt.getUTCFullYear()}-${mm}-${dd}`;
}
function dayLabel(key, todayKey) {
	if (key === todayKey) return "اليوم";
	if (key === shiftKey(todayKey, 1)) return "غداً";
	const [y, m, d] = key.split("-").map(Number);
	return WEEKDAYS[new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1)).getUTCDay()] ?? key;
}
function buildDays(hours, tz, nowIso) {
	const todayKey = localParts(nowIso, tz).key;
	const buckets = /* @__PURE__ */ new Map();
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
				bestDist: Math.abs(parts.hour - 14)
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
function uvLabel(uv) {
	if (uv < 3) return "منخفض";
	if (uv < 6) return "متوسط";
	if (uv < 8) return "مرتفع";
	if (uv < 11) return "عالٍ جداً";
	return "شديد";
}
function buildAlerts(hour, place) {
	const out = [];
	const kmh = windKmh(hour.wind);
	if (hour.temp >= 45) out.push({
		tone: "danger",
		title: "حر شديد",
		detail: "درجة الحرارة مرتفعة جداً. قلّل التعرض للشمس."
	});
	else if (hour.temp >= 40) out.push({
		tone: "warn",
		title: "حرارة مرتفعة",
		detail: "يُفضّل تجنب المجهود في وقت الذروة."
	});
	if (hour.symbol.includes("thunder")) out.push({
		tone: "danger",
		title: "عواصف رعدية",
		detail: "احتمال برق وأمطار غزيرة خلال الفترة."
	});
	else if (hour.rain >= 5) out.push({
		tone: "warn",
		title: "أمطار غزيرة",
		detail: "كميات مطر عالية متوقعة. انتبه للطرق."
	});
	else if (hour.rain >= 1) out.push({
		tone: "warn",
		title: "أمطار",
		detail: "هطول متوقع خلال الفترة."
	});
	if (kmh >= 55) out.push({
		tone: "danger",
		title: "رياح قوية",
		detail: "هبات قد تؤثر على القيادة والأجسام الخفيفة."
	});
	else if (kmh >= 40) out.push({
		tone: "warn",
		title: "رياح نشطة",
		detail: "الرياح أقوى من المعتاد."
	});
	if (hour.fog >= 40) out.push({
		tone: "warn",
		title: "ضباب",
		detail: "تدنٍ محتمل في مدى الرؤية."
	});
	if (hour.uv >= 8 && hour.temp >= 28) out.push({
		tone: "warn",
		title: "أشعة مرتفعة",
		detail: "استخدم واقياً إذا خرجت وقت الظهيرة."
	});
	if (place.lat > 12 && place.lat < 35 && place.lon > 34 && place.lon < 60 && hour.rh < 30 && hour.cloud < 45 && hour.fog < 15 && kmh >= 35 && hour.rain < .2) out.push({
		tone: "warn",
		title: "احتمال غبار",
		detail: "رياح جافة قد تثير الغبار. هذا تقدير تقريبي وليس قياساً ميدانياً."
	});
	return out.slice(0, 3);
}
function blurb(hour) {
	const kmh = windKmh(hour.wind);
	const bits = [];
	if (hour.temp >= 40) bits.push("الجو حار جداً");
	else if (hour.temp >= 33) bits.push("الجو حار");
	else if (hour.temp >= 24) bits.push("الجو دافئ");
	else if (hour.temp >= 16) bits.push("الجو معتدل");
	else bits.push("الجو بارد");
	if (hour.rain >= .5) bits.push("مع هطول");
	else if (hour.cloud >= 70) bits.push("والسماء غائمة");
	else if (hour.cloud <= 20) bits.push("والسماء صافية");
	if (kmh >= 40) bits.push("ورياح نشطة");
	return bits.join(" ");
}
function nearestTimeIndex(times, iso) {
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
var KEY = "naseem.v1";
var LANGS$1 = [
	"ar",
	"en",
	"fr",
	"fa",
	"ms",
	"ur",
	"tr",
	"es",
	"id"
];
var THEMES = [
	"auto",
	"day",
	"night",
	"blue"
];
function asUnit(value) {
	return value === "f" || value === "k" ? value : "c";
}
function asLayer(value) {
	if (value === "temp" || value === "clouds" || value === "rain" || value === "accum" || value === "wind") return value;
	return "wind";
}
function persist(state) {
	if (typeof window === "undefined") return;
	const saved = {
		place: state.place,
		unit: state.unit,
		layer: state.layer,
		favorites: state.favorites,
		lang: state.lang,
		theme: state.theme,
		vibrate: state.vibrate,
		notify: state.notify,
		alertOn: state.alertOn
	};
	localStorage.setItem(KEY, JSON.stringify(saved));
}
var useNaseem = create((set, get) => ({
	place: JEDDAH,
	unit: "c",
	layer: "wind",
	favorites: [],
	hourIndex: 0,
	focus: 0,
	hydrated: false,
	lang: "ar",
	theme: "auto",
	vibrate: false,
	notify: true,
	alertOn: {
		yellow: true,
		orange: true,
		red: true
	},
	setPlace: (place, opts) => {
		set((state) => ({
			place,
			hourIndex: 0,
			focus: opts?.fly === false ? state.focus : state.focus + 1
		}));
		persist(get());
	},
	setUnit: (unit) => {
		set({ unit });
		persist(get());
	},
	setLang: (lang) => {
		set({ lang });
		persist(get());
	},
	setTheme: (theme) => {
		set({ theme });
		persist(get());
	},
	setVibrate: (vibrate) => {
		set({ vibrate });
		persist(get());
	},
	setNotify: (notify) => {
		set({ notify });
		persist(get());
	},
	setAlertOn: (alertOn) => {
		set({ alertOn });
		persist(get());
	},
	setLayer: (layer) => {
		set({ layer });
		persist(get());
	},
	setHour: (hourIndex) => set({ hourIndex }),
	toggleFav: (place) => {
		const current = place ?? get().place;
		set({ favorites: get().favorites.some((item) => item.id === current.id) ? get().favorites.filter((item) => item.id !== current.id) : [current, ...get().favorites].slice(0, 12) });
		persist(get());
	},
	hydrate: () => {
		if (get().hydrated || typeof window === "undefined") return;
		try {
			const raw = localStorage.getItem(KEY);
			if (raw) {
				const saved = JSON.parse(raw);
				if (saved.place && Number.isFinite(saved.place.lat) && Number.isFinite(saved.place.lon)) {
					const moved = saved.place.id !== get().place.id;
					set({
						place: saved.place,
						unit: asUnit(saved.unit),
						layer: asLayer(saved.layer),
						favorites: Array.isArray(saved.favorites) ? saved.favorites.slice(0, 12) : [],
						lang: LANGS$1.includes(saved.lang) ? saved.lang : "ar",
						theme: THEMES.includes(saved.theme) ? saved.theme : "auto",
						vibrate: saved.vibrate === true,
						notify: saved.notify !== false,
						alertOn: {
							yellow: saved.alertOn?.yellow !== false,
							orange: saved.alertOn?.orange !== false,
							red: saved.alertOn?.red !== false
						},
						focus: moved ? get().focus + 1 : get().focus
					});
				}
			}
		} catch {}
		set({ hydrated: true });
	}
}));
var AR = {
	settings: "الإعدادات",
	favorites: "المدن المفضلة",
	manageFav: "إدارة المدن المفضلة",
	notifications: "الاشعارات",
	yellow: "الإنذار الأصفر",
	orange: "الإنذار البرتقالي",
	red: "الإنذار الأحمر",
	heat: "اعدادات الحرارة",
	celsius: "درجة مئوية",
	fahrenheit: "فهرنهايت",
	kelvin: "كيلفن",
	language: "تغيير اللغة",
	theme: "وضع التطبيق",
	auto: "تلقائي",
	day: "نهاري",
	night: "ليلي",
	blue: "أزرق ليلي",
	vibrate: "خاصية الإهتزاز",
	alerts: "الإنذار المبكر",
	alertList: "قائمة الإنذارات",
	alertMap: "خريطة الإنذارات",
	allAlerts: "جميع التنبيهات",
	install: "تثبيت التطبيق",
	none: "لا توجد تنبيهات حالياً",
	about: "الإنذارات صادرة من المركز الوطني للأرصاد، وليست تقديراً من التطبيق.",
	rights: "المصدر: المركز الوطني للأرصاد",
	home: "الرئيسية",
	maps: "الخرائط",
	radar: "رادار الطقس",
	shorts: "شورت",
	emptyFav: "لا توجد مدن بعد. أضفها من النجمة."
};
var EN = {
	settings: "Settings",
	favorites: "Favourite cities",
	manageFav: "Manage favourite cities",
	notifications: "Notifications",
	yellow: "Yellow alert",
	orange: "Orange alert",
	red: "Red alert",
	heat: "Temperature",
	celsius: "Celsius",
	fahrenheit: "Fahrenheit",
	kelvin: "Kelvin",
	language: "Language",
	theme: "Appearance",
	auto: "Automatic",
	day: "Day",
	night: "Night",
	blue: "Night blue",
	vibrate: "Haptics",
	alerts: "Early warning",
	alertList: "Alert list",
	alertMap: "Alert map",
	allAlerts: "All alerts",
	install: "Install app",
	none: "No alerts right now",
	about: "Alerts come from the National Center for Meteorology, not an in-app estimate.",
	rights: "Source: National Center for Meteorology",
	home: "Home",
	maps: "Maps",
	radar: "Radar",
	shorts: "Shorts",
	emptyFav: "No cities yet. Add one with the star."
};
var PACKS = {
	ar: AR,
	en: EN,
	fr: {
		...EN,
		settings: "Réglages",
		favorites: "Villes favorites",
		manageFav: "Gérer les favoris",
		notifications: "Notifications",
		yellow: "Alerte jaune",
		orange: "Alerte orange",
		red: "Alerte rouge",
		heat: "Température",
		celsius: "Celsius",
		fahrenheit: "Fahrenheit",
		kelvin: "Kelvin",
		language: "Langue",
		theme: "Apparence",
		auto: "Automatique",
		day: "Jour",
		night: "Nuit",
		blue: "Bleu nuit",
		vibrate: "Vibrations",
		alerts: "Alerte précoce",
		alertList: "Liste des alertes",
		alertMap: "Carte des alertes",
		allAlerts: "Toutes les alertes",
		install: "Installer",
		none: "Aucune alerte",
		home: "Accueil",
		maps: "Cartes",
		radar: "Radar"
	},
	fa: {
		...EN,
		settings: "تنظیمات",
		favorites: "شهرهای محبوب",
		manageFav: "مدیریت شهرها",
		notifications: "اعلان‌ها",
		yellow: "هشدار زرد",
		orange: "هشدار نارنجی",
		red: "هشدار قرمز",
		heat: "دما",
		celsius: "سلسیوس",
		fahrenheit: "فارنهایت",
		kelvin: "کلوین",
		language: "زبان",
		theme: "حالت برنامه",
		auto: "خودکار",
		day: "روز",
		night: "شب",
		blue: "آبی شب",
		vibrate: "لرزش",
		alerts: "هشدار زودهنگام",
		alertList: "فهرست هشدار",
		alertMap: "نقشه هشدار",
		allAlerts: "همه هشدارها",
		install: "نصب",
		none: "هشداری نیست",
		home: "خانه",
		maps: "نقشه‌ها",
		radar: "رادار"
	},
	ms: {
		...EN,
		settings: "Tetapan",
		favorites: "Bandar kegemaran",
		manageFav: "Urus bandar",
		notifications: "Pemberitahuan",
		yellow: "Amaran kuning",
		orange: "Amaran jingga",
		red: "Amaran merah",
		heat: "Suhu",
		language: "Bahasa",
		theme: "Paparan",
		auto: "Automatik",
		day: "Siang",
		night: "Malam",
		blue: "Biru malam",
		vibrate: "Getaran",
		alerts: "Amaran awal",
		alertList: "Senarai amaran",
		alertMap: "Peta amaran",
		allAlerts: "Semua amaran",
		install: "Pasang",
		none: "Tiada amaran",
		home: "Utama",
		maps: "Peta",
		radar: "Radar"
	},
	ur: {
		...EN,
		settings: "ترتیبات",
		favorites: "پسندیدہ شہر",
		manageFav: "شہر منظم کریں",
		notifications: "اطلاعات",
		yellow: "پیلا انتباہ",
		orange: "نارنجی انتباہ",
		red: "سرخ انتباہ",
		heat: "درجہ حرارت",
		celsius: "سیلسیئس",
		fahrenheit: "فارن ہائیٹ",
		kelvin: "کیلون",
		language: "زبان",
		theme: "انداز",
		auto: "خودکار",
		day: "دن",
		night: "رات",
		blue: "نیلی رات",
		vibrate: "تھرتھراہٹ",
		alerts: "ابتدائی انتباہ",
		alertList: "فہرست",
		alertMap: "نقشہ",
		allAlerts: "تمام انتباہات",
		install: "انسٹال",
		none: "کوئی انتباہ نہیں",
		home: "ہوم",
		maps: "نقشے",
		radar: "ریڈار"
	},
	tr: {
		...EN,
		settings: "Ayarlar",
		favorites: "Favori şehirler",
		manageFav: "Şehirleri yönet",
		notifications: "Bildirimler",
		yellow: "Sarı uyarı",
		orange: "Turuncu uyarı",
		red: "Kırmızı uyarı",
		heat: "Sıcaklık",
		celsius: "Santigrat",
		fahrenheit: "Fahrenhayt",
		kelvin: "Kelvin",
		language: "Dil",
		theme: "Görünüm",
		auto: "Otomatik",
		day: "Gündüz",
		night: "Gece",
		blue: "Gece mavisi",
		vibrate: "Titreşim",
		alerts: "Erken uyarı",
		alertList: "Uyarı listesi",
		alertMap: "Uyarı haritası",
		allAlerts: "Tüm uyarılar",
		install: "Yükle",
		none: "Uyarı yok",
		home: "Ana sayfa",
		maps: "Haritalar",
		radar: "Radar"
	},
	es: {
		...EN,
		settings: "Ajustes",
		favorites: "Ciudades favoritas",
		manageFav: "Gestionar favoritas",
		notifications: "Avisos",
		yellow: "Alerta amarilla",
		orange: "Alerta naranja",
		red: "Alerta roja",
		heat: "Temperatura",
		language: "Idioma",
		theme: "Apariencia",
		auto: "Automático",
		day: "Día",
		night: "Noche",
		blue: "Azul noche",
		vibrate: "Vibración",
		alerts: "Alerta temprana",
		alertList: "Lista de alertas",
		alertMap: "Mapa de alertas",
		allAlerts: "Todas las alertas",
		install: "Instalar",
		none: "Sin alertas",
		home: "Inicio",
		maps: "Mapas",
		radar: "Radar"
	},
	id: {
		...EN,
		settings: "Pengaturan",
		favorites: "Kota favorit",
		manageFav: "Kelola kota",
		notifications: "Notifikasi",
		yellow: "Peringatan kuning",
		orange: "Peringatan oranye",
		red: "Peringatan merah",
		heat: "Suhu",
		language: "Bahasa",
		theme: "Tampilan",
		auto: "Otomatis",
		day: "Siang",
		night: "Malam",
		blue: "Biru malam",
		vibrate: "Getar",
		alerts: "Peringatan dini",
		alertList: "Daftar peringatan",
		alertMap: "Peta peringatan",
		allAlerts: "Semua peringatan",
		install: "Pasang",
		none: "Tidak ada peringatan",
		home: "Beranda",
		maps: "Peta",
		radar: "Radar"
	}
};
function t(lang, key) {
	return PACKS[lang]?.[key] ?? AR[key];
}
var TABS = [
	{
		id: "home",
		key: "home",
		icon: House
	},
	{
		id: "alerts",
		key: "alerts",
		icon: TriangleAlert
	},
	{
		id: "map",
		key: "maps",
		icon: Map$1
	},
	{
		id: "radar",
		key: "radar",
		icon: RadarIcon
	},
	{
		id: "rain",
		key: "shorts",
		icon: CloudRain
	},
	{
		id: "settings",
		key: "settings",
		icon: Settings
	}
];
function Dock({ tab, alerts, onTab }) {
	const lang = useNaseem((state) => state.lang);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "dock-wrap",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "dock",
			"aria-label": "التنقل",
			children: TABS.map((item) => {
				const Icon = item.icon;
				const on = tab === item.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: on ? "on" : void 0,
					"aria-current": on ? "page" : void 0,
					onClick: () => onTab(item.id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "dock-ico",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							size: 22,
							strokeWidth: 1.75
						}), item.id === "alerts" && alerts > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
							className: "dock-badge",
							children: alerts
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(lang, item.key) })]
				}, item.id);
			})
		})
	});
}
function RadarIcon({ size = 22, strokeWidth = 1.75 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		width: size,
		height: size,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth,
		strokeLinecap: "round",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "12",
				cy: "12",
				r: "8"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 12 17 8" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M16.5 5.5a7 7 0 0 1 2 4.2" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "12",
				cy: "12",
				r: "1.3",
				fill: "currentColor",
				stroke: "none"
			})
		]
	});
}
function symbolMeta(code) {
	const night = code.includes("night");
	const base = code.replace(/_(day|night|polartwilight)$/, "");
	if (base.includes("thunder")) return {
		label: "عاصفة رعدية",
		short: "رعد",
		icon: "thunder",
		sky: "thunder"
	};
	if (base.includes("sleet")) return {
		label: "مطر ثلجي",
		short: "ثلج",
		icon: "snow",
		sky: "snow"
	};
	if (base.includes("snow")) return {
		label: "ثلج",
		short: "ثلج",
		icon: "snow",
		sky: "snow"
	};
	if (base.includes("heavyrain")) return {
		label: base.includes("shower") ? "زخات غزيرة" : "مطر غزير",
		short: "مطر",
		icon: "rain",
		sky: "rain"
	};
	if (base.includes("lightrain") || base.includes("drizzle")) return {
		label: base.includes("shower") ? "زخات خفيفة" : "مطر خفيف",
		short: "مطر",
		icon: "rain",
		sky: "rain"
	};
	if (base.includes("rain")) return {
		label: base.includes("shower") ? "زخات مطر" : "مطر",
		short: "مطر",
		icon: "rain",
		sky: "rain"
	};
	if (base === "fog") return {
		label: "ضباب",
		short: "ضباب",
		icon: "fog",
		sky: "fog"
	};
	if (base === "cloudy") return {
		label: "غائم",
		short: "غائم",
		icon: "cloud",
		sky: "cloud"
	};
	if (base === "partlycloudy") return {
		label: "غائم جزئياً",
		short: "غائم جزئياً",
		icon: night ? "night-partly" : "partly",
		sky: night ? "night-partly" : "partly"
	};
	if (base === "fair" || base === "clearsky") return {
		label: night ? "سماء صافية" : "صحو",
		short: "صحو",
		icon: night ? "moon" : "sun",
		sky: night ? "moon" : "sun"
	};
	return {
		label: "غائم جزئياً",
		short: "غائم جزئياً",
		icon: "partly",
		sky: "partly"
	};
}
var ICONS = {
	sun: Sun,
	moon: Moon,
	fair: CloudSun,
	partly: CloudSun,
	"night-partly": CloudMoon,
	cloud: Cloud,
	fog: CloudFog,
	rain: CloudRain,
	thunder: CloudLightning,
	snow: CloudSnow
};
function WxIcon({ name, size = 22 }) {
	const Icon = ICONS[name];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
		size,
		strokeWidth: 1.75,
		"aria-hidden": "true"
	});
}
function WindArrow({ deg, size = 18 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, {
		size,
		strokeWidth: 1.75,
		"aria-hidden": "true",
		style: { transform: `rotate(${(deg + 180) % 360}deg)` }
	});
}
var PI = Math.PI;
var RAD = PI / 180;
var DAY_MS = 864e5;
var J1970 = 2440588;
var J2000 = 2451545;
function toJulian(date) {
	return date.getTime() / DAY_MS - .5 + J1970;
}
function fromJulian(julian) {
	return /* @__PURE__ */ new Date((julian + .5 - J1970) * DAY_MS);
}
/** Sunrise and sunset for the calendar day of `date` (pass local noon). */
function sunTimes(lat, lon, date) {
	const lw = RAD * -lon;
	const phi = RAD * lat;
	const days = toJulian(date) - J2000;
	const n = Math.round(days - 9e-4 - lw / (2 * PI));
	const ds = 9e-4 + lw / (2 * PI) + n;
	const mean = RAD * (357.5291 + .98560028 * ds);
	const lambda = mean + RAD * (1.9148 * Math.sin(mean) + .02 * Math.sin(2 * mean) + 102.9372);
	const decl = Math.asin(Math.sin(lambda) * Math.sin(RAD * 23.4397));
	const noon = J2000 + ds + .0053 * Math.sin(mean) - .0069 * Math.sin(2 * lambda);
	const cosH = (Math.sin(RAD * -.833) - Math.sin(phi) * Math.sin(decl)) / (Math.cos(phi) * Math.cos(decl));
	if (cosH > 1 || cosH < -1 || Number.isNaN(cosH)) return null;
	const hourAngle = Math.acos(cosH);
	return {
		sunrise: fromJulian(noon - hourAngle / (2 * PI)),
		sunset: fromJulian(noon + hourAngle / (2 * PI))
	};
}
function SkyHero(props) {
	const { place, whenIso, temp, short, sky, unit, high, low, favored, onFav, onSearch } = props;
	const sun = sunArc(place, whenIso);
	const unitLabel = unit === "f" ? "ف" : "م";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: `sky sky-${sky}`,
		"aria-label": "حالة الطقس",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkyBackdrop, { sky }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "sky-body",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sky-top",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "sky-place",
							onClick: onSearch,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: place.name })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: favored ? "icon-btn sm on" : "icon-btn sm sky-fav",
							"aria-pressed": favored,
							"aria-label": favored ? "إزالة من المفضلة" : "إضافة إلى المفضلة",
							onClick: onFav,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
								size: 16,
								fill: favored ? "currentColor" : "none"
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "sky-when",
					children: formatStamp(whenIso, place.timezone)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sky-hero-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sky-readout",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "sky-temp",
							children: [temp == null ? "—" : fmt(tempOf(temp, unit)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "°" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "sky-cond",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: short }), high != null && low != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "sky-hl",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { size: 14 }),
									fmt(tempOf(high, unit)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { size: 14 }),
									fmt(tempOf(low, unit)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "sr-only",
										children: ["درجة ", unitLabel]
									})
								]
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkyArt, { sky })]
				}),
				sun && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "sky-rule" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sun-row",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sun-end",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "الشروق" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sunrise, { size: 18 }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: sun.rise })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
								viewBox: "0 0 200 78",
								className: "sun-arc",
								"aria-hidden": "true",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
										d: "M16 62 A84 58 0 0 1 184 62",
										fill: "none",
										stroke: "currentColor",
										strokeWidth: "2"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
										cx: "16",
										cy: "62",
										r: "4",
										className: "arc-end"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
										cx: "184",
										cy: "62",
										r: "4",
										className: "arc-end"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
										transform: `translate(${sun.x} ${sun.y})`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
											r: "7",
											className: "arc-sun"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
											r: "11",
											fill: "none",
											stroke: "currentColor",
											strokeWidth: "1.4",
											strokeDasharray: "2 3"
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sun-end",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "الغروب" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sunset, { size: 18 }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: sun.set })
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "sky-daylen",
						children: ["مدة النهار: ", sun.length]
					})
				] })
			]
		})]
	});
}
function sunArc(place, iso) {
	const when = new Date(iso);
	if (Number.isNaN(when.getTime())) return null;
	const sun = sunTimes(place.lat, place.lon, when);
	if (!sun) return null;
	const at = when.getTime();
	const rise = sun.sunrise.getTime();
	const set = sun.sunset.getTime();
	const progress = Math.min(1, Math.max(0, (at - rise) / (set - rise || 1)));
	const angle = Math.PI * progress;
	const x = 100 + Math.cos(angle) * 84;
	const y = 62 - Math.sin(angle) * 58;
	const mins = Math.max(0, Math.round((set - rise) / 6e4));
	const pad = (value) => value.replace(/^(\d):/, "0$1:");
	return {
		x: x.toFixed(1),
		y: y.toFixed(1),
		rise: pad(formatClock(sun.sunrise.toISOString(), place.timezone)),
		set: pad(formatClock(sun.sunset.toISOString(), place.timezone)),
		length: `${Math.floor(mins / 60)} ساعة و ${mins % 60} دقيقة`
	};
}
function SkyBackdrop({ sky }) {
	const drops = sky === "rain" || sky === "thunder" ? 22 : sky === "snow" ? 16 : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "sky-atmos",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sky-orb" }),
			sky === "moon" || sky === "night-partly" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, {}) : null,
			drops > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sky-fall",
				children: Array.from({ length: drops }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: {
					left: `${index * 37 % 100}%`,
					animationDelay: `${index % 8 * .14}s`,
					animationDuration: sky === "snow" ? `${2.4 + index % 4 * .4}s` : `${.75 + index % 5 * .08}s`
				} }, index))
			}),
			sky === "thunder" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sky-flash" }),
			(sky === "fog" || sky === "cloud") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sky-mist" })
		]
	});
}
function Stars() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "sky-stars",
		children: Array.from({ length: 10 }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: {
			left: `${8 + index * 29 % 84}%`,
			top: `${8 + index * 17 % 42}%`
		} }, index))
	});
}
function SkyArt({ sky }) {
	if (sky === "rain" || sky === "thunder") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "sky-art",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudPile, {})
	});
	if (sky === "snow" || sky === "cloud" || sky === "fog") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "sky-art",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudPile, { pale: sky !== "fog" })
	});
	if (sky === "partly" || sky === "night-partly") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "sky-art",
		"aria-hidden": "true",
		children: [sky === "night-partly" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoonGlyph, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SunGlyph, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudPile, { small: true })]
	});
	if (sky === "moon") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "sky-art",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoonGlyph, {})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "sky-art",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SunGlyph, {})
	});
}
function SunGlyph() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		className: "glyph sun-glyph",
		viewBox: "0 0 80 80",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
			className: "sun-rays",
			children: Array.from({ length: 8 }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "40",
				cy: "8",
				r: "2.3",
				transform: `rotate(${index * 45} 40 40)`
			}, index))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "40",
			cy: "40",
			r: "14",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "2.4"
		})]
	});
}
function MoonGlyph() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		className: "glyph",
		viewBox: "0 0 80 80",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M46 14a22 22 0 1 0 18 32 18 18 0 1 1-18-32z",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "2.4",
			strokeLinejoin: "round"
		})
	});
}
function CloudPile({ small, pale }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		className: small ? "glyph cloud-glyph small" : "glyph cloud-glyph",
		viewBox: "0 0 96 64",
		"data-pale": pale ? "1" : "0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M28 48h44a14 14 0 0 0 1.2-27.9 18 18 0 0 0-34.4-4.2A12 12 0 0 0 28 48z",
			fill: "currentColor",
			opacity: "0.92"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M18 50h36a10 10 0 0 0 .6-19.9 13 13 0 0 0-24.6-2.6A9 9 0 0 0 18 50z",
			fill: "currentColor"
		})]
	});
}
function Panel(props) {
	const { place, forecast, loading, error, unit, favored, nowIso, onHour, onRetry, onFav, onPlace, onSearch } = props;
	const hours = forecast?.hours ?? [];
	const index = Math.min(props.hourIndex, Math.max(0, hours.length - 1));
	const hour = hours[index];
	const days = (0, import_react.useMemo)(() => buildDays(hours, place.timezone, nowIso), [
		hours,
		place.timezone,
		nowIso
	]);
	const today = days[0];
	const weekMin = Math.min(...days.map((day) => day.min), hour?.temp ?? 0);
	const weekMax = Math.max(...days.map((day) => day.max), hour?.temp ?? 1);
	const span = Math.max(1, weekMax - weekMin);
	const meta = hour ? symbolMeta(hour.symbol) : null;
	const alerts = hour ? buildAlerts(hour, place) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkyHero, {
			place,
			whenIso: index === 0 ? nowIso : hour?.t ?? nowIso,
			temp: hour?.temp ?? null,
			short: meta?.short ?? (loading ? "…" : "—"),
			sky: meta?.sky ?? "sun",
			unit,
			high: today?.max ?? hour?.tmax ?? null,
			low: today?.min ?? hour?.tmin ?? null,
			favored,
			onFav,
			onSearch
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "region-grid",
			role: "list",
			"aria-label": "مناطق السعودية",
			children: SA_REGIONS.map((region) => {
				const city = regionCities(region.name, region.placeId)[0];
				if (!city) return null;
				const on = city.id === place.id || place.admin === region.name;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: on ? "chip on" : "chip",
					"aria-pressed": on,
					onClick: () => onPlace(city),
					children: region.name
				}, region.id);
			})
		}),
		loading && !hour && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "hero-block",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "sk sk-line" })
		}),
		error && !hour && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "alert danger",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "تعذر جلب التوقعات" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "تحقق من الاتصال ثم أعد المحاولة." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-btn",
					onClick: onRetry,
					children: "إعادة المحاولة"
				})
			]
		}),
		hour && meta && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "blurb",
				children: [blurb(hour), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "muted",
					children: [
						" · يشعر كأنّه ",
						fmt(tempOf(hour.feels, unit)),
						"°"
					]
				})]
			}),
			alerts.map((alert) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: alert.tone === "danger" ? "alert danger" : "alert",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: alert.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: alert.detail })]
			}, alert.title)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hstrip",
				role: "list",
				children: hours.slice(0, 24).map((item, itemIndex) => {
					const itemMeta = symbolMeta(item.symbol);
					const selected = itemIndex === index;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: selected ? "hour on" : "hour",
						"aria-pressed": selected,
						onClick: () => onHour(itemIndex),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: itemIndex === 0 ? "الآن" : formatHour(item.t, place.timezone) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WxIcon, {
								name: itemMeta.icon,
								size: 18
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [fmt(tempOf(item.temp, unit)), "°"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: item.rain > 0 ? `${fmt(item.rain, 1)} مم` : "" })
						]
					}, item.t);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "metrics",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "الرياح",
						value: `${fmt(windKmh(hour.wind))} كم/س`,
						hint: `${dirName(hour.dir)} · ${windWord(windKmh(hour.wind))}`,
						extra: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindArrow, { deg: hour.dir })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "الرطوبة",
						value: `${fmt(hour.rh)}%`,
						hint: "الرطوبة النسبية"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "الضغط",
						value: `${fmt(hour.pres)}`,
						hint: "هكتوباسكال"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "نقطة الندى",
						value: `${fmt(tempOf(hour.dew, unit))}°`,
						hint: "درجة التكثف"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "الأشعة",
						value: fmt(hour.uv, hour.uv < 10 ? 1 : 0),
						hint: uvLabel(hour.uv)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "الغيوم",
						value: `${fmt(hour.cloud)}%`,
						hint: "غطاء السحب"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "الهطول",
						value: `${fmt(hour.rain, hour.rain < 10 ? 1 : 0)} مم`,
						hint: hour.span > 1 ? "خلال 6 ساعات" : "خلال ساعة"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "الضباب",
						value: `${fmt(hour.fog)}%`,
						hint: "نسبة المساحة الضبابية"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "section-label",
				children: "الأيام القادمة"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "days",
				children: days.map((day) => {
					const dayMeta = symbolMeta(day.symbol);
					const left = (Math.min(day.min, day.max) - weekMin) / span * 100;
					const width = Math.max(8, Math.abs(day.max - day.min) / span * 100);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "day",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "day-name",
								children: day.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WxIcon, {
								name: dayMeta.icon,
								size: 18
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "day-rain",
								children: day.rain >= .2 ? `${fmt(day.rain, 1)}` : ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "day-track",
								"aria-hidden": "true",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "day-range",
									style: {
										insetInlineStart: `${left}%`,
										width: `${width}%`
									}
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "day-temps",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [fmt(tempOf(day.min, unit)), "°"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [fmt(tempOf(day.max, unit)), "°"] })]
							})
						]
					}, day.key);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "section-label",
				children: "٢٤ ساعة"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TempChart, {
				hours: hours.slice(0, 24),
				tz: place.timezone,
				unit
			})] })
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "credit",
			children: "التوقعات من MET Norway. الرادار RainViewer. الخريطة © Esri."
		})
	] });
}
function Metric({ label, value, hint, extra }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "metric",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "metric-top",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), extra]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: value }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: hint })
		]
	});
}
function TempChart({ hours, tz, unit }) {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setReady(true), []);
	const data = hours.map((hour) => ({
		label: formatHour(hour.t, tz),
		temp: Math.round(tempOf(hour.temp, unit)),
		rain: hour.rain
	}));
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "chart-box" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "chart-box",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComposedChart, {
				data,
				margin: {
					top: 12,
					right: 0,
					left: 0,
					bottom: 0
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "label",
						tick: {
							fill: chartInk.muted,
							fontSize: 11
						},
						interval: 3,
						axisLine: false,
						tickLine: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						yAxisId: "t",
						hide: true,
						domain: ["dataMin - 2", "dataMax + 2"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						yAxisId: "r",
						hide: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						cursor: { stroke: chartInk.line },
						content: ({ active, payload, label }) => {
							if (!active || !payload?.length) return null;
							const temp = payload.find((item) => item.dataKey === "temp");
							const rain = payload.find((item) => item.dataKey === "rain");
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "tip",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: label }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: temp ? `${temp.value}°` : "" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: rain && Number(rain.value) > 0 ? `${rain.value} مم` : "بدون هطول" })
								]
							});
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
						yAxisId: "r",
						dataKey: "rain",
						fill: chartInk.rain,
						radius: [
							3,
							3,
							0,
							0
						],
						barSize: 7
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
						yAxisId: "t",
						dataKey: "temp",
						stroke: chartInk.accent,
						fill: chartInk.accent,
						fillOpacity: .16,
						strokeWidth: 2,
						type: "monotone"
					})
				]
			})
		})
	});
}
var EN_NAME = {
	الرياض: "Riyadh",
	"مكة المكرمة": "Makkah",
	"المدينة المنورة": "Madinah",
	القصيم: "Qassim",
	الشرقية: "Eastern",
	عسير: "Asir",
	تبوك: "Tabuk",
	حائل: "Hail",
	"الحدود الشمالية": "Northern Borders",
	جازان: "Jazan",
	نجران: "Najran",
	الباحة: "Bahah",
	الجوف: "Jowf"
};
var FILL = {
	green: "#9dceb4",
	yellow: "#f3e27a",
	orange: "#ef9a3a",
	red: "#e23d3d"
};
var X0 = 34.3;
var Y1 = 32.7;
function project(lon, lat) {
	return [(lon - X0) / 22 * 1e3, (Y1 - lat) / 16.800000000000004 * 820];
}
function regionTitle(name) {
	if (name === "الشرقية") return "المنطقة الشرقية";
	if (name === "الحدود الشمالية") return "الحدود الشمالية";
	return `منطقة ${name}`;
}
function buzz(enabled) {
	if (!enabled || typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
	navigator.vibrate(12);
}
function clock(value) {
	return value.slice(5, 16).replace(" ", " · ");
}
function AlertCards({ items }) {
	if (items.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "muted",
		children: "لا توجد تنبيهات حالياً"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: items.map((alert) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		className: alert.level === "red" ? "alert danger" : "alert",
		href: alert.url,
		target: "_blank",
		rel: "noreferrer",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [alert.kind, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "alert-when",
			children: [
				clock(alert.from),
				" – ",
				clock(alert.to)
			]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
			alert.region,
			alert.places ? ` · ${alert.places}` : "",
			alert.hazards ? ` · ${alert.hazards}` : ""
		] })]
	}, alert.id)) });
}
function AlertsScreen({ lang, levels, vibrate, onPlace, onLevels, onRain }) {
	const [mode, setMode] = (0, import_react.useState)("list");
	const [openAll, setOpenAll] = (0, import_react.useState)(false);
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const [legend, setLegend] = (0, import_react.useState)(false);
	const [zoom, setZoom] = (0, import_react.useState)(1);
	const [rows, setRows] = (0, import_react.useState)([]);
	const [alerts, setAlerts] = (0, import_react.useState)([]);
	const [geom, setGeom] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		let dead = false;
		fetch("/saudi-regions.json").then((response) => response.json()).then((data) => {
			if (!dead) setGeom(Array.isArray(data.regions) ? data.regions : []);
		}).catch(() => void 0);
		fetch("/api/region-alerts").then((response) => response.json()).then((data) => {
			if (dead) return;
			if (Array.isArray(data.regions)) setRows(data.regions);
			if (Array.isArray(data.alerts)) setAlerts(data.alerts);
		}).catch(() => void 0);
		return () => {
			dead = true;
		};
	}, []);
	const levelOf = (id) => rows.find((row) => row.id === id)?.level ?? "green";
	const shown = (level) => level === "green" || levels[level];
	const visible = alerts.filter((alert) => shown(alert.level));
	const view = 1 / zoom;
	const padX = (1 - view) * 1e3 / 2;
	const padY = (1 - view) * 820 / 2;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "page alerts-page",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "page-inner",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "center-title",
					children: t(lang, "alerts")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mode-switch",
					role: "tablist",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: mode === "list" ? "on" : void 0,
						onClick: () => setMode("list"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(lang, "alertList") })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: mode === "map" ? "on" : void 0,
						onClick: () => setMode("map"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(lang, "alertMap") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map$1, { size: 16 })]
					})]
				}),
				mode === "list" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "pref-card",
						children: [
							"yellow",
							"orange",
							"red"
						].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pref-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "row-label",
								children: [
									t(lang, key),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: `dot ${key}` })
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: levels[key] ? "gold-switch on" : "gold-switch",
								"aria-pressed": levels[key],
								onClick: () => {
									buzz(vibrate);
									onLevels({
										...levels,
										[key]: !levels[key]
									});
								}
							})]
						}, key))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "pref-card link-row",
						onClick: () => setOpenAll((value) => !value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(lang, "allAlerts") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { size: 18 })]
					}),
					openAll && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "note-stack",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertCards, { items: visible })
					}),
					SA_REGIONS.map((region) => {
						const level = levelOf(region.id);
						if (!shown(level)) return null;
						const city = regionCities(region.name, region.placeId)[0];
						const open = openId === region.id;
						const mine = visible.filter((alert) => alert.regionId === region.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pref-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "pref-row",
								onClick: () => {
									buzz(vibrate);
									setOpenId(open ? null : region.id);
									if (city) onPlace(city);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "row-label",
									children: [
										regionTitle(region.name),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: `dot ${level}` })
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { size: 18 })]
							}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "note-stack in",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "text-btn",
									onClick: () => onRain(region.id),
									children: ["شورتات المطر", region.id === "SA-09" ? " · جازان" : ""]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertCards, { items: mine })]
							})]
						}, region.id);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rights",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "https://www.ncm.gov.sa/ar/early-warning",
							target: "_blank",
							rel: "noreferrer",
							children: t(lang, "rights")
						})
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "alert-map",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
							viewBox: `${padX} ${padY} ${1e3 * view} ${820 * view}`,
							role: "img",
							"aria-label": t(lang, "alertMap"),
							children: [geom.map((region) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: region.rings.map((ring) => ring.map((point, index) => {
									const [x, y] = project(point[0] ?? 0, point[1] ?? 0);
									return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
								}).join(" ") + " Z").join(" "),
								fill: shown(levelOf(region.id)) ? FILL[levelOf(region.id)] : "#2a2a2a",
								stroke: "#1a1a1a",
								strokeWidth: 1.2,
								onClick: () => {
									const city = regionCities(region.name, SA_REGIONS.find((item) => item.id === region.id)?.placeId ?? "")[0];
									if (city) onPlace(city);
								}
							}, region.id)), geom.map((region) => {
								const [x, y] = project(region.label[1], region.label[0]);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
									x,
									y,
									textAnchor: "middle",
									className: "map-label",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tspan", {
										x,
										dy: "-0.2em",
										children: EN_NAME[region.name] ?? region.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tspan", {
										x,
										dy: "1.15em",
										children: regionTitle(region.name)
									})]
								}, `${region.id}-l`);
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "map-tools",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setLegend((value) => !value),
									"aria-label": "مفتاح الألوان",
									children: "i"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setZoom((value) => Math.min(2.6, value + .35)),
									"aria-label": "تكبير",
									children: "+"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setZoom((value) => Math.max(1, value - .35)),
									"aria-label": "تصغير",
									children: "−"
								})
							]
						}),
						legend && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "legend-card",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "dot green" }), " مستقر"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "dot yellow" }),
									" ",
									t(lang, "yellow")
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "dot orange" }),
									" ",
									t(lang, "orange")
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "dot red" }),
									" ",
									t(lang, "red")
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "muted",
									children: t(lang, "about")
								})
							]
						})
					]
				})
			]
		})
	});
}
var LANGS = [
	{
		id: "ar",
		label: "العربية"
	},
	{
		id: "en",
		label: "English"
	},
	{
		id: "fr",
		label: "Français"
	},
	{
		id: "fa",
		label: "فارسي"
	},
	{
		id: "ms",
		label: "Bahasa Melayu"
	},
	{
		id: "ur",
		label: "اردو"
	},
	{
		id: "tr",
		label: "Türkçe"
	},
	{
		id: "es",
		label: "Español"
	},
	{
		id: "id",
		label: "Bahasa Indonesia"
	}
];
function SettingsScreen({ unit, favorites, lang, theme, vibrate, notify, onUnit, onPlace, onLang, onTheme, onVibrate, onNotify, onSearch, onInstall }) {
	const [favOpen, setFavOpen] = (0, import_react.useState)(false);
	const [about, setAbout] = (0, import_react.useState)(false);
	const pick = (run) => {
		buzz(vibrate);
		run();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "page settings-page",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "page-inner",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "center-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "info-btn",
						"aria-label": "حول الإنذارات",
						onClick: () => setAbout((value) => !value),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { size: 18 })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: t(lang, "settings") })]
				}),
				about && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "about-line",
					children: t(lang, "about")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "pref-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pref-head",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: t(lang, "favorites") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { size: 16 })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "pref-row",
							onClick: () => setFavOpen((value) => !value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(lang, "manageFav") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { size: 18 })]
						}),
						favOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "note-stack in",
							children: [favorites.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "muted",
								children: t(lang, "emptyFav")
							}) : favorites.map((city) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-btn",
								onClick: () => onPlace(city),
								children: city.name
							}, city.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-btn",
								onClick: onSearch,
								children: "+"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "pref-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pref-head split",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
							t(lang, "notifications"),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { size: 16 })
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: notify ? "gold-switch on" : "gold-switch",
							"aria-pressed": notify,
							onClick: () => pick(() => onNotify(!notify))
						})]
					}), [
						"yellow",
						"orange",
						"red"
					].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pref-row quiet",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "row-label",
							children: [
								t(lang, key),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: `dot ${key}` })
							]
						})
					}, key))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "pref-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pref-head",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: t(lang, "heat") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Thermometer, { size: 16 })]
					}), [
						["c", "celsius"],
						["f", "fahrenheit"],
						["k", "kelvin"]
					].map(([id, key]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "pref-row",
						onClick: () => pick(() => onUnit(id)),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(lang, key) }), unit === id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 18 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "tick-gap" })]
					}, id))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "pref-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pref-head",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: t(lang, "language") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { size: 16 })]
					}), LANGS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "pref-row",
						onClick: () => pick(() => onLang(item.id)),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.label }), lang === item.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 18 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "tick-gap" })]
					}, item.id))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "pref-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pref-head",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: t(lang, "theme") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SunMedium, { size: 16 })]
					}), [
						["auto", "auto"],
						["day", "day"],
						["night", "night"],
						["blue", "blue"]
					].map(([id, key]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "pref-row",
						onClick: () => pick(() => onTheme(id)),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(lang, key) }), theme === id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 18 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "tick-gap" })]
					}, id))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "pref-card",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pref-head split",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
							t(lang, "vibrate"),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { size: 16 })
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: vibrate ? "gold-switch on" : "gold-switch",
							"aria-pressed": vibrate,
							onClick: () => {
								onVibrate(!vibrate);
								if (!vibrate) buzz(true);
							}
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "pref-card link-row",
					onClick: onInstall,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(lang, "install") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { size: 18 })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "rights",
					children: ["نَسيم © ", (/* @__PURE__ */ new Date()).getFullYear()]
				})
			]
		})
	});
}
function deviceKind() {
	if (typeof navigator === "undefined") return "desktop";
	const ua = navigator.userAgent;
	const touch = navigator.maxTouchPoints || 0;
	if (/iPad|iPhone|iPod/.test(ua) || /Macintosh/.test(ua) && touch > 1) return "ios";
	if (/Android/i.test(ua)) return "android";
	return "desktop";
}
function InstallSheet({ open, installed, prompt, onClose, onInstalled }) {
	if (!open) return null;
	const kind = deviceKind();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "search-sheet",
		role: "dialog",
		"aria-label": "تثبيت نَسيم",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "search-head",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "icon-btn",
				onClick: onClose,
				"aria-label": "رجوع",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 18 })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "regions-title",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "تثبيت نَسيم" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: installed ? "موجود على شاشتك" : "يبقى قريباً مثل التطبيق" })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "search-body",
			children: installed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "calm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 28 }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "نَسيم مثبّت" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "افتحه من أيقونة البوصلة على الشاشة الرئيسية. يعمل بدون شريط المتصفح." })
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "install-lead",
					children: kind === "ios" ? "على الآيفون التثبيت يتم من سفاري. ثلاث ضغطات ويصير أيقونة على الشاشة." : kind === "android" ? "على الأندرويد يمكن تثبيته من كروم مباشرة." : "التثبيت أوضح من جوالك. من الكمبيوتر استخدم زر المتصفح."
				}),
				prompt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "install-now",
					onClick: () => {
						prompt.prompt().then(async () => {
							if ((await prompt.userChoice).outcome === "accepted") onInstalled();
						});
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 18 }), "تثبيت الآن"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "install-steps",
					children: (kind === "ios" ? [
						"افتح نَسيم في سفاري. إذا كان مفتوحاً داخل تطبيق آخر، اضغط مشاركة ثم «فتح في سفاري».",
						"اضغط زر المشاركة أسفل الشاشة: المربع الذي يخرج منه سهم.",
						"مرّر في القائمة واختر «إضافة إلى الشاشة الرئيسية».",
						"تأكد أن الاسم نَسيم والأيقونة البوصلة، ثم اضغط «إضافة»."
					] : kind === "android" ? [
						"افتح نَسيم في متصفح كروم.",
						"اضغط قائمة المتصفح، النقاط الثلاث أعلى الشاشة.",
						"اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».",
						"أكد التثبيت. تظهر أيقونة نَسيم مع التطبيقات."
					] : [
						"على الجوال، أرسل الرابط إلى سفاري أو كروم واتبِع خطوات الشاشة الرئيسية.",
						"على الكمبيوتر في كروم أو إيدج، اضغط أيقونة التثبيت في شريط العنوان.",
						"أو من قائمة المتصفح اختر «تثبيت نَسيم».",
						"بعد التثبيت يفتح كتطبيق مستقل، بدون شريط المتصفح."
					]).map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "install-num",
						children: index + 1
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: step })] }, step))
				}),
				kind === "ios" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "install-hint",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share, { size: 16 }), "زر المشاركة في سفاري أسفل المنتصف، وليس زر المشاركة داخل التطبيقات الأخرى."]
				})
			] })
		})]
	});
}
var DB_NAME = "naseem-rain";
var CHUNK = 786432;
function regionName(id) {
	return SA_REGIONS.find((region) => region.id === id)?.name ?? "";
}
async function localClips() {
	const db = await openDb();
	return new Promise((resolve) => {
		const request = db.transaction("clips").objectStore("clips").getAll();
		request.onsuccess = () => {
			resolve((request.result ?? []).map((row) => ({
				id: row.id,
				regionId: row.regionId,
				place: row.place,
				level: row.level,
				src: URL.createObjectURL(row.blob),
				caption: row.caption || describeRain(row.level, row.place, regionName(row.regionId)),
				at: row.at || (/* @__PURE__ */ new Date()).toISOString()
			})));
		};
		request.onerror = () => resolve([]);
	});
}
function openDb() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, 1);
		request.onupgradeneeded = () => request.result.createObjectStore("clips", { keyPath: "id" });
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}
async function readJson(response) {
	const text = await response.text();
	if (!text) return { error: "انقطع الاتصال أثناء الرفع. أعد المحاولة." };
	try {
		const data = JSON.parse(text);
		if (!response.ok && !data.error) return { error: "تعذر رفع الفيديو" };
		return data;
	} catch {
		return { error: "تعذر رفع الفيديو" };
	}
}
async function postJson(body) {
	return readJson(await fetch("/api/rain-clips", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body)
	}));
}
async function postChunk(id, offset, body) {
	return readJson(await fetch(`/api/rain-clips?phase=chunk&id=${encodeURIComponent(id)}&offset=${offset}`, {
		method: "POST",
		headers: { "content-type": "application/octet-stream" },
		body
	}));
}
function RainShorts({ regionId }) {
	const [region, setRegion] = (0, import_react.useState)(regionId);
	const [clips, setClips] = (0, import_react.useState)(SEED_CLIPS);
	const [muted, setMuted] = (0, import_react.useState)(true);
	const [upload, setUpload] = (0, import_react.useState)(false);
	const [place, setPlace] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		let dead = false;
		(async () => {
			const local = await localClips().catch(() => []);
			if (dead) return;
			setClips((current) => merge(current, local));
			try {
				const data = await (await fetch("/api/rain-clips")).json();
				if (!dead && Array.isArray(data.clips)) setClips((current) => merge(data.clips ?? [], current.filter((clip) => clip.id.startsWith("local-"))));
			} catch {}
		})();
		return () => {
			dead = true;
		};
	}, []);
	const shown = (0, import_react.useMemo)(() => clips.filter((clip) => clip.regionId === region), [clips, region]);
	const submit = async (file) => {
		setError("");
		if (!file) return;
		if (!place.trim() || place.trim().length < 2) {
			setError("اكتب اسم المكان");
			return;
		}
		const name = file.name || "clip.mov";
		if (!/\.(mov|mp4|m4v|webm|qt)$/i.test(name)) {
			setError("اختر فيديو MOV أو MP4");
			return;
		}
		if (file.size > 251658240 || file.size < 1) {
			setError("الفيديو أكبر من ٢٤٠ ميجا. 4K العادي يمر، أما ProRes فحجمه أكبر من اللازم.");
			return;
		}
		setBusy("يرفع المقطع… 0%");
		try {
			const started = await postJson({
				phase: "start",
				regionId: region,
				place: place.trim(),
				name,
				size: file.size
			});
			const uploadId = started.id;
			if (!uploadId) {
				setBusy("");
				setError(started.error || "تعذر بدء الرفع");
				return;
			}
			for (let offset = 0; offset < file.size; offset += CHUNK) {
				setBusy(`يرفع المقطع… ${Math.min(99, Math.round(offset / file.size * 100))}%`);
				const buf = await file.slice(offset, offset + CHUNK).arrayBuffer();
				let sent = false;
				let reason = "انقطع الرفع. أعد المحاولة.";
				for (let attempt = 0; attempt < 3 && !sent; attempt += 1) {
					const data = await postChunk(uploadId, offset, buf);
					if (!data.error) sent = true;
					else reason = data.error;
				}
				if (!sent) {
					setBusy("");
					setError(reason);
					return;
				}
			}
			setBusy("يحلل المطر…");
			const done = await postJson({
				phase: "finish",
				id: uploadId
			});
			if (!done.clip) {
				setBusy("");
				setError(done.error || "تعذر رفع الفيديو");
				return;
			}
			setClips((current) => merge(current, [done.clip]));
			setUpload(false);
			setPlace("");
			setBusy("");
		} catch {
			setBusy("");
			setError("انقطع الرفع. أعد المحاولة.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rain-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "rain-bar",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "شورتات المطر" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "icon-btn",
					onClick: () => {
						setUpload(true);
						setError("");
					},
					"aria-label": "رفع فيديو مطر",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 18 })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rain-regions",
				children: SA_REGIONS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: item.id === region ? "chip on" : "chip",
					onClick: () => setRegion(item.id),
					children: [item.name, clips.some((clip) => clip.regionId === item.id) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}) : null]
				}, item.id))
			}),
			shown.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rain-empty",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"ما فيه شورتات مطر في ",
					regionName(region),
					" بعد"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "install-entry",
					onClick: () => setUpload(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ارفع فيديو مطر" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "المنطقة والمكان بس، والقوة يحددها التحليل" })]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rain-feed",
				children: shown.map((clip) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rain-slide",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RainVideo, {
						src: clip.src,
						muted
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rain-caption",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: `rain-level ${clip.level}`,
								children: RAIN_LABEL[clip.level]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: clip.place }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: clip.caption }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: formatClipStamp(clip.at) })
						]
					})]
				}, clip.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "rain-sound",
				onClick: () => setMuted((value) => !value),
				"aria-label": muted ? "تشغيل الصوت" : "كتم",
				children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { size: 18 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { size: 18 })
			}),
			upload && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "rain-upload",
				onSubmit: (event) => {
					event.preventDefault();
					const input = event.currentTarget.elements.namedItem("video");
					const file = input instanceof HTMLInputElement ? input.files?.[0] : void 0;
					submit(file);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "رفع فيديو مطر" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["المنطقة", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: region,
						onChange: (event) => setRegion(event.target.value),
						children: SA_REGIONS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: item.id,
							children: item.name
						}, item.id))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["المكان", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: place,
						onChange: (event) => setPlace(event.target.value),
						placeholder: "اسم الحي أو الموقع",
						maxLength: 40,
						required: true
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "file-pick",
						children: ["فيديو المطر", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "video",
							type: "file",
							accept: "video/mp4,video/quicktime,.mov,.mp4,.m4v,video/*",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "muted",
						children: "يقبل MOV من الآيفون و MP4 حتى 4K. الرفع على دفعات، والتحليل بعده مباشرة."
					}),
					busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: busy }),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rain-error",
						children: error
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rain-actions",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => !busy && setUpload(false),
							children: "إلغاء"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: Boolean(busy),
							children: "تحليل ورفع"
						})]
					})
				]
			})
		]
	});
}
function RainVideo({ src, muted }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const node = ref.current;
		if (!node) return;
		const observer = new IntersectionObserver(([entry]) => {
			if (entry?.isIntersecting) node.play().catch(() => void 0);
			else node.pause();
		}, { threshold: .65 });
		observer.observe(node);
		return () => observer.disconnect();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
		ref,
		src,
		playsInline: true,
		muted,
		loop: true,
		preload: "auto"
	});
}
function merge(base, extra) {
	const map = /* @__PURE__ */ new Map();
	for (const clip of [...base, ...extra]) map.set(clip.id, clip);
	return [...map.values()];
}
function RegionsSheet({ open, placeId, onClose, onPick }) {
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "search-sheet",
		role: "dialog",
		"aria-label": "مناطق السعودية",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "search-head",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "icon-btn",
				onClick: onClose,
				"aria-label": "رجوع",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 18 })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "regions-title",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "مناطق السعودية" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "١٣ منطقة إدارية" })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "search-body",
			children: SA_REGIONS.map((region) => {
				const cities = regionCities(region.name, region.placeId);
				const main = cities[0];
				const rest = cities.slice(1);
				const active = cities.some((city) => city.id === placeId);
				if (!main) return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "region-block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: active ? "region-jump on" : "region-jump",
						onClick: () => onPick(main),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: region.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: main.name })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "اختيار" })]
					}), rest.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "region-cities",
						children: rest.map((city) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: city.id === placeId ? "chip on" : "chip",
							"aria-pressed": city.id === placeId,
							onClick: () => onPick(city),
							children: city.name
						}, city.id))
					})]
				}, region.id);
			})
		})]
	});
}
function SearchSheet({ open, favorites, onClose, onPick }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const [remote, setRemote] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const onKey = (event) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			window.removeEventListener("keydown", onKey);
			document.body.style.overflow = previous;
		};
	}, [open, onClose]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const q = query.trim();
		if (q.length < 2) {
			setRemote([]);
			return;
		}
		const ctrl = new AbortController();
		const timer = window.setTimeout(async () => {
			try {
				const response = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
				if (!response.ok) return;
				const data = await response.json();
				setRemote(data.places ?? []);
			} catch {}
		}, 280);
		return () => {
			ctrl.abort();
			window.clearTimeout(timer);
		};
	}, [query, open]);
	const local = (0, import_react.useMemo)(() => filterPlaces(query), [query]);
	const remoteOnly = remote.filter((place) => !local.some((item) => item.name === place.name && Math.abs(item.lat - place.lat) < .2));
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "search-sheet",
		role: "dialog",
		"aria-label": "البحث عن مدينة",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "search-head",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "icon-btn",
				onClick: onClose,
				"aria-label": "رجوع",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 18 })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "search-input",
				value: query,
				onChange: (event) => setQuery(event.target.value),
				placeholder: "ابحث عن مدينة",
				"aria-label": "ابحث عن مدينة",
				autoFocus: true
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "search-body",
			children: [
				query.trim().length < 2 && favorites.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "section-label",
					children: "المفضلة"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "place-list",
					children: favorites.map((place) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceRow, {
						place,
						icon: "star",
						onPick
					}) }, place.id))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "section-label",
						children: query.trim().length < 2 ? "مدن رئيسية" : "نتائج"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "place-list",
						children: [(query.trim().length < 2 ? FEATURED : local).map((place) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceRow, {
							place,
							onPick
						}) }, place.id)), remoteOnly.map((place) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceRow, {
							place,
							onPick
						}) }, place.id))]
					}),
					query.trim().length >= 2 && local.length === 0 && remoteOnly.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "empty-note",
						children: "لا توجد نتائج. جرّب اسماً آخر."
					})
				] }),
				query.trim().length < 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "section-label",
					children: "المزيد"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "place-list",
					children: PLACES.slice(8).map((place) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceRow, {
						place,
						onPick
					}) }, place.id))
				})] })
			]
		})]
	});
}
function PlaceRow({ place, onPick, icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		className: "place-row",
		onClick: () => onPick(place),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: place.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: [place.admin, place.country].filter(Boolean).join(" · ") })] }), icon === "star" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
			size: 16,
			"aria-hidden": "true"
		}) : null]
	});
}
function ringHas(ring, lat, lon) {
	let inside = false;
	for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
		const lonI = ring[i]?.[0] ?? 0;
		const latI = ring[i]?.[1] ?? 0;
		const lonJ = ring[j]?.[0] ?? 0;
		const latJ = ring[j]?.[1] ?? 0;
		if (latI > lat !== latJ > lat && lon < (lonJ - lonI) * (lat - latI) / (latJ - latI || 1e-9) + lonI) inside = !inside;
	}
	return inside;
}
function WindMap({ place, layer, hourIso, field, overlayUrl, overlayKind, accumHours, focus, onBounds, onPick, onRegion, onBrowse, onReady }) {
	const frameRef = (0, import_react.useRef)(null);
	const rootRef = (0, import_react.useRef)(null);
	const labelsRef = (0, import_react.useRef)(null);
	const pinRef = (0, import_react.useRef)(null);
	const labelRef = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	const propsRef = (0, import_react.useRef)({
		place,
		layer,
		hourIso,
		field,
		overlayUrl,
		overlayKind,
		accumHours,
		onBounds,
		onPick,
		onRegion
	});
	propsRef.current = {
		place,
		layer,
		hourIso,
		field,
		overlayUrl,
		overlayKind,
		accumHours,
		onBounds,
		onPick,
		onRegion
	};
	const onReadyRef = (0, import_react.useRef)(onReady);
	onReadyRef.current = onReady;
	const apiRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (labelRef.current) labelRef.current.textContent = place.name;
	}, [place.name]);
	(0, import_react.useEffect)(() => {
		const root = rootRef.current;
		if (!root) return;
		let dead = false;
		let map = null;
		let frame = 0;
		let moveFrame = 0;
		const parts = [];
		let cssW = 0;
		let cssH = 0;
		let panning = false;
		let reduced = false;
		let paintedHour = -1;
		let colorCanvas = null;
		let regionCanvas = null;
		let windCanvas = null;
		let radarCanvas = null;
		const boot = async () => {
			const mod = await import("../_libs/leaflet.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			await Promise.resolve({});
			if (dead || !rootRef.current) return;
			const Leaflet = mod.default ?? mod;
			reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			map = Leaflet.map(root, {
				zoomControl: false,
				attributionControl: true,
				minZoom: 4,
				maxZoom: 12,
				zoomSnap: 1,
				zoomAnimation: false,
				worldCopyJump: false,
				maxBounds: [[-10, 5], [48, 82]],
				maxBoundsViscosity: .45
			});
			map.attributionControl.setPrefix("");
			mapRef.current = map;
			const fitKingdom = (animate) => {
				if (!map) return;
				const h = root.clientHeight || 640;
				const bottom = Math.round(Math.min(Math.max(210, h * .36), 420));
				map.fitBounds([[16.35, 34.5], [32.15, 55.7]], {
					paddingTopLeft: [16, 78],
					paddingBottomRight: [16, bottom],
					animate
				});
			};
			fitKingdom(false);
			Leaflet.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
				attribution: "© Esri",
				maxZoom: 16,
				maxNativeZoom: 16
			}).addTo(map);
			colorCanvas = document.createElement("canvas");
			windCanvas = document.createElement("canvas");
			regionCanvas = document.createElement("canvas");
			radarCanvas = document.createElement("canvas");
			colorCanvas.className = "field-canvas";
			radarCanvas.className = "field-canvas radar-canvas";
			regionCanvas.className = "field-canvas region-canvas";
			windCanvas.className = "field-canvas wind-canvas";
			root.append(colorCanvas, radarCanvas, regionCanvas, windCanvas);
			const labelLayer = labelsRef.current ?? frameRef.current ?? root;
			let regions = [];
			const labelButtons = [];
			const toContainer = (lat, lon) => {
				if (!map) return {
					x: -9999,
					y: -9999
				};
				const point = map.latLngToContainerPoint([lat, lon]);
				return {
					x: point.x,
					y: point.y
				};
			};
			const toLatLng = (x, y) => {
				if (!map) return {
					lat: 0,
					lon: 0
				};
				const point = map.containerPointToLatLng([x, y]);
				return {
					lat: point.lat,
					lon: point.lng
				};
			};
			const resize = () => {
				if (!colorCanvas || !regionCanvas || !windCanvas || !radarCanvas || !root) return;
				const rect = root.getBoundingClientRect();
				cssW = Math.max(1, rect.width);
				cssH = Math.max(1, rect.height);
				const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
				for (const canvas of [
					colorCanvas,
					radarCanvas,
					regionCanvas,
					windCanvas
				]) {
					canvas.width = Math.round(cssW * dpr);
					canvas.height = Math.round(cssH * dpr);
					canvas.style.width = `${cssW}px`;
					canvas.style.height = `${cssH}px`;
					canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
				}
			};
			const placePin = () => {
				const pin = pinRef.current;
				if (!pin || !map) return;
				const spot = propsRef.current.place;
				const pt = toContainer(spot.lat, spot.lon);
				const outside = pt.x < -24 || pt.y < -40 || pt.x > cssW + 24 || pt.y > cssH + 24;
				pin.hidden = outside;
				if (outside) return;
				pin.style.transform = `translate3d(${pt.x}px, ${pt.y}px, 0) translate(-50%, -100%)`;
			};
			let anchor = null;
			const parkCanvases = () => {
				if (!map) return;
				const center = map.getCenter();
				const point = map.latLngToContainerPoint(center);
				anchor = {
					lat: center.lat,
					lng: center.lng,
					x: point.x,
					y: point.y,
					zoom: map.getZoom()
				};
				for (const canvas of [
					colorCanvas,
					radarCanvas,
					regionCanvas,
					windCanvas
				]) if (canvas) canvas.style.transform = "";
			};
			const glideCanvases = () => {
				if (!map || !anchor || map.getZoom() !== anchor.zoom) return;
				const point = map.latLngToContainerPoint([anchor.lat, anchor.lng]);
				const transform = `translate3d(${point.x - anchor.x}px, ${point.y - anchor.y}px, 0)`;
				for (const canvas of [
					colorCanvas,
					radarCanvas,
					regionCanvas,
					windCanvas
				]) if (canvas) canvas.style.transform = transform;
			};
			const placeLabels = () => {
				if (!regions.length) return;
				const spot = propsRef.current.place;
				const boxes = [];
				const chrome = Math.round(Math.min(Math.max(190, cssH * .34), 430));
				regions.forEach((region, index) => {
					const button = labelButtons[index];
					if (!button) return;
					const labelAt = toContainer(region.label[0], region.label[1]);
					const w = button.offsetWidth || 72;
					const h = button.offsetHeight || 28;
					let x = labelAt.x;
					let y = labelAt.y;
					for (let step = 0; step < 6; step += 1) {
						if (!boxes.some((box) => Math.abs(box.x - x) < (box.w + w) / 2 + 6 && Math.abs(box.y - y) < (box.h + h) / 2 + 4)) break;
						const nextY = y + 16;
						if (nextY > cssH - chrome - 8) break;
						y = nextY;
					}
					const shown = x > 18 && y > 70 && x < cssW - 18 && y < cssH - chrome;
					button.hidden = !shown;
					if (!shown) return;
					boxes.push({
						x,
						y,
						w,
						h
					});
					button.classList.toggle("on", region.rings.some((ring) => ringHas(ring, spot.lat, spot.lon)));
					button.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
				});
			};
			const drawRegions = () => {
				const ctx = regionCanvas?.getContext("2d");
				if (!ctx) return;
				ctx.clearRect(0, 0, cssW, cssH);
				if (!regions.length || cssW < 2) {
					placeLabels();
					return;
				}
				const spot = propsRef.current.place;
				ctx.lineJoin = "round";
				regions.forEach((region) => {
					const active = region.rings.some((ring) => ringHas(ring, spot.lat, spot.lon));
					ctx.beginPath();
					for (const ring of region.rings) {
						ring.forEach((point, pointIndex) => {
							const at = toContainer(point[1] ?? 0, point[0] ?? 0);
							if (pointIndex === 0) ctx.moveTo(at.x, at.y);
							else ctx.lineTo(at.x, at.y);
						});
						ctx.closePath();
					}
					ctx.fillStyle = active ? "rgba(230, 211, 163, 0.22)" : "rgba(186, 214, 228, 0.08)";
					ctx.strokeStyle = active ? "rgba(230, 211, 163, 0.95)" : "rgba(236, 242, 247, 0.72)";
					ctx.lineWidth = active ? 2.6 : 1.35;
					ctx.fill();
					ctx.stroke();
				});
				placeLabels();
			};
			const drawColor = () => {
				const ctx = colorCanvas?.getContext("2d");
				if (!ctx) return;
				ctx.clearRect(0, 0, cssW, cssH);
				const current = propsRef.current;
				if (current.overlayKind === "radar") return;
				if (!current.field || cssW < 2) return;
				const index = current.hourIso ? nearestTimeIndex(current.field.times, current.hourIso) : 0;
				const step = cssW > 900 ? 10 : 9;
				for (let y = 0; y < cssH; y += step) for (let x = 0; x < cssW; x += step) {
					const ll = toLatLng(x + step / 2, y + step / 2);
					const sample = sampleField(current.field, ll.lat, ll.lon, index);
					if (!sample) continue;
					const value = current.layer === "accum" ? sampleAccumRain(current.field, ll.lat, ll.lon, current.accumHours) : layerScalar(current.layer, sample);
					if (value == null) continue;
					if ((current.layer === "accum" || current.layer === "rain") && value < .05) continue;
					ctx.fillStyle = colorCss(current.layer, value);
					ctx.fillRect(x, y, step + .6, step + .6);
				}
			};
			const radarImages = /* @__PURE__ */ new Map();
			const drawRadar = () => {
				const ctx = radarCanvas?.getContext("2d");
				if (!ctx || !map) return;
				ctx.clearRect(0, 0, cssW, cssH);
				const current = propsRef.current;
				const template = current.overlayUrl;
				if (!template || current.overlayKind !== "radar" || cssW < 2) return;
				const z = Math.max(2, Math.min(7, Math.floor(map.getZoom())));
				const northWest = map.containerPointToLatLng([-32, -32]);
				const southEast = map.containerPointToLatLng([cssW + 32, cssH + 32]);
				const start = map.project(northWest, z);
				const end = map.project(southEast, z);
				const x0 = Math.floor(start.x / 256);
				const x1 = Math.floor(end.x / 256);
				const y0 = Math.floor(start.y / 256);
				const y1 = Math.floor(end.y / 256);
				ctx.save();
				ctx.globalAlpha = .9;
				for (let x = x0; x <= x1; x += 1) for (let y = y0; y <= y1; y += 1) {
					const url = template.replaceAll("{z}", String(z)).replaceAll("{x}", String(x)).replaceAll("{y}", String(y));
					let image = radarImages.get(url);
					if (!image) {
						image = new Image();
						image.decoding = "async";
						image.onload = () => {
							if (!dead && !panning && propsRef.current.overlayUrl === template) drawRadar();
						};
						image.src = url;
						radarImages.set(url, image);
						if (radarImages.size > 180) {
							const oldest = radarImages.keys().next().value;
							if (oldest) radarImages.delete(oldest);
						}
					}
					if (!image.complete || image.naturalWidth < 2) continue;
					const topLeft = map.latLngToContainerPoint(map.unproject([x * 256, y * 256], z));
					const bottomRight = map.latLngToContainerPoint(map.unproject([(x + 1) * 256, (y + 1) * 256], z));
					ctx.drawImage(image, topLeft.x, topLeft.y, bottomRight.x - topLeft.x + .6, bottomRight.y - topLeft.y + .6);
				}
				ctx.restore();
			};
			const paintWind = (dt) => {
				const ctx = windCanvas?.getContext("2d");
				if (!ctx || cssW < 2) return;
				const current = propsRef.current;
				const index = current.field && current.hourIso ? nearestTimeIndex(current.field.times, current.hourIso) : 0;
				if (panning) {
					ctx.clearRect(0, 0, cssW, cssH);
					return;
				}
				if (current.overlayKind === "radar" || current.layer === "rain" || current.layer === "accum") {
					ctx.clearRect(0, 0, cssW, cssH);
					return;
				}
				if (index !== paintedHour) {
					paintedHour = index;
					drawColor();
				}
				if (panning || reduced || dt === 0) ctx.clearRect(0, 0, cssW, cssH);
				else {
					ctx.globalCompositeOperation = "destination-in";
					ctx.fillStyle = "rgba(0,0,0,0.86)";
					ctx.fillRect(0, 0, cssW, cssH);
					ctx.globalCompositeOperation = "source-over";
				}
				if (!current.field) return;
				const count = Math.round(Math.min(cssW < 700 ? 380 : 820, Math.max(140, cssW * cssH / (cssW < 700 ? 1600 : 900))));
				while (parts.length < count) parts.push({
					lat: 0,
					lon: 0,
					age: 999,
					life: 1
				});
				if (parts.length > count) parts.length = count;
				const buckets = /* @__PURE__ */ new Map();
				for (const part of parts) {
					if (part.age >= part.life || !Number.isFinite(part.lat)) {
						const born = toLatLng(Math.random() * cssW, Math.random() * cssH);
						part.lat = born.lat;
						part.lon = born.lon;
						part.age = 0;
						part.life = 40 + Math.random() * 80;
					}
					const sample = sampleField(current.field, part.lat, part.lon, index);
					const from = toContainer(part.lat, part.lon);
					if (!sample) {
						part.age = part.life;
						continue;
					}
					const speed = Math.hypot(sample.u, sample.v);
					const kmh = speed * 3.6;
					const inv = speed < .15 ? 0 : 1 / speed;
					let dx;
					let dy;
					if (dt <= 0 || reduced) {
						const len = 7 + Math.min(kmh, 70) * .18;
						dx = sample.u * inv * len;
						dy = -sample.v * inv * len;
					} else {
						const px = (10 + Math.min(speed, 22) * 3.1) * dt;
						dx = sample.u * inv * px;
						dy = -sample.v * inv * px;
						const next = toLatLng(from.x + dx, from.y + dy);
						part.lat = next.lat;
						part.lon = next.lon;
						part.age += 1;
					}
					if (from.x < -30 || from.y < -30 || from.x > cssW + 30 || from.y > cssH + 30) {
						part.age = part.life;
						continue;
					}
					const color = current.layer === "wind" ? particleCss(kmh) : "rgba(232,238,243,0.55)";
					const bucket = buckets.get(color) ?? [];
					bucket.push(from.x, from.y, from.x + dx, from.y + dy);
					buckets.set(color, bucket);
				}
				ctx.lineWidth = 1.15;
				ctx.lineCap = "round";
				for (const [color, segs] of buckets) {
					ctx.strokeStyle = color;
					ctx.beginPath();
					for (let i = 0; i < segs.length; i += 4) {
						ctx.moveTo(segs[i] ?? 0, segs[i + 1] ?? 0);
						ctx.lineTo(segs[i + 2] ?? 0, segs[i + 3] ?? 0);
					}
					ctx.stroke();
				}
			};
			const emit = () => {
				if (!map) return;
				const bounds = map.getBounds();
				propsRef.current.onBounds({
					s: bounds.getSouth(),
					w: bounds.getWest(),
					n: bounds.getNorth(),
					e: bounds.getEast()
				});
			};
			resize();
			map.on("movestart", () => {
				panning = true;
			});
			map.on("move", () => {
				if (moveFrame) return;
				moveFrame = requestAnimationFrame(() => {
					moveFrame = 0;
					if (dead) return;
					placePin();
					placeLabels();
					glideCanvases();
				});
			});
			map.on("moveend", () => {
				panning = false;
				if (moveFrame) cancelAnimationFrame(moveFrame);
				moveFrame = 0;
				placePin();
				parkCanvases();
				drawRegions();
				drawColor();
				drawRadar();
				if (reduced) paintWind(0);
				emit();
			});
			map.on("click", (event) => {
				const hit = regions.find((region) => region.rings.some((ring) => ringHas(ring, event.latlng.lat, event.latlng.lng)));
				if (hit) {
					propsRef.current.onRegion(hit.placeId);
					return;
				}
				propsRef.current.onPick(event.latlng.lat, event.latlng.lng);
			});
			const observer = new ResizeObserver(() => {
				map?.invalidateSize();
				resize();
				parkCanvases();
				drawRegions();
				drawColor();
				drawRadar();
				placePin();
			});
			observer.observe(root);
			resize();
			emit();
			placePin();
			drawRegions();
			drawColor();
			drawRadar();
			parkCanvases();
			apiRef.current = {
				draw: () => {
					parkCanvases();
					drawColor();
					drawRadar();
					drawRegions();
					if (reduced) paintWind(0);
					placePin();
				},
				fly: (lat, lon) => {
					if (!map) return;
					const center = map.getCenter();
					const dist = Math.hypot(center.lat - lat, center.lng - lon);
					const zoom = dist > 1.2 ? Math.max(map.getZoom(), 6.5) : map.getZoom();
					if (dist < .04 && Math.abs(map.getZoom() - zoom) < .1) return;
					map.flyTo([lat, lon], Math.min(zoom, 8), { duration: reduced ? 0 : .85 });
				},
				zoom: (delta) => {
					if (!map) return;
					map.setZoom(map.getZoom() + delta);
				},
				fit: () => fitKingdom(true)
			};
			fetch("/saudi-regions.json").then((response) => response.ok ? response.json() : { regions: [] }).then((data) => {
				if (dead) return;
				regions = Array.isArray(data.regions) ? data.regions : [];
				labelLayer.replaceChildren();
				labelButtons.length = 0;
				for (const region of regions) {
					const button = document.createElement("button");
					button.type = "button";
					button.className = "region-label";
					button.textContent = region.name;
					button.addEventListener("click", (event) => {
						event.stopPropagation();
						event.preventDefault();
						propsRef.current.onRegion(region.placeId);
					});
					const keep = (event) => event.stopPropagation();
					button.addEventListener("touchstart", keep, { passive: true });
					button.addEventListener("pointerdown", keep);
					button.addEventListener("mousedown", keep);
					Leaflet.DomEvent.disableClickPropagation(button);
					labelLayer.append(button);
					labelButtons.push(button);
				}
				drawRegions();
			}).catch(() => void 0);
			onReadyRef.current();
			let previous = performance.now();
			const loop = (now) => {
				if (dead) return;
				const dt = Math.min(.05, (now - previous) / 1e3);
				previous = now;
				if (!reduced && !panning) paintWind(dt);
				frame = requestAnimationFrame(loop);
			};
			if (reduced) paintWind(0);
			else frame = requestAnimationFrame(loop);
			return () => observer.disconnect();
		};
		let disconnect;
		boot().then((done) => {
			disconnect = done;
		});
		return () => {
			dead = true;
			cancelAnimationFrame(frame);
			cancelAnimationFrame(moveFrame);
			disconnect?.();
			map?.remove();
			mapRef.current = null;
			colorCanvas?.remove();
			radarCanvas?.remove();
			regionCanvas?.remove();
			windCanvas?.remove();
			apiRef.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		apiRef.current?.draw();
	}, [
		field,
		layer,
		hourIso,
		overlayKind,
		overlayUrl,
		accumHours,
		place.id,
		place.lat,
		place.lon
	]);
	const seenFocus = (0, import_react.useRef)(focus);
	(0, import_react.useEffect)(() => {
		if (seenFocus.current === focus) return;
		seenFocus.current = focus;
		apiRef.current?.fly(place.lat, place.lon);
	}, [
		focus,
		place.lat,
		place.lon
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: frameRef,
		className: "map-frame",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: rootRef,
				className: "map-root",
				role: "img",
				"aria-label": "خريطة الطقس"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: labelsRef,
				className: "region-labels"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: pinRef,
				className: "pin",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					ref: labelRef,
					className: "pin-label",
					children: place.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pin-dot" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "regions-btn",
				onClick: () => {
					apiRef.current?.fit();
					onBrowse();
				},
				children: "كل المناطق"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "zoom",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "icon-btn",
					"aria-label": "تكبير",
					onClick: () => apiRef.current?.zoom(1),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 18 })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "icon-btn",
					"aria-label": "تصغير",
					onClick: () => apiRef.current?.zoom(-1),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { size: 18 })
				})]
			})
		]
	});
}
var LAYERS = [
	{
		id: "wind",
		label: "رياح"
	},
	{
		id: "temp",
		label: "حرارة"
	},
	{
		id: "clouds",
		label: "سحب"
	},
	{
		id: "rain",
		label: "مطر"
	},
	{
		id: "accum",
		label: "تراكمي"
	}
];
var ACCUM_HOURS = [
	24,
	48,
	72
];
function NaseemApp({ initial }) {
	const place = useNaseem((state) => state.place);
	const unit = useNaseem((state) => state.unit);
	const layer = useNaseem((state) => state.layer);
	const favorites = useNaseem((state) => state.favorites);
	const hourIndex = useNaseem((state) => state.hourIndex);
	const focus = useNaseem((state) => state.focus);
	const setPlace = useNaseem((state) => state.setPlace);
	const setUnit = useNaseem((state) => state.setUnit);
	const setLayer = useNaseem((state) => state.setLayer);
	const setHour = useNaseem((state) => state.setHour);
	const toggleFav = useNaseem((state) => state.toggleFav);
	const hydrate = useNaseem((state) => state.hydrate);
	const lang = useNaseem((state) => state.lang);
	const theme = useNaseem((state) => state.theme);
	const vibrate = useNaseem((state) => state.vibrate);
	const notify = useNaseem((state) => state.notify);
	const alertOn = useNaseem((state) => state.alertOn);
	const setLang = useNaseem((state) => state.setLang);
	const setTheme = useNaseem((state) => state.setTheme);
	const setVibrate = useNaseem((state) => state.setVibrate);
	const setNotify = useNaseem((state) => state.setNotify);
	const setAlertOn = useNaseem((state) => state.setAlertOn);
	const [bounds, setBounds] = (0, import_react.useState)(null);
	const [searchOpen, setSearchOpen] = (0, import_react.useState)(false);
	const [regionsOpen, setRegionsOpen] = (0, import_react.useState)(false);
	const [tab, setTab] = (0, import_react.useState)("home");
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [radarPlay, setRadarPlay] = (0, import_react.useState)(true);
	const [locating, setLocating] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)("");
	const [radarFrames, setRadarFrames] = (0, import_react.useState)([]);
	const [radarIndex, setRadarIndex] = (0, import_react.useState)(0);
	const [accumHours, setAccumHours] = (0, import_react.useState)(24);
	const [installOpen, setInstallOpen] = (0, import_react.useState)(false);
	const [installed, setInstalled] = (0, import_react.useState)(false);
	const [installPrompt, setInstallPrompt] = (0, import_react.useState)(null);
	const [rainRegion, setRainRegion] = (0, import_react.useState)("SA-09");
	const [nowIso, setNowIso] = (0, import_react.useState)(initial?.hours[0]?.t ?? "2026-11-10T12:00:00Z");
	(0, import_react.useEffect)(() => {
		hydrate();
		setNowIso((/* @__PURE__ */ new Date()).toISOString());
		const nav = navigator;
		setInstalled(window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true);
		const onPrompt = (event) => {
			event.preventDefault();
			setInstallPrompt(event);
		};
		const onDone = () => {
			setInstalled(true);
			setInstallPrompt(null);
		};
		window.addEventListener("beforeinstallprompt", onPrompt);
		window.addEventListener("appinstalled", onDone);
		return () => {
			window.removeEventListener("beforeinstallprompt", onPrompt);
			window.removeEventListener("appinstalled", onDone);
		};
	}, [hydrate]);
	(0, import_react.useEffect)(() => {
		document.title = `${place.name} — نَسيم`;
	}, [place.name]);
	(0, import_react.useEffect)(() => {
		const root = document.documentElement;
		const rtl = lang === "ar" || lang === "fa" || lang === "ur";
		root.lang = lang === "fa" ? "fa" : lang === "ur" ? "ur" : lang;
		root.dir = rtl ? "rtl" : "ltr";
	}, [lang]);
	(0, import_react.useEffect)(() => {
		const root = document.documentElement;
		if (theme !== "auto") {
			root.dataset.theme = theme === "day" ? "light" : theme === "blue" ? "blue" : "dark";
			return;
		}
		const media = window.matchMedia("(prefers-color-scheme: light)");
		const apply = () => {
			root.dataset.theme = media.matches ? "light" : "dark";
		};
		apply();
		media.addEventListener("change", apply);
		return () => media.removeEventListener("change", apply);
	}, [theme]);
	const onBounds = (0, import_react.useCallback)((next) => {
		const q = quantizeBounds(next);
		setBounds((prev) => prev && prev.s === q.s && prev.w === q.w && prev.n === q.n && prev.e === q.e ? prev : q);
	}, []);
	const forecastQuery = useQuery({
		queryKey: [
			"fx",
			place.lat.toFixed(2),
			place.lon.toFixed(2)
		],
		queryFn: async () => {
			const response = await fetch(`/api/forecast?lat=${place.lat}&lon=${place.lon}`);
			if (!response.ok) throw new Error("forecast");
			return await response.json();
		},
		initialData: place.id === "jeddah" && initial ? initial : void 0,
		staleTime: 6e5
	});
	const fieldQuery = useQuery({
		queryKey: [
			"field",
			"v5",
			bounds?.s,
			bounds?.w,
			bounds?.n,
			bounds?.e
		],
		enabled: Boolean(bounds),
		placeholderData: keepPreviousData,
		staleTime: 9e5,
		queryFn: async ({ queryKey }) => {
			const [, , s, w, n, e] = queryKey;
			const response = await fetch(`/api/field?s=${s}&w=${w}&n=${n}&e=${e}`);
			if (!response.ok) throw new Error("field");
			return response.json();
		}
	});
	(0, import_react.useEffect)(() => {
		if (tab !== "radar") return;
		let dead = false;
		fetch("/api/radar").then((response) => response.json()).then((data) => {
			if (dead) return;
			setRadarFrames(data.frames ?? []);
			setRadarIndex(0);
		}).catch(() => {
			if (!dead) setRadarFrames([]);
		});
		return () => {
			dead = true;
		};
	}, [tab]);
	const hours = forecastQuery.data?.hours ?? [];
	const stepCount = Math.max(1, Math.min(hours.length || 1, fieldQuery.data?.times.length || hours.length || 1));
	const safeIndex = Math.min(hourIndex, stepCount - 1);
	const hourIso = hours[safeIndex]?.t ?? null;
	(0, import_react.useEffect)(() => {
		if (tab !== "map" || layer === "accum" || !playing || stepCount < 2) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const timer = window.setInterval(() => {
			const current = useNaseem.getState().hourIndex;
			setHour((current + 1) % stepCount);
		}, 900);
		return () => window.clearInterval(timer);
	}, [
		playing,
		stepCount,
		setHour,
		tab,
		layer
	]);
	(0, import_react.useEffect)(() => {
		if (tab !== "radar" || !radarPlay || radarFrames.length < 2) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const timer = window.setInterval(() => {
			setRadarIndex((index) => (index + 1) % radarFrames.length);
		}, 700);
		return () => window.clearInterval(timer);
	}, [
		tab,
		radarPlay,
		radarFrames.length
	]);
	const pickResolved = (0, import_react.useCallback)(async (lat, lon, fly) => {
		const token = `${lat.toFixed(3)},${lon.toFixed(3)}`;
		setPlace({
			id: `pin:${token}`,
			name: "موقع محدد",
			admin: "",
			country: "",
			lat,
			lon,
			timezone: place.timezone
		}, { fly });
		try {
			const response = await fetch(`/api/reverse?lat=${lat}&lon=${lon}`);
			if (!response.ok) return;
			const data = await response.json();
			if (!data.place) return;
			const current = useNaseem.getState().place.id;
			if (current !== `pin:${token}` && current !== data.place.id) return;
			setPlace({
				...data.place,
				lat,
				lon
			}, { fly: false });
		} catch {}
	}, [place.timezone, setPlace]);
	const locate = () => {
		if (!navigator.geolocation) {
			setNote("تحديد الموقع غير متاح في هذا المتصفح");
			return;
		}
		setLocating(true);
		navigator.geolocation.getCurrentPosition((position) => {
			setLocating(false);
			pickResolved(position.coords.latitude, position.coords.longitude, true);
		}, () => {
			setLocating(false);
			setNote("تعذر الوصول إلى موقعك");
			window.setTimeout(() => setNote(""), 3200);
		}, {
			enableHighAccuracy: false,
			timeout: 8e3,
			maximumAge: 6e4
		});
	};
	const legend = LEGEND[layer];
	const favored = favorites.some((item) => item.id === place.id);
	const radarFrame = radarFrames[Math.min(radarIndex, Math.max(0, radarFrames.length - 1))] ?? null;
	const overlayKind = tab === "radar" ? "radar" : null;
	const overlayUrl = overlayKind === "radar" ? radarFrame?.url ?? null : null;
	const alertCount = useQuery({
		queryKey: ["ncm-alerts"],
		queryFn: async () => {
			const response = await fetch("/api/region-alerts");
			if (!response.ok) throw new Error("alerts");
			return await response.json();
		},
		staleTime: 3e5,
		refetchInterval: 3e5
	}).data?.alerts?.length ?? 0;
	const openPlace = (next) => {
		setSearchOpen(false);
		setPlace(next);
		setTab("home");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "stage",
				children: [
					tab === "home" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "page",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "page-inner",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "home-bar",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "brand",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
											className: "mark",
											viewBox: "0 0 32 32",
											"aria-hidden": "true",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M5 11h14M5 16h22M5 21h10" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "نَسيم" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "top-actions",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "icon-btn unit-btn",
												onClick: () => setUnit(unit === "c" ? "f" : unit === "f" ? "k" : "c"),
												"aria-label": "تبديل الوحدة",
												children: unit === "k" ? "K" : `°${unit === "c" ? "م" : "ف"}`
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "icon-btn",
												onClick: locate,
												"aria-label": "موقعي",
												disabled: locating,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, {
													size: 18,
													className: locating ? "spin" : void 0
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "icon-btn",
												onClick: () => setSearchOpen(true),
												"aria-label": "بحث",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { size: 18 })
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "regions-entry",
									onClick: () => setRegionsOpen(true),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "مناطق السعودية" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "الـ ١٣ كلها" })]
								}),
								!installed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "install-entry",
									onClick: () => setInstallOpen(true),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "تثبيت نَسيم" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "شرح الإضافة للشاشة" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
									place,
									forecast: forecastQuery.data ?? null,
									loading: forecastQuery.isLoading,
									error: forecastQuery.isError,
									unit,
									hourIndex: safeIndex,
									favored,
									nowIso,
									onHour: (index) => {
										setPlaying(false);
										setHour(index);
									},
									onRetry: () => void forecastQuery.refetch(),
									onFav: () => toggleFav(),
									onPlace: openPlace,
									onSearch: () => setSearchOpen(true)
								})
							]
						})
					}),
					tab === "alerts" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertsScreen, {
						place,
						forecast: forecastQuery.data ?? null,
						lang,
						levels: alertOn,
						vibrate,
						onPlace: openPlace,
						onLevels: setAlertOn,
						onRain: (id) => {
							setRainRegion(id);
							setTab("rain");
						}
					}),
					tab === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsScreen, {
						unit,
						favorites,
						lang,
						theme,
						vibrate,
						notify,
						installed,
						onUnit: setUnit,
						onPlace: openPlace,
						onLang: setLang,
						onTheme: setTheme,
						onVibrate: setVibrate,
						onNotify: setNotify,
						onSearch: () => setSearchOpen(true),
						onInstall: () => setInstallOpen(true)
					}),
					tab === "rain" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RainShorts, { regionId: rainRegion }),
					(tab === "map" || tab === "radar") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "map-stage full",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindMap, {
								place,
								layer,
								hourIso,
								field: fieldQuery.data ?? null,
								overlayUrl,
								overlayKind,
								accumHours,
								focus,
								onBounds,
								onPick: (lat, lon) => void pickResolved(lat, lon, false),
								onRegion: (placeId) => {
									const next = PLACES.find((item) => item.id === placeId);
									if (next) setPlace(next);
								},
								onBrowse: () => setRegionsOpen(true),
								onReady: () => void 0
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
								className: "topbar",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "brand",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
										className: "mark",
										viewBox: "0 0 32 32",
										"aria-hidden": "true",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M5 11h14M5 16h22M5 21h10" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tab === "radar" ? "رادار" : "نَسيم" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "top-actions",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "icon-btn unit-btn",
											onClick: () => setUnit(unit === "c" ? "f" : unit === "f" ? "k" : "c"),
											"aria-label": "تبديل الوحدة",
											children: unit === "k" ? "K" : `°${unit === "c" ? "م" : "ف"}`
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "icon-btn",
											onClick: locate,
											"aria-label": "موقعي",
											disabled: locating,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, {
												size: 18,
												className: locating ? "spin" : void 0
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "icon-btn",
											onClick: () => setSearchOpen(true),
											"aria-label": "بحث",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { size: 18 })
										})
									]
								})]
							}),
							note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "toast",
								children: note
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "map-bottom",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "map-card",
									children: [
										tab === "radar" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "time-row",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "icon-btn sm",
														"aria-label": radarPlay ? "إيقاف الرادار" : "تشغيل الرادار",
														onClick: () => setRadarPlay((value) => !value),
														children: radarPlay ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { size: 16 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 16 })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "time-label",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: radarFrame ? formatClock((/* @__PURE__ */ new Date(radarFrame.time * 1e3)).toISOString(), "Asia/Riyadh") : "—" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "رادار مباشر · آخر ساعتين" })]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "text-btn",
														onClick: () => {
															setRadarPlay(false);
															setRadarIndex(Math.max(0, radarFrames.length - 1));
														},
														children: "الآن"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												className: "time-slider",
												type: "range",
												min: 0,
												max: Math.max(0, radarFrames.length - 1),
												value: Math.min(radarIndex, Math.max(0, radarFrames.length - 1)),
												"aria-label": "زمن الرادار",
												onChange: (event) => {
													setRadarPlay(false);
													setRadarIndex(Number(event.target.value));
												}
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "map-note",
												children: radarFrames.length ? `${radarFrames.length} لقطة كل ١٠ دقائق، بدون توقع` : "جاري جلب الرادار…"
											})
										] }) : layer === "accum" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "time-label",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
												"من الآن إلى ",
												accumHours,
												" ساعة"
											] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: fieldQuery.isFetching ? "تحديث الحقل" : "مجموع المطر المتوقع" })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "layers",
											role: "tablist",
											"aria-label": "مدة المطر التراكمي",
											children: ACCUM_HOURS.map((hoursOption) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												role: "tab",
												"aria-selected": accumHours === hoursOption,
												onClick: () => setAccumHours(hoursOption),
												children: [hoursOption, " ساعة"]
											}, hoursOption))
										})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "time-row",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "icon-btn sm",
													"aria-label": playing ? "إيقاف الحركة" : "تشغيل الزمن",
													onClick: () => setPlaying((value) => !value),
													children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { size: 16 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 16 })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "time-label",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: safeIndex === 0 ? "الآن" : hourIso ? formatWhen(hourIso, place.timezone) : "—" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: fieldQuery.isFetching ? "تحديث الحقل" : legend.label })]
												}),
												safeIndex !== 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "text-btn",
													onClick: () => {
														setPlaying(false);
														setHour(0);
													},
													children: "الآن"
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "time-slider",
											type: "range",
											min: 0,
											max: Math.max(0, stepCount - 1),
											value: safeIndex,
											"aria-label": "زمن التوقع",
											onChange: (event) => {
												setPlaying(false);
												setHour(Number(event.target.value));
											}
										})] }),
										tab === "map" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "layers",
											role: "tablist",
											"aria-label": "طبقات الخريطة",
											children: LAYERS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												role: "tab",
												"aria-selected": layer === item.id,
												onClick: () => setLayer(item.id),
												children: item.label
											}, item.id))
										}),
										tab === "map" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: `legend legend-${layer}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "legend-bar" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "legend-labels",
												children: legend.stops.map((stop) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: stop }, stop))
											})]
										})
									]
								})
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dock, {
				tab,
				alerts: alertCount,
				onTab: setTab
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstallSheet, {
				open: installOpen,
				installed,
				prompt: installPrompt,
				onClose: () => setInstallOpen(false),
				onInstalled: () => {
					setInstalled(true);
					setInstallPrompt(null);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchSheet, {
				open: searchOpen,
				favorites,
				onClose: () => setSearchOpen(false),
				onPick: (next) => {
					setSearchOpen(false);
					setPlace(next);
					if (tab === "alerts" || tab === "settings") setTab("home");
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RegionsSheet, {
				open: regionsOpen,
				placeId: place.id,
				onClose: () => setRegionsOpen(false),
				onPick: (next) => {
					setRegionsOpen(false);
					setPlace(next);
					if (tab === "alerts" || tab === "settings") setTab("home");
				}
			})
		]
	});
}
function Home() {
	const initial = Route$7.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NaseemApp, { initial });
}
//#endregion
export { Home as component };
