"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Plus, ChevronDown, Star } from "lucide-react";
import { posterUrl, watchHref, type Title } from "@/lib/data";

export default function Card({
  title,
  rank,
  onSelect,
}: {
  title: Title;
  rank?: number;
  onSelect: (t: Title) => void;
}) {
  return (
    <div className="group/card flex shrink-0 items-end">
      {rank && (
        <span
          className="font-display -mr-5 select-none text-[7.5rem] font-extrabold leading-[0.7] text-transparent"
          style={{ WebkitTextStroke: "2px rgba(255,255,255,0.18)" }}
        >
          {rank}
        </span>
      )}

      <div className="relative w-[150px] md:w-[172px]">
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
                <Play size={13} fill="currentColor" /> Play
              </Link>
              <button
                className="grid h-7 w-7 place-items-center rounded-md border border-white/30 text-white transition hover:border-white"
                aria-label="Add to list"
              >
                <Plus size={14} />
              </button>
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
