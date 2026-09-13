#!/usr/bin/env bash
# Convenience wrapper so `dev`, `build`, `start` pick up workspace packages
# and environment variables from DRY sources.

set -euo pipefail

cd "$(dirname "$0")"

# Load root .env and app .env if present.
if [ -f ../../.env ]; then
  set -a
  # shellcheck disable=SC1091
  source ../../.env
  set +a
fi
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi
if [ -f .env.local ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:3001/api}"

exec "$@"