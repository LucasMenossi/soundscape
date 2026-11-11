import Link from "next/link";
import { ArrowUpRight, Disc3, Mic2, Search as SearchIcon } from "lucide-react";
import { CatalogSearchForm } from "@/components/search/catalog-search-form";
import { MusicBrainzError } from "@/server/providers/musicbrainz/client";
import { albumService } from "@/server/services/album-service.instance";
import { artistService } from "@/server/services/artist-service.instance";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { MainContent } from "@/components/main-content";
import { formatMusicBrainzCountry } from "@/lib/format-musicbrainz-country";
interface SearchPageProps {
  searchParams: Promise<{ q?: string | string[] }>;
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
      if (error instanceof MusicBrainzError) searchFailed = true;
      else throw error;
    }
  }
  const totalResults =
    (artistResults?.results.length ?? 0) + (albumResults?.results.length ?? 0);
  return (
    <MainContent className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <div className="mb-9">
        <Link
          href="/"
          className="text-xs font-medium uppercase tracking-[.18em] text-muted-foreground transition-colors hover:text-primary"
        >
          ← SoundScape
        </Link>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">
              Catalog search
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Find your sound.
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Explore artists and albums from the music universe.
            </p>
          </div>
          {query && (
            <Badge variant="outline" className="mb-1">
              {totalResults} {totalResults === 1 ? "result" : "results"}
            </Badge>
          )}
        </div>
      </div>
      <CatalogSearchForm defaultValue={query} />
      {!query && (
        <Card className="mt-10 flex flex-col items-center border-dashed bg-card/40 px-6 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <SearchIcon className="size-5" />
          </div>
          <h2 className="mt-5 text-lg font-semibold">
            Your next discovery starts here
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Search for an artist or album to explore the catalog and discover
            new connections.
          </p>
        </Card>
      )}
      {searchFailed && (
        <Alert className="mt-10">
          <h2 className="font-semibold text-foreground">
            Catalog temporarily unavailable
          </h2>
          <p className="mt-1 text-muted-foreground">
            We couldn’t reach MusicBrainz. Please try again in a moment.
          </p>
        </Alert>
      )}
      {query && !searchFailed && (
        <div className="mt-12 space-y-12">
          <section aria-labelledby="artist-results-heading">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Mic2 className="size-4" />
                </div>
                <div>
                  <h2 id="artist-results-heading" className="font-semibold">
                    Artists
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    People and groups
                  </p>
                </div>
              </div>
              <Badge variant="secondary">{artistResults?.count ?? 0}</Badge>
            </div>
            {!artistResults?.results.length ? (
              <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                No artists found for this search.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {artistResults.results.map(({ artist }) => (
                  <Link
                    key={artist.id}
                    href={`/artists/${artist.id}`}
                    className="group"
                  >
                    <Card className="flex h-full items-center justify-between p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-primary/35 group-hover:bg-card">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                          <Mic2 className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate font-medium group-hover:text-primary">
                            {artist.name}
                          </h3>
                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {artist.disambiguation ??
                              formatMusicBrainzCountry(artist.countryCode) ??
                              "Artist"}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>
          <Separator />
          <section aria-labelledby="album-results-heading">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Disc3 className="size-4" />
                </div>
                <div>
                  <h2 id="album-results-heading" className="font-semibold">
                    Albums
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Records and releases
                  </p>
                </div>
              </div>
              <Badge variant="secondary">{albumResults?.count ?? 0}</Badge>
            </div>
            {!albumResults?.results.length ? (
              <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                No albums found for this search.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {albumResults.results.map(({ album, primaryArtistName }) => (
                  <Link
                    key={album.id}
                    href={`/albums/${album.id}`}
                    className="group"
                  >
                    <Card className="flex h-full items-center justify-between p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-primary/35 group-hover:bg-card">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                          <Disc3 className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate font-medium group-hover:text-primary">
                            {album.title}
                          </h3>
                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {primaryArtistName}
                            {album.firstReleaseDate
                              ? ` · ${album.firstReleaseDate.slice(0, 4)}`
                              : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {album.albumType && (
                          <Badge variant="outline">{album.albumType}</Badge>
                        )}
                        <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </MainContent>
  );
}
