"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search as SearchIcon, X, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import DetailModal from "@/components/DetailModal";
import AuthGuard from "@/components/AuthGuard";
import { allTitles, type Title } from "@/lib/data";

const SUGGESTIONS = [
  "Action",
  "Sci-Fi",
  "Comedy",
  "Thriller",
  "Breaking Bad",
  "Inception",
  "Crime",
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

  return (
    <AuthGuard>
      <div className="relative min-h-screen">
        <Navbar />

        <main className="relative z-10 min-h-screen pt-28">
          <div className="mx-auto max-w-[1700px] px-5 md:px-14">
            {/* Search input */}
            <div className="glass flex items-center gap-3 rounded-2xl px-5 py-4">
              <SearchIcon size={22} className="shrink-0 text-neutral-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, series, genres…"
                className="w-full bg-transparent text-lg outline-none placeholder:text-neutral-500"
              />
              {loading && (
                <Loader2 size={18} className="animate-spin text-brand" />
              )}
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-neutral-400 transition hover:text-white"
                  aria-label="Clear"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Suggestions when empty */}
            {!query.trim() && (
              <div className="mt-8">
                <p className="mb-3 text-sm font-semibold text-neutral-400">
                  Try searching
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="glass rounded-full px-4 py-2 text-sm text-neutral-300 transition hover:text-white"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {query.trim() && (
              <div className="mt-8 pb-16">
                <p className="mb-4 text-sm text-neutral-400">
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
                ) : (
                  !loading && (
                    <div className="glass mt-2 rounded-2xl px-6 py-12 text-center">
                      <p className="text-neutral-300">
                        Nothing matched your search.
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        Try a different title or genre — or add a TMDB key for
                        the full library.
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </main>

        <DetailModal title={selected} onClose={() => setSelected(null)} />
      </div>
    </AuthGuard>
  );
}
