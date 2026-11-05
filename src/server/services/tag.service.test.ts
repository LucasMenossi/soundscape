import { describe, expect, it, vi } from "vitest";
import type { MusicBrainzTagProvider } from "@/server/providers/musicbrainz/tag.provider";
import { TagService } from "./tag.service";

describe("TagService", () => {
  it("keeps community tags separate from the curated genre taxonomy", async () => {
    const provider = {
      getArtistTags: vi.fn().mockResolvedValue(["1990s", "female vocalists"]),
      getReleaseGroupTags: vi.fn().mockResolvedValue(["seen live"]),
    } as unknown as MusicBrainzTagProvider;
    const service = new TagService(provider);

    await expect(
      service.getArtistTags("a74b1b7f-71a5-4011-9441-d0b5e4122711"),
    ).resolves.toEqual(["1990s", "female vocalists"]);
    await expect(
      service.getAlbumTags("b1392450-e666-3926-a536-22c65f834433"),
    ).resolves.toEqual(["seen live"]);
  });

  it("rejects invalid external identifiers before calling the provider", async () => {
    const provider = {
      getArtistTags: vi.fn(),
      getReleaseGroupTags: vi.fn(),
    } as unknown as MusicBrainzTagProvider;
    const service = new TagService(provider);

    await expect(service.getArtistTags("not-a-mbid")).rejects.toThrow();
    expect(provider.getArtistTags).not.toHaveBeenCalled();
  });
});
