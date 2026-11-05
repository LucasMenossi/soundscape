import "server-only";

import { prisma } from "@/server/db";
import type { GenreBrowseItem } from "@/server/domain/genre";
import {
  canonicalizeGenres,
  SOUNDSCAPE_GENRES,
} from "@/server/domain/genre-taxonomy";
import type { GenreDetail, GenreRepository } from "./genre.repository";

type NormalizedGenre = { name: string; slug: string };

function normalizeGenre(name: string): NormalizedGenre | null {
  const normalized = name.trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > 80) return null;

  const slug = normalized
    .toLocaleLowerCase("en-US")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug ? { name: normalized, slug } : null;
}

function normalizeGenres(names: string[]): NormalizedGenre[] {
  const unique = new Map<string, NormalizedGenre>();

  for (const name of names) {
    const genre = normalizeGenre(name);
    if (genre) unique.set(genre.slug, genre);
  }

  return [...unique.values()];
}

export class PrismaGenreRepository implements GenreRepository {
  async syncGenreCatalog(names: string[]): Promise<void> {
    const genres = normalizeGenres(canonicalizeGenres(names));
    if (genres.length === 0) {
      throw new Error(
        "Refusing to replace the genre catalog with an empty list",
      );
    }

    // Use the full local allowlist for cleanup, not the latest upstream response.
    // A partial provider response must never delete still-valid genres and their
    // artist/album associations.
    const approvedSlugs = SOUNDSCAPE_GENRES.map((name) => normalizeGenre(name))
      .filter((genre): genre is NormalizedGenre => genre !== null)
      .map(({ slug }) => slug);

    await prisma.$transaction(async (tx) => {
      // One bulk insert avoids a long sequence of interactive-transaction upserts.
      await tx.genre.createMany({ data: genres, skipDuplicates: true });

      // Remove only values outside the permanent SoundScape allowlist. Do not
      // delete an approved genre merely because it was absent from one upstream
      // response: that would cascade-delete valid artist/album associations.
      await tx.genre.deleteMany({
        where: { slug: { notIn: approvedSlugs } },
      });
    });
  }

  async syncArtistGenres(artistId: string, names: string[]): Promise<void> {
    await this.syncEntityGenres({
      entity: "artist",
      entityId: artistId,
      names,
    });
  }

  async syncAlbumGenres(albumId: string, names: string[]): Promise<void> {
    await this.syncEntityGenres({
      entity: "album",
      entityId: albumId,
      names,
    });
  }

  private async syncEntityGenres(input: {
    entity: "artist" | "album";
    entityId: string;
    names: string[];
  }): Promise<void> {
    const genres = normalizeGenres(canonicalizeGenres(input.names));
    const isArtist = input.entity === "artist";

    await prisma.$transaction(async (tx) => {
      if (genres.length > 0) {
        await tx.genre.createMany({ data: genres, skipDuplicates: true });
      }

      const genreRecords = genres.length
        ? await tx.genre.findMany({
            where: { slug: { in: genres.map(({ slug }) => slug) } },
            select: { id: true, slug: true },
          })
        : [];

      if (genreRecords.length !== genres.length) {
        throw new Error("Failed to resolve all normalized genres");
      }

      if (isArtist) {
        await tx.artistGenre.deleteMany({
          where: { artistId: input.entityId },
        });
        if (genreRecords.length > 0) {
          await tx.artistGenre.createMany({
            data: genreRecords.map(({ id }) => ({
              artistId: input.entityId,
              genreId: id,
            })),
            skipDuplicates: true,
          });
        }
      } else {
        await tx.albumGenre.deleteMany({ where: { albumId: input.entityId } });
        if (genreRecords.length > 0) {
          await tx.albumGenre.createMany({
            data: genreRecords.map(({ id }) => ({
              albumId: input.entityId,
              genreId: id,
            })),
            skipDuplicates: true,
          });
        }
      }
    });
  }

  async getArtistGenres(artistId: string) {
    const rows = await prisma.artistGenre.findMany({
      where: { artistId },
      include: { genre: true },
      orderBy: { genre: { name: "asc" } },
    });
    return rows.map(({ genre }) => ({ name: genre.name, slug: genre.slug }));
  }

  async getAlbumGenres(albumId: string) {
    const rows = await prisma.albumGenre.findMany({
      where: { albumId },
      include: { genre: true },
      orderBy: { genre: { name: "asc" } },
    });
    return rows.map(({ genre }) => ({ name: genre.name, slug: genre.slug }));
  }

  async listGenres(): Promise<GenreBrowseItem[]> {
    const records = await prisma.genre.findMany({
      include: { _count: { select: { artists: true, albums: true } } },
      orderBy: { name: "asc" },
    });
    return records.map((record) => ({
      id: record.id,
      name: record.name,
      slug: record.slug,
      artistCount: record._count.artists,
      albumCount: record._count.albums,
    }));
  }

  async findBySlug(
    slug: string,
    options: { artistsPage?: number; albumsPage?: number; pageSize?: number } = {},
  ): Promise<GenreDetail | null> {
    const pageSize = Math.min(Math.max(options.pageSize ?? 12, 1), 50);
    const artistsPage = Math.max(options.artistsPage ?? 1, 1);
    const albumsPage = Math.max(options.albumsPage ?? 1, 1);
    const artistSkip = (artistsPage - 1) * pageSize;
    const albumSkip = (albumsPage - 1) * pageSize;
    const record = await prisma.genre.findUnique({
      where: { slug },
      include: {
        _count: { select: { artists: true, albums: true } },
        artists: {
          include: { artist: true },
          orderBy: { artist: { name: "asc" } },
          skip: artistSkip,
          take: pageSize,
        },
        albums: {
          include: { album: { include: { primaryArtist: true } } },
          orderBy: [
            { album: { firstReleaseDate: "desc" } },
            { album: { title: "asc" } },
          ],
          skip: albumSkip,
          take: pageSize,
        },
      },
    });
    if (!record) return null;

    return {
      pagination: {
        artistsPage,
        albumsPage,
        pageSize,
        artistTotal: record._count.artists,
        albumTotal: record._count.albums,
      },
      genre: {
        id: record.id,
        name: record.name,
        slug: record.slug,
        artistCount: record._count.artists,
        albumCount: record._count.albums,
      },
      artists: record.artists.map(({ artist }) => ({
        id: artist.id,
        name: artist.name,
        disambiguation: artist.disambiguation,
        countryCode: artist.countryCode,
      })),
      albums: record.albums.map(({ album }) => ({
        id: album.id,
        title: album.title,
        firstReleaseDate: album.firstReleaseDate,
        albumType: album.albumType,
        artist: { id: album.primaryArtist.id, name: album.primaryArtist.name },
      })),
    };
  }
}
