import { describe, expect, it, vi } from "vitest";
import type { Artist } from "@/server/domain/artist";
import type { AlbumWithPrimaryArtist } from "@/server/domain/album";
import type { ArtworkCandidateRecord, ArtworkRepository } from "./artwork.repository";
import { ArtworkService } from "./artwork.service";

const artist = {
  id: "artist-1",
  musicBrainzId: "11111111-1111-4111-8111-111111111111",
  name: "Example Artist",
} as Artist;
const album = {
  id: "album-1",
  musicBrainzReleaseGroupId: "22222222-2222-4222-8222-222222222222",
  title: "Example Album",
  primaryArtist: artist,
} as AlbumWithPrimaryArtist;

function record(overrides: Partial<ArtworkCandidateRecord> = {}): ArtworkCandidateRecord {
  return {
    id: "asset-1", artistId: artist.id, albumId: null, sourceProvider: "THE_AUDIO_DB",
    sourceFileId: "artist-123", sourcePageUrl: "https://www.theaudiodb.com/artist/artist-123",
    imageUrl: "https://www.theaudiodb.com/images/media/artist/thumb/example.jpg",
    description: "Example Artist", creator: null, credit: null, licenseShortName: null,
    licenseUrl: null, width: null, height: null, relevanceScore: 100,
    selectionReason: "MBID match", reviewStatus: "AUTO_APPROVED", reviewedBy: null,
    reviewedAt: null, reviewNotes: null, ...overrides,
  } as ArtworkCandidateRecord;
}

function createRepository(asset: ArtworkCandidateRecord | null): ArtworkRepository {
  return {
    saveAutomaticArtistSelection: vi.fn().mockResolvedValue(undefined),
    findDisplayableArtistArtwork: vi.fn().mockResolvedValue(asset),
    getArtistArtworkLastSearchedAt: vi.fn().mockResolvedValue(null),
    markArtistArtworkSearched: vi.fn().mockResolvedValue(undefined),
    saveAutomaticAlbumSelection: vi.fn().mockResolvedValue(undefined),
    findDisplayableAlbumArtwork: vi.fn().mockResolvedValue(asset),
    getAlbumArtworkLastSearchedAt: vi.fn().mockResolvedValue(null),
    markAlbumArtworkSearched: vi.fn().mockResolvedValue(undefined),
  };
}

describe("ArtworkService", () => {
  it("resolves the artist thumbnail from TheAudioDB using the MusicBrainz MBID", async () => {
    const repository = createRepository(record());
    const theAudioDb = { findArtistImage: vi.fn().mockResolvedValue({
      sourceFileId: "artist-123",
      sourcePageUrl: "https://www.theaudiodb.com/artist/artist-123",
      imageUrl: "https://www.theaudiodb.com/images/media/artist/thumb/example.jpg",
      description: "Example Artist",
    }) };
    const coverArtArchive = { findFrontCover: vi.fn() };
    const service = new ArtworkService(repository, theAudioDb as never, coverArtArchive as never);

    await expect(service.resolveArtistArtwork(artist)).resolves.toMatchObject({
      sourceName: "TheAudioDB",
      src: "https://www.theaudiodb.com/images/media/artist/thumb/example.jpg",
    });
    expect(theAudioDb.findArtistImage).toHaveBeenCalledWith(artist.musicBrainzId);
    expect(repository.saveAutomaticArtistSelection).toHaveBeenCalledWith(artist.id, expect.objectContaining({
      sourceProvider: "THE_AUDIO_DB",
      relevanceScore: 100,
    }));
  });

  it("resolves the approved front image from Cover Art Archive using the release-group MBID", async () => {
    const albumAsset = record({
      artistId: null,
      albumId: album.id,
      sourceProvider: "COVER_ART_ARCHIVE",
      sourceFileId: `${album.musicBrainzReleaseGroupId}:front`,
      sourcePageUrl: `https://coverartarchive.org/release-group/${album.musicBrainzReleaseGroupId}`,
      imageUrl: "https://archive.org/download/example/cover.jpg",
      description: "Front cover from Cover Art Archive",
    });
    const repository = createRepository(albumAsset);
    const theAudioDb = { findArtistImage: vi.fn() };
    const coverArtArchive = { findFrontCover: vi.fn().mockResolvedValue({
      sourceFileId: `${album.musicBrainzReleaseGroupId}:front`,
      sourcePageUrl: `https://coverartarchive.org/release-group/${album.musicBrainzReleaseGroupId}`,
      imageUrl: "https://archive.org/download/example/cover.jpg",
      description: "Front cover from Cover Art Archive",
    }) };
    const service = new ArtworkService(repository, theAudioDb as never, coverArtArchive as never);

    await expect(service.resolveAlbumArtwork(album)).resolves.toMatchObject({
      sourceName: "Cover Art Archive",
      src: "https://archive.org/download/example/cover.jpg",
      alt: "Example Album by Example Artist — front cover",
    });
    expect(coverArtArchive.findFrontCover).toHaveBeenCalledWith(album.musicBrainzReleaseGroupId);
    expect(repository.saveAutomaticAlbumSelection).toHaveBeenCalledWith(album.id, expect.objectContaining({
      sourceProvider: "COVER_ART_ARCHIVE",
    }));
  });

  it("does not expose an asset with a non-HTTPS URL", async () => {
    const repository = createRepository(record({ imageUrl: "http://example.com/image.jpg" }));
    // The resolver performs a refresh when no search timestamp exists, so provide
    // valid provider doubles even though this test is focused on URL validation.
    const theAudioDb = { findArtistImage: vi.fn().mockResolvedValue(null) };
    const coverArtArchive = { findFrontCover: vi.fn().mockResolvedValue(null) };
    const service = new ArtworkService(repository, theAudioDb as never, coverArtArchive as never);
    await expect(service.resolveArtistArtwork(artist)).resolves.toBeNull();
    expect(theAudioDb.findArtistImage).toHaveBeenCalledWith(artist.musicBrainzId);
  });

  it("does not search again within the cache TTL", async () => {
    const repository = createRepository(record());
    vi.mocked(repository.getArtistArtworkLastSearchedAt).mockResolvedValue(new Date());
    const theAudioDb = { findArtistImage: vi.fn() };
    const service = new ArtworkService(repository, theAudioDb as never, {} as never);
    await service.resolveArtistArtwork(artist);
    expect(theAudioDb.findArtistImage).not.toHaveBeenCalled();
  });
});
