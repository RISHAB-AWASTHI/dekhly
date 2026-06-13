"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import DetailModal from "@/components/DetailModal";
import AuthGuard from "@/components/AuthGuard";
import { type Title } from "@/lib/data";
import { useWatchLater } from "@/lib/useWatchLater";
import { BookmarkIcon } from "lucide-react";

export default function WatchLaterPage() {
  const [selected, setSelected] = useState<Title | null>(null);
  const { savedTitles, isLoaded } = useWatchLater();

  return (
    <AuthGuard>
      <div className="relative min-h-screen">
        <Navbar />

        <main className="relative z-10 min-h-screen pt-28">
          <div className="mx-auto max-w-[1700px] px-5 md:px-14 pb-16">
            <h1 className="mb-8 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
              Watch Later
            </h1>

            {!isLoaded ? (
              <div className="flex justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
              </div>
            ) : savedTitles.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {savedTitles.map((t) => (
                  <Card key={t.id} title={t} onSelect={setSelected} />
                ))}
              </div>
            ) : (
              <div className="glass mt-8 rounded-2xl px-6 py-16 text-center">
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-white/5">
                  <BookmarkIcon size={32} className="text-neutral-500" />
                </div>
                <p className="text-xl font-semibold text-neutral-200">
                  Your Watch Later list is empty
                </p>
                <p className="mt-2 text-neutral-400">
                  Add movies and series to your list to easily find them later.
                </p>
              </div>
            )}
          </div>
        </main>

        <DetailModal title={selected} onClose={() => setSelected(null)} />
      </div>
    </AuthGuard>
  );
}
