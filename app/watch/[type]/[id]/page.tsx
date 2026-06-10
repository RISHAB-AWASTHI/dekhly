import { Suspense } from "react";
import { notFound } from "next/navigation";
import WatchPlayer from "@/components/WatchPlayer";
import type { MediaType } from "@/lib/data";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  if (type !== "movie" && type !== "tv") notFound();
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <WatchPlayer type={type as MediaType} id={id} />
    </Suspense>
  );
}
