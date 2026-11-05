/**
 * Formats MusicBrainz dates without assuming that partial dates are complete.
 * Supported precision: YYYY, YYYY-MM and YYYY-MM-DD.
 */
export function formatMusicBrainzDate(value: string | null): string | null {
  if (!value) return null;

  const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  if (!month) return year;

  const monthNumber = Number(month);
  const dayNumber = day ? Number(day) : 1;
  const yearNumber = Number(year);
  const date = new Date(Date.UTC(yearNumber, monthNumber - 1, dayNumber));

  if (
    monthNumber < 1 ||
    monthNumber > 12 ||
    (day &&
      (dayNumber < 1 ||
        date.getUTCMonth() !== monthNumber - 1 ||
        date.getUTCDate() !== dayNumber))
  ) {
    return value;
  }

  if (!day) {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
