import type {
  Album,
  AlbumCatalogData,
  AlbumWithPrimaryArtist,
} from "@/server/domain/album";

export interface AlbumRepository {
  findById(id: string): Promise<Album | null>;

  findByIdWithPrimaryArtist(
    id: string,
  ): Promise<AlbumWithPrimaryArtist | null>;

  findByPrimaryArtistId(
    artistId: string,
  ): Promise<AlbumWithPrimaryArtist[]>;

  findByMusicBrainzReleaseGroupId(
    musicBrainzReleaseGroupId: string,
  ): Promise<Album | null>;

  upsertFromCatalog(data: AlbumCatalogData): Promise<Album>;
}
