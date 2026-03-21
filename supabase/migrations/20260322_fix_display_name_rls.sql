-- 1. Fix display_name column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE profiles RENAME COLUMN full_name TO display_name;
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN display_name TEXT;
  END IF;
END $$;

-- 2. Security definer function to break RLS recursion
CREATE OR REPLACE FUNCTION is_event_host(p_event_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM events WHERE id = p_event_id AND host_id = auth.uid()
  );
END;
$$;

-- 3. Patch policies
DROP POLICY IF EXISTS "tickets_select" ON tickets;
CREATE POLICY "tickets_select" ON tickets FOR SELECT
USING (
  auth.uid() = user_id
  OR auth.uid() = purchaser_id
  OR is_event_host(tickets.event_id)
  OR EXISTS (
    SELECT 1 FROM co_hosts
    WHERE event_id = tickets.event_id
    AND user_id = auth.uid()
    AND status = 'accepted'
  )
);

DROP POLICY IF EXISTS "waitlist_select" ON waitlist;
CREATE POLICY "waitlist_select" ON waitlist FOR SELECT
USING (
  auth.uid() = user_id OR is_event_host(waitlist.event_id)
);

DROP POLICY IF EXISTS "co_hosts_select" ON co_hosts;
CREATE POLICY "co_hosts_select" ON co_hosts FOR SELECT
USING (
  auth.uid() = user_id
  OR auth.uid() = invited_by
  OR is_event_host(co_hosts.event_id)
);
