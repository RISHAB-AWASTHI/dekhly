"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Card from "./Card";
import type { Row as RowType, Title } from "@/lib/data";

export default function Row({
  row,
  numbered = false,
  onSelect,
}: {
  row: RowType;
  numbered?: boolean;
  onSelect: (t: Title) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.88, behavior: "smooth" });
  };
  const onScroll = () => setCanLeft((trackRef.current?.scrollLeft ?? 0) > 8);

  return (
    <section className="group/row relative py-5">
      <div className="mb-3 flex items-baseline gap-3 px-5 md:px-16">
        <h2 className="font-display text-[19px] font-bold tracking-tight text-white md:text-[22px]">
          {row.title}
        </h2>
        <button className="translate-x-1 text-xs font-semibold text-brand opacity-0 transition-all duration-200 group-hover/row:translate-x-0 group-hover/row:opacity-100">
          Explore all ›
        </button>
      </div>

      <div className="relative">
        {canLeft && (
          <button
            onClick={() => scrollBy(-1)}
            className="absolute left-0 top-0 z-20 hidden h-full w-16 place-items-center bg-gradient-to-r from-ink via-ink/70 to-transparent text-white opacity-0 transition group-hover/row:opacity-100 md:grid"
            aria-label="Scroll left"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-black/60 ring-1 ring-white/15 transition hover:scale-110">
              <ChevronLeft size={22} />
            </span>
          </button>
        )}

        <div
          ref={trackRef}
          onScroll={onScroll}
          className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth px-5 pb-6 pt-2 md:gap-4 md:px-16"
        >
          {row.titles.map((t, i) => (
            <Card
              key={t.id}
              title={t}
              rank={numbered ? i + 1 : undefined}
              onSelect={onSelect}
            />
          ))}
        </div>

        <button
          onClick={() => scrollBy(1)}
          className="absolute right-0 top-0 z-20 hidden h-full w-16 place-items-center bg-gradient-to-l from-ink via-ink/70 to-transparent text-white opacity-0 transition group-hover/row:opacity-100 md:grid"
          aria-label="Scroll right"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-black/60 ring-1 ring-white/15 transition hover:scale-110">
            <ChevronRight size={22} />
          </span>
        </button>
      </div>
    </section>
  );
}
