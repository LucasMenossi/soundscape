import "server-only";

import type {
  Favorite as PrismaFavorite,
  Artist,
  Album,
} from "@/generated/prisma/client";

import type {
  Favorite,
  FavoriteEntityType,
  FavoriteWithEntity,
} from "../domain/favorite";
import type { FavoriteRepository } from "./favorite.repository";
import { prisma } from "../db";
import { formatMusicBrainzCountry } from "@/lib/format-musicbrainz-country";

function toDomainFavorite(record: PrismaFavorite): Favorite {
  return {
    id: record.id,
    userId: record.userId,
    entityType: record.entityType,
    artistId: record.artistId,
    albumId: record.albumId,
    createdAt: record.createdAt,
  };
}

function toFavoriteWithEntity(
  record: PrismaFavorite & { artist: Artist | null; album: Album | null },
): FavoriteWithEntity {
  const artist = record.artist;
  const album = record.album;
  const entity = artist
    ? {
        id: artist.id,
        name: artist.name,
        subtitle: formatMusicBrainzCountry(artist.countryCode),
        href: `/artists/${artist.id}`,
        image: null,
      }
    : album
      ? {
          id: album.id,
          name: album.title,
          subtitle: album.firstReleaseDate,
          href: `/albums/${album.id}`,
          image: null,
        }
      : null;

  if (!entity) {
    throw new Error(
      `Favorite ${record.id} references a missing catalog entity`,
    );
  }

  return { ...toDomainFavorite(record), entity };
}

export class PrismaFavoriteRepository implements FavoriteRepository {
  async add(input: {
    userId: string;
    entityType: FavoriteEntityType;
    entityId: string;
  }): Promise<Favorite> {
    const record = await prisma.favorite.create({
      data:
        input.entityType === "ARTIST"
          ? {
              userId: input.userId,
              entityType: "ARTIST",
              artistId: input.entityId,
            }
          : {
              userId: input.userId,
              entityType: "ALBUM",
              albumId: input.entityId,
            },
    });
    return toDomainFavorite(record);
  }

  async remove(input: {
    userId: string;
    entityType: FavoriteEntityType;
    entityId: string;
  }): Promise<boolean> {
    const result = await prisma.favorite.deleteMany({
      where: {
        userId: input.userId,
        entityType: input.entityType,
        ...(input.entityType === "ARTIST"
          ? { artistId: input.entityId }
          : { albumId: input.entityId }),
      },
    });
    return result.count > 0;
  }

  async findByUserId(userId: string): Promise<FavoriteWithEntity[]> {
    const records = await prisma.favorite.findMany({
      where: { userId },
      include: { artist: true, album: true },
      orderBy: { createdAt: "desc" },
    });
    return records.map(toFavoriteWithEntity);
  }

  exists(input: {
    userId: string;
    entityType: FavoriteEntityType;
    entityId: string;
  }): Promise<boolean> {
    return prisma.favorite
      .count({
        where: {
          userId: input.userId,
          entityType: input.entityType,
          ...(input.entityType === "ARTIST"
            ? { artistId: input.entityId }
            : { albumId: input.entityId }),
        },
      })
      .then((count) => count > 0);
  }
}
