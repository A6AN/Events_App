-- Migration 009: RPC for atomic scan count increment
CREATE OR REPLACE FUNCTION increment_scan_count(p_event_id UUID)
RETURNS VOID AS $$
  UPDATE escrow_ledger
  SET scan_count = scan_count + 1
  WHERE event_id = p_event_id;
$$ LANGUAGE sql SECURITY DEFINER;
