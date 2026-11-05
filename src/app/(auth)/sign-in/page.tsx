import { Suspense } from "react";
import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your SoundScape account.",
};

export default function SignInPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-12 sm:py-16">
      <Link
        href="/"
        className="mb-6 inline-flex w-fit items-center text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        ← Back to SoundScape
      </Link>

      <section className="rounded-2xl border border-border/80 bg-card/70 p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Sign in to access your library and collections.
          </p>
        </div>

        <Suspense
          fallback={
            <p className="text-sm text-muted-foreground">
              Loading sign-in form…
            </p>
          }
        >
          <AuthForm mode="sign-in" />
        </Suspense>
      </section>
    </main>
  );
}
