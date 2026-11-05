import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = {
  title: "Create account",
  description: "Create your SoundScape account.",
};

export default function SignUpPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-primary"
      >
        ← Back to SoundScape
      </Link>
      <h1 className="mt-8 text-4xl font-semibold tracking-tight">
        Create your account
      </h1>
      <p className="mt-2 mb-8 text-sm text-muted-foreground">
        Create an account to save artists, albums, and collections in your
        personal library.
      </p>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Loading sign-up form…</p>
        }
      >
        <AuthForm mode="sign-up" />
      </Suspense>
    </main>
  );
}
