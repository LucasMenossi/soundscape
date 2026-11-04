import Link from "next/link";

import { ArtistSearchForm } from "@/components/search/artist-search-form";
import { MusicBrainzError } from "@/server/providers/musicbrainz/client";
import { artistService } from "@/server/services/artist-service.instance";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string | string[];
  }>;
}

export const metadata = {
  title: "Search",
  description: "Search for artists in the SoundScape music catalog.",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = rawQuery?.trim().slice(0, 100) ?? "";

  let searchResult = null;
  let searchFailed = false;

  if (query) {
    try {
      searchResult = await artistService.searchArtists(query, {
        limit: 10,
      });
    } catch (error) {
      if (error instanceof MusicBrainzError) {
        searchFailed = true;
      } else {
        throw error;
      }
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16 sm:py-24">
      <div className="mb-10">
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← SoundScape
        </Link>

        <h1 className="mt-8 text-3xl font-semibold tracking-tight sm:text-4xl">
          Search artists
        </h1>

        <p className="mt-3 text-muted-foreground">
          Find artists and explore their music catalog.
        </p>
      </div>

      <ArtistSearchForm defaultValue={query} />

      {!query && (
        <div className="mt-16 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <h2 className="font-medium">Start exploring</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter an artist name to discover their catalog.
          </p>
        </div>
      )}

      {searchFailed && (
        <div
          role="alert"
          className="mt-10 rounded-xl border border-destructive/30 bg-destructive/5 p-6"
        >
          <h2 className="font-medium">Search temporarily unavailable</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We couldn&apos;t reach the music catalog. Please try again in a
            moment.
          </p>
        </div>
      )}

      {searchResult && (
        <section className="mt-12" aria-labelledby="search-results-heading">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 id="search-results-heading" className="text-lg font-semibold">
              Results
            </h2>

            <span className="text-sm text-muted-foreground">
              {searchResult.count}{" "}
              {searchResult.count === 1 ? "artist" : "artists"} found
            </span>
          </div>

          {searchResult.results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
              <h3 className="font-medium">No artists found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try another artist name or check your spelling.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border rounded-xl border border-border">
              {searchResult.results.map(({ artist }) => (
                <Link
                  key={artist.id}
                  href={`/artists/${artist.id}`}
                  className="group flex items-center justify-between gap-4 p-5 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
                >
                  <div className="min-w-0">
                    <h3 className="truncate font-medium transition-colors group-hover:text-primary">
                      {artist.name}
                    </h3>

                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {artist.disambiguation ?? artist.countryCode ?? "Artist"}
                    </p>
                  </div>

                  <span
                    aria-hidden="true"
                    className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              ))}
            </div>
          )}

          {searchResult.count > searchResult.results.length && (
            <p className="mt-4 text-sm text-muted-foreground">
              Showing {searchResult.results.length} of {searchResult.count}{" "}
              results.
            </p>
          )}
        </section>
      )}
    </main>
  );
}
