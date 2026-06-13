import Image from "next/image";
import Link from "next/link";
import type { WatchProvider } from "@/lib/tmdb";

const logo = (p: string | null) =>
  p ? `https://image.tmdb.org/t/p/w154${p}` : "";

export default function PlatformStrip({
  providers,
}: {
  providers: WatchProvider[];
}) {
  if (!providers.length) return null;

  // Duplicate the list so the marquee loops seamlessly at -50%.
  const loop = [...providers, ...providers];

  return (
    <section className="relative py-14">
      <div className="mx-auto max-w-[1700px] px-5 md:px-14">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
          Available across{" "}
          <span className="text-white">{providers.length}+ platforms</span>{" "}
          — one place
        </p>
      </div>

      {/* py gives hover scale/lift room so icons never clip at the edges */}
      <div className="relative mt-7 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_9%,black_91%,transparent)]">
        <div className="animate-marquee flex w-max items-center gap-5 py-4">
          {loop.map((p, i) => (
            <Link
              key={`${p.providerId}-${i}`}
              href={`/discover?type=movie&providers=${p.providerId}`}
              title={`See titles on ${p.name}`}
              className="group shrink-0"
            >
              {p.logoPath ? (
                <Image
                  src={logo(p.logoPath)}
                  alt={p.name}
                  width={60}
                  height={60}
                  className="h-[60px] w-[60px] rounded-[16px] object-cover shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9)] ring-1 ring-white/10 transition duration-300 group-hover:scale-110 group-hover:ring-2 group-hover:ring-brand/60"
                  unoptimized
                />
              ) : (
                <span className="grid h-[60px] w-[60px] place-items-center rounded-[16px] bg-ink-card px-1 text-center text-[10px] text-neutral-400 ring-1 ring-white/10">
                  {p.name}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
