import BrowseClient from "@/components/BrowseClient";
import { getCatalog, getRegionProviders } from "@/lib/tmdb";

export default async function HomePage() {
  const [{ featured, rows }, platforms] = await Promise.all([
    getCatalog(),
    getRegionProviders("movie", "IN"),
  ]);
  return <BrowseClient featured={featured} rows={rows} platforms={platforms} />;
}
