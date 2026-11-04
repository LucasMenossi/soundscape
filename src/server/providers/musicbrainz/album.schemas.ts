import { z } from "zod";

const musicBrainzReleaseGroupArtistSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  "sort-name": z.string().optional(),
});

const musicBrainzArtistCreditEntrySchema = z.union([
  z.object({
    name: z.string(),
    artist: musicBrainzReleaseGroupArtistSchema,
  }),
  // MusicBrainz may include join-phrase-only entries in artist credits.
  z.string(),
]);

export const musicBrainzReleaseGroupSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  "first-release-date": z.string().nullable().optional(),
  "primary-type": z.string().nullable().optional(),
  "secondary-types": z.array(z.string()).nullable().optional(),
  "artist-credit": z.array(musicBrainzArtistCreditEntrySchema).optional(),
  score: z.coerce.number().nullable().optional(),
});

export const musicBrainzReleaseGroupSearchSchema = z.object({
  count: z.number(),
  offset: z.number(),
  "release-groups": z.array(musicBrainzReleaseGroupSchema),
});

export type MusicBrainzReleaseGroupDTO = z.infer<
  typeof musicBrainzReleaseGroupSchema
>;

export type MusicBrainzReleaseGroupSearchDTO = z.infer<
  typeof musicBrainzReleaseGroupSearchSchema
>;

// The MusicBrainz JSON representation of browse lists can expose the
// collection as "release-groups" (plural). Normalize both documented and
// legacy/singular variants before validating the payload.
const musicBrainzReleaseGroupBrowsePayloadSchema = z.preprocess((value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const payload = value as Record<string, unknown>;

  return {
    "release-group-count":
      payload["release-group-count"] ?? payload["count"],
    "release-group-offset":
      payload["release-group-offset"] ?? payload["offset"],
    "release-group":
      payload["release-group"] ?? payload["release-groups"],
  };
}, z.object({
  "release-group-count": z.number(),
  "release-group-offset": z.number(),
  "release-group": z.array(musicBrainzReleaseGroupSchema),
}));

export const musicBrainzReleaseGroupBrowseSchema =
  musicBrainzReleaseGroupBrowsePayloadSchema;

export type MusicBrainzReleaseGroupBrowseDTO = z.infer<
  typeof musicBrainzReleaseGroupBrowseSchema
>;
