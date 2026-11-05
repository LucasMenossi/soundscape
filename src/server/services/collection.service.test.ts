import { describe, expect, it, vi } from "vitest";
import type { CollectionRepository } from "../repositories/collection.repository";
import { CollectionService } from "./collection.service";

function createRepository() {
  return {
    create: vi.fn(), update: vi.fn(), delete: vi.fn(), findByUserId: vi.fn(), findById: vi.fn(), addItem: vi.fn(), removeItem: vi.fn(),
  } satisfies CollectionRepository;
}

const collection = {
  id: "collection-1", userId: "user-1", name: "Favorites", description: null,
  createdAt: new Date(), updatedAt: new Date(), items: [],
};

describe("CollectionService", () => {
  it("trims and validates collection details before creating", async () => {
    const repository = createRepository();
    repository.create.mockResolvedValue(collection);
    const service = new CollectionService(repository);
    await service.createCollection({ userId: " user-1 ", name: " Favorites " });
    expect(repository.create).toHaveBeenCalledWith({ userId: "user-1", name: "Favorites", description: null });
  });

  it("rejects empty names", async () => {
    const repository = createRepository();
    const service = new CollectionService(repository);
    await expect(service.createCollection({ userId: "user-1", name: "  " })).rejects.toThrow();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("scopes collection deletion to the supplied user", async () => {
    const repository = createRepository();
    repository.delete.mockResolvedValue(true);
    const service = new CollectionService(repository);
    await expect(service.deleteCollection({ userId: "user-1", collectionId: "collection-1" })).resolves.toBe(true);
    expect(repository.delete).toHaveBeenCalledWith({ userId: "user-1", collectionId: "collection-1" });
  });

  it("rejects adding an item to a collection not owned by the user", async () => {
    const repository = createRepository();
    repository.findById.mockResolvedValue(null);
    const service = new CollectionService(repository);
    await expect(service.addItem({ userId: "user-2", collectionId: "collection-1", entityType: "ARTIST", entityId: "artist-1" })).rejects.toThrow("Collection not found");
    expect(repository.addItem).not.toHaveBeenCalled();
  });

  it("prevents duplicate items in a collection", async () => {
    const repository = createRepository();
    repository.findById.mockResolvedValue({ ...collection, items: [{ id: "item-1", collectionId: "collection-1", entityType: "ARTIST", artistId: "artist-1", albumId: null, position: 0, addedAt: new Date(), entity: { id: "artist-1", name: "Artist", subtitle: null, href: "/artists/artist-1" } }] });
    const service = new CollectionService(repository);
    await expect(service.addItem({ userId: "user-1", collectionId: "collection-1", entityType: "ARTIST", entityId: "artist-1" })).rejects.toThrow("Collection item already exists");
    expect(repository.addItem).not.toHaveBeenCalled();
  });

  it("adds an item after confirming collection ownership", async () => {
    const repository = createRepository();
    repository.findById.mockResolvedValue(collection);
    repository.addItem.mockResolvedValue(undefined);
    const service = new CollectionService(repository);
    await service.addItem({ userId: "user-1", collectionId: "collection-1", entityType: "ALBUM", entityId: "album-1" });
    expect(repository.addItem).toHaveBeenCalledWith({ userId: "user-1", collectionId: "collection-1", entityType: "ALBUM", entityId: "album-1" });
  });
});
