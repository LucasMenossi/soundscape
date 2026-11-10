import { afterEach, describe, expect, it, vi } from "vitest";
import { CoverArtArchiveProvider } from "./cover-art-archive.provider";

afterEach(() => vi.unstubAllGlobals());

describe("CoverArtArchiveProvider", () => {
  it("selects the front image rather than a back cover", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      images: [
        { image: "https://archive.org/back.jpg", types: ["Back"], front: false, approved: true },
        { image: "https://archive.org/front.jpg", thumbnails: { "500": "https://archive.org/front-500.jpg" }, types: ["Front"], front: true, approved: true },
      ],
    }), { status: 200 })));

    await expect(new CoverArtArchiveProvider().findFrontCover("release-group-id")).resolves.toMatchObject({
      imageUrl: "https://archive.org/front-500.jpg",
      sourceFileId: "release-group-id:front",
    });
  });


  it("upgrades Cover Art Archive HTTP thumbnail URLs to HTTPS", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      images: [
        {
          image: "http://coverartarchive.org/release/example/front.jpg",
          thumbnails: {
            "500": "http://coverartarchive.org/release/example/front-500.jpg",
          },
          types: ["Front"],
          front: true,
          approved: true,
        },
      ],
    }), { status: 200 })));

    await expect(new CoverArtArchiveProvider().findFrontCover("release-group-id")).resolves.toMatchObject({
      imageUrl: "https://coverartarchive.org/release/example/front-500.jpg",
    });
  });

  it("rejects image URLs from unexpected hosts", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      images: [
        {
          image: "http://evil.example/front.jpg",
          thumbnails: { "500": "http://evil.example/front-500.jpg" },
          types: ["Front"],
          front: true,
          approved: true,
        },
      ],
    }), { status: 200 })));

    await expect(new CoverArtArchiveProvider().findFrontCover("release-group-id")).resolves.toBeNull();
  });

  it("returns null for albums without artwork", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 404 })));
    await expect(new CoverArtArchiveProvider().findFrontCover("missing")).resolves.toBeNull();
  });
});
