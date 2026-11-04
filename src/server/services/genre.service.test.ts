import { beforeEach, describe, expect, it, vi } from "vitest";

import type { GenreRepository } from "@/server/repositories/genre.repository";
import type { MusicBrainzGenreProvider } from "@/server/providers/musicbrainz/genre.provider";
import { GenreService } from "./genre.service";

describe("GenreService", () => {
  let repository: GenreRepository;
  let provider: MusicBrainzGenreProvider;

  beforeEach(() => {
    repository = {
      syncGenreCatalog: vi.fn().mockResolvedValue(undefined),
      syncArtistGenres: vi.fn().mockResolvedValue(undefined),
      syncAlbumGenres: vi.fn().mockResolvedValue(undefined),
      listGenres: vi.fn().mockResolvedValue([]),
      findBySlug: vi.fn().mockResolvedValue(null),
      getArtistGenres: vi.fn().mockResolvedValue([]),
      getAlbumGenres: vi.fn().mockResolvedValue([]),
    };
    provider = {
      getAllGenres: vi.fn().mockResolvedValue(["Alternative rock", "Jazz"]),
      getArtistGenres: vi.fn().mockResolvedValue(["Alternative rock"]),
      getReleaseGroupGenres: vi.fn().mockResolvedValue(["Jazz"]),
    } as unknown as MusicBrainzGenreProvider;
  });

  it("synchronizes the global genre vocabulary independently of local entities", async () => {
    const service = new GenreService(repository, provider, 60_000);

    await service.listGenres();

    expect(provider.getAllGenres).toHaveBeenCalledOnce();
    expect(repository.syncGenreCatalog).toHaveBeenCalledWith(["Alternative rock", "Jazz"]);
    expect(repository.listGenres).toHaveBeenCalledOnce();
  });

  it("caches a successful catalog sync during the configured TTL", async () => {
    const service = new GenreService(repository, provider, 60_000);

    await service.listGenres();
    await service.listGenres();

    expect(provider.getAllGenres).toHaveBeenCalledOnce();
    expect(repository.syncGenreCatalog).toHaveBeenCalledOnce();
  });

  it("does not persist free-form tags as genres", async () => {
    const service = new GenreService(repository, provider);

    await service.syncArtistGenres("artist-internal-id", "a74b1b7f-71a5-4011-9441-d0b5e4122711");

    expect(provider.getArtistGenres).toHaveBeenCalledOnce();
    expect(repository.syncArtistGenres).toHaveBeenCalledWith("artist-internal-id", ["Alternative rock"]);
  });


  it("keeps only SoundScape's approved genre names in the global catalog", async () => {
    vi.mocked(provider.getAllGenres).mockResolvedValue([
      "alternative rock",
      "female vocalists",
      "seen live",
      "1990s",
      "britpop",
      "zouk",
      "jazz",
    ]);
    const service = new GenreService(repository, provider, 60_000);

    await service.listGenres();

    expect(repository.syncGenreCatalog).toHaveBeenCalledWith([
      "Alternative rock",
      "Britpop",
      "Jazz",
    ]);
  });

  it("filters irrelevant and unknown labels from artist associations", async () => {
    vi.mocked(provider.getArtistGenres).mockResolvedValue([
      "alternative rock",
      "female vocalists",
      "seen live",
      "1990s",
      "britpop",
    ]);
    const service = new GenreService(repository, provider);

    await service.syncArtistGenres("artist-internal-id", "a74b1b7f-71a5-4011-9441-d0b5e4122711");

    expect(repository.syncArtistGenres).toHaveBeenCalledWith("artist-internal-id", [
      "Alternative rock",
      "Britpop",
    ]);
  });

  it("filters irrelevant and unknown labels from album associations", async () => {
    vi.mocked(provider.getReleaseGroupGenres).mockResolvedValue(["art rock", "soundtrack", "favorite"]);
    const service = new GenreService(repository, provider);

    await service.syncAlbumGenres("album-internal-id", "b1392450-e666-3926-a536-22c65f834433");

    expect(repository.syncAlbumGenres).toHaveBeenCalledWith("album-internal-id", ["Art rock"]);
  });

  it("keeps serving the previously stored catalog if MusicBrainz is unavailable", async () => {
    vi.mocked(provider.getAllGenres).mockRejectedValueOnce(new Error("upstream unavailable"));
    const service = new GenreService(repository, provider);

    await expect(service.listGenres()).resolves.toEqual([]);
    expect(repository.listGenres).toHaveBeenCalledOnce();
    expect(repository.syncGenreCatalog).not.toHaveBeenCalled();
  });
});
