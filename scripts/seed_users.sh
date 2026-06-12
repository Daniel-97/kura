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
