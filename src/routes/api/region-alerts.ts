import { createFileRoute } from "@tanstack/react-router";
import { jsonResponse, regionAlertLevels } from "@/lib/weather/met.server";

export const Route = createFileRoute("/api/region-alerts")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return jsonResponse(await regionAlertLevels());
        } catch (error) {
          console.error("[naseem] region alerts", error);
          return jsonResponse({ error: "alerts failed" }, 502);
        }
      },
    },
  },
});
