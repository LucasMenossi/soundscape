import "server-only";

export interface WikimediaArtworkCandidate {
  sourceFileId: string;
  sourcePageUrl: string;
  imageUrl: string;
  description: string | null;
  creator: string | null;
  credit: string | null;
  licenseShortName: string | null;
  licenseUrl: string | null;
  width: number | null;
  height: number | null;
  mime: string;
}

interface WikimediaMetadataValue {
  value?: string;
}

interface WikimediaImageInfo {
  url?: string;
  descriptionurl?: string;
  width?: number;
  height?: number;
  mime?: string;
  extmetadata?: Record<string, WikimediaMetadataValue>;
}

interface WikimediaPage {
  title: string;
  imageinfo?: WikimediaImageInfo[];
}

interface WikimediaSearchResponse {
  query?: { pages?: Record<string, WikimediaPage> };
  error?: { info?: string };
}

const COMMONS_API_URL = "https://commons.wikimedia.org/w/api.php";
const REQUEST_DELAY_MS = 1_100;
let lastRequestStartedAt = 0;
let requestQueue: Promise<void> = Promise.resolve();

function metadataValue(
  metadata: Record<string, WikimediaMetadataValue> | undefined,
  key: string,
): string | null {
  const value = metadata?.[key]?.value;
  if (!value) return null;

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim() || null;
}

async function withRequestPacing<T>(operation: () => Promise<T>): Promise<T> {
  const previous = requestQueue;
  let release!: () => void;
  requestQueue = new Promise<void>((resolve) => { release = resolve; });
  await previous;
  try {
    const remaining = REQUEST_DELAY_MS - (Date.now() - lastRequestStartedAt);
    if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
    lastRequestStartedAt = Date.now();
    return await operation();
  } finally {
    release();
  }
}

export class WikimediaCommonsProvider {
  async searchArtistImages(artistName: string, limit = 20): Promise<WikimediaArtworkCandidate[]> {
    return this.searchImages(`filetype:bitmap "${artistName.replace(/["\\]/g, " ")}"`, limit);
  }

  async searchAlbumImages(albumTitle: string, artistName: string, limit = 20): Promise<WikimediaArtworkCandidate[]> {
    const album = albumTitle.replace(/["\\]/g, " ");
    const artist = artistName.replace(/["\\]/g, " ");
    return this.searchImages(`filetype:bitmap "${album}" "${artist}"`, limit);
  }

  private async searchImages(searchQuery: string, limit: number): Promise<WikimediaArtworkCandidate[]> {
    const userAgent = process.env.WIKIMEDIA_USER_AGENT;
    if (!userAgent) throw new Error("WIKIMEDIA_USER_AGENT is not configured");

    const url = new URL(COMMONS_API_URL);
    url.search = new URLSearchParams({
      action: "query",
      format: "json",
      formatversion: "2",
      generator: "search",
      gsrsearch: searchQuery,
      gsrnamespace: "6",
      gsrlimit: String(Math.min(Math.max(limit, 1), 30)),
      gsrsort: "relevance",
      prop: "imageinfo",
      iiprop: "url|size|mime|extmetadata",
    }).toString();

    const response = await withRequestPacing(() => fetch(url, {
      headers: { Accept: "application/json", "User-Agent": userAgent },
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    }));
    if (!response.ok) throw new Error(`Wikimedia Commons returned HTTP ${response.status}`);

    const payload = (await response.json()) as WikimediaSearchResponse;
    if (payload.error) throw new Error(payload.error.info ?? "Wikimedia Commons request failed");

    return Object.values(payload.query?.pages ?? {}).flatMap((page): WikimediaArtworkCandidate[] => {
      const image = page.imageinfo?.[0];
      if (!image?.url || !image.descriptionurl || !image.mime?.startsWith("image/") ||
          (image.width ?? 0) < 500 || (image.height ?? 0) < 350) return [];

      const metadata = image.extmetadata;
      return [{
        sourceFileId: page.title,
        sourcePageUrl: image.descriptionurl,
        imageUrl: image.url,
        description: metadataValue(metadata, "ImageDescription") ?? metadataValue(metadata, "ObjectName"),
        creator: metadataValue(metadata, "Artist"),
        credit: metadataValue(metadata, "Credit"),
        licenseShortName: metadataValue(metadata, "LicenseShortName"),
        licenseUrl: metadataValue(metadata, "LicenseUrl"),
        width: image.width ?? null,
        height: image.height ?? null,
        mime: image.mime,
      }];
    });
  }
}
