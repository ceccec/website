# Phase 5: Deployment Portability

**Date:** May 1, 2026  
**Status:** In Progress  
**Purpose:** Ensure codebase runs independently of Cloudflare while optionally leveraging Cloudflare for enhanced features  
**Architecture Rule:** Rule 8 (Multi-platform Support)

---

## Current State: Tightly Coupled to Cloudflare

### Cloudflare Bindings Used
- **R2** (`NEXT_INC_CACHE_R2_BUCKET`) — Next.js incremental static regeneration cache
- **D1** (`NEXT_TAG_CACHE_D1`) — Next.js tag cache for revalidation
- **Durable Objects** (`NEXT_CACHE_DO_QUEUE`) — Cache invalidation queue
- **Images** (`IMAGES`) — Image optimization and transformation
- **Assets** (`ASSETS`) — Static asset serving
- **Worker Self-Reference** — Inter-worker communication

### Runtime Detection
- `src/lib/deploymentTarget.ts` — Detects Cloudflare vs Vercel vs Docker
- Used to conditionally load features and configure services

---

## Problem: Platform Lock-in

**Current Issues:**
1. **Required Cloudflare bindings** — Application fails if bindings missing
2. **No graceful degradation** — Features fail hard instead of disabling
3. **Tightly coupled imports** — Cloudflare code mixed with platform-agnostic code
4. **Unclear fallbacks** — No documented alternative for each Cloudflare feature

**Impact:**
- Can't deploy to Docker without Cloudflare Workers runtime
- Can't test R2/D1 functionality locally without proper emulation
- Hard to contribute (local dev requires specific setup)
- Difficult to migrate to different infrastructure

---

## Solution: Feature Flags + Conditional Imports

### Phase 5: Deployment Portability

**Target State:** Application runs on any platform with graceful feature degradation

```
┌─────────────────────────────────────────────────────────┐
│ App (Platform-Agnostic)                                 │
├─────────────────────────────────────────────────────────┤
│ Feature Flags + Capability Detection                    │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Cloudflare   │  │   Vercel     │  │    Docker    │  │
│  │  (R2, D1,    │  │  (Postgres,  │  │  (MongoDB,   │  │
│  │  DO, Images) │  │   Blob)      │  │  MinIO)      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Strategy

### Step 1: Audit Runtime Dependencies (1 hour)
Find all Cloudflare-specific code:
- R2 usage for Next.js caching
- D1 database queries
- Durable Objects for cache invalidation
- Image optimization
- KV for sessions/state

**Command:**
```bash
grep -r "env\\.R2\|env\\.D1\|env\\.KV\|IMAGES\|WORKER_SELF" src/ --include="*.ts" --include="*.tsx"
```

### Step 2: Create Feature Flags System (1.5 hours)

**File:** `src/lib/capabilities.ts`
```typescript
interface PlatformCapabilities {
  // Object storage
  r2Storage: boolean
  // Database cache
  d1Cache: boolean
  // Cache invalidation queue
  durableObjectsQueue: boolean
  // Image optimization
  imageOptimization: boolean
  // Session storage
  kvStorage: boolean
  // Features enabled on this platform
  analytics: boolean
  realTimeSearch: boolean
}

export function detectCapabilities(env: CloudflareEnv | VercelEnv | DockerEnv): PlatformCapabilities
export function hasCapability(capability: keyof PlatformCapabilities): boolean
```

### Step 3: Create Abstraction Layers (2.5 hours)

**1. Object Storage Abstraction** (`src/plugins/storage/index.ts`)
```typescript
interface StorageProvider {
  get(key: string): Promise<unknown>
  put(key: string, value: unknown): Promise<void>
  delete(key: string): Promise<void>
}

// Implementations:
// - CloudflareR2Storage
// - VercelBlobStorage  
// - LocalFileStorage (Docker)
```

**2. Cache Backend Abstraction** (`src/plugins/caching/index.ts`)
```typescript
interface CacheBackend {
  get(tag: string): Promise<Date | null>
  set(tag: string, value: Date): Promise<void>
  invalidate(tag: string): Promise<void>
}

