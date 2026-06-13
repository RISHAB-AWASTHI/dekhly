import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/tmdb";
import { titleHref, type Title } from "@/lib/data";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://dekhly.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let titleUrls: MetadataRoute.Sitemap = [];
  try {
    const { rows } = await getCatalog();
    const map = new Map<string, Title>();
    rows.flatMap((r) => r.titles).forEach((t) => map.set(t.id, t));
    titleUrls = [...map.values()].map((t) => ({
      url: `${BASE}${titleHref(t)}`,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    /* no key / offline — ship the static pages only */
  }

  return [
    { url: BASE, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/discover`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/search`, changeFrequency: "monthly", priority: 0.5 },
    ...titleUrls,
  ];
}
