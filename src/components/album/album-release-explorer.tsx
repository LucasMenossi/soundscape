"use client";

import { useState } from "react";
import { AlertCircle, Disc3, LoaderCircle, Music2 } from "lucide-react";
import type {
  AlbumReleaseDetails,
  AlbumReleaseEdition,
} from "@/server/domain/album-release";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface AlbumReleaseExplorerProps {
  albumId: string;
  releases: AlbumReleaseEdition[];
  initialRelease: AlbumReleaseDetails | null;
}

function formatDuration(lengthMs: number | null): string {
  if (lengthMs === null) return "—";
  const totalSeconds = Math.floor(lengthMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function formatReleaseDate(date: string | null): string | null {
  if (!date) return null;
  const match = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(date);
  if (!match) return date;
  const [, year, month, day] = match;
  if (!month) return year;
  if (!day) return `${month}/${year}`;
  return `${day}/${month}/${year}`;
}

function editionLabel(release: AlbumReleaseEdition): string {
  const details = [release.date, release.country].filter(Boolean);
  const format = release.media.map((medium) => medium.format).find(Boolean);
  if (format) details.push(format);
  return details.length > 0
    ? `${release.title} · ${details.join(" · ")}`
    : release.title;
}

export function AlbumReleaseExplorer({
  albumId,
  releases,
  initialRelease,
}: AlbumReleaseExplorerProps) {
  const [selectedRelease, setSelectedRelease] = useState(initialRelease);
  const [selectedReleaseId, setSelectedReleaseId] = useState(
    initialRelease?.id ?? releases[0]?.id ?? "",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleReleaseChange(releaseId: string, force = false) {
    setSelectedReleaseId(releaseId);
    setErrorMessage(null);
    if (!releaseId || (!force && releaseId === selectedRelease?.id)) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/albums/${encodeURIComponent(albumId)}/releases/${encodeURIComponent(releaseId)}`,
        { headers: { Accept: "application/json" } },
      );
      if (!response.ok) {
        throw new Error(
          "We couldn't load this release edition. Please try again.",
        );
      }
      const release = (await response.json()) as AlbumReleaseDetails;
      setSelectedRelease(release);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't load this release edition. Please try again.",
      );
      setSelectedReleaseId(selectedRelease?.id ?? releases[0]?.id ?? "");
    } finally {
      setIsLoading(false);
    }
  }

  if (releases.length === 0) {
    return (
      <Card className="bg-card/50 p-6">
        <div className="flex items-start gap-3">
          <Disc3 className="mt-0.5 size-5 text-muted-foreground" />
          <div>
            <h3 className="font-medium">No release editions available</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              MusicBrainz does not currently list release editions for this
              album. The catalog page remains available, and this information
              may appear as the catalog is updated.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label
          className="grid gap-2 text-sm font-medium"
          htmlFor="album-release-edition"
        >
          Select an edition
          <select
            id="album-release-edition"
            value={selectedReleaseId}
            onChange={(event) => void handleReleaseChange(event.target.value)}
            disabled={isLoading}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-wait disabled:opacity-60"
          >
            {releases.map((release) => (
              <option key={release.id} value={release.id}>
                {editionLabel(release)}
              </option>
            ))}
          </select>
        </label>
        {selectedRelease && (
          <Badge variant="outline" className="h-8 w-fit">
            {selectedRelease.status ?? "Release edition"}
          </Badge>
        )}
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isLoading ? (
        <div
          className="flex items-center gap-2 rounded-xl border border-border bg-card/40 p-6 text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <LoaderCircle className="size-4 animate-spin" />
          Loading edition details…
        </div>
      ) : !selectedRelease ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border p-6">
          <p className="text-sm text-muted-foreground">
            Edition metadata is available, but its tracklist could not be loaded
            yet.
          </p>
          <button
            type="button"
            onClick={() => void handleReleaseChange(selectedReleaseId, true)}
            className="inline-flex h-9 items-center justify-center rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Retry loading tracklist
          </button>
        </div>
      ) : selectedRelease ? (
        <>
          <Card className="grid gap-4 bg-card/50 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <Metadata
              label="Release date"
              value={formatReleaseDate(selectedRelease.date)}
            />
            <Metadata label="Country" value={selectedRelease.country} />
            <Metadata label="Barcode" value={selectedRelease.barcode} />
            <Metadata label="Packaging" value={selectedRelease.packaging} />
            <Metadata
              label="Format"
              value={
                selectedRelease.media
                  .map((medium) => medium.format)
                  .filter(Boolean)
                  .join(", ") || null
              }
            />
            <Metadata
              label="Record label"
              value={
                selectedRelease.labels
                  .map((label) => label.name)
                  .filter(Boolean)
                  .join(", ") || null
              }
            />
            {selectedRelease.labels.some((label) => label.catalogNumber) && (
              <Metadata
                label="Catalog number"
                value={selectedRelease.labels
                  .map((label) => label.catalogNumber)
                  .filter(Boolean)
                  .join(", ")}
              />
            )}
          </Card>

          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Tracklist</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedRelease.media.reduce(
                    (total, medium) => total + medium.tracks.length,
                    0,
                  )}{" "}
                  tracks across {selectedRelease.media.length}{" "}
                  {selectedRelease.media.length === 1 ? "medium" : "media"}
                </p>
              </div>
              <Music2 className="size-5 text-muted-foreground" />
            </div>

            {selectedRelease.media.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                No tracklist has been supplied for this edition yet.
              </p>
            ) : (
              selectedRelease.media.map((medium) => (
                <section
                  key={medium.position}
                  className="overflow-hidden rounded-xl border border-border bg-card/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                    <h4 className="font-medium">
                      {medium.title || `Disc ${medium.position}`}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {medium.format && (
                        <Badge variant="secondary">{medium.format}</Badge>
                      )}
                      <span>{medium.tracks.length} tracks</span>
                    </div>
                  </div>
                  {medium.tracks.length > 0 ? (
                    <ol
                      aria-label={`Tracklist for ${medium.title || `disc ${medium.position}`}`}
                      className="divide-y divide-border"
                    >
                      {medium.tracks.map((track, index) => (
                        <li
                          key={track.id}
                          className="grid grid-cols-[2.5rem_minmax(0,1fr)_3.5rem] items-center gap-3 px-4 py-3 text-sm"
                        >
                          <span className="text-right text-xs tabular-nums text-muted-foreground">
                            {track.number || index + 1}
                          </span>
                          <span className="min-w-0 truncate">
                            {track.title}
                          </span>
                          <span
                            aria-label={`Duration ${formatDuration(track.lengthMs)}`}
                            className="text-right text-xs tabular-nums text-muted-foreground"
                          >
                            {formatDuration(track.lengthMs)}
                          </span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="px-4 py-5 text-sm text-muted-foreground">
                      Track details are not available for this medium.
                    </p>
                  )}
                </section>
              ))
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

function Metadata({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-words text-sm">{value}</p>
    </div>
  );
}
