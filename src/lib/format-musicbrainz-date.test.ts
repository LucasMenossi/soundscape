import { describe, expect, it } from "vitest";

import { formatMusicBrainzDate } from "./format-musicbrainz-date";

describe("formatMusicBrainzDate", () => {
  it("preserves year-only dates", () => {
    expect(formatMusicBrainzDate("1985")).toBe("1985");
  });

  it("formats year and month precision", () => {
    expect(formatMusicBrainzDate("1997-05")).toBe("May 1997");
  });

  it("formats complete dates without timezone shifts", () => {
    expect(formatMusicBrainzDate("1997-05-21")).toBe("May 21, 1997");
  });

  it("returns null for missing dates", () => {
    expect(formatMusicBrainzDate(null)).toBeNull();
  });

  it("preserves invalid or unsupported values", () => {
    expect(formatMusicBrainzDate("1997-13-40")).toBe("1997-13-40");
    expect(formatMusicBrainzDate("unknown")).toBe("unknown");
  });
});
