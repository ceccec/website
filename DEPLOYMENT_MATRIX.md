# Deployment Matrix: Platform Feature Support

**Date:** May 1, 2026  
**Purpose:** Document which features are available on each deployment platform  
**Reference:** Phase 5 - Deployment Portability

---

## Platform Support Overview

| Dimension | Cloudflare | Vercel | Docker |
|-----------|-----------|--------|--------|
| **Primary Language** | Workers Runtime | Node.js | Node.js (container) |
| **Best For** | Edge computing, global scale | Serverless, API routes | Self-hosted, development |
| **Database** | D1 (SQLite) | Postgres / MongoDB | MongoDB / Postgres (local) |
| **Object Storage** | R2 | Vercel Blob / S3 | MinIO / Local filesystem |
| **Caching** | Durable Objects + KV | Redis / In-memory | In-memory / Redis |
| **Sessions** | KV | Redis / Postgres | In-memory / Redis |
| **Environment** | Secure, isolated | Managed, scalable | Full control |

---

## Feature Availability by Platform

### Core Features (Available Everywhere)

✅ All core features work on **every** platform with automatic fallback:

| Feature | Status | Notes |
|---------|--------|-------|
| Payload CMS | ✅ Full | Admin UI, API, hooks |
| Next.js App | ✅ Full | Server components, API routes |
| Authentication | ✅ Full | Cookies, JWT, OAuth |
| File Uploads | ✅ Full | Auto-selects best backend |
| Image Optimization | ✅ Full | Auto-selects best transformer |
| Cache Invalidation | ✅ Full | Auto-selects backend |
| Database Queries | ✅ Full | Via Payload adapters |

### Platform-Specific Features

#### 🔴 Cloudflare Workers

**✅ Enabled (Native Support)**
| Feature | Service | Performance |
|---------|---------|-------------|
| Object Storage | R2 | ⭐⭐⭐⭐⭐ Fast |
| Database | D1 (SQLite) | ⭐⭐⭐⭐ Very Fast |
| Cache Invalidation | Durable Objects | ⭐⭐⭐⭐⭐ Instant |
| Key-Value Storage | KV | ⭐⭐⭐⭐⭐ Instant |
| Image Optimization | CF Images | ⭐⭐⭐⭐⭐ On-edge |
| Edge Caching | CF Cache | ⭐⭐⭐⭐⭐ Global |
| Analytics | CF Analytics Engine | ⭐⭐⭐⭐ Real-time |
| CRON Jobs | Scheduled handlers | ✅ Supported |

**⚠️ Degraded (Falls Back)**
| Feature | Fallback | Performance |
|---------|----------|-------------|
| MongoDB | Not available | ❌ N/A |
| Postgres | Not available | ❌ N/A |

---

#### 🟢 Vercel

**✅ Enabled (Native Support)**
| Feature | Service | Performance |
|---------|---------|-------------|
| Object Storage | Vercel Blob (default) | ⭐⭐⭐⭐ Fast |
| Object Storage | S3 / S3-compatible | ⭐⭐⭐⭐ Fast (if configured) |
| Database | Postgres (Vercel Postgres) | ⭐⭐⭐⭐ Very Fast |
| Database | MongoDB Atlas | ⭐⭐⭐ Standard |
| Session Storage | Redis / Upstash | ⭐⭐⭐⭐ Fast (if configured) |
| Image Optimization | Next.js API Routes | ⭐⭐⭐⭐ Fast |
| CRON Jobs | Vercel Cron | ✅ Supported |
| Edge Functions | Vercel Edge | ⭐⭐⭐⭐ Ultra-fast |
| Webhooks | Vercel Webhooks | ✅ Supported |

**⚠️ Degraded (In-Memory Fallback)**
| Feature | Fallback | Performance |
|---------|----------|-------------|
| KV Storage | Redis (if available) | ⭐⭐ Memory leak |
| Cache Tag Storage | In-memory | ⭐ Lost on restart |
| Analytics Engine | None | ❌ N/A |

