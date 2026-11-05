import "server-only";

import { z } from "zod";

import type { Favorite, FavoriteEntityType, FavoriteWithEntity } from "../domain/favorite";
import type { FavoriteRepository } from "../repositories/favorite.repository";

const idSchema = z.string().trim().min(1).max(128);
const entityTypeSchema = z.enum(["ARTIST", "ALBUM"]);

export class FavoriteService {
  constructor(private readonly repository: FavoriteRepository) {}

  async addFavorite(input: {
    userId: string;
    entityType: FavoriteEntityType;
    entityId: string;
  }): Promise<Favorite> {
    const validated = this.validateInput(input);
    if (await this.repository.exists(validated)) {
      throw new Error("Favorite already exists");
    }
    return this.repository.add(validated);
  }

  removeFavorite(input: {
    userId: string;
    entityType: FavoriteEntityType;
    entityId: string;
  }): Promise<boolean> {
    return this.repository.remove(this.validateInput(input));
  }

  async getLibrary(userId: string): Promise<FavoriteWithEntity[]> {
    return this.repository.findByUserId(idSchema.parse(userId));
  }

  hasFavorite(input: {
    userId: string;
    entityType: FavoriteEntityType;
    entityId: string;
  }): Promise<boolean> {
    return this.repository.exists(this.validateInput(input));
  }

  private validateInput(input: {
    userId: string;
    entityType: FavoriteEntityType;
    entityId: string;
  }) {
    return {
      userId: idSchema.parse(input.userId),
      entityType: entityTypeSchema.parse(input.entityType),
      entityId: idSchema.parse(input.entityId),
    };
  }
}
