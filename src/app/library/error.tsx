"use client";

import { RouteError } from "@/components/feedback/route-error";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      error={error}
      reset={reset}
      title="Your library is unavailable"
      description="We couldn’t load your saved artists and albums. Please retry in a moment."
    />
  );
}
