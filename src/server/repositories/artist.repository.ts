import type { Artist, ArtistCatalogData } from "../domain/artist";

export interface ArtistRepository {
  findById(id: string): Promise<Artist | null>;

  findByMusicBrainzId(musicBrainzId: string): Promise<Artist | null>;

  upsertFromCatalog(data: ArtistCatalogData): Promise<Artist>;
}
