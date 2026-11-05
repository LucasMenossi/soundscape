import Link from "next/link";
import { AudioLines, FolderHeart, Heart, Search, Tags } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { getOptionalCurrentUser } from "@/lib/auth/current-user";

export async function SiteHeader() {
  const user = await getOptionalCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group inline-flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <AudioLines className="size-5" />
          </span>
          <span className="text-base font-semibold tracking-tight">
            sound<span className="text-primary">scape</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/library"
            className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Heart className="size-4" />
            <span className="hidden sm:inline">My library</span>
          </Link>
          <Link
            href="/collections"
            className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <FolderHeart className="size-4" />
            <span className="hidden sm:inline">Collections</span>
          </Link>
          <Link
            href="/genres"
            className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Tags className="size-4" />
            <span className="hidden sm:inline">Genres</span>
          </Link>
          <Link
            href="/search"
            className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Search className="size-4" /> Explore catalog
          </Link>
          {user ? (
            <SignOutButton />
          ) : (
            <Link
              href="/sign-in"
              className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-primary transition-colors hover:bg-muted"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
