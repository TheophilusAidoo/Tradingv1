-- Add payment_proof_url to deposits table (required for deposit flow with payment proof)
-- Run in phpMyAdmin if column doesn't exist
-- If you get "Duplicate column" error, the column already exists - you're done.
ALTER TABLE deposits ADD COLUMN payment_proof_url VARCHAR(500) DEFAULT NULL;
