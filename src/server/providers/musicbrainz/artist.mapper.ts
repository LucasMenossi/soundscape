import type { ArtistCatalogData } from "@/server/domain/artist";

import type { MusicBrainzArtistDTO } from "./artist.schemas";

export interface ArtistSearchResult {
  artist: ArtistCatalogData;
  score: number | null;
}

export function mapMusicBrainzArtist(
  dto: MusicBrainzArtistDTO,
): ArtistCatalogData {
  return {
    musicBrainzId: dto.id,
    name: dto.name,
    sortName: dto["sort-name"] ?? null,
    disambiguation: dto.disambiguation ?? null,
    countryCode: dto.country ?? null,
    beginDate: dto["life-span"]?.begin ?? null,
    endDate: dto["life-span"]?.end ?? null,
  };
}

export function mapMusicBrainzArtistSearchResult(
  dto: MusicBrainzArtistDTO,
): ArtistSearchResult {
  return {
    artist: mapMusicBrainzArtist(dto),
    score: dto.score ?? null,
  };
}
