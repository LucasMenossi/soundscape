-- Cover Art Archive metadata returns HTTP image URLs. The provider now
-- normalizes its known image hosts to HTTPS. Clear the artwork search cache so
-- albums that previously stored an empty result are looked up again.
UPDATE "albums" SET "artworkLastSearchedAt" = NULL;

-- Remove stale automatic CAA selections so the next page request resolves
-- against the normalized provider URL instead of keeping an obsolete record.
UPDATE "artwork_assets"
SET "reviewStatus" = 'PENDING'
WHERE "sourceProvider" = 'COVER_ART_ARCHIVE'
  AND "reviewStatus" = 'AUTO_APPROVED';
