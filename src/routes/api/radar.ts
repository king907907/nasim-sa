import { createFileRoute } from "@tanstack/react-router";
import { jsonResponse, radarFrames } from "@/lib/weather/met.server";

export const Route = createFileRoute("/api/radar")({
  server: {
    handlers: {
      GET: async () => jsonResponse({ frames: await radarFrames() }),
    },
  },
});
