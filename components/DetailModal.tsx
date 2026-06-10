"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Plus, ThumbsUp, X, VolumeX } from "lucide-react";
import { backdropUrl, watchHref, type Title } from "@/lib/data";

export default function DetailModal({
  title,
  onClose,
}: {
  title: Title | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!title) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [title, onClose]);

  if (!title) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-10 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="animate-fade-up relative w-full max-w-3xl overflow-hidden rounded-xl bg-ink-soft shadow-2xl"
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
            src={backdropUrl(title)}
            alt={title.name}
            fill
            sizes="768px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-soft via-ink-soft/20 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="font-display text-3xl font-extrabold tracking-tight drop-shadow-lg md:text-4xl">
              {title.name}
            </h2>
            <div className="mt-4 flex items-center gap-3">
              <Link
                href={watchHref(title)}
                className="flex items-center gap-2 rounded-md bg-white px-6 py-2 font-semibold text-black transition hover:bg-white/85"
              >
                <Play size={18} fill="currentColor" />
                Play
              </Link>
              <button
                className="grid h-10 w-10 place-items-center rounded-full border-2 border-white/50 transition hover:border-white"
                aria-label="Add to My List"
              >
                <Plus size={18} />
              </button>
              <button
                className="grid h-10 w-10 place-items-center rounded-full border-2 border-white/50 transition hover:border-white"
                aria-label="Like"
              >
                <ThumbsUp size={18} />
              </button>
              <button
                className="ml-auto grid h-10 w-10 place-items-center rounded-full border-2 border-white/50 transition hover:border-white"
                aria-label="Mute"
              >
                <VolumeX size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="grid gap-6 p-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="font-semibold text-green-400">
                {title.match}% Match
              </span>
              <span className="text-neutral-300">{title.year}</span>
              <span className="rounded border border-white/30 px-1.5 text-xs text-neutral-300">
                {title.rating}
              </span>
              <span className="text-neutral-300">{title.duration}</span>
              {title.badge && (
                <span className="bg-brand-gradient rounded-full px-2 py-0.5 text-xs font-bold">
                  {title.badge}
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-neutral-200">
              {title.description}
            </p>
          </div>
          <div className="space-y-3 text-sm">
            <p className="text-neutral-400">
              <span className="text-neutral-500">Genres: </span>
              {title.genres.join(", ")}
            </p>
            <p className="text-neutral-400">
              <span className="text-neutral-500">Cast: </span>
              Aanya Kapoor, Dev Mehra, Imran Sheikh, Lara D&apos;Souza
            </p>
            <p className="text-neutral-400">
              <span className="text-neutral-500">This title is: </span>
              Gripping, Suspenseful, Dark
            </p>
          </div>
        </div>

        {/* More like this */}
        <div className="px-6 pb-8">
          <h3 className="mb-3 text-lg font-bold">More Like This</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-md bg-ink ring-1 ring-white/5"
              >
                <div className="relative aspect-video w-full">
                  <Image
                    src={`https://picsum.photos/seed/${title.tmdbId}r${i}/240/140`}
                    alt="Related title"
                    fill
                    sizes="240px"
                    className="object-cover"
                  />
                </div>
                <div className="p-2 text-xs text-neutral-400">
                  <p className="font-semibold text-green-400">
                    {70 + ((i * 7) % 28)}% Match
                  </p>
                  <p className="mt-1 line-clamp-2 text-neutral-400">
                    A new story waiting to be discovered on dekhly.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
