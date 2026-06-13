export type MediaType = "movie" | "tv";

export type Title = {
  id: string; // unique key within the app (e.g. "movie-27205")
  tmdbId: number;
  type: MediaType;
  name: string;
  year: number;
  rating: string; // e.g. "U/A 16+"
  duration: string;
  match: number; // % match
  genres: string[];
  description: string;
  posterPath?: string | null; // TMDB path, when API is configured
  backdropPath?: string | null;
  badge?: "New" | "Top 10" | "Recently added";
  seasons?: number;
};

export type Row = {
  id: string;
  title: string;
  titles: Title[];
};

/* ---------------- Image helpers ---------------- */

export const tmdbImg = (path: string, size: string) =>
  `https://image.tmdb.org/t/p/${size}${path}`;

// Real TMDB art when available, otherwise a deterministic placeholder.
export const posterUrl = (t: Title) =>
  t.posterPath
    ? tmdbImg(t.posterPath, "w500")
    : `https://picsum.photos/seed/${t.tmdbId}p/360/520`;

export const backdropUrl = (t: Title) =>
  t.backdropPath
    ? tmdbImg(t.backdropPath, "w1280")
    : `https://picsum.photos/seed/${t.tmdbId}b/1600/900`;

export const picsumBackdrop = (seed: string) =>
  `https://picsum.photos/seed/${seed}/1600/900`;

// SEO-friendly slug from a title name, e.g. "Dune: Part Two" -> "dune-part-two".
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "title";

// Canonical, indexable detail page for a title.
export const titleHref = (t: Title) =>
  `/title/${t.type}/${t.tmdbId}/${slugify(t.name)}`;

// All "watch" CTAs lead to the rich, SEO-friendly detail page.
export const watchHref = (t: Title) => titleHref(t);

/* ---------------- Curated offline catalog ----------------
   Real TMDB ids so the where-to-watch lookup resolves a real title.
   When a TMDB API key is set, lib/tmdb.ts replaces this with live data
   (including real posters & backdrops). */

const taglines = [
  "Every choice has a price — and the bill just came due.",
  "Some legends are written in blood.",
  "The truth was buried for a reason.",
  "One night. One chance. No turning back.",
  "Not everyone who's lost wants to be found.",
  "Power changes everything — and everyone.",
  "When the world ends, who do you become?",
  "The past never stays where you leave it.",
];

type Seed = [number, MediaType, string, number, string[], number];

function build(seed: Seed): Title {
  const [tmdbId, type, name, year, genres, match] = seed;
  return {
    id: `${type}-${tmdbId}`,
    tmdbId,
    type,
    name,
    year,
    rating: ["U/A 13+", "U/A 16+", "A"][tmdbId % 3],
    duration:
      type === "movie"
        ? `${1 + ((tmdbId % 80) > 40 ? 1 : 0)}h ${20 + (tmdbId % 39)}m`
        : `${1 + (tmdbId % 6)} Season${tmdbId % 6 ? "s" : ""}`,
    match,
    genres,
    description: taglines[tmdbId % taglines.length],
    seasons: type === "tv" ? 1 + (tmdbId % 6) : undefined,
  };
}

const MOVIES: Seed[] = [
  [693134, "movie", "Dune: Part Two", 2024, ["Sci-Fi", "Adventure", "Drama"], 97],
  [27205, "movie", "Inception", 2010, ["Action", "Sci-Fi", "Thriller"], 95],
  [157336, "movie", "Interstellar", 2014, ["Adventure", "Drama", "Sci-Fi"], 96],
  [155, "movie", "The Dark Knight", 2008, ["Action", "Crime", "Drama"], 98],
  [603, "movie", "The Matrix", 1999, ["Action", "Sci-Fi"], 94],
  [872585, "movie", "Oppenheimer", 2023, ["Drama", "History"], 93],
  [475557, "movie", "Joker", 2019, ["Crime", "Drama", "Thriller"], 90],
  [634649, "movie", "Spider-Man: No Way Home", 2021, ["Action", "Adventure"], 92],
  [361743, "movie", "Top Gun: Maverick", 2022, ["Action", "Drama"], 91],
  [299534, "movie", "Avengers: Endgame", 2019, ["Action", "Adventure"], 89],
  [438631, "movie", "Dune", 2021, ["Sci-Fi", "Adventure"], 88],
  [577922, "movie", "Tenet", 2020, ["Action", "Sci-Fi", "Thriller"], 84],
  [76341, "movie", "Mad Max: Fury Road", 2015, ["Action", "Adventure"], 90],
  [245891, "movie", "John Wick", 2014, ["Action", "Thriller"], 87],
  [68718, "movie", "Django Unchained", 2012, ["Drama", "Western"], 91],
  [550, "movie", "Fight Club", 1999, ["Drama", "Thriller"], 95],
  [680, "movie", "Pulp Fiction", 1994, ["Crime", "Thriller"], 96],
  [13, "movie", "Forrest Gump", 1994, ["Drama", "Romance"], 94],
  [278, "movie", "The Shawshank Redemption", 1994, ["Drama", "Crime"], 98],
  [238, "movie", "The Godfather", 1972, ["Drama", "Crime"], 99],
  [346698, "movie", "Barbie", 2023, ["Comedy", "Adventure"], 80],
  [496243, "movie", "Parasite", 2019, ["Thriller", "Drama", "Comedy"], 95],
  [244786, "movie", "Whiplash", 2014, ["Drama", "Music"], 93],
  [19995, "movie", "Avatar", 2009, ["Sci-Fi", "Adventure"], 85],
  [597, "movie", "Titanic", 1997, ["Drama", "Romance"], 88],
];