**❌ Not Available**
| Feature | Reason |
|---------|--------|
| R2 Storage | Cloudflare-only |
| D1 Database | Cloudflare-only |
| Durable Objects | Cloudflare-only |
| CF Analytics Engine | Cloudflare-only |

---

#### 🟡 Docker (Self-Hosted)

**✅ Enabled (With Configuration)**
| Feature | Service | Setup |
|---------|---------|-------|
| Object Storage | MinIO | Via docker-compose |
| Object Storage | Local filesystem | Automatic fallback |
| Object Storage | S3 / S3-compatible | Via env variables |
| Database | MongoDB | Via docker-compose |
| Database | Postgres | Via docker-compose |
| Session Storage | Redis | Via docker-compose |
| Cache Invalidation | In-memory | Automatic |
| Image Optimization | Next.js API Routes | Built-in |
| Full Control | Everything | Via compose/config |

**⚠️ Degraded (In-Memory Fallback)**
| Feature | Fallback | Notes |
|---------|----------|-------|
| File Storage | Local filesystem | Limited by disk |
| Session Storage | In-memory | Lost on restart |
| Cache Tags | In-memory | Lost on restart |

**❌ Not Available**
| Feature | Reason |
|---------|--------|
| Cloudflare services | Runtime incompatible |
| Vercel-specific APIs | Runtime incompatible |
| Edge Functions | Need Vercel/CF |

---

## Feature Degradation Strategy

### Graceful Degradation Pattern

When a feature's primary backend is unavailable, the system:

1. **Detects unavailability** via `capabilities.ts`
2. **Logs a warning** (visible in logs, not blocking)
3. **Falls back silently** to next-best option
4. **Continues operating** without crashing

```typescript
// Example: Cache invalidation
if (capabilities.d1Database) {
  // Use Cloudflare D1 for persistent cache
  await d1Backend.invalidate(tag)
} else if (capabilities.postgresDatabase) {
  // Fallback to Postgres
  await postgresBackend.invalidate(tag)
} else {
  // Fallback to in-memory (warning logged)
  await memoryBackend.invalidate(tag)
}
```

### Fallback Chain per Service

**Object Storage**
```
R2 (CF) → Vercel Blob → S3 / S3-compatible → Local filesystem
```

**Database**
```
D1 (CF) → Postgres → MongoDB → Error (required)
```

**Cache Tags**
```
D1 (CF) → Postgres → Redis → In-memory (with warning)
```

**Sessions**
```
KV (CF) → Redis → In-memory (with warning)
```

**Image Optimization**
```
CF Images (CF) → Next.js (built-in) → Passthrough URL
```

---

## Configuration by Deployment

### Cloudflare Workers (wrangler.toml)

```toml
[[env.production.bindings.d1_databases]]
binding = "D1"
database_name = "prod_db"
database_id = "..."

[env.production.env]
BUCKET_URL = "https://bucket.r2.cloudflarestorage.com"

[env.production.r2_buckets]
bucket_name = "website-media"
```

**Environment Variables Required:**
- `STRIPE_SECRET_KEY`
- `PAYLOAD_SECRET`

---

### Vercel (vercel.json + .env)

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "env": {
    "PAYLOAD_HOSTING": { "value": "vercel" },
    "NEXT_PUBLIC_IS_LIVE": { "value": "true" }
  }
}
```

**Environment Variables Required:**
- `POSTGRES_URL` or `MONGODB_URL` (database)
- `BLOB_READ_WRITE_TOKEN` (Vercel Blob)
- `STRIPE_SECRET_KEY`
- `PAYLOAD_SECRET`

---

### Docker (docker-compose.yml)

```yaml
services:
  app:
    build: .
    environment:
      PAYLOAD_HOSTING: docker
      DATABASE_URL: mongodb://mongo:27017/payload
      REDIS_URL: redis://redis:6379
  mongo:
    image: mongo:latest
  redis:
    image: redis:latest
  minio:
    image: minio/minio:latest
    # For S3-compatible storage
