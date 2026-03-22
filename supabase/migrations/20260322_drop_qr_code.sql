-- Remove insecure qr_code column from tickets table
ALTER TABLE tickets DROP COLUMN IF EXISTS qr_code;
