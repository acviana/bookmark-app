# Bookmark App

A learning project by Alex Viana exploring Cloudflare's edge platform and modern TypeScript development.

## Stack

- **Database**: Cloudflare D1 (SQLite)
- **API**: Hono on Cloudflare Workers
- **Frontend**: React + Vite + Shadcn UI on Cloudflare Pages
- **Testing**: Vitest with official D1 testing pattern
- **Shared Types**: Workspace-based TypeScript types

## Development

```bash
npm install
npm run db:migrate:local   # Setup local D1 database
npm run dev                # Start API dev server
npm test                   # Run tests
```

## Quality Gates

- Pre-commit hooks (lint, typecheck, format)
- TypeScript strict mode
- ESLint + Prettier
- Comprehensive test coverage

See [AGENTS.md](./AGENTS.md) for detailed documentation and [WORKLOG.md](./WORKLOG.md) for development history.
