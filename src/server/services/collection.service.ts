import "server-only";

import { z } from "zod";
import type {
  Collection,
  CollectionItemEntityType,
  CollectionWithItems,
} from "../domain/collection";
import type { CollectionRepository } from "../repositories/collection.repository";

const idSchema = z.string().trim().min(1).max(128);
const nameSchema = z.string().trim().min(1).max(80);
const descriptionSchema = z.string().trim().max(500).nullable();
const entityTypeSchema = z.enum(["ARTIST", "ALBUM"]);

export class CollectionItemAlreadyExistsError extends Error {
  constructor() {
    super("Collection item already exists");
    this.name = "CollectionItemAlreadyExistsError";
  }
}

export class CollectionService {
  constructor(private readonly repository: CollectionRepository) {}

  async createCollection(input: {
    userId: string;
    name: string;
    description?: string | null;
  }): Promise<Collection> {
    return this.repository.create({
      userId: idSchema.parse(input.userId),
      name: nameSchema.parse(input.name),
      description: this.parseDescription(input.description),
    });
  }

  async updateCollection(input: {
    userId: string;
    collectionId: string;
    name: string;
    description?: string | null;
  }): Promise<Collection | null> {
    return this.repository.update({
      userId: idSchema.parse(input.userId),
      collectionId: idSchema.parse(input.collectionId),
      name: nameSchema.parse(input.name),
      description: this.parseDescription(input.description),
    });
  }

  async deleteCollection(input: {
    userId: string;
    collectionId: string;
  }): Promise<boolean> {
    return this.repository.delete({
      userId: idSchema.parse(input.userId),
      collectionId: idSchema.parse(input.collectionId),
    });
  }

  async listCollections(userId: string): Promise<CollectionWithItems[]> {
    return this.repository.findByUserId(idSchema.parse(userId));
  }

  async getCollection(input: {
    userId: string;
    collectionId: string;
  }): Promise<CollectionWithItems | null> {
    return this.repository.findById({
      userId: idSchema.parse(input.userId),
      collectionId: idSchema.parse(input.collectionId),
    });
  }

  async addItem(input: {
    userId: string;
    collectionId: string;
    entityType: CollectionItemEntityType;
    entityId: string;
  }): Promise<void> {
    const validated = this.validateItemInput(input);
    const collection = await this.repository.findById({
      userId: validated.userId,
      collectionId: validated.collectionId,
    });
    if (!collection) throw new Error("Collection not found");
    if (
      collection.items.some(
        (item) =>
          item.entityType === validated.entityType &&
          item.entity.id === validated.entityId,
      )
    ) {
      throw new CollectionItemAlreadyExistsError();
    }
    await this.repository.addItem(validated);
  }

  async removeItem(input: {
    userId: string;
    collectionId: string;
    entityType: CollectionItemEntityType;
    entityId: string;
  }): Promise<boolean> {
    return this.repository.removeItem(this.validateItemInput(input));
  }

  private validateItemInput(input: {
    userId: string;
    collectionId: string;
    entityType: CollectionItemEntityType;
    entityId: string;
  }) {
    return {
      userId: idSchema.parse(input.userId),
      collectionId: idSchema.parse(input.collectionId),
      entityType: entityTypeSchema.parse(input.entityType),
      entityId: idSchema.parse(input.entityId),
    };
  }

  private parseDescription(value: string | null | undefined): string | null {
    if (value === undefined || value === null || value.trim() === "")
      return null;
    return descriptionSchema.parse(value.trim());
  }
}
