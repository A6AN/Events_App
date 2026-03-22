-- Drop unique constraint that prevents buying multiple tickets to the same event
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_event_id_user_id_key;
