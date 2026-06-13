"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Film,
  Tv,
  SlidersHorizontal,
  X,
  Loader2,
  Sparkles,
  Check,
  ChevronDown,
  Globe,
  ArrowDownWideNarrow,
} from "lucide-react";
import Navbar from "./Navbar";
import Card from "./Card";
import DetailModal from "./DetailModal";
import { MOVIE_GENRES, TV_GENRES, type WatchProvider } from "@/lib/tmdb";
import type { MediaType, Title } from "@/lib/data";

const REGIONS = [
  { code: "IN", label: "India" },
  { code: "US", label: "USA" },
  { code: "GB", label: "UK" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
];

const SORTS = [
  { key: "popular", label: "Most Popular" },
  { key: "rating", label: "Top Rated" },
  { key: "newest", label: "Newest" },
] as const;

const RATINGS = [
  { value: 0, label: "Any" },
  { value: 6, label: "6+" },
  { value: 7, label: "7+" },
  { value: 8, label: "8+" },
];

const DECADES = [
  { value: 0, label: "Any year" },
  { value: 2020, label: "2020s" },
  { value: 2010, label: "2010s" },
  { value: 2000, label: "2000s" },
  { value: 1990, label: "1990s" },
];

const providerLogo = (p: string | null) =>
  p ? `https://image.tmdb.org/t/p/w92${p}` : "";

export default function DiscoverClient({
  initialTitles,
  initialProviders,
  initialType,
  initialGenres = [],
  initialSort = "popular",
  initialProvidersSel = [],
}: {
  initialTitles: Title[];
  initialProviders: WatchProvider[];
  initialType: MediaType;
  initialGenres?: number[];
  initialSort?: (typeof SORTS)[number]["key"];
  initialProvidersSel?: number[];
}) {
  const [type, setType] = useState<MediaType>(initialType);
  const [region, setRegion] = useState("IN");
  const [genres, setGenres] = useState<number[]>(initialGenres);
  const [providersSel, setProvidersSel] = useState<number[]>(initialProvidersSel);
  const [sort, setSort] = useState<(typeof SORTS)[number]["key"]>(initialSort);
  const [minRating, setMinRating] = useState(0);
  const [decade, setDecade] = useState(0);

  const [providers, setProviders] = useState<WatchProvider[]>(initialProviders);
  const [titles, setTitles] = useState<Title[]>(initialTitles);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selected, setSelected] = useState<Title | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const genreList = type === "movie" ? MOVIE_GENRES : TV_GENRES;
  const genreName = (id: number) =>
    genreList.find((g) => g.id === id)?.name ?? "";
  const providerName = (id: number) =>
    providers.find((p) => p.providerId === id)?.name ?? "";
  const firstRender = useRef(true);

  const buildQuery = useCallback(
    (pageNum: number) => {
      const p = new URLSearchParams({
        type,
        region,
        sort,
        page: String(pageNum),
      });
      if (genres.length) p.set("genres", genres.join(","));
      if (providersSel.length) p.set("providers", providersSel.join(","));
      if (minRating) p.set("minRating", String(minRating));
      if (decade) p.set("decade", String(decade));
      return p.toString();
    },
    [type, region, sort, genres, providersSel, minRating, decade],
  );

  // Refetch results whenever a filter changes (debounced).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/discover?${buildQuery(1)}`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        setTitles(data.titles ?? []);
        setPage(data.page ?? 1);
        setTotalPages(data.totalPages ?? 1);
        if (data.providers?.length) setProviders(data.providers);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [buildQuery]);

  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/discover?${buildQuery(page + 1)}`);
      const data = await res.json();
      setTitles((prev) => {
        const seen = new Set(prev.map((t) => t.id));
        return [
          ...prev,
          ...(data.titles ?? []).filter((t: Title) => !seen.has(t.id)),
        ];
      });
      setPage(data.page ?? page + 1);
    } finally {
      setLoadingMore(false);
    }
  };

  const toggle = (arr: number[], v: number) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const activeCount =
    genres.length + providersSel.length + (minRating ? 1 : 0) + (decade ? 1 : 0);

  const clearAll = () => {
    setGenres([]);
    setProvidersSel([]);
    setMinRating(0);
    setDecade(0);
  };

  // The filter controls — reused in the desktop sidebar and the mobile drawer.
  const filtersPanel = (
    <div className="space-y-6">
      {/* Platforms */}
      {providers.length > 0 && (
        <FilterGroup label="Streaming on">
          <div className="flex flex-wrap gap-2">
            {providers.map((p) => {
              const on = providersSel.includes(p.providerId);
              return (
                <button
                  key={p.providerId}
                  onClick={() => setProvidersSel((s) => toggle(s, p.providerId))}
                  title={p.name}
                  className={`relative grid h-11 w-11 place-items-center overflow-hidden rounded-xl border transition ${
                    on
                      ? "border-brand ring-2 ring-brand/50"
                      : "border-white/10 opacity-70 hover:opacity-100"
                  }`}
                >
                  {p.logoPath ? (
                    <Image
                      src={providerLogo(p.logoPath)}
                      alt={p.name}
                      width={44}
                      height={44}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="px-1 text-[9px]">{p.name}</span>
                  )}
                  {on && (
                    <span className="absolute inset-0 grid place-items-center bg-brand/40">
                      <Check size={18} className="text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </FilterGroup>
      )}

      <div className="border-t border-white/[0.06]" />

      {/* Genres */}
      <FilterGroup label="Genres">
        <div className="flex flex-wrap gap-2">
          {genreList.map((g) => (
            <Chip
              key={g.id}
              active={genres.includes(g.id)}
              onClick={() => setGenres((s) => toggle(s, g.id))}
            >
              {g.name}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <div className="border-t border-white/[0.06]" />

      {/* Rating */}
      <FilterGroup label="Minimum rating">
        <div className="flex flex-wrap gap-2">
          {RATINGS.map((r) => (
            <Chip
              key={r.value}
              active={minRating === r.value}
              onClick={() => setMinRating(r.value)}
            >
              {r.label}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <div className="border-t border-white/[0.06]" />

      {/* Decade */}
      <FilterGroup label="Release period">
        <div className="flex flex-wrap gap-2">
          {DECADES.map((d) => (
            <Chip
              key={d.value}
              active={decade === d.value}
              onClick={() => setDecade(d.value)}
            >
              {d.label}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-neutral-300 transition hover:border-white/30 hover:text-white"
        >
          <X size={15} /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="relative min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-[1700px] px-5 pt-24 pb-20 md:px-14">
        {/* Page header */}
        <div className="border-b border-white/[0.06] pb-6">
          <h1 className="font-display flex items-center gap-2.5 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            <Sparkles className="text-brand" size={28} />
            Discover
          </h1>
          <p className="mt-1.5 text-sm text-neutral-400">
            Find exactly what to watch — and where it&apos;s streaming in{" "}
            {REGIONS.find((r) => r.code === region)?.label}.
          </p>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block">
            <div className="no-scrollbar sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              {filtersPanel}
            </div>
          </aside>

          {/* Main column */}
          <section>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
                {(["movie", "tv"] as MediaType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setType(t);
                      setGenres([]);
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
                      type === t
                        ? "bg-brand-gradient text-white shadow-[0_4px_14px_-4px_rgba(124,92,255,0.7)]"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {t === "movie" ? <Film size={15} /> : <Tv size={15} />}
                    {t === "movie" ? "Movies" : "Series"}
                  </button>
                ))}
              </div>

              <span className="hidden text-sm text-neutral-500 sm:inline">
                {loading
                  ? "Loading…"
                  : `${titles.length}${page < totalPages ? "+" : ""} titles`}
              </span>

              <div className="ml-auto flex items-center gap-2">
                <Select
                  icon={<Globe size={15} />}
                  value={region}
                  options={REGIONS.map((r) => ({ value: r.code, label: r.label }))}
                  onChange={setRegion}
                />
                <Select
                  icon={<ArrowDownWideNarrow size={15} />}
                  value={sort}
                  options={SORTS.map((s) => ({ value: s.key, label: s.label }))}
                  onChange={(v) => setSort(v as typeof sort)}
                  align="right"
                />

                {/* Mobile filter trigger */}
                <button
                  onClick={() => setDrawerOpen(true)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition lg:hidden ${
                    activeCount
                      ? "border-brand/60 bg-brand/15 text-white"
                      : "border-white/10 bg-white/5 text-neutral-300"
                  }`}
                >
                  <SlidersHorizontal size={15} />
                  Filters
                  {activeCount > 0 && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">
                      {activeCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Active filter pills */}
            {activeCount > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {providersSel.map((id) => (
                  <ActivePill
                    key={`p-${id}`}
                    onRemove={() => setProvidersSel((s) => s.filter((x) => x !== id))}
                  >
                    {providerName(id)}
                  </ActivePill>
                ))}
                {genres.map((id) => (
                  <ActivePill
                    key={`g-${id}`}
                    onRemove={() => setGenres((s) => s.filter((x) => x !== id))}
                  >
                    {genreName(id)}
                  </ActivePill>
                ))}
                {minRating > 0 && (
                  <ActivePill onRemove={() => setMinRating(0)}>
                    {minRating}+ rating
                  </ActivePill>
                )}
                {decade > 0 && (
                  <ActivePill onRemove={() => setDecade(0)}>
                    {decade}s
                  </ActivePill>
                )}
                <button
                  onClick={clearAll}
                  className="text-sm font-semibold text-neutral-500 transition hover:text-white"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Results grid */}
            <div className="mt-6">
              {loading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="skeleton aspect-[2/3] w-full rounded-xl" />
                  ))}
                </div>
              ) : titles.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                    {titles.map((t) => (
                      <Card key={t.id} title={t} onSelect={setSelected} fill />
                    ))}
                  </div>

                  {page < totalPages && (
                    <div className="mt-10 flex justify-center">
                      <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-ink transition hover:bg-white/85 disabled:opacity-60"
                      >
                        {loadingMore && <Loader2 size={16} className="animate-spin" />}
                        {loadingMore ? "Loading…" : "Load more"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-20 text-center">
                  <p className="text-lg font-semibold text-white">
                    No titles match these filters
                  </p>
                  <p className="mt-2 text-sm text-neutral-400">
                    Try removing a platform or genre, or widening the rating.
                  </p>
                  {activeCount > 0 && (
                    <button
                      onClick={clearAll}
                      className="mt-5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-white/85"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-ink-soft shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="font-display text-lg font-bold text-white">Filters</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-neutral-300 transition hover:text-white"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{filtersPanel}</div>
            <div className="border-t border-white/10 p-4">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full rounded-xl bg-white py-3 text-sm font-bold text-ink transition hover:bg-white/85"
              >
                Show {titles.length}
                {page < totalPages ? "+" : ""} results
              </button>
            </div>
          </div>
        </div>
      )}

      <DetailModal title={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function Select({
  value,
  options,
  onChange,
  icon,
  align = "left",
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
          open
            ? "border-white/30 bg-white/[0.08] text-white"
            : "border-white/10 bg-white/5 text-neutral-200 hover:border-white/30"
        }`}
      >
        {icon && <span className="text-neutral-400">{icon}</span>}
        {current?.label}
        <ChevronDown
          size={15}
          className={`text-neutral-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className={`absolute top-full z-40 mt-2 min-w-[170px] overflow-hidden rounded-xl border border-white/10 bg-ink-soft p-1 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {options.map((o) => {
            const selected = o.value === value;
            return (
              <button
                key={o.value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                  selected
                    ? "bg-brand/15 font-semibold text-white"
                    : "text-neutral-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {o.label}
                {selected && <Check size={15} className="text-brand" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-500">
        {label}
      </p>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
        active
          ? "border-brand bg-brand/20 font-semibold text-white"
          : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/30 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function ActivePill({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/15 py-1 pl-3 pr-1.5 text-sm text-white">
      {children}
      <button
        onClick={onRemove}
        className="grid h-5 w-5 place-items-center rounded-full transition hover:bg-white/20"
        aria-label="Remove filter"
      >
        <X size={13} />
      </button>
    </span>
  );
}
