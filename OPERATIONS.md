# Operations Guide

**Version:** 1.0  
**Last Updated:** May 2026  
**Audience:** DevOps, SREs, Operations Team

---

## Table of Contents

1. [Health Checks](#health-checks)
2. [Monitoring & Alerts](#monitoring--alerts)
3. [Common Issues & Solutions](#common-issues--solutions)
4. [Performance Tuning](#performance-tuning)
5. [Scaling Strategies](#scaling-strategies)
6. [Backup & Recovery](#backup--recovery)
7. [Incident Response](#incident-response)
8. [Security Operations](#security-operations)

---

## Health Checks

### Application Health Endpoint

```bash
# Endpoint
GET /api/health

# Response
{
  "status": "healthy",
  "timestamp": "2026-05-01T12:00:00Z",
  "uptime": 86400,
  "version": "2.0.0",
  "checks": {
    "database": "healthy",
    "cache": "healthy",
    "storage": "healthy",
    "imageOptimizer": "healthy"
  }
}
```

**Health Check Frequency:** Every 30 seconds (recommended)

### Database Health

```sql
-- PostgreSQL
SELECT version();
SELECT datname, pg_database_size(datname) FROM pg_database 
WHERE datname = 'payload_db';

-- Check connections
SELECT count(*) FROM pg_stat_activity 
WHERE datname = 'payload_db';
```

### Cache Health

```bash
# Redis
redis-cli PING
redis-cli INFO stats
redis-cli MEMORY STATS

# D1 (Cloudflare)
# Check via Cloudflare dashboard
```

### Storage Health

```bash
# R2 (Cloudflare)
aws s3 ls s3://my-bucket --endpoint-url https://r2.cloudflarestorage.com

# S3 or Vercel Blob
aws s3api head-bucket --bucket my-bucket
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

| Metric | Target | Alert Threshold | Frequency |
|--------|--------|-----------------|-----------|
| API Response Time (p95) | <200ms | >500ms | 1m |
| Database Query Time (p95) | <50ms | >150ms | 1m |
| Cache Hit Rate | >80% | <60% | 5m |
| Error Rate | <0.1% | >1% | 1m |
| Memory Usage | <70% | >85% | 1m |
| Disk Usage | <70% | >85% | 5m |
| CPU Usage | <50% | >80% | 1m |
| Request Rate | N/A | >10k/min | 1m |

### Setting Up Monitoring

**Sentry (Error Tracking)**
```bash
# Install
npm install @sentry/nextjs

# Configure in next.config.js
const withSentry = require('@sentry/nextjs')();

module.exports = withSentry({
  dsn: process.env.SENTRY_DSN,
  // ... config
})

# Set alerts in Sentry dashboard
```

**Datadog (APM & Monitoring)**
```bash
# Install
npm install dd-trace

# Configure in server startup
const tracer = require('dd-trace').init()

# Set up dashboards and alerts in Datadog
```

**CloudWatch (AWS)**
```bash
# Logs
aws logs put-metric-alarm \
  --alarm-name api-error-rate \
  --metric-name ErrorCount \
  --namespace Custom \
  --threshold 100 \
  --comparison-operator GreaterThanThreshold

# Metrics
aws cloudwatch put-metric-data \
  --namespace Custom \
  --metric-name ApiResponseTime \
  --value 150
```

### Alert Configuration

**Critical Alerts (Page Immediately)**
- Application down (health check failing)
- Database connection lost
- Error rate >5%
- Cache unavailable

**High Priority (Page within 5 min)**
- Response time p95 >500ms
- Error rate 1-5%
- Memory usage >85%
- Disk usage >85%

**Medium Priority (Email)**
- Slow queries (>1 second)
- Cache hit rate <60%
- Rate limit hits >100/min
- Failed webhook deliveries

---

## Common Issues & Solutions

### Issue: High Memory Usage

**Diagnosis:**
```bash
# Check memory
free -h
ps aux --sort=-%mem | head

# Node process memory
node --version
ps aux | grep node

# Check for memory leaks
node --inspect app.js
# Open chrome://inspect
```

**Solutions:**
1. **Increase memory allocation**
   ```bash
   NODE_OPTIONS="--max-old-space-size=2048" node app.js
   ```

2. **Identify memory leaks**
   - Check for circular references
   - Review cache size limits
   - Monitor long-running processes

3. **Clear cache**
   ```bash
   # Redis
   redis-cli FLUSHDB
   
   # D1
   # Delete and recreate database
   ```

### Issue: Slow API Responses

**Diagnosis:**
```bash
# Check slow requests
grep "duration" logs/* | sort -t: -k2 -rn | head

# Database query analysis
EXPLAIN ANALYZE SELECT * FROM collections WHERE slug = 'test';

# Check cache hit rate
# From metrics: cacheMetrics.getHitRate()
```

**Solutions:**
1. **Add database indexes**
   ```sql
   CREATE INDEX idx_slug ON collections(slug);
   CREATE INDEX idx_user_id ON posts(user_id);
   ```

2. **Optimize Payload queries**
   ```typescript
   // Use depth: 0 to skip relationships
   const users = await payload.find({
     collection: 'users',
     depth: 0,  // Don't populate relationships
     select: { email: true, id: true }  // Only needed fields
   })
   ```

3. **Increase cache TTL**
   ```typescript
   // Default: 1 hour
   // Increase for stable content
   await cache.set(key, value, 86400)  // 24 hours
   ```

### Issue: Database Connection Pool Exhausted

**Diagnosis:**
```sql
SELECT count(*) FROM pg_stat_activity;
SELECT * FROM pg_stat_activity WHERE state != 'idle';
```

**Solutions:**
1. **Increase pool size** (in database connection string)
   ```
   DATABASE_URL=postgres://user:pass@host/db?max=20
   ```

2. **Kill idle connections**
   ```sql
   SELECT pg_terminate_backend(pid) FROM pg_stat_activity
   WHERE state = 'idle' AND query_start < now() - interval '1 hour';
   ```

3. **Use connection pooling (PgBouncer)**
   ```ini
   [databases]
   my_db = host=localhost port=5432 dbname=payload_db
   
   [pgbouncer]
   pool_mode = transaction
   max_client_conn = 1000
   default_pool_size = 25
   ```

### Issue: Rate Limiting Too Aggressive

**Diagnosis:**
```bash
# Check logs for rate limit hits
grep "429\|rate-limit" logs/*

# Metrics
metrics.getCounter('rate_limit_hits_total')
```

**Solutions:**
1. **Adjust rate limits**
   ```bash
   RATE_LIMIT_MAX_REQUESTS=200   # Increase from 100
   RATE_LIMIT_WINDOW_MS=60000    # Per minute
   ```

2. **Bypass for trusted IPs**
   ```typescript
   // In security middleware
   const trustedIPs = (process.env.TRUSTED_IPS || '').split(',')
   if (trustedIPs.includes(clientIP)) {
     return null  // Skip rate limit
   }
   ```

3. **Per-endpoint limits**
   ```typescript
   // Strict for auth
   export const POST = withRateLimit(loginHandler, {
     maxRequests: 5,
     windowMs: 900000  // 5 per 15 minutes
   })
   
   // Relaxed for public API
   export const GET = withRateLimit(publicHandler, {
     maxRequests: 1000,
     windowMs: 60000
   })
   ```

---

## Performance Tuning

### Database Optimization

**1. Analyze Query Plans**
```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

**2. Add Indexes**
```sql
-- Frequently filtered columns
CREATE INDEX idx_users_email ON users(email);

-- Sorting/ordering
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- Composite indexes
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);

-- For LIKE searches
CREATE INDEX idx_posts_title_trgm ON posts USING gin(title gin_trgm_ops);
```

**3. Vacuuming & Maintenance**
```bash
# Manual vacuum
psql -U user -d database -c "VACUUM ANALYZE;"

# Configure auto-vacuum
ALTER TABLE users SET (autovacuum_vacuum_scale_factor = 0.05);
```

**4. Connection Pooling**
```bash
# Use PgBouncer for connection pooling
pgbouncer -d -c /etc/pgbouncer.conf
```

### Cache Optimization

**1. Increase Cache TTL**
```typescript
// Default: 1 hour
// Increase for stable content
const cacheTTL = {
  users: 86400,        // 24 hours
  posts: 3600,         // 1 hour
  homepage: 300,       // 5 minutes
  prices: 604800       // 7 days
}

await cache.set(key, value, cacheTTL[type])
```

**2. Cache Warming**
```typescript
// Pre-populate cache at startup
async function warmCache() {
  const users = await payload.find({ collection: 'users' })
  for (const user of users) {
    await cache.set(`user:${user.id}`, user, 86400)
  }
}
```

**3. Cache Invalidation**
```typescript
// Granular invalidation (not full purge)
await invalidateTags([
  uuidTags.user(userId),
  uuidTags.collectionSlug('posts', slug)
])
```

### Image Optimization

**1. WebP Format**
```typescript
// Cloudflare
// Automatic WebP serving based on Accept header

// Next.js Image
<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
/>
// Automatically optimizes and serves WebP
```

**2. Responsive Images**
```typescript
// Serve appropriately-sized images
<Image
  src="/image.jpg"
  alt="Description"
  width={1200}
  height={600}
  sizes="(max-width: 640px) 100vw,
         (max-width: 1024px) 80vw,
         1200px"
  priority  // LCP image
/>
```

### Bundle Size Optimization

**1. Analyze Bundle**
```bash
npm run analyze
# Generates bundle analysis report
```

**2. Code Splitting**
```typescript
// Dynamic imports for heavy components
const HeavyComponent = dynamic(() => import('@/components/Heavy'), {
  loading: () => <div>Loading...</div>,
  ssr: false
})
```

**3. Dependency Review**
```bash
# Check dependencies
npm ls

# Find unused dependencies
npm prune --production

# Update to latest
npm update
```

---

## Scaling Strategies

### Horizontal Scaling

**Prerequisites:**
1. ✅ Stateless application (no local files/cache)
2. ✅ Shared database (Postgres with connection pooling)
3. ✅ Shared cache (Redis or D1)
4. ✅ Shared storage (R2, S3, Blob)

**Steps:**
```bash
# 1. Deploy application to multiple instances
#    (Load balancer routes to instances)

# 2. Configure shared services
REDIS_URL=redis://redis-host:6379
DATABASE_URL=postgres://host/db
S3_BUCKET=my-bucket

# 3. Set up health checks
# (Load balancer periodically checks /api/health)

# 4. Monitor and scale based on:
CPU_USAGE > 70% → Add instance
MEMORY_USAGE > 80% → Add instance
REQUEST_RATE > 5k/min → Add instance
```

### Database Scaling

**Read Replicas:**
```bash
# Primary: accepts writes
# Replicas: accept reads only
# Application logic:
- Write queries → Primary
- Read queries → Replica (random selection)
```

**Partitioning:**
```sql
-- For very large tables
CREATE TABLE posts (
  id BIGSERIAL,
  user_id BIGINT,
  content TEXT,
  created_at TIMESTAMP
) PARTITION BY RANGE (created_at);

CREATE TABLE posts_2024_q1 PARTITION OF posts
  FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
```

### Cache Scaling

**Redis Cluster:**
```bash
# High availability setup
- Master node
- 2 replica nodes
- Sentinel for failover

# Configuration
redis-sentinel /etc/sentinel.conf
```

**Cache Distribution:**
```bash
# For very large caches, shard by key
- Users: redis-1 (keys user:0-user:999)
- Posts: redis-2 (keys post:0-post:999)
- Others: redis-3
```

---

## Backup & Recovery

### Automated Backups

**Database:**
```bash
# Daily backups
0 2 * * * pg_dump $DATABASE_URL > /backups/db-$(date +%Y%m%d).sql

# Verify backup
pg_restore --list /backups/db-20260501.sql

# Store in S3
aws s3 cp /backups/db-20260501.sql s3://backup-bucket/
```

**Storage:**
```bash
# R2/S3 versioning
aws s3api put-bucket-versioning \
  --bucket my-bucket \
  --versioning-configuration Status=Enabled

# Sync to secondary region
aws s3 sync s3://primary-bucket/ s3://backup-bucket/
```

### Point-in-Time Recovery

```bash
# PostgreSQL WAL archiving
archive_command = 'cp %p /backups/wal/%f'

# Restore to specific time
pg_basebackup --pgdata=. --wal-method=stream
# Restore to timestamp
restore_command = 'cp /backups/wal/%f %p'
# Edit recovery.conf:
recovery_target_time = '2026-05-01 12:00:00'
pg_ctl start -D ./
```

### Testing Backups

```bash
# Monthly backup test
1. Restore from backup to staging database
2. Run test suite
3. Verify data integrity
4. Document results
```

---

## Incident Response

### Incident Severity Levels

| Level | Criteria | Response | Resolution |
|-------|----------|----------|-----------|
| Critical | Service down, data loss risk | Page oncall immediately | <1 hour |
| High | Degraded service, >5% errors | Page within 5 min | <4 hours |
| Medium | Minor functionality broken | Email on-call | <24 hours |
| Low | Non-critical issue | Create ticket | Next sprint |

### Incident Playbook

**Step 1: Detect & Assess**
- Alert fires → Acknowledge
- Check system status
- Determine scope and impact
- Estimate resolution time

**Step 2: Initial Response**
```bash
# Collect diagnostics
docker ps
docker logs app
curl /api/health
redis-cli PING
psql -c "SELECT version();"
```

**Step 3: Mitigate**
- Rollback recent deploy
- Scale down to stable version
- Disable feature causing issue
- Clear caches if corrupted

**Step 4: Fix**
- Identify root cause
- Implement fix
- Test in staging
- Deploy to production

**Step 5: Verify**
- Check health endpoint
- Verify metrics return to normal
- Confirm user reports resolved
- Document incident

**Step 6: Post-Incident**
- Write incident report
- Schedule blameless postmortem
- Create action items
- Update runbooks

### Common Incident Scenarios

**Database Down:**
```bash
# 1. Check status
systemctl status postgresql

# 2. Try restart
systemctl restart postgresql

# 3. Check logs
tail -f /var/log/postgresql/postgresql.log

# 4. Check disk space
df -h

# 5. Failover to replica (if configured)
systemctl stop postgresql-primary
systemctl start postgresql-replica
# Update application connection string
```

**Memory Leak:**
```bash
# 1. Check memory
free -h

# 2. Identify process
ps aux --sort=-%mem

# 3. Kill and restart
kill -9 $PID
systemctl restart app

# 4. Enable monitoring
node --inspect app.js
# Use chrome://inspect to profile
```

**Cache Corruption:**
```bash
# 1. Clear cache
redis-cli FLUSHDB

# 2. Monitor refill
watch -n 1 'redis-cli INFO stats | grep keys'

# 3. Warm cache
# Run cache warmup script
```

---

## Security Operations

### Regular Security Tasks

**Weekly:**
- Review error logs for suspicious patterns
- Check rate limit hits for anomalies
- Verify backup completion

**Monthly:**
- Rotate API keys
- Review access logs
- Security dependency scan

**Quarterly:**
- Penetration testing
- Security audit
- Compliance review

### Secrets Rotation

```bash
# API Keys (90 day rotation)
1. Generate new key
2. Update application env vars
3. Test with new key
4. Revoke old key
5. Document rotation date

# Database Passwords
1. Generate new password
2. Update connection string
3. Test connection
4. Update all replicas
5. Revoke old password
```

### Access Control

```bash
# SSH keys
ssh-keygen -t ed25519 -C "ops-team"
# Distribute securely
# Remove old keys annually

# Database access
CREATE ROLE app_user WITH PASSWORD 'secure_password';
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_user;

# API tokens
# Store in secure vault (1Password, HashiCorp Vault)
# Never commit to repository
```

### Monitoring Security

```bash
# SIEM/log monitoring
grep -i "error\|warning\|unauthorized\|forbidden" logs/* | head

# Failed login attempts
grep "auth.*failed" logs/* | wc -l

# SQL errors (potential injection)
grep "SQL error" logs/*

# Rate limit violations
grep "429\|rate-limit" logs/*
```

---

## Runbooks

### Deployment Runbook

```bash
# 1. Create release branch
git checkout -b release/v2.1.0

# 2. Update version
npm version minor

# 3. Build & test
npm run build
npm test

# 4. Deploy to staging
npm run deploy:staging

# 5. Test staging
curl https://staging.example.com/api/health

# 6. Deploy to production
npm run deploy:production

# 7. Verify production
curl https://example.com/api/health
# Check metrics for anomalies

# 8. Tag release
git tag v2.1.0
git push origin v2.1.0
```

### Rollback Runbook

```bash
# 1. Identify bad version
# Check recent deployments and metrics

# 2. Prepare rollback
# New deployment with previous version

# 3. Deploy previous version
npm run deploy:production --version=v2.0.5

# 4. Verify
curl https://example.com/api/health

# 5. Clear caches if needed
redis-cli FLUSHDB

# 6. Document rollback
# Create incident record with reason and impact
```

---

**Maintained By:** Operations Team  
**Last Updated:** May 2026  
**Next Review:** August 2026
