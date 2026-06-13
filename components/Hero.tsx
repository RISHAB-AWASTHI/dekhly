"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tv, Info, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { backdropUrl, watchHref, type Title } from "@/lib/data";

const ROTATE_MS = 7000;

export default function Hero({
  titles,
  onMoreInfo,
}: {
  titles: Title[];
  onMoreInfo: (t: Title) => void;
}) {
  const slides = titles.slice(0, 5);
  const [active, setActive] = useState(0);

  // Auto-rotate through the featured titles.
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % slides.length),
      ROTATE_MS,
    );
    return () => clearInterval(id);
  }, [slides.length]);

  if (!slides.length) return null;
  const title = slides[active];

  const go = (dir: 1 | -1) =>
    setActive((i) => (i + dir + slides.length) % slides.length);

  return (
    <section className="relative h-[88vh] min-h-[600px] w-full overflow-hidden">
      {/* Crossfading backdrops */}
      <div className="absolute inset-0">
        {slides.map((t, i) => (
          <Image
            key={t.id}
            src={backdropUrl(t)}
            alt={t.name}
            fill
            priority={i === 0}
            sizes="100vw"
            className={`object-cover object-top transition-opacity duration-1000 ${
              i === active ? "animate-slow-zoom opacity-100" : "opacity-0"
            }`}
          />
        ))}
        {/* Layered cinematic scrims */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-ink to-transparent" />
      </div>

      {/* Desktop side arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous"
            className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 place-items-center rounded-full bg-black/40 p-2 text-white/80 ring-1 ring-white/10 transition hover:bg-black/70 hover:text-white md:grid"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next"
            className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 place-items-center rounded-full bg-black/40 p-2 text-white/80 ring-1 ring-white/10 transition hover:bg-black/70 hover:text-white md:grid"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-[12vh] md:px-16">
        {/* key re-triggers the entrance animation on each slide */}
        <div key={title.id} className="max-w-2xl animate-fade-up">
          <div className="mb-5 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-300">
            <span className="text-brand">dekhly</span>
            <span className="h-1 w-1 rounded-full bg-neutral-600" />
            <span>{title.type === "tv" ? "Series" : "Film"}</span>
            {title.badge && (
              <>
                <span className="h-1 w-1 rounded-full bg-neutral-600" />
                <span className="text-neutral-400">{title.badge}</span>
              </>
            )}
          </div>

          <h1 className="font-display text-5xl font-extrabold leading-[0.92] tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.6)] sm:text-6xl md:text-7xl lg:text-8xl">
            {title.name}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-300">
            <span className="flex items-center gap-1.5 font-semibold text-mint">
              <Star size={15} fill="currentColor" /> {title.match}% Match
            </span>
            {title.year > 0 && <span>{title.year}</span>}
            <span className="rounded border border-white/25 px-1.5 py-px text-xs text-neutral-200">
              {title.rating}
            </span>
            <span>{title.duration}</span>
            <span className="hidden text-neutral-400 sm:inline">
              {title.genres.slice(0, 3).join("  •  ")}
            </span>
          </div>

          <p className="mt-5 line-clamp-3 max-w-xl text-[15px] leading-relaxed text-neutral-200/85">
            {title.description}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={watchHref(title)}
              className="flex items-center gap-2.5 rounded-md bg-white px-9 py-3 text-base font-bold text-ink transition hover:bg-white/85"
            >
              <Tv size={22} />
              Where to Watch
            </Link>
            <button
              onClick={() => onMoreInfo(title)}
              className="flex items-center gap-2.5 rounded-md bg-white/15 px-8 py-3 text-base font-semibold text-white backdrop-blur-md transition hover:bg-white/25"
            >
              <Info size={22} />
              More Info
            </button>
          </div>
        </div>

        {/* Slide indicators */}
        {slides.length > 1 && (
          <div className="mt-8 flex items-center gap-2">
            {slides.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setActive(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active
                    ? "w-8 bg-white"
                    : "w-4 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
