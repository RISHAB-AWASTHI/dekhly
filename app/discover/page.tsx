import DiscoverClient from "@/components/DiscoverClient";
import { discoverTitles, getRegionProviders } from "@/lib/tmdb";
import type { MediaType } from "@/lib/data";
import type { DiscoverFilters } from "@/lib/tmdb";

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    genres?: string;
    sort?: string;
    providers?: string;
  }>;
}) {
  const sp = await searchParams;
  const mediaType: MediaType = sp.type === "tv" ? "tv" : "movie";
  const toNums = (s?: string) =>
    (s || "")
      .split(",")
      .map(Number)
      .filter((n) => !Number.isNaN(n) && n > 0);
  const genres = toNums(sp.genres);
  const providersSel = toNums(sp.providers);
  const sort = (["popular", "rating", "newest"].includes(sp.sort || "")
    ? sp.sort
    : "popular") as DiscoverFilters["sort"];

  const [{ titles }, providers] = await Promise.all([
    discoverTitles({
      type: mediaType,
      region: "IN",
      sort,
      genres,
      providers: providersSel,
    }),
    getRegionProviders(mediaType, "IN"),
  ]);

  return (
    <DiscoverClient
      initialTitles={titles}
      initialProviders={providers}
      initialType={mediaType}
      initialGenres={genres}
      initialSort={sort}
      initialProvidersSel={providersSel}
    />
  );
}
