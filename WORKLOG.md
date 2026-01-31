# Development Worklog

## 2026-01-31 - Workers Static Assets Migration

### Objectives

- Migrate from separate Cloudflare Pages (frontend) + Workers (API) to unified Workers Static Assets
- Upgrade to Vite 7 to support Cloudflare Vite plugin
- Implement single-Worker deployment serving both API and frontend

### What Was Done

- ✅ **Upgraded Vite from v4 to v7**
  - Required for `@cloudflare/vite-plugin` compatibility
  - Updated `apps/web/package.json` to vite@^7.3.1
  - Updated all Vite-related dependencies (plugin-react@^4.3.5)
  - Fixed security vulnerability in glob package
- ✅ **Installed Cloudflare Vite plugin**
  - Added `@cloudflare/vite-plugin@^1.5.3` to apps/web
  - Renamed `apps/web/vite.config.ts` → `vite.config.mts` (ESM requirement)
  - Configured cloudflare() plugin with path to `../../wrangler.toml`
  - Enables Workers runtime in Vite dev server
- ✅ **Configured Workers Static Assets in wrangler.toml**
  - Renamed worker from `bookmark-api` to `bookmark-app`
  - Added `[assets]` block:
    - `directory = "./apps/web/dist"` - Frontend build output
    - `binding = "ASSETS"` - Binding name for Worker code
    - `not_found_handling = "single-page-application"` - SPA fallback
    - `run_worker_first = ["/api", "/api/*"]` - API routes bypass assets
- ✅ **Updated Hono API for static assets**
  - Added `ASSETS: Fetcher` to Bindings type in `apps/api/src/index.ts`
  - Renamed all routes with `/api/` prefix:
    - `POST /bookmarks` → `POST /api/bookmarks`
    - `GET /bookmarks` → `GET /api/bookmarks`
  - Added catch-all route: `app.get('*', (c) => c.env.ASSETS.fetch(c.req.raw))`
  - Removed `app.notFound()` handler (assets handle 404s now)
- ✅ **Updated frontend for unified deployment**
  - Changed API URL in `apps/web/src/App.tsx`:
    - From: `https://bookmark-api.alexcostaviana.workers.dev/bookmarks`
    - To: `/api/bookmarks` (relative path)
  - Frontend now calls same-origin API
- ✅ **Added build and deployment scripts**
  - `npm run build:web` - Build frontend only
  - `npm run deploy` - Build frontend + deploy Worker
  - `npm run dev:unified` - Test production build locally with wrangler dev
- ✅ **Updated tests for new routing**
  - Added `ASSETS: Fetcher` binding to `test/env.d.ts`
  - Updated all test URLs from `/bookmarks` to `/api/bookmarks`
  - Removed 404 test (unknown routes now serve SPA with 200, not 404)
  - All 4 tests passing (was 5 tests, removed 1)
- ✅ **Deployed to production**
  - Deployed Worker with static assets successfully
  - New URL: https://bookmark-app.alexcostaviana.workers.dev
  - Verified frontend (200 HTML) and API (200 JSON) both working
  - Total upload: 66.08 KiB / gzip: 16.35 KiB
  - 9 static assets uploaded

### Decisions Made

1. **Monorepo config approach**: Use relative path `../../wrangler.toml` in vite.config.mts (standard for single-Worker monorepos)
2. **Worker naming**: Renamed to `bookmark-app` (was `bookmark-api`) to reflect unified nature
3. **API route prefix**: Added `/api/` prefix to all endpoints for clear separation
4. **Dev workflow**: Document both Vite dev (with Workers runtime) and unified dev options
5. **Vite config format**: Use `.mts` extension (ESM requirement for Cloudflare plugin)
6. **404 handling**: Remove 404 test - SPAs return 200 with index.html for unknown routes (expected behavior)

### Architecture Changes

**Before**:

- Separate deployments: Cloudflare Pages (frontend) + Workers (API)
- Frontend at: `https://bookmark-app.pages.dev`
- API at: `https://bookmark-api.alexcostaviana.workers.dev`
- CORS required between deployments
- Two separate build/deploy processes

**After**:

- Single Worker deployment with Workers Static Assets
- Both frontend and API at: `https://bookmark-app.alexcostaviana.workers.dev`
- No CORS needed (same origin)
- Single build/deploy process
- Routing logic:
  - `/api/*` → Hono handler (billable Worker invocations)
  - `/assets/*` → Static files (free, served from edge)
  - `/` → index.html (free)
  - Unknown routes → SPA fallback to index.html (free)

### Issues Encountered

- ❌ Vite config with `.ts` extension caused ESM errors with Cloudflare plugin
- 💡 **Solution**: Renamed to `.mts` extension (ESM requirement)
- ❌ Security vulnerability in glob package (apps/web/package.json)
- 💡 **Solution**: Updated to glob@^11.0.1
- ⚠️ Browserslist data 6 months old warning
- 💡 **Note**: Cosmetic warning, can be fixed with `npx update-browserslist-db@latest`

