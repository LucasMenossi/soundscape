import { describe, expect, it } from "vitest";

import type { Artist, ArtistRelationship } from "@/server/domain/artist";

import { groupArtistRelationships } from "./artist-relationships";

function makeArtist(id: string, name: string): Artist {
  const now = new Date("2026-11-09T12:00:00.000Z");

  return {
    id,
    musicBrainzId: `00000000-0000-4000-8000-${id.padStart(12, "0")}`,
    name,
    sortName: name,
    disambiguation: null,
    countryCode: null,
    beginDate: null,
    endDate: null,
    lastSyncedAt: now,
    createdAt: now,
    updatedAt: now,
  };
}

function makeRelationship(
  id: string,
  relationshipType: ArtistRelationship["relationshipType"],
  artist: Artist,
): ArtistRelationship {
  return { id, relationshipType, artist };
}

describe("groupArtistRelationships", () => {
  it("returns no groups when the artist has no relationships", () => {
    expect(groupArtistRelationships([])).toEqual([]);
  });

  it("groups by relationship type in a stable order and sorts artists by name", () => {
    const relationships = [
      makeRelationship("1", "collaboration", makeArtist("3", "Thom Yorke")),
      makeRelationship("2", "band member", makeArtist("2", "Colin Greenwood")),
      makeRelationship("3", "band member", makeArtist("1", "Ed O'Brien")),
    ];

    expect(groupArtistRelationships(relationships)).toEqual([
      {
        type: "band member",
        label: "Band members",
        artists: [
          expect.objectContaining({ name: "Colin Greenwood" }),
          expect.objectContaining({ name: "Ed O'Brien" }),
        ],
      },
      {
        type: "collaboration",
        label: "Collaborations",
        artists: [expect.objectContaining({ name: "Thom Yorke" })],
      },
    ]);
  });

  it("does not display the same artist twice in one relationship group", () => {
    const artist = makeArtist("1", "Thom Yorke");
    const relationships = [
      makeRelationship("1", "collaboration", artist),
      makeRelationship("2", "collaboration", artist),
    ];

    expect(groupArtistRelationships(relationships)).toEqual([
      {
        type: "collaboration",
        label: "Collaborations",
        artists: [artist],
      },
    ]);
  });
});
