import { describe, expect, it, vi } from "vitest";

import type { Artist, ArtistCatalogData } from "@/server/domain/artist";
import type { ArtistRepository } from "@/server/repositories/artist.repository";
import type { ArtistCatalogProvider } from "@/server/providers/musicbrainz/artist-catalog.provider";

import { ArtistService } from "./artist.service";

const catalogArtist: ArtistCatalogData = {
  musicBrainzId: "a74b1b7f-71a5-4011-9441-d0b5e4122711",
  name: "Radiohead",
  sortName: "Radiohead",
  disambiguation: "UK alternative rock band",
  countryCode: "GB",
  beginDate: "1985",
  endDate: null,
};

const persistedArtist: Artist = {
  id: "artist-internal-id",
  ...catalogArtist,
  lastSyncedAt: new Date("2026-11-04T12:00:00.000Z"),
  createdAt: new Date("2026-11-04T12:00:00.000Z"),
  updatedAt: new Date("2026-11-04T12:00:00.000Z"),
};

describe("ArtistService", () => {
  it("persists catalog search results and returns internal artist IDs", async () => {
    const upsertFromCatalog = vi.fn().mockResolvedValue(persistedArtist);

    const repository: ArtistRepository = {
      findById: vi.fn(),
      findByMusicBrainzId: vi.fn(),
      upsertFromCatalog,
    };

    const provider: ArtistCatalogProvider = {
      searchArtists: vi.fn().mockResolvedValue({
        count: 1,
        offset: 0,
        results: [
          {
            artist: catalogArtist,
            score: 100,
          },
        ],
      }),
      getArtist: vi.fn(),
    };

    const service = new ArtistService(repository, provider);

    const result = await service.searchArtists("Radiohead");

    expect(provider.searchArtists).toHaveBeenCalledWith("Radiohead", undefined);

    expect(upsertFromCatalog).toHaveBeenCalledWith(catalogArtist);

    expect(result).toEqual({
      count: 1,
      offset: 0,
      results: [
        {
          artist: persistedArtist,
          score: 100,
        },
      ],
    });

    expect(result.results[0].artist.id).toBe("artist-internal-id");
  });

  it("retrieves an artist using its internal ID", async () => {
    const repository: ArtistRepository = {
      findById: vi.fn().mockResolvedValue(persistedArtist),
      findByMusicBrainzId: vi.fn(),
      upsertFromCatalog: vi.fn(),
    };

    const provider: ArtistCatalogProvider = {
      searchArtists: vi.fn(),
      getArtist: vi.fn(),
    };

    const service = new ArtistService(repository, provider);

    const result = await service.getArtistById("artist-internal-id");

    expect(repository.findById).toHaveBeenCalledWith("artist-internal-id");
    expect(result).toEqual(persistedArtist);
  });
});
