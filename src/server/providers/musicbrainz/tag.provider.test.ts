import { beforeEach, describe, expect, it, vi } from "vitest";

const { musicBrainzGet } = vi.hoisted(() => ({ musicBrainzGet: vi.fn() }));
vi.mock("./client", () => ({
  musicBrainzGet,
  MusicBrainzError: class MusicBrainzError extends Error {},
}));

import { MusicBrainzTagProvider } from "./tag.provider";

describe("MusicBrainzTagProvider", () => {
  beforeEach(() => musicBrainzGet.mockReset());

  it("retrieves and normalizes artist tag names", async () => {
    musicBrainzGet.mockResolvedValue({
      tags: [
        { name: "Alternative Rock", count: 12 },
        { name: "  britpop ", count: 3 },
        { name: "unused", count: 0 },
      ],
    });
    const provider = new MusicBrainzTagProvider();
    await expect(
      provider.getArtistTags("a74b1b7f-71a5-4011-9441-d0b5e4122711"),
    ).resolves.toEqual(["Alternative Rock", "britpop"]);
    expect(musicBrainzGet).toHaveBeenCalledWith(
      "artist/a74b1b7f-71a5-4011-9441-d0b5e4122711",
      { inc: "tags" },
    );
  });

  it("returns an empty list when MusicBrainz has no tags", async () => {
    musicBrainzGet.mockResolvedValue({});
    await expect(
      new MusicBrainzTagProvider().getReleaseGroupTags(
        "b1392450-e666-3926-a536-22c65f834433",
      ),
    ).resolves.toEqual([]);
  });
});
