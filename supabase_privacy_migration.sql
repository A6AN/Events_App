-- ============================================
-- MIGRATION: Privacy & Profile columns
-- Run this in Supabase SQL Editor
-- ============================================

-- Add privacy and profile columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS languages text[],
  ADD COLUMN IF NOT EXISTS interests text[],
  ADD COLUMN IF NOT EXISTS banner_url text,
  ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS dm_privacy text DEFAULT 'everyone' CHECK (dm_privacy IN ('everyone', 'followers')),
  ADD COLUMN IF NOT EXISTS show_activity_status boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS event_history_privacy text DEFAULT 'everyone' CHECK (event_history_privacy IN ('everyone', 'followers', 'only_me')),
  ADD COLUMN IF NOT EXISTS notification_prefs jsonb DEFAULT '{
    "dms": true,
    "follows": true,
    "bookings": true,
    "event_reminders": true,
    "social_activity": false
  }'::jsonb;
