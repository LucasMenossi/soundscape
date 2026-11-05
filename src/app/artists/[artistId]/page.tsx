import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Disc3,
  Globe2,
  Mic2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/library/favorite-button";
import { AddToCollectionForm } from "@/components/collections/add-to-collection-form";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMusicBrainzDate } from "@/lib/format-musicbrainz-date";
import { albumService } from "@/server/services/album-service.instance";
import { artistService } from "@/server/services/artist-service.instance";
import { genreService } from "@/server/services/genre-service.instance";
import { tagService } from "@/server/services/tag-service.instance";
import { favoriteService } from "@/server/services/favorite-service.instance";
import { getOptionalCurrentUser } from "@/lib/auth/current-user";
import { collectionService } from "@/server/services/collection-service.instance";

interface ArtistPageProps {
  params: Promise<{ artistId: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: ArtistPageProps) {
  const { artistId } = await params;
  const artist = await artistService.getArtistById(artistId);

  return artist
    ? {
        title: artist.name,
        description: `Explore albums and catalog information for ${artist.name} on SoundScape.`,
      }
    : { title: "Artist not found" };
}

export default async function ArtistPage({
  params,
  searchParams,
}: ArtistPageProps) {
  const [{ artistId }, query] = await Promise.all([params, searchParams]);
  const parsedPage = Number(query.page ?? "1");
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const artist = await artistService.getArtistById(artistId);
  if (!artist) notFound();

  const currentUser = await getOptionalCurrentUser();
  const [isFavorite, collections] = currentUser
    ? await Promise.all([
        favoriteService.hasFavorite({
          userId: currentUser.id,
          entityType: "ARTIST",
          entityId: artist.id,
        }),
        collectionService.listCollections(currentUser.id),
      ])
    : [false, []];

  const discography = await albumService.getAlbumsByArtistPage(
    artist.id,
    artist.musicBrainzId,
    { page, pageSize: 12 },
  );
  const { albums } = discography;

  try {
    await genreService.syncArtistGenres(artist.id, artist.musicBrainzId);
  } catch (error) {
    console.error("[SoundScape] Failed to sync artist genres", {
      artistId: artist.id,
      musicBrainzId: artist.musicBrainzId,
      error,
    });
  }

  const [artistGenres, artistTags] = await Promise.all([
    genreService.getArtistGenres(artist.id),
    tagService.getArtistTags(artist.musicBrainzId).catch((error) => {
      console.error("[SoundScape] Failed to load artist tags", {
        artistId: artist.id,
        error,
      });
      return [];
    }),
  ]);

  const activeYears = [
    formatMusicBrainzDate(artist.beginDate),
    artist.endDate
      ? formatMusicBrainzDate(artist.endDate)
      : artist.beginDate
        ? "Present"
        : null,
  ]
    .filter(Boolean)
    .join(" – ");

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <Link
        href="/search"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Back to search
      </Link>

      <section className="relative mt-9 overflow-hidden rounded-3xl border border-border/80 bg-card/60 p-7 sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full bg-primary/10 blur-[90px]" />
        <div className="relative">
          <Badge
            variant="outline"
            className="border-primary/25 bg-primary/5 text-primary"
          >
            <Mic2 className="mr-1.5 size-3" /> Artist
          </Badge>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-.045em] sm:text-7xl">
            {artist.name}
          </h1>
          <div className="mt-6">
            {currentUser ? (
              <div className="flex flex-wrap items-start gap-3">
                <FavoriteButton
                  entityId={artist.id}
                  entityType="ARTIST"
                  isFavorite={isFavorite}
                  returnTo={`/artists/${artist.id}`}
                />
                <AddToCollectionForm
                  collections={collections}
                  entityId={artist.id}
                  entityType="ARTIST"
                  returnTo={`/artists/${artist.id}`}
                />
              </div>
            ) : (
              <Link
                href={`/sign-in?callbackURL=${encodeURIComponent(`/artists/${artist.id}`)}`}
                className="inline-flex h-9 items-center justify-center rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
              >
                Sign in to save this artist
              </Link>
            )}
          </div>
          {artist.disambiguation && (
            <p className="mt-4 max-w-2xl text-base text-muted-foreground">
              {artist.disambiguation}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {artist.countryCode && (
              <Badge variant="secondary">
                <Globe2 className="mr-1.5 size-3" /> {artist.countryCode}
              </Badge>
            )}
            {activeYears && <Badge variant="secondary">{activeYears}</Badge>}
          </div>
        </div>

        {artistGenres.length > 0 && (
          <div className="relative mt-8 flex flex-wrap gap-2">
            {artistGenres.slice(0, 12).map((genre) => (
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

        {artistTags.length > 0 && (
          <div className="relative mt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Community tags
            </p>
            <div className="flex flex-wrap gap-2">
              {artistTags.slice(0, 12).map((tag) => (
                <Badge key={tag} variant="outline" className="font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mt-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">
              The discography
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Studio albums
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The essential long-form releases.
            </p>
          </div>
          <Badge variant="outline" className="gap-1.5">
            <Disc3 className="size-3.5" /> {discography.total}{" "}
            {discography.total === 1 ? "album" : "albums"}
          </Badge>
        </div>
        <Separator className="mb-6" />
        {albums.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album, index) => (
              <li key={album.id}>
                <Link
                  href={`/albums/${album.id}`}
                  className="group block h-full"
                >
                  <Card className="h-full overflow-hidden transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/5">
                    <div className="relative flex aspect-[1.35/1] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_45%,oklch(0.32_0.06_160/55%),oklch(0.18_0.02_265))]">
                      <Disc3 className="size-16 text-foreground/20 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
                      <span className="absolute left-4 top-4 font-mono text-xs text-foreground/45">
                        {String(
                          (page - 1) * discography.pageSize + index + 1,
                        ).padStart(2, "0")}
                      </span>
                      <span className="absolute bottom-4 right-4 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[.16em] text-white/65">
                        SoundScape catalog
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="line-clamp-2 min-h-12 font-semibold leading-6 transition-colors group-hover:text-primary">
                        {album.title}
                      </h3>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">
                          {album.firstReleaseDate?.slice(0, 4) ??
                            "Year unknown"}
                        </p>
                        <div className="flex items-center gap-2">
                          {album.albumType && (
                            <Badge variant="outline">{album.albumType}</Badge>
                          )}
                          <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Card className="border-dashed bg-card/30 p-10 text-center">
            <Disc3 className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-4 font-medium">No studio albums found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              MusicBrainz has no matching release groups for this artist yet.
            </p>
          </Card>
        )}

        {discography.total > discography.pageSize && (
          <nav
            aria-label="Discography pagination"
            className="mt-6 flex items-center justify-between"
          >
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * discography.pageSize + 1}–
              {Math.min(page * discography.pageSize, discography.total)} of{" "}
              {discography.total} studio albums
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link
                  href={`/artists/${artist.id}?page=${page - 1}`}
                  className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm hover:bg-muted"
                >
                  <ChevronLeft className="size-4" /> Previous
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm text-muted-foreground opacity-50">
                  <ChevronLeft className="size-4" /> Previous
                </span>
              )}
              {page * discography.pageSize < discography.total ? (
                <Link
                  href={`/artists/${artist.id}?page=${page + 1}`}
                  className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm hover:bg-muted"
                >
                  Next <ChevronRight className="size-4" />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm text-muted-foreground opacity-50">
                  Next <ChevronRight className="size-4" />
                </span>
              )}
            </div>
          </nav>
        )}

        <p className="mt-6 text-xs leading-5 text-muted-foreground">
          Catalog data sourced from MusicBrainz. Singles, EPs, compilations,
          live albums and other secondary release types are excluded.
        </p>
      </section>
    </main>
  );
}
