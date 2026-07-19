<p align="center">
  <img src="frontend/public/kura-icon.svg" width="96" alt="Kura" />
</p>

# Kura — Personal health record

Kura is a self-hosted web app for managing your personal health record: medical reports and documents, measurements (blood pressure, weight, blood glucose), therapies and reminders — all on your own server, mobile-first and installable as an app.

## Features

- **🗂 Clinical diary** — timeline of medical reports with attachments (PDF and images) protected by temporary tokens, customizable color-coded categories, full-text search on title/notes/tags, email reminders for appointments
- **📊 Measurements** — blood pressure log with chart (systolic/diastolic/heart rate), weight and blood glucose with trends; new parameters can be added with a single config line
- **💊 Therapies and medications** — flexible recurrences ("every day at 8am", "every 6 months"), package expiry with email heads-up, per-occurrence notifications toggleable per therapy
- **🏠 Overview** — dashboard with upcoming appointments and countdown, latest measurements, ongoing therapies and pending reminders
- **📤 Export and portability** — full export as a ZIP (faithful JSON + Excel-friendly CSV + all attachments), single-visit export, `.ics` event for calendar import
- **🌍 Experience** — bilingual Italian/English (preference saved on the profile), light/dark theme, installable on your phone (PWA), dedicated design system
- **🔒 Security and backups** — data isolated per user at the API level, attachments never reachable without authentication, automatic nightly backups with rotation

## Prerequisites

- **Node.js LTS** (v20+) for local development and builds
- **Docker** + **Docker Compose** — optional, for containerized deployment

## Local development

The workflow is managed by a `Makefile` (`make help` for the full list of targets):

```bash
make setup   # first time: downloads the PocketBase binary + npm install
make dev     # starts backend (:8090) and frontend (:5173) together; Ctrl+C stops both
```

Open http://localhost:5173. The dev server proxies `/api` and `/_` requests to PocketBase (port 8090).

The PocketBase admin UI is available at http://localhost:8090/_/.

Other useful targets:

```bash
make backend      # PocketBase only
make frontend     # Vite dev server only
make check        # type-check + tests
make build        # production build → pb_public/
```

### Troubleshooting: `attempt to write a readonly database`

Happens when files in `pb_data/` are owned by `root` (typically because the Docker container ran as root at some point in the past). Fix with:

```bash
make fix-perms   # requires sudo
```

`docker-compose.yml` now runs the container as your user (`KURA_UID`/`KURA_GID`, default `1000:1000`), so the problem shouldn't recur.

## Manual build and deploy (without Docker)

```bash
cd frontend && npm run build
```

Static files are emitted to `pb_public/` (excluded from git). On the server:

```bash
./scripts/setup.sh      # downloads the binary for the server's OS/arch
./pocketbase serve --http=0.0.0.0:8090
```

PocketBase automatically serves the frontend from `pb_public/`.

## Deploy with Docker

```bash
make docker-up    # equivalent to: KURA_UID=$(id -u) KURA_GID=$(id -g) docker compose up -d --build
```

- Persistent data in `./pb_data/` (automatic bind mount)
- The container runs as your user (not root), so `pb_data/` stays writable outside Docker too. If you run `docker compose` manually with a user whose UID differs from 1000, export `KURA_UID` and `KURA_GID`.
- To stop: `make docker-down`
- For logs: `make docker-logs`

### Deploy without a local build (prebuilt image)

Every release publishes a multi-arch image (amd64/arm64) to GitHub Container
Registry, ready to pull on a Raspberry Pi/NAS without compiling anything:

```bash
docker pull ghcr.io/daniel-97/kura:0.1.0
```

Use [`docker-compose.prod.yml`](docker-compose.prod.yml) as a base — it's
identical to `docker-compose.yml` but points to `image: ghcr.io/daniel-97/kura:X.Y.Z`
instead of building. **Keep the tag pinned to a specific version** (never
`:latest`): an unrequested update to sensitive health data should be a
decision, not something that just happens.

