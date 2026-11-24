import { createFileRoute } from "@tanstack/react-router";
import { getField, jsonResponse, readCoord } from "@/lib/weather/met.server";

export const Route = createFileRoute("/api/field")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const s = readCoord(url.searchParams.get("s"), -75, 75);
        const n = readCoord(url.searchParams.get("n"), -75, 75);
        const w = readCoord(url.searchParams.get("w"), -180, 180);
        const e = readCoord(url.searchParams.get("e"), -180, 180);
        if (s == null || n == null || w == null || e == null) return jsonResponse({ error: "bad bounds" }, 400);
        if (Math.abs(n - s) > 50 || Math.abs(e - w) > 50) return jsonResponse({ error: "bounds too wide" }, 400);
        try {
          return jsonResponse(await getField(s, w, n, e));
        } catch (error) {
          console.error("[naseem] field", error);
          return jsonResponse({ error: "field failed" }, 502);
        }
      },
    },
  },
});
