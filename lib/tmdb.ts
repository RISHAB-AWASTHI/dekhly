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
    const [trending, popMovies, popTv, topRated, action, comedy] =
      await Promise.all([
        get("/trending/all/week"),
        get("/movie/popular"),
        get("/tv/popular"),
        get("/movie/top_rated"),
        get("/discover/movie?with_genres=28&sort_by=popularity.desc"),
        get("/discover/movie?with_genres=35&sort_by=popularity.desc"),
      ]);

    const trend = shape(trending);
    const featured = { ...trend[0], badge: "New" as const };

    const rows: Row[] = [
      { id: "trending", title: "Trending Now", titles: trend },
      {
        id: "top10",
        title: "Top 10 in India Today",
        titles: shape(popMovies)
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
