export type WxIconName = "sun" | "moon" | "fair" | "partly" | "night-partly" | "cloud" | "fog" | "rain" | "thunder" | "snow";

export type SkyKind = "sun" | "moon" | "partly" | "night-partly" | "cloud" | "fog" | "rain" | "thunder" | "snow";

export function symbolMeta(code: string): { label: string; short: string; icon: WxIconName; sky: SkyKind } {
  const night = code.includes("night");
  const base = code.replace(/_(day|night|polartwilight)$/, "");
  if (base.includes("thunder")) return { label: "عاصفة رعدية", short: "رعد", icon: "thunder", sky: "thunder" };
  if (base.includes("sleet")) return { label: "مطر ثلجي", short: "ثلج", icon: "snow", sky: "snow" };
  if (base.includes("snow")) return { label: "ثلج", short: "ثلج", icon: "snow", sky: "snow" };
  if (base.includes("heavyrain")) {
    return { label: base.includes("shower") ? "زخات غزيرة" : "مطر غزير", short: "مطر", icon: "rain", sky: "rain" };
  }
  if (base.includes("lightrain") || base.includes("drizzle")) {
    return { label: base.includes("shower") ? "زخات خفيفة" : "مطر خفيف", short: "مطر", icon: "rain", sky: "rain" };
  }
  if (base.includes("rain")) {
    return { label: base.includes("shower") ? "زخات مطر" : "مطر", short: "مطر", icon: "rain", sky: "rain" };
  }
  if (base === "fog") return { label: "ضباب", short: "ضباب", icon: "fog", sky: "fog" };
  if (base === "cloudy") return { label: "غائم", short: "غائم", icon: "cloud", sky: "cloud" };
  if (base === "partlycloudy") {
    return {
      label: "غائم جزئياً",
      short: "غائم جزئياً",
      icon: night ? "night-partly" : "partly",
      sky: night ? "night-partly" : "partly",
    };
  }
  if (base === "fair" || base === "clearsky") {
    return {
      label: night ? "سماء صافية" : "صحو",
      short: "صحو",
      icon: night ? "moon" : "sun",
      sky: night ? "moon" : "sun",
    };
  }
  return { label: "غائم جزئياً", short: "غائم جزئياً", icon: "partly", sky: "partly" };
}
