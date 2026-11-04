import type {
  Artist,
  ArtistCatalogData,
  ArtistRelationship,
  ArtistRelationshipCatalogData,
} from "../domain/artist";

export interface ArtistRepository {
  findById(id: string): Promise<Artist | null>;

  findByMusicBrainzId(musicBrainzId: string): Promise<Artist | null>;

  upsertFromCatalog(data: ArtistCatalogData): Promise<Artist>;

  syncRelationships(
    sourceArtistId: string,
    relationships: ArtistRelationshipCatalogData[],
  ): Promise<void>;

  findRelationshipsBySourceArtistId(
    sourceArtistId: string,
  ): Promise<ArtistRelationship[]>;
}
