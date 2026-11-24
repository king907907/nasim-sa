import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Area, Bar, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SA_REGIONS, regionCities } from "@/lib/weather/cities";
import { chartInk } from "@/lib/weather/color";
import {
  blurb,
  buildAlerts,
  buildDays,
  dirName,
  fmt,
  formatHour,
  tempOf,
  uvLabel,
  windKmh,
  windWord,
} from "@/lib/weather/format";
import { symbolMeta } from "@/lib/weather/symbols";
import type { Forecast, Place, Units } from "@/lib/weather/types";
import { WindArrow, WxIcon } from "./icons";
import { SkyHero } from "./SkyHero";

type Props = {
  place: Place;
  forecast: Forecast | null;
  loading: boolean;
  error: boolean;
  unit: Units;
  hourIndex: number;
  favored: boolean;
  nowIso: string;
  onHour: (index: number) => void;
  onRetry: () => void;
  onFav: () => void;
  onPlace: (place: Place) => void;
  onSearch: () => void;
};

export function Panel(props: Props) {
  const { place, forecast, loading, error, unit, favored, nowIso, onHour, onRetry, onFav, onPlace, onSearch } = props;
  const hours = forecast?.hours ?? [];
  const index = Math.min(props.hourIndex, Math.max(0, hours.length - 1));
  const hour = hours[index];
  const days = useMemo(() => buildDays(hours, place.timezone, nowIso), [hours, place.timezone, nowIso]);
  const today = days[0];
  const weekMin = Math.min(...days.map((day) => day.min), hour?.temp ?? 0);
  const weekMax = Math.max(...days.map((day) => day.max), hour?.temp ?? 1);
  const span = Math.max(1, weekMax - weekMin);
  const meta = hour ? symbolMeta(hour.symbol) : null;
  const alerts = hour ? buildAlerts(hour, place) : [];

  return (
    <>
      <SkyHero
        place={place}
        whenIso={index === 0 ? nowIso : (hour?.t ?? nowIso)}
        temp={hour?.temp ?? null}
        short={meta?.short ?? (loading ? "…" : "—")}
        sky={meta?.sky ?? "sun"}
        unit={unit}
        high={today?.max ?? hour?.tmax ?? null}
        low={today?.min ?? hour?.tmin ?? null}
        favored={favored}
        onFav={onFav}
        onSearch={onSearch}
      />

      <div className="region-grid" role="list" aria-label="مناطق السعودية">
        {SA_REGIONS.map((region) => {
          const city = regionCities(region.name, region.placeId)[0];
          if (!city) return null;
          const on = city.id === place.id || place.admin === region.name;
          return (
            <button
              key={region.id}
              type="button"
              className={on ? "chip on" : "chip"}
              aria-pressed={on}
              onClick={() => onPlace(city)}
            >
              {region.name}
            </button>
          );
        })}
      </div>

      {loading && !hour && (
        <div className="hero-block">
          <div className="sk sk-line" />
        </div>
      )}

      {error && !hour && (
        <div className="alert danger">
          <strong>تعذر جلب التوقعات</strong>
          <p>تحقق من الاتصال ثم أعد المحاولة.</p>
          <button type="button" className="text-btn" onClick={onRetry}>
            إعادة المحاولة
          </button>
        </div>
      )}

      {hour && meta && (
        <>
          <p className="blurb">
            {blurb(hour)}
            <span className="muted"> · يشعر كأنّه {fmt(tempOf(hour.feels, unit))}°</span>
          </p>

          {alerts.map((alert) => (
            <div key={alert.title} className={alert.tone === "danger" ? "alert danger" : "alert"}>
              <strong>{alert.title}</strong>
              <p>{alert.detail}</p>
            </div>
          ))}

          <div className="hstrip" role="list">
            {hours.slice(0, 24).map((item, itemIndex) => {
              const itemMeta = symbolMeta(item.symbol);
              const selected = itemIndex === index;
              return (
                <button
                  key={item.t}
                  type="button"
                  className={selected ? "hour on" : "hour"}
                  aria-pressed={selected}
                  onClick={() => onHour(itemIndex)}
                >
                  <span>{itemIndex === 0 ? "الآن" : formatHour(item.t, place.timezone)}</span>
                  <WxIcon name={itemMeta.icon} size={18} />
                  <strong>{fmt(tempOf(item.temp, unit))}°</strong>
                  <small>{item.rain > 0 ? `${fmt(item.rain, 1)} مم` : ""}</small>
                </button>
              );
            })}
          </div>

          <div className="metrics">
            <Metric
              label="الرياح"
              value={`${fmt(windKmh(hour.wind))} كم/س`}
              hint={`${dirName(hour.dir)} · ${windWord(windKmh(hour.wind))}`}
              extra={<WindArrow deg={hour.dir} />}
            />
            <Metric label="الرطوبة" value={`${fmt(hour.rh)}%`} hint="الرطوبة النسبية" />
            <Metric label="الضغط" value={`${fmt(hour.pres)}`} hint="هكتوباسكال" />
            <Metric label="نقطة الندى" value={`${fmt(tempOf(hour.dew, unit))}°`} hint="درجة التكثف" />
            <Metric label="الأشعة" value={fmt(hour.uv, hour.uv < 10 ? 1 : 0)} hint={uvLabel(hour.uv)} />
            <Metric label="الغيوم" value={`${fmt(hour.cloud)}%`} hint="غطاء السحب" />
            <Metric
              label="الهطول"
              value={`${fmt(hour.rain, hour.rain < 10 ? 1 : 0)} مم`}
              hint={hour.span > 1 ? "خلال 6 ساعات" : "خلال ساعة"}
            />
            <Metric label="الضباب" value={`${fmt(hour.fog)}%`} hint="نسبة المساحة الضبابية" />
          </div>

          <section>
            <h2 className="section-label">الأيام القادمة</h2>
            <div className="days">
              {days.map((day) => {
                const dayMeta = symbolMeta(day.symbol);
                const left = ((Math.min(day.min, day.max) - weekMin) / span) * 100;
                const width = Math.max(8, (Math.abs(day.max - day.min) / span) * 100);
                return (
                  <div key={day.key} className="day">
                    <span className="day-name">{day.label}</span>
                    <WxIcon name={dayMeta.icon} size={18} />
                    <span className="day-rain">{day.rain >= 0.2 ? `${fmt(day.rain, 1)}` : ""}</span>
                    <span className="day-track" aria-hidden="true">
                      <span className="day-range" style={{ insetInlineStart: `${left}%`, width: `${width}%` }} />
                    </span>
                    <span className="day-temps">
                      <span>{fmt(tempOf(day.min, unit))}°</span>
                      <strong>{fmt(tempOf(day.max, unit))}°</strong>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="section-label">٢٤ ساعة</h2>
            <TempChart hours={hours.slice(0, 24)} tz={place.timezone} unit={unit} />
          </section>
        </>
      )}

      <p className="credit">التوقعات من MET Norway. الرادار RainViewer. الخريطة © Esri.</p>
    </>
  );
}

function Metric({ label, value, hint, extra }: { label: string; value: string; hint: string; extra?: ReactNode }) {
  return (
    <div className="metric">
      <div className="metric-top">
        <span>{label}</span>
        {extra}
      </div>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  );
}

function TempChart({ hours, tz, unit }: { hours: Forecast["hours"]; tz: string; unit: Units }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const data = hours.map((hour) => ({
    label: formatHour(hour.t, tz),
    temp: Math.round(tempOf(hour.temp, unit)),
    rain: hour.rain,
  }));
  if (!ready) return <div className="chart-box" />;
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 12, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fill: chartInk.muted, fontSize: 11 }} interval={3} axisLine={false} tickLine={false} />
          <YAxis yAxisId="t" hide domain={["dataMin - 2", "dataMax + 2"]} />
          <YAxis yAxisId="r" hide />
          <Tooltip
            cursor={{ stroke: chartInk.line }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const temp = payload.find((item) => item.dataKey === "temp");
              const rain = payload.find((item) => item.dataKey === "rain");
              return (
                <div className="tip">
                  <strong>{label}</strong>
                  <span>{temp ? `${temp.value}°` : ""}</span>
                  <span>{rain && Number(rain.value) > 0 ? `${rain.value} مم` : "بدون هطول"}</span>
                </div>
              );
            }}
          />
          <Bar yAxisId="r" dataKey="rain" fill={chartInk.rain} radius={[3, 3, 0, 0]} barSize={7} />
          <Area
            yAxisId="t"
            dataKey="temp"
            stroke={chartInk.accent}
            fill={chartInk.accent}
            fillOpacity={0.16}
            strokeWidth={2}
            type="monotone"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
