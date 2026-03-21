-- Migration 006: promo_codes, boosts, reports, fix venue_bookings
-- per brain.md §4.13, §4.14, §4.15, §4.19

-- PROMO_CODES
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  event_id UUID REFERENCES events(id),
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value INTEGER NOT NULL,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOOSTS
CREATE TABLE IF NOT EXISTS boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('event', 'venue')),
  entity_id UUID NOT NULL,
  boosted_by UUID NOT NULL REFERENCES profiles(id),
  razorpay_payment_id TEXT NOT NULL,
  budget_inr INTEGER NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS boosts_entity_idx ON boosts(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS boosts_active_idx ON boosts(status, ends_at);

-- REPORTS
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  entity_type TEXT NOT NULL
    CHECK (entity_type IN ('event','profile','venue','ticket','message')),
  entity_id UUID NOT NULL,
  reason TEXT NOT NULL
    CHECK (reason IN ('fraud','spam','inappropriate_content','fake_event','harassment','other')),
  body TEXT,
  status TEXT DEFAULT 'open'
    CHECK (status IN ('open','under_review','resolved','dismissed')),
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);
CREATE INDEX IF NOT EXISTS reports_entity_idx ON reports(entity_type, entity_id);

-- VENUE_BOOKINGS: add missing event_id FK + updated_at
ALTER TABLE venue_bookings
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id),
  ADD COLUMN IF NOT EXISTS total_price INTEGER,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure status constraint is correct
ALTER TABLE venue_bookings
  DROP CONSTRAINT IF EXISTS venue_bookings_status_check;
ALTER TABLE venue_bookings
  ADD CONSTRAINT venue_bookings_status_check
    CHECK (status IN ('pending','confirmed','rejected','cancelled'));

DROP TRIGGER IF EXISTS venue_bookings_updated_at ON venue_bookings;
CREATE TRIGGER venue_bookings_updated_at
  BEFORE UPDATE ON venue_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
