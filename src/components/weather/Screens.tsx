import { useEffect, useState } from "react";
import { Bell, Check, ChevronLeft, Globe, Info, Map as MapIcon, MapPin, Send, Smartphone, SunMedium, Thermometer } from "lucide-react";
import { SA_REGIONS } from "@/lib/weather/cities";
import { t } from "@/lib/weather/copy";
import type { AlertLevel } from "@/lib/weather/format";
import type { Lang } from "@/lib/weather/store";
import type { Place, Units } from "@/lib/weather/types";

const EN_NAME: Record<string, string> = {
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
  الجوف: "Jowf",
};

const FILL: Record<AlertLevel, string> = {
  green: "#9dceb4",
  yellow: "#f3e27a",
  orange: "#ef9a3a",
  red: "#e23d3d",
};

type RegionGeom = { id: string; name: string; label: [number, number]; rings: number[][][] };
type LevelRow = { id: string; level: AlertLevel };
type OfficialAlert = {
  id: string;
  regionId: string;
  region: string;
  level: AlertLevel;
  typeName?: string;
  kind: string;
  places: string;
  hazards: string;
  from: string;
  to: string;
  url: string;
};

const X0 = 34.3;
const X1 = 56.3;
const Y0 = 15.9;
const Y1 = 32.7;

function project(lon: number, lat: number): [number, number] {
  return [((lon - X0) / (X1 - X0)) * 1000, ((Y1 - lat) / (Y1 - Y0)) * 820];
}

function regionTitle(name: string): string {
  if (name === "الشرقية") return "المنطقة الشرقية";
  if (name === "الحدود الشمالية") return "الحدود الشمالية";
  return `منطقة ${name}`;
}

