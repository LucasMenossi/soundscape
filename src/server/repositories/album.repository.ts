import type { Album, AlbumCatalogData } from "@/server/domain/album";

export interface AlbumRepository {
  findById(id: string): Promise<Album | null>;

  findByMusicBrainzReleaseGroupId(
    musicBrainzReleaseGroupId: string,
  ): Promise<Album | null>;

  upsertFromCatalog(data: AlbumCatalogData): Promise<Album>;
}
