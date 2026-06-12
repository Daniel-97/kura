# seed_users.sh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `scripts/seed_users.sh`, a one-time bootstrap script that interactively collects credentials and creates the PocketBase superuser (admin) and personal user via HTTP API against the running Docker container.

**Architecture:** Single bash script with isolated functions for each concern (wait, prompt, create-admin, auth, create-user) wired by a `main` block. All HTTP done via `curl -s -w "\n%{http_code}"` so body and status code can be parsed in one request. No external dependencies beyond `bash` and `curl`.

**Tech Stack:** bash, curl, PocketBase 0.27.x REST API (`_superusers` and `users` collections).

---

## Files

| Action | Path |
|--------|------|
| Create | `scripts/seed_users.sh` |

---

### Task 1: Script skeleton

**Files:**
- Create: `scripts/seed_users.sh`

- [ ] **Step 1: Create the file with skeleton**

```bash
#!/bin/bash
set -euo pipefail

PB_URL="${PB_URL:-http://localhost:8090}"
PB_TIMEOUT="${PB_TIMEOUT:-60}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok()   { echo -e "${GREEN}✓${NC} $*"; }
err()  { echo -e "${RED}✗${NC} $*" >&2; }
info() { echo -e "${YELLOW}→${NC} $*"; }
```

Save to `scripts/seed_users.sh`.

- [ ] **Step 2: Make executable**

```bash
chmod +x scripts/seed_users.sh
```

- [ ] **Step 3: Verify it runs without errors (no-op so far)**

```bash
bash -n scripts/seed_users.sh
```

Expected: no output, exit 0.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed_users.sh
git commit -m "feat(scripts): add seed_users skeleton"
```

---

### Task 2: `wait_for_pb` function

**Files:**
- Modify: `scripts/seed_users.sh`

- [ ] **Step 1: Append the function after the helpers**

```bash
wait_for_pb() {
  info "Waiting for PocketBase at ${PB_URL}..."
  local elapsed=0
  until curl -sf "${PB_URL}/api/health" > /dev/null 2>&1; do
    if (( elapsed >= PB_TIMEOUT )); then
      echo ""
      err "PocketBase did not become healthy within ${PB_TIMEOUT}s. Is the container running?"
      exit 1
    fi
    printf "."
    sleep 2
    (( elapsed += 2 ))
  done
  echo ""
  ok "PocketBase is up"
}
```

- [ ] **Step 2: Verify syntax**

```bash
bash -n scripts/seed_users.sh
```

Expected: no output, exit 0.

- [ ] **Step 3: Commit**

```bash
git add scripts/seed_users.sh
git commit -m "feat(scripts): add wait_for_pb to seed_users"
```

---

### Task 3: `collect_credentials` function

**Files:**
- Modify: `scripts/seed_users.sh`

- [ ] **Step 1: Append the function**

```bash
collect_credentials() {
  echo ""
  echo "=== Kura — initial user setup ==="
  echo ""

  while true; do
    read -rp "[Admin] Email: " ADMIN_EMAIL
    read -rsp "[Admin] Password: " ADMIN_PASS; echo
    read -rsp "[Admin] Confirm password: " ADMIN_PASS2; echo
    if [[ "$ADMIN_PASS" != "$ADMIN_PASS2" ]]; then
      err "Passwords do not match. Try again."; continue
    fi
    if (( ${#ADMIN_PASS} < 8 )); then
      err "Password must be at least 8 characters. Try again."; continue
    fi
    break
  done

  echo ""

  while true; do
    read -rp "[User]  Email: " USER_EMAIL
    read -rsp "[User]  Password: " USER_PASS; echo
    read -rsp "[User]  Confirm password: " USER_PASS2; echo
    if [[ "$USER_PASS" != "$USER_PASS2" ]]; then
      err "Passwords do not match. Try again."; continue
    fi
    if (( ${#USER_PASS} < 8 )); then
      err "Password must be at least 8 characters. Try again."; continue
    fi
    break
  done
}
```

- [ ] **Step 2: Verify syntax**

```bash
bash -n scripts/seed_users.sh
```

Expected: no output, exit 0.

- [ ] **Step 3: Commit**

```bash
git add scripts/seed_users.sh
git commit -m "feat(scripts): add collect_credentials to seed_users"
```

---

### Task 4: `create_admin` function

**Files:**
- Modify: `scripts/seed_users.sh`

PocketBase allows `POST /api/collections/_superusers/records` without auth **only** when no superusers exist yet (first-run behaviour). The response is HTTP 200 on success, 400 on duplicate.

- [ ] **Step 1: Append the function**

```bash
create_admin() {
  local raw http_code body
  raw=$(curl -s -w "\n%{http_code}" -X POST "${PB_URL}/api/collections/_superusers/records" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASS}\",\"passwordConfirm\":\"${ADMIN_PASS}\"}")
  http_code=$(echo "$raw" | tail -n 1)
  body=$(echo "$raw" | sed '$d')

  case "$http_code" in
    200) ok "Admin created" ;;
    400) err "Admin already configured — run manually if needed."; unset ADMIN_PASS ADMIN_PASS2; exit 1 ;;
    *)   err "Unexpected error creating admin (HTTP ${http_code}): ${body}"; unset ADMIN_PASS ADMIN_PASS2; exit 1 ;;
  esac
}
```

- [ ] **Step 2: Verify syntax**

```bash
bash -n scripts/seed_users.sh
```

Expected: no output, exit 0.

- [ ] **Step 3: Commit**

```bash
git add scripts/seed_users.sh
git commit -m "feat(scripts): add create_admin to seed_users"
```

---

### Task 5: `auth_admin` function

**Files:**
- Modify: `scripts/seed_users.sh`

Authenticates the admin and stores the JWT in `ADMIN_TOKEN`. Clears the password variables immediately after.

- [ ] **Step 1: Append the function**

```bash
auth_admin() {
  local raw http_code body
  raw=$(curl -s -w "\n%{http_code}" -X POST "${PB_URL}/api/collections/_superusers/auth-with-password" \
    -H "Content-Type: application/json" \
    -d "{\"identity\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASS}\"}")
  http_code=$(echo "$raw" | tail -n 1)
  body=$(echo "$raw" | sed '$d')

  if [[ "$http_code" != "200" ]]; then
    err "Admin authentication failed (HTTP ${http_code}): ${body}"
    unset ADMIN_PASS ADMIN_PASS2
    exit 1
  fi

  ADMIN_TOKEN=$(echo "$body" | grep -oP '"token":"\K[^"]+')
  unset ADMIN_PASS ADMIN_PASS2
}
```

- [ ] **Step 2: Verify syntax**

```bash
bash -n scripts/seed_users.sh
```

Expected: no output, exit 0.

- [ ] **Step 3: Commit**

```bash
git add scripts/seed_users.sh
git commit -m "feat(scripts): add auth_admin to seed_users"
```

---

### Task 6: `create_user` function

**Files:**
- Modify: `scripts/seed_users.sh`

Uses `ADMIN_TOKEN` (set by `auth_admin`) to create the personal user. Clears all remaining credential variables on exit.

- [ ] **Step 1: Append the function**

```bash
create_user() {
  local raw http_code body
  raw=$(curl -s -w "\n%{http_code}" -X POST "${PB_URL}/api/collections/users/records" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -d "{\"email\":\"${USER_EMAIL}\",\"password\":\"${USER_PASS}\",\"passwordConfirm\":\"${USER_PASS}\"}")
  http_code=$(echo "$raw" | tail -n 1)
  body=$(echo "$raw" | sed '$d')

  unset ADMIN_TOKEN USER_PASS USER_PASS2

  case "$http_code" in
    200) ok "Personal user created" ;;
    400) err "User already exists — run manually if needed."; exit 1 ;;
    *)   err "Unexpected error creating user (HTTP ${http_code}): ${body}"; exit 1 ;;
  esac
}
```

- [ ] **Step 2: Verify syntax**

```bash
bash -n scripts/seed_users.sh
```

Expected: no output, exit 0.

- [ ] **Step 3: Commit**

```bash
git add scripts/seed_users.sh
git commit -m "feat(scripts): add create_user to seed_users"
```

---

### Task 7: `main` block

**Files:**
- Modify: `scripts/seed_users.sh`

Wires all functions in order. Uses a `trap` to ensure credentials are cleared even if the script exits unexpectedly.

- [ ] **Step 1: Append the main block at the end of the file**

```bash
main() {
  trap 'unset ADMIN_PASS ADMIN_PASS2 USER_PASS USER_PASS2 ADMIN_TOKEN' EXIT

  collect_credentials
  wait_for_pb
  create_admin
  auth_admin
  create_user

  echo ""
  echo "Setup complete."
}

