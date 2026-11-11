import type {
  AlbumReleaseDetails,
  AlbumReleaseEdition,
  AlbumReleaseMedium,
} from "@/server/domain/album-release";
import type {
  musicBrainzReleaseDetailsSchema,
  musicBrainzReleaseGroupReleasesSchema,
} from "./album-release.schemas";
import type { z } from "zod";

type ReleaseGroupResponse = z.infer<
  typeof musicBrainzReleaseGroupReleasesSchema
>;
type ReleaseDetailsResponse = z.infer<typeof musicBrainzReleaseDetailsSchema>;
type ReleaseSummary = NonNullable<ReleaseGroupResponse["releases"]>[number];

function mapLabels(labelInfo: ReleaseSummary["label-info"]) {
  return (labelInfo ?? []).flatMap((entry) => {
    const catalogNumber = entry["catalog-number"] ?? null;
    if (!entry.label && !catalogNumber) return [];

    return [
      {
        name: entry.label?.name ?? "",
        catalogNumber,
      },
    ];
  });
}

export function mapReleaseEdition(
  release: ReleaseSummary,
): AlbumReleaseEdition {
  const media = (release.media ?? []).map((medium) => ({
    position: medium.position,
    format: medium.format ?? null,
    trackCount: medium["track-count"] ?? 0,
  }));

  return {
    id: release.id,
    title: release.title,
    date: release.date ?? null,
    country: release.country ?? null,
    status: release.status ?? null,
    barcode: release.barcode ?? null,
    packaging: release.packaging ?? null,
    labels: mapLabels(release["label-info"]),
    media,
  };
}

export function mapReleaseDetails(
  release: ReleaseDetailsResponse,
): AlbumReleaseDetails {
  const media: AlbumReleaseMedium[] = (release.media ?? []).map((medium) => {
    const tracks = (medium.tracks ?? []).map((track) => ({
      id: track.id,
      number: track.number,
      title: track.title,
      lengthMs: track.length ?? track.recording?.length ?? null,
    }));

    return {
      position: medium.position,
      format: medium.format ?? null,
      trackCount: medium["track-count"] ?? tracks.length,
      title: medium.title ?? null,
      tracks,
    };
  });

  return {
    id: release.id,
    title: release.title,
    date: release.date ?? null,
    country: release.country ?? null,
    status: release.status ?? null,
    barcode: release.barcode ?? null,
    packaging: release.packaging ?? null,
    labels: mapLabels(release["label-info"]),
    media,
  };
}
