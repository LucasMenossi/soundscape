import Link from "next/link";
import { MainContent } from "@/components/main-content";

export const metadata = {
  title: "Verify your email",
  description: "Verify your SoundScape email address.",
};

export default function VerifyEmailPage() {
  return (
    <MainContent className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Verify your email
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Open the verification link we sent to your inbox. Once your email is
        verified, you can continue to your personal library.
      </p>
      <Link
        href="/sign-in"
        className="mt-6 inline-flex text-sm font-medium text-primary hover:underline"
      >
        Return to sign in
      </Link>
    </MainContent>
  );
}
