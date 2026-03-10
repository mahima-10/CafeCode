"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CafeErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-5xl">&#9749;</div>
      <h1 className="text-2xl font-bold">Couldn&apos;t load this cafe</h1>
      <p className="text-muted-foreground text-sm max-w-xs">
        Something went wrong fetching the details.
      </p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={reset}>Try again</Button>
        <Link href="/"><Button>Back to map</Button></Link>
      </div>
    </div>
  );
}
