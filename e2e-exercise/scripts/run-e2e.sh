#!/usr/bin/env bash
# This script is meant to be run from the root of the repo, not from inside the e2e-exercise directory.  
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not running — start Docker Desktop first." >&2
  exit 1
fi

cd "$SCRIPT_DIR/../../app"

cleanup() {
  echo "-> stopping SUT and dependencies"
  # Run from the app directory: this script may be anywhere when the trap fires.
  (cd "$SCRIPT_DIR/../../app" && docker compose --profile e2e down)
}
trap cleanup EXIT

echo "-> [1/3] fresh db-e2e (tmpfs) + Liquibase test data (contexts: e2e, e2e-exercise)"
docker compose up -d --force-recreate --wait db-e2e
npm run db:migrate:e2e-exercise

echo "-> [2/3] build and start the SUT (docker image, not tsx dev)"
docker compose up -d --build --force-recreate --wait app

echo "-> [3/3] Playwright"
cd "$SCRIPT_DIR/.."
npm test
