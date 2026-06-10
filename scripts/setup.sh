#!/bin/bash
set -euo pipefail

POCKETBASE_VERSION="0.27.1"

OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$ARCH" in
  x86_64)           ARCH="amd64" ;;
  aarch64|arm64)    ARCH="arm64" ;;
  *)  echo "Unsupported architecture: $ARCH"; exit 1 ;;
esac

case "$OS" in
  linux)  ;;
  darwin) ;;
  *)  echo "Unsupported OS: $OS"; exit 1 ;;
esac

URL="https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_${OS}_${ARCH}.zip"

echo "Downloading PocketBase ${POCKETBASE_VERSION} for ${OS}/${ARCH}..."
curl -fL "$URL" -o pocketbase.zip
unzip -o pocketbase.zip pocketbase
rm pocketbase.zip
chmod +x pocketbase
echo "Done. Run './pocketbase serve' to start."
