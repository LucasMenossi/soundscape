import "server-only";

export interface TheAudioDbArtistImage {
  sourceFileId: string;
  sourcePageUrl: string;
  imageUrl: string;
  description: string;
}

interface TheAudioDbArtist {
  idArtist?: string;
  strArtist?: string;
  strArtistThumb?: string | null;
  strArtistFanart?: string | null;
  strArtistFanart1?: string | null;
  strArtistFanart2?: string | null;
  strArtistFanart3?: string | null;
}

interface TheAudioDbResponse {
  artists?: TheAudioDbArtist[] | null;
}

const API_BASE_URL = "https://www.theaudiodb.com/api/v1/json";

export class TheAudioDbProvider {
  constructor(private readonly apiKey = process.env.THEAUDIODB_API_KEY || "2") {}

  async findArtistImage(musicBrainzId: string): Promise<TheAudioDbArtistImage | null> {
    const url = `${API_BASE_URL}/${encodeURIComponent(this.apiKey)}/artist-mb.php?i=${encodeURIComponent(musicBrainzId)}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!response.ok) throw new Error(`TheAudioDB returned HTTP ${response.status}`);

    const payload = (await response.json()) as TheAudioDbResponse;
    const artist = payload.artists?.[0];
    if (!artist?.idArtist) return null;

    // Prefer the dedicated artist thumbnail. Fanart is a fallback, not the first choice.
    const imageUrl = [
      artist.strArtistThumb,
      artist.strArtistFanart,
      artist.strArtistFanart1,
      artist.strArtistFanart2,
      artist.strArtistFanart3,
    ].find((value): value is string => Boolean(value && /^https:\/\//i.test(value)));
    if (!imageUrl) return null;

    return {
      sourceFileId: artist.idArtist,
      sourcePageUrl: `https://www.theaudiodb.com/artist/${encodeURIComponent(artist.idArtist)}`,
      imageUrl,
      description: artist.strArtist ?? "Artist image",
    };
  }
}
