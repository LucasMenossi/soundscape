import "server-only";

import type { Album, AlbumCatalogData } from "@/server/domain/album";
import { prisma } from "@/server/db";
import type { AlbumRepository } from "./album.repository";

type PrismaAlbum = NonNullable<
  Awaited<ReturnType<typeof prisma.album.findUnique>>
>;

function mapPrismaAlbum(record: PrismaAlbum): Album {
  return {
    id: record.id,
    musicBrainzReleaseGroupId: record.musicBrainzReleaseGroupId,
    title: record.title,
    firstReleaseDate: record.firstReleaseDate,
    primaryArtistId: record.primaryArtistId,
    albumType: record.albumType,
    lastSyncedAt: record.lastSyncedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export class PrismaAlbumRepository implements AlbumRepository {
  async findById(id: string): Promise<Album | null> {
    const record = await prisma.album.findUnique({
      where: { id },
    });

    return record ? mapPrismaAlbum(record) : null;
  }

  async findByMusicBrainzReleaseGroupId(
    musicBrainzReleaseGroupId: string,
  ): Promise<Album | null> {
    const record = await prisma.album.findUnique({
      where: { musicBrainzReleaseGroupId },
    });

    return record ? mapPrismaAlbum(record) : null;
  }

  async upsertFromCatalog(data: AlbumCatalogData): Promise<Album> {
    const now = new Date();

    const record = await prisma.$transaction(async (transaction) => {
      const artist = await transaction.artist.upsert({
        where: {
          musicBrainzId: data.primaryArtist.musicBrainzId,
        },
        create: {
          musicBrainzId: data.primaryArtist.musicBrainzId,
          name: data.primaryArtist.name,
          sortName: data.primaryArtist.sortName,
          disambiguation: data.primaryArtist.disambiguation,
          countryCode: data.primaryArtist.countryCode,
          beginDate: data.primaryArtist.beginDate,
          endDate: data.primaryArtist.endDate,
          lastSyncedAt: now,
        },
        update: {
          name: data.primaryArtist.name,
          ...(data.primaryArtist.sortName !== null && {
            sortName: data.primaryArtist.sortName,
          }),
        },
      });

      return transaction.album.upsert({
        where: {
          musicBrainzReleaseGroupId: data.musicBrainzReleaseGroupId,
        },
        create: {
          musicBrainzReleaseGroupId: data.musicBrainzReleaseGroupId,
          title: data.title,
          firstReleaseDate: data.firstReleaseDate,
          albumType: data.albumType,
          primaryArtistId: artist.id,
          lastSyncedAt: now,
        },
        update: {
          title: data.title,
          firstReleaseDate: data.firstReleaseDate,
          albumType: data.albumType,
          primaryArtistId: artist.id,
          lastSyncedAt: now,
        },
      });
    });

    return mapPrismaAlbum(record);
  }
}
