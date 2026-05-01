# Architecture & Design

**Version:** 2.0  
**Last Updated:** May 2026  
**Framework:** Next.js 16 + Payload CMS 3.84

---

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [Core Principles](#core-principles)
3. [System Architecture](#system-architecture)
4. [Data Flow](#data-flow)
5. [Service Abstractions](#service-abstractions)
6. [Deployment Architecture](#deployment-architecture)
7. [API Design](#api-design)
8. [Performance Considerations](#performance-considerations)
9. [Scaling Strategy](#scaling-strategy)

---

## High-Level Overview

### What This Application Does

A **content management platform** built on Payload CMS with multi-platform deployment support (Cloudflare Workers, Vercel, Docker).

**Key Features:**
- Content management (pages, posts, products, etc.)
- User authentication & authorization
- Payment processing (Stripe, Revolut)
- File storage (R2, Vercel Blob, S3, local)
- Image optimization (Cloudflare, Next.js)
- Multi-tenant support
- Search (Algolia)
- Email delivery (SendGrid, Nodemailer)

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16 + React 19 | Server-side rendering, API routes |
| Backend | Payload CMS 3.84 | Headless CMS, API, admin UI |
| Database | PostgreSQL, MongoDB, SQLite (D1) | Data persistence |
| Cache | Redis, D1, in-memory | Performance optimization |
| Storage | R2, Vercel Blob, S3, local FS | File storage |
| Images | Cloudflare, Next.js Image | Image optimization |
| Payments | Stripe, Revolut | Payment processing |
| Search | Algolia | Full-text search |
| Deployment | Cloudflare, Vercel, Docker | Infrastructure |

---

## Core Principles

### Rule 1: Local API (Server Actions)
Avoid HTTP round-trips for internal communication. Use Next.js Server Actions instead of fetch() to Payload API.

```typescript
// ✅ Good: Direct server-to-server
const payload = await getPayload()
const user = await payload.findByID({ collection: 'users', id })

// ❌ Avoid: HTTP round-trip
const response = await fetch('/api/users/{id}')
```

### Rule 2: Payload CMS as Source of Truth
All business entities originate in Payload CMS. Derived data (cache, search, analytics) syncs from Payload.

```
Payload CMS (Source)
    ↓
  Cache
  Search Index
  Analytics
  Third-party services
```

### Rule 3: Abstraction Layers
Abstract platform-specific implementations (cache, storage, images) behind interfaces. Enable multi-platform deployment without code changes.

```typescript
// Abstract interface
interface CacheBackend {
  get(key: string): Promise<any>
  set(key: string, value: any): Promise<void>
}

// Multiple implementations
- MemoryCacheBackend (testing)
- RedisCacheBackend (production)
- D1CacheBackend (Cloudflare)
- PostgresCacheBackend (self-hosted)
```

### Rule 4: Type Safety at Boundaries
All external inputs (API, webhooks, user input) validated and typed. No unvalidated data enters business logic.

```typescript
// Input validation
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
})
const validated = schema.parse(input) // Throws if invalid

// Type-safe Payload
const user: Payload['users'] = await payload.create({...})
```

### Rule 5: Cache Smart
Use versioned cache tags (uuidTags) for granular invalidation. Reduces cache misses without manual purges.

```typescript
// Specific invalidation
uuidTags.user(userId)              // Invalidates user:uuid-xxx
uuidTags.collectionSlug(coll, slug) // Invalidates collection:slug:uuid-xxx
uuidTags.tenantsPublicSite(tenantId) // Invalidates tenant:public:uuid-xxx
```

### Rule 6: Graceful Degradation
When services fail (cache, storage, images), system continues with fallbacks.

```typescript
// Fallback chain
Cache: Redis → D1 → Postgres → Memory

Storage: R2 → Blob → S3 → Local FS → Memory

Images: Cloudflare → Next.js → Passthrough
```

### Rule 7: Observability First
Every operation logged, metrics tracked, errors traceable.

```typescript
logger.info('User created', { userId, email })
logger.error('Payment failed', error, { orderId }, { severity: 'high' })
metrics.recordHistogram('db_query_duration_ms', 45)
```

### Rule 8: Multi-Platform Parity
Same code runs on Cloudflare, Vercel, Docker without modification. Config and environment variables control behavior.

### Rule 9: Production Excellence
Code in production is production-tested. Security hardened, observable, performant, documented.

---

## System Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Browser / Client                      │
│                  (Next.js Pages/UI)                      │
└────────┬────────────────────────────────────┬────────────┘
         │ HTTPS/TLS                          │
         │                                    │
┌────────▼────────────────────────────────────▼────────────┐
│              Edge / CDN Layer                             │
│          (Cloudflare / Vercel / Docker)                  │
│  - Static asset caching                                  │
│  - DDoS protection                                       │
│  - WAF rules                                             │
└────────┬──────────────────────────────────────┬──────────┘
         │                                      │
┌────────▼──────────────────────────────────────▼──────────┐
│            Application Layer (Next.js)                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │  API Routes (/api/*)                             │   │
│  │  - Request validation                            │   │
│  │  - Authentication checks                         │   │
│  │  - Rate limiting                                 │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Server Components / Actions                     │   │
│  │  - Direct Payload calls (Local API Rule 1)      │   │
│  │  - Cache interaction                             │   │
│  │  - Storage operations                            │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Middleware                                      │   │
│  │  - Security headers                              │   │
│  │  - Request logging                               │   │
│  │  - User context extraction                       │   │
│  └──────────────────────────────────────────────────┘   │
└────────┬──────────────────────────────────────┬──────────┘
         │                                      │
    ┌────▼──────────┐               ┌──────────▼─────┐
    │  Cache Layer  │               │  Storage Layer │
    │               │               │                │
    │  - Redis      │               │  - R2          │
    │  - D1 SQLite  │               │  - Blob        │
    │  - Postgres   │               │  - S3          │
    │  - Memory     │               │  - Local FS    │
    └────┬──────────┘               └──────────┬─────┘
         │                                      │
┌────────▼──────────────────────────────────────▼──────────┐
│         Payload CMS (Business Logic)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Collections (Source of Truth)                   │   │
│  │  - Users, teams, projects, deployments           │   │
│  │  - Content, pages, posts, products               │   │
│  │  - Webhooks, events                              │   │
│  │  - Access control (RBAC)                         │   │
│  └──────────────────────────────────────────────────┘   │
└────────┬──────────────────────────────────────┬──────────┘
         │                                      │
┌────────▼────────────────────────────────────┬▼─────────┐
│         Persistent Data Layer               │          │
│  - PostgreSQL (production)        │  Backups         │
│  - MongoDB (alternative)          │  & Recovery      │
│  - SQLite (D1, development)       │                  │
└─────────────────────────────────────────────┴──────────┘

    Synced From Payload              External Services
         │                            ├─ Stripe (payments)
         │                            ├─ Algolia (search)
         ├─ Redis Cache               ├─ SendGrid (email)
         ├─ Search Index              ├─ Sentry (errors)
         ├─ Analytics                 └─ Datadog (monitoring)
         └─ Webhooks to 3rd-party
```

---

## Data Flow

### User Authentication Flow

```
1. User submits credentials
   ↓
2. API route receives request
   ↓
3. Middleware: CORS, rate limit, security headers
   ↓
4. Request handler validates input
   ↓
5. Payload.auth() verifies credentials
   ↓
6. Session created, httpOnly cookie set
   ↓
7. Response: User object + Set-Cookie header
   ↓
8. Browser stores cookie
   ↓
9. Subsequent requests include cookie
   ↓
10. Middleware extracts user from request.auth
```

### Content Publishing Flow

```
1. Admin creates/edits content in Payload UI
   ↓
2. Payload validates and saves to database
   ↓
3. Webhook triggered: "content.published"
   ↓
4. Webhook handler:
   ├─ Invalidate cache: uuidTags.collectionSlug(collection, slug)
   ├─ Sync to Algolia: Search index updated
   ├─ Generate preview: Screenshot/thumbnail
   └─ Notify subscribers: Email, Slack, etc.
   ↓
5. Next.js receives cache invalidation
   ↓
6. On next request to /content/{slug}:
   ├─ Cache miss (invalidated)
   ├─ Query Payload for latest content
   ├─ Re-render page with new data
   └─ Set cache TTL
   ↓
7. Subsequent requests: Cache hit (1 hour or until next invalidation)
```

### Payment Flow

```
1. User initiates checkout
   ↓
2. API route receives {priceId, plan, successUrl, cancelUrl}
   ↓
3. Auth check: Verify user authenticated
   ↓
4. User validation: Fetch from Payload
   ↓
5. Stripe/Revolut API call: createCheckoutSession()
   ↓
6. Return: Redirect URL
   ↓
7. Browser redirects to payment provider
   ↓
8. User completes payment
   ↓
9. Payment provider webhook: POST /api/webhooks/stripe
   ↓
10. Webhook handler:
    ├─ Verify webhook signature
    ├─ Update Payload user: stripeCustomerId, subscription
    ├─ Create subscription record
    ├─ Send confirmation email
    └─ Invalidate user cache
    ↓
11. Redirect to successUrl
```

---

## Service Abstractions

### Cache Abstraction

**Interface:** `src/lib/cache/index.ts`

```typescript
interface CacheBackend {
  get(key: string): Promise<T | null>
  set(key: string, value: T, ttl?: number): Promise<void>
  invalidate(tag: string): Promise<void>
  invalidateMany(tags: string[]): Promise<void>
  clear(): Promise<void>
  getStats(): Promise<{totalEntries, totalSize}>
}
```

**Implementations:**
- MemoryCacheBackend (testing)
- D1CacheBackend (Cloudflare)
- PostgresCacheBackend (self-hosted)
- RedisCacheBackend (high-performance)

**Selection Logic:** `src/plugins/payload-runtime/getPayload.ts`
```
if (hasCapability('redis')) → RedisCacheBackend
else if (hasCapability('postgres')) → PostgresCacheBackend
else if (hasCapability('d1Database')) → D1CacheBackend
else → MemoryCacheBackend
```

### Storage Abstraction

**Interface:** `src/lib/storage/index.ts`

```typescript
interface StorageBackend {
  exists(key: string): Promise<boolean>
  get(key: string): Promise<Buffer | null>
  put(key: string, data: Buffer | string): Promise<{url: string}>
  delete(key: string): Promise<void>
  list(prefix?: string): Promise<string[]>
  getPublicUrl(key: string): Promise<string>
  getSignedUrl(key: string, expirationSeconds?): Promise<string>
  getStats(): Promise<{totalObjects, totalSize}>
}
```

**Implementations:**
- MemoryStorageBackend (testing)
- R2StorageBackend (Cloudflare)
- VercelBlobStorageBackend (Vercel)
- S3StorageBackend (AWS, MinIO, DigitalOcean)
- LocalStorageBackend (Docker)

### Image Optimization Abstraction

**Interface:** `src/lib/images/index.ts`

```typescript
interface ImageTransformer {
  transform(url: string, options?: ImageTransformOptions): string
  canOptimize(url: string): boolean
  getName(): string
}
```

**Implementations:**
- NextjsImageTransformer (default)
- CloudflareImageTransformer (Workers)
- PassthroughImageTransformer (fallback)

---

## Deployment Architecture

### Multi-Platform Support

```
Same Code
    ↓
    ├─→ Cloudflare Workers
    │   ├─ Cache: D1
    │   ├─ Storage: R2
    │   ├─ Images: Cloudflare
    │   └─ Database: D1 or Postgres
    │
    ├─→ Vercel
    │   ├─ Cache: Redis or in-memory
    │   ├─ Storage: Vercel Blob or S3
    │   ├─ Images: Next.js
    │   └─ Database: Postgres or MongoDB
    │
    └─→ Docker (Self-Hosted)
        ├─ Cache: Redis or Postgres
        ├─ Storage: S3 or local FS
        ├─ Images: Next.js
        └─ Database: Postgres or MongoDB
```

### Environment Detection

**File:** `src/lib/capabilities.ts`
```typescript
detectCapabilities(bindings, env) {
  return {
    isCloudflare: hasCloudflarBindings(),
    isVercel: process.env.VERCEL_ENV !== undefined,
    isDocker: !isCloudflare && !isVercel,
    
    postgresDatabase: !!env.DATABASE_URL?.startsWith('postgres'),
    mongodbDatabase: !!env.DATABASE_URL?.startsWith('mongodb'),
    d1Database: !!bindings.D1,
    
    r2Storage: !!bindings.R2,
    vercelBlob: !!env.BLOB_READ_WRITE_TOKEN,
    s3Storage: !!env.S3_BUCKET,
    
    redisCache: !!env.REDIS_URL,
    // ... more capabilities
  }
}
```

---

## API Design

### REST API Endpoints

All REST endpoints follow RESTful conventions:

```
GET    /api/users              List users (paginated)
GET    /api/users/{id}         Get single user
POST   /api/users              Create user
PUT    /api/users/{id}         Update user
DELETE /api/users/{id}         Delete user

GET    /api/users/{id}/posts   List user's posts
```

### GraphQL API

Payload CMS exposes GraphQL schema:

```graphql
query GetUser($id: String!) {
  User(id: $id) {
    id
    email
    name
    posts {
      edges { node { id, title, slug } }
    }
  }
}
```

### Server Actions

Prefer Server Actions over HTTP for internal calls:

```typescript
// server-actions.ts
'use server'

export async function createUser(formData: FormData) {
  const payload = await getPayload()
  const email = formData.get('email')
  
  return payload.create({
    collection: 'users',
    data: { email }
  })
}
```

### Webhook Endpoints

System webhooks trigger on Payload CMS events:

```
POST /api/webhooks/stripe       Payment events
POST /api/webhooks/algolia      Search sync
POST /api/webhooks/email        Email delivery events
```

---

## Performance Considerations

### Caching Strategy

**Cache Layers:**

1. **Browser Cache** (HTTP headers)
   - Static assets: 1 year
   - HTML pages: 1 hour
   - API responses: Conditional (ETags)

2. **CDN Cache** (Cloudflare/Vercel)
   - Static: 1 year
   - Dynamic: 5 minutes
   - Headers control granularity

3. **Application Cache** (Redis/D1)
   - User data: 24 hours
   - Content: Until invalidated
   - API responses: 1 hour
   - Search results: 1 day

4. **Database Query Cache**
   - Frequently accessed collections
   - Popular filters
   - Aggregations

### Query Optimization

**Payload Depth Control:**
```typescript
// ❌ Bad: N+1 queries
const users = await payload.find({ collection: 'users' })

// ✅ Good: Specify depth
const users = await payload.find({
  collection: 'users',
  depth: 0,  // No relationship population
  select: { email: true, id: true }  // Only needed fields
})
```

### Bundle Size Optimization

- Code splitting by route
- Dynamic imports for heavy dependencies
- Tree-shaking (ES modules)
- CSS-in-JS minimization
- Image optimization (WebP, responsive sizes)

---

## Scaling Strategy

### Horizontal Scaling

**Stateless Application:**
- No local file storage
- No local cache
- Session stored in Redis
- Configuration from environment

**Load Balancing:**
- Multiple application instances
- Shared database (Postgres)
- Shared cache (Redis)
- Shared storage (R2, S3)

### Database Scaling

**Optimization:**
- Connection pooling
- Read replicas for queries
- Write replica for mutations
- Index hot queries
- Archive old data

**Backup & Recovery:**
- Automated daily backups
- Point-in-time recovery
- Replication to secondary region

### Cache Scaling

**Redis Sentinel:**
- High availability
- Automatic failover
- Monitoring and alerts

**Cache Invalidation:**
- Versioned tags (uuidTags)
- Event-based invalidation
- TTL-based expiration

---

## Next Steps

1. Review specific modules: See `PHASE_5_DEPLOYMENT_PORTABILITY.md`
2. Contributing guidelines: See `CONTRIBUTING.md`
3. Operations guide: See `OPERATIONS.md`
4. API documentation: See `API.md`

---

**Maintained By:** Core Team  
**Last Reviewed:** May 2026
