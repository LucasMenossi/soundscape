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

  it("searches release groups by the artist MusicBrainz ID", async () => {
    musicBrainzGet.mockResolvedValue({
      "release-group-count": 1,
      "release-group-offset": 0,
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
    const result = await provider.searchAlbumsByArtist(
      "a74b1b7f-71a5-4011-9441-d0b5e4122711",
    );

    expect(musicBrainzGet).toHaveBeenCalledWith("release-group", {
      artist: "a74b1b7f-71a5-4011-9441-d0b5e4122711",
      type: "album",
      "release-group-status": "website-default",
      inc: "artist-credits",
      limit: "100",
      offset: "0",
    });
    expect(result.results[0].album.title).toBe("OK Computer");
  });

  it("keeps only primary-type albums without secondary release types in discographies", async () => {
    const artist = {
      id: "a74b1b7f-71a5-4011-9441-d0b5e4122711",
      name: "Radiohead",
      "sort-name": "Radiohead",
    };
    const releaseGroup = {
      id: "b1392450-e666-3926-a536-22c65f834433",
      title: "OK Computer",
      "first-release-date": "1997-05-21",
      "primary-type": "Album",
      "artist-credit": [{ name: "Radiohead", artist }],
      score: 100,
    };

    musicBrainzGet.mockResolvedValue({
      "release-group-count": 4,
      "release-group-offset": 0,
      "release-groups": [
        releaseGroup,
        {
          ...releaseGroup,
          id: "c1392450-e666-3926-a536-22c65f834433",
          title: "The Bends (Live)",
          "secondary-types": ["Live"],
        },
        {
          ...releaseGroup,
          id: "d1392450-e666-3926-a536-22c65f834433",
          title: "The Best Of",
          "secondary-types": ["Compilation"],
        },
        {
          ...releaseGroup,
          id: "e1392450-e666-3926-a536-22c65f834433",
          title: "Creep",
          "primary-type": "Single",
        },
      ],
    });

    const provider = new MusicBrainzAlbumProvider();
    const result = await provider.searchAlbumsByArtist(
      "a74b1b7f-71a5-4011-9441-d0b5e4122711",
    );

    expect(result.results).toHaveLength(1);
    expect(result.results[0].album.title).toBe("OK Computer");
    expect(result.count).toBe(1);
  });

  it("loads every browse page before filtering the artist discography", async () => {
    const artist = {
      id: "a74b1b7f-71a5-4011-9441-d0b5e4122711",
      name: "Radiohead",
      "sort-name": "Radiohead",
    };
    const createAlbum = (index: number) => ({
      id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
      title: `Album ${index}`,
      "primary-type": "Album",
      "artist-credit": [{ name: "Radiohead", artist }],
    });

    musicBrainzGet
      .mockResolvedValueOnce({
        "release-group-count": 101,
        "release-group-offset": 0,
        "release-groups": Array.from({ length: 100 }, (_, index) =>
          createAlbum(index),
        ),
      })
      .mockResolvedValueOnce({
        "release-group-count": 101,
        "release-group-offset": 100,
        "release-groups": [createAlbum(100)],
      });

    const provider = new MusicBrainzAlbumProvider();
    const result = await provider.searchAlbumsByArtist(
      "a74b1b7f-71a5-4011-9441-d0b5e4122711",
    );

    expect(musicBrainzGet).toHaveBeenCalledTimes(2);
    expect(musicBrainzGet).toHaveBeenNthCalledWith(2, "release-group", {
      artist: "a74b1b7f-71a5-4011-9441-d0b5e4122711",
      type: "album",
      "release-group-status": "website-default",
      inc: "artist-credits",
      limit: "100",
      offset: "100",
    });
    expect(result.results).toHaveLength(101);
  });

  it("loads release editions for a release group and maps edition metadata", async () => {
    musicBrainzGet.mockResolvedValue({
      id: "b1392450-e666-3926-a536-22c65f834433",
      releases: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          title: "OK Computer",
          date: "1997-06-16",
          country: "GB",
          status: "Official",
          barcode: "724385200123",
          packaging: "Jewel Case",
          "label-info": [
            {
              "catalog-number": "CDNODATA 02",
              label: { name: "Parlophone" },
            },
          ],
          media: [{ position: 1, format: "CD", "track-count": 12 }],
        },
        {
          id: "22222222-2222-4222-8222-222222222222",
          title: "OK Computer (Reissue)",
          date: "2009",
          country: "GB",
        },
      ],
    });

    const provider = new MusicBrainzAlbumProvider();
    const result = await provider.getAlbumReleases(
      "b1392450-e666-3926-a536-22c65f834433",
    );

    expect(musicBrainzGet).toHaveBeenCalledWith(
      "release-group/b1392450-e666-3926-a536-22c65f834433",
      { inc: "releases" },
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: "11111111-1111-4111-8111-111111111111",
      country: "GB",
      labels: [{ name: "Parlophone", catalogNumber: "CDNODATA 02" }],
      media: [{ position: 1, format: "CD", trackCount: 12 }],
    });
  });

  it("loads a release tracklist and maps recording duration as a fallback", async () => {
    musicBrainzGet.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      title: "OK Computer",
      date: "1997-06-16",
      country: "GB",
      status: "Official",
      "label-info": [{ label: { name: "Parlophone" } }],
      media: [
        {
          position: 1,
          format: "CD",
          "track-count": 2,
          tracks: [
            {
              id: "33333333-3333-4333-8333-333333333333",
              number: "1",
              title: "Airbag",
              length: 284000,
            },
            {
              id: "44444444-4444-4444-8444-444444444444",
              number: "2",
              title: "Paranoid Android",
              recording: { length: 383000 },
            },
          ],
        },
      ],
    });

    const provider = new MusicBrainzAlbumProvider();
    const result = await provider.getReleaseDetails(
      "11111111-1111-4111-8111-111111111111",
    );

    expect(musicBrainzGet).toHaveBeenCalledWith(
      "release/11111111-1111-4111-8111-111111111111",
      { inc: "recordings labels" },
    );
    expect(result.media[0].tracks).toEqual([
      {
        id: "33333333-3333-4333-8333-333333333333",
        number: "1",
        title: "Airbag",
        lengthMs: 284000,
      },
      {
        id: "44444444-4444-4444-8444-444444444444",
        number: "2",
        title: "Paranoid Android",
        lengthMs: 383000,
      },
    ]);
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
