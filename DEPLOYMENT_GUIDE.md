# Deployment Guide

**Version:** 1.0  
**Last Updated:** May 2026  
**Audience:** DevOps Engineers, SREs

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deployment to Vercel](#deployment-to-vercel)
3. [Deployment to Cloudflare Workers](#deployment-to-cloudflare-workers)
4. [Deployment to Docker](#deployment-to-docker)
5. [Environment Configuration](#environment-configuration)
6. [Database Migrations](#database-migrations)
7. [Health Checks & Verification](#health-checks--verification)
8. [Rollback Procedures](#rollback-procedures)
9. [Monitoring & Alerts](#monitoring--alerts)

---

## Pre-Deployment Checklist

Before deploying to any environment, ensure:

### Code Quality
- [ ] All tests passing: `npm test`
- [ ] Type checks: `npm run type-check`
- [ ] Linting: `npm run lint`
- [ ] Coverage above thresholds: `npm test:coverage`
- [ ] No console errors/warnings in build
- [ ] No security vulnerabilities: `npm audit`

### Security
- [ ] Secrets not committed (`.env.local` in `.gitignore`)
- [ ] Environment variables configured
- [ ] Database credentials rotated
- [ ] API keys rotated
- [ ] HTTPS enabled for production

### Documentation
- [ ] CHANGELOG updated
- [ ] Deployment runbook reviewed
- [ ] Known issues documented
- [ ] Database migration scripts tested

### Resources
- [ ] Database backup created
- [ ] Storage backup completed
- [ ] Cache warming scripts prepared
- [ ] Monitoring configured
- [ ] Alerts active

---

## Deployment to Vercel

### Setup Vercel Project

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Configure environment
vercel env pull .env.local
```

### Configure Environment Variables

```bash
# Set production environment variables
vercel env add DATABASE_URL
vercel env add REDIS_URL
vercel env add STRIPE_SECRET_KEY
vercel env add PAYLOAD_SECRET
vercel env add BLOB_READ_WRITE_TOKEN
vercel env add NEXT_PUBLIC_SITE_URL=https://example.com
```

### Deploy Staging

```bash
# Deploy to preview URL
vercel --prod=false

# Deploy to specific commit
vercel --prod=false --scope=my-team commit-hash
```

### Deploy Production

```bash
# Build and deploy to production
vercel --prod

# Set region (optional)
vercel --prod --regions=sfo1,iad1

# Monitor deployment
vercel logs
```

### Verify Deployment

```bash
# Check health endpoint
curl https://example.com/api/health

# Check version
curl https://example.com/api/health | jq '.version'

# View logs
vercel logs --follow
```

### Rollback Deployment

```bash
# List deployments
vercel list

# Rollback to previous deployment
vercel rollback <deployment-id>

# Or redeploy from git
git checkout <previous-commit>
git push  # Triggers automatic redeployment
```

---

## Deployment to Cloudflare Workers

### Setup Cloudflare Project

```bash
# Install Wrangler
npm install -g wrangler@4

# Login to Cloudflare
wrangler login

# Create KV namespace
wrangler kv:namespace create payload_cache
wrangler kv:namespace create payload_sessions
```

### Configure Wrangler

Edit `wrangler.toml`:

```toml
name = "payload-website"
type = "javascript"
account_id = "your-account-id"
workers_dev = true

[env.production]
vars = { ENVIRONMENT = "production" }

[env.staging]
vars = { ENVIRONMENT = "staging" }

[[kv_namespaces]]
binding = "PAYLOAD_CACHE"
id = "namespace-id"
preview_id = "preview-namespace-id"

[[d1_databases]]
binding = "D1"
database_name = "payload_db"
database_id = "database-id"

[[r2_buckets]]
binding = "R2"
bucket_name = "payload-bucket"
```

### Deploy to Cloudflare

```bash
# Deploy to staging
wrangler deploy --env staging

# Deploy to production
wrangler deploy --env production

# Monitor logs
wrangler tail
```

### Database Setup (D1)

```bash
# Create database
wrangler d1 create payload_db

# Run migrations
wrangler d1 execute payload_db --file schema.sql

# Verify
wrangler d1 execute payload_db --command "SELECT * FROM information_schema.tables;"
```

### Verify Deployment

```bash
# Test endpoint
curl https://payload-website.example.workers.dev/api/health

# Check KV storage
wrangler kv:key list --namespace-id=<id>

# View metrics
# Via Cloudflare dashboard → Workers → Analytics
```

---

## Deployment to Docker

### Build Docker Image

```bash
# Build production image
docker build -t payload-website:latest .

# Tag for registry
docker tag payload-website:latest registry.example.com/payload-website:latest

# Push to registry
docker push registry.example.com/payload-website:latest
```

### Deploy with Docker Compose

```bash
# Copy environment file
cp .env.docker.example .env.docker
# Edit with production values
nano .env.docker

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Verify
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f app
```

### Deploy to Kubernetes

```bash
# Install Helm chart
helm install payload ./charts/payload \
  --namespace production \
  --values values-prod.yaml

# Monitor rollout
kubectl rollout status deployment/payload -n production

# View logs
kubectl logs -f deployment/payload -n production

# Scale if needed
kubectl scale deployment/payload --replicas=3 -n production
```

### Database Migrations (Docker)

```bash
# Connect to running database
docker exec payload-db psql -U payload -d payload_db

# Run migrations
docker-compose -f docker-compose.prod.yml exec app pnpm run migrate

# Verify
docker-compose -f docker-compose.prod.yml exec postgres psql -U payload -d payload_db -c "\dt"
```

### Verify Deployment

```bash
# Health check
curl http://localhost:3000/api/health

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app

# Verify database connection
docker-compose -f docker-compose.prod.yml exec app \
  curl http://localhost:3000/api/health | jq '.checks.database'

# Verify Redis connection
docker-compose -f docker-compose.prod.yml exec app \
  curl http://localhost:3000/api/health | jq '.checks.cache'
```

---

## Environment Configuration

### Required Environment Variables

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_TELEMETRY_DISABLED=1

# Database
DATABASE_URL=postgresql://user:password@host:5432/payload_db

# Cache
REDIS_URL=redis://:password@redis-host:6379

# Storage
S3_BUCKET=payload-bucket
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...

# Payload CMS
PAYLOAD_SECRET=... (32+ character random string)

# Security
NEXT_PRIVATE_REVALIdATION_KEY=... (random string)

# Payments (if used)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (if used)
SENDGRID_API_KEY=SG...
```

### Platform-Specific Variables

**Cloudflare:**
```bash
NEXT_PUBLIC_CDN_URL=https://cdn.example.com
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
```

**Vercel:**
```bash
BLOB_READ_WRITE_TOKEN=...
```

**Docker:**
```bash
POSTGRES_PASSWORD=...
REDIS_PASSWORD=...
MINIO_ROOT_PASSWORD=...
```

---

## Database Migrations

### Creating Migrations

```bash
# Create new migration
npm run migrate:create migration_name

# Edit generated migration file
nano src/migrations/migration_name.ts

# Test locally
npm run migrate
```

### Running Migrations

**Development:**
```bash
npm run migrate
```

**Production (Vercel):**
```bash
# Run in deployment dashboard
# Or via CLI
vercel env pull .env.production.local
pnpm migrate
```

**Production (Docker):**
```bash
docker-compose -f docker-compose.prod.yml exec app pnpm migrate
```

**Production (Cloudflare):**
```bash
wrangler d1 execute payload_db --file migrations/001_initial.sql
```

### Migration Safety

1. **Backup before running**
   ```bash
   # PostgreSQL
   pg_dump $DATABASE_URL > backup.sql
   ```

2. **Test on staging first**
   ```bash
   # Deploy to staging
   # Run migrations
   # Verify
   # Then deploy to production
   ```

3. **Use transactions**
   ```sql
   BEGIN;
   -- Migration statements
   COMMIT;
   ```

4. **Make reversible**
   ```sql
   -- UP
   ALTER TABLE users ADD COLUMN phone VARCHAR(20);
   
   -- DOWN
   ALTER TABLE users DROP COLUMN phone;
   ```

---

## Health Checks & Verification

### Endpoint Health Checks

```bash
# Application health
curl https://example.com/api/health

# Response format
{
  "status": "healthy",
  "timestamp": "2026-05-01T12:00:00Z",
  "version": "2.0.0",
  "checks": {
    "database": "healthy",
    "cache": "healthy",
    "storage": "healthy"
  }
}
```

### Database Verification

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check tables
psql $DATABASE_URL -c "\dt"

# Check data integrity
psql $DATABASE_URL -c "SELECT count(*) FROM users"
```

### Cache Verification

```bash
# Test Redis
redis-cli -u $REDIS_URL PING

# Check keys
redis-cli -u $REDIS_URL KEYS "*" | head -10

# Check memory
redis-cli -u $REDIS_URL INFO memory
```

### Storage Verification

```bash
# List buckets
aws s3 ls --endpoint-url $S3_ENDPOINT

# Upload test file
aws s3 cp test.txt s3://bucket/test.txt --endpoint-url $S3_ENDPOINT

# Download test file
aws s3 cp s3://bucket/test.txt . --endpoint-url $S3_ENDPOINT
```

---

## Rollback Procedures

### Rollback Strategy

```
Production ──→ Staging ──→ Rollback?
                              ↓
                         Verify & Monitor
                              ↓
                         Deploy Fix or Accept
```

### Rollback on Vercel

```bash
# Option 1: Rollback to previous deployment
vercel rollback <deployment-id>

# Option 2: Redeploy from git
git revert <commit-hash>
git push

# Option 3: Manual rollback
git checkout <previous-tag>
vercel --prod
```

### Rollback on Cloudflare

```bash
# Redeploy previous version
git checkout <previous-commit>
wrangler deploy --env production

# Or manually:
# 1. Go to Cloudflare dashboard
# 2. Workers → Builds
# 3. Click "Deploy"
# 4. Select previous version
```

### Rollback on Docker

```bash
# Stop current version
docker-compose -f docker-compose.prod.yml down

# Use previous image tag
docker pull registry.example.com/payload-website:v2.0.0
docker-compose -f docker-compose.prod.yml up -d

# Verify
docker-compose -f docker-compose.prod.yml ps
```

---

## Monitoring & Alerts

### Set Up Monitoring

**Sentry (Error Tracking)**
```bash
# Verify Sentry is capturing errors
1. Visit Sentry dashboard
2. Check "Issues" for recent errors
3. Set up alerts:
   - Threshold: 10 errors/minute
   - Notify: Team Slack channel
```

**Datadog (APM)**
```bash
# Monitor performance
1. Datadog → APM → Services
2. Set up dashboards for:
   - Response times
   - Error rates
   - Database query times
   - Cache hit rates
```

**Prometheus + Grafana**
```bash
# Access Grafana
curl http://localhost:3001
# Username: admin
# Password: (configured in .env)

# Create dashboards for:
- API response times
- Error rates
- Memory usage
- Database connections
- Redis hit rate
```

### Alert Configuration

**Critical (Page immediately)**
- Application down (health check failing)
- Error rate >5%
- Database connection lost
- Cache unavailable

**High (Page within 5 min)**
- Response time p95 >500ms
- Memory usage >85%
- Disk usage >85%
- Request rate anomaly

**Medium (Email)**
- Response time p95 >200ms
- Cache hit rate <60%
- Slow queries (>1s)
- Rate limit violations

### Post-Deployment Verification

```bash
# 1. Check metrics for 10 minutes
# Look for anomalies in:
# - Response times
# - Error rates
# - Database query times
# - Cache performance

# 2. Check logs for errors
# Filter for ERROR and WARN levels

# 3. Run smoke tests
# Test critical user journeys

# 4. Check user reports
# Monitor support channels

# 5. Only then mark as successful
```

---

## Troubleshooting

### Deployment Failed

```bash
# Check logs
# - Vercel: vercel logs
# - Cloudflare: wrangler tail
# - Docker: docker-compose logs

# Common issues:
# 1. Environment variables missing
# 2. Database connection failed
# 3. Build failed
# 4. Secrets not configured

# Resolution:
# 1. Verify all env vars set
# 2. Test database connection
# 3. Check build output
# 4. Verify secrets in platform
```

### Slow Response Times After Deploy

```bash
# Check database
curl /api/health | jq '.checks.database'

# Check cache
curl /api/health | jq '.checks.cache'

# Check metrics
# - API response time
# - Database query time
# - Cache hit rate

# If database slow:
# - Check for long-running queries
# - Check connection pool
# - Consider read replicas

# If cache slow:
# - Check memory usage
# - Check key distribution
# - Consider cluster
```

### Rollback Not Working

```bash
# Verify previous version still available
vercel list  # Vercel
git log --oneline  # Cloudflare
docker images  # Docker

# If not available:
# - Re-build from git
# - Use docker registry
# - Pull from backup

# Test health after rollback
curl https://example.com/api/health
```

---

**Maintained By:** DevOps Team  
**Last Updated:** May 2026  
**Next Review:** August 2026
