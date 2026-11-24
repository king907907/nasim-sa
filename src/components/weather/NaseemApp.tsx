import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { LocateFixed, Pause, Play, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PLACES } from "@/lib/weather/cities";
import { LEGEND, quantizeBounds } from "@/lib/weather/color";
import { formatClock, formatWhen } from "@/lib/weather/format";
import { useNaseem } from "@/lib/weather/store";
import type { Bounds, Forecast, Layer, Place } from "@/lib/weather/types";
import { Dock, type TabId } from "./Dock";
import { Panel } from "./Panel";
import { AlertsScreen, SettingsScreen } from "./Screens";
import { InstallSheet, type InstallPrompt } from "./InstallSheet";
import { RainShorts } from "./RainShorts";
import { RegionsSheet } from "./RegionsSheet";
import { SearchSheet } from "./SearchSheet";
import { WindMap } from "./WindMap";

const LAYERS: { id: Layer; label: string }[] = [
  { id: "wind", label: "رياح" },
  { id: "temp", label: "حرارة" },
  { id: "clouds", label: "سحب" },
  { id: "rain", label: "مطر" },
  { id: "accum", label: "تراكمي" },
];

const ACCUM_HOURS = [24, 48, 72] as const;

type RadarFrame = { time: number; url: string };

export function NaseemApp({ initial }: { initial: Forecast | null }) {
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

  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [regionsOpen, setRegionsOpen] = useState(false);
  const [tab, setTab] = useState<TabId>("home");
  const [playing, setPlaying] = useState(false);
  const [radarPlay, setRadarPlay] = useState(true);
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState("");
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([]);
  const [radarIndex, setRadarIndex] = useState(0);
  const [accumHours, setAccumHours] = useState<(typeof ACCUM_HOURS)[number]>(24);
  const [installOpen, setInstallOpen] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  const [rainRegion, setRainRegion] = useState("SA-09");
  const [nowIso, setNowIso] = useState(initial?.hours[0]?.t ?? "2026-11-10T12:00:00Z");

  useEffect(() => {
    hydrate();
    setNowIso(new Date().toISOString());
    const nav = navigator as Navigator & { standalone?: boolean };
    setInstalled(window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPrompt);
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

  useEffect(() => {
    document.title = `${place.name} — نَسيم`;
  }, [place.name]);

  useEffect(() => {
    const root = document.documentElement;
    const rtl = lang === "ar" || lang === "fa" || lang === "ur";
    root.lang = lang === "fa" ? "fa" : lang === "ur" ? "ur" : lang;
    root.dir = rtl ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
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

  const onBounds = useCallback((next: Bounds) => {
    const q = quantizeBounds(next);
    setBounds((prev) => (prev && prev.s === q.s && prev.w === q.w && prev.n === q.n && prev.e === q.e ? prev : q));
  }, []);

  const forecastQuery = useQuery({
    queryKey: ["fx", place.lat.toFixed(2), place.lon.toFixed(2)],
    queryFn: async () => {
      const response = await fetch(`/api/forecast?lat=${place.lat}&lon=${place.lon}`);
      if (!response.ok) throw new Error("forecast");
      return (await response.json()) as Forecast;
    },
    initialData: place.id === "jeddah" && initial ? initial : undefined,
    staleTime: 10 * 60 * 1000,
  });

  const fieldQuery = useQuery({
    queryKey: ["field", "v5", bounds?.s, bounds?.w, bounds?.n, bounds?.e],
    enabled: Boolean(bounds),
    placeholderData: keepPreviousData,
    staleTime: 15 * 60 * 1000,
    queryFn: async ({ queryKey }) => {
      const [, , s, w, n, e] = queryKey;
      const response = await fetch(`/api/field?s=${s}&w=${w}&n=${n}&e=${e}`);
      if (!response.ok) throw new Error("field");
      return response.json();
    },
  });

  useEffect(() => {
    if (tab !== "radar") return;
    let dead = false;
    fetch("/api/radar")
      .then((response) => response.json())
      .then((data: { frames?: RadarFrame[] }) => {
        if (dead) return;
        setRadarFrames(data.frames ?? []);
        setRadarIndex(0);
      })
      .catch(() => {
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

  useEffect(() => {
    if (tab !== "map" || layer === "accum" || !playing || stepCount < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      const current = useNaseem.getState().hourIndex;
      setHour((current + 1) % stepCount);
    }, 900);
    return () => window.clearInterval(timer);
  }, [playing, stepCount, setHour, tab, layer]);

  useEffect(() => {
    if (tab !== "radar" || !radarPlay || radarFrames.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setRadarIndex((index) => (index + 1) % radarFrames.length);
    }, 700);
    return () => window.clearInterval(timer);
  }, [tab, radarPlay, radarFrames.length]);

  const pickResolved = useCallback(
    async (lat: number, lon: number, fly: boolean) => {
      const token = `${lat.toFixed(3)},${lon.toFixed(3)}`;
      setPlace({ id: `pin:${token}`, name: "موقع محدد", admin: "", country: "", lat, lon, timezone: place.timezone }, { fly });
      try {
        const response = await fetch(`/api/reverse?lat=${lat}&lon=${lon}`);
        if (!response.ok) return;
        const data = (await response.json()) as { place?: Place };
        if (!data.place) return;
        const current = useNaseem.getState().place.id;
        if (current !== `pin:${token}` && current !== data.place.id) return;
        setPlace({ ...data.place, lat, lon }, { fly: false });
      } catch {
        /* keep the pin */
      }
    },
    [place.timezone, setPlace],
  );

  const locate = () => {
    if (!navigator.geolocation) {
      setNote("تحديد الموقع غير متاح في هذا المتصفح");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        void pickResolved(position.coords.latitude, position.coords.longitude, true);
      },
      () => {
        setLocating(false);
        setNote("تعذر الوصول إلى موقعك");
        window.setTimeout(() => setNote(""), 3200);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  };

  const legend = LEGEND[layer];
  const favored = favorites.some((item) => item.id === place.id);
  const radarFrame = radarFrames[Math.min(radarIndex, Math.max(0, radarFrames.length - 1))] ?? null;
  const overlayKind = tab === "radar" ? "radar" : null;
  const overlayUrl = overlayKind === "radar" ? (radarFrame?.url ?? null) : null;
  const ncmQuery = useQuery({
    queryKey: ["ncm-alerts"],
    queryFn: async () => {
      const response = await fetch("/api/region-alerts");
      if (!response.ok) throw new Error("alerts");
      return (await response.json()) as { alerts?: { id: string }[] };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
  const alertCount = ncmQuery.data?.alerts?.length ?? 0;

  const openPlace = (next: Place) => {
    setSearchOpen(false);
    setPlace(next);
    setTab("home");
  };

  return (
    <div className="shell">
      <div className="stage">
        {tab === "home" && (
          <div className="page">
            <div className="page-inner">
              <div className="home-bar">
                <div className="brand">
                  <svg className="mark" viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M5 11h14M5 16h22M5 21h10" />
                  </svg>
                  <span>نَسيم</span>
                </div>
                <div className="top-actions">
                  <button type="button" className="icon-btn unit-btn" onClick={() => setUnit(unit === "c" ? "f" : unit === "f" ? "k" : "c")} aria-label="تبديل الوحدة">
                    {unit === "k" ? "K" : `°${unit === "c" ? "م" : "ف"}`}
                  </button>
                  <button type="button" className="icon-btn" onClick={locate} aria-label="موقعي" disabled={locating}>
                    <LocateFixed size={18} className={locating ? "spin" : undefined} />
                  </button>
                  <button type="button" className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="بحث">
                    <Search size={18} />
                  </button>
                </div>
              </div>
              <button type="button" className="regions-entry" onClick={() => setRegionsOpen(true)}>
                <span>مناطق السعودية</span>
                <small>الـ ١٣ كلها</small>
              </button>
              {!installed && (
                <button type="button" className="install-entry" onClick={() => setInstallOpen(true)}>
                  <span>تثبيت نَسيم</span>
                  <small>شرح الإضافة للشاشة</small>
                </button>
              )}
              <Panel
                place={place}
                forecast={forecastQuery.data ?? null}
                loading={forecastQuery.isLoading}
                error={forecastQuery.isError}
                unit={unit}
                hourIndex={safeIndex}
                favored={favored}
                nowIso={nowIso}
                onHour={(index) => {
                  setPlaying(false);
                  setHour(index);
                }}
                onRetry={() => void forecastQuery.refetch()}
                onFav={() => toggleFav()}
                onPlace={openPlace}
                onSearch={() => setSearchOpen(true)}
              />
            </div>
          </div>
        )}

        {tab === "alerts" && (
          <AlertsScreen
            place={place}
            forecast={forecastQuery.data ?? null}
            lang={lang}
            levels={alertOn}
            vibrate={vibrate}
            onPlace={openPlace}
            onLevels={setAlertOn}
            onRain={(id) => {
              setRainRegion(id);
              setTab("rain");
            }}
          />
        )}

        {tab === "settings" && (
          <SettingsScreen
            unit={unit}
            favorites={favorites}
            lang={lang}
            theme={theme}
            vibrate={vibrate}
            notify={notify}
            installed={installed}
            onUnit={setUnit}
            onPlace={openPlace}
            onLang={setLang}
            onTheme={setTheme}
            onVibrate={setVibrate}
            onNotify={setNotify}
            onSearch={() => setSearchOpen(true)}
            onInstall={() => setInstallOpen(true)}
          />
        )}

        {tab === "rain" && <RainShorts regionId={rainRegion} />}

        {(tab === "map" || tab === "radar") && (
          <section className="map-stage full">
            <WindMap
              place={place}
              layer={layer}
              hourIso={hourIso}
              field={fieldQuery.data ?? null}
              overlayUrl={overlayUrl}
              overlayKind={overlayKind}
              accumHours={accumHours}
              focus={focus}
              onBounds={onBounds}
              onPick={(lat, lon) => void pickResolved(lat, lon, false)}
              onRegion={(placeId) => {
                const next = PLACES.find((item) => item.id === placeId);
                if (next) setPlace(next);
              }}
              onBrowse={() => setRegionsOpen(true)}
              onReady={() => undefined}
            />
            <header className="topbar">
              <div className="brand">
                <svg className="mark" viewBox="0 0 32 32" aria-hidden="true">
                  <path d="M5 11h14M5 16h22M5 21h10" />
                </svg>
                <span>{tab === "radar" ? "رادار" : "نَسيم"}</span>
              </div>
              <div className="top-actions">
                <button type="button" className="icon-btn unit-btn" onClick={() => setUnit(unit === "c" ? "f" : unit === "f" ? "k" : "c")} aria-label="تبديل الوحدة">
                  {unit === "k" ? "K" : `°${unit === "c" ? "م" : "ف"}`}
                </button>
                <button type="button" className="icon-btn" onClick={locate} aria-label="موقعي" disabled={locating}>
                  <LocateFixed size={18} className={locating ? "spin" : undefined} />
                </button>
                <button type="button" className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="بحث">
                  <Search size={18} />
                </button>
              </div>
            </header>
            {note && <p className="toast">{note}</p>}
            <div className="map-bottom">
              <div className="map-card">
                {tab === "radar" ? (
                  <>
                    <div className="time-row">
                      <button type="button" className="icon-btn sm" aria-label={radarPlay ? "إيقاف الرادار" : "تشغيل الرادار"} onClick={() => setRadarPlay((value) => !value)}>
                        {radarPlay ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <div className="time-label">
                        <strong>{radarFrame ? formatClock(new Date(radarFrame.time * 1000).toISOString(), "Asia/Riyadh") : "—"}</strong>
                        <span>رادار مباشر · آخر ساعتين</span>
                      </div>
                      <button
                        type="button"
                        className="text-btn"
                        onClick={() => {
                          setRadarPlay(false);
                          setRadarIndex(Math.max(0, radarFrames.length - 1));
                        }}
                      >
                        الآن
                      </button>
                    </div>
                    <input
                      className="time-slider"
                      type="range"
                      min={0}
                      max={Math.max(0, radarFrames.length - 1)}
                      value={Math.min(radarIndex, Math.max(0, radarFrames.length - 1))}
                      aria-label="زمن الرادار"
                      onChange={(event) => {
                        setRadarPlay(false);
                        setRadarIndex(Number(event.target.value));
                      }}
                    />
                    <p className="map-note">{radarFrames.length ? `${radarFrames.length} لقطة كل ١٠ دقائق، بدون توقع` : "جاري جلب الرادار…"}</p>
                  </>
                ) : layer === "accum" ? (
                  <>
                    <div className="time-label">
                      <strong>من الآن إلى {accumHours} ساعة</strong>
                      <span>{fieldQuery.isFetching ? "تحديث الحقل" : "مجموع المطر المتوقع"}</span>
                    </div>
                    <div className="layers" role="tablist" aria-label="مدة المطر التراكمي">
                      {ACCUM_HOURS.map((hoursOption) => (
                        <button key={hoursOption} type="button" role="tab" aria-selected={accumHours === hoursOption} onClick={() => setAccumHours(hoursOption)}>
                          {hoursOption} ساعة
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="time-row">
                      <button type="button" className="icon-btn sm" aria-label={playing ? "إيقاف الحركة" : "تشغيل الزمن"} onClick={() => setPlaying((value) => !value)}>
                        {playing ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <div className="time-label">
                        <strong>{safeIndex === 0 ? "الآن" : hourIso ? formatWhen(hourIso, place.timezone) : "—"}</strong>
                        <span>{fieldQuery.isFetching ? "تحديث الحقل" : legend.label}</span>
                      </div>
                      {safeIndex !== 0 && (
                        <button
                          type="button"
                          className="text-btn"
                          onClick={() => {
                            setPlaying(false);
                            setHour(0);
                          }}
                        >
                          الآن
                        </button>
                      )}
                    </div>
                    <input
                      className="time-slider"
                      type="range"
                      min={0}
                      max={Math.max(0, stepCount - 1)}
                      value={safeIndex}
                      aria-label="زمن التوقع"
                      onChange={(event) => {
                        setPlaying(false);
                        setHour(Number(event.target.value));
                      }}
                    />
                  </>
                )}
                {tab === "map" && (
                  <div className="layers" role="tablist" aria-label="طبقات الخريطة">
                    {LAYERS.map((item) => (
                      <button key={item.id} type="button" role="tab" aria-selected={layer === item.id} onClick={() => setLayer(item.id)}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
                {tab === "map" && (
                  <div className={`legend legend-${layer}`}>
                    <div className="legend-bar" />
                    <div className="legend-labels">
                      {legend.stops.map((stop) => (
                        <span key={stop}>{stop}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
      <Dock tab={tab} alerts={alertCount} onTab={setTab} />
      <InstallSheet
        open={installOpen}
        installed={installed}
        prompt={installPrompt}
        onClose={() => setInstallOpen(false)}
        onInstalled={() => {
          setInstalled(true);
          setInstallPrompt(null);
        }}
      />
      <SearchSheet
        open={searchOpen}
        favorites={favorites}
        onClose={() => setSearchOpen(false)}
        onPick={(next) => {
          setSearchOpen(false);
          setPlace(next);
          if (tab === "alerts" || tab === "settings") setTab("home");
        }}
      />
      <RegionsSheet
        open={regionsOpen}
        placeId={place.id}
        onClose={() => setRegionsOpen(false)}
        onPick={(next) => {
          setRegionsOpen(false);
          setPlace(next);
          if (tab === "alerts" || tab === "settings") setTab("home");
        }}
      />
    </div>
  );
}
