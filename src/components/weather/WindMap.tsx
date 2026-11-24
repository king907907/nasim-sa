import { useEffect, useRef } from "react";
import { Minus, Plus } from "lucide-react";
import { colorCss, layerScalar, particleCss, sampleAccumRain, sampleField } from "@/lib/weather/color";
import { nearestTimeIndex } from "@/lib/weather/format";
import type { Field, Layer, Place } from "@/lib/weather/types";

type Props = {
  place: Place;
  layer: Layer;
  hourIso: string | null;
  field: Field | null;
  overlayUrl: string | null;
  overlayKind: "radar" | null;
  accumHours: number;
  focus: number;
  onBounds: (bounds: { s: number; w: number; n: number; e: number }) => void;
  onPick: (lat: number, lon: number) => void;
  onRegion: (placeId: string) => void;
  onBrowse: () => void;
  onReady: () => void;
};

type Part = { lat: number; lon: number; age: number; life: number };
type Region = {
  id: string;
  name: string;
  placeId: string;
  label: [number, number];
  rings: number[][][];
};

function ringHas(ring: number[][], lat: number, lon: number): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const lonI = ring[i]?.[0] ?? 0;
    const latI = ring[i]?.[1] ?? 0;
    const lonJ = ring[j]?.[0] ?? 0;
    const latJ = ring[j]?.[1] ?? 0;
    const hit = latI > lat !== latJ > lat && lon < ((lonJ - lonI) * (lat - latI)) / (latJ - latI || 1e-9) + lonI;
    if (hit) inside = !inside;
  }
  return inside;
}

