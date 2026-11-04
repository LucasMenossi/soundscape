import { z } from "zod";

const musicBrainzReleaseGroupArtistSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  "sort-name": z.string().optional(),
});

const musicBrainzArtistCreditSchema = z.object({
  name: z.string(),
  artist: musicBrainzReleaseGroupArtistSchema,
});

export const musicBrainzReleaseGroupSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  "first-release-date": z.string().optional(),
  "primary-type": z.string().nullable().optional(),
  "artist-credit": z.array(musicBrainzArtistCreditSchema).optional(),
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
