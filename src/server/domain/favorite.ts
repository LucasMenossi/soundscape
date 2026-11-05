export const FAVORITE_ENTITY_TYPES = ["ARTIST", "ALBUM"] as const;

export type FavoriteEntityType = (typeof FAVORITE_ENTITY_TYPES)[number];

export interface Favorite {
  id: string;
  userId: string;
  entityType: FavoriteEntityType;
  artistId: string | null;
  albumId: string | null;
  createdAt: Date;
}

export interface FavoriteCatalogEntity {
  id: string;
  name: string;
  subtitle: string | null;
  href: string;
  image: null;
}

export interface FavoriteWithEntity extends Favorite {
  entity: FavoriteCatalogEntity;
}

export interface CreateFavoriteInput {
  userId: string;
  entityType: FavoriteEntityType;
  entityId: string;
}
