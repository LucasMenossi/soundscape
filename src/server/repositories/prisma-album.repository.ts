import "server-only";

import type { Prisma } from "@/generated/prisma/client";

import type {
  Album,
  AlbumCatalogData,
  AlbumWithPrimaryArtist,
} from "@/server/domain/album";
import type { Artist } from "@/server/domain/artist";
import { prisma } from "@/server/db";
import type { AlbumRepository } from "./album.repository";

type PrismaAlbum = Prisma.AlbumGetPayload<object>;
type PrismaAlbumWithPrimaryArtist = Prisma.AlbumGetPayload<{
  include: { primaryArtist: true };
}>;

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

function mapPrismaAlbumWithPrimaryArtist(
  record: PrismaAlbumWithPrimaryArtist,
): AlbumWithPrimaryArtist {
  const primaryArtist: Artist = {
    id: record.primaryArtist.id,
    musicBrainzId: record.primaryArtist.musicBrainzId,
    name: record.primaryArtist.name,
    sortName: record.primaryArtist.sortName,
    disambiguation: record.primaryArtist.disambiguation,
    countryCode: record.primaryArtist.countryCode,
    beginDate: record.primaryArtist.beginDate,
    endDate: record.primaryArtist.endDate,
    lastSyncedAt: record.primaryArtist.lastSyncedAt,
    createdAt: record.primaryArtist.createdAt,
    updatedAt: record.primaryArtist.updatedAt,
  };

  return {
    ...mapPrismaAlbum(record),
    primaryArtist,
  };
}

export class PrismaAlbumRepository implements AlbumRepository {
  async findById(id: string): Promise<Album | null> {
    const record = await prisma.album.findUnique({
      where: { id },
    });

    return record ? mapPrismaAlbum(record) : null;
  }

  async findByIdWithPrimaryArtist(
    id: string,
  ): Promise<AlbumWithPrimaryArtist | null> {
    const record = await prisma.album.findUnique({
      where: { id },
      include: {
        primaryArtist: true,
      },
    });

    return record ? mapPrismaAlbumWithPrimaryArtist(record) : null;
  }

  async findByPrimaryArtistId(
    artistId: string,
  ): Promise<AlbumWithPrimaryArtist[]> {
    const records = await prisma.album.findMany({
      where: { primaryArtistId: artistId },
      include: { primaryArtist: true },
      orderBy: [
        { firstReleaseDate: "asc" },
        { title: "asc" },
      ],
    });

    return records.map(mapPrismaAlbumWithPrimaryArtist);
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
        // Release-group artist credits contain only partial artist metadata.
        // Preserve richer values already stored in the catalog.
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
