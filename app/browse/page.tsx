import BrowseClient from "@/components/BrowseClient";
import { getCatalog } from "@/lib/tmdb";

export default async function BrowsePage() {
  const { featured, rows } = await getCatalog();
  return <BrowseClient featured={featured} rows={rows} />;
}
