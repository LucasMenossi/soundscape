import { beforeEach, describe, expect, it, vi } from "vitest";

const { musicBrainzGet } = vi.hoisted(() => ({
  musicBrainzGet: vi.fn(),
}));

vi.mock("./client", () => ({
  musicBrainzGet,
  MusicBrainzError: class MusicBrainzError extends Error {},
}));

import { MusicBrainzAlbumProvider } from "./album.provider";

describe("MusicBrainzAlbumProvider", () => {
  beforeEach(() => {
    musicBrainzGet.mockReset();
  });

  it("searches release groups using a quoted release-group title", async () => {
    musicBrainzGet.mockResolvedValue({
      count: 1,
      offset: 0,
      "release-groups": [
        {
          id: "b1392450-e666-3926-a536-22c65f834433",
          title: "OK Computer",
          "first-release-date": "1997-05-21",
          "primary-type": "Album",
          "artist-credit": [
            {
              name: "Radiohead",
              artist: {
                id: "a74b1b7f-71a5-4011-9441-d0b5e4122711",
                name: "Radiohead",
                "sort-name": "Radiohead",
              },
            },
          ],
          score: 100,
        },
      ],
    });

    const provider = new MusicBrainzAlbumProvider();
    const result = await provider.searchAlbums("  OK Computer  ", {
      limit: 5,
      offset: 10,
    });

    expect(musicBrainzGet).toHaveBeenCalledWith("release-group", {
      query: 'releasegroup:"OK Computer"',
      limit: "5",
      offset: "10",
    });
    expect(result.results).toHaveLength(1);
    expect(result.results[0].album.title).toBe("OK Computer");
    expect(result.results[0].score).toBe(100);
  });

  it("escapes quotes and backslashes in the search phrase", async () => {
    musicBrainzGet.mockResolvedValue({
      count: 0,
      offset: 0,
      "release-groups": [],
    });

    const provider = new MusicBrainzAlbumProvider();
    await provider.searchAlbums('A "quoted" \\ title');

    expect(musicBrainzGet).toHaveBeenCalledWith(
      "release-group",
      expect.objectContaining({
        query: 'releasegroup:"A \\"quoted\\" \\\\ title"',
      }),
    );
  });

  it("rejects an empty search query without calling MusicBrainz", async () => {
    const provider = new MusicBrainzAlbumProvider();

    await expect(provider.searchAlbums("   ")).rejects.toThrow(
      "Album search query cannot be empty",
    );
    expect(musicBrainzGet).not.toHaveBeenCalled();
  });
});
