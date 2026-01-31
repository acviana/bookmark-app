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

			const request = new IncomingRequest('http://localhost/api/bookmarks', {
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
			expect(data.id.length).toBeGreaterThan(0);
		});

		it('creates a bookmark and retrieves it via GET', async () => {
			// Create a bookmark
			const body: CreateBookmarkRequest = {
				url: 'https://test-integration.com',
				title: 'Integration Test',
				tags: ['integration', 'test'],
			};

			const postRequest = new IncomingRequest('http://localhost/api/bookmarks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});

			const postCtx = createExecutionContext();
			const postResponse = await worker.fetch(postRequest, env, postCtx);
			await waitOnExecutionContext(postCtx);

			const createData = (await postResponse.json()) as CreateBookmarkResponse;
			expect(createData.success).toBe(true);

			// Fetch all bookmarks
			const getRequest = new IncomingRequest('http://localhost/api/bookmarks');
			const getCtx = createExecutionContext();
			const getResponse = await worker.fetch(getRequest, env, getCtx);
			await waitOnExecutionContext(getCtx);

			const bookmarks = (await getResponse.json()) as Bookmark[];
			expect(Array.isArray(bookmarks)).toBe(true);

			// Find the bookmark we just created
			const createdBookmark = bookmarks.find((b) => b.id === createData.id);
			expect(createdBookmark).toBeDefined();
			expect(createdBookmark?.url).toBe(body.url);
			expect(createdBookmark?.title).toBe(body.title);
			expect(createdBookmark?.tags).toBe('integration,test');
		});
	});

	describe('GET /bookmarks', () => {
		it('fetches all bookmarks', async () => {
			const request = new IncomingRequest('http://localhost/api/bookmarks');
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			expect(response.status).toBe(200);
			const data = (await response.json()) as Bookmark[];
			expect(Array.isArray(data)).toBe(true);
		});

		it('filters bookmarks by tag', async () => {
			// Create a bookmark with specific tag
			const body: CreateBookmarkRequest = {
				url: 'https://filtered-test.com',
				title: 'Filtered Bookmark',
				tags: ['filtered', 'unique-tag-123'],
			};

			const postRequest = new IncomingRequest('http://localhost/api/bookmarks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});

			const postCtx = createExecutionContext();
			await worker.fetch(postRequest, env, postCtx);
			await waitOnExecutionContext(postCtx);

			// Filter by the unique tag
			const getRequest = new IncomingRequest('http://localhost/api/bookmarks?tag=unique-tag-123');
			const getCtx = createExecutionContext();
			const getResponse = await worker.fetch(getRequest, env, getCtx);
			await waitOnExecutionContext(getCtx);

			expect(getResponse.status).toBe(200);
			const bookmarks = (await getResponse.json()) as Bookmark[];
			expect(Array.isArray(bookmarks)).toBe(true);

			// Verify all returned bookmarks contain the filtered tag
			for (const bookmark of bookmarks) {
				expect(bookmark.tags).toContain('unique-tag-123');
			}
		});
	});
});
