-- Fix events table schema mismatches
-- Rename legacy columns to match frontend expectations
ALTER TABLE events RENAME COLUMN image_url TO cover_url;
ALTER TABLE events RENAME COLUMN location_name TO address;

-- Add missing city column
ALTER TABLE events ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Delhi';
