import "server-only";

import type { Album, Artist, Collection as PrismaCollection, CollectionItem as PrismaCollectionItem } from "@/generated/prisma/client";
import type { Collection, CollectionItem, CollectionItemEntityType, CollectionWithItems } from "../domain/collection";
import type { CollectionRepository } from "./collection.repository";
import { prisma } from "../db";

type ItemRecord = PrismaCollectionItem & { artist: Artist | null; album: Album | null };
type CollectionRecord = PrismaCollection & { items: ItemRecord[] };

function mapCollection(record: PrismaCollection): Collection {
  return {
    id: record.id,
    userId: record.userId,
    name: record.name,
    description: record.description,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function mapItem(record: ItemRecord): CollectionItem {
  const entity = record.artist
    ? { id: record.artist.id, name: record.artist.name, subtitle: record.artist.countryCode, href: `/artists/${record.artist.id}` }
    : record.album
      ? { id: record.album.id, name: record.album.title, subtitle: record.album.firstReleaseDate, href: `/albums/${record.album.id}` }
      : null;
  if (!entity) throw new Error(`Collection item ${record.id} references a missing catalog entity`);
  return {
    id: record.id,
    collectionId: record.collectionId,
    entityType: record.entityType,
    artistId: record.artistId,
    albumId: record.albumId,
    position: record.position,
    addedAt: record.addedAt,
    entity,
  };
}

function mapCollectionWithItems(record: CollectionRecord): CollectionWithItems {
  return { ...mapCollection(record), items: record.items.map(mapItem) };
}

const includeItems = {
  items: {
    include: { artist: true, album: true },
    orderBy: [{ position: "asc" as const }, { addedAt: "asc" as const }],
  },
};

export class PrismaCollectionRepository implements CollectionRepository {
  async create(input: { userId: string; name: string; description: string | null }): Promise<Collection> {
    const record = await prisma.collection.create({ data: input });
    return mapCollection(record);
  }

  async update(input: { userId: string; collectionId: string; name: string; description: string | null }): Promise<Collection | null> {
    const result = await prisma.collection.updateMany({
      where: { id: input.collectionId, userId: input.userId },
      data: { name: input.name, description: input.description },
    });
    if (!result.count) return null;
    const record = await prisma.collection.findFirst({ where: { id: input.collectionId, userId: input.userId } });
    return record ? mapCollection(record) : null;
  }

  async delete(input: { userId: string; collectionId: string }): Promise<boolean> {
    const result = await prisma.collection.deleteMany({ where: { id: input.collectionId, userId: input.userId } });
    return result.count > 0;
  }

  async findByUserId(userId: string): Promise<CollectionWithItems[]> {
    const records = await prisma.collection.findMany({ where: { userId }, include: includeItems, orderBy: { updatedAt: "desc" } });
    return records.map(mapCollectionWithItems);
  }

  async findById(input: { userId: string; collectionId: string }): Promise<CollectionWithItems | null> {
    const record = await prisma.collection.findFirst({ where: { id: input.collectionId, userId: input.userId }, include: includeItems });
    return record ? mapCollectionWithItems(record) : null;
  }

  async addItem(input: { userId: string; collectionId: string; entityType: CollectionItemEntityType; entityId: string }): Promise<void> {
    const ownedCollection = await prisma.collection.findFirst({ where: { id: input.collectionId, userId: input.userId }, select: { id: true } });
    if (!ownedCollection) throw new Error("Collection not found");
    await prisma.collectionItem.create({
      data: input.entityType === "ARTIST"
        ? { collectionId: input.collectionId, entityType: "ARTIST", artistId: input.entityId }
        : { collectionId: input.collectionId, entityType: "ALBUM", albumId: input.entityId },
    });
    await prisma.collection.update({ where: { id: input.collectionId }, data: { updatedAt: new Date() } });
  }

  async removeItem(input: { userId: string; collectionId: string; entityType: CollectionItemEntityType; entityId: string }): Promise<boolean> {
    const ownedCollection = await prisma.collection.findFirst({ where: { id: input.collectionId, userId: input.userId }, select: { id: true } });
    if (!ownedCollection) return false;
    const result = await prisma.collectionItem.deleteMany({
      where: {
        collectionId: input.collectionId,
        ...(input.entityType === "ARTIST" ? { artistId: input.entityId } : { albumId: input.entityId }),
      },
    });
    if (result.count) await prisma.collection.update({ where: { id: input.collectionId }, data: { updatedAt: new Date() } });
    return result.count > 0;
  }
}
