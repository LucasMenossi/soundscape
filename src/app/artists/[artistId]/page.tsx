import Link from "next/link";
import { notFound } from "next/navigation";

import { artistService } from "@/server/services/artist-service.instance";

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
        <h2 className="text-lg font-semibold">About this artist</h2>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          Artist information is sourced from MusicBrainz. More details, genres,
          discography, and related artists will be available as the catalog
          exploration features are implemented.
        </p>
      </section>
    </main>
  );
}
