import {
  curatedFeatured,
  curatedRows,
  type MediaType,
  type Row,
  type Title,
} from "./data";

const KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_KEY;
const BASE = "https://api.themoviedb.org/3";

const GENRES: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  53: "Thriller", 10752: "War", 37: "Western", 10759: "Action", 10762: "Kids",
  10763: "News", 10764: "Reality", 10765: "Sci-Fi", 10766: "Soap",
  10767: "Talk", 10768: "War & Politics",
};

type TmdbItem = {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  vote_average?: number;
  genre_ids?: number[];
};

function toTitle(item: TmdbItem, forced?: MediaType): Title | null {
  const type: MediaType =
    forced ?? (item.media_type === "tv" || (!item.title && item.name) ? "tv" : "movie");
  const name = item.title || item.name;
  if (!name || !item.poster_path) return null;
  const date = item.release_date || item.first_air_date || "";
  const match = item.vote_average
    ? Math.min(99, Math.max(60, Math.round(item.vote_average * 10)))
    : 75;
  const genres = (item.genre_ids ?? [])
    .map((g) => GENRES[g])
    .filter(Boolean)
    .filter((g, i, a) => a.indexOf(g) === i)
    .slice(0, 3);
  return {
    id: `${type}-${item.id}`,
    tmdbId: item.id,
    type,
    name,
    year: date ? Number(date.slice(0, 4)) : 0,
    rating: item.vote_average && item.vote_average > 7.5 ? "U/A 16+" : "U/A 13+",
    duration: type === "movie" ? "Film" : "Series",
    match,
    genres: genres.length ? genres : ["Featured"],
    description: item.overview || "Watch now on dekhly.",
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
  };
}

async function get(path: string): Promise<TmdbItem[]> {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${BASE}${path}${sep}api_key=${KEY}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  const json = (await res.json()) as { results?: TmdbItem[] };
  return json.results ?? [];
}

const dedupe = (titles: Title[]) => {
  const seen = new Set<string>();
  return titles.filter((t) => (seen.has(t.id) ? false : seen.add(t.id)));
};

const shape = (items: TmdbItem[], forced?: MediaType) =>
  dedupe(items.map((i) => toTitle(i, forced)).filter((t): t is Title => !!t));

export async function getCatalog(): Promise<{ featured: Title; rows: Row[] }> {
  if (!KEY) return { featured: curatedFeatured, rows: curatedRows };

  try {
    const [trending, trendingDay, popMovies, popTv, topRated, action, comedy] =
      await Promise.all([
        get("/trending/all/week"),
        // Today's trending in India (movies + series), used for the Top 10.
        get("/trending/all/day?region=IN"),
        get("/movie/popular?region=IN"),
        get("/tv/popular"),
        get("/movie/top_rated"),
        get("/discover/movie?with_genres=28&sort_by=popularity.desc&watch_region=IN"),
        get("/discover/movie?with_genres=35&sort_by=popularity.desc&watch_region=IN"),
      ]);

    const trend = shape(trending);
    const featured = { ...trend[0], badge: "New" as const };

    const rows: Row[] = [
      { id: "trending", title: "Trending Now", titles: trend },
      {
        id: "top10",
        title: "Top 10 in India Today",
        titles: shape(trendingDay)
          .slice(0, 10)
          .map((t) => ({ ...t, badge: "Top 10" as const })),
      },
      { id: "popular", title: "Popular Movies on dekhly", titles: shape(popMovies, "movie") },
      { id: "series", title: "Binge-Worthy Series", titles: shape(popTv, "tv") },
      { id: "action", title: "Adrenaline Rush: Action & Adventure", titles: shape(action, "movie") },
      { id: "acclaimed", title: "Critically Acclaimed", titles: shape(topRated, "movie") },
      { id: "comedy", title: "Laugh Out Loud", titles: shape(comedy, "movie") },
    ].filter((r) => r.titles.length > 0);

    return { featured, rows };
  } catch {
    // Network/key failure — fall back to the offline catalog.
    return { featured: curatedFeatured, rows: curatedRows };
  }
}

