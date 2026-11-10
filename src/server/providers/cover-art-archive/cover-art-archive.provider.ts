import "server-only";

export interface CoverArtArchiveImage {
  sourceFileId: string;
  sourcePageUrl: string;
  imageUrl: string;
  description: string;
}

interface CoverArtArchiveImageRecord {
  image?: string;
  thumbnails?: Record<string, string>;
  types?: string[];
  front?: boolean;
  approved?: boolean;
}

interface CoverArtArchiveResponse {
  images?: CoverArtArchiveImageRecord[];
}

export class CoverArtArchiveProvider {
  async findFrontCover(releaseGroupMbid: string): Promise<CoverArtArchiveImage | null> {
    const endpoint = `https://coverartarchive.org/release-group/${encodeURIComponent(releaseGroupMbid)}`;
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
      next: { revalidate: 60 * 60 * 24 },
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Cover Art Archive returned HTTP ${response.status}`);

    const payload = (await response.json()) as CoverArtArchiveResponse;
    const images = payload.images ?? [];
    const frontCover = images.find((image) => image.front === true && image.approved !== false)
      ?? images.find((image) => image.types?.some((type) => type.toLowerCase() === "front") && image.approved !== false);
    const rawImageUrl = frontCover?.thumbnails?.["500"]
      ?? frontCover?.thumbnails?.large
      ?? frontCover?.image;

    if (!rawImageUrl) return null;

    // Cover Art Archive's JSON metadata still returns image URLs using HTTP.
    // The same public image endpoints support HTTPS; normalize before passing
    // the URL to Next Image to avoid mixed-content and protocol rejection.
    let imageUrl: string;
    try {
      const parsedImageUrl = new URL(rawImageUrl);
      if (
        parsedImageUrl.protocol !== "http:" &&
        parsedImageUrl.protocol !== "https:"
      ) return null;
      if (
        parsedImageUrl.hostname !== "coverartarchive.org" &&
        parsedImageUrl.hostname !== "www.coverartarchive.org" &&
        parsedImageUrl.hostname !== "archive.org" &&
        parsedImageUrl.hostname !== "www.archive.org"
      ) return null;
      parsedImageUrl.protocol = "https:";
      imageUrl = parsedImageUrl.toString();
    } catch {
      return null;
    }

    return {
      sourceFileId: `${releaseGroupMbid}:front`,
      sourcePageUrl: endpoint,
      imageUrl,
      description: "Front cover from Cover Art Archive",
    };
  }
}