// Implementations:
// - D1CacheBackend (Cloudflare)
// - PostgresCacheBackend (Vercel)
// - InMemoryCacheBackend (Docker/Dev)
```

**3. Image Optimization Abstraction** (`src/plugins/images/index.ts`)
```typescript
interface ImageTransformer {
  transform(url: string, options: ImageOptions): string
}

// Implementations:
// - CloudflareImageTransformer
// - NextjsImageOptimizer (default)
// - PassthroughTransformer (direct URL)
```

### Step 4: Update Runtime Initialization (1 hour)

**File:** `src/plugins/payload-runtime/getPayload.ts`
- Detect platform capabilities on init
- Load conditional providers based on available services
- Handle missing optional services gracefully

```typescript
const capabilities = detectCapabilities(env)
const payload = await getPayload()

if (capabilities.d1Cache) {
  // Use D1 for cache invalidation
  initializeD1CacheBackend(env.D1)
} else if (env.DATABASE_URL) {
  // Fallback to Postgres
  initializePostgresCacheBackend(env.DATABASE_URL)
} else {
  // Fallback to in-memory (development only)
  console.warn('No cache backend configured; using in-memory cache (data lost on restart)')
  initializeMemoryCacheBackend()
}
```

### Step 5: Document Platform Support Matrix (45 minutes)

**File:** `DEPLOYMENT_MATRIX.md`

| Feature | Cloudflare | Vercel | Docker | Fallback |
|---------|-----------|--------|--------|----------|
| Object Storage (R2) | ✅ Native | Via Blob | MinIO | File system |
| Cache Invalidation (D1) | ✅ Native | Via Postgres | MongoDB | In-memory |
| Cache Queue (DO) | ✅ Native | Redis | Redis | Sync process |
| Image Optimization | ✅ CF Images | Next.js | Next.js | URL pass-through |
| Session Storage (KV) | ✅ Native | Redis | Redis | In-memory |

### Step 6: Test Deployment Paths (2 hours)

**Docker Standalone:**
```bash
# Build without Cloudflare bindings
docker build -f Dockerfile --build-arg PAYLOAD_HOSTING=docker .
docker-compose up

# Verify without R2/D1/KV available
# Features should gracefully degrade
```

**Vercel-Only:**
```bash
# Build with Postgres, no Cloudflare
vercel deploy --env PAYLOAD_HOSTING=vercel

# Verify Vercel-specific features work
# Gracefully disable Cloudflare-only features
```

**Cloudflare Workers (Current):**
```bash
# Verify no regressions
wrangler deploy

# All features enabled
```

### Step 7: Add Conditional Imports (1 hour)

**Pattern for optional features:**
```typescript
// ❌ Current: Hard dependency
import { r2Uploader } from '@plugins/cloudflare/r2'

