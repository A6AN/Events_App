-- Migration 008: RLS policies for all tables
-- per brain.md §5

-- Enable RLS on every table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE co_hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_bookings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES
-- ============================================================
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (
    is_private = FALSE
    OR auth.uid() = id
    OR are_friends(auth.uid(), id)
  );

DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- FRIENDSHIPS
-- ============================================================
DROP POLICY IF EXISTS "friendships_select" ON friendships;
CREATE POLICY "friendships_select" ON friendships FOR SELECT
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

DROP POLICY IF EXISTS "friendships_insert" ON friendships;
CREATE POLICY "friendships_insert" ON friendships FOR INSERT
  WITH CHECK (requester_id = auth.uid());

DROP POLICY IF EXISTS "friendships_update" ON friendships;
CREATE POLICY "friendships_update" ON friendships FOR UPDATE
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

DROP POLICY IF EXISTS "friendships_delete" ON friendships;
CREATE POLICY "friendships_delete" ON friendships FOR DELETE
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- ============================================================
-- DEVICE_TOKENS
-- ============================================================
DROP POLICY IF EXISTS "device_tokens_all" ON device_tokens;
CREATE POLICY "device_tokens_all" ON device_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- VENUES
-- ============================================================
DROP POLICY IF EXISTS "venues_select" ON venues;
CREATE POLICY "venues_select" ON venues FOR SELECT
  USING (is_active = TRUE OR owner_id = auth.uid());

DROP POLICY IF EXISTS "venues_insert" ON venues;
CREATE POLICY "venues_insert" ON venues FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "venues_update" ON venues;
CREATE POLICY "venues_update" ON venues FOR UPDATE
  USING (auth.uid() = owner_id);

-- ============================================================
-- EVENTS
-- ============================================================
DROP POLICY IF EXISTS "events_select" ON events;
CREATE POLICY "events_select" ON events FOR SELECT
  USING (
    -- Host always sees their own events
    host_id = auth.uid()
    -- Public published events
    OR (visibility = 'public' AND status = 'published')
    -- Friends-only events
    OR (visibility = 'friends_only' AND are_friends(auth.uid(), host_id))
    -- Invite-only: user has a ticket
    OR (visibility = 'invite_only' AND EXISTS (
      SELECT 1 FROM tickets
      WHERE event_id = events.id AND user_id = auth.uid()
    ))
    -- Co-hosts
    OR EXISTS (
      SELECT 1 FROM co_hosts
      WHERE event_id = events.id
      AND user_id = auth.uid()
      AND status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "events_insert" ON events;
CREATE POLICY "events_insert" ON events FOR INSERT
  WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "events_update" ON events;
CREATE POLICY "events_update" ON events FOR UPDATE
  USING (
    auth.uid() = host_id
    OR EXISTS (
      SELECT 1 FROM co_hosts
      WHERE event_id = events.id
      AND user_id = auth.uid()
      AND status = 'accepted'
      AND 'edit_event' = ANY(permissions)
    )
  );

DROP POLICY IF EXISTS "events_delete" ON events;
CREATE POLICY "events_delete" ON events FOR DELETE
  USING (auth.uid() = host_id);

-- ============================================================
-- TICKET_TYPES
-- ============================================================
DROP POLICY IF EXISTS "ticket_types_select" ON ticket_types;
CREATE POLICY "ticket_types_select" ON ticket_types FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM events
    WHERE id = ticket_types.event_id
  ));

DROP POLICY IF EXISTS "ticket_types_insert" ON ticket_types;
CREATE POLICY "ticket_types_insert" ON ticket_types FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM events
    WHERE id = ticket_types.event_id AND host_id = auth.uid()
  ));

DROP POLICY IF EXISTS "ticket_types_update" ON ticket_types;
CREATE POLICY "ticket_types_update" ON ticket_types FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM events
    WHERE id = ticket_types.event_id AND host_id = auth.uid()
  ));

-- ============================================================
-- TICKET_HOLDS
-- ============================================================
DROP POLICY IF EXISTS "ticket_holds_all" ON ticket_holds;
CREATE POLICY "ticket_holds_all" ON ticket_holds FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TICKETS
-- ============================================================
DROP POLICY IF EXISTS "tickets_select" ON tickets;
CREATE POLICY "tickets_select" ON tickets FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() = purchaser_id
    OR EXISTS (
      SELECT 1 FROM events
      WHERE id = tickets.event_id AND host_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM co_hosts
      WHERE event_id = tickets.event_id
      AND user_id = auth.uid()
      AND status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "tickets_insert" ON tickets;
CREATE POLICY "tickets_insert" ON tickets FOR INSERT
  WITH CHECK (auth.uid() = purchaser_id);

DROP POLICY IF EXISTS "tickets_update" ON tickets;
CREATE POLICY "tickets_update" ON tickets FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM events
      WHERE id = tickets.event_id AND host_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM co_hosts
      WHERE event_id = tickets.event_id
      AND user_id = auth.uid()
      AND status = 'accepted'
      AND 'scan' = ANY(permissions)
    )
  );

