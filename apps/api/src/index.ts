import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { v4 as uuid } from 'uuid';
import type { Bookmark, CreateBookmarkRequest, CreateBookmarkResponse } from '@bookmark-app/shared';

type Bindings = {
	// eslint-disable-next-line no-undef
	DB: D1Database;
	// eslint-disable-next-line no-undef
	ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware - allows all origins
app.use('/*', cors());

// POST /api/bookmarks - Create a new bookmark
app.post('/api/bookmarks', async (c) => {
	const body: CreateBookmarkRequest = await c.req.json();
	const id = uuid();

	await c.env.DB.prepare('INSERT INTO bookmarks (id, url, title, tags) VALUES (?, ?, ?, ?)')
		.bind(id, body.url, body.title, body.tags?.join(','))
		.run();

	return c.json<CreateBookmarkResponse>({ success: true, id });
});

// GET /api/bookmarks - Fetch all bookmarks or filter by tag
app.get('/api/bookmarks', async (c) => {
	const tagFilter = c.req.query('tag');

	const stmt = tagFilter
		? c.env.DB.prepare('SELECT * FROM bookmarks WHERE tags LIKE ? ORDER BY created_at DESC').bind(`%${tagFilter}%`)
		: c.env.DB.prepare('SELECT * FROM bookmarks ORDER BY created_at DESC');

	const { results } = await stmt.all();

	return c.json<Bookmark[]>(results as Bookmark[]);
});

// Serve SPA for all other routes
app.get('*', (c) => {
	return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
