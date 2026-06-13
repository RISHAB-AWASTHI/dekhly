"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon, X, Loader2, TrendingUp, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import DetailModal from "@/components/DetailModal";
import { allTitles, type Title } from "@/lib/data";
import { MOVIE_GENRES } from "@/lib/tmdb";

const TRENDING = [
  "Inception",
  "Breaking Bad",
  "Dune",
  "Stranger Things",
  "Oppenheimer",
  "The Dark Knight",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [remote, setRemote] = useState<Title[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Title | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Always-available offline filter over the curated catalog.
  const local = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allTitles.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.genres.some((g) => g.toLowerCase().includes(q)),
    );
  }, [query]);

  // Live TMDB search (only returns data when a key is configured).
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setRemote([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        const data = (await res.json()) as { results: Title[] };
        setRemote(data.results ?? []);
      } catch {
        /* aborted or offline — keep local results */
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  // Merge: prefer live TMDB results (real art), then fill with curated.
  const results = useMemo(() => {
    const seen = new Set(remote.map((t) => t.id));
    return [...remote, ...local.filter((t) => !seen.has(t.id))];
  }, [remote, local]);

  const hasQuery = query.trim().length > 0;

  return (
    <div className="relative min-h-screen">
      <Navbar />

      <main className="relative z-10 min-h-screen pt-28">
        <div className="mx-auto max-w-[1100px] px-5 md:px-8">
          {/* Heading + search input */}
          {!hasQuery && (
            <div className="mb-8 text-center">
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                Find your next watch
              </h1>
              <p className="mt-3 text-neutral-400">
                Search thousands of movies &amp; series — then see where to
                stream them.
              </p>
            </div>
          )}

          <div
            className={`glass flex items-center gap-3 rounded-2xl px-5 py-4 transition-all ${
              hasQuery ? "" : "shadow-[0_20px_60px_-20px_rgba(124,92,255,0.35)]"
            }`}
          >
            <SearchIcon size={22} className="shrink-0 text-neutral-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, e.g. Inception…"
              className="w-full bg-transparent text-lg outline-none placeholder:text-neutral-500"
            />
            {loading && <Loader2 size={18} className="animate-spin text-brand" />}
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="text-neutral-400 transition hover:text-white"
                aria-label="Clear"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Empty state: trending + browse by genre */}
          {!hasQuery && (
            <div className="mt-12 space-y-12 pb-20">
              {/* Trending searches */}
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-400">
                  <TrendingUp size={16} className="text-brand" />
                  Trending searches
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {TRENDING.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-neutral-300 transition hover:border-white/30 hover:text-white"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>

              {/* Browse by genre → Discover */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
                    Browse by genre
                  </h2>
                  <Link
                    href="/discover"
                    className="flex items-center gap-1 text-sm font-semibold text-brand transition hover:gap-1.5"
                  >
                    All filters <ArrowRight size={15} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {MOVIE_GENRES.map((g, i) => (
                    <Link
                      key={g.id}
                      href={`/discover?type=movie&genres=${g.id}`}
                      className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] px-4 py-5 transition hover:border-brand/50"
                    >
                      <span
                        className="absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-20 blur-xl transition group-hover:opacity-40"
                        style={{ background: GENRE_HUE[i % GENRE_HUE.length] }}
                      />
                      <span className="font-display relative text-lg font-bold text-white">
                        {g.name}
                      </span>
                      <ArrowRight
                        size={16}
                        className="absolute bottom-4 right-4 text-neutral-500 transition group-hover:translate-x-0.5 group-hover:text-brand"
                      />
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Results */}
          {hasQuery && (
            <div className="mt-8 pb-16">
              <p className="mb-5 text-sm text-neutral-400">
                {results.length > 0
                  ? `${results.length} result${results.length > 1 ? "s" : ""} for `
                  : loading
                    ? "Searching for "
                    : "No results for "}
                <span className="font-semibold text-white">
                  &ldquo;{query.trim()}&rdquo;
                </span>
              </p>

              {results.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {results.map((t) => (
                    <Card key={t.id} title={t} onSelect={setSelected} />
                  ))}
                </div>
              ) : loading ? (
                <div className="flex flex-wrap gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="skeleton aspect-[2/3] w-[150px] rounded-xl md:w-[172px]"
                    />
                  ))}
                </div>
              ) : (
                <div className="glass mt-2 rounded-2xl px-6 py-14 text-center">
                  <p className="text-lg font-semibold text-neutral-200">
                    Nothing matched your search
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-neutral-400">
                    Try a different title, check the spelling, or{" "}
                    <Link href="/discover" className="text-brand hover:underline">
                      browse by genre &amp; platform
                    </Link>{" "}
                    instead.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <DetailModal title={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

const GENRE_HUE = [
  "#7c5cff",
  "#ff5e9a",
  "#46d369",
  "#f5a623",
  "#3ba7ff",
  "#ff6b4a",
];
