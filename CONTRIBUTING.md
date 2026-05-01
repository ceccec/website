# Contributing to Payload Website

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Commit Conventions](#commit-conventions)
7. [Pull Request Process](#pull-request-process)
8. [Documentation](#documentation)
9. [Troubleshooting](#troubleshooting)

---

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. All contributors are expected to:

- Be respectful and professional
- Assume good intent
- Focus on constructive feedback
- Report violations to: conduct@example.com

---

## Getting Started

### Prerequisites

- **Node.js:** ≥20.9.0
- **pnpm:** ≥10.33.2
- **Git:** Latest version

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/payload-cms/website.git
cd website

# Install dependencies
pnpm install

# Create .env.local for local development
cp .env.example .env.local

# Start development server
npm run dev

# Open http://localhost:3000
```

### Database Setup

```bash
# For local development (SQLite via D1)
npm run db:setup

# For PostgreSQL
npm run db:setup:postgres

# Run migrations
npm run migrate
```

---

## Development Workflow

### Branch Naming

Create feature branches with clear, descriptive names:

```bash
# Feature branches
git checkout -b feature/user-authentication
git checkout -b feature/payment-integration

# Bug fixes
git checkout -b fix/cache-invalidation-race-condition

# Documentation
git checkout -b docs/api-reference

# Refactoring
git checkout -b refactor/simplify-cache-logic
```

### Feature Development

1. **Create feature branch from `main`**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature
   ```

2. **Make changes in small, logical commits**
   ```bash
   # Make changes
   git add .
   git commit -m "feat: add user profile page"
   
   # Make more changes
   git add .
   git commit -m "fix: correct profile layout on mobile"
   ```

3. **Keep branch updated**
   ```bash
   # Fetch latest
   git fetch origin
   git rebase origin/main
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature
   # Create PR on GitHub
   ```

### Working with Issues

1. Look for issues labeled `good-first-issue` or `help-wanted`
2. Comment on the issue to express interest
3. Create a feature branch: `feature/issue-{number}-description`
4. Reference issue in PR description: `Closes #123`

---

## Coding Standards

### TypeScript

All code must be TypeScript with strict mode enabled:

```bash
# Check types
npm run type-check
```

**Type-Safety Rules:**
- ✅ Always import types: `import type { User } from '@payload'`
- ✅ Use `const` for const values (not `var` or bare `let`)
- ✅ Type function parameters and return values
- ❌ No `any` types (ask for help if needed)
- ❌ No `!` non-null assertions (handle properly)

### Code Style

Use **Prettier** for formatting:

```bash
# Format all files
npm run prettier:fix

# Check formatting
npm run prettier
```

Use **ESLint** for code quality:

```bash
# Lint and fix
npm run lint

# Check only
npm run lint:check
```

**Style Guidelines:**
- Line length: 100 characters max
- Indentation: 2 spaces
- Strings: Single quotes `'string'`
- Semicolons: Required
- Trailing commas: ES5 style

### File Organization

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (site)/            # Public site pages
│   └── (admin)/           # Admin UI
├── lib/                    # Utilities & abstractions
│   ├── cache/             # Caching layer
│   ├── storage/           # File storage
│   ├── logger.ts          # Logging
│   └── metrics.ts         # Metrics
├── middleware/            # Next.js middleware
├── components/            # React components
├── utilities/             # Pure utility functions
├── plugins/               # Payload plugins
└── __tests__/             # Tests
    ├── unit/
    ├── integration/
    └── e2e/
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Files | `kebab-case` | `user-service.ts` |
| Directories | `kebab-case` | `src/lib/cache/` |
| Classes | `PascalCase` | `MemoryCacheBackend` |
| Functions | `camelCase` | `getUserById()` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_RETRIES = 3` |
| Variables | `camelCase` | `userId` |
| Types | `PascalCase` | `type UserProfile = {}` |
| Interfaces | `PascalCase` | `interface CacheBackend {}` |

### Comments & Documentation

**Required Comments:**
- Complex algorithms (explain logic)
- Non-obvious workarounds (explain why)
- Public API methods (JSDoc)
- Known limitations (with issue link)

**JSDoc Format:**
```typescript
/**
 * Get user by ID from cache or database
 * 
 * Falls back to database if cache miss occurs.
 * Results are cached for 1 hour.
 * 
 * @param userId - The user's unique ID
 * @returns Promise resolving to User or null if not found
 * @throws DatabaseError if database query fails
 */
export async function getUserById(userId: string): Promise<User | null> {
  // ...
}
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- cache.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should store"

# Watch mode (auto-rerun on changes)
npm test:watch

# Coverage report
npm test:coverage
```

### Writing Tests

**Test Structure:**
```typescript
describe('MemoryCacheBackend', () => {
  let backend: MemoryCacheBackend

  beforeEach(() => {
    backend = new MemoryCacheBackend()
  })

  describe('get/invalidate', () => {
    it('should return null for non-existent key', async () => {
      const result = await backend.get('missing-key')
      expect(result).toBeNull()
    })

    it('should return cached value after set', async () => {
      await backend.put('key', 'value')
      const result = await backend.get('key')
      expect(result).toBe('value')
    })
  })
})
```

**Coverage Requirements:**
- Minimum 80% for `src/lib/`
- Minimum 50% for other code
- All public methods must have tests
- All error paths must be tested
- Edge cases should be covered

### Performance Testing

```bash
# Measure function execution time
npm test -- --testNamePattern="performance"

# Profile memory usage
node --inspect scripts/profile.js
```

---

## Commit Conventions

Use **Conventional Commits** format:

```bash
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation change
- **style:** Code style (formatting, missing semicolons)
- **refactor:** Code refactoring without feature/fix
- **perf:** Performance improvement
- **test:** Adding or updating tests
- **chore:** Build, dependencies, tooling

### Scopes

- `cache` — Cache layer changes
- `storage` — Storage layer changes
- `auth` — Authentication changes
- `api` — API route changes
- `db` — Database changes
- `logging` — Logging changes
- `config` — Configuration changes

### Examples

```bash
git commit -m "feat(cache): implement Redis cache backend"

git commit -m "fix(auth): prevent race condition in session validation"

git commit -m "docs: add deployment guide for Cloudflare Workers"

git commit -m "test: add integration tests for payment API"

git commit -m "refactor: simplify cache key generation logic"

git commit -m "perf: optimize database query for user lookup"
```

---

## Pull Request Process

### Before Submitting

1. **Ensure tests pass**
   ```bash
   npm test
   npm test:coverage  # Check coverage meets thresholds
   ```

2. **Format code**
   ```bash
   npm run prettier:fix
   npm run lint
   ```

3. **Check types**
   ```bash
   npm run type-check
   ```

4. **Update documentation**
   - Update README if user-facing change
   - Update API.md if API change
   - Update ARCHITECTURE.md if architectural change

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Tested in development
- [ ] Tested in staging

## Checklist
- [ ] Code follows style guidelines
- [ ] Types are correct (no `any`)
- [ ] Tests pass and coverage maintained
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Commits follow convention

## Related Issues
Closes #123
```

### Review Process

1. **Automated Checks**
   - ✅ Tests pass
   - ✅ Coverage maintained (>80% for lib/)
   - ✅ Linting passes
   - ✅ Types check out

2. **Code Review**
   - At least 1 approval required
   - Maintainers check: correctness, style, tests
   - Suggestions are requests; approvals are requirements

3. **Merge**
   - Rebase and merge (linear history)
   - Delete branch after merge
   - Link related issues in commit message

---

## Documentation

### Code Documentation

All public APIs must have JSDoc:

```typescript
/**
 * Comprehensive description of what function does
 * 
 * More details if needed.
 * 
 * @param param1 - Description of first parameter
 * @param param2 - Description of second parameter
 * @returns Description of return value
 * @throws ErrorType if something goes wrong
 * 
 * @example
 * const result = myFunction('arg1', 'arg2')
 * console.log(result) // Output
 */
export function myFunction(param1: string, param2: number): Promise<string> {
  // ...
}
```

### Architecture Documentation

Significant architectural changes should be documented:

1. Update `ARCHITECTURE.md` with diagram/explanation
2. Add decision record: `docs/adr/ADR-###-title.md`
3. Link from relevant docs

### API Documentation

REST API endpoints should be documented in `API.md`:

```markdown
### POST /api/stripe/checkout-session

Create a new payment checkout session

**Request:**
```json
{
  "priceId": "price_123",
  "plan": "pro",
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel"
}
```

**Response:**
```json
{
  "provider": "stripe",
  "url": "https://checkout.stripe.com/..."
}
```

**Status Codes:**
- 200: Session created successfully
- 400: Invalid request
- 401: Unauthorized
```

---

## Troubleshooting

### Common Issues

**Node version mismatch**
```bash
# Check version
node --version  # Should be ≥20.9.0

# Use nvm to switch versions
nvm use 20.9.0
```

**Dependency conflicts**
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**TypeScript errors**
```bash
# Regenerate types
npm run generate:types

# Check for errors
npm run type-check
```

**Test failures**
```bash
# Run failing test in isolation
npm test -- specific.test.ts

# Run with verbose output
npm test -- --verbose

# Clear cache
npm test -- --clearCache
```

**Port already in use**
```bash
# Change port
PORT=3001 npm run dev

# Or kill process using 3000
lsof -ti :3000 | xargs kill -9
```

---

## Getting Help

- **Questions:** Open a discussion on GitHub
- **Bugs:** File an issue with reproduction steps
- **Security:** Email security@example.com (do not open issue)
- **Ideas:** Discussion or open issue with proposal

---

## Recognition

Contributors are recognized in:
- `CONTRIBUTORS.md` (for significant contributions)
- Release notes (for each PR merged)
- GitHub contributors page (automatic)

Thank you for contributing! 🙏

---

**Last Updated:** May 2026  
**Maintained By:** Core Team
