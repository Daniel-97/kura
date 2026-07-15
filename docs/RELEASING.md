# Release guide

How to develop, tag versions, and publish a new Kura release to ghcr.io. The
CI/CD workflow lives in
[`.github/workflows/docker-publish.yml`](../.github/workflows/docker-publish.yml).

## 1. Branches

- `main` is the single long-lived stable branch — it must always stay
  deployable.
- Work happens on short-lived branches, merged into `main` via PR and then
  deleted:
  - `feature/thing-name` — new features
  - `fix/bug-name` — bugfixes
- Every push to `main` automatically publishes the `edge` image (see
  section 3) — the "most recent possible" build, untested, useful for
  trying out a fix before it becomes a release.

## 2. Versioning

Semantic Versioning (`vMAJOR.MINOR.PATCH`, e.g. `v1.4.2`):

| Bump  | When |
|-------|--------|
| MAJOR | Breaking change — requires a manual step to update (e.g. data migration/wipe, renamed env var) |
| MINOR | New backward-compatible features |
| PATCH | Bugfixes, security patches |

Every release starts from a **Git tag `vX.Y.Z` on a commit on `main`** (never
on a working branch).

## 3. What the CI publishes

| Trigger | Image tags published |
|---|---|
| Push to `main` | `ghcr.io/daniel-97/kura:edge` |
| Push tag `vX.Y.Z` | `:X.Y.Z`, `:X.Y`, `:X`, `:latest` |

`latest` always tracks the most recent tagged release, never the `edge`
builds.

## 4. Procedure for releasing a new version

1. Make sure `main` is green (CI passing, `make check` clean) and contains
   everything you want to release.
2. Update [`CHANGELOG.md`](../CHANGELOG.md): move entries from
   `[Unreleased]` into a new `## [X.Y.Z] - YYYY-MM-DD` section. If the
   version is MAJOR or otherwise requires a manual step when updating (e.g.
   wiping `pb_data/`, a new required env var), describe it explicitly in the
   entry — it's the first thing self-hosters read before updating.
3. Commit the CHANGELOG to `main`:
   ```bash
   git add CHANGELOG.md
   git commit -m "chore(release): v1.4.2"
   git push origin main
   ```
4. Create and push the tag **on the latest commit of `main`**:
   ```bash
   git tag v1.4.2
   git push origin v1.4.2
   ```
5. Pushing the tag triggers the workflow: multi-arch build (amd64/arm64) and
   push to ghcr.io of the four tags from the table above. Follow progress in
   the Actions tab of the GitHub repo.
6. Verify the image was published and is **public** (package Settings on
   GitHub → Change visibility; only needed the first time the package is
   created, it stays public for subsequent releases):
   ```bash
   docker pull ghcr.io/daniel-97/kura:1.4.2
   ```
7. Update the pinned tag in
   [`docker-compose.prod.yml`](../docker-compose.prod.yml) to the new
   version (it's the example end users copy) and, if you want, open a
   GitHub Release from the tag with notes taken from the CHANGELOG.

## 5. Updating an existing self-hosted instance

For anyone running a Kura instance (including you):

1. Read the CHANGELOG entry for the target version — if it requires a
   manual step, do it **before** updating the image.
2. Update the tag in `docker-compose.prod.yml` (or your own compose file) to
   the new version.
3. ```bash
   docker compose -f docker-compose.prod.yml pull
   docker compose -f docker-compose.prod.yml up -d
   ```
4. Schema migrations in `pb_migrations/` are applied automatically by
   PocketBase on container startup — no manual step is needed for those by
   themselves, only for any steps described in the CHANGELOG (wipe, toggle
   from the admin dashboard, etc. — this has already happened for the
   `protected`/`thumbs`/`language` fields, see `docs/TODO.md`).
