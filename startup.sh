#!/bin/sh
# Idempotent startup script (works from any checkout location)
set -e

PORT=8080
ROOT="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"

if curl -sf "http://127.0.0.1:${PORT}/" > /dev/null 2>&1; then
  echo "App already running on port ${PORT}"
  exit 0
fi

cd "$ROOT"
NODE_OPTIONS="--max-old-space-size=4096" nohup npm run dev > "$ROOT/.dev-server.log" 2>&1 &
echo "Starting dev server on port ${PORT}..."

for i in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:${PORT}/" > /dev/null 2>&1; then
    echo "Dev server ready on port ${PORT}"
    exit 0
  fi
  sleep 1
done

echo "Dev server may not be ready yet, check .dev-server.log"
exit 0
