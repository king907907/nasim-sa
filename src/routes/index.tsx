import { createFileRoute } from "@tanstack/react-router";
import { NaseemApp } from "@/components/weather/NaseemApp";
import { loadHomeForecast } from "@/lib/weather/forecast.functions";

export const Route = createFileRoute("/")({
  loader: () => loadHomeForecast(),
  component: Home,
});

function Home() {
  const initial = Route.useLoaderData();
  return <NaseemApp initial={initial} />;
}
