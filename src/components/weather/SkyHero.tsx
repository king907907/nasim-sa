import { ArrowDown, ArrowUp, MapPin, Star, Sunrise, Sunset } from "lucide-react";
import { formatClock, formatStamp, fmt, tempOf } from "@/lib/weather/format";
import { sunTimes } from "@/lib/weather/solar";
import type { SkyKind } from "@/lib/weather/symbols";
import type { Place, Units } from "@/lib/weather/types";

type Props = {
  place: Place;
  whenIso: string;
  temp: number | null;
  short: string;
  sky: SkyKind;
  unit: Units;
  high: number | null;
  low: number | null;
  favored: boolean;
  onFav: () => void;
  onSearch: () => void;
};

export function SkyHero(props: Props) {
  const { place, whenIso, temp, short, sky, unit, high, low, favored, onFav, onSearch } = props;
  const sun = sunArc(place, whenIso);
  const unitLabel = unit === "f" ? "ف" : "م";

  return (
    <section className={`sky sky-${sky}`} aria-label="حالة الطقس">
      <SkyBackdrop sky={sky} />
      <div className="sky-body">
        <div className="sky-top">
          <span />
          <button type="button" className="sky-place" onClick={onSearch}>
            <MapPin size={16} />
            <span>{place.name}</span>
          </button>
          <button
            type="button"
            className={favored ? "icon-btn sm on" : "icon-btn sm sky-fav"}
            aria-pressed={favored}
            aria-label={favored ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
            onClick={onFav}
          >
            <Star size={16} fill={favored ? "currentColor" : "none"} />
          </button>
        </div>
        <p className="sky-when">{formatStamp(whenIso, place.timezone)}</p>
        <div className="sky-hero-row">
          <div className="sky-readout">
            <p className="sky-temp">
              {temp == null ? "—" : fmt(tempOf(temp, unit))}
              <span>°</span>
            </p>
            <p className="sky-cond">
              <span>{short}</span>
              {high != null && low != null && (
                <span className="sky-hl">
                  <ArrowUp size={14} />
                  {fmt(tempOf(high, unit))}
                  <ArrowDown size={14} />
                  {fmt(tempOf(low, unit))}
                  <span className="sr-only">درجة {unitLabel}</span>
                </span>
              )}
            </p>
          </div>
          <SkyArt sky={sky} />
        </div>
        {sun && (
          <>
            <div className="sky-rule" />
            <div className="sun-row">
              <div className="sun-end">
                <span>الشروق</span>
                <Sunrise size={18} />
                <strong>{sun.rise}</strong>
              </div>
              <svg viewBox="0 0 200 78" className="sun-arc" aria-hidden="true">
                <path d="M16 62 A84 58 0 0 1 184 62" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="16" cy="62" r="4" className="arc-end" />
                <circle cx="184" cy="62" r="4" className="arc-end" />
                <g transform={`translate(${sun.x} ${sun.y})`}>
                  <circle r="7" className="arc-sun" />
                  <circle r="11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 3" />
                </g>
              </svg>
              <div className="sun-end">
                <span>الغروب</span>
                <Sunset size={18} />
                <strong>{sun.set}</strong>
              </div>
            </div>
            <p className="sky-daylen">مدة النهار: {sun.length}</p>
          </>
        )}
      </div>
    </section>
  );
}

function sunArc(place: Place, iso: string) {
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
  const mins = Math.max(0, Math.round((set - rise) / 60000));
  const pad = (value: string) => value.replace(/^(\d):/, "0$1:");
  return {
    x: x.toFixed(1),
    y: y.toFixed(1),
    rise: pad(formatClock(sun.sunrise.toISOString(), place.timezone)),
    set: pad(formatClock(sun.sunset.toISOString(), place.timezone)),
    length: `${Math.floor(mins / 60)} ساعة و ${mins % 60} دقيقة`,
  };
}

function SkyBackdrop({ sky }: { sky: SkyKind }) {
  const drops = sky === "rain" || sky === "thunder" ? 22 : sky === "snow" ? 16 : 0;
  return (
    <div className="sky-atmos" aria-hidden="true">
      <span className="sky-orb" />
      {sky === "moon" || sky === "night-partly" ? <Stars /> : null}
      {drops > 0 && (
        <span className="sky-fall">
          {Array.from({ length: drops }, (_, index) => (
            <i
              key={index}
              style={{
                left: `${(index * 37) % 100}%`,
                animationDelay: `${(index % 8) * 0.14}s`,
                animationDuration: sky === "snow" ? `${2.4 + (index % 4) * 0.4}s` : `${0.75 + (index % 5) * 0.08}s`,
              }}
            />
          ))}
        </span>
      )}
      {sky === "thunder" && <span className="sky-flash" />}
      {(sky === "fog" || sky === "cloud") && <span className="sky-mist" />}
    </div>
  );
}

function Stars() {
  return (
    <span className="sky-stars">
      {Array.from({ length: 10 }, (_, index) => (
        <i key={index} style={{ left: `${8 + ((index * 29) % 84)}%`, top: `${8 + ((index * 17) % 42)}%` }} />
      ))}
    </span>
  );
}

function SkyArt({ sky }: { sky: SkyKind }) {
  if (sky === "rain" || sky === "thunder") {
    return (
      <div className="sky-art" aria-hidden="true">
        <CloudPile />
      </div>
    );
  }
  if (sky === "snow" || sky === "cloud" || sky === "fog") {
    return (
      <div className="sky-art" aria-hidden="true">
        <CloudPile pale={sky !== "fog"} />
      </div>
    );
  }
  if (sky === "partly" || sky === "night-partly") {
    return (
      <div className="sky-art" aria-hidden="true">
        {sky === "night-partly" ? <MoonGlyph /> : <SunGlyph />}
        <CloudPile small />
      </div>
    );
  }
  if (sky === "moon") {
    return (
      <div className="sky-art" aria-hidden="true">
        <MoonGlyph />
      </div>
    );
  }
  return (
    <div className="sky-art" aria-hidden="true">
      <SunGlyph />
    </div>
  );
}

function SunGlyph() {
  return (
    <svg className="glyph sun-glyph" viewBox="0 0 80 80">
      <g className="sun-rays">
        {Array.from({ length: 8 }, (_, index) => (
          <circle key={index} cx="40" cy="8" r="2.3" transform={`rotate(${index * 45} 40 40)`} />
        ))}
      </g>
      <circle cx="40" cy="40" r="14" fill="none" stroke="currentColor" strokeWidth="2.4" />
    </svg>
  );
}

function MoonGlyph() {
  return (
    <svg className="glyph" viewBox="0 0 80 80">
      <path
        d="M46 14a22 22 0 1 0 18 32 18 18 0 1 1-18-32z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloudPile({ small, pale }: { small?: boolean; pale?: boolean }) {
  return (
    <svg className={small ? "glyph cloud-glyph small" : "glyph cloud-glyph"} viewBox="0 0 96 64" data-pale={pale ? "1" : "0"}>
      <path
        d="M28 48h44a14 14 0 0 0 1.2-27.9 18 18 0 0 0-34.4-4.2A12 12 0 0 0 28 48z"
        fill="currentColor"
        opacity="0.92"
      />
      <path d="M18 50h36a10 10 0 0 0 .6-19.9 13 13 0 0 0-24.6-2.6A9 9 0 0 0 18 50z" fill="currentColor" />
    </svg>
  );
}
