
-- Add is_bot column to meetings table
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT false;
