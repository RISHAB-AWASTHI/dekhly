/* ---------------- Affiliate / deep links ----------------
   Turns a TMDB watch-provider name into a direct link on that platform's
   official site (search for the title). This is where you plug in affiliate
   tags once you're approved for each program — e.g. Amazon Associates.

   How earning works here:
   - Sign up for each platform's affiliate / referral program.
   - Put your IDs in the env vars below.
   - When a user clicks "Watch on <platform>", the tag travels with them and
     any resulting signup/purchase pays you a commission.

   Nothing is hosted or embedded — we only refer users to legal platforms. */

const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || "";
const APPLE_TOKEN = process.env.NEXT_PUBLIC_APPLE_AFFILIATE_TOKEN || "";

const enc = (s: string) => encodeURIComponent(s);

/**
 * Build a direct link to the platform for a given title.
 * Falls back to the JustWatch aggregator page (TMDB-provided) when we don't
 * have a known mapping for the provider.
 */
export function providerLink(
  providerName: string,
  title: string,
  fallback: string | null,
): string {
  const q = enc(title);
  const name = providerName.toLowerCase();

  if (name.includes("netflix")) return `https://www.netflix.com/search?q=${q}`;

  if (name.includes("amazon") || name.includes("prime")) {
    const base = `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${q}`;
    return AMAZON_TAG ? `${base}&tag=${AMAZON_TAG}` : base;
  }

  if (name.includes("hotstar") || name.includes("disney"))
    return `https://www.hotstar.com/in/search?q=${q}`;

  if (name.includes("jio")) return `https://www.jiocinema.com/search/${q}`;

  if (name.includes("zee")) return `https://www.zee5.com/search?q=${q}`;

  if (name.includes("sony") || name.includes("liv"))
    return `https://www.sonyliv.com/search?searchTerm=${q}`;

  if (name.includes("apple")) {
    const base = `https://tv.apple.com/search?term=${q}`;
    return APPLE_TOKEN ? `${base}&at=${APPLE_TOKEN}` : base;
  }

  if (name.includes("youtube"))
    return `https://www.youtube.com/results?search_query=${q}`;

  if (name.includes("mubi"))
    return `https://mubi.com/en/search/films?query=${q}`;

  if (name.includes("lionsgate"))
    return `https://www.lionsgateplay.com/search?q=${q}`;

  if (name.includes("crunchyroll"))
    return `https://www.crunchyroll.com/search?q=${q}`;

  // Unknown platform → JustWatch page (legal aggregator) or TMDB.
  return fallback ?? `https://www.themoviedb.org/search?query=${q}`;
}

/** Logo URL for a TMDB watch-provider. */
export const providerLogo = (logoPath: string | null) =>
  logoPath
    ? `https://image.tmdb.org/t/p/original${logoPath}`
    : "https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg";
