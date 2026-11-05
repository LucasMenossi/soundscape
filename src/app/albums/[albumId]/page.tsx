import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Disc3, Mic2 } from "lucide-react";
import { albumService } from "@/server/services/album-service.instance";
import { genreService } from "@/server/services/genre-service.instance";
import { tagService } from "@/server/services/tag-service.instance";
import { favoriteService } from "@/server/services/favorite-service.instance";
import { getLibraryUserId } from "@/server/services/library-user";
import { collectionService } from "@/server/services/collection-service.instance";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/library/favorite-button";
import { AddToCollectionForm } from "@/components/collections/add-to-collection-form";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMusicBrainzDate } from "@/lib/format-musicbrainz-date";
interface AlbumPageProps {
  params: Promise<{ albumId: string }>;
}
export async function generateMetadata({ params }: AlbumPageProps) {
  const { albumId } = await params;
  const album = await albumService.getAlbumWithPrimaryArtist(albumId);
  return album
    ? {
        title: `${album.title} — ${album.primaryArtist.name}`,
        description: `Explore ${album.title} by ${album.primaryArtist.name} on SoundScape.`,
      }
    : { title: "Album not found" };
}
export default async function AlbumPage({ params }: AlbumPageProps) {
  const { albumId } = await params;
  const album = await albumService.getAlbumWithPrimaryArtist(albumId);
  if (!album) notFound();
  const libraryUserId = await getLibraryUserId();
  const [isFavorite, collections] = await Promise.all([
    favoriteService.hasFavorite({
      userId: libraryUserId,
      entityType: "ALBUM",
      entityId: album.id,
    }),
    collectionService.listCollections(libraryUserId),
  ]);
  try {
    await genreService.syncAlbumGenres(
      album.id,
      album.musicBrainzReleaseGroupId,
    );
  } catch (error) {
    console.error("[SoundScape] Failed to sync album genres", {
      albumId: album.id,
      musicBrainzReleaseGroupId: album.musicBrainzReleaseGroupId,
      error,
    });
  }
  const [albumGenres, albumTags] = await Promise.all([
    genreService.getAlbumGenres(album.id),
    tagService.getAlbumTags(album.musicBrainzReleaseGroupId).catch((error) => {
      console.error("[SoundScape] Failed to load album tags", {
        albumId: album.id,
        error,
      });
      return [];
    }),
  ]);
  const releaseDate = formatMusicBrainzDate(album.firstReleaseDate);
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <Link
        href={`/artists/${album.primaryArtist.id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        {album.primaryArtist.name}
      </Link>
      <section className="mt-9">
        <div className="grid gap-8 md:grid-cols-[minmax(240px,340px)_1fr] md:items-center">
          <div className="relative mx-auto flex aspect-square w-full max-w-[340px] items-center justify-center overflow-hidden rounded-3xl border border-border/80 bg-[radial-gradient(ellipse_at_50%_40%,oklch(0.34_0.07_160/60%),oklch(0.17_0.02_265))] shadow-2xl shadow-black/20">
            <Disc3 className="size-32 text-foreground/20" />
            <span className="absolute bottom-5 text-[10px] uppercase tracking-[.22em] text-foreground/40">
              Artwork not available
            </span>
          </div>
          <div className="py-4">
            <Badge
              variant="outline"
              className="border-primary/25 bg-primary/5 text-primary"
            >
              <Disc3 className="mr-1.5 size-3" />
              {album.albumType ?? "Album"}
            </Badge>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-[-.045em] sm:text-6xl">
              {album.title}
            </h1>
            <div className="mt-6">
              <div className="flex flex-wrap items-start gap-3">
                <FavoriteButton
                  entityId={album.id}
                  entityType="ALBUM"
                  isFavorite={isFavorite}
                  returnTo={`/albums/${album.id}`}
                />
                <AddToCollectionForm
                  collections={collections}
                  entityId={album.id}
                  entityType="ALBUM"
                  returnTo={`/albums/${album.id}`}
                />
              </div>
            </div>
            <Link
              href={`/artists/${album.primaryArtist.id}`}
              className="mt-5 inline-flex items-center gap-2 text-xl text-muted-foreground transition-colors hover:text-primary"
            >
              <Mic2 className="size-4" />
              {album.primaryArtist.name}
              <ArrowUpRight className="size-4" />
            </Link>
            <div className="mt-8 flex flex-wrap gap-2">
              {releaseDate && (
                <Badge variant="secondary">
                  First released · {releaseDate}
                </Badge>
              )}
            </div>
          </div>
        </div>
        {albumGenres.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {albumGenres.slice(0, 12).map((genre) => (
              <Link key={genre.slug} href={`/genres/${genre.slug}`}>
                <Badge
                  variant="secondary"
                  className="capitalize transition-colors hover:bg-primary/15 hover:text-primary"
                >
                  {genre.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}
        {albumTags.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Community tags
            </p>
            <div className="flex flex-wrap gap-2">
              {albumTags.slice(0, 12).map((tag) => (
                <Badge key={tag} variant="outline" className="font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </section>
      <section className="mt-16">
        <Separator className="mb-8" />
        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">
              About the record
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Album details</h2>
          </div>
          <Card className="bg-card/50 p-6">
            <p className="text-sm leading-7 text-muted-foreground">
              Album information is sourced from MusicBrainz. Release editions,
              track listings, and verified artwork will become available as the
              catalog expands. Music genres are shown above when available.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
