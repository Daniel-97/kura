# Changelog

All notable changes to Kura are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
versioning follows [Semantic Versioning](https://semver.org/).

Every release is tagged on Git as `vX.Y.Z` and publishes an image to
`ghcr.io/daniel-97/kura` (see [.github/workflows/docker-publish.yml](.github/workflows/docker-publish.yml)).

## [Unreleased]

## [0.1.0] - 2026-07-19

First public beta release.

### Added

- Clinical diary: timeline of records with attachments (PDF/images) protected
  by tokens, customizable categories, full-text search, email reminders
- Measurements: blood pressure (with chart), weight and blood glucose, with
  trends
- Therapies and medications: flexible recurrences, package expiry, per-
  occurrence notifications
- "Overview" dashboard: upcoming appointments, latest measurements, ongoing
  therapies, pending reminders
- Export and portability: full export (ZIP JSON+CSV+attachments),
  single-visit export, `.ics` event
- Bilingual Italian/English, light/dark theme, installable PWA
- Automatic nightly backups with rotation
- Multi-arch (amd64/arm64) Docker image publishing to ghcr.io via CI/CD

## Conventions

- **MAJOR**: breaking change — requires a manual step before or after
  updating (e.g. `pb_data/` migration/wipe, renamed env var). Always describe
  a "How to update" note in the entry.
- **MINOR**: new backward-compatible features.
- **PATCH**: bugfixes and security patches, no action required.
- Schema migrations in `pb_migrations/` are applied automatically by
  PocketBase on container startup — no manual step needed for those. A MAJOR
  bump flags the cases (so far, all of them) where the schema adds a
  field/collection that PocketBase doesn't retroactively apply to instances
  already running (e.g. a new field on an existing collection), so far
  resolved by wiping `pb_data/` in development or a manual toggle from the
  admin dashboard in production — see the history in `docs/TODO.md`.
