import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your SoundScape account.",
};

export default function SignInPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-primary"
      >
        ← Back to SoundScape
      </Link>
      <h1 className="mt-8 text-4xl font-semibold tracking-tight">
        Welcome back
      </h1>
      <p className="mt-2 mb-8 text-sm text-muted-foreground">
        Sign in to access your library and collections.
      </p>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Loading sign-in form…</p>
        }
      >
        <AuthForm mode="sign-in" />
      </Suspense>
    </main>
  );
}
