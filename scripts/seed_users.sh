#!/bin/bash
set -euo pipefail

PB_URL="${PB_URL:-http://localhost:8090}"
declare -i PB_TIMEOUT="${PB_TIMEOUT:-60}"

readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

ok()   { printf "${GREEN}✓${NC} %s\n" "$*"; }
err()  { printf "${RED}✗${NC} %s\n" "$*" >&2; }
info() { printf "${YELLOW}→${NC} %s\n" "$*"; }

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

collect_credentials() {
  echo ""
  echo "=== Kura — initial user setup ==="
  echo ""

  while true; do
    read -rp "[Admin] Email: " ADMIN_EMAIL
    if [[ -z "$ADMIN_EMAIL" ]]; then
      err "Email cannot be empty. Try again."; continue
    fi
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
    if [[ -z "$USER_EMAIL" ]]; then
      err "Email cannot be empty. Try again."; continue
    fi
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

create_admin() {
  local raw http_code body payload
  payload=$(PB_EMAIL="${ADMIN_EMAIL}" PB_PASS="${ADMIN_PASS}" python3 -c \
    "import json,os; d={'email':os.environ['PB_EMAIL'],'password':os.environ['PB_PASS'],'passwordConfirm':os.environ['PB_PASS']}; print(json.dumps(d))")
  raw=$(curl -s -w "\n%{http_code}" -X POST "${PB_URL}/api/collections/_superusers/records" \
    -H "Content-Type: application/json" \
    -d "$payload")
  http_code=$(echo "$raw" | tail -n 1)
  body=$(echo "$raw" | sed '$d')

  case "$http_code" in
    200) ok "Admin created" ;;
    400) err "Admin already configured — run manually if needed."; unset ADMIN_PASS ADMIN_PASS2; exit 1 ;;
    *)   err "Unexpected error creating admin (HTTP ${http_code}): ${body}"; unset ADMIN_PASS ADMIN_PASS2; exit 1 ;;
  esac
}

auth_admin() {
  local raw http_code body payload
  payload=$(PB_EMAIL="${ADMIN_EMAIL}" PB_PASS="${ADMIN_PASS}" python3 -c \
    "import json,os; d={'identity':os.environ['PB_EMAIL'],'password':os.environ['PB_PASS']}; print(json.dumps(d))")
  raw=$(curl -s -w "\n%{http_code}" -X POST "${PB_URL}/api/collections/_superusers/auth-with-password" \
    -H "Content-Type: application/json" \
    -d "$payload")
  http_code=$(echo "$raw" | tail -n 1)
  body=$(echo "$raw" | sed '$d')

  if [[ "$http_code" != "200" ]]; then
    err "Admin authentication failed (HTTP ${http_code}): ${body}"
    unset ADMIN_PASS ADMIN_PASS2
    exit 1
  fi

  ADMIN_TOKEN=$(echo "$body" | python3 -c "import json,sys; print(json.load(sys.stdin)['token'])" 2>/dev/null || true)
  [[ -n "$ADMIN_TOKEN" ]] || { err "Failed to extract token from admin auth response."; exit 1; }
  unset ADMIN_PASS ADMIN_PASS2
}

create_user() {
  local raw http_code body payload
  payload=$(PB_EMAIL="${USER_EMAIL}" PB_PASS="${USER_PASS}" python3 -c \
    "import json,os; d={'email':os.environ['PB_EMAIL'],'password':os.environ['PB_PASS'],'passwordConfirm':os.environ['PB_PASS']}; print(json.dumps(d))")
  raw=$(curl -s -w "\n%{http_code}" -X POST "${PB_URL}/api/collections/users/records" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -d "$payload")
  http_code=$(echo "$raw" | tail -n 1)
  body=$(echo "$raw" | sed '$d')

  unset ADMIN_TOKEN USER_PASS USER_PASS2

  case "$http_code" in
    200) ok "Personal user created" ;;
    400) err "User already exists — run manually if needed."; exit 1 ;;
    *)   err "Unexpected error creating user (HTTP ${http_code}): ${body}"; exit 1 ;;
  esac
}

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
