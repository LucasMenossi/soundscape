import Link from "next/link";
import { notFound } from "next/navigation";

import { artistService } from "@/server/services/artist-service.instance";
import { albumService } from "@/server/services/album-service.instance";

interface ArtistPageProps {
  params: Promise<{
    artistId: string;
  }>;
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { artistId } = await params;

  const artist = await artistService.getArtistById(artistId);

  if (!artist) {
    notFound();
  }

  const albums = await albumService.getAlbumsByArtist(
    artist.id,
    artist.musicBrainzId,
  );

  const activeYears = [
    artist.beginDate,
    artist.endDate ?? (artist.beginDate ? "Present" : null),
  ]
    .filter(Boolean)
    .join(" – ");

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16 sm:py-24">
      <Link
        href="/search"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back to search
      </Link>

      <section className="mt-12">
        <p className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Artist
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
          {artist.name}
        </h1>

        {artist.disambiguation && (
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {artist.disambiguation}
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
          {artist.countryCode && <span>Country: {artist.countryCode}</span>}

          {activeYears && <span>Active: {activeYears}</span>}
        </div>
      </section>

      <section className="mt-16 border-t border-border pt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
              Catalog
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Studio albums
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {albums.length} {albums.length === 1 ? "album" : "albums"}
          </p>
        </div>

        {albums.length > 0 ? (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <li key={album.id}>
                <Link
                  href={`/albums/${album.id}`}
                  className="group flex h-full flex-col rounded-xl border border-border p-4 transition-colors hover:border-foreground/30 hover:bg-muted/40"
                >
                  <span className="font-medium transition-colors group-hover:text-foreground">
                    {album.title}
                  </span>
                  <span className="mt-2 text-sm text-muted-foreground">
                    {album.firstReleaseDate?.slice(0, 4) ?? "Release date unknown"}
                    {album.albumType ? ` · ${album.albumType}` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-sm leading-7 text-muted-foreground">
            No release groups were found for this artist in MusicBrainz.
          </p>
        )}

        <p className="mt-6 text-xs text-muted-foreground">
          Studio album data sourced from MusicBrainz. Singles, EPs, compilations,
          live albums and other secondary release types are excluded.
        </p>
      </section>
    </main>
  );
}
