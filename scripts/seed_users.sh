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
