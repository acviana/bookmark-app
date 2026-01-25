-- Migration: Initial bookmark schema
-- Created: 2026-01-24
-- Description: Creates the bookmarks table for storing user bookmarks

CREATE TABLE IF NOT EXISTS bookmarks (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT,
    tags TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster tag filtering
CREATE INDEX IF NOT EXISTS idx_bookmarks_tags ON bookmarks(tags);

-- Index for date sorting (DESC is the most common query pattern)
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks(created_at DESC);
