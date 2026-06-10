"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Info, Plus, Star } from "lucide-react";
import { backdropUrl, watchHref, type Title } from "@/lib/data";

export default function Hero({
  title,
  onMoreInfo,
}: {
  title: Title;
  onMoreInfo: (t: Title) => void;
}) {
  return (
    <section className="relative h-[88vh] min-h-[600px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={backdropUrl(title)}
          alt={title.name}
          fill
          priority
          sizes="100vw"
          className="animate-slow-zoom object-cover object-top"
        />
        {/* Layered cinematic scrims */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-ink to-transparent" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-[12vh] md:px-16">
        <div className="max-w-2xl animate-fade-up">
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
            <span>{title.year}</span>
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
              <Play size={22} fill="currentColor" />
              Play
            </Link>
            <button
              onClick={() => onMoreInfo(title)}
              className="flex items-center gap-2.5 rounded-md bg-white/15 px-8 py-3 text-base font-semibold text-white backdrop-blur-md transition hover:bg-white/25"
            >
              <Info size={22} />
              More Info
            </button>
            <button
              className="grid h-12 w-12 place-items-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-md transition hover:border-white"
              aria-label="Add to My List"
            >
              <Plus size={22} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
