# IMPLEMENTATION PLAN - Bookmark App Quality Improvements

**Created**: 2026-01-22  
**Status**: Ready for Execution  
**Estimated Commits**: 14 logical groupings

---

## Overview

**Objective**: Implement high-priority safety fixes, migrate API to Hono, and establish proper project documentation for AI agents.

**Execution Model**: Read-only planning → Get approval → Execute in logical batches → Request review before each commit

---

## Decisions Made

1. **Shared types location**: `apps/shared/` workspace (scalable, monorepo best practice)
2. **UI component typing**: Permissive initially (use `any` to get working, tighten later)
3. **Hono validation**: Keep simple for now (no Zod initially)
4. **ESLint preset**: @typescript-eslint/recommended
5. **Migration file**: Created as documentation/reproducibility (existing DB doesn't need re-running)
6. **Env files**: Keep .env.development and .env.production committed (no secrets)
7. **Test coverage**: Happy path initially
8. **Commit strategy**: Logical groupings with approval before each commit

---

## Database Schema (Retrieved from Production)

```sql
CREATE TABLE bookmarks (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT,
    tags TEXT,  -- comma-separated
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## New Documentation Files (Created First)

### File 1: `AGENTS.md` - AI Agent Playbook

**Purpose**: Help AI agents understand this codebase and work effectively on it

**Content Structure**:
```markdown
# AI Agent Playbook - Bookmark App

## Project Overview
- **Type**: Bookmarking application (monorepo/monolith)
- **Stack**: Cloudflare Workers + D1 + React + TypeScript
- **Structure**: Workspace-based with apps/ directory

## Codebase Structure

### Workspaces
- `apps/api/` - Hono backend (Cloudflare Workers)
- `apps/web/` - React frontend (Vite + Shadcn UI)
- `apps/shared/` - Shared TypeScript types

### Key Directories
- `migrations/` - D1 database schema and migrations
- `test/` - Vitest tests for API
- `apps/web/src/components/ui/` - Shadcn UI components

## Technology Stack

### Backend (apps/api)
- **Runtime**: Cloudflare Workers
- **Framework**: Hono (web framework)
- **Database**: Cloudflare D1 (SQLite)
- **Testing**: Vitest with @cloudflare/vitest-pool-workers

### Frontend (apps/web)
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **UI**: Shadcn UI + Tailwind CSS + Radix UI primitives
- **Styling**: Tailwind CSS with tailwindcss-animate

### Shared
- **Types**: Centralized in apps/shared for API/web consistency

## Code Conventions

### TypeScript
- **Strict mode enabled** (tsconfig.json)
- **Path aliases**: `@/` maps to `src/` in web app
- **Shared types**: Import from `@bookmark-app/shared`

### Formatting
- **Tool**: Prettier
- **Config**: .prettierrc (tabs, single quotes, 140 char width)
- **Run**: `npm run format`

### Linting
- **Tool**: ESLint with TypeScript + React plugins
- **Preset**: @typescript-eslint/recommended
- **Run**: `npm run lint` or `npm run lint:fix`

### Commits
- **Style**: Conventional commits (feat:, fix:, refactor:, etc.)
- **Atomicity**: One logical change per commit
- **Process**: Show changes → get approval → commit

## Database Schema

### Table: bookmarks
```sql
CREATE TABLE bookmarks (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT,
    tags TEXT,  -- comma-separated
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes
- `idx_bookmarks_tags` - For tag filtering
- `idx_bookmarks_created_at` - For date sorting

## API Endpoints

### Backend API (apps/api)
- **Base URL Dev**: http://localhost:8787
- **Base URL Prod**: https://bookmark-api.alexcostaviana.workers.dev

#### Endpoints
- `POST /bookmarks` - Create bookmark
  - Body: `{ url, title, tags: string[] }`
  - Returns: `{ success: boolean, id: string }`
- `GET /bookmarks` - List all bookmarks (DESC by created_at)
- `GET /bookmarks?tag=X` - Filter by tag

#### Middleware Stack
1. Logger (request logging)
2. Error handler (catches unhandled errors)
3. CORS (allow all origins)

## Development Workflow

### Setup
```bash
npm install
npm run db:migrate:local  # Set up local D1
```

### Running
```bash
npm run dev              # Start API dev server
cd apps/web && npm run dev  # Start frontend (separate terminal)
```

### Testing
```bash
npm test                 # Run all tests
npm run test:coverage    # With coverage
npm run typecheck        # TypeScript validation
npm run lint             # Linting
```

### Database Operations
```bash
npm run db:migrate:local   # Local migration
npm run db:migrate:remote  # Production migration (careful!)
```

## Common Tasks

### Adding a New API Endpoint
1. Update `apps/api/src/index.ts`
2. Add types to `apps/shared/src/types.ts` if needed
3. Add tests in `test/index.spec.ts`
4. Run `npm test` to verify

### Adding a New React Component
1. Create in `apps/web/src/components/`
2. Use TypeScript (.tsx extension)
3. Import UI components from `@/components/ui/`
4. Follow existing patterns (see App.tsx)

### Modifying Shared Types
1. Edit `apps/shared/src/types.ts`
2. Types are automatically available in API and web via imports
3. Run `npm run typecheck` to verify no breaks

### Database Schema Changes
1. Create new migration file: `migrations/XXXX_description.sql`
2. Update `apps/shared/src/types.ts` to match
3. Run migration locally first
4. Test thoroughly before remote migration

## Troubleshooting

### Type errors in UI components
- Ensure components use `.tsx` extension
- Check `@/` path alias is configured in vite.config.ts

### Import errors for shared types
- Verify `apps/shared` is in root package.json workspaces
- Check tsconfig.json has path mapping for `@bookmark-app/shared`

### D1 database issues
- Local: Ensure wrangler.toml points to correct database
- Remote: Verify database_id matches in wrangler.toml

### CORS errors
- Check CORS middleware is enabled in apps/api/src/index.ts
- Verify API URL in frontend matches (check .env files)

## Architecture Decisions

### Why Hono?
- Lightweight, fast, TypeScript-first
- Excellent Cloudflare Workers support
- Clean middleware system
- Better DX than raw Workers API

### Why Workspace-based Shared Types?
- Single source of truth
- Type safety between API and frontend
- Scales better than duplication
- Follows monorepo best practices

### Why D1?
- Integrated with Cloudflare Workers (low latency)
- SQLite-compatible (familiar, powerful)
- Free tier suitable for learning projects

### Why Shadcn UI?
- Copy-paste component model (full control)
- Built on Radix UI (accessible, unstyled)
- Tailwind-based (customizable)

## Project Context

This is a **learning project** by Alex Viana to explore:
- Cloudflare platform (Workers, D1, Pages)
- Modern TypeScript patterns
- React + Vite ecosystem
- AI-assisted development

Code quality is prioritized over features. The goal is production-quality code, even for a simple bookmarking app.

## Working with This Repo

### Before Making Changes
1. Read WORKLOG.md to see what's been tried
2. Run `npm run typecheck` and `npm test` to verify current state
3. Create a plan and get user approval

### During Changes
1. Update WORKLOG.md as you work
2. Fix linting/type errors immediately
3. Show diff before committing

### After Changes
1. Run full verification (`typecheck`, `lint`, `test`)
2. Update WORKLOG.md with results
3. Request commit approval with clear message

## Resources

- [Hono Documentation](https://hono.dev)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Shadcn UI](https://ui.shadcn.com)
- [Vitest](https://vitest.dev)
```

---

### File 2: `WORKLOG.md` - Development Activity Log

**Purpose**: Track what's been done, issues encountered, what's remaining

**Initial Content**:
```markdown
# Development Worklog

## 2026-01-22 - Initial Planning Session

### Objectives
- Implement high-priority safety fixes
- Migrate API from vanilla Workers to Hono
- Establish proper documentation and project quality

### Planned Changes (Not Yet Executed)

#### Phase 1: Safety & Infrastructure
- [ ] Fix vitest.config.mts (wrangler.jsonc → wrangler.toml)
- [ ] Create apps/shared workspace with TypeScript types
- [ ] Convert 6 UI components from .jsx to .tsx
- [ ] Add ESLint configuration
- [ ] Create D1 migration file and docs
- [ ] Update API tests to match actual endpoints

#### Phase 2: Hono Migration
- [ ] Migrate API to Hono framework
- [ ] Update frontend to use shared types
- [ ] Add environment variable support for API URL
- [ ] Add npm scripts (typecheck, lint, etc.)

#### Phase 3: Enhancements
- [ ] Add error handling middleware
- [ ] Add request logging middleware
- [ ] Final verification

### Decisions Made
1. **Shared types location**: `apps/shared/` workspace (scalable, monorepo best practice)
2. **UI component typing**: Permissive initially (use `any` to get working, tighten later)
3. **Hono validation**: Keep simple for now (no Zod initially)
4. **ESLint preset**: @typescript-eslint/recommended
5. **Migration file**: Created as documentation/reproducibility (existing DB doesn't need re-running)
6. **Env files**: Keep .env.development and .env.production committed (no secrets)
7. **Test coverage**: Happy path initially
8. **Commit strategy**: Logical groupings with approval before each commit

### Notes
- Database schema retrieved from production D1
- Current API has no validation or error handling
- Frontend has hardcoded API URL
- Tests are outdated (still testing "Hello World")

### Next Session
- Execute Phase 1 tasks
- Create atomic commits with user approval
- Update this log as work progresses

---

## How to Use This Log

**For AI Agents**:
- Read newest entries first (top of file)
- Check "Issues Encountered" to avoid repeating failed approaches
- Update after each significant change or discovery
- Mark tasks complete with ✅ when done

**Format for Updates**:
```
## YYYY-MM-DD - Brief Session Description

### What Was Done
- ✅ Completed task descriptions

### Issues Encountered
- ❌ Problem description
- 💡 Solution or workaround

### What's Next
- Remaining tasks
```
```

---

## Implementation Tasks & Commits

### Commit 1: Documentation Foundation
**Files**:
- `AGENTS.md` (new)
- `WORKLOG.md` (new)

**Commit message**: `docs: add AGENTS.md and WORKLOG.md for AI agent guidance`

**Why first**: Establishes documentation pattern, helps future agents (and this one!)

---

### Commit 2: Fix Vitest Configuration
**Files**:
- `vitest.config.mts` (modify line 7)

**Change**: `configPath: './wrangler.jsonc'` → `configPath: './wrangler.toml'`

**Commit message**: `fix: update vitest config to reference wrangler.toml`

**Verification**: Tests should be runnable (even if they fail)

---

### Commit 3: Create Shared Types Workspace
**Files**:
- `apps/shared/package.json` (new)
- `apps/shared/tsconfig.json` (new)
- `apps/shared/src/types.ts` (new)
- `package.json` (modify - add to workspaces)
- `tsconfig.json` (modify - add path mapping)

**Commit message**: `feat: add shared types workspace for API/web consistency`

**Types to include**:
```typescript
export interface Bookmark {
  id: string;
  url: string;
  title: string;
  tags: string;
  created_at: string;
}

export interface CreateBookmarkRequest {
  url: string;
  title: string;
  tags?: string[];
}

export interface CreateBookmarkResponse {
  success: boolean;
  id: string;
}
```

**Verification**: `npm install` should recognize workspace, typecheck should pass

---

### Commit 4: Convert UI Components to TypeScript
**Files** (6 renames):
- `apps/web/src/components/ui/badge.jsx` → `.tsx`
- `apps/web/src/components/ui/button.jsx` → `.tsx`
- `apps/web/src/components/ui/dialog.jsx` → `.tsx`
- `apps/web/src/components/ui/input.jsx` → `.tsx`
- `apps/web/src/components/ui/label.jsx` → `.tsx`
- `apps/web/src/components/ui/table.jsx` → `.tsx`

**Commit message**: `refactor: convert UI components from jsx to tsx`

**Approach**: Add minimal TypeScript typing (permissive with `any` where needed)

**Example for badge.tsx**:
```typescript
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}
```

**Verification**: `npm run typecheck` should pass, app should build

---

### Commit 5: Add ESLint Configuration
**Files**:
- `.eslintrc.json` (new)
- `.eslintignore` (new)
- `package.json` (modify - add dev dependencies)

**Dependencies to install**:
```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D eslint-plugin-react eslint-plugin-react-hooks
```

**Commit message**: `feat: add ESLint with TypeScript and React support`

**ESLint config**:
```json
{
  "root": true,
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2021,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": ["@typescript-eslint", "react", "react-hooks"],
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "rules": {
    "react/react-in-jsx-scope": "off"
  }
}
```

**.eslintignore**:
```
node_modules
dist
.wrangler
worker-configuration.d.ts
```

**Post-install**: Fix all linting errors found

**Verification**: `npm run lint` should pass

---

### Commit 6: Add Database Migration and Documentation
**Files**:
- `migrations/0001_initial_schema.sql` (new)
- `migrations/README.md` (new)

**Commit message**: `docs: add database schema migration and documentation`

**Migration file content**:
```sql
-- Migration: Initial bookmark schema
-- Created: 2026-01-22
-- Description: Creates the bookmarks table for storing user bookmarks

CREATE TABLE IF NOT EXISTS bookmarks (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT,
    tags TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster tag filtering
CREATE INDEX IF NOT EXISTS idx_bookmarks_tags ON bookmarks(tags);

-- Index for date sorting (DESC is the most common query pattern)
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks(created_at DESC);
```

**migrations/README.md**:
```markdown
# Database Migrations

## Schema Overview
- **Database**: Cloudflare D1 (SQLite)
- **Current Version**: 0001

## Running Migrations

### Local Development
```bash
npx wrangler d1 execute bookmark-app --local --file=./migrations/0001_initial_schema.sql
```

### Production
```bash
npx wrangler d1 execute bookmark-app --remote --file=./migrations/0001_initial_schema.sql
```

**NOTE**: The production database already has this schema. This migration is for:
- Setting up local development databases
- Documentation of the schema
- Reproducibility for new developers

## Schema

See [0001_initial_schema.sql](./0001_initial_schema.sql) for current schema.

## Adding New Migrations

1. Create a new file: `migrations/XXXX_description.sql`
2. Update this README with the new version
3. Test locally first: `npm run db:migrate:local`
4. Update production only when ready: `npm run db:migrate:remote`
```

**Note**: This is for documentation and local dev setup, not to be run on existing production DB

**Verification**: File syntax is valid SQL

---

### Commit 7: Update API Tests
**Files**:
- `test/index.spec.ts` (complete rewrite)

**Commit message**: `test: update API tests to match bookmark endpoints`

**New test structure**:
```typescript
import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll } from 'vitest';
import worker from '../apps/api/src/index';
import type { Bookmark, CreateBookmarkRequest, CreateBookmarkResponse } from '@bookmark-app/shared';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('Bookmark API', () => {
  describe('POST /bookmarks', () => {
    it('creates a new bookmark successfully', async () => {
      const body: CreateBookmarkRequest = {
        url: 'https://example.com',
        title: 'Example',
        tags: ['test', 'demo']
      };
      
      const request = new IncomingRequest('http://localhost/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, env, ctx);
      await waitOnExecutionContext(ctx);
      
      expect(response.status).toBe(200);
      const data: CreateBookmarkResponse = await response.json();
      expect(data.success).toBe(true);
      expect(data.id).toBeDefined();
    });
  });

  describe('GET /bookmarks', () => {
    it('fetches all bookmarks', async () => {
      const request = new IncomingRequest('http://localhost/bookmarks');
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, env, ctx);
      await waitOnExecutionContext(ctx);
      
      expect(response.status).toBe(200);
      const data: Bookmark[] = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('filters bookmarks by tag', async () => {
      const request = new IncomingRequest('http://localhost/bookmarks?tag=test');
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, env, ctx);
      await waitOnExecutionContext(ctx);
      
      expect(response.status).toBe(200);
      const data: Bookmark[] = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('OPTIONS /bookmarks (CORS)', () => {
    it('handles CORS preflight', async () => {
      const request = new IncomingRequest('http://localhost/bookmarks', {
        method: 'OPTIONS'
      });
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, env, ctx);
      await waitOnExecutionContext(ctx);
      
      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });
  });
});
```

**Note**: Tests will initially fail against current API, will pass after Hono migration

**Verification**: Tests run (even if failing)

---

### Commit 8: Migrate API to Hono
**Files**:
- `apps/api/src/index.ts` (complete rewrite)
- `package.json` (add hono dependency)

**Dependencies**:
```bash
npm install hono
```

**Commit message**: `feat: migrate API to Hono framework`

**New API structure**:
```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { v4 as uuid } from 'uuid';
import type { Bookmark, CreateBookmarkRequest, CreateBookmarkResponse } from '@bookmark-app/shared';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware
app.use('/*', cors());

// POST /bookmarks - Create a new bookmark
app.post('/bookmarks', async (c) => {
  const body: CreateBookmarkRequest = await c.req.json();
  const id = uuid();
  
  await c.env.DB.prepare(
    'INSERT INTO bookmarks (id, url, title, tags) VALUES (?, ?, ?, ?)'
  ).bind(id, body.url, body.title, body.tags?.join(',')).run();
  
  return c.json<CreateBookmarkResponse>({ success: true, id });
});

// GET /bookmarks - Fetch all bookmarks or filter by tag
app.get('/bookmarks', async (c) => {
  const tagFilter = c.req.query('tag');
  
  const stmt = tagFilter
    ? c.env.DB.prepare("SELECT * FROM bookmarks WHERE tags LIKE ? ORDER BY created_at DESC")
        .bind(`%${tagFilter}%`)
    : c.env.DB.prepare("SELECT * FROM bookmarks ORDER BY created_at DESC");
  
  const { results } = await stmt.all();
  return c.json<Bookmark[]>(results as Bookmark[]);
});

// 404 handler
app.notFound((c) => {
  return c.text('Not Found', 404);
});

export default app;
```

**Key changes**:
- ✅ Same API interface (backwards compatible)
- ✅ CORS via middleware
- ✅ Uses shared types
- ✅ Cleaner, more maintainable
- ✅ Better TypeScript support

**Verification**: `npm test` should pass, `npm run dev` should work

---

### Commit 9: Update Frontend to Use Shared Types
**Files**:
- `apps/web/src/App.tsx` (modify)
- `apps/web/package.json` (add dependency if needed)

**Commit message**: `refactor: use shared types in frontend`

**Changes to App.tsx**:
```typescript
// Remove lines 28-34 (local Bookmark type definition)

// Add import at top:
import type { Bookmark, CreateBookmarkRequest } from '@bookmark-app/shared';

// Use CreateBookmarkRequest for type safety in handleSubmit
```

**Verification**: Frontend should build and typecheck

---

### Commit 10: Add Environment Variable Support
**Files**:
- `apps/web/.env.example` (new)
- `apps/web/.env.development` (new)
- `apps/web/.env.production` (new)
- `apps/web/src/App.tsx` (modify line 47)

**Commit message**: `feat: add environment variable support for API URL`

**Env files**:

`.env.example`:
```env
VITE_API_URL=http://localhost:8787
```

`.env.development`:
```env
VITE_API_URL=http://localhost:8787
```

`.env.production`:
```env
VITE_API_URL=https://bookmark-api.alexcostaviana.workers.dev
```

**App.tsx change**:
```typescript
// Before (line 47):
const api_url = "https://bookmark-api.alexcostaviana.workers.dev/bookmarks";

// After:
const api_url = `${import.meta.env.VITE_API_URL}/bookmarks`;
```

**Verification**: Frontend should work in both dev and prod builds

---

### Commit 11: Add NPM Scripts
**Files**:
- `package.json` (modify scripts section)

**Commit message**: `chore: add typecheck, lint, and database scripts`

**New scripts**:
```json
{
  "scripts": {
    "deploy": "wrangler deploy",
    "dev": "wrangler dev",
    "start": "wrangler dev",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "cf-typegen": "wrangler types",
    "typecheck": "tsc --noEmit",
    "typecheck:watch": "tsc --noEmit --watch",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "db:migrate:local": "wrangler d1 execute bookmark-app --local --file=./migrations/0001_initial_schema.sql",
    "db:migrate:remote": "wrangler d1 execute bookmark-app --remote --file=./migrations/0001_initial_schema.sql"
  }
}
```

**Verification**: Each script runs without errors

---

### Commit 12: Add Error Handling Middleware
**Files**:
- `apps/api/src/middleware/errorHandler.ts` (new)
- `apps/api/src/index.ts` (modify)

**Commit message**: `feat: add error handling middleware to Hono API`

**errorHandler.ts**:
```typescript
import type { Context, Next } from 'hono';
import type { StatusCode } from 'hono/utils/http-status';

export interface ApiError {
  error: string;
  message: string;
  status: number;
}

export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (err) {
    console.error('API Error:', err);
    
    const error = err as Error;
    const status: StatusCode = 500;
    
    return c.json<ApiError>(
      {
        error: error.name || 'InternalServerError',
        message: error.message || 'An unexpected error occurred',
        status,
      },
      status
    );
  }
};
```

**index.ts update**:
```typescript
import { errorHandler } from './middleware/errorHandler';

// Add after app initialization:
app.use('/*', errorHandler);
```

**Verification**: API handles errors gracefully

---

### Commit 13: Add Request Logging Middleware
**Files**:
- `apps/api/src/middleware/logger.ts` (new)
- `apps/api/src/index.ts` (modify)

**Commit message**: `feat: add request logging middleware to Hono API`

**logger.ts**:
```typescript
import type { Context, Next } from 'hono';

export const logger = async (c: Context, next: Next) => {
  const start = Date.now();
  const { method, url } = c.req;
  
  await next();
  
  const duration = Date.now() - start;
  const status = c.res.status;
  
  console.log(`[${method}] ${url} - ${status} (${duration}ms)`);
};
```

**index.ts update**:
```typescript
import { logger } from './middleware/logger';

// Add before errorHandler:
app.use('/*', logger);
```

**Middleware order in final index.ts**:
```typescript
app.use('/*', logger);        // First - log everything
app.use('/*', errorHandler);  // Second - catch errors
app.use('/*', cors());        // Third - handle CORS

// ... then routes
```

**Verification**: Logs appear in console during dev

---

### Commit 14: Final Verification and Worklog Update
**Files**:
- `WORKLOG.md` (update)

**Commit message**: `docs: update worklog with implementation results`

**Tasks**:
1. Run `npm install`
2. Run `npm run typecheck` - verify passes
3. Run `npm run lint` - verify passes
4. Run `npm run format:check` - verify passes
5. Run `npm test` - verify all tests pass
6. Run `npm run dev` - manually test API
7. Test frontend in browser
8. Update WORKLOG.md with results

**WORKLOG.md update template**:
```markdown
## 2026-01-22 - Implementation Complete

### What Was Done
- ✅ Created AGENTS.md and WORKLOG.md documentation
- ✅ Fixed vitest.config.mts to reference wrangler.toml
- ✅ Created apps/shared workspace with shared TypeScript types
- ✅ Converted 6 UI components from .jsx to .tsx
- ✅ Added ESLint configuration with TypeScript and React support
- ✅ Created database migration file and documentation
- ✅ Updated API tests to match actual bookmark endpoints
- ✅ Migrated API to Hono framework
- ✅ Updated frontend to use shared types
- ✅ Added environment variable support for API URL
- ✅ Added npm scripts for typecheck, lint, format, and db operations
- ✅ Added error handling middleware to Hono API
- ✅ Added request logging middleware to Hono API
- ✅ All tests passing, typecheck clean, lint clean

### Issues Encountered
- [Document any issues that came up during implementation]

### Verification Results
- TypeScript: ✅ No errors
- ESLint: ✅ No errors
- Tests: ✅ All passing
- Dev server: ✅ Working
- Frontend: ✅ Working

### Next Steps
- Consider adding input validation to API endpoints
- Consider adding Zod validation in the future
- Consider tightening TypeScript types in UI components
- Consider adding more comprehensive tests (error cases, edge cases)
```

**Verification**: Everything works end-to-end

---

## Summary

### Total Commits: 14 (in logical groupings)

**Commit Sequence**:
1. Documentation foundation (AGENTS.md, WORKLOG.md)
2. Fix vitest config
3. Shared types workspace
4. Convert UI components to TypeScript
5. ESLint configuration (+ fix all issues)
6. Database migration docs
7. Update API tests
8. Migrate to Hono
9. Use shared types in frontend
10. Environment variables
11. NPM scripts
12. Error handling middleware
13. Logging middleware
14. Final verification + worklog

### Files Created: ~20+
### Files Modified: ~15+
### Dependencies Added: 6

**New Dependencies**:
- `hono` - Web framework
- `eslint` - Linter
- `@typescript-eslint/parser` - TypeScript parser for ESLint
- `@typescript-eslint/eslint-plugin` - TypeScript rules for ESLint
- `eslint-plugin-react` - React rules for ESLint
- `eslint-plugin-react-hooks` - React hooks rules for ESLint

---

## Final File Tree

```
bookmark-app/
├── AGENTS.md                      ⭐ NEW - AI agent playbook
├── WORKLOG.md                     ⭐ NEW - Development log
├── IMPLEMENTATION_PLAN.md         📋 This file
├── .eslintrc.json                 ⭐ NEW - ESLint config
├── .eslintignore                  ⭐ NEW - ESLint ignore
├── migrations/                    ⭐ NEW
│   ├── 0001_initial_schema.sql   ⭐ NEW
│   └── README.md                  ⭐ NEW
├── apps/
│   ├── shared/                    ⭐ NEW - Shared types workspace
│   │   ├── package.json          ⭐ NEW
│   │   ├── tsconfig.json         ⭐ NEW
│   │   └── src/
│   │       └── types.ts          ⭐ NEW
│   ├── api/
│   │   └── src/
│   │       ├── index.ts          ✏️ MODIFIED (Hono)
│   │       └── middleware/       ⭐ NEW
│   │           ├── errorHandler.ts ⭐ NEW
│   │           └── logger.ts     ⭐ NEW
│   └── web/
│       ├── .env.example          ⭐ NEW
│       ├── .env.development      ⭐ NEW
│       ├── .env.production       ⭐ NEW
│       └── src/
│           ├── App.tsx           ✏️ MODIFIED (env vars, shared types)
│           └── components/ui/
│               ├── badge.tsx     ✏️ RENAMED from .jsx
│               ├── button.tsx    ✏️ RENAMED from .jsx
│               ├── dialog.tsx    ✏️ RENAMED from .jsx
│               ├── input.tsx     ✏️ RENAMED from .jsx
│               ├── label.tsx     ✏️ RENAMED from .jsx
│               └── table.tsx     ✏️ RENAMED from .jsx
├── test/
│   └── index.spec.ts             ✏️ MODIFIED (new tests)
├── package.json                   ✏️ MODIFIED (scripts, deps, workspaces)
├── tsconfig.json                  ✏️ MODIFIED (path mappings)
├── vitest.config.mts              ✏️ MODIFIED (wrangler.toml)
└── wrangler.toml                  (unchanged)
```

---

## Execution Checklist for Next Session

When resuming:

1. ✅ Read AGENTS.md to understand the codebase
2. ✅ Read WORKLOG.md to see what's been done
3. ✅ Read this IMPLEMENTATION_PLAN.md for the execution plan
4. ✅ Verify current state: `npm run typecheck`, `npm test`
5. ✅ Execute commits in order, requesting approval before each
6. ✅ Update WORKLOG.md as you progress
7. ✅ Run verification suite after completion

---

## Notes for AI Agent

- **Read WORKLOG.md first** - Check if any work has already been started
- **Atomic commits** - Each commit should be independently reviewable and revertible
- **Request approval** - Show diff before each commit
- **Fix issues immediately** - Don't accumulate linting/type errors
- **Update WORKLOG.md** - Document issues and solutions as you go
- **Test frequently** - Run typecheck and tests after each major change

---

**End of Implementation Plan**
