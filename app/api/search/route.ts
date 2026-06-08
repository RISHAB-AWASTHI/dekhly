import { type NextRequest } from "next/server";
import { searchTitles } from "@/lib/tmdb";

// Runs server-side so the TMDB key never reaches the browser.
// Returns [] when no key is configured — the client then falls back
// to filtering the built-in curated catalog.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const results = await searchTitles(q);
  return Response.json({ results });
}
