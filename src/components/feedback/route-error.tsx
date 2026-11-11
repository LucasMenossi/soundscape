"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Home, RefreshCw } from "lucide-react";
import { MainContent } from "@/components/main-content";
import { Button, buttonVariants } from "@/components/ui/button";

type RouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
};

export function RouteError({
  error,
  reset,
  title = "Something went wrong",
  description = "We couldn't load this page. Please try again. If the problem continues, come back in a moment.",
}: RouteErrorProps) {
  const lastLoggedError = useRef<Error | null>(null);

  useEffect(() => {
    // Next.js can deliberately throw this sentinel when testing error boundaries in dev.
    if (error.message === "NEXT_DEVTOOLS_SIMULATED_ERROR") return;
    // React Strict Mode re-runs effects in development; avoid duplicate diagnostics.
    if (lastLoggedError.current === error) return;

    lastLoggedError.current = error;
    console.error("[SoundScape] Route error", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <MainContent className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-20 text-center sm:px-8">
      <span className="flex size-14 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive">
        <AlertCircle aria-hidden="true" className="size-7" />
      </span>
      <p className="mt-7 text-xs font-semibold uppercase tracking-[.2em] text-primary">
        SoundScape · Something went off track
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground">
        {description}
      </p>
      {error.digest && (
        <p className="mt-4 text-xs text-muted-foreground">
          Reference: <code>{error.digest}</code>
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>
          <RefreshCw aria-hidden="true" className="size-4" /> Try again
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          <Home aria-hidden="true" className="size-4" /> Back to home
        </Link>
      </div>
      <Link
        href="/search"
        className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft aria-hidden="true" className="size-4" /> Explore the catalog
        instead
      </Link>
    </MainContent>
  );
}
