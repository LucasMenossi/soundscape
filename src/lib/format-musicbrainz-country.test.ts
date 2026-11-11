import { describe, expect, it } from "vitest";
import { formatMusicBrainzCountry } from "./format-musicbrainz-country";

describe("formatMusicBrainzCountry", () => {
  it.each([
    ["DE", "Germany"],
    ["GB", "United Kingdom"],
    ["US", "United States"],
    ["BR", "Brazil"],
    ["XE", "Europe"],
    ["XW", "Worldwide"],
    ["XU", "Unknown"],
  ])("formats %s as %s", (code, expected) => {
    expect(formatMusicBrainzCountry(code)).toBe(expected);
  });

  it("normalizes whitespace and lowercase country codes", () => {
    expect(formatMusicBrainzCountry(" de ")).toBe("Germany");
  });

  it.each([null, undefined, "", "   ", "INVALID", "D", "123"])(
    "returns null for unsupported country values (%s)",
    (value) => {
      expect(formatMusicBrainzCountry(value)).toBeNull();
    },
  );
});
