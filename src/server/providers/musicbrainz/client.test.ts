import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MusicBrainzError, musicBrainzGet } from "./client";

describe("MusicBrainz HTTP client", () => {
  beforeEach(() => {
    process.env.MUSICBRAINZ_USER_AGENT =
      "SoundScape/1.0.0 (contact: test@example.com)";
    process.env.MUSICBRAINZ_DELAY_MS = "1";
    process.env.MUSICBRAINZ_CACHE_TTL_MS = "60000";
    process.env.HTTP_TIMEOUT_MS = "20000";
    process.env.HTTP_MAX_RETRIES = "3";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends a request with the expected headers and parameters", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        count: 1,
        offset: 0,
        artists: [],
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const result = await musicBrainzGet<{
      count: number;
      offset: number;
      artists: unknown[];
    }>("artist", {
      query: "Radiohead",
      limit: "5",
    });

    expect(result.count).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [requestUrl, requestOptions] = fetchMock.mock.calls[0] as [
      URL,
      RequestInit,
    ];

    expect(requestUrl.toString()).toContain("query=Radiohead");
    expect(requestUrl.toString()).toContain("limit=5");
    expect(requestUrl.toString()).toContain("fmt=json");

    expect(requestOptions.headers).toEqual({
      Accept: "application/json",
      "User-Agent": "SoundScape/1.0.0 (contact: test@example.com)",
    });
  });

  it("returns cached data without making a second request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        result: "cached",
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const firstResult = await musicBrainzGet("test/cache-hit", {});

    const secondResult = await musicBrainzGet("test/cache-hit", {});

    expect(firstResult).toEqual({ result: "cached" });
    expect(secondResult).toEqual({ result: "cached" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("fetches again after the cache entry expires", async () => {
    process.env.MUSICBRAINZ_CACHE_TTL_MS = "1";

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ result: "first" }))
      .mockResolvedValueOnce(Response.json({ result: "second" }));

    vi.stubGlobal("fetch", fetchMock);

    const firstResult = await musicBrainzGet("test/cache-expiration", {});

    await new Promise((resolve) => setTimeout(resolve, 10));

    const secondResult = await musicBrainzGet("test/cache-expiration", {});

    expect(firstResult).toEqual({ result: "first" });
    expect(secondResult).toEqual({ result: "second" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not cache failed HTTP responses", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("Not found", { status: 404 }))
      .mockResolvedValueOnce(Response.json({ result: "recovered" }));

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      musicBrainzGet("test/no-error-cache", {}),
    ).rejects.toBeInstanceOf(MusicBrainzError);

    const result = await musicBrainzGet("test/no-error-cache", {});

    expect(result).toEqual({ result: "recovered" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
