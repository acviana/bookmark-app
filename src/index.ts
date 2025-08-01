/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */


import { v4 as uuid } from 'uuid';

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const { pathname, searchParams } = url;

		if (request.method === 'POST' && pathname === '/bookmarks') {
			const body = await request.json();
			const id = uuid();
			await env.DB.prepare(
				'INSERT INTO bookmarks (id, url, title, tags) VALUES (?, ?, ?, ?)'
			).bind(id, body.url, body.title, body.tags?.join(',')).run();

			return Response.json({ success: true, id });
		}

		if (request.method === 'GET' && pathname === '/bookmarks') {
			const tagFilter = searchParams.get('tag');
			const stmt = tagFilter
				? env.DB.prepare("SELECT * FROM bookmarks WHERE tags LIKE ?").bind('%${tagFilter}%')
				: env.DB.prepare("SELECT * FROM bookmarks");

			const { results } = await stmt.all();
			return Response.json(results);
		}

		return new Response('Not Found', { status: 404 });
	}
};


