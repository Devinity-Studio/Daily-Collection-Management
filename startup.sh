#!/bin/sh
# Idempotent startup script
set -e

PORT=8080
PROJECT_DIR="/run/media/bombuntu/HDD STORAGE 1/DevProject/Daily Collection Management"

if curl -sf "http://127.0.0.1:${PORT}/" > /dev/null 2>&1; then
  echo "App already running on port ${PORT}"
  exit 0
fi

cd "$PROJECT_DIR"
NODE_OPTIONS="--max-old-space-size=4096" nohup npm run dev > /tmp/dcm-dev.log 2>&1 &
echo "Starting dev server on port ${PORT}..."

for i in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:${PORT}/" > /dev/null 2>&1; then
    echo "Dev server ready on port ${PORT}"
    exit 0
  fi
  sleep 1
done

echo "Dev server may not be ready yet, check /tmp/dcm-dev.log"
exit 0
