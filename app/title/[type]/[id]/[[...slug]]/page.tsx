import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Tv,
  Gift,
  Clapperboard,
  ShoppingCart,
  ExternalLink,
  Star,
  ArrowLeft,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getTitleDetails,
  getTitleExtras,
  getWatchProviders,
} from "@/lib/tmdb";
import type { WatchProviders } from "@/lib/tmdb";
import {
  backdropUrl,
  posterUrl,
  titleHref,
  tmdbImg,
  type MediaType,
  type Title,
} from "@/lib/data";
import { providerLink, providerLogo } from "@/lib/affiliate";

const REGIONS = [
  { code: "IN", label: "India", flag: "🇮🇳" },
  { code: "US", label: "USA", flag: "🇺🇸" },
  { code: "GB", label: "UK", flag: "🇬🇧" },
  { code: "CA", label: "Canada", flag: "🇨🇦" },
  { code: "AU", label: "Australia", flag: "🇦🇺" },
];

const SECTIONS = [
  { key: "flatrate", label: "Stream", note: "Included with subscription", icon: Tv },
  { key: "free", label: "Free", note: "Watch free", icon: Gift },
  { key: "ads", label: "Free with ads", note: "Ad-supported", icon: Gift },
  { key: "rent", label: "Rent", note: "Rent to watch", icon: Clapperboard },
  { key: "buy", label: "Buy", note: "Buy to own", icon: ShoppingCart },
] as const;

type Params = Promise<{ type: string; id: string }>;
type Search = Promise<{ region?: string }>;

const mediaOf = (type: string): MediaType => (type === "tv" ? "tv" : "movie");

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { type, id } = await params;
  const t = await getTitleDetails(mediaOf(type), id);
  if (!t) return { title: "Title not found — dekhly" };

  const yr = t.year ? ` (${t.year})` : "";
  const kind = t.type === "tv" ? "TV series" : "movie";
  const desc =
    `Where to watch ${t.name}${yr} in India — stream, rent or buy this ${kind}. ${t.description}`.slice(
      0,
      157,
    ) + "…";

  return {
    // Short, clean browser-tab title…
    title: `${t.name}${yr} — dekhly`,
    description: desc,
    alternates: { canonical: titleHref(t) },
    openGraph: {
      // …but a keyword-rich title for Google & social previews.
      title: `Where to Watch ${t.name}${yr} in India`,
      description: desc,
      type: "video.movie",
      images: t.backdropPath ? [tmdbImg(t.backdropPath, "w1280")] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `Where to Watch ${t.name}${yr} in India`,
      description: desc,
    },
  };
}