### Commits Made

13. `2b0fef2` - feat: migrate to Workers Static Assets with Vite 7 and Cloudflare plugin

### What's Next

- Monitor deployment for 1-2 days
- Update documentation (AGENTS.md, README.md) with new workflows
- Consider disabling old Cloudflare Pages deployment
- Consider adding error handling middleware
- Consider adding request logging middleware

---

## 2026-01-25 - Pre-commit Hooks and D1 Testing Setup

### Objectives

- Set up quality gates (pre-commit hooks) before Hono migration
- Implement proper D1 testing with official Cloudflare pattern
- Expand test coverage for happy path scenarios

### What Was Done

- ✅ **Added pre-commit hooks with Husky**
  - Installed Husky and Prettier
  - Created `.husky/pre-commit` hook that runs on every commit:
    - `npm run lint` - ESLint checks
    - `npm run typecheck` - TypeScript type checking
    - `npm run format:check` - Prettier formatting verification
  - Added `"type": "module"` to package.json to eliminate ESLint warnings
  - Formatted entire codebase with Prettier (25 files updated)
- ✅ **Added comprehensive NPM scripts**
  - `npm run typecheck` - TypeScript validation
  - `npm run test:watch` - Watch mode for tests
  - `npm run test:coverage` - Test coverage reporting
  - `npm run format` - Auto-format with Prettier
  - `npm run format:check` - Check formatting without modifying
  - `npm run db:migrate:local` - Run local D1 migrations
  - `npm run db:migrate:remote` - Run remote D1 migrations (fixed database name: bookmark-app)

- ✅ **Implemented official Cloudflare D1 testing pattern**
  - Updated `vitest.config.mts` to use `readD1Migrations()` and `applyD1Migrations()`
  - Created `test/apply-migrations.ts` setup file for automatic schema migration
  - Added `TEST_MIGRATIONS` binding type to `test/env.d.ts`
  - Configured `singleWorker: true` for faster test execution
  - Tests now use proper isolated storage (automatic rollback per test)
  - No manual database setup needed in tests

- ✅ **Enhanced test coverage for happy path**
  - POST test now verifies bookmark ID is a non-empty string
  - Added integration test: POST bookmark → GET to verify persistence
  - Enhanced tag filter test to actually verify filtering works (not just response type)
  - Added 404 test for unknown routes
  - All 6 tests passing with proper D1 isolation

### Decisions Made

1. **Testing approach**: Use official `readD1Migrations()` + `applyD1Migrations()` pattern (not manual `beforeAll()` hooks)
2. **Pre-commit checks**: Run lint + typecheck + format:check (but not tests, as they may be slower)
3. **Vitest configuration**: Use `singleWorker: true` for faster tests with small test suites
4. **Database naming**: Fixed to use `bookmark-app` (from wrangler.toml) instead of incorrect `bookmark-db`

### Issues Encountered

- ❌ Initial attempt to use `env.DB.exec()` with multi-line SQL failed ("incomplete input" error)
- ❌ Using `beforeAll()` with `DB.prepare().run()` worked but wasn't the recommended pattern
- 💡 **Solution**: Research revealed official Cloudflare pattern with `readD1Migrations()` + setup files
- ❌ ESLint warning about module type when running hooks
- 💡 **Solution**: Added `"type": "module"` to package.json
- ❌ `D1Migration` type caused ESLint no-undef error
- 💡 **Solution**: Added `eslint-disable-next-line no-undef` comment

- ✅ **Migrated API to Hono framework**
  - Installed hono dependency
  - Rewrote `apps/api/src/index.ts` using Hono router and middleware
  - Replaced manual CORS handling with `hono/cors` middleware
  - Used Hono helpers: `c.req.json()`, `c.req.query()`, `c.json()`
  - Added TypeScript Bindings type for D1Database
  - Imported shared types from `@bookmark-app/shared`
  - Used `app.notFound()` for 404 handler
  - **Code reduced from 70 lines to 40 lines** (-43% reduction)
  - Removed CORS test (now tests framework internals, not our code)
  - All 5 remaining tests passing (was 6)

### Decisions Made (continued)

5. **CORS testing**: Remove CORS test after Hono migration - it tests framework code, not our implementation
6. **Hono approach**: Use built-in `cors()` middleware instead of manual implementation

### Commits Made

8. `047f335` - chore: add pre-commit hooks and NPM scripts
9. `ad5cf96` - fix: add type module to package.json to eliminate ESLint warning
10. `40db401` - feat: implement official Cloudflare D1 testing pattern with enhanced test coverage
11. `f2ca3ed` - test: add 404 test and update WORKLOG for 2026-01-25 session
12. `e641180` - feat: migrate API from vanilla Workers to Hono framework

### What's Next

