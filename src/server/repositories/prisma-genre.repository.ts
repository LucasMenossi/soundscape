import "server-only";

import { prisma } from "@/server/db";
import type { GenreBrowseItem } from "@/server/domain/genre";
import type { GenreDetail, GenreRepository } from "./genre.repository";

function normalizeGenre(name: string): { name: string; slug: string } | null {
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

function normalizeGenres(names: string[]) {
  const unique = new Map<string, { name: string; slug: string }>();
  for (const name of names) {
    const genre = normalizeGenre(name);
    if (genre) unique.set(genre.slug, genre);
  }
  return [...unique.values()];
}

export class PrismaGenreRepository implements GenreRepository {
  async syncGenreCatalog(names: string[]): Promise<void> {
    const genres = normalizeGenres(names);
    if (genres.length === 0) {
      throw new Error(
        "Refusing to replace the genre catalog with an empty list",
      );
    }

    const slugs = genres.map(({ slug }) => slug);
    await prisma.$transaction(async (tx) => {
      for (const genre of genres) {
        await tx.genre.upsert({
          where: { slug: genre.slug },
          create: genre,
          update: { name: genre.name },
        });
      }

      // Remove legacy free-form tags that are not part of MusicBrainz' curated taxonomy.
      await tx.genre.deleteMany({ where: { slug: { notIn: slugs } } });
    });
  }

  async syncArtistGenres(artistId: string, names: string[]): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.artistGenre.deleteMany({ where: { artistId } });
      for (const genreData of normalizeGenres(names)) {
        const genre = await tx.genre.upsert({
          where: { slug: genreData.slug },
          create: genreData,
          update: { name: genreData.name },
        });
        await tx.artistGenre.upsert({
          where: { artistId_genreId: { artistId, genreId: genre.id } },
          create: { artistId, genreId: genre.id },
          update: {},
        });
      }
    });
  }

  async syncAlbumGenres(albumId: string, names: string[]): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.albumGenre.deleteMany({ where: { albumId } });
      for (const genreData of normalizeGenres(names)) {
        const genre = await tx.genre.upsert({
          where: { slug: genreData.slug },
          create: genreData,
          update: { name: genreData.name },
        });
        await tx.albumGenre.upsert({
          where: { albumId_genreId: { albumId, genreId: genre.id } },
          create: { albumId, genreId: genre.id },
          update: {},
        });
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

  async findBySlug(slug: string): Promise<GenreDetail | null> {
    const record = await prisma.genre.findUnique({
      where: { slug },
      include: {
        _count: { select: { artists: true, albums: true } },
        artists: {
          include: { artist: true },
          orderBy: { artist: { name: "asc" } },
          take: 30,
        },
        albums: {
          include: { album: { include: { primaryArtist: true } } },
          orderBy: { album: { firstReleaseDate: "desc" } },
          take: 30,
        },
      },
    });
    if (!record) return null;
    return {
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
