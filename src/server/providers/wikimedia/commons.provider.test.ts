import { afterEach, describe, expect, it, vi } from "vitest";

import { WikimediaCommonsProvider } from "./commons.provider";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("WikimediaCommonsProvider", () => {
  it("maps source and license metadata without approving the candidate", async () => {
    vi.stubEnv(
      "WIKIMEDIA_USER_AGENT",
      "SoundScape/0.1.0 (contact: test@example.test)",
    );
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          query: {
            pages: [
              {
                title: "File:Example artist.jpg",
                imageinfo: [
                  {
                    url: "https://upload.wikimedia.org/wikipedia/commons/example.jpg",
                    descriptionurl:
                      "https://commons.wikimedia.org/wiki/File:Example_artist.jpg",
                    width: 1200,
                    height: 800,
                    mime: "image/jpeg",
                    extmetadata: {
                      ImageDescription: { value: "Example Artist performing live" },
                      Artist: { value: "Photographer Name" },
                      Credit: { value: "Courtesy of Photographer" },
                      LicenseShortName: { value: "CC BY-SA 4.0" },
                      LicenseUrl: {
                        value: "https://creativecommons.org/licenses/by-sa/4.0/",
                      },
                    },
                  },
                ],
              },
              {
                title: "File:Too small.jpg",
                imageinfo: [
                  {
                    url: "https://upload.wikimedia.org/wikipedia/commons/small.jpg",
                    descriptionurl:
                      "https://commons.wikimedia.org/wiki/File:Too_small.jpg",
                    width: 100,
                    height: 100,
                    mime: "image/jpeg",
                  },
                ],
              },
            ],
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const provider = new WikimediaCommonsProvider();
    const candidates = await provider.searchArtistImages("Example Artist");

    expect(candidates).toEqual([
      {
        sourceFileId: "File:Example artist.jpg",
        sourcePageUrl:
          "https://commons.wikimedia.org/wiki/File:Example_artist.jpg",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/example.jpg",
        description: "Example Artist performing live",
        creator: "Photographer Name",
        credit: "Courtesy of Photographer",
        licenseShortName: "CC BY-SA 4.0",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
        width: 1200,
        height: 800,
        mime: "image/jpeg",
      },
    ]);

    const [requestUrl, requestInit] = fetchMock.mock.calls[0] as [
      URL,
      RequestInit,
    ];
    expect(requestUrl.toString()).toContain("generator=search");
    expect(requestInit.headers).toMatchObject({
      "User-Agent": "SoundScape/0.1.0 (contact: test@example.test)",
    });
  });

  it("searches album artwork using both the exact title and primary artist", async () => {
    vi.stubEnv("WIKIMEDIA_USER_AGENT", "SoundScape/0.1.0 (contact: test@example.test)");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ query: { pages: [] } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    await new WikimediaCommonsProvider().searchAlbumImages("Blue Lines", "Massive Attack");
    const [requestUrl] = fetchMock.mock.calls[0] as [URL, RequestInit];
    const url = new URL(requestUrl.toString());
    expect(url.searchParams.get("gsrsearch")).toContain('"Blue Lines"');
    expect(url.searchParams.get("gsrsearch")).toContain('"Massive Attack"');
  });

  it("fails with an actionable error when the User-Agent is missing", async () => {
    vi.stubEnv("WIKIMEDIA_USER_AGENT", "");
    const provider = new WikimediaCommonsProvider();

    await expect(provider.searchArtistImages("Example Artist")).rejects.toThrow(
      "WIKIMEDIA_USER_AGENT is not configured",
    );
  });
});
