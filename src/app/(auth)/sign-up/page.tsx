import Link from "next/link";
import { Suspense } from "react";

import { AuthForm } from "@/components/auth/auth-form";
import { MainContent } from "@/components/main-content";

export const metadata = {
  title: "Create account",
  description: "Create your SoundScape account.",
};

export default function SignUpPage() {
  return (
    <MainContent className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-12 sm:py-16">
      <Link
        href="/"
        className="mb-6 inline-flex w-fit items-center text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        ← Back to SoundScape
      </Link>

      <section className="rounded-2xl border border-border/80 bg-card/70 p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Save artists, albums, and collections in your personal library.
          </p>
        </div>

        <Suspense
          fallback={
            <p className="text-sm text-muted-foreground">
              Loading sign-up form…
            </p>
          }
        >
          <AuthForm mode="sign-up" />
        </Suspense>
      </section>
    </MainContent>
  );
}
