"use client";

import Image from "next/image";
import Link from "next/link";
import { Tv, Bookmark, BookmarkCheck, ChevronDown, Star } from "lucide-react";
import { posterUrl, watchHref, type Title } from "@/lib/data";
import { useWatchLater } from "@/lib/useWatchLater";

export default function Card({
  title,
  rank,
  onSelect,
  fill = false,
}: {
  title: Title;
  rank?: number;
  onSelect: (t: Title) => void;
  fill?: boolean;
}) {
  const { hasTitle, toggleWatchLater } = useWatchLater();
  const isSaved = hasTitle(title.id);

  return (
    <div
      className={`group/card flex items-end ${fill ? "w-full" : "shrink-0"}`}
    >
      {rank && (
        <span
          className="font-display pointer-events-none -mr-6 select-none text-[8.5rem] font-black leading-[0.62] text-ink-soft md:-mr-7 md:text-[10.5rem]"
          style={{ WebkitTextStroke: "2.5px rgba(255,255,255,0.35)" }}
        >
          {rank}
        </span>
      )}

      <div className={`relative ${fill ? "w-full" : "w-[150px] md:w-[172px]"}`}>
        <div className="card-shadow relative aspect-[2/3] overflow-hidden rounded-xl bg-ink-card ring-1 ring-white/[0.06] transition-all duration-300 ease-out group-hover/card:-translate-y-1 group-hover/card:ring-white/20">
          <button onClick={() => onSelect(title)} className="absolute inset-0">
            <Image
              src={posterUrl(title)}
              alt={title.name}
              fill
              sizes="172px"
              className="object-cover transition-transform duration-500 group-hover/card:scale-105"
            />
          </button>

          {title.badge && !rank && (
            <span className="absolute left-2.5 top-2.5 rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
              {title.badge}
            </span>
          )}

          {/* Top right watch later button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWatchLater(title);
            }}
            className="absolute right-2 top-2 z-20 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/70"
            aria-label={isSaved ? "Remove from Watch Later" : "Add to Watch Later"}
          >
            {isSaved ? (
              <BookmarkCheck size={16} className="text-brand" fill="currentColor" />
            ) : (
              <Bookmark size={16} />
            )}
          </button>

          {/* Hover-only detail layer */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/35 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
            <p className="font-display truncate text-sm font-bold text-white">
              {title.name}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-neutral-300">
              <span className="flex items-center gap-0.5 font-semibold text-mint">
                <Star size={10} fill="currentColor" />
                {title.match}%
              </span>
              <span className="text-neutral-500">•</span>
              <span>{title.year}</span>
              <span className="text-neutral-500">•</span>
              <span className="rounded border border-white/25 px-1 text-[9px]">
                {title.rating}
              </span>
            </div>

            <div className="pointer-events-auto mt-3 flex items-center gap-2">
              <Link
                href={watchHref(title)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-white py-1.5 text-xs font-bold text-ink transition hover:bg-white/85"
              >
                <Tv size={13} /> Watch
              </Link>
              <button
                onClick={() => onSelect(title)}
                className="grid h-7 w-7 place-items-center rounded-md border border-white/30 text-white transition hover:border-white"
                aria-label="More info"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
