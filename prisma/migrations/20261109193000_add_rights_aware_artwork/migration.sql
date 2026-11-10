CREATE TYPE "ArtworkSourceProvider" AS ENUM ('WIKIMEDIA_COMMONS', 'COVER_ART_ARCHIVE', 'THE_AUDIO_DB');
CREATE TYPE "ArtworkReviewStatus" AS ENUM ('PENDING', 'CLEARED', 'REJECTED');

CREATE TABLE "artwork_assets" (
  "id" TEXT NOT NULL,
  "artistId" TEXT,
  "albumId" TEXT,
  "sourceProvider" "ArtworkSourceProvider" NOT NULL,
  "sourceFileId" TEXT NOT NULL,
  "sourcePageUrl" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "creator" TEXT,
  "credit" TEXT,
  "licenseShortName" TEXT,
  "licenseUrl" TEXT,
  "width" INTEGER,
  "height" INTEGER,
  "reviewStatus" "ArtworkReviewStatus" NOT NULL DEFAULT 'PENDING',
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "reviewNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "artwork_assets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "artwork_assets_exactly_one_entity_check" CHECK (
    ("artistId" IS NOT NULL AND "albumId" IS NULL) OR
    ("artistId" IS NULL AND "albumId" IS NOT NULL)
  ),
  CONSTRAINT "artwork_assets_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "artwork_assets_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "albums"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "artwork_assets_artistId_sourceProvider_sourceFileId_key" ON "artwork_assets"("artistId", "sourceProvider", "sourceFileId");
CREATE UNIQUE INDEX "artwork_assets_albumId_sourceProvider_sourceFileId_key" ON "artwork_assets"("albumId", "sourceProvider", "sourceFileId");
CREATE INDEX "artwork_assets_artistId_reviewStatus_updatedAt_idx" ON "artwork_assets"("artistId", "reviewStatus", "updatedAt");
CREATE INDEX "artwork_assets_albumId_reviewStatus_updatedAt_idx" ON "artwork_assets"("albumId", "reviewStatus", "updatedAt");
