ALTER TYPE "ArtworkReviewStatus" ADD VALUE 'AUTO_APPROVED';

ALTER TABLE "artists"
ADD COLUMN "artworkLastSearchedAt" TIMESTAMP(3);

ALTER TABLE "albums"
ADD COLUMN "artworkLastSearchedAt" TIMESTAMP(3);

ALTER TABLE "artwork_assets"
ADD COLUMN "description" TEXT,
ADD COLUMN "relevanceScore" INTEGER,
ADD COLUMN "selectionReason" TEXT;

CREATE INDEX "artwork_assets_artistId_reviewStatus_relevanceScore_idx"
ON "artwork_assets"("artistId", "reviewStatus", "relevanceScore");

CREATE INDEX "artwork_assets_albumId_reviewStatus_relevanceScore_idx"
ON "artwork_assets"("albumId", "reviewStatus", "relevanceScore");
