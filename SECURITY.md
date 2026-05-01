# Security Policy & Guidelines

**Version:** 1.0  
**Last Updated:** May 1, 2026  
**Status:** Active

---

## Table of Contents

1. [Vulnerability Reporting](#vulnerability-reporting)
2. [Security Architecture](#security-architecture)
3. [Authentication & Authorization](#authentication--authorization)
4. [Data Protection](#data-protection)
5. [API Security](#api-security)
6. [Dependency Management](#dependency-management)
7. [Security Headers](#security-headers)
8. [Rate Limiting](#rate-limiting)
9. [Secrets Management](#secrets-management)
10. [Incident Response](#incident-response)
11. [Compliance](#compliance)

---

## Vulnerability Reporting

### Responsible Disclosure

We take security vulnerabilities seriously. If you discover a security vulnerability, please:

1. **Do NOT** open a public GitHub issue
2. Email `security@example.com` with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

3. We will:
   - Acknowledge receipt within 48 hours
   - Provide initial assessment within 1 week
   - Work with you on a fix timeline
   - Credit you in release notes (if desired)

### Vulnerability Response Timeline

| Severity | Response | Resolution |
|----------|----------|-----------|
| Critical | 1 hour | 24 hours |
| High | 4 hours | 1 week |
| Medium | 1 day | 2 weeks |
| Low | 3 days | 1 month |

---

## Security Architecture

### Defense in Depth

The application implements multiple layers of security:

```
┌─────────────────────────────────────────┐
│  Client (Browser)                       │
│  - HTTPS only                           │
│  - CSP headers                          │
│  - Input validation                     │
└──────────┬──────────────────────────────┘
           │ HTTPS/TLS 1.3+
┌──────────▼──────────────────────────────┐
│  Edge/CDN (Cloudflare/Vercel)           │
│  - DDoS protection                      │
│  - WAF rules                            │
│  - Rate limiting                        │
│  - Security headers injection           │
└──────────┬──────────────────────────────┘
           │
┌──────────▼──────────────────────────────┐
│  Application Layer (Next.js)            │
│  - Request validation                   │
│  - CORS enforcement                     │
│  - Rate limiting                        │
│  - Authentication checks                │
│  - Input sanitization                   │
└──────────┬──────────────────────────────┘
           │
┌──────────▼──────────────────────────────┐
│  Business Logic (Payload CMS)           │
│  - Authorization checks                 │
│  - Data validation                      │
│  - Audit logging                        │
└──────────┬──────────────────────────────┘
           │
┌──────────▼──────────────────────────────┐
│  Database                               │
│  - Parameterized queries                │
│  - Encryption at rest                   │
│  - Access control                       │
│  - Backups & recovery                   │
└─────────────────────────────────────────┘
```

---

## Authentication & Authorization

### Authentication Methods

1. **Email/Password (Session)**
   - Hashed with bcrypt (min 12 rounds)
   - Session stored in secure HTTP-only cookies
   - CSRF tokens validated on all state-changing requests

2. **OAuth 2.0 (Federated)**
   - Google, GitHub, etc. via standard providers
   - OpenID Connect validation
   - No credential storage locally

3. **API Keys (Service-to-Service)**
   - Base64-encoded, 32+ character minimum
   - Rate limited per key
   - Rotated every 90 days

### Authorization

- **Role-Based Access Control (RBAC)**
  - Roles: admin, moderator, user, guest
  - Permissions checked on every request
  - Enforced at Payload CMS level

- **Field-Level Security**
  - Sensitive fields hidden from unauthorized users
  - Personal data access logged
  - Compliance with GDPR/CCPA

### Password Requirements

- Minimum 12 characters
- Must include: uppercase, lowercase, number, special character
- No common passwords (against known breach database)
- Rotation every 90 days for admin accounts
- No reuse of last 5 passwords

---

## Data Protection

### Encryption

**At Rest:**
- Database: Encrypted via platform provider (Vercel KMS, AWS KMS, etc.)
- Files: Encrypted in storage backends (R2, Vercel Blob, S3)
- Backups: Encrypted and geographically distributed

**In Transit:**
- HTTPS/TLS 1.3+ enforced (HSTS header)
- Certificate pinning not required (handled by browser/OS)
- Perfect Forward Secrecy enabled

### Data Retention & Deletion

| Data Type | Retention | Deletion Method |
|-----------|-----------|-----------------|
| User Account | Until deletion request | Cryptographic erasure |
| Activity Logs | 90 days | Automated purge |
| Payment Records | 7 years (legal) | Anonymization after period |
| Session Tokens | 24 hours | Immediate on logout |
| Cache | 1 hour | TTL-based expiration |

### PII Handling

- Personal Identifiable Information (PII) fields are:
  - Flagged in code with `@pii` comment
  - Logged with redaction
  - Never sent to external services without explicit consent
  - Encrypted in database
  - Accessible only to authorized users with audit logging

---

## API Security

### Input Validation

**All external inputs must be:**

1. **Type-checked** — TypeScript strict mode enforced
2. **Schema-validated** — Zod/Payload CMS validation
3. **Length-limited** — Prevent buffer overflows
4. **Sanitized** — XSS prevention via React escaping
5. **Parameterized** — SQL injection prevention

### SQL Injection Prevention

- ✅ Payload CMS ORM handles parameterization
- ✅ No string concatenation in queries
- ✅ Type-safe query builders used
- ✅ Regular dependency scanning for ORM vulnerabilities

### XSS Prevention

- ✅ React auto-escapes JSX expressions
- ✅ `dangerouslySetInnerHTML` forbidden (linted)
- ✅ User-generated content sanitized via DOMPurify
- ✅ Content Security Policy headers enforced

### CSRF Prevention

- ✅ POST/PUT/DELETE require CSRF token
- ✅ Token validated before state changes
- ✅ SameSite cookie attribute set to `Strict`
- ✅ Payload CMS middleware enforces checks

### Rate Limiting

Implemented at multiple levels:

**API Endpoints:**
- 100 requests per minute per IP (default)
- 1000 requests per minute per authenticated user
- Configurable per-endpoint limits

**Authentication:**
- 5 failed login attempts → 15-minute lockout
- 10 signup attempts → IP-based rate limit

**Payment:**
- 1 concurrent checkout per user
- Max 10 payment attempts per 24 hours

See `src/middleware/security.ts` for implementation.

---

## Dependency Management

### Vulnerability Scanning

1. **Automated:**
   - Dependabot scans daily
   - GitHub code scanning enabled
   - SAST (Static Application Security Testing) on every PR

2. **Manual:**
   - Quarterly security audits
   - Dependency evaluation for new additions
   - EOL tracking for critical dependencies

### Dependency Policy

| Category | Update Frequency | Security Policy |
|----------|-----------------|-----------------|
| Critical (Node, npm) | Monthly (LTS) | Automatic |
| Security Patches | Immediate | Automatic |
| Minor Updates | Quarterly | Manual review |
| Major Updates | Annually | Full testing required |

### Vulnerable Dependency Response

1. **Critical** — Immediately patch and deploy
2. **High** — Patch within 48 hours
3. **Medium** — Patch within 1 week
4. **Low** — Batch in next release (unless >30 days old)

---

## Security Headers

### HTTP Security Headers

All responses include:

```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Content-Security-Policy: [restrictive policy]
```

See `src/middleware/security.ts` for configuration.

### CSP (Content Security Policy)

**Current Policy:**
- Scripts from: Self + inline (for Next.js optimization)
- Styles from: Self + inline
- Images from: Self, data URIs, HTTPS
- Frames: Self only
- Form submissions: Self only

**Future (Stricter):**
- Remove `unsafe-inline` for scripts
- Implement nonce-based inline script allowlist
- Add external monitoring endpoint

---

## Rate Limiting

### Configuration

```typescript
// Default limits in src/middleware/security.ts
const rateLimiter = {
  maxRequests: 100,      // Requests per window
  windowMs: 60000,        // Window duration (1 minute)
}
```

### Per-Endpoint Customization

```typescript
// Example: Login endpoint with tighter limits
export const POST = withRateLimit(
  loginHandler,
  { maxRequests: 5, windowMs: 900000 } // 5 per 15 minutes
)
```

### Bypass Conditions

Rate limiting is **skipped** for:
- Health check endpoints (`/api/health`)
- Static assets (`/_next/*`, `/public/*`)
- Well-known endpoints (`/.well-known/*`)

---

## Secrets Management

### Environment Variables

Never commit secrets! Use `.env.local` (git-ignored):

```bash
# .env.local
NEXT_PRIVATE_REVALIdATION_KEY=your-secret-here
STRIPE_SECRET_KEY=sk_...
DATABASE_PASSWORD=...
```

### Secret Rotation

| Secret | Rotation Frequency | Impact |
|--------|-------------------|--------|
| API Keys | 90 days | Service restart |
| Database Passwords | 180 days | Connection re-establishment |
| JWT Signing Keys | 365 days | Re-authentication needed |
| Webhook Secrets | 90 days | Integration restart |

### Secure Storage

- **Development:** `.env.local` (machine-specific)
- **Staging/Production:** 
  - Cloudflare Workers: Workers Secrets
  - Vercel: Environment variables (encrypted)
  - Docker: Docker secrets + Kubernetes
  - AWS: AWS Secrets Manager

---

## Incident Response

### Security Incident Checklist

1. **Detect & Isolate**
   - Alert team immediately
   - Disable affected service if needed
   - Collect evidence (logs, metrics)

2. **Assess Impact**
   - Determine scope: How many users/records affected?
   - Timeline: When did incident occur?
   - Type: Data breach, service disruption, code injection?

3. **Remediate**
   - Patch vulnerability immediately
   - Rotate affected credentials
   - Deploy fix to production

4. **Communicate**
   - Notify affected users within 24 hours
   - Publish incident report
   - Post-mortem within 1 week

5. **Prevent Recurrence**
   - Add automated detection (alerting)
   - Implement test case
   - Update security documentation

### Post-Incident Review

All security incidents trigger:
- Written incident report
- Root cause analysis
- Action items with owners and deadlines
- Shared learnings with team

---

## Compliance

### Standards & Frameworks

- **OWASP Top 10** — Mitigations implemented
- **CWE/SANS Top 25** — Addressed in code review
- **GDPR** — User data handling, deletion, portability
- **CCPA** — Privacy controls, data access
- **SOC 2** — Audit trail, access controls, encryption

### Security Checklist

- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] CSRF protection (tokens on state changes)
- [ ] Authentication enforced (no auth bypass)
- [ ] Authorization checked (no privilege escalation)
- [ ] Rate limiting enabled (prevent abuse)
- [ ] HTTPS enforced (TLS 1.3+)
- [ ] Security headers set (CSP, HSTS, etc.)
- [ ] Logging enabled (audit trail)
- [ ] Error handling (no info disclosure)
- [ ] Dependency scanning (no known vulnerabilities)
- [ ] Code review (peer review before merge)
- [ ] Testing (unit + integration coverage >80%)

### Annual Security Audit

Every January:
1. Third-party penetration testing
2. Code review by external firm
3. Dependency full inventory
4. Compliance certification renewal
5. Team security training

---

## Known Issues & Mitigations

| Issue | Severity | Mitigation | Status |
|-------|----------|-----------|--------|
| CSP allows unsafe-inline for scripts | Medium | Remove with nonce-based allowlist | Planned Q3 |
| Rate limiting in-memory only | Low | Migrate to Redis for multi-instance | Planned Q2 |
| No IP-based DDoS protection | Medium | Enable Cloudflare DDoS (managed) | Deployed |
| Session tokens in cookies | Low | Add token rotation & fingerprint | Planned Q2 |

---

## Security Contact

- **Email:** security@example.com
- **Response Time:** <4 hours for critical issues
- **Disclosure:** 90-day grace period before public disclosure

---

## References

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**Last Reviewed:** May 1, 2026  
**Next Review:** August 1, 2026  
**Approved By:** Security Team Lead
