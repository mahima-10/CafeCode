import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-5xl">&#9749;</div>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-muted-foreground text-sm max-w-xs">
        This page doesn&apos;t exist. Maybe the cafe moved?
      </p>
      <Link href="/">
        <Button>Back to map</Button>
      </Link>
    </div>
  );
}
