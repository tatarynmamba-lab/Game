#!/usr/bin/env sh
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "Install Node.js, then run this file again. See README.md."
  exit 1
fi
node server.js --open
