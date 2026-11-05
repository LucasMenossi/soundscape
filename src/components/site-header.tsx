import Link from "next/link";
import {
  AudioLines,
  FolderHeart,
  Heart,
  LogIn,
  Search,
  Tags,
  UserPlus,
} from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { getOptionalCurrentUser } from "@/lib/auth/current-user";

const navLinkClass =
  "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

export async function SiteHeader() {
  const user = await getOptionalCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href="/"
          className="group inline-flex shrink-0 items-center gap-2.5"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <AudioLines className="size-5" />
          </span>
          <span className="text-base font-semibold tracking-tight">
            sound<span className="text-primary">scape</span>
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="flex min-w-0 items-center justify-end gap-1"
        >
          <Link href="/genres" aria-label="Genres" className={navLinkClass}>
            <Tags className="size-4" />
            <span className="hidden sm:inline">Genres</span>
          </Link>
          <Link
            href="/search"
            aria-label="Explore catalog"
            className={navLinkClass}
          >
            <Search className="size-4" />
            <span className="hidden sm:inline">Explore catalog</span>
          </Link>

          {user ? (
            <>
              <Link
                href="/library"
                aria-label="My library"
                className={navLinkClass}
              >
                <Heart className="size-4" />
                <span className="hidden sm:inline">My library</span>
              </Link>
              <Link
                href="/collections"
                aria-label="Collections"
                className={navLinkClass}
              >
                <FolderHeart className="size-4" />
                <span className="hidden sm:inline">Collections</span>
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                aria-label="Sign in"
                className="inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-3"
              >
                <LogIn className="size-4" />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
              <Link
                href="/sign-up"
                aria-label="Sign up"
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:px-3"
              >
                <UserPlus className="size-4 sm:hidden" />
                <span className="hidden sm:inline">Sign up</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
