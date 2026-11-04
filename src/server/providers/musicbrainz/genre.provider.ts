import "server-only";

import { MusicBrainzError, musicBrainzGet, musicBrainzGetText } from "./client";
import { musicBrainzEntityGenresSchema } from "./genre.schemas";

export class MusicBrainzGenreProvider {
  async getArtistGenres(musicBrainzArtistId: string): Promise<string[]> {
    return this.getEntityGenres(`artist/${musicBrainzArtistId}`);
  }

  async getReleaseGroupGenres(musicBrainzReleaseGroupId: string): Promise<string[]> {
    return this.getEntityGenres(`release-group/${musicBrainzReleaseGroupId}`);
  }

  async getAllGenres(): Promise<string[]> {
    // MusicBrainz' text representation returns the full curated vocabulary in one request.
    // The JSON endpoint is paginated, which would require many rate-limited requests.
    const response = await musicBrainzGetText("genre/all");
    const genres = [...new Set(response.split(/\r?\n/).map((name) => name.trim()).filter(Boolean))];

    if (genres.length === 0) {
      throw new MusicBrainzError("MusicBrainz returned an empty genre catalog");
    }

    return genres;
  }

  private async getEntityGenres(path: string): Promise<string[]> {
    const response = await musicBrainzGet<unknown>(path, { inc: "genres" });
    const parsed = musicBrainzEntityGenresSchema.safeParse(response);

    if (!parsed.success) {
      throw new MusicBrainzError(
        "MusicBrainz returned an invalid entity genres response",
        undefined,
        { cause: parsed.error },
      );
    }

    return parsed.data.genres.map(({ name }) => name.trim()).filter(Boolean);
  }
}
