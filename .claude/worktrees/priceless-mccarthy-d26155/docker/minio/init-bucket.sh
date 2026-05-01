#!/bin/sh
set -e
n=0
while ! mc alias set local http://minio:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}"; do
  n=$((n + 1))
  if [ "$n" -ge 60 ]; then
    echo "MinIO did not become ready in time" >&2
    exit 1
  fi
  sleep 2
done
mc mb local/payload-media --ignore-existing
mc anonymous set download local/payload-media
