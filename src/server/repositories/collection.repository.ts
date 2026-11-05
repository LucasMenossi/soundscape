import type { Collection, CollectionItemEntityType, CollectionWithItems } from "../domain/collection";

export interface CollectionRepository {
  create(input: { userId: string; name: string; description: string | null }): Promise<Collection>;
  update(input: { userId: string; collectionId: string; name: string; description: string | null }): Promise<Collection | null>;
  delete(input: { userId: string; collectionId: string }): Promise<boolean>;
  findByUserId(userId: string): Promise<CollectionWithItems[]>;
  findById(input: { userId: string; collectionId: string }): Promise<CollectionWithItems | null>;
  addItem(input: { userId: string; collectionId: string; entityType: CollectionItemEntityType; entityId: string }): Promise<void>;
  removeItem(input: { userId: string; collectionId: string; entityType: CollectionItemEntityType; entityId: string }): Promise<boolean>;
}
