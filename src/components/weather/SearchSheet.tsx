import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import { FEATURED, PLACES, filterPlaces } from "@/lib/weather/cities";
import type { Place } from "@/lib/weather/types";

type Props = {
  open: boolean;
  favorites: Place[];
  onClose: () => void;
  onPick: (place: Place) => void;
};

export function SearchSheet({ open, favorites, onClose, onPick }: Props) {
  const [query, setQuery] = useState("");
  const [remote, setRemote] = useState<Place[]>([]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
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

  useEffect(() => {
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
        const data = (await response.json()) as { places?: Place[] };
        setRemote(data.places ?? []);
      } catch {
        /* aborted */
      }
    }, 280);
    return () => {
      ctrl.abort();
      window.clearTimeout(timer);
    };
  }, [query, open]);

  const local = useMemo(() => filterPlaces(query), [query]);
  const remoteOnly = remote.filter(
    (place) => !local.some((item) => item.name === place.name && Math.abs(item.lat - place.lat) < 0.2),
  );

  if (!open) return null;

  return (
    <div className="search-sheet" role="dialog" aria-label="البحث عن مدينة">
      <div className="search-head">
        <button type="button" className="icon-btn" onClick={onClose} aria-label="رجوع">
          <ArrowRight size={18} />
        </button>
        <input
          className="search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ابحث عن مدينة"
          aria-label="ابحث عن مدينة"
          autoFocus
        />
      </div>
      <div className="search-body">
        {query.trim().length < 2 && favorites.length > 0 && (
          <section>
            <h2 className="section-label">المفضلة</h2>
            <ul className="place-list">
              {favorites.map((place) => (
                <li key={place.id}>
                  <PlaceRow place={place} icon="star" onPick={onPick} />
                </li>
              ))}
            </ul>
          </section>
        )}
        <section>
          <h2 className="section-label">{query.trim().length < 2 ? "مدن رئيسية" : "نتائج"}</h2>
          <ul className="place-list">
            {(query.trim().length < 2 ? FEATURED : local).map((place) => (
              <li key={place.id}>
                <PlaceRow place={place} onPick={onPick} />
              </li>
            ))}
            {remoteOnly.map((place) => (
              <li key={place.id}>
                <PlaceRow place={place} onPick={onPick} />
              </li>
            ))}
          </ul>
          {query.trim().length >= 2 && local.length === 0 && remoteOnly.length === 0 && (
            <p className="empty-note">لا توجد نتائج. جرّب اسماً آخر.</p>
          )}
        </section>
        {query.trim().length < 2 && (
          <section>
            <h2 className="section-label">المزيد</h2>
            <ul className="place-list">
              {PLACES.slice(8).map((place) => (
                <li key={place.id}>
                  <PlaceRow place={place} onPick={onPick} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function PlaceRow({ place, onPick, icon }: { place: Place; onPick: (place: Place) => void; icon?: "star" }) {
  return (
    <button type="button" className="place-row" onClick={() => onPick(place)}>
      <span>
        <strong>{place.name}</strong>
        <small>{[place.admin, place.country].filter(Boolean).join(" · ")}</small>
      </span>
      {icon === "star" ? <Star size={16} aria-hidden="true" /> : null}
    </button>
  );
}