// ✅ New: Conditional import
let r2Uploader: Uploader = defaultUploader
if (capabilities.r2Storage) {
  const { r2Uploader: cf } = await import('@plugins/cloudflare/r2')
  r2Uploader = cf
}
```

---

## Files to Create

1. **src/lib/capabilities.ts** — Platform capability detection
2. **src/plugins/storage/index.ts** — Object storage abstraction + implementations
3. **src/plugins/caching/index.ts** — Cache backend abstraction + implementations
4. **src/plugins/images/index.ts** — Image optimization abstraction + implementations
5. **src/lib/fallbacks/** — In-memory/file-based implementations for dev
6. **DEPLOYMENT_MATRIX.md** — Feature support across platforms
7. **DEPLOYMENT.md** (update) — Deployment instructions per platform

---

## Files to Modify

1. **src/plugins/payload-runtime/getPayload.ts** — Initialize with capability detection
2. **next.config.js** — Conditional imports based on environment
3. **.env.example** — Document required vs optional bindings
4. **tsconfig.json** — Add new paths for abstractions

---

## Success Criteria

- [ ] Capability detection system implemented
- [ ] Object storage abstraction complete
- [ ] Cache backend abstraction complete
- [ ] Image optimization abstraction complete
- [ ] Docker standalone deployment works
- [ ] Vercel-only deployment works
- [ ] Cloudflare deployment still works (no regressions)
- [ ] DEPLOYMENT_MATRIX.md documents all platforms
- [ ] Feature degradation tested and documented
- [ ] Local dev works with in-memory/file backends
- [ ] All tests pass on each platform
- [ ] Documentation updated for contributors

---

## Timeline

**Estimated: 12-15 hours**
- Step 1 (Audit): 1h
- Step 2 (Flags): 1.5h
- Step 3 (Abstractions): 2.5h
- Step 4 (Runtime): 1h
- Step 5 (Documentation): 0.75h
- Step 6 (Testing): 2h
- Step 7 (Imports): 1h
- Integration & testing: 2.25h

---

## Expected Impact

**Before:** Tightly coupled to Cloudflare, difficult to contribute, hard to migrate  
**After:** Multi-platform compatible, graceful degradation, modular design

**Benefits:**
- Can run on Docker without Cloudflare setup
- Can deploy to Vercel without Cloudflare
- Contributors can develop locally with minimal setup
- Easy to switch infrastructure in future
- Better separation of concerns

---

## Implementation Progress

### ✅ Completed

**Step 1: Audit Runtime Dependencies** (1 hour)
- Identified Cloudflare bindings: R2, D1, KV, DO, Images, Analytics Engine
- Found existing storage abstraction (r2Storage, S3, VercelBlob)
- Found database adapter selection (D1, Postgres, MongoDB)
- Documented in PHASE_5_DEPLOYMENT_PORTABILITY.md

**Step 2: Create Feature Flags System** (1.5 hours)
- File: `src/lib/capabilities.ts`
- Interface: `PlatformCapabilities` with all service detection
- Functions: `detectCapabilities()`, `getCapabilities()`, `hasCapability()`, `assertCapability()`
- Helpers: `logCapabilities()`, `getCapabilitySummary()`
- Caches results for performance
- Detects: Cloudflare services, database URLs, Vercel Blob, Redis

**Step 3: Create Abstraction Layers** (2.5 hours)
- **Cache Backend** (`src/lib/cache/index.ts`)
  - `CacheBackend` interface
  - `MemoryCacheBackend` implementation
  - Global `initializeCacheBackend()` and `getCacheBackend()`
  - Helpers: `invalidateTags()`, `clearCache()`, `getCacheStats()`

- **Object Storage** (`src/lib/storage/index.ts`)
  - `StorageBackend` interface
  - `MemoryStorageBackend` implementation
  - Global `initializeStorageBackend()` and `getStorageBackend()`
  - Helpers: `storeFile()`, `retrieveFile()`, `deleteFile()`, `getFileUrl()`

- **Image Optimization** (`src/lib/images/index.ts`)
  - `ImageTransformer` interface
  - `NextjsImageTransformer` (default)
  - `CloudflareImageTransformer` for Workers
  - `PassthroughImageTransformer` (fallback)
  - Helper: `transformImage()`

**Step 5: Document Platform Support Matrix** (45 minutes)
- File: `DEPLOYMENT_MATRIX.md`
- Complete feature matrix for Cloudflare, Vercel, Docker
- Degradation strategy and fallback chains
- Configuration examples for each platform
- Performance characteristics
- Migration guides
- Troubleshooting guide

### ⏳ Remaining

**Step 4: Update Runtime Initialization** (1 hour)
- Integrate capability detection into `src/plugins/payload-runtime/getPayload.ts`
- Initialize backends based on detected capabilities
- Handle missing optional services gracefully
- Log initialization summary

**Step 6: Test Deployment Paths** (2 hours)
- Docker standalone (no Cloudflare)
- Vercel-only (no Cloudflare)
- Cloudflare Workers (verify no regressions)
- Integration tests for capability detection

**Step 7: Add Conditional Imports** (1 hour)
- Update imports to use detected capabilities
- Replace hard imports with conditional/lazy imports
- Add fallback handling for optional features

### Commits
1. `0bdf4db8` — Phase 5 plan + capabilities detection
2. `812d5b2b` — Abstraction layers (cache, storage, images)
3. `c99b6bf3` — Deployment matrix documentation

---

**Phase 5: In Progress** (~60% complete)
