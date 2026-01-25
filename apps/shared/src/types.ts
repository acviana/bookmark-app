// Shared TypeScript types for bookmark-app
// Used by both API (apps/api) and frontend (apps/web)

/**
 * Bookmark record from the database
 * Matches the D1 bookmarks table schema
 */
export interface Bookmark {
	id: string;
	url: string;
	title: string;
	tags: string; // comma-separated
	created_at: string;
}

/**
 * Request body for creating a new bookmark
 */
export interface CreateBookmarkRequest {
	url: string;
	title: string;
	tags?: string[];
}

/**
 * Response from creating a bookmark
 */
export interface CreateBookmarkResponse {
	success: boolean;
	id: string;
}
