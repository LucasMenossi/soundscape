import { beforeEach, describe, expect, it, vi } from "vitest";

const { musicBrainzGet, musicBrainzGetText } = vi.hoisted(() => ({
  musicBrainzGet: vi.fn(),
  musicBrainzGetText: vi.fn(),
}));
vi.mock("./client", () => ({
  musicBrainzGet,
  musicBrainzGetText,
  MusicBrainzError: class MusicBrainzError extends Error {
    constructor(message: string, _status?: number, options?: ErrorOptions) {
      super(message, options);
    }
  },
}));

import { MusicBrainzGenreProvider } from "./genre.provider";

const artistId = "a74b1b7f-71a5-4011-9441-d0b5e4122711";
const releaseGroupId = "b1392450-e666-3926-a536-22c65f834433";

describe("MusicBrainzGenreProvider", () => {
  beforeEach(() => {
    musicBrainzGet.mockReset();
    musicBrainzGetText.mockReset();
  });

  it("retrieves only MusicBrainz genres for artists", async () => {
    musicBrainzGet.mockResolvedValue({
      genres: [{ name: "Alternative Rock", count: 12 }, { name: "  britpop " }],
      tags: [{ name: "1990s" }, { name: "sad" }],
    });

    await expect(new MusicBrainzGenreProvider().getArtistGenres(artistId)).resolves.toEqual([
      "Alternative Rock",
      "britpop",
    ]);
    expect(musicBrainzGet).toHaveBeenCalledWith(`artist/${artistId}`, { inc: "genres" });
  });

  it("retrieves only MusicBrainz genres for release groups", async () => {
    musicBrainzGet.mockResolvedValue({ genres: [{ name: "art rock" }] });

    await expect(new MusicBrainzGenreProvider().getReleaseGroupGenres(releaseGroupId)).resolves.toEqual([
      "art rock",
    ]);
    expect(musicBrainzGet).toHaveBeenCalledWith(`release-group/${releaseGroupId}`, { inc: "genres" });
  });

  it("loads the complete curated vocabulary from the plain-text endpoint in one request", async () => {
    musicBrainzGetText.mockResolvedValue("alternative rock\nambient\nzouk\n");

    await expect(new MusicBrainzGenreProvider().getAllGenres()).resolves.toEqual([
      "alternative rock",
      "ambient",
      "zouk",
    ]);
    expect(musicBrainzGetText).toHaveBeenCalledOnce();
    expect(musicBrainzGetText).toHaveBeenCalledWith("genre/all");
  });

  it("rejects an empty global genre catalog", async () => {
    musicBrainzGetText.mockResolvedValue("\n  \n");
    await expect(new MusicBrainzGenreProvider().getAllGenres()).rejects.toThrow(
      "MusicBrainz returned an empty genre catalog",
    );
  });

  it("returns an empty genre list when an entity has no genres", async () => {
    musicBrainzGet.mockResolvedValue({ tags: [{ name: "1990s" }] });
    await expect(new MusicBrainzGenreProvider().getReleaseGroupGenres(releaseGroupId)).resolves.toEqual([]);
  });
});
