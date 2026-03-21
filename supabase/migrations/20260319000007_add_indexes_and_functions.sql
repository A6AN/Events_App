-- Migration 007: PostGIS, pg_trgm, full-text indexes, core SQL functions,
-- user_activity view, pg_cron refresh jobs
-- per brain.md §12.1, §12.3, §12.4, §4.19

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- FULL-TEXT SEARCH: GIN indexes on events + venues
CREATE INDEX IF NOT EXISTS events_title_search_idx
  ON events USING GIN (to_tsvector('english', title));

ALTER TABLE venues ADD COLUMN IF NOT EXISTS description TEXT;
CREATE INDEX IF NOT EXISTS venues_name_search_idx
  ON venues USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- PERFORMANCE: common query indexes
CREATE INDEX IF NOT EXISTS events_status_idx ON events(status);
CREATE INDEX IF NOT EXISTS events_start_time_idx ON events(start_time);
CREATE INDEX IF NOT EXISTS events_host_idx ON events(host_id);
CREATE INDEX IF NOT EXISTS events_visibility_idx ON events(visibility);
CREATE INDEX IF NOT EXISTS tickets_user_idx ON tickets(user_id);
CREATE INDEX IF NOT EXISTS tickets_event_idx ON tickets(event_id);
CREATE INDEX IF NOT EXISTS tickets_status_idx ON tickets(status);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id, is_read);

-- FUNCTION: get_happening_now()
-- Returns published events currently in progress within radius_km
CREATE OR REPLACE FUNCTION get_happening_now(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km INTEGER DEFAULT 10
)
RETURNS SETOF events AS $$
  SELECT e.* FROM events e
  WHERE e.status = 'published'
  AND NOW() BETWEEN e.start_time AND e.end_time
  AND e.lat IS NOT NULL AND e.lng IS NOT NULL
  AND ST_DWithin(
    ST_MakePoint(e.lng, e.lat)::geography,
    ST_MakePoint(user_lng, user_lat)::geography,
    radius_km * 1000
  )
  ORDER BY e.fomo_score DESC;
$$ LANGUAGE sql STABLE;

-- FUNCTION: get_friends_attending(event_id, current_user)
-- Returns count of mutual friends attending an event (used in FOMO score query)
CREATE OR REPLACE FUNCTION get_friends_attending(
  p_event_id UUID,
  p_user_id UUID
)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM tickets t
  WHERE t.event_id = p_event_id
  AND t.status != 'cancelled'
  AND are_friends(p_user_id, t.user_id);
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- FUNCTION: rep_score_floor trigger (score never goes below 0)
CREATE OR REPLACE FUNCTION enforce_rep_floor()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rep_score < 0 THEN
    NEW.rep_score = 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_rep_floor ON profiles;
CREATE TRIGGER profiles_rep_floor
  BEFORE UPDATE OF rep_score ON profiles
  FOR EACH ROW EXECUTE FUNCTION enforce_rep_floor();

-- MATERIALIZED VIEW: user_activity
-- Source of truth for Friends Ledger feed (brain.md §12.3)
CREATE MATERIALIZED VIEW IF NOT EXISTS user_activity AS
  SELECT
    t.user_id,
    'ticket_purchased' AS activity_type,
    t.event_id AS entity_id,
    'event' AS entity_type,
    t.created_at
  FROM tickets t
  WHERE t.status != 'cancelled'

  UNION ALL

  SELECT
    e.host_id AS user_id,
    'event_hosted' AS activity_type,
    e.id AS entity_id,
    'event' AS entity_type,
    e.created_at
  FROM events e
  WHERE e.status = 'published'

  UNION ALL

  SELECT
    t.user_id,
    'checked_in' AS activity_type,
    t.event_id AS entity_id,
    'event' AS entity_type,
    t.scanned_at AS created_at
  FROM tickets t
  WHERE t.status = 'scanned'
  AND t.scanned_at IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS user_activity_unique_idx
  ON user_activity(user_id, activity_type, entity_id);

-- MATERIALIZED VIEW: event_fomo_scores
-- Refreshed every 5 min. Excludes per-user friend component (added at query time)
-- per brain.md §12.1
CREATE MATERIALIZED VIEW IF NOT EXISTS event_fomo_scores AS
SELECT
  e.id AS event_id,
  (
    (COUNT(t.id) FILTER (
      WHERE t.created_at > NOW() - INTERVAL '1 hour'
    ) * 10) +
    (COUNT(DISTINCT t.user_id) * 2) +
    (COALESCE(
      (SELECT COUNT(*) FROM waitlist w
       WHERE w.event_id = e.id AND w.status = 'waiting'), 0
    ) * 3) -
    (GREATEST(
      EXTRACT(EPOCH FROM (e.start_time - NOW())) / 3600, 0
    ) * 0.5) +
    (CASE p.rep_tier
      WHEN 'gold' THEN 100
      WHEN 'silver' THEN 50
      ELSE 0
    END) +
    (CASE WHEN e.is_sponsored THEN 999999 ELSE 0 END)
  ) AS base_fomo_score
FROM events e
LEFT JOIN tickets t ON t.event_id = e.id AND t.status != 'cancelled'
LEFT JOIN profiles p ON p.id = e.host_id
WHERE e.status = 'published'
AND e.start_time > NOW()
GROUP BY e.id, e.start_time, e.is_sponsored, p.rep_tier;

CREATE UNIQUE INDEX IF NOT EXISTS event_fomo_scores_idx
  ON event_fomo_scores(event_id);

-- PG_CRON: refresh jobs
-- Refresh user_activity every 5 minutes
SELECT cron.schedule(
  'refresh-user-activity',
  '*/5 * * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY user_activity'
);

-- Refresh fomo scores every 5 minutes
SELECT cron.schedule(
  'refresh-fomo-scores',
  '*/5 * * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY event_fomo_scores'
);

-- Clean up expired ticket holds every minute
SELECT cron.schedule(
  'cleanup-ticket-holds',
  '* * * * *',
  'DELETE FROM ticket_holds WHERE expires_at < NOW()'
);