const SERIES: Seed[] = [
  [1396, "tv", "Breaking Bad", 2008, ["Crime", "Drama", "Thriller"], 98],
  [66732, "tv", "Stranger Things", 2016, ["Sci-Fi", "Mystery", "Drama"], 92],
  [1399, "tv", "Game of Thrones", 2011, ["Drama", "Adventure", "Fantasy"], 94],
  [100088, "tv", "The Last of Us", 2023, ["Drama", "Sci-Fi", "Thriller"], 90],
  [119051, "tv", "Wednesday", 2022, ["Comedy", "Mystery"], 86],
  [71446, "tv", "Money Heist", 2017, ["Crime", "Drama"], 89],
  [70523, "tv", "Dark", 2017, ["Sci-Fi", "Mystery", "Thriller"], 93],
  [71912, "tv", "The Witcher", 2019, ["Action", "Adventure", "Fantasy"], 82],
  [84958, "tv", "Loki", 2021, ["Sci-Fi", "Adventure"], 88],
  [93405, "tv", "Squid Game", 2021, ["Drama", "Mystery", "Thriller"], 87],
  [60574, "tv", "Peaky Blinders", 2013, ["Crime", "Drama"], 91],
  [76479, "tv", "The Boys", 2019, ["Action", "Sci-Fi", "Comedy"], 90],
  [87108, "tv", "Chernobyl", 2019, ["Drama", "History"], 95],
  [1668, "tv", "Friends", 1994, ["Comedy", "Romance"], 89],
  [2316, "tv", "The Office", 2005, ["Comedy"], 92],
];

const movies = MOVIES.map(build);
const series = SERIES.map(build);
const all = [...movies, ...series];

/** Flat catalog used for offline (no-key) search. */
export const allTitles: Title[] = all;

const pick = (arr: Title[], idxs: number[]) => idxs.map((i) => arr[i]);

export const curatedFeatured: Title = {
  ...movies[0],
  badge: "New",
  description:
    "Paul Atreides unites with the Fremen to wage war against the conspirators who destroyed his family — and confronts the terrible choice between the love of his life and the fate of the universe.",
};

export const curatedRows: Row[] = [
  {
    id: "trending",
    title: "Trending Now",
    titles: pick(all, [1, 25, 3, 28, 6, 30, 10, 33, 20, 26]),
  },
  {
    id: "top10",
    title: "Top 10 in India Today",
    titles: [
      movies[3],
      series[0],
      movies[2],
      series[2],
      movies[1],
      series[6],
      movies[19],
      series[12],
      movies[21],
      series[5],
    ].map((t) => ({ ...t, badge: "Top 10" as const })),
  },
  {
    id: "popular",
    title: "Popular Movies on dekhly",
    titles: movies.slice(1, 13),
  },
  { id: "series", title: "Binge-Worthy Series", titles: series },
  {
    id: "action",
    title: "Adrenaline Rush: Action & Adventure",
    titles: all.filter((t) => t.genres.includes("Action")),
  },
  {
    id: "acclaimed",
    title: "Critically Acclaimed",
    titles: all.filter((t) => t.match >= 93),
  },
  {
    id: "comedy",
    title: "Laugh Out Loud",
    titles: all.filter((t) => t.genres.includes("Comedy")),
  },
  { id: "mylist", title: "My List", titles: pick(all, [0, 5, 27, 11, 22, 32]) },
];