- Update AGENTS.md to reflect Hono migration
- Update frontend to use shared types
- Add environment variable support for API URL
- Add error handling and logging middleware

---

## 2026-01-24 - Initial Planning and Documentation Setup

### Objectives

- Implement high-priority safety fixes
- Migrate API from vanilla Workers to Hono
- Establish proper documentation and project quality

### Planned Changes (In Progress)

#### Phase 1: Safety & Infrastructure ✅ COMPLETE

- [x] Create AGENTS.md and WORKLOG.md documentation
- [x] Fix vitest.config.mts (wrangler.jsonc → wrangler.toml)
- [x] Create apps/shared workspace with TypeScript types
- [x] Convert 6 UI components from .jsx to .tsx
- [x] Add ESLint configuration
- [x] Create D1 migration file and docs
- [x] Update API tests to match actual endpoints
- [x] Add pre-commit hooks (Husky) with lint/typecheck/format checks
- [x] Add comprehensive NPM scripts (typecheck, format, test:watch, etc.)
- [x] Implement official D1 testing pattern with readD1Migrations()
- [x] Enhanced test coverage (integration tests, tag filtering, 404)

#### Phase 2: Hono Migration ✅ COMPLETE

- [x] Migrate API to Hono framework
- [ ] Update frontend to use shared types
- [ ] Add environment variable support for API URL

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

### What Was Done

- ✅ Created IMPLEMENTATION_PLAN.md with complete execution plan
- ✅ Created AGENTS.md - AI agent playbook for understanding the repo
- ✅ Created WORKLOG.md - This file for tracking progress
- ✅ Fixed vitest.config.mts to reference correct wrangler.toml file
- ✅ Created apps/shared workspace with shared TypeScript types
  - Added Bookmark interface (matches D1 schema)
  - Added CreateBookmarkRequest interface
  - Added CreateBookmarkResponse interface
  - Configured workspace in package.json
  - Added path mapping in tsconfig.json
  - Types defined but not yet consumed (will be used in tasks 7, 8, 9)
- ✅ Converted 6 UI components from .jsx to .tsx
  - badge.tsx - Added BadgeProps interface
  - button.tsx - Added ButtonProps with variant and size types
  - input.tsx - Added InputProps interface
  - label.tsx - Added LabelProps using Radix UI types
  - table.tsx - Added interfaces for all 8 table components
  - dialog.tsx - Added interfaces for all dialog components
  - Used permissive typing (extending HTML attributes)
  - Git preserved rename history
- ✅ Added ESLint configuration with TypeScript and React support
  - Installed ESLint 9.x with flat config format
  - Configured @typescript-eslint/recommended preset
  - Added React and React Hooks plugins
  - Fixed all empty interface issues (changed to type aliases)
  - Fixed React useCallback/useEffect dependencies in App.tsx
  - Disabled prop-types (using TypeScript instead)
  - Added lint and lint:fix scripts to package.json
  - All files now pass linting with zero errors
- ✅ Created database migration files and documentation
  - migrations/0001_initial_schema.sql with bookmarks table schema
  - Added indexes for tags and created_at for performance
  - migrations/README.md with comprehensive documentation
  - Includes local and production migration commands
  - Schema matches existing production D1 database
  - Migration is idempotent (safe to run multiple times)
- ✅ Updated API tests to match actual bookmark endpoints
  - Rewrote test/index.spec.ts with proper bookmark API tests
  - Removed old "Hello World" tests
  - Added tests for POST /bookmarks (create bookmark)
  - Added tests for GET /bookmarks (fetch all)
  - Added tests for GET /bookmarks?tag=X (filter by tag)
  - Added tests for CORS preflight requests
  - Using shared types from @bookmark-app/shared
  - Tests currently fail due to missing local D1 table (expected)

### Issues Encountered

- ESLint 9 requires new flat config format (eslint.config.js instead of .eslintrc.json)
- Empty interface warnings resolved by using type aliases instead
- React hooks exhaustive-deps warnings fixed with useCallback
- Tests fail with "no such table: bookmarks" - need local D1 migration or will pass after Hono migration

### Commits Made

1. `9849692` - docs: add AGENTS.md and WORKLOG.md for AI agent guidance
2. `2d97533` - fix: update vitest config to reference wrangler.toml
3. `55ed008` - feat: add shared types workspace for API/web consistency
4. `045f93c` - refactor: convert UI components from jsx to tsx
5. `0cef33c` - feat: add ESLint with TypeScript and React support
6. `cd54819` - docs: add database schema migration and documentation
7. `c8019f3` - test: update API tests for bookmark endpoints

### Notes

- Database schema retrieved from production D1
- Current API has no validation or error handling
- Frontend has hardcoded API URL
- Tests now match actual API but need local D1 setup

### Next Steps

- Commit updated API tests
- Migrate API to Hono framework (will make tests pass)
- Update frontend to use shared types
- Add environment variables and remaining enhancements

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
