import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Disc3,
  Globe2,
  Handshake,
  Mic2,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { albumService } from "@/server/services/album-service.instance";
import { artistService } from "@/server/services/artist-service.instance";
import { genreService } from "@/server/services/genre-service.instance";
import type { ArtistRelationship } from "@/server/domain/artist";

interface ArtistPageProps {
  params: Promise<{ artistId: string }>;
}

interface RelationshipGroup {
  title: string;
  icon: typeof Users;
  items: ArtistRelationship[];
}

function groupRelationships(
  relationships: ArtistRelationship[],
): RelationshipGroup[] {
  return [
    {
      title: "Band members",
      icon: Users,
      items: relationships.filter(
        (item) => item.relationshipType === "band member",
      ),
    },
    {
      title: "Band relationships",
      icon: Users,
      items: relationships.filter(
        (item) => item.relationshipType === "band relationship",
      ),
    },
    {
      title: "Bands",
      icon: Mic2,
      items: relationships.filter(
        (item) => item.relationshipType === "member of band",
      ),
    },
    {
      title: "Collaborations",
      icon: Handshake,
      items: relationships.filter(
        (item) => item.relationshipType === "collaboration",
      ),
    },
    {
      title: "Supporting artists",
      icon: Users,
      items: relationships.filter(
        (item) =>
          item.relationshipType === "supporting artist" ||
          item.relationshipType === "supporting relationship",
      ),
    },
    {
      title: "Artists they support",
      icon: Users,
      items: relationships.filter(
        (item) => item.relationshipType === "supported artist",
      ),
    },
    {
      title: "Subgroups and side projects",
      icon: Users,
      items: relationships.filter(
        (item) => item.relationshipType === "subgroup",
      ),
    },
    {
      title: "Former names",
      icon: Mic2,
      items: relationships.filter(
        (item) => item.relationshipType === "renamed from",
      ),
    },
  ].filter((group) => group.items.length > 0);
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

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { artistId } = await params;
  const artist = await artistService.getArtistById(artistId);
  if (!artist) notFound();

  const albums = await albumService.getAlbumsByArtist(
    artist.id,
    artist.musicBrainzId,
  );

  try {
    await genreService.syncArtistGenres(artist.id, artist.musicBrainzId);
  } catch {
    // Genre metadata is optional enrichment; keep the artist page available during provider outages.
  }

  try {
    await artistService.syncArtistRelationships(
      artist.id,
      artist.musicBrainzId,
    );
  } catch (error) {
    // Keep the artist page available, but retain server-side diagnostics instead of silently hiding integration failures.
    console.error("[SoundScape] Failed to sync artist relationships", {
      artistId: artist.id,
      musicBrainzId: artist.musicBrainzId,
      error,
    });
  }

  const [artistGenres, relationships] = await Promise.all([
    genreService.getArtistGenres(artist.id),
    artistService.getArtistRelationships(artist.id),
  ]);
  const relationshipGroups = groupRelationships(relationships);
  const activeYears = [
    artist.beginDate,
    artist.endDate ?? (artist.beginDate ? "Present" : null),
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
      </section>

      {relationshipGroups.length > 0 && (
        <section className="mt-14">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">
              Artist connections
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Related artists
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Documented relationships from MusicBrainz, not algorithmic
              recommendations.
            </p>
          </div>
          <div className="space-y-8">
            {relationshipGroups.map((group) => {
              const GroupIcon = group.icon;
              return (
                <div key={group.title}>
                  <div className="mb-3 flex items-center gap-2">
                    <GroupIcon className="size-4 text-primary" />
                    <h3 className="font-medium">{group.title}</h3>
                    <Badge variant="outline">{group.items.length}</Badge>
                  </div>
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.items.map((relationship) => (
                      <li key={relationship.id}>
                        <Link
                          href={`/artists/${relationship.artist.id}`}
                          className="group block h-full"
                        >
                          <Card className="flex h-full items-center justify-between gap-3 p-4 transition-colors group-hover:border-primary/40">
                            <div className="min-w-0">
                              <p className="truncate font-medium transition-colors group-hover:text-primary">
                                {relationship.artist.name}
                              </p>
                              {relationship.artist.disambiguation && (
                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                  {relationship.artist.disambiguation}
                                </p>
                              )}
                            </div>
                            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                          </Card>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {relationshipGroups.length === 0 && (
        <section className="mt-14">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">
              Artist connections
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Related artists
            </h2>
          </div>
          <Card className="border-dashed bg-card/30 p-8">
            <p className="font-medium">No artist relationships available yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              MusicBrainz does not currently provide supported artist
              relationships for this entry, or the relationship data could not
              be synchronized. The artist catalog remains available.
            </p>
          </Card>
        </section>
      )}

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
            <Disc3 className="size-3.5" /> {albums.length}{" "}
            {albums.length === 1 ? "album" : "albums"}
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
                        {String(index + 1).padStart(2, "0")}
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
        <p className="mt-6 text-xs leading-5 text-muted-foreground">
          Catalog data sourced from MusicBrainz. Singles, EPs, compilations,
          live albums and other secondary release types are excluded.
        </p>
      </section>
    </main>
  );
}
