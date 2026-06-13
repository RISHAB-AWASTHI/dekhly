import { type NextRequest } from "next/server";
import { getTitleExtras } from "@/lib/tmdb";
import type { MediaType } from "@/lib/data";

// Server-side cast + recommendations lookup for the detail modal.
export async function GET(req: NextRequest) {
  const type = (req.nextUrl.searchParams.get("type") === "tv"
    ? "tv"
    : "movie") as MediaType;
  const id = req.nextUrl.searchParams.get("id") ?? "";
  const data = await getTitleExtras(type, id);
  return Response.json(data);
}
