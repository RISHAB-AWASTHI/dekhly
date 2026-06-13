"use client";

import { useState } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Row from "./Row";
import DetailModal from "./DetailModal";
import Footer from "./Footer";
import PlatformStrip from "./PlatformStrip";
import type { Row as RowType, Title } from "@/lib/data";
import type { WatchProvider } from "@/lib/tmdb";

export default function BrowseClient({
  featured,
  rows,
  platforms = [],
}: {
  featured: Title;
  rows: RowType[];
  platforms?: WatchProvider[];
}) {
  const [selected, setSelected] = useState<Title | null>(null);

  // Rotate the hero through the top trending titles (those with backdrops).
  const trending = rows.find((r) => r.id === "trending")?.titles ?? [];
  const heroTitles = trending.filter((t) => t.backdropPath).slice(0, 5);
  const heroList = heroTitles.length ? heroTitles : [featured];

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Navbar />

      <main className="relative">
        <Hero titles={heroList} onMoreInfo={setSelected} />

        <div className="relative z-20 -mt-[10vh] space-y-1">
          {rows.slice(0, 1).map((row) => (
            <Row
              key={row.id}
              row={row}
              numbered={row.id === "top10"}
              onSelect={setSelected}
            />
          ))}
        </div>

        <PlatformStrip providers={platforms} />

        <div className="space-y-1 pb-10">
          {rows.slice(1).map((row) => (
            <Row
              key={row.id}
              row={row}
              numbered={row.id === "top10"}
              onSelect={setSelected}
            />
          ))}
        </div>

        <Footer />
      </main>

      <DetailModal title={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
