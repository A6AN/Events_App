-- =============================================================
-- Migration 001: Fix profiles table
-- Adds all missing columns per brain.md §4.1
-- Safe to run multiple times (ADD COLUMN IF NOT EXISTS)
-- =============================================================

-- ── Missing profile columns ────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS university TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Delhi',
  ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS attendance_visibility TEXT DEFAULT 'friends'
    CHECK (attendance_visibility IN ('public', 'friends', 'private')),
  ADD COLUMN IF NOT EXISTS rep_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS vip_badge BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS fcm_token TEXT,
  ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active'
    CHECK (account_status IN ('active', 'suspended', 'deleted')),
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ── Generated column: rep_tier ─────────────────────────────
-- NOTE: Generated columns cannot use ADD COLUMN IF NOT EXISTS in older PG.
-- This is safe — if it already exists it will error silently; wrap in DO block.
DO $$
BEGIN
  ALTER TABLE profiles
    ADD COLUMN rep_tier TEXT GENERATED ALWAYS AS (
      CASE
        WHEN rep_score >= 2000 THEN 'gold'
        WHEN rep_score >= 501  THEN 'silver'
        ELSE 'bronze'
      END
    ) STORED;
EXCEPTION WHEN duplicate_column THEN
  NULL; -- already exists, skip
END $$;

-- ── updated_at auto-trigger ────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS ────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public profiles viewable by all; private profiles only by owner
-- (we'll refine to friends-only once friendships table exists in 003)
DROP POLICY IF EXISTS "Public profiles viewable by all" ON profiles;
CREATE POLICY "Public profiles viewable by all"
  ON profiles FOR SELECT
  USING (is_private = FALSE OR auth.uid() = id);

-- Users can only update their own profile
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (triggered on signup)
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
CREATE POLICY "Users insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
