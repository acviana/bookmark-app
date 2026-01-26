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

### Table: bookmarks

| Column     | Type | Constraints               | Description                |
| ---------- | ---- | ------------------------- | -------------------------- |
| id         | TEXT | PRIMARY KEY               | Unique identifier (UUID)   |
| url        | TEXT | NOT NULL                  | Bookmark URL               |
| title      | TEXT | -                         | Bookmark title/description |
| tags       | TEXT | -                         | Comma-separated tags       |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Creation timestamp         |

### Indexes

- `idx_bookmarks_tags` - For faster tag filtering queries
- `idx_bookmarks_created_at` - For date sorting (DESC optimized)

## Adding New Migrations

1. Create a new file: `migrations/XXXX_description.sql`
2. Update this README with the new version
3. Test locally first: `npm run db:migrate:local`
4. Update production only when ready: `npm run db:migrate:remote`

## Best Practices

- Always use `IF NOT EXISTS` for tables and indexes
- Include descriptive comments in migration files
- Test migrations on local D1 before running on production
- Keep migrations idempotent (safe to run multiple times)
- Document any breaking changes
