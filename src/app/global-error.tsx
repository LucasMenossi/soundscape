"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[SoundScape] Root layout error", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background px-5 text-foreground">
        <main className="flex w-full max-w-lg flex-col items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">
            SoundScape
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            The application couldn`&apos;`t start correctly. Please try again.
          </p>
          <Button className="mt-7" onClick={reset}>
            <RefreshCw aria-hidden="true" className="size-4" /> Try again
          </Button>
        </main>
      </body>
    </html>
  );
}