main
```

- [ ] **Step 2: Verify syntax**

```bash
bash -n scripts/seed_users.sh
```

Expected: no output, exit 0.

- [ ] **Step 3: Commit**

```bash
git add scripts/seed_users.sh
git commit -m "feat(scripts): wire main block in seed_users"
```

---

### Task 8: Integration test against Docker

No automated test framework — verify manually against the running container.

- [ ] **Step 1: Start the container**

```bash
docker compose up -d
```

Wait ~10s for PocketBase to start, then confirm it's healthy:

```bash
curl -s http://localhost:8090/api/health
```

Expected output contains `"code":200`.

- [ ] **Step 2: Run the script**

```bash
./scripts/seed_users.sh
```

Interact with the prompts:
- Admin email: any valid email (e.g. `admin@kura.local`)
- Admin password: ≥ 8 chars (e.g. `adminpass1`)
- User email: any valid email (e.g. `me@kura.local`)
- User password: ≥ 8 chars (e.g. `userpass1`)

Expected output:

```
=== Kura — initial user setup ===

[Admin] Email: admin@kura.local
[Admin] Password:
[Admin] Confirm password:

[User]  Email: me@kura.local
[User]  Password:
[User]  Confirm password:
→ Waiting for PocketBase at http://localhost:8090...
✓ PocketBase is up
✓ Admin created
✓ Personal user created

Setup complete.
```

- [ ] **Step 3: Verify admin exists in PocketBase UI**

Open `http://localhost:8090/_/` in a browser and log in with the admin credentials. Confirm login succeeds.

- [ ] **Step 4: Verify personal user exists**

In the PocketBase admin UI, navigate to Collections → users. Confirm the personal user record appears.

- [ ] **Step 5: Verify re-run fails cleanly**

Run `./scripts/seed_users.sh` again with the same credentials.

Expected: script prints `✗ Admin already configured — run manually if needed.` and exits with code 1.

- [ ] **Step 6: Final commit (if any fixes applied during testing)**

```bash
git add scripts/seed_users.sh
git commit -m "fix(scripts): seed_users integration test fixes"
```

Only run this step if Step 2–5 required changes. Skip if all tests passed without modification.
