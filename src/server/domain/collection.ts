export const COLLECTION_ITEM_ENTITY_TYPES = ["ARTIST", "ALBUM"] as const;
export type CollectionItemEntityType = (typeof COLLECTION_ITEM_ENTITY_TYPES)[number];

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionItem {
  id: string;
  collectionId: string;
  entityType: CollectionItemEntityType;
  artistId: string | null;
  albumId: string | null;
  position: number;
  addedAt: Date;
  entity: { id: string; name: string; subtitle: string | null; href: string };
}

export interface CollectionWithItems extends Collection {
  items: CollectionItem[];
}
