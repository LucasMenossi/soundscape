import { describe, expect, it } from "vitest";

import {
  mapMusicBrainzArtist,
  mapMusicBrainzArtistRelationships,
} from "./artist.mapper";
import { musicBrainzArtistRelationshipsResponseSchema } from "./artist.schemas";

const radioheadId = "a74b1b7f-71a5-4011-9441-d0b5e4122711";
const thomYorkeId = "b7ffd2af-418f-4be2-bdd1-22f8b48613da";

const thomYorke = {
  id: thomYorkeId,
  name: "Thom Yorke",
  "sort-name": "Yorke, Thom",
};

describe("MusicBrainz artist mapper", () => {
  it("maps the canonical artist fields", () => {
    expect(
      mapMusicBrainzArtist({
        id: radioheadId,
        name: "Radiohead",
        "sort-name": "Radiohead",
      }),
    ).toMatchObject({
      musicBrainzId: radioheadId,
      name: "Radiohead",
      sortName: "Radiohead",
    });
  });

  it("accepts null country values in related MusicBrainz artists", () => {
    const result = musicBrainzArtistRelationshipsResponseSchema.safeParse({
      id: radioheadId,
      relations: [
        {
          type: "member of band",
          direction: "backward",
          artist: { ...thomYorke, country: null },
        },
      ],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.relations[0].artist.country).toBeNull();
    }
  });

  it("keeps only curated artist relationship types and preserves direction", () => {
    const result = mapMusicBrainzArtistRelationships(
      [
        { type: "member of band", direction: "backward", artist: thomYorke },
        {
          type: "collaboration",
          direction: "forward",
          artist: {
            ...thomYorke,
            id: "6f1aa1b6-8a8c-4e1a-92c2-5f47f2a5c4a1",
            name: "Project X",
          },
        },
        {
          type: "producer",
          direction: "forward",
          artist: {
            ...thomYorke,
            id: "d0a4a1a1-32c0-4c4c-bb7f-33fdbf5e9e1d",
            name: "Producer",
          },
        },
        {
          type: "member of band",
          direction: "forward",
          artist: { ...thomYorke, id: radioheadId, name: "Radiohead" },
        },
      ],
      radioheadId,
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      relationshipType: "member of band",
      direction: "backward",
      targetArtist: { musicBrainzId: thomYorkeId, name: "Thom Yorke" },
    });
    expect(result[1].relationshipType).toBe("collaboration");
  });

  it("infers member direction when MusicBrainz omits it but provides the linked artist type", () => {
    const result = mapMusicBrainzArtistRelationships(
      [
        { type: "member of band", artist: { ...thomYorke, type: "Person" } },
        {
          type: "member of band",
          artist: {
            ...thomYorke,
            id: "9f1b7b0b-7e5c-45e5-9c87-2e2d2a9c3a11",
            name: "Unknown member",
          },
        },
        {
          type: "subgroup",
          artist: {
            ...thomYorke,
            id: "d0a4a1a1-32c0-4c4c-bb7f-33fdbf5e9e1d",
            name: "The Smile",
            type: "Group",
          },
        },
        {
          type: "artist rename",
          direction: "backward",
          artist: {
            ...thomYorke,
            id: "6f1aa1b6-8a8c-4e1a-92c2-5f47f2a5c4a1",
            name: "On a Friday",
          },
        },
      ],
      radioheadId,
    );

    expect(result).toHaveLength(4);
    expect(result[0]).toMatchObject({
      relationshipType: "member of band",
      direction: "backward",
    });
    expect(result[1]).toMatchObject({
      relationshipType: "member of band",
      direction: null,
    });
    expect(result[2]).toMatchObject({
      relationshipType: "subgroup",
      direction: null,
    });
    expect(result[3]).toMatchObject({
      relationshipType: "artist rename",
      direction: "backward",
    });
  });
});
