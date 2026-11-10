# 01 — Product Requirements

## 1. Product overview

**SoundScape — Music Discovery** is a music-discovery and exploration product. It helps users move from an artist, album, or genre they already know toward music and artists they may want to explore next. The product emphasizes catalog exploration, artist context, personal curation, and a visually rich interface.

SoundScape is not a streaming service. The MVP does not play music, connect to Spotify, require Spotify Premium, or depend on a paid streaming subscription.

## 2. Product goals

1. Make it easy to search for and explore artists and albums.
2. Present useful artist and discography context using a consistent music catalog.
3. Make genres and artist relationships useful navigation paths, not just metadata labels.
4. Let signed-in users save discoveries into a personal library, favorites, and collections.
5. Deliver a distinctive visual experience without assuming that third-party artwork is free to reuse.
6. Keep infrastructure and external dependencies free-first where practical.

## 3. Target experience

A user should be able to:

- Search for an artist or album and reach a reliable detail page.
- Explore an artist's discography and genre information.
- Navigate from an artist to related artists when relationship data is available.
- Save an artist or album for later.
- Create and maintain collections of saved discoveries.
- Browse the product without an account; authentication is required only for personal features.

## 4. Product principles

- **Discovery before playback:** focus on context, exploration, and curation.
- **Catalog identity:** use MusicBrainz identifiers as canonical external identity keys; do not rely on display names as unique identifiers.
- **Progressive enrichment:** missing biography, genre, relationship, or image data must not break core pages.
- **Rights-aware media:** an image URL is not a license. Third-party images are selected automatically only when their metadata establishes a compatible reuse basis; uncertain cases use original artwork.
- **Graceful visual fallback:** use original SoundScape SVG/CSS artwork when no cleared image exists.
- **Free-first:** avoid mandatory paid APIs and services in the MVP.

## 5. Success criteria for MVP

- A user can search and open artist and album pages with stable URLs.
- Artist pages show available genres, discography, and artist relationships.
- Users can authenticate and maintain favorites, a personal library, and collections.
- Catalog data is cached and provider rate limits are respected.
- Missing provider data and provider outages produce useful fallback states rather than broken pages.
- No image with unknown or unreviewed rights is publicly displayed as if cleared.
- The main journeys are covered by automated tests.

## 6. Non-goals

The following are explicitly outside the MVP:

- Music playback, streaming, or audio hosting.
- Spotify, Spotify Premium, or Spotify API integration.
- Similarity recommendations or algorithmic recommendation feeds.
- Mood-based discovery.
- Automated listening-history ingestion.
- Advanced taste profiles or personalized ranking models.
- Social feeds, messaging, or collaborative playlists.
- Mobile native applications.

These can be reconsidered after the MVP, but they are not prerequisites for launch.

## 7. Constraints and assumptions

- The product should remain usable without paid external services.
- MusicBrainz is the primary catalog provider, not a guaranteed source for every optional field.
- Artist imagery is sourced from TheAudioDB by MusicBrainz artist MBID; album front covers are sourced from Cover Art Archive by release-group MBID. Original SoundScape artwork is the fallback.
- Cover Art Archive is a discovery/source-of-reference integration; its approval status does not clear copyright and its images are not publicly displayed in the MVP.
- TheAudioDB may be used for development research, but artwork must remain hidden unless its specific rights and applicable terms are verified.
- The app must not hotlink or redistribute third-party artwork merely because a provider returns an image URL.
