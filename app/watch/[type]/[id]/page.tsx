import { redirect } from "next/navigation";
import { slugify } from "@/lib/data";

// The where-to-watch content now lives on the canonical SEO detail page.
// Redirect any old/bookmarked /watch links there.
export default async function WatchRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ type: string; id: string }>;
  searchParams: Promise<{ name?: string }>;
}) {
  const { type, id } = await params;
  const { name } = await searchParams;
  const mt = type === "tv" ? "tv" : "movie";
  redirect(`/title/${mt}/${id}/${slugify(name || "title")}`);
}
