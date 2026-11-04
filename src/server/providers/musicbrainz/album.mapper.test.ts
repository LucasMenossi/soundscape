import { describe, expect, it } from "vitest";

import {
  mapMusicBrainzReleaseGroup,
  mapMusicBrainzReleaseGroupSearchResult,
} from "./album.mapper";

import type { MusicBrainzReleaseGroupDTO } from "./album.schemas";

const releaseGroupDTO: MusicBrainzReleaseGroupDTO = {
  id: "d9c5b7d4-7b6e-4c6f-9c0e-5d8b4c1e7a10",
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
};

describe("MusicBrainz release group mapper", () => {
  it("maps release group data to the catalog format", () => {
    const result = mapMusicBrainzReleaseGroup(releaseGroupDTO);

    expect(result).toEqual({
      musicBrainzReleaseGroupId: releaseGroupDTO.id,
      title: "OK Computer",
      firstReleaseDate: "1997-05-21",
      albumType: "Album",
      primaryArtist: {
        musicBrainzId: "a74b1b7f-71a5-4011-9441-d0b5e4122711",
        name: "Radiohead",
        sortName: "Radiohead",
        disambiguation: null,
        countryCode: null,
        beginDate: null,
        endDate: null,
      },
    });
  });

  it("uses null for optional album fields", () => {
    const result = mapMusicBrainzReleaseGroup({
      ...releaseGroupDTO,
      "first-release-date": undefined,
      "primary-type": undefined,
    });

    expect(result?.firstReleaseDate).toBeNull();
    expect(result?.albumType).toBeNull();
  });

  it("returns null when the release group has no artist credit", () => {
    const result = mapMusicBrainzReleaseGroup({
      ...releaseGroupDTO,
      "artist-credit": [],
    });

    expect(result).toBeNull();
  });

  it("keeps search score separate from catalog data", () => {
    const result = mapMusicBrainzReleaseGroupSearchResult(releaseGroupDTO);

    expect(result?.score).toBe(100);
    expect(result?.album).not.toHaveProperty("score");
  });
});
