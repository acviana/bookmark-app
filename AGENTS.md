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
