import type { GenreBrowseItem } from "@/server/domain/genre";

export interface GenreDetail {
  pagination: {
    artistsPage: number;
    albumsPage: number;
    pageSize: number;
    artistTotal: number;
    albumTotal: number;
  };
  genre: GenreBrowseItem;
  artists: {
    id: string;
    name: string;
    disambiguation: string | null;
    countryCode: string | null;
  }[];
  albums: {
    id: string;
    title: string;
    firstReleaseDate: string | null;
    albumType: string | null;
    artist: { id: string; name: string };
  }[];
}

export interface GenreRepository {
  syncGenreCatalog(genres: string[]): Promise<void>;
  syncArtistGenres(artistId: string, genres: string[]): Promise<void>;
  syncAlbumGenres(albumId: string, genres: string[]): Promise<void>;
  listGenres(): Promise<GenreBrowseItem[]>;
  findBySlug(
    slug: string,
    options?: { artistsPage?: number; albumsPage?: number; pageSize?: number },
  ): Promise<GenreDetail | null>;
  getArtistGenres(artistId: string): Promise<{ name: string; slug: string }[]>;
  getAlbumGenres(albumId: string): Promise<{ name: string; slug: string }[]>;
}
