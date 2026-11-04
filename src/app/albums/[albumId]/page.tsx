import Link from "next/link";
import { notFound } from "next/navigation";

import { albumService } from "@/server/services/album-service.instance";

interface AlbumPageProps {
  params: Promise<{
    albumId: string;
  }>;
}

function formatReleaseDate(date: string | null): string | null {
  if (!date) {
    return null;
  }

  const [year, month, day] = date.split("-");

  if (!month) {
    return year;
  }

  if (!day) {
    return `${month}/${year}`;
  }

  return `${day}/${month}/${year}`;
}

export async function generateMetadata({ params }: AlbumPageProps) {
  const { albumId } = await params;
  const album = await albumService.getAlbumWithPrimaryArtist(albumId);

  if (!album) {
    return {
      title: "Album not found | SoundScape",
    };
  }

  return {
    title: `${album.title} — ${album.primaryArtist.name} | SoundScape`,
    description: `Explore ${album.title} by ${album.primaryArtist.name} on SoundScape.`,
  };
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { albumId } = await params;
  const album = await albumService.getAlbumWithPrimaryArtist(albumId);

  if (!album) {
    notFound();
  }

  const releaseDate = formatReleaseDate(album.firstReleaseDate);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16 sm:py-24">
      <Link
        href={`/artists/${album.primaryArtist.id}`}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← {album.primaryArtist.name}
      </Link>

      <section className="mt-12">
        <p className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
          {album.albumType ?? "Album"}
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
          {album.title}
        </h1>

        <Link
          href={`/artists/${album.primaryArtist.id}`}
          className="mt-4 inline-block text-lg text-muted-foreground transition-colors hover:text-foreground"
        >
          {album.primaryArtist.name}
        </Link>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
          {releaseDate && <span>First released: {releaseDate}</span>}
        </div>
      </section>

      <section className="mt-16 border-t border-border pt-8">
        <h2 className="text-lg font-semibold">About this album</h2>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          Album information is sourced from MusicBrainz. Release editions,
          track listings, genres, and artwork will be available as catalog
          exploration features are implemented.
        </p>
      </section>
    </main>
  );
}
