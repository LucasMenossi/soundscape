CREATE TYPE "FavoriteEntityType" AS ENUM ('ARTIST', 'ALBUM');

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" "FavoriteEntityType" NOT NULL,
    "artistId" TEXT,
    "albumId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "favorites_exactly_one_target_check" CHECK (
      ("entityType" = 'ARTIST' AND "artistId" IS NOT NULL AND "albumId" IS NULL)
      OR
      ("entityType" = 'ALBUM' AND "albumId" IS NOT NULL AND "artistId" IS NULL)
    )
);

CREATE UNIQUE INDEX "favorites_userId_artistId_key" ON "favorites"("userId", "artistId");
CREATE UNIQUE INDEX "favorites_userId_albumId_key" ON "favorites"("userId", "albumId");
CREATE INDEX "favorites_userId_createdAt_idx" ON "favorites"("userId", "createdAt");

ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_artistId_fkey"
  FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_albumId_fkey"
  FOREIGN KEY ("albumId") REFERENCES "albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;
