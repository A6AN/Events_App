-- Migration 005: Add all missing tables per brain.md §4.2, §4.9–§4.12, §4.18

-- DEVICE_TOKENS
CREATE TABLE IF NOT EXISTS device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS device_tokens_updated_at ON device_tokens;
CREATE TRIGGER device_tokens_updated_at
  BEFORE UPDATE ON device_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- WAITLIST
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  notified_at TIMESTAMPTZ,
  status TEXT DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'notified', 'converted', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS waitlist_event_idx ON waitlist(event_id);
CREATE INDEX IF NOT EXISTS waitlist_position_idx ON waitlist(event_id, position);

-- CO_HOSTS
CREATE TABLE IF NOT EXISTS co_hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  permissions TEXT[] DEFAULT ARRAY['scan', 'view_guestlist'],
  invited_by UUID NOT NULL REFERENCES profiles(id),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  host_id UUID NOT NULL REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, reviewer_id)
);

-- REFERRALS
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id),
  referred_id UUID NOT NULL REFERENCES profiles(id),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed')),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referred_id)
);

-- Function: auto-grant VIP badge when referrer hits 3 confirmed referrals
CREATE OR REPLACE FUNCTION check_vip_badge()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' THEN
    UPDATE profiles
    SET vip_badge = TRUE
    WHERE id = NEW.referrer_id
    AND (
      SELECT COUNT(*) FROM referrals
      WHERE referrer_id = NEW.referrer_id
      AND status = 'confirmed'
    ) >= 3;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS referrals_vip_check ON referrals;
CREATE TRIGGER referrals_vip_check
  AFTER INSERT OR UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION check_vip_badge();

-- ESCROW_LEDGER
CREATE TABLE IF NOT EXISTS escrow_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  host_id UUID NOT NULL REFERENCES profiles(id),
  total_collected INTEGER DEFAULT 0,
  platform_fee INTEGER DEFAULT 0,
  host_total INTEGER DEFAULT 0,
  pre_event_released INTEGER DEFAULT 0,
  pre_event_released_at TIMESTAMPTZ,
  post_event_released INTEGER DEFAULT 0,
  post_event_released_at TIMESTAMPTZ,
  scan_count INTEGER DEFAULT 0,
  scan_threshold_met BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'holding'
    CHECK (status IN ('holding','partially_released','fully_released','refunded','disputed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id)
);

DROP TRIGGER IF EXISTS escrow_ledger_updated_at ON escrow_ledger;
CREATE TRIGGER escrow_ledger_updated_at
  BEFORE UPDATE ON escrow_ledger
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function: update scan_threshold_met automatically when scan_count changes
CREATE OR REPLACE FUNCTION check_scan_threshold()
RETURNS TRIGGER AS $$
DECLARE
  total_tickets INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_tickets
  FROM tickets
  WHERE event_id = NEW.event_id
  AND status != 'cancelled';

  IF total_tickets > 0 AND NEW.scan_count >= (total_tickets * 0.66) THEN
    NEW.scan_threshold_met = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS escrow_scan_threshold ON escrow_ledger;
CREATE TRIGGER escrow_scan_threshold
  BEFORE UPDATE OF scan_count ON escrow_ledger
  FOR EACH ROW EXECUTE FUNCTION check_scan_threshold();
