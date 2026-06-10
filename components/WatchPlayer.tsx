"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  ShieldOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Logo from "./Logo";
import { PROVIDERS, getProvider } from "@/lib/providers";
import type { MediaType } from "@/lib/data";

export default function WatchPlayer({
  type,
  id,
}: {
  type: MediaType;
  id: string;
}) {
  const params = useSearchParams();
  const name = params.get("name") ?? "Now Playing";

  const [providerId, setProviderId] = useState(PROVIDERS[0].id);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [blockAds, setBlockAds] = useState(true);

  // Sandbox lets the player run but strips its ability to open popup/popunder
  // windows or hijack the top tab with redirects — that's where the ads come from.
  const sandbox = blockAds
    ? "allow-scripts allow-same-origin allow-forms allow-presentation"
    : undefined;

  const provider = getProvider(providerId);
  const src = useMemo(
    () => provider.build({ type, tmdbId: id, season, episode }),
    [provider, type, id, season, episode],
  );

  const step = (set: (n: number) => void, cur: number, delta: number) =>
    set(Math.max(1, cur + delta));

  return (
    <main className="flex min-h-screen flex-col bg-black">
      {/* Top bar */}
      <header className="flex items-center gap-4 px-4 py-3 md:px-8">
        <Link
          href="/browse"
          className="flex items-center gap-2 text-sm text-neutral-300 transition hover:text-white"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Back to Browse</span>
        </Link>
        <span className="mx-1 hidden h-5 w-px bg-white/15 sm:block" />
        <h1 className="truncate text-sm font-semibold text-white sm:text-base">
          {name}
        </h1>
        <Link href="/browse" className="ml-auto">
          <Logo className="text-xl" />
        </Link>
      </header>

      {/* Player */}
      <div className="relative mx-auto aspect-video w-full max-w-[1400px] overflow-hidden bg-ink-soft md:rounded-lg md:ring-1 md:ring-white/10">
        <iframe
          key={`${src}-${blockAds}`}
          src={src}
          title={name}
          className="h-full w-full"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="origin"
          {...(sandbox ? { sandbox } : {})}
        />
      </div>

      {/* Controls */}
      <div className="mx-auto w-full max-w-[1400px] px-4 py-5 md:px-0">
        {type === "tv" && (
          <div className="mb-5 flex flex-wrap items-center gap-4">
            <Stepper
              label="Season"
              value={season}
              onDec={() => step(setSeason, season, -1)}
              onInc={() => step(setSeason, season, 1)}
            />
            <Stepper
              label="Episode"
              value={episode}
              onDec={() => step(setEpisode, episode, -1)}
              onInc={() => step(setEpisode, episode, 1)}
            />
          </div>
        )}

        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-neutral-400">Source</p>
          <button
            onClick={() => setBlockAds((v) => !v)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              blockAds
                ? "bg-brand-gradient border-transparent text-white glow-brand"
                : "border-white/15 bg-white/5 text-neutral-400 hover:text-white"
            }`}
            title="Blocks popup ads & redirects by sandboxing the player. Turn off only if a source won't load."
          >
            {blockAds ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
            Popup blocker: {blockAds ? "ON" : "OFF"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => setProviderId(p.id)}
              className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition ${
                p.id === providerId
                  ? "bg-brand-gradient border-transparent text-white glow-brand"
                  : "border-white/15 bg-white/5 text-neutral-300 hover:border-white/40"
              }`}
            >
              {p.adFree && <ShieldCheck size={14} />}
              {p.name}
              {p.adFree && (
                <span className="text-[10px] font-bold uppercase opacity-80">
                  Ad-free
                </span>
              )}
            </button>
          ))}
        </div>

        <p className="mt-5 max-w-2xl text-xs leading-relaxed text-neutral-500">
          <span className="text-neutral-300">Popup blocker</span> sandboxes the
          player so it can&apos;t open ad tabs or redirect your page — keep it{" "}
          <span className="text-neutral-300">ON</span>. If a source then refuses
          to play, switch to another (the{" "}
          <span className="text-mint">Ad-free</span> one is cleanest) or toggle
          the blocker off for that source only. These are third-party embeds;
          dekhly hosts no media itself.
        </p>
      </div>
    </main>
  );
}

function Stepper({
  label,
  value,
  onDec,
  onInc,
}: {
  label: string;
  value: number;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-neutral-400">{label}</span>
      <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1">
        <button
          onClick={onDec}
          className="grid h-7 w-7 place-items-center rounded-full transition hover:bg-white/10"
          aria-label={`Previous ${label}`}
        >
          <ChevronLeft size={16} />
        </button>
        <span className="w-6 text-center text-sm font-semibold">{value}</span>
        <button
          onClick={onInc}
          className="grid h-7 w-7 place-items-center rounded-full transition hover:bg-white/10"
          aria-label={`Next ${label}`}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
