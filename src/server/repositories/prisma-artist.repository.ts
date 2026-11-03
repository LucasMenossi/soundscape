import "server-only";

import type { Artist as PrismaArtist } from "@/generated/prisma/client";

import type { Artist, ArtistCatalogData } from "../domain/artist";
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

export class PrismaArtistRepository implements ArtistRepository {
  async findById(id: string): Promise<Artist | null> {
    const artist = await prisma.artist.findUnique({
      where: { id },
    });

    return artist ? toDomainArtist(artist) : null;
  }

  async findByMusicBrainzId(musicBrainzId: string): Promise<Artist | null> {
    const artist = await prisma.artist.findUnique({
      where: { musicBrainzId },
    });

    return artist ? toDomainArtist(artist) : null;
  }

  async upsertFromCatalog(data: ArtistCatalogData): Promise<Artist> {
    const artist = await prisma.artist.upsert({
      where: {
        musicBrainzId: data.musicBrainzId,
      },
      create: {
        ...data,
        lastSyncedAt: new Date(),
      },
      update: {
        ...data,
        lastSyncedAt: new Date(),
      },
    });

    return toDomainArtist(artist);
  }
}
