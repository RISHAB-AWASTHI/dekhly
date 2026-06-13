import { type NextRequest } from "next/server";
import { discoverTitles, getRegionProviders } from "@/lib/tmdb";
import type { MediaType } from "@/lib/data";
import type { DiscoverFilters } from "@/lib/tmdb";

// Server-side discovery so the TMDB key never reaches the browser.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const type = (sp.get("type") === "tv" ? "tv" : "movie") as MediaType;
  const region = (sp.get("region") || "IN").toUpperCase();
  const page = Number(sp.get("page") || "1");

  const nums = (key: string) =>
    (sp.get(key) || "")
      .split(",")
      .map(Number)
      .filter((n) => !Number.isNaN(n) && n > 0);

  const filters: DiscoverFilters = {
    type,
    region,
    page,
    genres: nums("genres"),
    providers: nums("providers"),
    sort: (sp.get("sort") as DiscoverFilters["sort"]) || "popular",
    decade: Number(sp.get("decade") || "0") || undefined,
    minRating: Number(sp.get("minRating") || "0") || undefined,
  };

  const result = await discoverTitles(filters);

  // Only ship the platform list on the first page of a region (saves payload).
  const providers = page <= 1 ? await getRegionProviders(type, region) : [];

  return Response.json({ ...result, providers });
}
