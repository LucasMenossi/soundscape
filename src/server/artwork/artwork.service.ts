import "server-only";

import type { Artist } from "@/server/domain/artist";
import type { AlbumWithPrimaryArtist } from "@/server/domain/album";
import type { CoverArtArchiveProvider } from "@/server/providers/cover-art-archive/cover-art-archive.provider";
import type { TheAudioDbProvider } from "@/server/providers/theaudiodb/theaudiodb.provider";
import type { ArtworkCandidateRecord, ArtworkRepository, NewArtworkCandidate } from "./artwork.repository";

export interface PublicArtworkAttribution {
  creator: string | null;
  sourcePageUrl: string;
  licenseShortName: string;
  licenseUrl: string;
  credit: string | null;
}

export interface ResolvedArtwork {
  src: string;
  alt: string;
  sourceName: string;
  sourcePageUrl: string;
  attribution?: PublicArtworkAttribution;
}

export type ResolvedArtistArtwork = ResolvedArtwork;

const ARTWORK_SEARCH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function toCandidateRecord(
  sourceProvider: "THE_AUDIO_DB" | "COVER_ART_ARCHIVE",
  candidate: { sourceFileId: string; sourcePageUrl: string; imageUrl: string; description: string },
  reason: string,
): NewArtworkCandidate {
  return {
    sourceProvider,
    sourceFileId: candidate.sourceFileId,
    sourcePageUrl: candidate.sourcePageUrl,
    imageUrl: candidate.imageUrl,
    description: candidate.description,
    creator: null,
    credit: null,
    licenseShortName: null,
    licenseUrl: null,
    width: null,
    height: null,
    relevanceScore: 100,
    selectionReason: reason,
  };
}

export class ArtworkService {
  private readonly searchesInFlight = new Map<string, Promise<void>>();

  constructor(
    private readonly repository: ArtworkRepository,
    private readonly theAudioDbProvider: TheAudioDbProvider,
    private readonly coverArtArchiveProvider: CoverArtArchiveProvider,
  ) {}

  async ensureArtistArtwork(artist: Artist): Promise<void> {
    const lastSearchedAt = await this.repository.getArtistArtworkLastSearchedAt(artist.id);
    if (lastSearchedAt && Date.now() - lastSearchedAt.getTime() < ARTWORK_SEARCH_TTL_MS) return;

    return this.runSearch(`artist:${artist.id}`, async () => {
      const candidate = await this.theAudioDbProvider.findArtistImage(artist.musicBrainzId);
      await this.repository.saveAutomaticArtistSelection(
        artist.id,
        candidate
          ? toCandidateRecord("THE_AUDIO_DB", candidate, "Matched by MusicBrainz artist MBID; preferred artist thumbnail")
          : null,
      );
      await this.repository.markArtistArtworkSearched(artist.id, new Date());
    });
  }

  async ensureAlbumArtwork(album: AlbumWithPrimaryArtist): Promise<void> {
    const lastSearchedAt = await this.repository.getAlbumArtworkLastSearchedAt(album.id);
    if (lastSearchedAt && Date.now() - lastSearchedAt.getTime() < ARTWORK_SEARCH_TTL_MS) return;

    return this.runSearch(`album:${album.id}`, async () => {
      const candidate = await this.coverArtArchiveProvider.findFrontCover(album.musicBrainzReleaseGroupId);
      await this.repository.saveAutomaticAlbumSelection(
        album.id,
        candidate
          ? toCandidateRecord("COVER_ART_ARCHIVE", candidate, "Front cover matched by MusicBrainz release-group MBID")
          : null,
      );
      await this.repository.markAlbumArtworkSearched(album.id, new Date());
    });
  }

  private async runSearch(key: string, operation: () => Promise<void>): Promise<void> {
    const existingSearch = this.searchesInFlight.get(key);
    if (existingSearch) return existingSearch;
    const search = operation();
    this.searchesInFlight.set(key, search);
    try { await search; }
    finally { this.searchesInFlight.delete(key); }
  }

  async resolveArtistArtwork(artist: Artist): Promise<ResolvedArtwork | null> {
    await this.ensureArtistArtwork(artist);
    const asset = await this.repository.findDisplayableArtistArtwork(artist.id);
    return this.toResolvedArtwork(asset, artist.name);
  }

  async resolveAlbumArtwork(album: AlbumWithPrimaryArtist): Promise<ResolvedArtwork | null> {
    await this.ensureAlbumArtwork(album);
    const asset = await this.repository.findDisplayableAlbumArtwork(album.id);
    return this.toResolvedArtwork(asset, `${album.title} by ${album.primaryArtist.name}`);
  }

  private toResolvedArtwork(asset: ArtworkCandidateRecord | null, alt: string): ResolvedArtwork | null {
    if (!asset || (asset.reviewStatus !== "AUTO_APPROVED" && asset.reviewStatus !== "CLEARED")) return null;
    try {
      const imageUrl = new URL(asset.imageUrl);
      const sourceUrl = new URL(asset.sourcePageUrl);
      if (imageUrl.protocol !== "https:" || sourceUrl.protocol !== "https:") return null;
    } catch {
      return null;
    }

    if (asset.sourceProvider === "THE_AUDIO_DB") {
      return { src: asset.imageUrl, alt: `${alt} — artist image`, sourceName: "TheAudioDB", sourcePageUrl: asset.sourcePageUrl };
    }
    if (asset.sourceProvider === "COVER_ART_ARCHIVE") {
      return { src: asset.imageUrl, alt: `${alt} — front cover`, sourceName: "Cover Art Archive", sourcePageUrl: asset.sourcePageUrl };
    }
    if (asset.sourceProvider === "WIKIMEDIA_COMMONS" && asset.licenseShortName && asset.licenseUrl) {
      return {
        src: asset.imageUrl,
        alt: `${alt} — image from Wikimedia Commons`,
        sourceName: "Wikimedia Commons",
        sourcePageUrl: asset.sourcePageUrl,
        attribution: {
          creator: asset.creator,
          sourcePageUrl: asset.sourcePageUrl,
          licenseShortName: asset.licenseShortName,
          licenseUrl: asset.licenseUrl,
          credit: asset.credit,
        },
      };
    }
    return null;
  }
}
