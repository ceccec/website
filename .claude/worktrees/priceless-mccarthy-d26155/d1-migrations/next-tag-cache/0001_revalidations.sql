-- OpenNext D1NextModeTagCache (`NEXT_TAG_CACHE_D1`)
-- https://opennext.js.org/cloudflare/caching#tag-cache-for-on-demand-revalidation
CREATE TABLE IF NOT EXISTS revalidations (
  tag TEXT NOT NULL PRIMARY KEY,
  revalidatedAt INTEGER NOT NULL,
  stale INTEGER,
  expire INTEGER
);
