export interface AlbumReleaseLabel {
  name: string;
  catalogNumber: string | null;
}

export interface AlbumReleaseMediumSummary {
  position: number;
  format: string | null;
  trackCount: number;
}

export interface AlbumReleaseEdition {
  id: string;
  title: string;
  date: string | null;
  country: string | null;
  status: string | null;
  barcode: string | null;
  packaging: string | null;
  labels: AlbumReleaseLabel[];
  media: AlbumReleaseMediumSummary[];
}

export interface AlbumReleaseTrack {
  id: string;
  number: string;
  title: string;
  lengthMs: number | null;
}

export interface AlbumReleaseMedium extends AlbumReleaseMediumSummary {
  title: string | null;
  tracks: AlbumReleaseTrack[];
}

export interface AlbumReleaseDetails extends AlbumReleaseEdition {
  media: AlbumReleaseMedium[];
}
