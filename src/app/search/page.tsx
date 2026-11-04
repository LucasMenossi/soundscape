import Link from "next/link";

import { CatalogSearchForm } from "@/components/search/catalog-search-form";
import { MusicBrainzError } from "@/server/providers/musicbrainz/client";
import { albumService } from "@/server/services/album-service.instance";
import { artistService } from "@/server/services/artist-service.instance";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string | string[];
  }>;
}

export const metadata = {
  title: "Search",
  description: "Search for artists and albums in the SoundScape music catalog.",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = rawQuery?.trim().slice(0, 100) ?? "";

  let artistResults = null;
  let albumResults = null;
  let searchFailed = false;

  if (query) {
    try {
      [artistResults, albumResults] = await Promise.all([
        artistService.searchArtists(query, { limit: 10 }),
        albumService.searchAlbums(query, { limit: 10 }),
      ]);
    } catch (error) {
      if (error instanceof MusicBrainzError) {
        searchFailed = true;
      } else {
        throw error;
      }
    }
  }

  const totalResults =
    (artistResults?.results.length ?? 0) + (albumResults?.results.length ?? 0);

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
          Search the catalog
        </h1>

        <p className="mt-3 text-muted-foreground">
          Find artists and albums in the SoundScape music catalog.
        </p>
      </div>

      <CatalogSearchForm defaultValue={query} />

      {!query && (
        <div className="mt-16 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <h2 className="font-medium">Start exploring</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter an artist or album name to discover music.
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

      {query && !searchFailed && (
        <div className="mt-12 space-y-12">
          <p className="text-sm text-muted-foreground">
            {totalResults} {totalResults === 1 ? "result" : "results"} found
            across artists and albums.
          </p>

          <section aria-labelledby="artist-results-heading">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 id="artist-results-heading" className="text-lg font-semibold">
                Artists
              </h2>
              <span className="text-sm text-muted-foreground">
                {artistResults?.count ?? 0} found
              </span>
            </div>

            {!artistResults?.results.length ? (
              <p className="rounded-xl border border-dashed border-border px-6 py-8 text-sm text-muted-foreground">
                No artists found for this search.
              </p>
            ) : (
              <div className="divide-y divide-border rounded-xl border border-border">
                {artistResults.results.map(({ artist }) => (
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
                    <span aria-hidden="true" className="shrink-0 text-muted-foreground">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="album-results-heading">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 id="album-results-heading" className="text-lg font-semibold">
                Albums
              </h2>
              <span className="text-sm text-muted-foreground">
                {albumResults?.count ?? 0} found
              </span>
            </div>

            {!albumResults?.results.length ? (
              <p className="rounded-xl border border-dashed border-border px-6 py-8 text-sm text-muted-foreground">
                No albums found for this search.
              </p>
            ) : (
              <div className="divide-y divide-border rounded-xl border border-border">
                {albumResults.results.map(({ album, primaryArtistName }) => (
                  <Link
                    key={album.id}
                    href={`/albums/${album.id}`}
                    className="group flex items-center justify-between gap-4 p-5 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
                  >
                    <div className="min-w-0">
                      <h3 className="truncate font-medium transition-colors group-hover:text-primary">
                        {album.title}
                      </h3>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {primaryArtistName}
                        {album.firstReleaseDate ? ` · ${album.firstReleaseDate.slice(0, 4)}` : ""}
                        {album.albumType ? ` · ${album.albumType}` : ""}
                      </p>
                    </div>
                    <span aria-hidden="true" className="shrink-0 text-muted-foreground">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
