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
      title="Account page unavailable"
      description="We couldn’t load this account page. Please retry in a moment."
    />
  );
}