function buzz(enabled: boolean) {
  if (!enabled || typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  navigator.vibrate(12);
}

function ncmWhen(value: string): string {
  const parsed = Date.parse(`${value.replace(" ", "T")}+03:00`);
  if (!Number.isFinite(parsed)) return value;
  const date = new Intl.DateTimeFormat("ar", { timeZone: "Asia/Riyadh", day: "numeric", month: "long" }).format(parsed);
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Riyadh", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(parsed);
  return `${date}، ${time}`;
}

function AlertCards({ items }: { items: OfficialAlert[] }) {
  const [open, setOpen] = useState<string | null>(null);
  if (items.length === 0) return <p className="muted">لا توجد تنبيهات حالياً</p>;
  return (
    <>
      {items.map((alert) => {
        const on = open === alert.id;
        return (
          <button key={alert.id} type="button" className={`ncm-alert ${alert.level}${on ? " on" : ""}`} onClick={() => setOpen(on ? null : alert.id)}>
            <span className="ncm-head">
              <MapPin size={18} />
              <strong>{alert.kind}</strong>
            </span>
            {alert.places ? <em>{alert.places}</em> : null}
            <small>من {ncmWhen(alert.from)} إلى {ncmWhen(alert.to)}</small>
            {on ? (
              <span className="ncm-detail">
                <b>نوع الإنذار</b>
                <span>{alert.typeName || alert.kind}</span>
                {alert.hazards ? <p>{alert.hazards}</p> : null}
              </span>
            ) : null}
          </button>
        );
      })}
    </>
  );
}

export function AlertsScreen({
  lang,
  levels,
  vibrate,
  onLevels,
  onRain,
}: {
  place: Place;
  forecast: unknown;
  lang: Lang;
  levels: { yellow: boolean; orange: boolean; red: boolean };
  vibrate: boolean;
  onPlace: (place: Place) => void;
  onLevels: (levels: { yellow: boolean; orange: boolean; red: boolean }) => void;
  onRain: (regionId: string) => void;
}) {
  const [mode, setMode] = useState<"list" | "map">("list");
  const [openAll, setOpenAll] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [legend, setLegend] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rows, setRows] = useState<LevelRow[]>([]);
  const [alerts, setAlerts] = useState<OfficialAlert[]>([]);
  const [geom, setGeom] = useState<RegionGeom[]>([]);

  const [mapRegion, setMapRegion] = useState<string | null>(null);

  useEffect(() => {
    let dead = false;
    const load = () => {
      void fetch("/saudi-regions.json")
        .then((response) => response.json())
        .then((data: { regions?: RegionGeom[] }) => {
          if (!dead) setGeom(Array.isArray(data.regions) ? data.regions : []);
        })
        .catch(() => undefined);
      void fetch(`/api/region-alerts?day=${new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh" }).format(new Date())}`)
        .then((response) => response.json())
        .then((data: { regions?: LevelRow[]; alerts?: OfficialAlert[] }) => {
          if (dead) return;
          if (Array.isArray(data.regions)) setRows(data.regions);
          if (Array.isArray(data.alerts)) setAlerts(data.alerts);
        })
        .catch(() => undefined);
    };
    load();
    const timer = window.setInterval(load, 10 * 60 * 1000);
    return () => {
      dead = true;
      window.clearInterval(timer);
    };
  }, []);

  const levelOf = (id: string): AlertLevel => rows.find((row) => row.id === id)?.level ?? "green";
  const shown = (level: AlertLevel) => level === "green" || levels[level];
  const visible = alerts.filter((alert) => shown(alert.level));
  const view = 1 / zoom;
  const padX = ((1 - view) * 1000) / 2;
  const padY = ((1 - view) * 820) / 2;

  return (
    <div className="page alerts-page">
      <div className="page-inner">
        <h1 className="center-title">{t(lang, "alerts")}</h1>
        <p className="rights">تتحدث يومياً من المركز الوطني للأرصاد</p>
        <div className="mode-switch" role="tablist">
          <button type="button" className={mode === "list" ? "on" : undefined} onClick={() => setMode("list")}>
            <span>{t(lang, "alertList")}</span>
          </button>
          <button type="button" className={mode === "map" ? "on" : undefined} onClick={() => setMode("map")}>
            <span>{t(lang, "alertMap")}</span>
            <MapIcon size={16} />
          </button>
        </div>

        {mode === "list" ? (
          <>
            <section className="pref-card">
              {(["yellow", "orange", "red"] as const).map((key) => (
                <div key={key} className="pref-row">
                  <span className="row-label">
                    {t(lang, key)} <i className={`dot ${key}`} />
                  </span>
                  <button
                    type="button"
                    className={levels[key] ? "gold-switch on" : "gold-switch"}
                    aria-pressed={levels[key]}
                    onClick={() => {
                      buzz(vibrate);
                      onLevels({ ...levels, [key]: !levels[key] });
                    }}
                  />
                </div>
              ))}
            </section>
            <button type="button" className="pref-card link-row" onClick={() => setOpenAll((value) => !value)}>
              <span>{t(lang, "allAlerts")}</span>
              <ChevronLeft size={18} />
            </button>
            {openAll && (
              <div className="note-stack">
                <AlertCards items={visible} />
              </div>
            )}
            {SA_REGIONS.map((region) => {
              const level = levelOf(region.id);
              if (!shown(level)) return null;
              const open = openId === region.id;
              const mine = visible.filter((alert) => alert.regionId === region.id);
              return (
                <div key={region.id} className="pref-card">
                  <button
                    type="button"
                    className="pref-row"
                    onClick={() => {
                      buzz(vibrate);
                      setOpenId(open ? null : region.id);
                    }}
                  >
                    <span className="row-label">
                      {regionTitle(region.name)} <i className={`dot ${level}`} />
                    </span>
                    <ChevronLeft size={18} />
                  </button>
                  {open && (
                    <div className="note-stack in">
                      <button type="button" className="text-btn" onClick={() => onRain(region.id)}>
                        شورتات المطر{region.id === "SA-09" ? " · جازان" : ""}
                      </button>
                      <AlertCards items={mine} />
                    </div>
                  )}
                </div>
              );
            })}
            <p className="rights">
              <a href="https://www.ncm.gov.sa/ar/early-warning" target="_blank" rel="noreferrer">{t(lang, "rights")}</a>
            </p>
          </>
        ) : (
          <div className="alert-map">
            <svg viewBox={`${padX} ${padY} ${1000 * view} ${820 * view}`} role="img" aria-label={t(lang, "alertMap")}>
              {geom.map((region) => (
                <path
                  key={region.id}
                  d={region.rings
                    .map((ring) => ring.map((point, index) => {
                      const [x, y] = project(point[0] ?? 0, point[1] ?? 0);
                      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
                    }).join(" ") + " Z")
                    .join(" ")}
                  fill={shown(levelOf(region.id)) ? FILL[levelOf(region.id)] : "#2a2a2a"}
                  stroke="#1a1a1a"
                  strokeWidth={1.2}
                  onClick={() => {
                    setMapRegion(region.id);
                    buzz(vibrate);
                  }}
                />
              ))}
              {geom.map((region) => {
                const [x, y] = project(region.label[1], region.label[0]);
                return (
                  <text key={`${region.id}-l`} x={x} y={y} textAnchor="middle" className="map-label">
                    <tspan x={x} dy="-0.2em">{EN_NAME[region.name] ?? region.name}</tspan>
                    <tspan x={x} dy="1.15em">{regionTitle(region.name)}</tspan>
                  </text>
                );
              })}
            </svg>
            <div className="map-tools">
              <button type="button" onClick={() => setLegend((value) => !value)} aria-label="مفتاح الألوان">i</button>
              <button type="button" onClick={() => setZoom((value) => Math.min(2.6, value + 0.35))} aria-label="تكبير">+</button>
              <button type="button" onClick={() => setZoom((value) => Math.max(1, value - 0.35))} aria-label="تصغير">−</button>
            </div>
            {legend && (
              <div className="legend-card">
                <p><i className="dot green" /> مستقر</p>
                <p><i className="dot yellow" /> {t(lang, "yellow")}</p>
                <p><i className="dot orange" /> {t(lang, "orange")}</p>
                <p><i className="dot red" /> {t(lang, "red")}</p>
                <p className="muted">{t(lang, "about")}</p>
              </div>
            )}
            {mapRegion && (
              <div className="legend-card ncm-map-note">
                <strong>{regionTitle(SA_REGIONS.find((item) => item.id === mapRegion)?.name ?? "")}</strong>
                {visible.filter((alert) => alert.regionId === mapRegion).length === 0 ? (
                  <p>لا يوجد إنذار اليوم</p>
                ) : visible.filter((alert) => alert.regionId === mapRegion).map((alert) => (
                  <p key={alert.id}><i className={`dot ${alert.level}`} /> {alert.typeName || alert.kind} · {alert.kind}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const LANGS: { id: Lang; label: string }[] = [
  { id: "ar", label: "العربية" },
  { id: "en", label: "English" },
  { id: "fr", label: "Français" },
  { id: "fa", label: "فارسي" },
  { id: "ms", label: "Bahasa Melayu" },
  { id: "ur", label: "اردو" },
  { id: "tr", label: "Türkçe" },
  { id: "es", label: "Español" },
  { id: "id", label: "Bahasa Indonesia" },
];

export function SettingsScreen({
  unit,
  favorites,
  lang,
  theme,
  vibrate,
  notify,
  onUnit,
  onPlace,
  onLang,
  onTheme,
  onVibrate,
  onNotify,
  onSearch,
  onInstall,
}: {
  unit: Units;
  favorites: Place[];
  lang: Lang;
  theme: "auto" | "day" | "night" | "blue";
  vibrate: boolean;
  notify: boolean;
  installed: boolean;
  onUnit: (unit: Units) => void;
  onPlace: (place: Place) => void;
  onLang: (lang: Lang) => void;
  onTheme: (theme: "auto" | "day" | "night" | "blue") => void;
  onVibrate: (value: boolean) => void;
  onNotify: (value: boolean) => void;
  onSearch: () => void;
  onInstall: () => void;
}) {
  const [favOpen, setFavOpen] = useState(false);
  const [about, setAbout] = useState(false);
  const pick = (run: () => void) => {
    buzz(vibrate);
    run();
  };

  return (
    <div className="page settings-page">
      <div className="page-inner">
        <header className="center-title">
          <button type="button" className="info-btn" aria-label="حول الإنذارات" onClick={() => setAbout((value) => !value)}>
            <Info size={18} />
          </button>
          <h1>{t(lang, "settings")}</h1>
        </header>
        {about && <p className="about-line">{t(lang, "about")}</p>}

        <section className="pref-card">
          <div className="pref-head">
            <h2>{t(lang, "favorites")}</h2>
            <Send size={16} />
          </div>
          <button type="button" className="pref-row" onClick={() => setFavOpen((value) => !value)}>
            <span>{t(lang, "manageFav")}</span>
            <ChevronLeft size={18} />
          </button>
          {favOpen && (
            <div className="note-stack in">
              {favorites.length === 0 ? <p className="muted">{t(lang, "emptyFav")}</p> : favorites.map((city) => (
                <button key={city.id} type="button" className="text-btn" onClick={() => onPlace(city)}>{city.name}</button>
              ))}
              <button type="button" className="text-btn" onClick={onSearch}>+</button>
            </div>
          )}
        </section>

        <section className="pref-card">
          <div className="pref-head split">
            <h2>{t(lang, "notifications")} <Bell size={16} /></h2>
            <button type="button" className={notify ? "gold-switch on" : "gold-switch"} aria-pressed={notify} onClick={() => pick(() => onNotify(!notify))} />
          </div>
          {(["yellow", "orange", "red"] as const).map((key) => (
            <div key={key} className="pref-row quiet">
              <span className="row-label">{t(lang, key)} <i className={`dot ${key}`} /></span>
            </div>
          ))}
        </section>

        <section className="pref-card">
          <div className="pref-head">
            <h2>{t(lang, "heat")}</h2>
            <Thermometer size={16} />
          </div>
          {([
            ["c", "celsius"],
            ["f", "fahrenheit"],
            ["k", "kelvin"],
          ] as const).map(([id, key]) => (
            <button key={id} type="button" className="pref-row" onClick={() => pick(() => onUnit(id))}>
              <span>{t(lang, key)}</span>
              {unit === id ? <Check size={18} /> : <span className="tick-gap" />}
            </button>
          ))}
        </section>

        <section className="pref-card">
          <div className="pref-head">
            <h2>{t(lang, "language")}</h2>
            <Globe size={16} />
          </div>
          {LANGS.map((item) => (
            <button key={item.id} type="button" className="pref-row" onClick={() => pick(() => onLang(item.id))}>
              <span>{item.label}</span>
              {lang === item.id ? <Check size={18} /> : <span className="tick-gap" />}
            </button>
          ))}
        </section>

        <section className="pref-card">
          <div className="pref-head">
            <h2>{t(lang, "theme")}</h2>
            <SunMedium size={16} />
          </div>
          {([
            ["auto", "auto"],
            ["day", "day"],
            ["night", "night"],
            ["blue", "blue"],
          ] as const).map(([id, key]) => (
            <button key={id} type="button" className="pref-row" onClick={() => pick(() => onTheme(id))}>
              <span>{t(lang, key)}</span>
              {theme === id ? <Check size={18} /> : <span className="tick-gap" />}
            </button>
          ))}
        </section>

        <section className="pref-card">
          <div className="pref-head split">
            <h2>{t(lang, "vibrate")} <Smartphone size={16} /></h2>
            <button
              type="button"
              className={vibrate ? "gold-switch on" : "gold-switch"}
              aria-pressed={vibrate}
              onClick={() => {
                onVibrate(!vibrate);
                if (!vibrate) buzz(true);
              }}
            />
          </div>
        </section>

        <button type="button" className="pref-card link-row" onClick={onInstall}>
          <span>{t(lang, "install")}</span>
          <ChevronLeft size={18} />
        </button>
        <p className="rights">نَسيم © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
