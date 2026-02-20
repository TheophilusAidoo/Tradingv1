-- Add frozen balance for pending withdrawals
-- Run in phpMyAdmin. If you get "Duplicate column", it already exists.
ALTER TABLE users ADD COLUMN frozen_usdt DECIMAL(18, 8) NOT NULL DEFAULT 0;
