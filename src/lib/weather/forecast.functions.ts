import { createServerFn } from "@tanstack/react-start";
import { getForecast } from "./met.server";
import type { Forecast } from "./types";

export const loadHomeForecast = createServerFn({ method: "GET" }).handler(async (): Promise<Forecast | null> => {
  try {
    return await getForecast(21.5433, 39.1728);
  } catch (error) {
    console.error("[naseem] home forecast failed", error);
    return null;
  }
});
