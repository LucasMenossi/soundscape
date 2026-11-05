import "server-only";

import { MusicBrainzTagProvider } from "@/server/providers/musicbrainz/tag.provider";
import { TagService } from "./tag.service";

export const tagService = new TagService(new MusicBrainzTagProvider());
