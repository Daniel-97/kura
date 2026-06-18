# Kura — Agent Guide

## Stack Overview

- **Backend**: PocketBase single binary (Go + SQLite). No custom server code. API and auth are entirely managed by PocketBase.
  - Schema defined in `pb_migrations/` (single idempotent `init.js`)
  - Data stored in `pb_data/` — **never commit, never read this directory**
  - File storage handled by PocketBase (files served from `pb_data/storage/`)
- **Frontend**: React 18 + TypeScript strict, built with Vite. Source in `frontend/src/` (feature-based layout: `features/<feature>/` co-locates each feature's code; `components/shell/` holds app chrome; `lib/routes.ts` is the single source of truth for routing). Build output → `pb_public/` (git-ignored).
- **Serving**: In production, PocketBase serves `pb_public/` at `/`. In dev, Vite (port 5173) proxies `/api` and `/_` to PocketBase (port 8090).
- **Docker**: Optional deploy path. `Dockerfile` multi-stage (Node builder → Alpine runtime). Dev without Docker is equally supported.

## Starting the Development Environment

```bash
./scripts/setup.sh            # download pinned PocketBase binary (once)
cd frontend && npm install    # install frontend deps (once)

./pocketbase serve            # backend on :8090, runs migrations automatically
cd frontend && npm run dev    # frontend on :5173 with HMR and API proxy
```

Admin dashboard: http://localhost:8090/_/

## Schema Changes

**Do not create new migration files.** The schema is defined once in `pb_migrations/init.js` (idempotent). The codebase is small enough that recreating `pb_data/` from scratch is the supported path for any schema change.

If a schema change is needed:
1. Edit `pb_migrations/init.js` to reflect the new desired state (use `createIfMissing` / try-catch for idempotency)
2. Test on a wiped `pb_data/`: `./pocketbase serve` should create the schema from scratch without errors
3. For existing deployments, the user must wipe `pb_data/` (no live migrations are supported)
4. Update `frontend/src/lib/types.ts` to match the new schema
5. Every change to `types.ts` is a change to the public contract — update the hook return types accordingly

The admin dashboard can be used freely for ad-hoc inspection but is **not** a schema source of truth.

## Code Conventions

| Rule | Reason |
|------|--------|
| TypeScript strict; `any` banned except with justification comment | Catches type errors early |
| Function components with hooks only | Consistency |
| Server state via `@tanstack/react-query` exclusively; no `fetch` in `useEffect` | Prevents stale data and race conditions |
| shadcn/ui components added via `npx shadcn@latest add <name>` only | Generated files in `components/ui/` must not be hand-edited |
| No hardcoded UI strings — all text via `t('key')` | Every new key added to both `it.json` and `en.json` in the same commit |
| Minimize npm dependencies; document reasoning for any new addition | Keeps the bundle small and auditable |
| Variable names, translation keys, and code comments in English | UI strings only in locale JSON files |
| `pb.autoCancellation(false)` is set in `lib/pb.ts` | Prevents react-query from triggering abort errors on rapid re-renders |
| Repeated UI styles live in `frontend/src/index.css` under `@layer components` (built with `@apply`). Pages and components reference these classes instead of repeating the same Tailwind chains. | Single source of truth for layout patterns; keeps page markup readable. |
| Feature-based folder structure: each feature co-locates its pages, components, hooks, utils, and tests in `frontend/src/features/<feature>/` | Co-location makes feature code easy to find and maintain |
| Within-feature imports use relative paths (`./useAuth`); cross-feature, shell, ui, lib-shared, i18n imports use `@/` | Clear dependency direction: within-feature is cohesive, cross-feature is explicit |
| App chrome (header, sidebar, drawer, switchers, toggle, user menu) lives in `frontend/src/components/shell/` | Separates navigation/chrome from feature components |
| Route table is a single source of truth in `frontend/src/lib/routes.ts` (`AppRoute` interface + `routes` array); `App.tsx` consumes it via `.map()` | Adding a route = one line in `routes.ts`, not editing JSX in `App.tsx` |

## PocketBase Version

Pinned in **two** places:

1. `scripts/setup.sh`: `POCKETBASE_VERSION="X.Y.Z"`
2. `Dockerfile`: `ARG POCKETBASE_VERSION=X.Y.Z`

Update both simultaneously when upgrading. Run migrations on a test `pb_data/` after upgrading.

## Build & Manual Testing

```bash
# Type check
cd frontend && npm run lint

# Production build
cd frontend && npm run build
# → emits to pb_public/

# Verify PocketBase starts and runs migrations
./pocketbase serve
# Should print migration success messages, no errors

# Docker test
docker compose up --build
curl http://localhost:8090/api/health
```

Manual feature checklist:
1. Login with test user credentials → redirected to Timeline
2. Create a record with title, date, category, tags, description, and a PDF attachment
3. Verify record appears in Timeline, grouped by month, with correct category badge and tags
4. Filter by category and by tag — verify list updates correctly
5. Add a blood pressure measurement (systolic, diastolic, pulse) — verify it appears in the list
6. Switch language IT ↔ EN — verify all labels, category names, and date formats change

## Design Decisions

- **`pb_public/` not committed**: it's a build artifact. Deploy requires `npm run build` or Docker (which builds automatically). Alternative considered and rejected: committing the build for simpler `git pull` deploys — rejected because it pollutes git history and requires Node.js on the production server.
- **Tags as comma-separated text**: stored in a `text` field. Filter with PocketBase's `~` operator (`tags ~ "covid"` → SQL `LIKE '%covid%'`). Alternative (JSON field + `?~`) is more semantically correct but adds complexity for a personal app.
- **HashRouter**: avoids PocketBase needing a catch-all route to serve the SPA. All routes are `/#/path`, transparent to the server.
- **`pb.autoCancellation(false)`**: without this, react-query's cleanup triggers abort on the PocketBase SDK's internal AbortController, causing spurious "request was autocancelled" errors.
