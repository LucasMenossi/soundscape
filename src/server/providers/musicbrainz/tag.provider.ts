import "server-only";

import { MusicBrainzError, musicBrainzGet } from "./client";
import { musicBrainzTagsSchema } from "./tag.schemas";

export class MusicBrainzTagProvider {
  async getArtistTags(musicBrainzArtistId: string): Promise<string[]> {
    return this.getTags(`artist/${musicBrainzArtistId}`);
  }

  async getReleaseGroupTags(
    musicBrainzReleaseGroupId: string,
  ): Promise<string[]> {
    return this.getTags(`release-group/${musicBrainzReleaseGroupId}`);
  }

  private async getTags(path: string): Promise<string[]> {
    const response = await musicBrainzGet<unknown>(path, { inc: "tags" });
    const parsed = musicBrainzTagsSchema.safeParse(response);
    if (!parsed.success) {
      throw new MusicBrainzError(
        "MusicBrainz returned an invalid tag response",
        undefined,
        { cause: parsed.error },
      );
    }
    return parsed.data.tags
      .filter((tag) => tag.count === undefined || tag.count > 0)
      .map((tag) => tag.name.trim())
      .filter(Boolean);
  }
}
