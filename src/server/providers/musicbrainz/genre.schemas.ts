import { z } from "zod";

/** Genres attached to an artist or release group (not free-form tags). */
export const musicBrainzEntityGenresSchema = z.object({
  genres: z.array(z.object({ name: z.string().trim().min(1) }).passthrough()).optional().default([]),
}).passthrough();
