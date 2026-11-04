import { z } from "zod";

export const musicBrainzArtistSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  "sort-name": z.string().optional(),
  disambiguation: z.string().optional(),
  country: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
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

export const musicBrainzArtistRelationshipSchema = z
  .object({
    type: z.string(),
    direction: z.enum(["forward", "backward"]).nullable().optional(),
    artist: musicBrainzArtistSchema,
  })
  .passthrough();

export const musicBrainzArtistRelationshipsResponseSchema = z
  .object({
    id: z.string().uuid(),
    relations: z.array(musicBrainzArtistRelationshipSchema).default([]),
  })
  .passthrough();

export type MusicBrainzArtistRelationshipDTO = z.infer<
  typeof musicBrainzArtistRelationshipSchema
>;
