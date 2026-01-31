# Bookmark App

A learning project by Alex Viana exploring Cloudflare's edge platform and modern TypeScript development.

## Stack

- **Database**: Cloudflare D1 (SQLite)
- **API**: Hono on Cloudflare Workers
- **Frontend**: React + Vite 7 + Shadcn UI
- **Deployment**: Workers Static Assets (single Worker serves both API and frontend)
- **Testing**: Vitest with official D1 testing pattern
- **Shared Types**: Workspace-based TypeScript types

## Development

```bash
npm install
npm run db:migrate:local      # Setup local D1 database
cd apps/web && npm run dev    # Start dev server (Vite with Workers runtime)
npm test                      # Run tests
npm run deploy                # Deploy to production
```

## Quality Gates

- Pre-commit hooks (lint, typecheck, format)
- TypeScript strict mode
- ESLint + Prettier
- Comprehensive test coverage

See [AGENTS.md](./AGENTS.md) for detailed documentation and [WORKLOG.md](./WORKLOG.md) for development history.
