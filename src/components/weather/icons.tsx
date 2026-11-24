import {
  ArrowUp,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
} from "lucide-react";
import type { WxIconName } from "@/lib/weather/symbols";

const ICONS = {
  sun: Sun,
  moon: Moon,
  fair: CloudSun,
  partly: CloudSun,
  "night-partly": CloudMoon,
  cloud: Cloud,
  fog: CloudFog,
  rain: CloudRain,
  thunder: CloudLightning,
  snow: CloudSnow,
} as const;

export function WxIcon({ name, size = 22 }: { name: WxIconName; size?: number }) {
  const Icon = ICONS[name];
  return <Icon size={size} strokeWidth={1.75} aria-hidden="true" />;
}

export function WindArrow({ deg, size = 18 }: { deg: number; size?: number }) {
  return (
    <ArrowUp
      size={size}
      strokeWidth={1.75}
      aria-hidden="true"
      style={{ transform: `rotate(${(deg + 180) % 360}deg)` }}
    />
  );
}
