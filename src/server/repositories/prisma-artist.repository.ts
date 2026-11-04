import "server-only";

import type { Artist as PrismaArtist } from "@/generated/prisma/client";

import type {
  Artist,
  ArtistCatalogData,
  ArtistRelationship,
  ArtistRelationshipCatalogData,
} from "../domain/artist";
import type { ArtistRepository } from "./artist.repository";
import { prisma } from "../db";

function toDomainArtist(record: PrismaArtist): Artist {
  return {
    id: record.id,
    musicBrainzId: record.musicBrainzId,
    name: record.name,
    sortName: record.sortName,
    disambiguation: record.disambiguation,
    countryCode: record.countryCode,
    beginDate: record.beginDate,
    endDate: record.endDate,
    lastSyncedAt: record.lastSyncedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toDomainRelationship(record: {
  id: string;
  relationshipType: string;
  targetArtist: PrismaArtist;
}): ArtistRelationship {
  return {
    id: record.id,
    relationshipType:
      record.relationshipType as ArtistRelationship["relationshipType"],
    artist: toDomainArtist(record.targetArtist),
  };
}

export class PrismaArtistRepository implements ArtistRepository {
  async findById(id: string): Promise<Artist | null> {
    const artist = await prisma.artist.findUnique({ where: { id } });
    return artist ? toDomainArtist(artist) : null;
  }

  async findByMusicBrainzId(musicBrainzId: string): Promise<Artist | null> {
    const artist = await prisma.artist.findUnique({ where: { musicBrainzId } });
    return artist ? toDomainArtist(artist) : null;
  }

  async upsertFromCatalog(data: ArtistCatalogData): Promise<Artist> {
    const artist = await prisma.artist.upsert({
      where: { musicBrainzId: data.musicBrainzId },
      create: { ...data, lastSyncedAt: new Date() },
      update: { ...data, lastSyncedAt: new Date() },
    });
    return toDomainArtist(artist);
  }

  async syncRelationships(
    sourceArtistId: string,
    relationships: ArtistRelationshipCatalogData[],
  ): Promise<void> {
    const source = await prisma.artist.findUnique({
      where: { id: sourceArtistId },
      select: { musicBrainzId: true },
    });
    if (!source)
      throw new Error("Cannot sync relationships for an unknown artist");

    // Build a unique set of valid targets and edges before touching the database.
    // Bulk operations avoid one round-trip per relationship, which previously
    // caused the interactive transaction to exceed Prisma's 5-second default.
    const targetsByMusicBrainzId = new Map<
      string,
      ArtistRelationshipCatalogData["targetArtist"]
    >();
    const edges: Array<{
      targetMusicBrainzId: string;
      relationshipType: string;
    }> = [];

    for (const relationship of relationships) {
      const target = relationship.targetArtist;
      if (target.musicBrainzId === source.musicBrainzId) continue;

      const relationshipType =
        relationship.relationshipType === "member of band"
          ? relationship.direction === "backward"
            ? "band member"
            : relationship.direction === "forward"
              ? "member of band"
              : "band relationship"
          : relationship.relationshipType === "supporting musician"
            ? relationship.direction === "backward"
              ? "supporting artist"
              : relationship.direction === "forward"
                ? "supported artist"
                : "supporting relationship"
            : relationship.relationshipType === "artist rename"
              ? relationship.direction === "backward"
                ? "renamed from"
                : null
              : relationship.relationshipType === "subgroup"
                ? "subgroup"
                : "collaboration";
      if (!relationshipType) continue;

      targetsByMusicBrainzId.set(target.musicBrainzId, target);
      edges.push({
        targetMusicBrainzId: target.musicBrainzId,
        relationshipType,
      });
    }

    await prisma.$transaction(
      async (tx) => {
        const targets = [...targetsByMusicBrainzId.values()];

        if (targets.length > 0) {
          await tx.artist.createMany({
            data: targets.map((target) => ({
              ...target,
              lastSyncedAt: new Date(),
            })),
            skipDuplicates: true,
          });
        }

        const persistedTargets =
          targets.length > 0
            ? await tx.artist.findMany({
                where: {
                  musicBrainzId: {
                    in: targets.map((target) => target.musicBrainzId),
                  },
                },
                select: { id: true, musicBrainzId: true },
              })
            : [];
        const targetIdsByMusicBrainzId = new Map(
          persistedTargets.map((target) => [target.musicBrainzId, target.id]),
        );

        const relationshipRows = edges.flatMap((edge) => {
          const targetArtistId = targetIdsByMusicBrainzId.get(
            edge.targetMusicBrainzId,
          );
          return targetArtistId
            ? [
                {
                  sourceArtistId,
                  targetArtistId,
                  relationshipType: edge.relationshipType,
                  sourceProvider: "musicbrainz",
                },
              ]
            : [];
        });

        await tx.artistRelationship.deleteMany({
          where: { sourceArtistId, sourceProvider: "musicbrainz" },
        });

        if (relationshipRows.length > 0) {
          await tx.artistRelationship.createMany({
            data: relationshipRows,
            skipDuplicates: true,
          });
        }
      },
      { timeout: 15000 },
    );
  }

  async findRelationshipsBySourceArtistId(
    sourceArtistId: string,
  ): Promise<ArtistRelationship[]> {
    const records = await prisma.artistRelationship.findMany({
      where: { sourceArtistId, sourceProvider: "musicbrainz" },
      include: { targetArtist: true },
      orderBy: [{ relationshipType: "asc" }, { targetArtist: { name: "asc" } }],
    });
    return records.map(toDomainRelationship);
  }
}
