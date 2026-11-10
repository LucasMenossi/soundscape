# ADR 0004 — Free-First Product Without Streaming Integration

- Status: Accepted
- Date: 2026-11-03

## Context

SoundScape's MVP is about music discovery, exploration, and personal curation, not audio playback. The product should avoid mandatory paid services and must not depend on Spotify or Spotify Premium.

## Decision

Do not integrate Spotify or any streaming/playback provider in the MVP. Prefer free catalog and open-media sources where terms permit.

## Consequences

- The MVP can be used without a streaming account.
- Playback, listening-history ingestion, and streaming-linked personalization remain deferred.
- Provider selection must consider terms, rate limits, rights, and sustainability, not only API availability.
