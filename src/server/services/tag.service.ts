import "server-only";

import { z } from "zod";
import type { MusicBrainzTagProvider } from "@/server/providers/musicbrainz/tag.provider";

const musicBrainzIdSchema = z.string().uuid();

/**
 * Free-form MusicBrainz tags are deliberately kept separate from the
 * SoundScape genre taxonomy. They are fetched as optional catalog context and
 * are not persisted as navigable Genre records.
 */
export class TagService {
  constructor(private readonly provider: MusicBrainzTagProvider) {}

  async getArtistTags(musicBrainzArtistId: string): Promise<string[]> {
    return this.provider.getArtistTags(musicBrainzIdSchema.parse(musicBrainzArtistId));
  }

  async getAlbumTags(musicBrainzReleaseGroupId: string): Promise<string[]> {
    return this.provider.getReleaseGroupTags(musicBrainzIdSchema.parse(musicBrainzReleaseGroupId));
  }
}
