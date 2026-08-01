-- Add city and country columns to page_sessions so the admin can show
-- where each visitor came from. Filled via client-side ipapi.co fetch
-- when a session is initialised.
--
-- Run once in Supabase SQL Editor.

ALTER TABLE page_sessions ADD COLUMN IF NOT EXISTS city    TEXT;
ALTER TABLE page_sessions ADD COLUMN IF NOT EXISTS country TEXT;
