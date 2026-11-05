import type { Favorite, FavoriteEntityType, FavoriteWithEntity } from "../domain/favorite";

export interface FavoriteRepository {
  add(input: {
    userId: string;
    entityType: FavoriteEntityType;
    entityId: string;
  }): Promise<Favorite>;

  remove(input: {
    userId: string;
    entityType: FavoriteEntityType;
    entityId: string;
  }): Promise<boolean>;

  findByUserId(userId: string): Promise<FavoriteWithEntity[]>;

  exists(input: {
    userId: string;
    entityType: FavoriteEntityType;
    entityId: string;
  }): Promise<boolean>;
}
