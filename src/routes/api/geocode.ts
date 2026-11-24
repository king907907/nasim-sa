import { createFileRoute } from "@tanstack/react-router";
import { jsonResponse, searchPlaces } from "@/lib/weather/met.server";

export const Route = createFileRoute("/api/geocode")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const q = new URL(request.url).searchParams.get("q") ?? "";
        if (q.trim().length < 2 || q.length > 60) return jsonResponse({ places: [] });
        return jsonResponse({ places: await searchPlaces(q) });
      },
    },
  },
});
