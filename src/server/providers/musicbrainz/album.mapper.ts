import type { AlbumCatalogData } from "@/server/domain/album";
import type { MusicBrainzReleaseGroupDTO } from "./album.schemas";

export interface AlbumSearchResult {
  album: AlbumCatalogData;
  score: number | null;
}

export function mapMusicBrainzReleaseGroup(
  dto: MusicBrainzReleaseGroupDTO,
): AlbumCatalogData | null {
  const primaryArtistCredit = dto["artist-credit"]?.[0];

  if (
    !primaryArtistCredit ||
    typeof primaryArtistCredit === "string" ||
    !("artist" in primaryArtistCredit)
  ) {
    return null;
  }

  const primaryArtist = primaryArtistCredit.artist;

  return {
    musicBrainzReleaseGroupId: dto.id,
    title: dto.title,
    firstReleaseDate: dto["first-release-date"] ?? null,
    albumType: dto["primary-type"] ?? null,
    primaryArtist: {
      musicBrainzId: primaryArtist.id,
      name: primaryArtist.name,
      sortName: primaryArtist["sort-name"] ?? null,
      disambiguation: null,
      countryCode: null,
      beginDate: null,
      endDate: null,
    },
  };
}

export function mapMusicBrainzReleaseGroupSearchResult(
  dto: MusicBrainzReleaseGroupDTO,
): AlbumSearchResult | null {
  const album = mapMusicBrainzReleaseGroup(dto);

  if (!album) {
    return null;
  }

  return {
    album,
    score: dto.score ?? null,
  };
}
