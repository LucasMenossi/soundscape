-- Re-run artwork discovery after switching from filename-based Commons search
-- to MusicBrainz-ID-based artist and release-group artwork providers.
UPDATE "artists" SET "artworkLastSearchedAt" = NULL;
UPDATE "albums" SET "artworkLastSearchedAt" = NULL;
