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

		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': '*', // or your frontend URL
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		}

		if (request.method === 'POST' && pathname === '/bookmarks') {
			const body = await request.json();
			const id = uuid();
			await env.DB.prepare(
				'INSERT INTO bookmarks (id, url, title, tags) VALUES (?, ?, ?, ?)'
			).bind(id, body.url, body.title, body.tags?.join(',')).run();

			return new Response(JSON.stringify({ success: true, id }), {
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}

		if (request.method === 'GET' && pathname === '/bookmarks') {
			const tagFilter = searchParams.get('tag');
			const stmt = tagFilter
				? env.DB.prepare("SELECT * FROM bookmarks WHERE tags LIKE ? ORDER BY created_at DESC").bind(`%${tagFilter}%`)
				: env.DB.prepare("SELECT * FROM bookmarks ORDER BY created_at DESC");

			const { results } = await stmt.all();

			return new Response(JSON.stringify(results), {
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}

		return new Response('Not Found', {
			status: 404,
			headers: { 'Access-Control-Allow-Origin': '*' },
		});
	},
};

