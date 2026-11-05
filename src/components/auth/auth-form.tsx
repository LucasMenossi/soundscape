"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuthFormProps {
  mode: "sign-in" | "sign-up";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = safeCallbackURL(searchParams.get("callbackURL"));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (mode === "sign-up" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsPending(true);

    try {
      const result =
        mode === "sign-up"
          ? await authClient.signUp.email({
              name: name.trim(),
              email: email.trim(),
              password,
              callbackURL,
            })
          : await authClient.signIn.email({
              email: email.trim(),
              password,
              callbackURL,
            });

      if (result.error) {
        throw new Error(
          mode === "sign-up"
            ? (result.error.message ?? "Could not create your account.")
            : "Invalid email or password. Please try again.",
        );
      }

      router.replace(callbackURL);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "sign-up" && (
        <label className="block space-y-2 text-sm font-medium">
          Name
          <Input
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
          />
        </label>
      )}
      <label className="block space-y-2 text-sm font-medium">
        Email
        <Input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label className="block space-y-2 text-sm font-medium">
        Password
        <Input
          type="password"
          autoComplete={
            mode === "sign-up" ? "new-password" : "current-password"
          }
          required
          minLength={8}
          maxLength={128}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {mode === "sign-up" && (
          <span className="block text-xs font-normal text-muted-foreground">
            Use between 8 and 128 characters.
          </span>
        )}
      </label>
      {mode === "sign-up" && (
        <label className="block space-y-2 text-sm font-medium">
          Confirm password
          <Input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending
          ? "Please wait…"
          : mode === "sign-up"
            ? "Create account"
            : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {mode === "sign-up"
          ? "Already have an account? "
          : "New to SoundScape? "}
        <Link
          className="font-medium text-primary hover:underline"
          href={mode === "sign-up" ? "/sign-in" : "/sign-up"}
        >
          {mode === "sign-up" ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}

function safeCallbackURL(value: string | null): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  )
    return "/library";
  return value;
}
