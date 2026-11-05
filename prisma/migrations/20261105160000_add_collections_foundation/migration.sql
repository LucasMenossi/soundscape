CREATE TYPE "CollectionItemEntityType" AS ENUM ('ARTIST', 'ALBUM');

CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "description" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "collection_items" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "entityType" "CollectionItemEntityType" NOT NULL,
    "artistId" TEXT,
    "albumId" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "collection_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "collection_items_exactly_one_target_check" CHECK (
      ("entityType" = 'ARTIST' AND "artistId" IS NOT NULL AND "albumId" IS NULL) OR
      ("entityType" = 'ALBUM' AND "albumId" IS NOT NULL AND "artistId" IS NULL)
    )
);

CREATE INDEX "collections_userId_updatedAt_idx" ON "collections"("userId", "updatedAt");
CREATE UNIQUE INDEX "collection_items_collectionId_artistId_key" ON "collection_items"("collectionId", "artistId");
CREATE UNIQUE INDEX "collection_items_collectionId_albumId_key" ON "collection_items"("collectionId", "albumId");
CREATE INDEX "collection_items_collectionId_position_addedAt_idx" ON "collection_items"("collectionId", "position", "addedAt");

ALTER TABLE "collections" ADD CONSTRAINT "collections_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_collectionId_fkey"
  FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_artistId_fkey"
  FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_albumId_fkey"
  FOREIGN KEY ("albumId") REFERENCES "albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;
