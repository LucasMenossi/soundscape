import { z } from "zod";

export const musicBrainzTagsSchema = z.object({
  tags: z
    .array(
      z.object({
        name: z.string().min(1),
        count: z.number().int().nonnegative().optional(),
      }),
    )
    .optional()
    .default([]),
});

export type MusicBrainzTagsDTO = z.infer<typeof musicBrainzTagsSchema>;
