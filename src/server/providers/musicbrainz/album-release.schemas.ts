import { z } from "zod";

const musicBrainzLabelInfoSchema = z.object({
  "catalog-number": z.string().nullable().optional(),
  label: z.object({ name: z.string() }).nullable().optional(),
});

const musicBrainzMediumSummarySchema = z.object({
  position: z.number().int().positive(),
  format: z.string().nullable().optional(),
  "track-count": z.number().int().nonnegative().optional(),
});

export const musicBrainzReleaseGroupReleasesSchema = z.object({
  id: z.string().uuid(),
  releases: z
    .array(
      z.object({
        id: z.string().uuid(),
        title: z.string(),
        date: z.string().nullable().optional(),
        country: z.string().nullable().optional(),
        status: z.string().nullable().optional(),
        barcode: z.string().nullable().optional(),
        packaging: z.string().nullable().optional(),
        "label-info": z.array(musicBrainzLabelInfoSchema).optional(),
        media: z.array(musicBrainzMediumSummarySchema).optional(),
      }),
    )
    .optional(),
});

const musicBrainzTrackSchema = z.object({
  id: z.string().uuid(),
  number: z.string(),
  title: z.string(),
  length: z.number().int().nonnegative().nullable().optional(),
  recording: z
    .object({
      id: z.string().uuid().optional(),
      title: z.string().optional(),
      length: z.number().int().nonnegative().nullable().optional(),
    })
    .nullable()
    .optional(),
});

const musicBrainzMediumSchema = z.object({
  position: z.number().int().positive(),
  format: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  "track-count": z.number().int().nonnegative().optional(),
  tracks: z.array(musicBrainzTrackSchema).optional(),
});

export const musicBrainzReleaseDetailsSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  date: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  packaging: z.string().nullable().optional(),
  "label-info": z.array(musicBrainzLabelInfoSchema).optional(),
  media: z.array(musicBrainzMediumSchema).optional(),
});
