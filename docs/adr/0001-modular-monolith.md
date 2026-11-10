# ADR 0001 — Use a Modular Monolith for the MVP

- Status: Accepted
- Date: 2026-11-03

## Context

SoundScape is beginning with a focused discovery and personal-curation MVP. The current scale and domain boundaries do not justify distributed services.

## Decision

Build one Next.js application with clear domain, application, and infrastructure boundaries. Use PostgreSQL through Prisma.

## Consequences

- Lower operational complexity and faster iteration.
- Provider adapters and application services remain separable for future extraction.
- Enforce server/client boundaries and avoid importing infrastructure into UI components.
