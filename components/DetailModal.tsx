"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tv, Bookmark, BookmarkCheck, X } from "lucide-react";
import { backdropUrl, watchHref, type Title } from "@/lib/data";
import { useWatchLater } from "@/lib/useWatchLater";

type Extras = { cast: string[]; director: string; similar: Title[] };

export default function DetailModal({
  title,
  onClose,
}: {
  title: Title | null;
  onClose: () => void;
}) {
  // `active` lets "More Like This" swap the displayed title in place.
  const [active, setActive] = useState<Title | null>(title);
  const [extras, setExtras] = useState<Extras | null>(null);
  const [loadingExtras, setLoadingExtras] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { hasTitle, toggleWatchLater } = useWatchLater();

  useEffect(() => {
    setActive(title);
  }, [title]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, onClose]);

  // Fetch real cast + recommendations for the active title.
  useEffect(() => {
    if (!active) return;
    setExtras(null);
    setLoadingExtras(true);
    const ctrl = new AbortController();
    fetch(`/api/title?type=${active.type}&id=${active.tmdbId}`, {
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((d: Extras) => setExtras(d))
      .catch(() => {})
      .finally(() => setLoadingExtras(false));
    return () => ctrl.abort();
  }, [active]);

  if (!active) return null;

  const isSaved = hasTitle(active.id);

  const openSimilar = (t: Title) => {
    setActive(t);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-10 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={scrollRef}
        className="animate-fade-up relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-ink-soft shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-ink/80 text-white transition hover:bg-ink"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Backdrop */}
        <div className="relative aspect-video w-full">
          <Image
            src={backdropUrl(active)}
            alt={active.name}
            fill
            sizes="768px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-soft via-ink-soft/20 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="font-display text-3xl font-extrabold tracking-tight drop-shadow-lg md:text-4xl">
              {active.name}
            </h2>
            <div className="mt-4 flex items-center gap-3">
              <Link
                href={watchHref(active)}
                className="flex items-center gap-2 rounded-md bg-white px-6 py-2 font-semibold text-black transition hover:bg-white/85"
              >
                <Tv size={18} />
                Where to Watch
              </Link>
              <button
                onClick={() => toggleWatchLater(active)}
                className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold backdrop-blur-md transition ${
                  isSaved
                    ? "border-brand bg-brand/20 text-white"
                    : "border-white/40 bg-white/10 text-white hover:border-white"
                }`}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck size={18} className="text-brand" fill="currentColor" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark size={18} />
                    Watch Later
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="grid gap-6 p-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="font-semibold text-green-400">
                {active.match}% Match
              </span>
              {active.year > 0 && (
                <span className="text-neutral-300">{active.year}</span>
              )}
              <span className="rounded border border-white/30 px-1.5 text-xs text-neutral-300">
                {active.rating}
              </span>
              <span className="text-neutral-300">{active.duration}</span>
              {active.badge && (
                <span className="bg-brand-gradient rounded-full px-2 py-0.5 text-xs font-bold">
                  {active.badge}
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-neutral-200">
              {active.description}
            </p>
          </div>
          <div className="space-y-3 text-sm">
            <p className="text-neutral-400">
              <span className="text-neutral-500">Genres: </span>
              {active.genres.join(", ")}
            </p>
            {loadingExtras ? (
              <p className="text-neutral-500">Loading cast…</p>
            ) : (
              <>
                {extras?.cast && extras.cast.length > 0 && (
                  <p className="text-neutral-400">
                    <span className="text-neutral-500">Cast: </span>
                    {extras.cast.join(", ")}
                  </p>
                )}
                {extras?.director && (
                  <p className="text-neutral-400">
                    <span className="text-neutral-500">
                      {active.type === "tv" ? "Creator: " : "Director: "}
                    </span>
                    {extras.director}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* More like this */}
        {(loadingExtras || (extras?.similar && extras.similar.length > 0)) && (
          <div className="px-6 pb-8">
            <h3 className="mb-3 text-lg font-bold">More Like This</h3>
            {loadingExtras ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton aspect-video w-full rounded-md" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {extras!.similar.slice(0, 9).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => openSimilar(t)}
                    className="group overflow-hidden rounded-md bg-ink text-left ring-1 ring-white/5 transition hover:ring-white/20"
                  >
                    <div className="relative aspect-video w-full">
                      <Image
                        src={backdropUrl(t)}
                        alt={t.name}
                        fill
                        sizes="240px"
                        className="object-cover transition group-hover:scale-105"
                      />
                    </div>
                    <div className="p-2">
                      <p className="truncate text-sm font-semibold text-white">
                        {t.name}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
                        <span className="font-semibold text-green-400">
                          {t.match}% Match
                        </span>
                        {t.year > 0 && <span>{t.year}</span>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
