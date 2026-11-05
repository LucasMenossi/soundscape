import { beforeEach, describe, expect, it, vi } from "vitest";

const { tx, prismaMock } = vi.hoisted(() => {
  const tx = {
    genre: {
      createMany: vi.fn(),
      deleteMany: vi.fn(),
      findMany: vi.fn(),
    },
    artistGenre: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    albumGenre: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
  };

  return {
    tx,
    prismaMock: {
      $transaction: vi.fn(),
      genre: { findMany: vi.fn(), findUnique: vi.fn() },
      artistGenre: { findMany: vi.fn() },
      albumGenre: { findMany: vi.fn() },
    },
  };
});

vi.mock("@/server/db", () => ({ prisma: prismaMock }));

import { SOUNDSCAPE_GENRES } from "@/server/domain/genre-taxonomy";
import { PrismaGenreRepository } from "./prisma-genre.repository";

describe("PrismaGenreRepository synchronization", () => {
  const repository = new PrismaGenreRepository();

  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback) => callback(tx));
    tx.genre.createMany.mockResolvedValue({ count: 0 });
    tx.genre.deleteMany.mockResolvedValue({ count: 0 });
    tx.genre.findMany.mockResolvedValue([]);
    tx.artistGenre.deleteMany.mockResolvedValue({ count: 0 });
    tx.artistGenre.createMany.mockResolvedValue({ count: 0 });
    tx.albumGenre.deleteMany.mockResolvedValue({ count: 0 });
    tx.albumGenre.createMany.mockResolvedValue({ count: 0 });
  });

  it("rejects an empty global catalog without touching the database", async () => {
    await expect(repository.syncGenreCatalog([])).rejects.toThrow(
      "Refusing to replace the genre catalog with an empty list",
    );
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("bulk inserts the approved catalog and removes obsolete vocabulary", async () => {
    await repository.syncGenreCatalog([
      "Alternative rock",
      "alternative rock",
      " Jazz ",
    ]);

    expect(tx.genre.createMany).toHaveBeenCalledWith({
      data: [
        { name: "Alternative rock", slug: "alternative-rock" },
        { name: "Jazz", slug: "jazz" },
      ],
      skipDuplicates: true,
    });
    const cleanup = vi.mocked(tx.genre.deleteMany).mock.calls[0]?.[0];
    expect(cleanup?.where.slug.notIn).toContain("alternative-rock");
    expect(cleanup?.where.slug.notIn).toContain("jazz");
    expect(cleanup?.where.slug.notIn).toHaveLength(SOUNDSCAPE_GENRES.length);
  });

  it("replaces artist associations using bulk operations", async () => {
    tx.genre.findMany.mockResolvedValue([
      { id: "genre-1", slug: "alternative-rock" },
      { id: "genre-2", slug: "jazz" },
    ]);

    await repository.syncArtistGenres("artist-1", [
      "Alternative rock",
      "Jazz",
    ]);

    expect(tx.genre.createMany).toHaveBeenCalledOnce();
    expect(tx.genre.findMany).toHaveBeenCalledWith({
      where: { slug: { in: ["alternative-rock", "jazz"] } },
      select: { id: true, slug: true },
    });
    expect(tx.artistGenre.deleteMany).toHaveBeenCalledWith({
      where: { artistId: "artist-1" },
    });
    expect(tx.artistGenre.createMany).toHaveBeenCalledWith({
      data: [
        { artistId: "artist-1", genreId: "genre-1" },
        { artistId: "artist-1", genreId: "genre-2" },
      ],
      skipDuplicates: true,
    });
  });

  it("clears associations when the entity has no approved genres", async () => {
    await repository.syncAlbumGenres("album-1", ["female vocalists", "seen live"]);

    expect(tx.genre.createMany).not.toHaveBeenCalled();
    expect(tx.genre.findMany).not.toHaveBeenCalled();
    expect(tx.albumGenre.deleteMany).toHaveBeenCalledWith({
      where: { albumId: "album-1" },
    });
    expect(tx.albumGenre.createMany).not.toHaveBeenCalled();
  });

  it("fails atomically if normalized genres cannot be resolved", async () => {
    tx.genre.findMany.mockResolvedValue([]);

    await expect(
      repository.syncArtistGenres("artist-1", ["Alternative rock"]),
    ).rejects.toThrow("Failed to resolve all normalized genres");
    expect(tx.artistGenre.deleteMany).not.toHaveBeenCalled();
  });
});
