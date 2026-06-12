# Design: scripts/seed_users.sh

**Date:** 2026-06-12
**Scope:** one-time CLI setup script to create the PocketBase superuser (admin) and the personal user on a fresh Docker deployment of Kura.

---

## Context

Kura runs PocketBase 0.27.1 inside a Docker container (port 8090). Migration `2_disable_registration.js` sets `createRule = null` on the `users` collection, so users cannot self-register — the admin must create them manually. This script automates that one-time bootstrap.

---

## Architecture

Single bash script: `scripts/seed_users.sh`

No external dependencies beyond `bash` and `curl` (both present in any standard Linux/macOS environment).

---

## Flow

```
1. Collect credentials (interactive prompts)
2. Wait for PocketBase container to be healthy
3. Create superuser (admin) via API — no auth required on first run
4. Authenticate as admin → obtain JWT token
5. Create personal user via API — with admin token
```

---

## API Calls

| Step | Method | Endpoint | Auth |
|------|--------|----------|------|
| Health check | GET | `/api/health` | none |
| Create superuser | POST | `/api/collections/_superusers/records` | none (first run only) |
| Admin auth | POST | `/api/collections/_superusers/auth-with-password` | none |
| Create user | POST | `/api/collections/users/records` | `Bearer <token>` |

Request bodies:
- Create superuser: `{ "email": "...", "password": "...", "passwordConfirm": "..." }`
- Admin auth: `{ "identity": "...", "password": "..." }`
- Create user: `{ "email": "...", "password": "...", "passwordConfirm": "..." }`

---

## Configuration

`PB_URL` environment variable — default `http://localhost:8090`. Allows targeting a non-default host/port without editing the script.

`PB_TIMEOUT` environment variable — default `60` seconds for the health-check polling loop.

---

## UX / Prompts

```
=== Kura — initial user setup ===

[Admin] Email: <input>
[Admin] Password: <hidden>
[Admin] Confirm password: <hidden>

[User]  Email: <input>
[User]  Password: <hidden>
[User]  Confirm password: <hidden>

Waiting for PocketBase...  (dots every 2s)
✓ PocketBase is up
✓ Admin created
✓ Personal user created

Setup complete.
```

---

## Error Handling

| Condition | Behaviour |
|-----------|-----------|
| Password < 8 chars | Local validation before any HTTP call; print error and re-prompt |
| Password mismatch | Local validation; re-prompt |
| Container not healthy after `PB_TIMEOUT` | `exit 1` with clear message |
| Superuser already exists (HTTP 400) | Print "Admin already configured — run manually if needed" and `exit 1` |
| Personal user already exists (HTTP 400) | Print "User already exists — run manually if needed" and `exit 1` |
| Any other unexpected HTTP error | Print full response body and `exit 1` |

---

## Security

- All passwords read with `read -s` (no terminal echo).
- Password variables are `unset` immediately after each API call.
- No credentials written to disk or any log file.
- `set -euo pipefail` throughout — any unhandled error aborts the script.

---

## Out of Scope

- Idempotency (re-running on an already-configured instance is an error by design).
- Updating or deleting users.
- Running against a non-Docker local binary (covered by `setup.sh` + manual admin UI).
