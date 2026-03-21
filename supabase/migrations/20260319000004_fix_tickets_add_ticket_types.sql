-- Migration 004: Fix tickets table + add ticket_types + ticket_holds
-- per brain.md §4.6, §4.7, §4.8

-- TICKET_TYPES: new table, parent of tickets
CREATE TABLE IF NOT EXISTS ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  capacity INTEGER,
  tickets_sold INTEGER DEFAULT 0,
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  perks TEXT[],
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS ticket_types_updated_at ON ticket_types;
CREATE TRIGGER ticket_types_updated_at
  BEFORE UPDATE ON ticket_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- TICKET_HOLDS: race condition prevention
CREATE TABLE IF NOT EXISTS ticket_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ticket_holds_expires_idx ON ticket_holds(expires_at);

-- TICKETS: remove qr_code (security antipattern), add missing columns
ALTER TABLE tickets
  DROP COLUMN IF EXISTS qr_code,
  DROP COLUMN IF EXISTS quantity,
  DROP COLUMN IF EXISTS total_price,
  ADD COLUMN IF NOT EXISTS ticket_type_id UUID REFERENCES ticket_types(id),
  ADD COLUMN IF NOT EXISTS purchaser_id UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS scanned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS scanned_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure status column has correct constraints
ALTER TABLE tickets
  DROP CONSTRAINT IF EXISTS tickets_status_check;

-- First migrate any legacy data to valid statuses
UPDATE tickets SET status = 'active' WHERE status = 'confirmed';

ALTER TABLE tickets
  ADD CONSTRAINT tickets_status_check
    CHECK (status IN ('pending', 'active', 'scanned', 'cancelled', 'refunded'));

DROP TRIGGER IF EXISTS tickets_updated_at ON tickets;
CREATE TRIGGER tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- For every existing event, auto-create a default ticket_type
-- so existing data doesn't break
INSERT INTO ticket_types (event_id, name, price, sort_order)
SELECT 
  id,
  'General Admission',
  COALESCE((price)::INTEGER, 0),
  0
FROM events
WHERE id NOT IN (SELECT DISTINCT event_id FROM ticket_types)
ON CONFLICT DO NOTHING;
