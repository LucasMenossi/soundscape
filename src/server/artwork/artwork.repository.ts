export type ArtworkSourceProvider = "WIKIMEDIA_COMMONS" | "COVER_ART_ARCHIVE" | "THE_AUDIO_DB";
export type ArtworkReviewStatus = "PENDING" | "AUTO_APPROVED" | "CLEARED" | "REJECTED";

export interface ArtworkCandidateRecord {
  id: string;
  artistId: string | null;
  albumId: string | null;
  sourceProvider: ArtworkSourceProvider;
  sourceFileId: string;
  sourcePageUrl: string;
  imageUrl: string;
  description: string | null;
  creator: string | null;
  credit: string | null;
  licenseShortName: string | null;
  licenseUrl: string | null;
  width: number | null;
  height: number | null;
  relevanceScore: number | null;
  selectionReason: string | null;
  reviewStatus: ArtworkReviewStatus;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  reviewNotes: string | null;
}

export interface NewArtworkCandidate {
  sourceProvider: ArtworkSourceProvider;
  sourceFileId: string;
  sourcePageUrl: string;
  imageUrl: string;
  description: string | null;
  creator: string | null;
  credit: string | null;
  licenseShortName: string | null;
  licenseUrl: string | null;
  width: number | null;
  height: number | null;
  relevanceScore: number;
  selectionReason: string;
}

export interface ArtworkRepository {
  saveAutomaticArtistSelection(artistId: string, candidate: NewArtworkCandidate | null): Promise<void>;
  findDisplayableArtistArtwork(artistId: string): Promise<ArtworkCandidateRecord | null>;
  getArtistArtworkLastSearchedAt(artistId: string): Promise<Date | null>;
  markArtistArtworkSearched(artistId: string, searchedAt: Date): Promise<void>;

  saveAutomaticAlbumSelection(albumId: string, candidate: NewArtworkCandidate | null): Promise<void>;
  findDisplayableAlbumArtwork(albumId: string): Promise<ArtworkCandidateRecord | null>;
  getAlbumArtworkLastSearchedAt(albumId: string): Promise<Date | null>;
  markAlbumArtworkSearched(albumId: string, searchedAt: Date): Promise<void>;
}
