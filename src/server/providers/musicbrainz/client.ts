import "server-only";

const MUSICBRAINZ_BASE_URL = "https://musicbrainz.org/ws/2";

const DEFAULT_DELAY_MS = 1100;
const DEFAULT_TIMEOUT_MS = 20_000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_CACHE_TTL_MS = 300_000;
const MAX_CACHE_ENTRIES = 500;

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const responseCache = new Map<string, CacheEntry>();

let requestQueue: Promise<void> = Promise.resolve();
let lastRequestStartedAt = 0;

export class MusicBrainzError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "MusicBrainzError";
  }
}

function getPositiveInteger(
  value: string | undefined,
  fallback: number,
): number {
  if (!value) return fallback;

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getUserAgent(): string {
  const userAgent = process.env.MUSICBRAINZ_USER_AGENT;

  if (!userAgent) {
    throw new MusicBrainzError("MUSICBRAINZ_USER_AGENT is not configured");
  }

  return userAgent;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRateLimit<T>(operation: () => Promise<T>): Promise<T> {
  const previousRequest = requestQueue;

  let releaseQueue!: () => void;

  requestQueue = new Promise<void>((resolve) => {
    releaseQueue = resolve;
  });

  await previousRequest;

  try {
    const delayMs = getPositiveInteger(
      process.env.MUSICBRAINZ_DELAY_MS,
      DEFAULT_DELAY_MS,
    );

    const elapsed = Date.now() - lastRequestStartedAt;
    const remainingDelay = Math.max(0, delayMs - elapsed);

    if (remainingDelay > 0) {
      await sleep(remainingDelay);
    }

    lastRequestStartedAt = Date.now();

    return await operation();
  } finally {
    releaseQueue();
  }
}

function getRetryDelay(retryAfter: string | null, attempt: number): number {
  if (retryAfter) {
    const seconds = Number(retryAfter);

    if (Number.isFinite(seconds) && seconds >= 0) {
      return seconds * 1000;
    }

    const retryDate = Date.parse(retryAfter);

    if (!Number.isNaN(retryDate)) {
      return Math.max(0, retryDate - Date.now());
    }
  }

  return Math.min(1000 * 2 ** attempt, 8000);
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 502 || status === 503 || status === 504;
}

function getCacheTTL(): number {
  return getPositiveInteger(
    process.env.MUSICBRAINZ_CACHE_TTL_MS,
    DEFAULT_CACHE_TTL_MS,
  );
}

function getCachedResponse<T>(key: string): T | null {
  const entry = responseCache.get(key);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    responseCache.delete(key);
    return null;
  }

  // Return a copy so consumers cannot mutate the cached object.
  return structuredClone(entry.data) as T;
}

function removeExpiredEntries(): void {
  const now = Date.now();

  for (const [key, entry] of responseCache.entries()) {
    if (entry.expiresAt <= now) {
      responseCache.delete(key);
    }
  }
}

function cacheResponse(key: string, data: unknown): void {
  const ttl = getCacheTTL();

  if (ttl <= 0) {
    return;
  }

  removeExpiredEntries();

  if (responseCache.size >= MAX_CACHE_ENTRIES && !responseCache.has(key)) {
    const oldestKey = responseCache.keys().next().value;

    if (oldestKey) {
      responseCache.delete(oldestKey);
    }
  }

  responseCache.set(key, {
    data: structuredClone(data),
    expiresAt: Date.now() + ttl,
  });
}

async function musicBrainzRequest<T>(
  path: string,
  params: Record<string, string>,
  format: "json" | "txt",
  parseResponse: (response: Response) => Promise<T>,
): Promise<T> {
  const userAgent = getUserAgent();

  const timeoutMs = getPositiveInteger(
    process.env.HTTP_TIMEOUT_MS,
    DEFAULT_TIMEOUT_MS,
  );

  const maxRetries = getPositiveInteger(
    process.env.HTTP_MAX_RETRIES,
    DEFAULT_MAX_RETRIES,
  );

  const url = new URL(`${MUSICBRAINZ_BASE_URL}/${path}`);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  url.searchParams.set("fmt", format);

  const cacheKey = url.toString();
  const cachedResponse = getCachedResponse<T>(cacheKey);

  if (cachedResponse !== null) {
    return cachedResponse;
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await withRateLimit(() =>
        fetch(url, {
          headers: {
            Accept: format === "txt" ? "text/plain" : "application/json",
            "User-Agent": userAgent,
          },
          signal: AbortSignal.timeout(timeoutMs),
          cache: "no-store",
        }),
      );

      if (!response.ok) {
        if (isRetryableStatus(response.status) && attempt < maxRetries) {
          const retryDelay = getRetryDelay(
            response.headers.get("Retry-After"),
            attempt,
          );

          await sleep(retryDelay);
          continue;
        }

        throw new MusicBrainzError(
          `MusicBrainz request failed with status ${response.status}`,
          response.status,
        );
      }

      const data = await parseResponse(response);

      // Only successful responses are cached after their body has been parsed.
      cacheResponse(cacheKey, data);

      return data;
    } catch (error) {
      if (error instanceof MusicBrainzError) {
        throw error;
      }

      if (attempt >= maxRetries) {
        throw new MusicBrainzError(
          "Unable to communicate with MusicBrainz",
          undefined,
          { cause: error },
        );
      }

      await sleep(getRetryDelay(null, attempt));
    }
  }

  throw new MusicBrainzError(
    "MusicBrainz request failed after all retry attempts",
  );
}


export function musicBrainzGet<T>(
  path: string,
  params: Record<string, string>,
): Promise<T> {
  return musicBrainzRequest<T>(path, params, "json", async (response) =>
    (await response.json()) as T,
  );
}

export function musicBrainzGetText(
  path: string,
  params: Record<string, string> = {},
): Promise<string> {
  return musicBrainzRequest<string>(path, params, "txt", (response) =>
    response.text(),
  );
}
