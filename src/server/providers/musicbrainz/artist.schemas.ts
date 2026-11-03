import { z } from "zod";

export const musicBrainzArtistSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  "sort-name": z.string().optional(),
  disambiguation: z.string().optional(),
  country: z.string().optional(),
  "life-span": z
    .object({
      begin: z.string().nullable().optional(),
      end: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  score: z.coerce.number().nullable().optional(),
});

export const musicBrainzArtistSearchSchema = z.object({
  count: z.number(),
  offset: z.number(),
  artists: z.array(musicBrainzArtistSchema),
});

export type MusicBrainzArtistDTO = z.infer<typeof musicBrainzArtistSchema>;

export type MusicBrainzArtistSearchDTO = z.infer<
  typeof musicBrainzArtistSearchSchema
>;
