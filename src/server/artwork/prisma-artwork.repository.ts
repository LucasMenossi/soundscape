import "server-only";

import { prisma } from "@/server/db";
import type { ArtworkCandidateRecord, ArtworkRepository, NewArtworkCandidate } from "./artwork.repository";

async function saveAutomaticSelection(
  entity: { artistId: string } | { albumId: string },
  candidate: NewArtworkCandidate | null,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.artworkAsset.updateMany({
      where: { ...entity, reviewStatus: "AUTO_APPROVED" },
      data: { reviewStatus: "PENDING" },
    });
    if (!candidate) return;

    const where = "artistId" in entity
      ? { artistId_sourceProvider_sourceFileId: { artistId: entity.artistId, sourceProvider: candidate.sourceProvider, sourceFileId: candidate.sourceFileId } }
      : { albumId_sourceProvider_sourceFileId: { albumId: entity.albumId, sourceProvider: candidate.sourceProvider, sourceFileId: candidate.sourceFileId } };

    await tx.artworkAsset.upsert({
      where,
      create: { ...candidate, ...entity, reviewStatus: "AUTO_APPROVED" },
      update: {
        sourcePageUrl: candidate.sourcePageUrl,
        imageUrl: candidate.imageUrl,
        description: candidate.description,
        creator: candidate.creator,
        credit: candidate.credit,
        licenseShortName: candidate.licenseShortName,
        licenseUrl: candidate.licenseUrl,
        width: candidate.width,
        height: candidate.height,
        relevanceScore: candidate.relevanceScore,
        selectionReason: candidate.selectionReason,
        reviewStatus: "AUTO_APPROVED",
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: null,
      },
    });
  });
}

async function findDisplayableSelection(
  entity: { artistId: string } | { albumId: string },
): Promise<ArtworkCandidateRecord | null> {
  const record = await prisma.artworkAsset.findFirst({
    where: { ...entity, reviewStatus: { in: ["AUTO_APPROVED", "CLEARED"] } },
    orderBy: [{ relevanceScore: "desc" }, { updatedAt: "desc" }],
  });
  return record as ArtworkCandidateRecord | null;
}

export class PrismaArtworkRepository implements ArtworkRepository {
  saveAutomaticArtistSelection(artistId: string, candidate: NewArtworkCandidate | null): Promise<void> {
    return saveAutomaticSelection({ artistId }, candidate);
  }
  findDisplayableArtistArtwork(artistId: string): Promise<ArtworkCandidateRecord | null> {
    return findDisplayableSelection({ artistId });
  }
  async getArtistArtworkLastSearchedAt(artistId: string): Promise<Date | null> {
    const artist = await prisma.artist.findUnique({ where: { id: artistId }, select: { artworkLastSearchedAt: true } });
    return artist?.artworkLastSearchedAt ?? null;
  }
  async markArtistArtworkSearched(artistId: string, searchedAt: Date): Promise<void> {
    await prisma.artist.update({ where: { id: artistId }, data: { artworkLastSearchedAt: searchedAt } });
  }

  saveAutomaticAlbumSelection(albumId: string, candidate: NewArtworkCandidate | null): Promise<void> {
    return saveAutomaticSelection({ albumId }, candidate);
  }
  findDisplayableAlbumArtwork(albumId: string): Promise<ArtworkCandidateRecord | null> {
    return findDisplayableSelection({ albumId });
  }
  async getAlbumArtworkLastSearchedAt(albumId: string): Promise<Date | null> {
    const album = await prisma.album.findUnique({ where: { id: albumId }, select: { artworkLastSearchedAt: true } });
    return album?.artworkLastSearchedAt ?? null;
  }
  async markAlbumArtworkSearched(albumId: string, searchedAt: Date): Promise<void> {
    await prisma.album.update({ where: { id: albumId }, data: { artworkLastSearchedAt: searchedAt } });
  }
}
