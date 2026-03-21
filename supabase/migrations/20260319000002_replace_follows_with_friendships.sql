-- Migration 002: Replace follows table with mutual friendships model
-- per brain.md §4.3 and §7

-- Step 1: Drop the old follows table
-- (this will cascade and break any FK references to it — we want that, they're on the wrong model)
DROP TABLE IF EXISTS follows CASCADE;

-- Step 2: Create the friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'accepted', 'blocked')),
  blocker_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_self_friendship CHECK (requester_id != addressee_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_friendship_idx ON friendships (
  LEAST(requester_id, addressee_id),
  GREATEST(requester_id, addressee_id)
);

-- Step 3: updated_at trigger on friendships
DROP TRIGGER IF EXISTS friendships_updated_at ON friendships;
CREATE TRIGGER friendships_updated_at
  BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Step 4: The are_friends() helper — used in RLS policies everywhere
CREATE OR REPLACE FUNCTION are_friends(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM friendships
    WHERE status = 'accepted'
    AND (
      (requester_id = user_a AND addressee_id = user_b) OR
      (requester_id = user_b AND addressee_id = user_a)
    )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Step 5: Index for fast friend lookups
CREATE INDEX IF NOT EXISTS friendships_requester_idx ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS friendships_addressee_idx ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS friendships_status_idx ON friendships(status);
