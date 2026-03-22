-- Remove overly permissive ticket policies
DROP POLICY "Authenticated users can view tickets." ON tickets;
DROP POLICY "Authenticated users can create tickets." ON tickets;

-- Scope ticket_types to visible events only
DROP POLICY IF EXISTS "ticket_types_select" ON ticket_types;
CREATE POLICY "ticket_types_select" ON ticket_types FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = ticket_types.event_id
    AND (
      events.host_id = auth.uid()
      OR (events.visibility = 'public' AND events.status = 'published')
      OR (events.visibility = 'friends_only' AND are_friends(auth.uid(), events.host_id))
      OR (events.visibility = 'invite_only' AND EXISTS (
        SELECT 1 FROM tickets t
        WHERE t.event_id = events.id AND t.user_id = auth.uid()
      ))
    )
  )
);