Tags available for each `vX.Y.Z` release: `X.Y.Z`, `X.Y`, `X` and `latest`
(the latter always tracks the most recent release, useful only to manually
check "what's the newest version"). Pushes to `main` also publish `edge`,
untested development builds — don't use it in production.

### Versioning and updates

Releases follow [Semantic Versioning](https://semver.org/) and are tagged on
Git as `vX.Y.Z`. Before updating an instance, always read the
[CHANGELOG](CHANGELOG.md) for the target version: a MAJOR bump may require a
manual step (e.g. wiping `pb_data/`, as already happened for the
`protected`/`thumbs`/`language` fields — see `docs/TODO.md`).

Full procedure for cutting a release or updating an instance (branching,
tags, what the CI publishes): [`docs/RELEASING.md`](docs/RELEASING.md).

## First run: create the admin and your user

On first boot (empty `pb_data/`), Kura automatically creates a PocketBase
superuser account — no manual step required. By default it uses
`admin@kura.local` / `changeme123`; **log in and change this password
immediately** (admin panel below), or set `ADMIN_EMAIL`/`ADMIN_PASSWORD`
*before* the first start to skip the default entirely. An existing
superuser is never touched on later restarts, even if these variables stay
set.

To also get a personal app user created automatically, set both
`USER_EMAIL` and `USER_PASSWORD` before the first start. If left unset, no
personal user is created and you can register one from the app (if
`ALLOW_REGISTRATION` is enabled) or from the admin panel.

Set these in `docker-compose.yml` (or an `.env` file next to it) before
running `make docker-up` / `docker compose up`.

Optional environment variables:

| Variable         | Default                  | Description                              |
|-------------------|--------------------------|------------------------------------------|
| `ALLOW_REGISTRATION` | `true` | Set to `false` to disable new user registration. Controls both the UI and the PocketBase API. Requires `docker compose build` after changing it. |
| `ADMIN_EMAIL`     | `admin@kura.local`       | Superuser email, used only if no superuser exists yet |
| `ADMIN_PASSWORD`  | `changeme123`            | Superuser password, used only if no superuser exists yet |
| `USER_EMAIL`      | —                        | Personal app user email; set together with `USER_PASSWORD` to auto-create it on first boot |
| `USER_PASSWORD`   | —                        | Personal app user password |
| `SMTP_HOST`       | —                        | SMTP host for sending email reminders    |
| `SMTP_PORT`       | `587`                    | SMTP port                                |
| `SMTP_USERNAME`   | —                        | SMTP username                            |
| `SMTP_PASSWORD`   | —                        | SMTP password                            |
| `SMTP_FROM`       | —                        | Sender address (e.g. `noreply@kura.tld`) |
| `SMTP_FROM_NAME`  | `Kura`                   | Sender name                              |
| `APP_URL`         | `http://localhost:8090`  | Public URL of the app                    |
| `BACKUP_CRON`     | `0 3 * * *`              | Automatic `pb_data` backup (cron schedule); `off` to disable |
| `BACKUP_MAX_KEEP` | `7`                      | How many backups to keep before rotating |

When done, log in to the app at **http://localhost:8090**.

Admin panel: **http://localhost:8090/_/**

## Backup

Kura runs an **automatic nightly backup** of the entire `pb_data/` (database + attachments, atomic ZIP) by default: every night at 3am, keeping the last 7. Schedule and retention are controlled with `BACKUP_CRON` / `BACKUP_MAX_KEEP` (table above; `BACKUP_CRON=off` disables it).

- Backups land in `pb_data/backups/`
- **Restore** (and extra manual backups): admin dashboard → Settings → Backups
- Good to know: backups live on the **same disk** as the data — they cover human and software errors, not disk failure. For disaster recovery, include `pb_data/backups/` (or all of `pb_data/`) in your host-level backup.

Quick manual copy, if needed:

```bash
cp -r pb_data/ backup/pb_data_$(date +%Y%m%d_%H%M%S)/
```

## Security

Kura contains sensitive health data. **Never expose the app to the internet without HTTPS.** Recommended options:

- Reverse proxy with TLS (Caddy, Nginx + Let's Encrypt)
- Private VPN for personal access (Tailscale, WireGuard)
