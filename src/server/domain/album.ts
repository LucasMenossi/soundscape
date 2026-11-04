import type { Artist } from "./artist";

export interface Album {
  id: string;
  musicBrainzReleaseGroupId: string;
  title: string;
  firstReleaseDate: string | null;
  primaryArtistId: string;
  albumType: string | null;
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlbumCatalogData {
  musicBrainzReleaseGroupId: string;
  title: string;
  firstReleaseDate: string | null;
  albumType: string | null;
  primaryArtist: {
    musicBrainzId: string;
    name: string;
    sortName: string | null;
    disambiguation: string | null;
    countryCode: string | null;
    beginDate: string | null;
    endDate: string | null;
  };
}

export interface AlbumWithPrimaryArtist extends Album {
  primaryArtist: Artist;
}
