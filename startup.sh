#!/bin/sh
# Startup script for the dev server
set -e

# If already healthy, do nothing
if curl -sf http://127.0.0.1:8080/ > /dev/null 2>&1; then
  echo "Server already running on port 8080"
  exit 0
fi

npm run dev > /tmp/dcm-dev.log 2>&1 &

# Wait for server to be ready (max 30s)
for i in $(seq 1 30); do
  if curl -sf http://127.0.0.1:8080/ > /dev/null 2>&1; then
    echo "Server started on port 8080"
    exit 0
  fi
  sleep 1
done

echo "Server did not start in 30s"
exit 1
