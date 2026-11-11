const MUSICBRAINZ_SPECIAL_AREAS: Record<string, string> = {
  XE: "Europe",
  XU: "Unknown",
  XW: "Worldwide",
};

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

/** Converts MusicBrainz ISO 3166-1 area codes into readable English names. */
export function formatMusicBrainzCountry(
  countryCode: string | null | undefined,
): string | null {
  const code = countryCode?.trim().toUpperCase();
  if (!code) return null;

  const specialArea = MUSICBRAINZ_SPECIAL_AREAS[code];
  if (specialArea) return specialArea;

  // MusicBrainz normally returns ISO 3166-1 alpha-2 codes. Avoid exposing
  // unknown provider values as if they were human-readable country names.
  if (!/^[A-Z]{2}$/.test(code)) return null;

  try {
    const countryName = regionNames.of(code);
    return countryName && countryName !== code ? countryName : null;
  } catch {
    return null;
  }
}
