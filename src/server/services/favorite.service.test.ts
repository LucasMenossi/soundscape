import { describe, expect, it, vi } from "vitest";

import type { FavoriteRepository } from "../repositories/favorite.repository";
import { FavoriteService } from "./favorite.service";

function createRepository() {
  return {
    add: vi.fn(),
    remove: vi.fn(),
    findByUserId: vi.fn(),
    exists: vi.fn(),
  } satisfies FavoriteRepository;
}

describe("FavoriteService", () => {
  it("adds an artist favorite when it does not exist", async () => {
    const repository = createRepository();
    const favorite = {
      id: "favorite-1",
      userId: "user-1",
      entityType: "ARTIST" as const,
      artistId: "artist-1",
      albumId: null,
      createdAt: new Date(),
    };
    repository.exists.mockResolvedValue(false);
    repository.add.mockResolvedValue(favorite);
    const service = new FavoriteService(repository);

    await expect(
      service.addFavorite({
        userId: "user-1",
        entityType: "ARTIST",
        entityId: "artist-1",
      }),
    ).resolves.toEqual(favorite);
    expect(repository.add).toHaveBeenCalledWith({
      userId: "user-1",
      entityType: "ARTIST",
      entityId: "artist-1",
    });
  });

  it("rejects duplicate favorites before creating a row", async () => {
    const repository = createRepository();
    repository.exists.mockResolvedValue(true);
    const service = new FavoriteService(repository);

    await expect(
      service.addFavorite({
        userId: "user-1",
        entityType: "ALBUM",
        entityId: "album-1",
      }),
    ).rejects.toThrow("Favorite already exists");
    expect(repository.add).not.toHaveBeenCalled();
  });

  it("validates identifiers before accessing the repository", async () => {
    const repository = createRepository();
    const service = new FavoriteService(repository);

    await expect(
      service.getLibrary("  "),
    ).rejects.toThrow();
    expect(repository.findByUserId).not.toHaveBeenCalled();
  });

  it("scopes removal to the supplied user", async () => {
    const repository = createRepository();
    repository.remove.mockResolvedValue(true);
    const service = new FavoriteService(repository);

    await expect(
      service.removeFavorite({
        userId: "user-1",
        entityType: "ARTIST",
        entityId: "artist-1",
      }),
    ).resolves.toBe(true);
    expect(repository.remove).toHaveBeenCalledWith({
      userId: "user-1",
      entityType: "ARTIST",
      entityId: "artist-1",
    });
  });
});
