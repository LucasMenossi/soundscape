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
      title="This genre is unavailable"
      description="We couldn’t load the artists and albums for this genre. Please retry in a moment."
    />
  );
}
