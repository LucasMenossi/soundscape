import { describe, expect, it } from "vitest";

import {
  mapMusicBrainzArtist,
  mapMusicBrainzArtistSearchResult,
} from "./artist.mapper";

import type { MusicBrainzArtistDTO } from "./artist.schemas";

describe("MusicBrainz artist mapper", () => {
  const artistDTO: MusicBrainzArtistDTO = {
    id: "a74b1b7f-71a5-4011-9441-d0b5e4122711",
    name: "Radiohead",
    "sort-name": "Radiohead",
    disambiguation: "UK alternative rock band",
    country: "GB",
    "life-span": {
      begin: "1985",
      end: null,
    },
    score: 100,
  };

  it("maps MusicBrainz artist data to the domain format", () => {
    const result = mapMusicBrainzArtist(artistDTO);

    expect(result).toEqual({
      musicBrainzId: artistDTO.id,
      name: "Radiohead",
      sortName: "Radiohead",
      disambiguation: "UK alternative rock band",
      countryCode: "GB",
      beginDate: "1985",
      endDate: null,
    });
  });

  it("uses null for optional fields that are absent", () => {
    const result = mapMusicBrainzArtist({
      id: "a74b1b7f-71a5-4011-9441-d0b5e4122711",
      name: "Radiohead",
    });

    expect(result).toEqual({
      musicBrainzId: "a74b1b7f-71a5-4011-9441-d0b5e4122711",
      name: "Radiohead",
      sortName: null,
      disambiguation: null,
      countryCode: null,
      beginDate: null,
      endDate: null,
    });
  });

  it("keeps search score separate from artist catalog data", () => {
    const result = mapMusicBrainzArtistSearchResult(artistDTO);

    expect(result.score).toBe(100);
    expect(result.artist).not.toHaveProperty("score");
    expect(result.artist.name).toBe("Radiohead");
  });

  it("preserves incomplete life-span dates", () => {
    const result = mapMusicBrainzArtist({
      ...artistDTO,
      "life-span": {
        begin: "1985-02",
        end: null,
      },
    });

    expect(result.beginDate).toBe("1985-02");
    expect(result.endDate).toBeNull();
  });
});