-- ============================================================
-- WAITLIST
-- ============================================================
DROP POLICY IF EXISTS "waitlist_select" ON waitlist;
CREATE POLICY "waitlist_select" ON waitlist FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM events
      WHERE id = waitlist.event_id AND host_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "waitlist_insert" ON waitlist;
CREATE POLICY "waitlist_insert" ON waitlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "waitlist_update" ON waitlist;
CREATE POLICY "waitlist_update" ON waitlist FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- CO_HOSTS
-- ============================================================
DROP POLICY IF EXISTS "co_hosts_select" ON co_hosts;
CREATE POLICY "co_hosts_select" ON co_hosts FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() = invited_by
    OR EXISTS (
      SELECT 1 FROM events
      WHERE id = co_hosts.event_id AND host_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "co_hosts_insert" ON co_hosts;
CREATE POLICY "co_hosts_insert" ON co_hosts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM events
    WHERE id = co_hosts.event_id AND host_id = auth.uid()
  ));

DROP POLICY IF EXISTS "co_hosts_update" ON co_hosts;
CREATE POLICY "co_hosts_update" ON co_hosts FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = invited_by);

-- ============================================================
-- REVIEWS
-- ============================================================
DROP POLICY IF EXISTS "reviews_select" ON reviews;
CREATE POLICY "reviews_select" ON reviews FOR SELECT
  USING (TRUE); -- public

DROP POLICY IF EXISTS "reviews_insert" ON reviews;
CREATE POLICY "reviews_insert" ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM tickets
      WHERE event_id = reviews.event_id
      AND user_id = auth.uid()
      AND status = 'scanned'
    )
  );

-- ============================================================
-- REFERRALS
-- ============================================================
DROP POLICY IF EXISTS "referrals_select" ON referrals;
CREATE POLICY "referrals_select" ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

DROP POLICY IF EXISTS "referrals_insert" ON referrals;
CREATE POLICY "referrals_insert" ON referrals FOR INSERT
  WITH CHECK (auth.uid() = referred_id);

-- ============================================================
-- PROMO_CODES
-- ============================================================
DROP POLICY IF EXISTS "promo_codes_select" ON promo_codes;
CREATE POLICY "promo_codes_select" ON promo_codes FOR SELECT
  USING (TRUE); -- validated server-side in Edge Function

DROP POLICY IF EXISTS "promo_codes_insert" ON promo_codes;
CREATE POLICY "promo_codes_insert" ON promo_codes FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- ============================================================
-- BOOSTS
-- ============================================================
DROP POLICY IF EXISTS "boosts_select" ON boosts;
CREATE POLICY "boosts_select" ON boosts FOR SELECT
  USING (auth.uid() = boosted_by OR status = 'active');

DROP POLICY IF EXISTS "boosts_insert" ON boosts;
CREATE POLICY "boosts_insert" ON boosts FOR INSERT
  WITH CHECK (auth.uid() = boosted_by);

-- ============================================================
-- REPORTS
-- ============================================================
DROP POLICY IF EXISTS "reports_select" ON reports;
CREATE POLICY "reports_select" ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "reports_insert" ON reports;
CREATE POLICY "reports_insert" ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
DROP POLICY IF EXISTS "notifications_select" ON notifications;
CREATE POLICY "notifications_select" ON notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_update" ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- ESCROW_LEDGER
-- ============================================================
DROP POLICY IF EXISTS "escrow_ledger_select" ON escrow_ledger;
CREATE POLICY "escrow_ledger_select" ON escrow_ledger FOR SELECT
  USING (auth.uid() = host_id);

-- Insert/update handled by Edge Functions only (service role)

-- ============================================================
-- VENUE_BOOKINGS
-- ============================================================
DROP POLICY IF EXISTS "venue_bookings_select" ON venue_bookings;
CREATE POLICY "venue_bookings_select" ON venue_bookings FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM venues
      WHERE id = venue_bookings.venue_id AND owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "venue_bookings_insert" ON venue_bookings;
CREATE POLICY "venue_bookings_insert" ON venue_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "venue_bookings_update" ON venue_bookings;
CREATE POLICY "venue_bookings_update" ON venue_bookings FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM venues
      WHERE id = venue_bookings.venue_id AND owner_id = auth.uid()
    )
  );
