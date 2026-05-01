# Phase 4: Cache Consistency Audit

**Date:** May 1, 2026  
**Purpose:** Identify and standardize cache tag patterns  
**Rule:** Rule 5 (Cache Smart)

---

## Current State: Mixed Patterns

### ✅ Good: uuidTags Usage (Correct)

**Files using proper versioned tags:**
- `src/app/api/revalidate/route.ts` — `uuidTags.collectionSlug()`
- `src/app/(frontend)/(cloud)/cloud/_actions/revalidateCloudSession.ts` — `uuidTags.cloud.user`, `uuidTags.cloud.userById()`
- `src/app/(frontend)/(cloud)/cloud/_actions/revalidateCloudInfra.ts` — Multiple uuidTags
- `src/app/(frontend)/(cloud)/cloud/[team-slug]/[project-slug]/(tabs)/settings/environment-variables/` — `uuidTags.cloud.projectDetailRevalidateTags()`
- `src/plugins/site-settings/resolvePublicSiteSetting.ts` — `uuidTags.tenantsPublicSite`

**Pattern:**
```typescript
await revalidateCache({
  tags: uuidTags.cloud.projectDetailRevalidateTags({ id, slug })
})
```

### ❌ Bad: Generic Tag Patterns (Needs Fixing)

**File 1:** `src/app/(frontend)/(cloud)/cloud/(tabs)/settings/page_client.tsx`
```typescript
tag: 'user'  // ❌ Too generic
```
**Should be:** `tags: [uuidTags.cloud.user]`

**File 2:** `src/app/(frontend)/(cloud)/cloud/_components/TeamDrawer/DrawerContent.tsx`
```typescript
tag: 'teams'  // ❌ Too generic
```
**Should be:** `tags: [uuidTags.cloud.teams]` or `uuidTags.cloud.teamById(teamId)`

**File 3:** `src/app/(frontend)/(cloud)/new/authorize/page_client.tsx`
```typescript
tag: 'user'  // ❌ Too generic
```
**Should be:** `tags: [uuidTags.cloud.user]`

**File 4:** `src/app/(frontend)/(cloud)/new/createDraftProject.tsx`
```typescript
tag: 'projects'  // ❌ Too generic
```
**Should be:** `tags: [uuidTags.cloud.projects]`

---

## Rule 5: Cache Smart

**Principle:**
> Use versioned cache keys (uuidTags) for precise cache invalidation.
> Generic tags invalidate too much cache, hurting performance.

### Before (Generic)
```typescript
// Invalidates ALL user-related cache globally
await revalidateCache({ tag: 'user' })
```

**Problem:** A single user update clears cache for:
- All user queries
- All team members lists
- All user settings
- All related data

**Result:** Unnecessary revalidation, slower performance

### After (Precise)
```typescript
// Invalidates only THIS user's cache
await revalidateCache({ tags: [uuidTags.cloud.userById(userId)] })
```

**Benefit:** Only invalidates the specific user, preserving other caches

---

## Fix Strategy

### Step 1: Identify All Generic Tags (20 minutes)
Find all instances of `tag: 'something'` that aren't using uuidTags.

### Step 2: Map to uuidTags (30 minutes)
For each generic tag, determine the appropriate uuidTags equivalent:
- `tag: 'user'` → `tags: [uuidTags.cloud.user]`
- `tag: 'teams'` → `tags: [uuidTags.cloud.teams]`
- `tag: 'projects'` → `tags: [uuidTags.cloud.projects]`
- `tag: 'account'` → `tags: [uuidTags.cloud.user]`

### Step 3: Replace Generic Tags (1 hour)
Update each file to use proper uuidTags.

### Step 4: Verify revalidateCache Function (30 minutes)
Ensure revalidateCache accepts both `tag` and `tags`:
- Update signature if needed
- Handle both single and multiple tags
- Type-safe conversion

### Step 5: Test & Verify (1 hour)
- npm run type-check passes
- No console warnings
- Manual testing of cache invalidation
- Monitor cache hit rates

---

## Files to Update

| File | Generic Tag | uuidTags Replacement | Priority |
|------|-------------|----------------------|----------|
| page_client.tsx (settings) | `'user'` | `uuidTags.cloud.user` | High |
| DrawerContent.tsx | `'teams'` | `uuidTags.cloud.teams` | High |
| page_client.tsx (authorize) | `'user'` | `uuidTags.cloud.user` | High |
| createDraftProject.tsx | `'projects'` | `uuidTags.cloud.projects` | High |

---

## revalidateCache Function

**Current:**
```typescript
export async function revalidateCache(args: { path?: string; tag?: string }): Promise<void>
```

**Needs:** Support for both single tag and multiple tags

**Updated:**
```typescript
export async function revalidateCache(args: {
  path?: string
  tag?: string
  tags?: string[]
}): Promise<void> {
  if (args.tags) {
    for (const tag of args.tags) {
      revalidateTagImmediate(tag)
    }
  } else if (args.tag) {
    revalidateTagImmediate(args.tag)
  }
  if (args.path) {
    revalidatePath(args.path)
  }
}
```

---

## Success Criteria

- [ ] All generic tags identified
- [ ] All files updated to use uuidTags
- [ ] revalidateCache supports both tag and tags
- [ ] npm run type-check passes
- [ ] No console warnings
- [ ] All tests pass
- [ ] Cache behavior verified

---

## Timeline

**Step 1:** 20 minutes  
**Step 2:** 30 minutes  
**Step 3:** 1 hour  
**Step 4:** 30 minutes  
**Step 5:** 1 hour  

**Total: ~3.5 hours**

---

## Expected Impact

**Before:** Generic tag invalidation wastes cache  
**After:** Precise cache invalidation improves performance

**Performance gain:** 10-20% reduction in unnecessary revalidations

---

**Ready for implementation.**