export async function searchTitles(query: string): Promise<Title[]> {
  if (!KEY || !query.trim()) return [];
  try {
    const items = await get(`/search/multi?query=${encodeURIComponent(query)}`);
    return shape(items).filter((t) => t.type === "movie" || t.type === "tv");
  } catch {
    return [];
  }
}

/* ---------------- Where to watch (legal) ----------------
   TMDB exposes JustWatch availability per region: which platforms
   stream / rent / buy a title. We never host or embed video — we point
   users to the official platforms. */

export type WatchProvider = {
  providerId: number;
  name: string;
  logoPath: string | null;
};

export type WatchProviders = {
  link: string | null; // JustWatch aggregator page for this title + region
  flatrate: WatchProvider[]; // included with a subscription
  free: WatchProvider[]; // free, no ads
  ads: WatchProvider[]; // free, ad-supported
  rent: WatchProvider[];
  buy: WatchProvider[];
};

const mapProviders = (
  arr: { provider_id: number; provider_name: string; logo_path: string | null }[] = [],
): WatchProvider[] =>
  arr.map((p) => ({
    providerId: p.provider_id,
    name: p.provider_name,
    logoPath: p.logo_path,
  }));

export async function getWatchProviders(
  type: MediaType,
  tmdbId: string | number,
  region = "IN",
): Promise<WatchProviders | null> {
  if (!KEY) return null;
  try {
    const res = await fetch(
      `${BASE}/${type}/${tmdbId}/watch/providers?api_key=${KEY}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      results?: Record<
        string,
        {
          link?: string;
          flatrate?: never[];
          free?: never[];
          ads?: never[];
          rent?: never[];
          buy?: never[];
        }
      >;
    };
    const r = json.results?.[region];
    if (!r) return { link: null, flatrate: [], free: [], ads: [], rent: [], buy: [] };
    return {
      link: r.link ?? null,
      flatrate: mapProviders(r.flatrate),
      free: mapProviders(r.free),
      ads: mapProviders(r.ads),
      rent: mapProviders(r.rent),
      buy: mapProviders(r.buy),
    };
  } catch {
    return null;
  }
}

/* ---------------- Discover (interactive filtering) ----------------
   Powers the JustWatch-style /discover page: filter by genre, platform,
   rating, year and sort order — all server-side so the key stays hidden. */

export const MOVIE_GENRES = [
  { id: 28, name: "Action" }, { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" }, { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" }, { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" }, { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" }, { id: 36, name: "History" },
  { id: 27, name: "Horror" }, { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" }, { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" }, { id: 53, name: "Thriller" },
  { id: 10752, name: "War" }, { id: 37, name: "Western" },
];

export const TV_GENRES = [
  { id: 10759, name: "Action & Adventure" }, { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" }, { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" }, { id: 18, name: "Drama" },
  { id: 10751, name: "Family" }, { id: 10762, name: "Kids" },
  { id: 9648, name: "Mystery" }, { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" }, { id: 37, name: "Western" },
];

export type DiscoverFilters = {
  type: MediaType;
  genres?: number[];
  providers?: number[];
  region?: string;
  sort?: "popular" | "rating" | "newest";
  decade?: number; // e.g. 2020, 2010, 0 for any
  minRating?: number;
  page?: number;
};

const SORT_MAP: Record<MediaType, Record<string, string>> = {
  movie: {
    popular: "popularity.desc",
    rating: "vote_average.desc",
    newest: "primary_release_date.desc",
  },
  tv: {
    popular: "popularity.desc",
    rating: "vote_average.desc",
    newest: "first_air_date.desc",
  },
};

export async function discoverTitles(
  f: DiscoverFilters,
): Promise<{ titles: Title[]; page: number; totalPages: number }> {
  if (!KEY) return { titles: [], page: 1, totalPages: 0 };

  const type = f.type;
  const region = f.region || "IN";
  const params = new URLSearchParams({
    api_key: KEY,
    sort_by: SORT_MAP[type][f.sort || "popular"],
    include_adult: "false",
    "vote_count.gte": f.sort === "rating" ? "200" : "50",
    page: String(f.page || 1),
    watch_region: region,
  });

  if (f.genres?.length) params.set("with_genres", f.genres.join(","));
  if (f.providers?.length) {
    params.set("with_watch_providers", f.providers.join("|"));
  }
  if (f.minRating) params.set("vote_average.gte", String(f.minRating));

  if (f.decade) {
    const dateField = type === "movie" ? "primary_release_date" : "first_air_date";
    params.set(`${dateField}.gte`, `${f.decade}-01-01`);
    params.set(`${dateField}.lte`, `${f.decade + 9}-12-31`);
  }

  try {
    const res = await fetch(`${BASE}/discover/${type}?${params.toString()}`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    const json = (await res.json()) as {
      results?: TmdbItem[];
      page?: number;
      total_pages?: number;
    };
    return {
      titles: shape(json.results ?? [], type),
      page: json.page ?? 1,
      totalPages: Math.min(json.total_pages ?? 1, 500),
    };
  } catch {
    return { titles: [], page: 1, totalPages: 0 };
  }
}

/** Top streaming platforms available in a region (for the platform filter). */
export async function getRegionProviders(
  type: MediaType,
  region = "IN",
): Promise<WatchProvider[]> {
  if (!KEY) return [];
  try {
    const res = await fetch(
      `${BASE}/watch/providers/${type}?watch_region=${region}&api_key=${KEY}`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as {
      results?: {
        provider_id: number;
        provider_name: string;
        logo_path: string | null;
        display_priorities?: Record<string, number>;
      }[];
    };
    return (json.results ?? [])
      .sort(
        (a, b) =>
          (a.display_priorities?.[region] ?? 999) -
          (b.display_priorities?.[region] ?? 999),
      )
      .slice(0, 14)
      .map((p) => ({
        providerId: p.provider_id,
        name: p.provider_name,
        logoPath: p.logo_path,
      }));
  } catch {
    return [];
  }
}

/** Cast + recommendations for a title (used by the detail modal). */
export async function getTitleExtras(
  type: MediaType,
  tmdbId: string | number,
): Promise<{ cast: string[]; director: string; similar: Title[] }> {
  const empty = { cast: [], director: "", similar: [] };
  if (!KEY) return empty;
  try {
    const res = await fetch(
      `${BASE}/${type}/${tmdbId}?append_to_response=credits,recommendations&api_key=${KEY}`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return empty;
    const json = (await res.json()) as {
      credits?: {
        cast?: { name: string }[];
        crew?: { name: string; job: string }[];
      };
      created_by?: { name: string }[];
      recommendations?: { results?: TmdbItem[] };
    };
    const cast = (json.credits?.cast ?? []).slice(0, 5).map((c) => c.name);
    const director =
      json.credits?.crew?.find((c) => c.job === "Director")?.name ||
      json.created_by?.[0]?.name ||
      "";
    const similar = shape(json.recommendations?.results ?? [], type).slice(0, 12);
    return { cast, director, similar };
  } catch {
    return empty;
  }
}

/** Full details for a single title (used by the where-to-watch page). */
export async function getTitleDetails(
  type: MediaType,
  tmdbId: string | number,
): Promise<Title | null> {
  if (!KEY) return null;
  try {
    const res = await fetch(`${BASE}/${type}/${tmdbId}?api_key=${KEY}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const item = (await res.json()) as TmdbItem & {
      genres?: { id: number; name: string }[];
    };
    return toTitle(
      { ...item, genre_ids: (item.genres ?? []).map((g) => g.id) },
      type,
    );
  } catch {
    return null;
  }
}