```

**Environment Variables:**
- `DATABASE_URL` (mongo or postgres)
- `REDIS_URL` (optional, for sessions/caching)
- `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
- `PAYLOAD_SECRET`

---

## Performance Characteristics

### Latency (p50, in ms)

| Operation | Cloudflare | Vercel | Docker (Local) |
|-----------|-----------|--------|----------|
| Database query | 1-5 | 5-15 | 1-2 |
| File upload | 10-50 | 20-100 | 5-20 |
| Cache invalidation | <1 | 10-50 | <1 |
| Image transform | 50-200 | 100-500 | 200-1000 |
| KV/Redis get | 1-5 | 5-20 | <1 |

### Throughput (requests/sec)

| Feature | Cloudflare | Vercel | Docker |
|---------|-----------|--------|--------|
| API endpoints | 10,000+ | 1,000+ | Unlimited* |
| Concurrent connections | 50,000 | 100 | Unlimited* |
| Storage bandwidth | 100 Mbps+ | 100 Mbps+ | Unlimited* |

*Limited by hardware/infrastructure

---

## Migration Guide

### From Cloudflare to Vercel

1. Migrate database from D1 to Postgres
2. Set `PAYLOAD_HOSTING=vercel`
3. Set `POSTGRES_URL` or `MONGODB_URL`
4. Configure `BLOB_READ_WRITE_TOKEN` for Vercel Blob
5. Deploy: `vercel deploy`

✅ All features continue working automatically

### From Vercel to Docker

1. Set up docker-compose with MongoDB + Redis + MinIO
2. Set `PAYLOAD_HOSTING=docker`
3. Set `DATABASE_URL=mongodb://mongo:27017/payload`
4. Set S3 variables (optional, for file storage)
5. Run: `docker-compose up`

✅ All features continue working automatically

### From Cloudflare to Docker

1. Export data from D1
2. Set up docker-compose with Postgres
3. Import data
4. Set `PAYLOAD_HOSTING=docker`
5. Set `DATABASE_URL=postgres://...`
6. Run: `docker-compose up`

✅ All features continue working automatically

---

## Monitoring & Debugging

### Check Available Capabilities

```typescript
import { logCapabilities, getCapabilitySummary } from '@lib/capabilities'

// Log all detected capabilities
logCapabilities()

// Get summary string for errors
const summary = getCapabilitySummary()
console.log(`Running on ${summary}`)
```

### Monitor Service Health

```typescript
import { getCacheStats } from '@lib/cache'
import { getStorageStats } from '@lib/storage'

const cacheStats = await getCacheStats()
const storageStats = await getStorageStats()

console.log(`Cache: ${cacheStats.totalEntries} entries`)
console.log(`Storage: ${storageStats.totalObjects} objects`)
```

---

## Best Practices by Platform

### Cloudflare

- Use D1 for transactional data (guaranteed strong consistency)
- Use KV for session storage (instant availability globally)
- Use R2 for media (replicated globally)
- Enable CF Image Optimization in zone settings

### Vercel

- Use Postgres for relational data (ACID guarantees)
- Use MongoDB for flexibility
- Use Vercel Blob for media (integrated billing)
- Use Redis for high-speed caching (if needed)

### Docker

- Use MongoDB for development speed
- Use MinIO for S3-compatible storage
- Use Redis for multi-container coordination
- Use in-memory caching for single-container setups

---

## Troubleshooting

### "Capability X not available"

Check what capabilities are detected:
```bash
# In your app
import { logCapabilities } from '@lib/capabilities'
logCapabilities()

# Check logs
grep "Unavailable:" logs
```

### "Feature fell back to in-memory storage"

Add required service to your deployment:
- Cloudflare: Enable R2 binding
- Vercel: Set `BLOB_READ_WRITE_TOKEN`
- Docker: Add MinIO service or local volume

### "Cache invalidation not persisting"

Cache is in-memory (lost on restart). Options:
- Add D1 binding (Cloudflare)
- Add Postgres (Vercel/Docker)
- Add Redis (Vercel/Docker)

---

**Version:** 1.0 | Last updated: May 1, 2026 | Phase 5 in progress
