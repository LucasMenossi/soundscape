import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Disc3,
  Mic2,
  Tags,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { genreService } from "@/server/services/genre-service.instance";
import { MainContent } from "@/components/main-content";
import { formatMusicBrainzCountry } from "@/lib/format-musicbrainz-country";

interface GenrePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ artistsPage?: string; albumsPage?: string }>;
}
export async function generateMetadata({ params }: GenrePageProps) {
  const { slug } = await params;
  const data = await genreService.getGenreBySlug(slug);
  return data
    ? {
        title: data.genre.name,
        description: `Explore artists and albums classified as ${data.genre.name} in the SoundScape catalog.`,
      }
    : { title: "Genre not found" };
}
function PaginationControls({
  page,
  pageSize,
  total,
  slug,
  label,
  queryKey,
  otherPage,
  otherKey,
}: {
  page: number;
  pageSize: number;
  total: number;
  slug: string;
  label: string;
  queryKey: "artistsPage" | "albumsPage";
  otherPage: number;
  otherKey: "artistsPage" | "albumsPage";
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (pageCount <= 1) return null;
  const href = (nextPage: number) =>
    `/genres/${slug}?${queryKey}=${nextPage}&${otherKey}=${otherPage}`;

  return (
    <nav
      aria-label={`${label} pagination`}
      className="mt-6 flex items-center justify-between"
    >
      <p className="text-xs text-muted-foreground">
        Page {page} of {pageCount}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={href(page - 1)}
            className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm hover:bg-muted"
          >
            <ChevronLeft className="size-4" /> Previous
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm text-muted-foreground opacity-50">
            <ChevronLeft className="size-4" /> Previous
          </span>
        )}
        {page < pageCount ? (
          <Link
            href={href(page + 1)}
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
  );
}

export default async function GenrePage({
  params,
  searchParams,
}: GenrePageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const parsedArtistsPage = Number(query.artistsPage ?? "1");
  const parsedAlbumsPage = Number(query.albumsPage ?? "1");
  const artistsPage =
    Number.isInteger(parsedArtistsPage) && parsedArtistsPage > 0
      ? parsedArtistsPage
      : 1;
  const albumsPage =
    Number.isInteger(parsedAlbumsPage) && parsedAlbumsPage > 0
      ? parsedAlbumsPage
      : 1;
  const data = await genreService.getGenreBySlug(slug, {
    artistsPage,
    albumsPage,
    pageSize: 12,
  });
  if (!data) notFound();
  return (
    <MainContent className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <Link
        href="/genres"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" /> All genres
      </Link>
      <header className="mt-9">
        <Badge
          variant="outline"
          className="border-primary/25 bg-primary/5 text-primary"
        >
          <Tags className="mr-1.5 size-3" /> SoundScape genre
        </Badge>
        <h1 className="mt-5 text-5xl font-semibold capitalize tracking-[-.05em] sm:text-6xl">
          {data.genre.name}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {data.genre.artistCount} artists · {data.genre.albumCount} albums in
          the local catalog
        </p>
      </header>
      <section className="mt-14">
        <div className="flex items-center gap-3">
          <Mic2 className="size-5 text-primary" />
          <h2 className="text-2xl font-semibold">Artists</h2>
          <Badge variant="secondary">{data.genre.artistCount}</Badge>
        </div>
        <Separator className="my-5" />
        {data.artists.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.artists.map((artist) => (
              <Link
                key={artist.id}
                href={`/artists/${artist.id}`}
                className="group"
              >
                <Card className="flex h-full items-center justify-between p-4 group-hover:border-primary/40">
                  <div className="min-w-0">
                    <h3 className="truncate font-medium group-hover:text-primary">
                      {artist.name}
                    </h3>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {artist.disambiguation ??
                        formatMusicBrainzCountry(artist.countryCode) ??
                        "Artist"}
                    </p>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No artists in this genre have been added to the local catalog yet.
          </p>
        )}
        <PaginationControls
          page={data.pagination.artistsPage}
          pageSize={data.pagination.pageSize}
          total={data.pagination.artistTotal}
          slug={slug}
          label="artists"
          queryKey="artistsPage"
          otherPage={data.pagination.albumsPage}
          otherKey="albumsPage"
        />
      </section>
      <section className="mt-14">
        <div className="flex items-center gap-3">
          <Disc3 className="size-5 text-primary" />
          <h2 className="text-2xl font-semibold">Albums</h2>
          <Badge variant="secondary">{data.genre.albumCount}</Badge>
        </div>
        <Separator className="my-5" />
        {data.albums.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.albums.map((album) => (
              <Link
                key={album.id}
                href={`/albums/${album.id}`}
                className="group"
              >
                <Card className="h-full p-5 group-hover:border-primary/40">
                  <h3 className="font-medium group-hover:text-primary">
                    {album.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {album.artist.name}
                    {album.firstReleaseDate
                      ? ` · ${album.firstReleaseDate.slice(0, 4)}`
                      : ""}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No albums in this genre have been added to the local catalog yet.
          </p>
        )}
        <PaginationControls
          page={data.pagination.albumsPage}
          pageSize={data.pagination.pageSize}
          total={data.pagination.albumTotal}
          slug={slug}
          label="albums"
          queryKey="albumsPage"
          otherPage={data.pagination.artistsPage}
          otherKey="artistsPage"
        />
      </section>
      <p className="mt-10 text-xs text-muted-foreground">
        Genre names come from the curated SoundScape genre vocabulary. Counts
        and results represent the local SoundScape catalog, not the full
        MusicBrainz database.
      </p>
    </MainContent>
  );
}
