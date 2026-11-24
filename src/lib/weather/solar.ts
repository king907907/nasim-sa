const PI = Math.PI;
const RAD = PI / 180;
const DAY_MS = 86_400_000;
const J1970 = 2_440_588;
const J2000 = 2_451_545;

function toJulian(date: Date): number {
  return date.getTime() / DAY_MS - 0.5 + J1970;
}

function fromJulian(julian: number): Date {
  return new Date((julian + 0.5 - J1970) * DAY_MS);
}

/** Sunrise and sunset for the calendar day of `date` (pass local noon). */
export function sunTimes(lat: number, lon: number, date: Date): { sunrise: Date; sunset: Date } | null {
  const lw = RAD * -lon;
  const phi = RAD * lat;
  const days = toJulian(date) - J2000;
  const n = Math.round(days - 0.0009 - lw / (2 * PI));
  const ds = 0.0009 + lw / (2 * PI) + n;
  const mean = RAD * (357.5291 + 0.98560028 * ds);
  const lambda = mean + RAD * (1.9148 * Math.sin(mean) + 0.02 * Math.sin(2 * mean) + 102.9372);
  const decl = Math.asin(Math.sin(lambda) * Math.sin(RAD * 23.4397));
  const noon = J2000 + ds + 0.0053 * Math.sin(mean) - 0.0069 * Math.sin(2 * lambda);
  const cosH =
    (Math.sin(RAD * -0.833) - Math.sin(phi) * Math.sin(decl)) / (Math.cos(phi) * Math.cos(decl));
  if (cosH > 1 || cosH < -1 || Number.isNaN(cosH)) return null;
  const hourAngle = Math.acos(cosH);
  return {
    sunrise: fromJulian(noon - hourAngle / (2 * PI)),
    sunset: fromJulian(noon + hourAngle / (2 * PI)),
  };
}
