# Kura — Fixes and features to do

List that emerged from the 2026-07-12 review. Ordered by priority.

## 1. Security and robustness (do first)

- [x] **Protect record attachments** *(done: `protected: true` on the `file` field in `init.js` + file token in `RecordCard` via the `useFileToken` hook; existing instances require a `pb_data/` wipe or a manual toggle from the dashboard)*
  The `file` field of the `records` collection (`pb_migrations/init.js`) doesn't have `protected: true`: in PocketBase files are public by default, so anyone who knows the URL can download a record without authentication. Fix: mark the field as protected and use file tokens (`pb.files.getToken()`) in the frontend to generate download URLs.

- [x] **PocketBase hooks never loaded** *(discovered and fixed while fixing reminders: PocketBase only loads `pb_hooks/*.pb.js`, the files were `.js` — reminders, SMTP from env, and the registration toggle were never active. Renamed to `.pb.js`; also fixed `$os.getEnv` → `$os.getenv` and the `sent_at` filter which, being a DateTime object truthy even when empty, discarded every reminder)*

- [x] **Reminder email bug: shows category ID instead of name** *(done: the relation is now resolved with `findRecordById("categories", ...)`; the "Category" row is omitted if the record has no category)*

- [x] **Reminder email: missing HTML escaping** *(done: `escapeHtml` on title, category, description and message in the HTML part; the text/plain part is deliberately left raw. Also fixed the dispatcher's `catch` block, which used `reminder.getId()` — nonexistent in the JSVM — and so was masking the real errors. JSVM note: handlers run in separate VMs, helpers must be defined inside the callback)*

- [x] **Reminder email: hardcoded it-IT language** *(done: `language` field (select it/en) on `users` in `init.js`; the LanguageSwitcher persists the choice to the profile and the saved language is applied at login; email translated it/en with dates formatted by hand — the JSVM ignores `toLocaleDateString`. Existing instances require a `pb_data/` wipe or manually adding the field from the dashboard; without the field the email stays in Italian. Note: the time in the email uses the server's timezone)*

- [x] **Inefficient reminder query in the cron job** *(done together with the `sent_at` filter fix: the dispatcher now uses `findRecordsByFilter("reminders", "sent_at = '' && fire_at <= {:now}", ...)` — DB-side selection)*

- [x] **Unsanitized record filters** *(done: `buildFilter` in `useRecords.ts` and the filter in `useReminders.ts` use `pb.filter()`; verified end-to-end that a hostile tag no longer injects clauses — previously a value like `x" || user != "` returned every record. The per-user `listRule` still prevented cross-user leaks regardless)*

- [x] **Timeline truncated at 500 records** *(done: `useRecords` is a `useInfiniteQuery` with 100-item pages and a tested `nextPageParam` helper; the Timeline loads subsequent pages automatically via an `IntersectionObserver` sentinel at the bottom of the list)*

## 2. High-value features, low effort

- [x] **Full-text search on records** *(done: search box with 300ms debounce in the timeline, filter `(title ~ q || description ~ q || tags ~ q)` combinable with the category select; the old tag filter was removed as redundant — tags are now covered by search)*

- [x] **Data export**
  - [x] Full export: "Export my data" in the user menu → client-side ZIP (`fflate`) with each collection as faithful JSON + simplified CSV (relations resolved) and attachments in per-record folders (design in `docs/superpowers/specs/2026-07-13-data-export-design.md`, not tracked)
  - [x] Single-visit export: "Export" entry in the card menu → ZIP with `referto.json` + `referto.csv` + attachments
  - [x] ICS calendar: "Add to calendar" entry in the card menu → single-event `.ics` (RFC 5545, default 1h duration); per-visit choice instead of a global export of future visits

- [x] **Initial dashboard** *(done: `/` is the new "Overview" home with quick actions, next 3 appointments with countdown, latest blood pressure + 30-day trend, pending reminders; the timeline moved to `/timeline`. Includes the design system foundation: shadcn tokens remapped in `docs/design-system.md`, self-hosted Outfit/Inter/JetBrains Mono fonts, kura palette, green shadows, radii; nav icons switched from emoji to Lucide)*

- [x] **Structural alignment with the design system** *(done: cards without a colored left border §5.2, "today" ribbon on primary instead of pink §1, sidebar active state on light tint §5.4, 4-item mobile bottom bar instead of hamburger+drawer §5.4, timeline empty state with ECG signature §5.5, mono metadata dates §3; `design-system.md` tracked in git)*

- [x] **Generic vital parameters** *(done: `measurements` collection with a `type` discriminator — weight and blood glucose; `blood_pressure` stays separate because it's multi-value; multi-profile decided NO — single user per account. "Measurements" page with Blood Pressure/Weight/Blood Glucose tabs, per-type config in the frontend, export extended with `misurazioni.json/csv`, redirect from `/blood-pressure`. Existing instances: wipe + `make seed` or manual collection from the dashboard)*

- [x] **Dashboard: generic measurements block** *(done: the card is now "Recent measurements" — blood pressure with chart + latest weight and latest blood glucose with date, rows hidden if the type has no data. Additional types (SpO2, temperature) = one value in the `init.js` select + one entry in `measurementTypes.ts`)*

- [x] **Recurring reminders / therapies** *(done: `therapies` collection — a single therapy/medication entity with interval recurrence (every+unit+time) and package expiry, both optional; `next_due`/`expiry_notice_at` are materialized; dedicated cron dispatcher that always advances `next_due` (a single email after downtime) and notifies expiries once; optional per-therapy email; `/therapies` page (5th nav entry, Pill icon), "Ongoing therapies" card on the dashboard, extended export. Notification delivery extracted into `pb_hooks/lib/notify.js` — a single email channel today, seam ready for future ntfy/push, also used by the reminder dispatcher)*

## 3. Bigger ideas (if the project grows)

- [x] ~~**Multi-profile (family members)**~~ *(decided NO on 2026-07-13 during the measurements design: each person has their own login, PocketBase already isolates per user. If ever needed, it'll be a dedicated migration)*

- [x] **Installable PWA** *(done: manifest.webmanifest + 192/512/maskable/apple-touch PNG icons generated from the official SVG, kura-600 theme-color. **No service worker/offline by choice** — modern browsers no longer require it for the install prompt, and true offline (data caching) remains a project of its own if ever needed)*

- [x] **Attachment previews** *(scoped down after brainstorming: server-side `160x160` thumbnails for image tiles only — previously they downloaded the full original. Verified 389KB→25KB and 404 without a token. PDF viewer dropped: the browser already handles it well, pdf.js would be a heavy dependency for nothing. Note: `thumbs` must be declared on the file field in `init.js` — existing instances: the usual wipe or manual toggle)*

- [x] **Automatic backups** *(done: `backup.pb.js` sets up PocketBase's native backups from env — `BACKUP_CRON` defaults to `0 3 * * *`, active by default, `off` to disable; `BACKUP_MAX_KEEP` defaults to 7. ZIP in `pb_data/backups/`, restore from the admin dashboard. Note: same disk as the data — for disaster recovery include `pb_data/backups/` in the host backup; S3 evaluated and deferred)*
