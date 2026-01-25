import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../apps/api/src/index';
import type { Bookmark, CreateBookmarkRequest, CreateBookmarkResponse } from '@bookmark-app/shared';

// eslint-disable-next-line no-undef
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('Bookmark API', () => {
	describe('POST /bookmarks', () => {
		it('creates a new bookmark successfully', async () => {
			const body: CreateBookmarkRequest = {
				url: 'https://example.com',
				title: 'Example Site',
				tags: ['test', 'example'],
			};

			const request = new IncomingRequest('http://localhost/bookmarks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});

			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			expect(response.status).toBe(200);
			const data = (await response.json()) as CreateBookmarkResponse;
			expect(data.success).toBe(true);
			expect(data.id).toBeDefined();
			expect(typeof data.id).toBe('string');
		});
	});

	describe('GET /bookmarks', () => {
		it('fetches all bookmarks', async () => {
			const request = new IncomingRequest('http://localhost/bookmarks');
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			expect(response.status).toBe(200);
			const data = (await response.json()) as Bookmark[];
			expect(Array.isArray(data)).toBe(true);
		});

		it('filters bookmarks by tag', async () => {
			const request = new IncomingRequest('http://localhost/bookmarks?tag=test');
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			expect(response.status).toBe(200);
			const data = (await response.json()) as Bookmark[];
			expect(Array.isArray(data)).toBe(true);
		});
	});

	describe('CORS', () => {
		it('handles CORS preflight requests', async () => {
			const request = new IncomingRequest('http://localhost/bookmarks', {
				method: 'OPTIONS',
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			expect(response.status).toBe(204);
			expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
			expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
			expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
		});
	});
});
