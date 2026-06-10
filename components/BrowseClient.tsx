"use client";

import { useState } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Row from "./Row";
import DetailModal from "./DetailModal";
import Footer from "./Footer";
import AuthGuard from "./AuthGuard";
import type { Row as RowType, Title } from "@/lib/data";

export default function BrowseClient({
  featured,
  rows,
}: {
  featured: Title;
  rows: RowType[];
}) {
  const [selected, setSelected] = useState<Title | null>(null);

  return (
    <AuthGuard>
      <div className="relative min-h-screen overflow-x-hidden">
        <Navbar />

        <main className="relative">
          <Hero title={featured} onMoreInfo={setSelected} />

          <div className="relative z-20 -mt-[10vh] space-y-1 pb-10">
            {rows.map((row) => (
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
    </AuthGuard>
  );
}
