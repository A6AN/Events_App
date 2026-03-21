-- Migration 003: Fix events + venues per brain.md §4.4 & §4.5

-- VENUES: replace text location with proper lat/lng
ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS photo_urls TEXT[],
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS amenities TEXT[],
  ADD COLUMN IF NOT EXISTS categories TEXT[],
  ADD COLUMN IF NOT EXISTS price_per_hour INTEGER,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS venues_updated_at ON venues;
CREATE TRIGGER venues_updated_at
  BEFORE UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- EVENTS: full column overhaul
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES venues(id),
  ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public'
    CHECK (visibility IN ('public', 'friends_only', 'invite_only')),
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS min_age INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_staff_pick BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS fomo_score FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_capacity INTEGER,
  ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'standard'
    CHECK (event_type IN ('standard', 'table_booking')),
  ADD COLUMN IF NOT EXISTS category TEXT
    CHECK (category IN ('club','comedy','dj_night','open_mic','house_party','networking','sports','other')),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Migrate old `date` string column to start_time if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='events' AND column_name='date'
  ) THEN
    UPDATE events SET start_time = date::TIMESTAMPTZ WHERE start_time IS NULL;
  END IF;
END $$;

DROP TRIGGER IF EXISTS events_updated_at ON events;
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Migrate old latitude/longitude columns to lat/lng if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='latitude') THEN
    ALTER TABLE events RENAME COLUMN latitude TO lat;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='longitude') THEN
    ALTER TABLE events RENAME COLUMN longitude TO lng;
  END IF;
END $$;

-- PostGIS spatial indexes
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE INDEX IF NOT EXISTS events_location_idx 
  ON events USING GIST (ST_MakePoint(lng, lat));
CREATE INDEX IF NOT EXISTS venues_location_idx 
  ON venues USING GIST (ST_MakePoint(lng, lat));
