import { createFileRoute } from "@tanstack/react-router";
import { jsonResponse, readCoord, reversePlace } from "@/lib/weather/met.server";

export const Route = createFileRoute("/api/reverse")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const lat = readCoord(url.searchParams.get("lat"), -80, 80);
        const lon = readCoord(url.searchParams.get("lon"), -180, 180);
        if (lat == null || lon == null) return jsonResponse({ error: "bad coords" }, 400);
        return jsonResponse({ place: await reversePlace(lat, lon) });
      },
    },
  },
});
