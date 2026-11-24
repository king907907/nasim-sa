import { ArrowRight } from "lucide-react";
import { SA_REGIONS, regionCities } from "@/lib/weather/cities";
import type { Place } from "@/lib/weather/types";

export function RegionsSheet({
  open,
  placeId,
  onClose,
  onPick,
}: {
  open: boolean;
  placeId: string;
  onClose: () => void;
  onPick: (place: Place) => void;
}) {
  if (!open) return null;

  return (
    <div className="search-sheet" role="dialog" aria-label="مناطق السعودية">
      <div className="search-head">
        <button type="button" className="icon-btn" onClick={onClose} aria-label="رجوع">
          <ArrowRight size={18} />
        </button>
        <div className="regions-title">
          <strong>مناطق السعودية</strong>
          <small>١٣ منطقة إدارية</small>
        </div>
      </div>
      <div className="search-body">
        {SA_REGIONS.map((region) => {
          const cities = regionCities(region.name, region.placeId);
          const main = cities[0];
          const rest = cities.slice(1);
          const active = cities.some((city) => city.id === placeId);
          if (!main) return null;
          return (
            <section key={region.id} className="region-block">
              <button
                type="button"
                className={active ? "region-jump on" : "region-jump"}
                onClick={() => onPick(main)}
              >
                <span>
                  <strong>{region.name}</strong>
                  <small>{main.name}</small>
                </span>
                <span>اختيار</span>
              </button>
              {rest.length > 0 && (
                <div className="region-cities">
                  {rest.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      className={city.id === placeId ? "chip on" : "chip"}
                      aria-pressed={city.id === placeId}
                      onClick={() => onPick(city)}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
