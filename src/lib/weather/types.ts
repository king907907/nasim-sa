export type Units = "c" | "f" | "k";

export type Layer = "wind" | "temp" | "clouds" | "rain" | "accum";

export type Place = {
  id: string;
  name: string;
  admin: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
};

export type Hour = {
  t: string;
  temp: number;
  feels: number;
  rh: number;
  wind: number;
  dir: number;
  pres: number;
  cloud: number;
  dew: number;
  uv: number;
  fog: number;
  rain: number;
  span: number;
  symbol: string;
  tmin: number;
  tmax: number;
};

export type Forecast = {
  updated: string;
  lat: number;
  lon: number;
  hours: Hour[];
};

export type FieldSample = {
  temp: number;
  u: number;
  v: number;
  rain: number;
  cloud: number;
  pres: number;
};

export type Field = {
  times: string[];
  cols: number;
  rows: number;
  west: number;
  east: number;
  south: number;
  north: number;
  temp: number[][];
  u: number[][];
  v: number[][];
  rain: number[][];
  cloud: number[][];
  pres: number[][];
  span: number[];
};

export type Bounds = { s: number; w: number; n: number; e: number };
