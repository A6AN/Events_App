-- Add city column to venues table
ALTER TABLE venues ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Delhi';
