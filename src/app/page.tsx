import Link from "next/link";

import { ArtistSearchForm } from "@/components/search/artist-search-form";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-24">
      <p className="mb-4 text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
        Music discovery
      </p>

      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
        Find your next favorite artist.
      </h1>

      <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
        Explore artists, albums, genres, and the connections between them.
        Discover music beyond what you already know.
      </p>

      <div className="mt-10 max-w-2xl">
        <ArtistSearchForm />
      </div>

      <p className="mt-5 text-sm text-muted-foreground">
        No streaming. Just music discovery.
      </p>

      <div className="mt-16">
        <Link
          href="/search"
          className="text-sm font-medium underline underline-offset-4 transition-colors hover:text-primary"
        >
          Explore the catalog
        </Link>
      </div>
    </main>
  );
}