export function WindMap({ place, layer, hourIso, field, overlayUrl, overlayKind, accumHours, focus, onBounds, onPick, onRegion, onBrowse, onReady }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const propsRef = useRef({ place, layer, hourIso, field, overlayUrl, overlayKind, accumHours, onBounds, onPick, onRegion });
  propsRef.current = { place, layer, hourIso, field, overlayUrl, overlayKind, accumHours, onBounds, onPick, onRegion };
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const apiRef = useRef<{
    draw: () => void;
    fly: (lat: number, lon: number) => void;
    zoom: (delta: number) => void;
    fit: () => void;
  } | null>(null);

  useEffect(() => {
    if (labelRef.current) labelRef.current.textContent = place.name;
  }, [place.name]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let dead = false;
    let map: import("leaflet").Map | null = null;
    let frame = 0;
    let moveFrame = 0;
    const parts: Part[] = [];
    let cssW = 0;
    let cssH = 0;
    let panning = false;
    let reduced = false;
    let paintedHour = -1;
    let colorCanvas: HTMLCanvasElement | null = null;
    let regionCanvas: HTMLCanvasElement | null = null;
    let windCanvas: HTMLCanvasElement | null = null;
    let radarCanvas: HTMLCanvasElement | null = null;

    const boot = async () => {
      const mod = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (dead || !rootRef.current) return;
      const Leaflet = ((mod as { default?: typeof import("leaflet") }).default ?? mod) as typeof import("leaflet");
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      map = Leaflet.map(root, {
        zoomControl: false,
        attributionControl: true,
        minZoom: 4,
        maxZoom: 12,
        zoomSnap: 1,
        zoomAnimation: false,
        worldCopyJump: false,
        maxBounds: [
          [-10, 5],
          [48, 82],
        ],
        maxBoundsViscosity: 0.45,
      });
      map.attributionControl.setPrefix("");
      mapRef.current = map;
      const fitKingdom = (animate: boolean) => {
        if (!map) return;
        const h = root.clientHeight || 640;
        const bottom = Math.round(Math.min(Math.max(210, h * 0.36), 420));
        map.fitBounds(
          [
            [16.35, 34.5],
            [32.15, 55.7],
          ],
          { paddingTopLeft: [16, 78], paddingBottomRight: [16, bottom], animate },
        );
      };
      fitKingdom(false);
      Leaflet.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
        attribution: "© Esri",
        maxZoom: 16,
        maxNativeZoom: 16,
      }).addTo(map);

      colorCanvas = document.createElement("canvas");
      windCanvas = document.createElement("canvas");
      regionCanvas = document.createElement("canvas");
      radarCanvas = document.createElement("canvas");
      colorCanvas.className = "field-canvas";
      radarCanvas.className = "field-canvas radar-canvas";
      regionCanvas.className = "field-canvas region-canvas";
      windCanvas.className = "field-canvas wind-canvas";
      root.append(colorCanvas, radarCanvas, regionCanvas, windCanvas);
      const labelLayer = labelsRef.current ?? frameRef.current ?? root;
      let regions: Region[] = [];
      const labelButtons: HTMLButtonElement[] = [];

      const toContainer = (lat: number, lon: number) => {
        if (!map) return { x: -9999, y: -9999 };
        const point = map.latLngToContainerPoint([lat, lon]);
        return { x: point.x, y: point.y };
      };
      const toLatLng = (x: number, y: number) => {
        if (!map) return { lat: 0, lon: 0 };
        const point = map.containerPointToLatLng([x, y]);
        return { lat: point.lat, lon: point.lng };
      };
      const resize = () => {
        if (!colorCanvas || !regionCanvas || !windCanvas || !radarCanvas || !root) return;
        const rect = root.getBoundingClientRect();
        cssW = Math.max(1, rect.width);
        cssH = Math.max(1, rect.height);
        const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
        for (const canvas of [colorCanvas, radarCanvas, regionCanvas, windCanvas]) {
          canvas.width = Math.round(cssW * dpr);
          canvas.height = Math.round(cssH * dpr);
          canvas.style.width = `${cssW}px`;
          canvas.style.height = `${cssH}px`;
          canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
      };
      const placePin = () => {
        const pin = pinRef.current;
        if (!pin || !map) return;
        const spot = propsRef.current.place;
        const pt = toContainer(spot.lat, spot.lon);
        const outside = pt.x < -24 || pt.y < -40 || pt.x > cssW + 24 || pt.y > cssH + 24;
        pin.hidden = outside;
        if (outside) return;
        pin.style.transform = `translate3d(${pt.x}px, ${pt.y}px, 0) translate(-50%, -100%)`;
      };
      let anchor: { lat: number; lng: number; x: number; y: number; zoom: number } | null = null;
      const parkCanvases = () => {
        if (!map) return;
        const center = map.getCenter();
        const point = map.latLngToContainerPoint(center);
        anchor = { lat: center.lat, lng: center.lng, x: point.x, y: point.y, zoom: map.getZoom() };
        for (const canvas of [colorCanvas, radarCanvas, regionCanvas, windCanvas]) {
          if (canvas) canvas.style.transform = "";
        }
      };
      const glideCanvases = () => {
        if (!map || !anchor || map.getZoom() !== anchor.zoom) return;
        const point = map.latLngToContainerPoint([anchor.lat, anchor.lng]);
        const transform = `translate3d(${point.x - anchor.x}px, ${point.y - anchor.y}px, 0)`;
        for (const canvas of [colorCanvas, radarCanvas, regionCanvas, windCanvas]) {
          if (canvas) canvas.style.transform = transform;
        }
      };
      const placeLabels = () => {
        if (!regions.length) return;
        const spot = propsRef.current.place;
        const boxes: { x: number; y: number; w: number; h: number }[] = [];
        const chrome = Math.round(Math.min(Math.max(190, cssH * 0.34), 430));
        regions.forEach((region, index) => {
          const button = labelButtons[index];
          if (!button) return;
          const labelAt = toContainer(region.label[0], region.label[1]);
          const w = button.offsetWidth || 72;
          const h = button.offsetHeight || 28;
          let x = labelAt.x;
          let y = labelAt.y;
          for (let step = 0; step < 6; step += 1) {
            const clash = boxes.some((box) => Math.abs(box.x - x) < (box.w + w) / 2 + 6 && Math.abs(box.y - y) < (box.h + h) / 2 + 4);
            if (!clash) break;
            const nextY = y + 16;
            if (nextY > cssH - chrome - 8) break;
            y = nextY;
          }
          const shown = x > 18 && y > 70 && x < cssW - 18 && y < cssH - chrome;
          button.hidden = !shown;
          if (!shown) return;
          boxes.push({ x, y, w, h });
          button.classList.toggle("on", region.rings.some((ring) => ringHas(ring, spot.lat, spot.lon)));
          button.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        });
      };
      const drawRegions = () => {
        const ctx = regionCanvas?.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, cssW, cssH);
        if (!regions.length || cssW < 2) {
          placeLabels();
          return;
        }
        const spot = propsRef.current.place;
        ctx.lineJoin = "round";
        regions.forEach((region) => {
          const active = region.rings.some((ring) => ringHas(ring, spot.lat, spot.lon));
          ctx.beginPath();
          for (const ring of region.rings) {
            ring.forEach((point, pointIndex) => {
              const at = toContainer(point[1] ?? 0, point[0] ?? 0);
              if (pointIndex === 0) ctx.moveTo(at.x, at.y);
              else ctx.lineTo(at.x, at.y);
            });
            ctx.closePath();
          }
          ctx.fillStyle = active ? "rgba(230, 211, 163, 0.22)" : "rgba(186, 214, 228, 0.08)";
          ctx.strokeStyle = active ? "rgba(230, 211, 163, 0.95)" : "rgba(236, 242, 247, 0.72)";
          ctx.lineWidth = active ? 2.6 : 1.35;
          ctx.fill();
          ctx.stroke();
        });
        placeLabels();
      };
      const drawColor = () => {
        const canvas = colorCanvas;
        const ctx = canvas?.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, cssW, cssH);
        const current = propsRef.current;
        if (current.overlayKind === "radar") return;
        if (!current.field || cssW < 2) return;
        const index = current.hourIso ? nearestTimeIndex(current.field.times, current.hourIso) : 0;
        const step = cssW > 900 ? 10 : 9;
        for (let y = 0; y < cssH; y += step) {
          for (let x = 0; x < cssW; x += step) {
            const ll = toLatLng(x + step / 2, y + step / 2);
            const sample = sampleField(current.field, ll.lat, ll.lon, index);
            if (!sample) continue;
            const value =
              current.layer === "accum"
                ? sampleAccumRain(current.field, ll.lat, ll.lon, current.accumHours)
                : layerScalar(current.layer, sample);
            if (value == null) continue;
            if ((current.layer === "accum" || current.layer === "rain") && value < 0.05) continue;
            ctx.fillStyle = colorCss(current.layer, value);
            ctx.fillRect(x, y, step + 0.6, step + 0.6);
          }
        }
      };
      const radarImages = new Map<string, HTMLImageElement>();
      const drawRadar = () => {
        const ctx = radarCanvas?.getContext("2d");
        if (!ctx || !map) return;
        ctx.clearRect(0, 0, cssW, cssH);
        const current = propsRef.current;
        const template = current.overlayUrl;
        if (!template || current.overlayKind !== "radar" || cssW < 2) return;
        const z = Math.max(2, Math.min(7, Math.floor(map.getZoom())));
        const northWest = map.containerPointToLatLng([-32, -32]);
        const southEast = map.containerPointToLatLng([cssW + 32, cssH + 32]);
        const start = map.project(northWest, z);
        const end = map.project(southEast, z);
        const x0 = Math.floor(start.x / 256);
        const x1 = Math.floor(end.x / 256);
        const y0 = Math.floor(start.y / 256);
        const y1 = Math.floor(end.y / 256);
        ctx.save();
        ctx.globalAlpha = 0.9;
        for (let x = x0; x <= x1; x += 1) {
          for (let y = y0; y <= y1; y += 1) {
            const url = template.replaceAll("{z}", String(z)).replaceAll("{x}", String(x)).replaceAll("{y}", String(y));
            let image = radarImages.get(url);
            if (!image) {
              image = new Image();
              image.decoding = "async";
              image.onload = () => {
                if (!dead && !panning && propsRef.current.overlayUrl === template) drawRadar();
              };
              image.src = url;
              radarImages.set(url, image);
              if (radarImages.size > 180) {
                const oldest = radarImages.keys().next().value;
                if (oldest) radarImages.delete(oldest);
              }
            }
            if (!image.complete || image.naturalWidth < 2) continue;
            const topLeft = map.latLngToContainerPoint(map.unproject([x * 256, y * 256], z));
            const bottomRight = map.latLngToContainerPoint(map.unproject([(x + 1) * 256, (y + 1) * 256], z));
            ctx.drawImage(image, topLeft.x, topLeft.y, bottomRight.x - topLeft.x + 0.6, bottomRight.y - topLeft.y + 0.6);
          }
        }
        ctx.restore();
      };
      const paintWind = (dt: number) => {
        const canvas = windCanvas;
        const ctx = canvas?.getContext("2d");
        if (!ctx || cssW < 2) return;
        const current = propsRef.current;
        const index = current.field && current.hourIso ? nearestTimeIndex(current.field.times, current.hourIso) : 0;
        if (panning) {
          ctx.clearRect(0, 0, cssW, cssH);
          return;
        }
        if (current.overlayKind === "radar" || current.layer === "rain" || current.layer === "accum") {
          ctx.clearRect(0, 0, cssW, cssH);
          return;
        }
        if (index !== paintedHour) {
          paintedHour = index;
          drawColor();
        }
        if (panning || reduced || dt === 0) {
          ctx.clearRect(0, 0, cssW, cssH);
        } else {
          ctx.globalCompositeOperation = "destination-in";
          ctx.fillStyle = "rgba(0,0,0,0.86)";
          ctx.fillRect(0, 0, cssW, cssH);
          ctx.globalCompositeOperation = "source-over";
        }
        if (!current.field) return;
        const count = Math.round(Math.min(cssW < 700 ? 380 : 820, Math.max(140, (cssW * cssH) / (cssW < 700 ? 1600 : 900))));
        while (parts.length < count) parts.push({ lat: 0, lon: 0, age: 999, life: 1 });
        if (parts.length > count) parts.length = count;
        const buckets = new Map<string, number[]>();
        for (const part of parts) {
          if (part.age >= part.life || !Number.isFinite(part.lat)) {
            const born = toLatLng(Math.random() * cssW, Math.random() * cssH);
            part.lat = born.lat;
            part.lon = born.lon;
            part.age = 0;
            part.life = 40 + Math.random() * 80;
          }
          const sample = sampleField(current.field, part.lat, part.lon, index);
          const from = toContainer(part.lat, part.lon);
          if (!sample) {
            part.age = part.life;
            continue;
          }
          const speed = Math.hypot(sample.u, sample.v);
          const kmh = speed * 3.6;
          const inv = speed < 0.15 ? 0 : 1 / speed;
          let dx: number;
          let dy: number;
          if (dt <= 0 || reduced) {
            const len = 7 + Math.min(kmh, 70) * 0.18;
            dx = sample.u * inv * len;
            dy = -sample.v * inv * len;
          } else {
            const px = (10 + Math.min(speed, 22) * 3.1) * dt;
            dx = sample.u * inv * px;
            dy = -sample.v * inv * px;
            const next = toLatLng(from.x + dx, from.y + dy);
            part.lat = next.lat;
            part.lon = next.lon;
            part.age += 1;
          }
          if (from.x < -30 || from.y < -30 || from.x > cssW + 30 || from.y > cssH + 30) {
            part.age = part.life;
            continue;
          }
          const color = current.layer === "wind" ? particleCss(kmh) : "rgba(232,238,243,0.55)";
          const bucket = buckets.get(color) ?? [];
          bucket.push(from.x, from.y, from.x + dx, from.y + dy);
          buckets.set(color, bucket);
        }
        ctx.lineWidth = 1.15;
        ctx.lineCap = "round";
        for (const [color, segs] of buckets) {
          ctx.strokeStyle = color;
          ctx.beginPath();
          for (let i = 0; i < segs.length; i += 4) {
            ctx.moveTo(segs[i] ?? 0, segs[i + 1] ?? 0);
            ctx.lineTo(segs[i + 2] ?? 0, segs[i + 3] ?? 0);
          }
          ctx.stroke();
        }
      };

      const emit = () => {
        if (!map) return;
        const bounds = map.getBounds();
        propsRef.current.onBounds({
          s: bounds.getSouth(),
          w: bounds.getWest(),
          n: bounds.getNorth(),
          e: bounds.getEast(),
        });
      };

      resize();
      map.on("movestart", () => {
        panning = true;
      });
      map.on("move", () => {
        if (moveFrame) return;
        moveFrame = requestAnimationFrame(() => {
          moveFrame = 0;
          if (dead) return;
          placePin();
          placeLabels();
          glideCanvases();
        });
      });
      map.on("moveend", () => {
        panning = false;
        if (moveFrame) cancelAnimationFrame(moveFrame);
        moveFrame = 0;
        placePin();
        parkCanvases();
        drawRegions();
        drawColor();
        drawRadar();
        if (reduced) paintWind(0);
        emit();
      });
      map.on("click", (event) => {
        const hit = regions.find((region) => region.rings.some((ring) => ringHas(ring, event.latlng.lat, event.latlng.lng)));
        if (hit) {
          propsRef.current.onRegion(hit.placeId);
          return;
        }
        propsRef.current.onPick(event.latlng.lat, event.latlng.lng);
      });
      const observer = new ResizeObserver(() => {
        map?.invalidateSize();
        resize();
        parkCanvases();
        drawRegions();
        drawColor();
        drawRadar();
        placePin();
      });
      observer.observe(root);
      resize();
      emit();
      placePin();
      drawRegions();
      drawColor();
      drawRadar();
      parkCanvases();
      apiRef.current = {
        draw: () => {
          parkCanvases();
          drawColor();
          drawRadar();
          drawRegions();
          if (reduced) paintWind(0);
          placePin();
        },
        fly: (lat, lon) => {
          if (!map) return;
          const center = map.getCenter();
          const dist = Math.hypot(center.lat - lat, center.lng - lon);
          const zoom = dist > 1.2 ? Math.max(map.getZoom(), 6.5) : map.getZoom();
          if (dist < 0.04 && Math.abs(map.getZoom() - zoom) < 0.1) return;
          map.flyTo([lat, lon], Math.min(zoom, 8), { duration: reduced ? 0 : 0.85 });
        },
        zoom: (delta) => {
          if (!map) return;
          map.setZoom(map.getZoom() + delta);
        },
        fit: () => fitKingdom(true),
      };
      void fetch("/saudi-regions.json")
        .then((response) => (response.ok ? response.json() : { regions: [] }))
        .then((data: { regions?: Region[] }) => {
          if (dead) return;
          regions = Array.isArray(data.regions) ? data.regions : [];
          labelLayer.replaceChildren();
          labelButtons.length = 0;
          for (const region of regions) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "region-label";
            button.textContent = region.name;
            button.addEventListener("click", (event) => {
              event.stopPropagation();
              event.preventDefault();
              propsRef.current.onRegion(region.placeId);
            });
            const keep = (event: Event) => event.stopPropagation();
            button.addEventListener("touchstart", keep, { passive: true });
            button.addEventListener("pointerdown", keep);
            button.addEventListener("mousedown", keep);
            Leaflet.DomEvent.disableClickPropagation(button);
            labelLayer.append(button);
            labelButtons.push(button);
          }
          drawRegions();
        })
        .catch(() => undefined);
      onReadyRef.current();

      let previous = performance.now();
      const loop = (now: number) => {
        if (dead) return;
        const dt = Math.min(0.05, (now - previous) / 1000);
        previous = now;
        if (!reduced && !panning) paintWind(dt);
        frame = requestAnimationFrame(loop);
      };
      if (reduced) paintWind(0);
      else frame = requestAnimationFrame(loop);

      return () => observer.disconnect();
    };

    let disconnect: (() => void) | undefined;
    void boot().then((done) => {
      disconnect = done;
    });

    return () => {
      dead = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(moveFrame);
      disconnect?.();
      map?.remove();
      mapRef.current = null;
      colorCanvas?.remove();
      radarCanvas?.remove();
      regionCanvas?.remove();
      windCanvas?.remove();
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    apiRef.current?.draw();
  }, [field, layer, hourIso, overlayKind, overlayUrl, accumHours, place.id, place.lat, place.lon]);

  const seenFocus = useRef(focus);

  useEffect(() => {
    if (seenFocus.current === focus) return;
    seenFocus.current = focus;
    apiRef.current?.fly(place.lat, place.lon);
  }, [focus, place.lat, place.lon]);

  return (
    <div ref={frameRef} className="map-frame">
      <div ref={rootRef} className="map-root" role="img" aria-label="خريطة الطقس" />
      <div ref={labelsRef} className="region-labels" />
      <div ref={pinRef} className="pin">
        <span ref={labelRef} className="pin-label">
          {place.name}
        </span>
        <span className="pin-dot" />
      </div>
      <button
        type="button"
        className="regions-btn"
        onClick={() => {
          apiRef.current?.fit();
          onBrowse();
        }}
      >
        كل المناطق
      </button>
      <div className="zoom">
        <button type="button" className="icon-btn" aria-label="تكبير" onClick={() => apiRef.current?.zoom(1)}>
          <Plus size={18} />
        </button>
        <button type="button" className="icon-btn" aria-label="تصغير" onClick={() => apiRef.current?.zoom(-1)}>
          <Minus size={18} />
        </button>
      </div>
    </div>
  );
}
