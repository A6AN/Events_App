-- Enable pg_trgm for fuzzy search if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN indexes for fuzzy search on profiles
-- This allows for typo-tolerant searching on display_name and username
CREATE INDEX IF NOT EXISTS profiles_display_name_trgm_idx ON profiles USING gin (display_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS profiles_username_trgm_idx ON profiles USING gin (username gin_trgm_ops);

-- Create GIN index for fuzzy search on events
CREATE INDEX IF NOT EXISTS events_title_trgm_idx ON events USING gin (title gin_trgm_ops);

-- Create GIN index for fuzzy search on venues
CREATE INDEX IF NOT EXISTS venues_name_trgm_idx ON venues USING gin (name gin_trgm_ops);

-- Discover Feed RPC: Ranked by FOMO score (base + friend component)
-- Returns JSONB to simplify hydration into EventWithMeta type
CREATE OR REPLACE FUNCTION get_discover_feed(p_user_id UUID, p_city TEXT DEFAULT 'Delhi')
RETURNS SETOF JSONB AS $$
BEGIN
  RETURN QUERY
  SELECT row_to_json(e_with_fomo)::jsonb
  FROM (
    SELECT e.*, 
      (SELECT json_build_object(
        'id', p.id,
        'username', p.username,
        'display_name', p.display_name,
        'avatar_url', p.avatar_url,
        'rep_tier', p.rep_tier,
        'is_verified', p.is_verified
      ) FROM profiles p WHERE p.id = e.host_id) as host,
      (SELECT json_agg(tt.*) FROM ticket_types tt WHERE tt.event_id = e.id) as ticket_types,
      COALESCE(ev_fomo.base_fomo_score, 0) as base_fomo_score,
      (COALESCE(ev_fomo.base_fomo_score, 0) +
        (SELECT COUNT(*)::float FROM tickets t
         WHERE t.event_id = e.id
         AND t.status != 'cancelled'
         AND are_friends(p_user_id, t.user_id)
        ) * 5
      ) AS user_fomo_score,
      (SELECT COUNT(*)::integer FROM tickets t WHERE t.event_id = e.id AND t.status != 'cancelled') as total_tickets_sold,
      (SELECT COUNT(*)::integer FROM waitlist w WHERE w.event_id = e.id AND w.status = 'waiting') as waitlist_count,
      (SELECT COUNT(*)::integer FROM tickets t 
       WHERE t.event_id = e.id 
       AND t.status != 'cancelled' 
       AND are_friends(p_user_id, t.user_id)) as friends_attending_count
    FROM events e
    LEFT JOIN event_fomo_scores ev_fomo ON ev_fomo.event_id = e.id
    WHERE e.status = 'published'
    AND e.start_time > NOW()
    AND e.visibility = 'public'
    AND e.city = p_city
    AND NOT EXISTS (SELECT 1 FROM friendships WHERE status = 'blocked' AND (
      (requester_id = p_user_id AND addressee_id = e.host_id) OR
      (requester_id = e.host_id AND addressee_id = p_user_id)
    ))
    ORDER BY user_fomo_score DESC
    LIMIT 20
  ) e_with_fomo;
END;
$$ LANGUAGE plpgsql STABLE;
