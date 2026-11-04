import type {
  ArtistCatalogData,
  ArtistRelationshipCatalogData,
} from "@/server/domain/artist";
import type {
  MusicBrainzArtistDTO,
  MusicBrainzArtistRelationshipDTO,
} from "./artist.schemas";

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

type SupportedRelationshipType =
  ArtistRelationshipCatalogData["relationshipType"];

const SUPPORTED_RELATIONSHIP_TYPES = new Set<SupportedRelationshipType>([
  "member of band",
  "collaboration",
  "supporting musician",
  "subgroup",
  "artist rename",
]);

function isSupportedRelationshipType(
  type: string,
): type is SupportedRelationshipType {
  return SUPPORTED_RELATIONSHIP_TYPES.has(type as SupportedRelationshipType);
}

export function mapMusicBrainzArtistRelationships(
  relations: MusicBrainzArtistRelationshipDTO[],
  sourceMusicBrainzId: string,
): ArtistRelationshipCatalogData[] {
  return relations.flatMap((relation) => {
    if (!isSupportedRelationshipType(relation.type)) return [];
    if (!relation.artist?.id || relation.artist.id === sourceMusicBrainzId)
      return [];

    let relationshipType: ArtistRelationshipCatalogData["relationshipType"];
    let direction = relation.direction ?? null;

    if (relation.type === "member of band") {
      // MusicBrainz may omit direction on some JSON relationship records.
      // The linked artist type provides a safe fallback for person/group pairs.
      if (!direction && relation.artist.type === "Person")
        direction = "backward";
      if (!direction && relation.artist.type === "Group") direction = "forward";
      relationshipType = "member of band";
    } else if (relation.type === "supporting musician") {
      if (!direction && relation.artist.type === "Person")
        direction = "backward";
      if (!direction && relation.artist.type === "Group") direction = "forward";
      relationshipType = "supporting musician";
    } else {
      relationshipType = relation.type;
    }

    return [
      {
        relationshipType,
        direction,
        targetArtist: mapMusicBrainzArtist(relation.artist),
      },
    ];
  });
}
