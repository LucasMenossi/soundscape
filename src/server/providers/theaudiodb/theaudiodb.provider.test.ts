import { afterEach, describe, expect, it, vi } from "vitest";
import { TheAudioDbProvider } from "./theaudiodb.provider";

afterEach(() => vi.unstubAllGlobals());

describe("TheAudioDbProvider", () => {
  it("looks up an artist by MusicBrainz ID and prefers the artist thumbnail", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      artists: [{
        idArtist: "111",
        strArtist: "Example Artist",
        strArtistThumb: "https://www.theaudiodb.com/thumb.jpg",
        strArtistFanart: "https://www.theaudiodb.com/fanart.jpg",
      }],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const provider = new TheAudioDbProvider("2");
    await expect(provider.findArtistImage("musicbrainz-id")).resolves.toMatchObject({
      sourceFileId: "111",
      imageUrl: "https://www.theaudiodb.com/thumb.jpg",
    });
    expect(fetchMock.mock.calls[0][0]).toContain("artist-mb.php?i=musicbrainz-id");
  });

  it("returns null when TheAudioDB has no image", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ artists: [{ idArtist: "1" }] }), { status: 200 })));
    await expect(new TheAudioDbProvider("2").findArtistImage("missing")).resolves.toBeNull();
  });
});
