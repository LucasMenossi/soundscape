export interface Artist {
  id: string;
  musicBrainzId: string;
  name: string;
  sortName: string | null;
  disambiguation: string | null;
  countryCode: string | null;
  beginDate: string | null;
  endDate: string | null;
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArtistCatalogData {
  musicBrainzId: string;
  name: string;
  sortName: string | null;
  disambiguation: string | null;
  countryCode: string | null;
  beginDate: string | null;
  endDate: string | null;
}

export interface ArtistRelationshipCatalogData {
  relationshipType:
    | "member of band"
    | "collaboration"
    | "supporting musician"
    | "subgroup"
    | "artist rename";
  direction: "forward" | "backward" | null;
  targetArtist: ArtistCatalogData;
}

export interface ArtistRelationship {
  id: string;
  relationshipType:
    | "band member"
    | "member of band"
    | "collaboration"
    | "supporting artist"
    | "supported artist"
    | "subgroup"
    | "renamed from"
    | "band relationship"
    | "supporting relationship";
  artist: Artist;
}
