import type { MediaType } from "./data";

export type EmbedArgs = {
  type: MediaType;
  tmdbId: string | number;
  season?: number;
  episode?: number;
};

export type Provider = {
  id: string;
  name: string;
  adFree?: boolean;
  build: (a: EmbedArgs) => string;
};

// App accent (hex without the leading #). Providers that support theming use it.
const ACCENT = "e11d2a";

export const PROVIDERS: Provider[] = [
  {
    id: "cinesrc",
    name: "CineSrc",
    adFree: true,
    build: ({ type, tmdbId, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://cinesrc.st/embed/movie/${tmdbId}?color=%23${ACCENT}&autoplay=true`
        : `https://cinesrc.st/embed/tv/${tmdbId}?s=${season}&e=${episode}&color=%23${ACCENT}&autoplay=true`,
  },
  {
    id: "rivestream",
    name: "RiveStream",
    build: ({ type, tmdbId, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://rivestream.ru/embed?type=movie&id=${tmdbId}&agg=2`
        : `https://rivestream.ru/embed?type=tv&id=${tmdbId}&season=${season}&episode=${episode}&agg=2`,
  },
  {
    id: "vidcore",
    name: "VidCore",
    build: ({ type, tmdbId, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://vidcore.net/embed/movie/${tmdbId}`
        : `https://vidcore.net/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidzee",
    name: "Vidzee",
    build: ({ type, tmdbId, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://player.vidzee.wtf/embed/movie/${tmdbId}?color=${ACCENT}`
        : `https://player.vidzee.wtf/embed/tv/${tmdbId}/${season}/${episode}?color=${ACCENT}`,
  },
  {
    id: "vidrock",
    name: "VidRock",
    build: ({ type, tmdbId, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://vidrock.ru/embed/movie/${tmdbId}`
        : `https://vidrock.ru/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "nontongo",
    name: "NontonGo",
    build: ({ type, tmdbId, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://www.nontongo.win/embed/movie/${tmdbId}`
        : `https://www.nontongo.win/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidnest",
    name: "VidNest",
    build: ({ type, tmdbId, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://vidnest.fun/movie/${tmdbId}`
        : `https://vidnest.fun/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidking",
    name: "VidKing",
    build: ({ type, tmdbId, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://www.vidking.net/embed/movie/${tmdbId}?color=${ACCENT}`
        : `https://www.vidking.net/embed/tv/${tmdbId}/${season}/${episode}?color=${ACCENT}`,
  },
  {
    id: "peachify",
    name: "Peachify",
    build: ({ type, tmdbId, season = 1, episode = 1 }) =>
      type === "movie"
        ? `https://peachify.top/embed/movie/${tmdbId}?accent=${ACCENT}`
        : `https://peachify.top/embed/tv/${tmdbId}/${season}/${episode}?accent=${ACCENT}`,
  },
];

export const DEFAULT_PROVIDER = PROVIDERS[0];

export const getProvider = (id: string) =>
  PROVIDERS.find((p) => p.id === id) ?? DEFAULT_PROVIDER;
