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
