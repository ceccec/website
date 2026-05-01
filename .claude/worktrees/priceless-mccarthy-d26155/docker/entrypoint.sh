#!/bin/sh
set -e

SOCKET="${LISTEN_UNIX_SOCKET:-/run/payload/next.sock}"
SOCKET_DIR=$(dirname "$SOCKET")

mkdir -p "$SOCKET_DIR"
chown node:node "$SOCKET_DIR" 2>/dev/null || true
chmod 775 "$SOCKET_DIR" 2>/dev/null || true

# Wait for MongoDB when compose brings stacks up (mongoose connects here).
runuser -u node -g node -- sh -c 'cd /app && pnpm exec payload migrate'

exec runuser -u node -g node -- /usr/bin/dumb-init -- node /app/scripts/next-start-unix.mjs
