-- Add visitor tracking columns to page_sessions
-- Run this in Supabase SQL Editor to update existing tables

ALTER TABLE page_sessions ADD COLUMN IF NOT EXISTS visitor_id    TEXT;
ALTER TABLE page_sessions ADD COLUMN IF NOT EXISTS visit_number  INTEGER DEFAULT 1;
ALTER TABLE page_sessions ADD COLUMN IF NOT EXISTS referrer      TEXT DEFAULT 'directo';
ALTER TABLE page_sessions ADD COLUMN IF NOT EXISTS user_lang     TEXT;
ALTER TABLE page_sessions ADD COLUMN IF NOT EXISTS screen_size   TEXT;

-- Index for grouping sessions by visitor (recurring visitor queries)
CREATE INDEX IF NOT EXISTS idx_page_sessions_visitor_id ON page_sessions (visitor_id);
