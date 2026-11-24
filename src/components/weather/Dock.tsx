import type { ComponentType } from "react";
import { CloudRain, House, Map, Settings, TriangleAlert } from "lucide-react";
import { t } from "@/lib/weather/copy";
import { useNaseem } from "@/lib/weather/store";

export type TabId = "home" | "alerts" | "map" | "radar" | "rain" | "settings";

const TABS: { id: TabId; key: "home" | "alerts" | "maps" | "radar" | "shorts" | "settings"; icon: ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { id: "home", key: "home", icon: House },
  { id: "alerts", key: "alerts", icon: TriangleAlert },
  { id: "map", key: "maps", icon: Map },
  { id: "radar", key: "radar", icon: RadarIcon },
  { id: "rain", key: "shorts", icon: CloudRain },
  { id: "settings", key: "settings", icon: Settings },
];

export function Dock({ tab, alerts, onTab }: { tab: TabId; alerts: number; onTab: (tab: TabId) => void }) {
  const lang = useNaseem((state) => state.lang);
  return (
    <div className="dock-wrap">
      <nav className="dock" aria-label="التنقل">
        {TABS.map((item) => {
          const Icon = item.icon;
          const on = tab === item.id;
          return (
            <button key={item.id} type="button" className={on ? "on" : undefined} aria-current={on ? "page" : undefined} onClick={() => onTab(item.id)}>
              <span className="dock-ico">
                <Icon size={22} strokeWidth={1.75} />
                {item.id === "alerts" && alerts > 0 && <i className="dock-badge">{alerts}</i>}
              </span>
              <span>{t(lang, item.key)}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function RadarIcon({ size = 22, strokeWidth = 1.75 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 12 17 8" />
      <path d="M16.5 5.5a7 7 0 0 1 2 4.2" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}
