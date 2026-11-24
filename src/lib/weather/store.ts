import { create } from "zustand";
import { JEDDAH } from "./cities";
import type { Layer, Place, Units } from "./types";

const KEY = "naseem.v1";

export type Lang = "ar" | "en" | "fr" | "fa" | "ms" | "ur" | "tr" | "es" | "id";
export type ThemeMode = "auto" | "day" | "night" | "blue";
export type AlertFlags = { yellow: boolean; orange: boolean; red: boolean };

type State = {
  place: Place;
  unit: Units;
  layer: Layer;
  favorites: Place[];
  hourIndex: number;
  focus: number;
  hydrated: boolean;
  lang: Lang;
  theme: ThemeMode;
  vibrate: boolean;
  notify: boolean;
  alertOn: AlertFlags;
  setPlace: (place: Place, opts?: { fly?: boolean }) => void;
  setUnit: (unit: Units) => void;
  setLayer: (layer: Layer) => void;
  setHour: (hourIndex: number) => void;
  toggleFav: (place?: Place) => void;
  setLang: (lang: Lang) => void;
  setTheme: (theme: ThemeMode) => void;
  setVibrate: (vibrate: boolean) => void;
  setNotify: (notify: boolean) => void;
  setAlertOn: (alertOn: AlertFlags) => void;
  hydrate: () => void;
};

type Saved = {
  place?: Place;
  unit?: Units;
  layer?: Layer | string;
  favorites?: Place[];
  lang?: Lang;
  theme?: ThemeMode;
  vibrate?: boolean;
  notify?: boolean;
  alertOn?: AlertFlags;
};

const LANGS: Lang[] = ["ar", "en", "fr", "fa", "ms", "ur", "tr", "es", "id"];
const THEMES: ThemeMode[] = ["auto", "day", "night", "blue"];

function asUnit(value: unknown): Units {
  return value === "f" || value === "k" ? value : "c";
}

function asLayer(value: unknown): Layer {
  if (value === "temp" || value === "clouds" || value === "rain" || value === "accum" || value === "wind") return value;
  return "wind";
}

function persist(state: State) {
  if (typeof window === "undefined") return;
  const saved: Saved = {
    place: state.place,
    unit: state.unit,
    layer: state.layer,
    favorites: state.favorites,
    lang: state.lang,
    theme: state.theme,
    vibrate: state.vibrate,
    notify: state.notify,
    alertOn: state.alertOn,
  };
  localStorage.setItem(KEY, JSON.stringify(saved));
}

export const useNaseem = create<State>((set, get) => ({
  place: JEDDAH,
  unit: "c",
  layer: "wind",
  favorites: [],
  hourIndex: 0,
  focus: 0,
  hydrated: false,
  lang: "ar",
  theme: "auto",
  vibrate: false,
  notify: true,
  alertOn: { yellow: true, orange: true, red: true },
  setPlace: (place, opts) => {
    set((state) => ({
      place,
      hourIndex: 0,
      focus: opts?.fly === false ? state.focus : state.focus + 1,
    }));
    persist(get());
  },
  setUnit: (unit) => {
    set({ unit });
    persist(get());
  },
  setLang: (lang) => {
    set({ lang });
    persist(get());
  },
  setTheme: (theme) => {
    set({ theme });
    persist(get());
  },
  setVibrate: (vibrate) => {
    set({ vibrate });
    persist(get());
  },
  setNotify: (notify) => {
    set({ notify });
    persist(get());
  },
  setAlertOn: (alertOn) => {
    set({ alertOn });
    persist(get());
  },
  setLayer: (layer) => {
    set({ layer });
    persist(get());
  },
  setHour: (hourIndex) => set({ hourIndex }),
  toggleFav: (place) => {
    const current = place ?? get().place;
    const favorites = get().favorites.some((item) => item.id === current.id)
      ? get().favorites.filter((item) => item.id !== current.id)
      : [current, ...get().favorites].slice(0, 12);
    set({ favorites });
    persist(get());
  },
  hydrate: () => {
    if (get().hydrated || typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Saved;
        if (saved.place && Number.isFinite(saved.place.lat) && Number.isFinite(saved.place.lon)) {
          const moved = saved.place.id !== get().place.id;
          set({
            place: saved.place,
            unit: asUnit(saved.unit),
            layer: asLayer(saved.layer),
            favorites: Array.isArray(saved.favorites) ? saved.favorites.slice(0, 12) : [],
            lang: LANGS.includes(saved.lang as Lang) ? (saved.lang as Lang) : "ar",
            theme: THEMES.includes(saved.theme as ThemeMode) ? (saved.theme as ThemeMode) : "auto",
            vibrate: saved.vibrate === true,
            notify: saved.notify !== false,
            alertOn: {
              yellow: saved.alertOn?.yellow !== false,
              orange: saved.alertOn?.orange !== false,
              red: saved.alertOn?.red !== false,
            },
            focus: moved ? get().focus + 1 : get().focus,
          });
        }
      }
    } catch {
      /* ignore broken storage */
    }
    set({ hydrated: true });
  },
}));
