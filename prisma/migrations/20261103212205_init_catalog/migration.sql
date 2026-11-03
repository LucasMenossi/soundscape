-- CreateTable
CREATE TABLE "artists" (
    "id" TEXT NOT NULL,
    "musicBrainzId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sortName" TEXT,
    "disambiguation" TEXT,
    "countryCode" VARCHAR(2),
    "beginDate" TEXT,
    "endDate" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "albums" (
    "id" TEXT NOT NULL,
    "musicBrainzReleaseGroupId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "firstReleaseDate" TEXT,
    "albumType" TEXT,
    "primaryArtistId" TEXT NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genres" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artist_genres" (
    "artistId" TEXT NOT NULL,
    "genreId" TEXT NOT NULL,

    CONSTRAINT "artist_genres_pkey" PRIMARY KEY ("artistId","genreId")
);

-- CreateTable
CREATE TABLE "album_genres" (
    "albumId" TEXT NOT NULL,
    "genreId" TEXT NOT NULL,

    CONSTRAINT "album_genres_pkey" PRIMARY KEY ("albumId","genreId")
);

-- CreateTable
CREATE TABLE "artist_relationships" (
    "id" TEXT NOT NULL,
    "sourceArtistId" TEXT NOT NULL,
    "targetArtistId" TEXT NOT NULL,
    "relationshipType" TEXT NOT NULL,
    "sourceProvider" TEXT NOT NULL,
    "externalRelationshipId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artist_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "artists_musicBrainzId_key" ON "artists"("musicBrainzId");

-- CreateIndex
CREATE INDEX "artists_name_idx" ON "artists"("name");

-- CreateIndex
CREATE INDEX "artists_sortName_idx" ON "artists"("sortName");

-- CreateIndex
CREATE UNIQUE INDEX "albums_musicBrainzReleaseGroupId_key" ON "albums"("musicBrainzReleaseGroupId");

-- CreateIndex
CREATE INDEX "albums_title_idx" ON "albums"("title");

-- CreateIndex
CREATE INDEX "albums_primaryArtistId_idx" ON "albums"("primaryArtistId");

-- CreateIndex
CREATE INDEX "albums_primaryArtistId_firstReleaseDate_idx" ON "albums"("primaryArtistId", "firstReleaseDate");

-- CreateIndex
CREATE UNIQUE INDEX "genres_slug_key" ON "genres"("slug");

-- CreateIndex
CREATE INDEX "genres_name_idx" ON "genres"("name");

-- CreateIndex
CREATE INDEX "artist_genres_genreId_idx" ON "artist_genres"("genreId");

-- CreateIndex
CREATE INDEX "album_genres_genreId_idx" ON "album_genres"("genreId");

-- CreateIndex
CREATE INDEX "artist_relationships_targetArtistId_relationshipType_idx" ON "artist_relationships"("targetArtistId", "relationshipType");

-- CreateIndex
CREATE INDEX "artist_relationships_sourceArtistId_relationshipType_idx" ON "artist_relationships"("sourceArtistId", "relationshipType");

-- CreateIndex
CREATE UNIQUE INDEX "artist_relationships_sourceArtistId_targetArtistId_relation_key" ON "artist_relationships"("sourceArtistId", "targetArtistId", "relationshipType", "sourceProvider");

-- AddForeignKey
ALTER TABLE "albums" ADD CONSTRAINT "albums_primaryArtistId_fkey" FOREIGN KEY ("primaryArtistId") REFERENCES "artists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_genres" ADD CONSTRAINT "artist_genres_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_genres" ADD CONSTRAINT "artist_genres_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_genres" ADD CONSTRAINT "album_genres_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_genres" ADD CONSTRAINT "album_genres_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_relationships" ADD CONSTRAINT "artist_relationships_sourceArtistId_fkey" FOREIGN KEY ("sourceArtistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_relationships" ADD CONSTRAINT "artist_relationships_targetArtistId_fkey" FOREIGN KEY ("targetArtistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