export default async function TitlePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { type, id } = await params;
  const { region: regionParam } = await searchParams;
  const mt = mediaOf(type);
  const region = (regionParam || "IN").toUpperCase();

  const [title, extras, providers] = await Promise.all([
    getTitleDetails(mt, id),
    getTitleExtras(mt, id),
    getWatchProviders(mt, id, region),
  ]);

  if (!title) notFound();

  const regionLabel = REGIONS.find((r) => r.code === region)?.label ?? region;
  const hasAny =
    providers &&
    SECTIONS.some((s) => (providers[s.key]?.length ?? 0) > 0);

  // Structured data so Google can show rich results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": mt === "tv" ? "TVSeries" : "Movie",
    name: title.name,
    description: title.description,
    image: title.backdropPath ? tmdbImg(title.backdropPath, "w1280") : undefined,
    ...(title.year ? { datePublished: String(title.year) } : {}),
    genre: title.genres,
    ...(extras.director
      ? { director: { "@type": "Person", name: extras.director } }
      : {}),
    ...(extras.cast.length
      ? { actor: extras.cast.map((name) => ({ "@type": "Person", name })) }
      : {}),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: (title.match / 10).toFixed(1),
      bestRating: "10",
      ratingCount: 100,
    },
  };

  return (
    <div className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Backdrop hero */}
      <section className="relative h-[58vh] min-h-[420px] w-full overflow-hidden">
        <Image
          src={backdropUrl(title)}
          alt={title.name}
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 to-transparent" />

        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto flex max-w-[1300px] items-end gap-6 px-5 pb-8 md:px-10">
            {/* Poster */}
            <div className="hidden w-[180px] shrink-0 overflow-hidden rounded-xl ring-1 ring-white/15 shadow-2xl sm:block">
              <Image
                src={posterUrl(title)}
                alt={title.name}
                width={180}
                height={270}
                className="h-auto w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <Link
                href="/"
                className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-300 transition hover:text-white"
              >
                <ArrowLeft size={16} /> Back to Home
              </Link>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-white drop-shadow-lg md:text-6xl">
                {title.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-300">
                <span className="flex items-center gap-1 font-semibold text-mint">
                  <Star size={14} fill="currentColor" /> {title.match}% Match
                </span>
                {title.year > 0 && <span>{title.year}</span>}
                <span className="rounded border border-white/25 px-1.5 py-px text-xs">
                  {title.rating}
                </span>
                <span>{title.type === "tv" ? "Series" : "Film"}</span>
                <span className="hidden text-neutral-400 sm:inline">
                  {title.genres.slice(0, 3).join("  •  ")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <main className="mx-auto w-full max-w-[1300px] px-5 py-10 md:px-10">
        <p className="max-w-3xl text-[15px] leading-relaxed text-neutral-300">
          {title.description}
        </p>

        {/* Where to watch */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">
            Where to watch {title.name}
          </h2>
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1">
            {REGIONS.map((r) => {
              const active = r.code === region;
              return (
                <Link
                  key={r.code}
                  href={`?region=${r.code}`}
                  scroll={false}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                    active
                      ? "bg-white text-ink"
                      : "text-neutral-400 hover:text-white"
                  }`}
                  title={r.label}
                >
                  <span className="text-base leading-none">{r.flag}</span>
                  <span className="hidden sm:inline">{r.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {hasAny ? (
          <div className="mt-6 space-y-6">
            {SECTIONS.map((section) => {
              const list = (providers as WatchProviders)[section.key] ?? [];
              if (!list.length) return null;
              return (
                <div
                  key={section.key}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
                >
                  <div className="mb-4 flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand/15 text-brand">
                      <section.icon size={16} />
                    </span>
                    <h3 className="font-display text-base font-bold text-white">
                      {section.label}
                    </h3>
                    <span className="text-xs text-neutral-500">
                      {section.note}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {list.map((p) => (
                      <a
                        key={p.providerId}
                        href={providerLink(
                          p.name,
                          title.name,
                          providers?.link ?? null,
                        )}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="group flex w-[120px] flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center transition hover:-translate-y-0.5 hover:border-white/30"
                      >
                        <span className="relative h-12 w-12 overflow-hidden rounded-xl ring-1 ring-white/10">
                          <Image
                            src={providerLogo(p.logoPath)}
                            alt={p.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                            unoptimized
                          />
                        </span>
                        <span className="line-clamp-2 text-xs font-semibold text-neutral-200">
                          {p.name}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 py-12 text-center">
            <p className="text-lg font-semibold text-white">
              Not available to stream in {regionLabel} yet
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-400">
              Try another region above, or check the full availability list.
            </p>
            <a
              href={
                providers?.link ??
                `https://www.themoviedb.org/${title.type}/${title.tmdbId}/watch`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-white/85"
            >
              Check full availability <ExternalLink size={15} />
            </a>
          </div>
        )}

        {/* Cast & crew */}
        {(extras.cast.length > 0 || extras.director) && (
          <section className="mt-12">
            <h2 className="font-display mb-4 text-2xl font-bold tracking-tight text-white">
              Cast &amp; crew
            </h2>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              {extras.director && (
                <p className="text-neutral-300">
                  <span className="text-neutral-500">
                    {title.type === "tv" ? "Creator: " : "Director: "}
                  </span>
                  {extras.director}
                </p>
              )}
              {extras.cast.length > 0 && (
                <p className="text-neutral-300">
                  <span className="text-neutral-500">Cast: </span>
                  {extras.cast.join(", ")}
                </p>
              )}
              <p className="text-neutral-300">
                <span className="text-neutral-500">Genres: </span>
                {title.genres.join(", ")}
              </p>
            </div>
          </section>
        )}

        {/* More like this — crawlable internal links */}
        {extras.similar.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display mb-4 text-2xl font-bold tracking-tight text-white">
              More like {title.name}
            </h2>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
              {extras.similar.slice(0, 12).map((t) => (
                <SimilarCard key={t.id} title={t} />
              ))}
            </div>
          </section>
        )}

        {/* Attribution */}
        <p className="mt-14 border-t border-white/5 pt-6 text-xs leading-relaxed text-neutral-500">
          Streaming availability for {title.name} in {regionLabel} is provided by
          JustWatch via TMDB. dekhly hosts no media — every link sends you to the
          official platform. This product uses the TMDB API but is not endorsed
          or certified by TMDB.
        </p>
      </main>

      <Footer />
    </div>
  );
}

function SimilarCard({ title }: { title: Title }) {
  return (
    <Link href={titleHref(title)} className="group block">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-ink-card ring-1 ring-white/[0.06] transition group-hover:ring-white/25">
        <Image
          src={posterUrl(title)}
          alt={title.name}
          fill
          sizes="200px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <p className="mt-2 truncate text-xs font-semibold text-neutral-300 group-hover:text-white">
        {title.name}
      </p>
    </Link>
  );
}
