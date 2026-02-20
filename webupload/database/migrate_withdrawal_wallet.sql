-- Add withdrawal wallet and password support
-- Run in phpMyAdmin. If you get "Duplicate column" errors, columns already exist.
ALTER TABLE users ADD COLUMN main_withdrawal_address VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN main_withdrawal_network VARCHAR(50) DEFAULT NULL;
ALTER TABLE users ADD COLUMN withdrawal_password_hash VARCHAR(255) DEFAULT NULL;
ALTER TABLE withdrawals ADD COLUMN wallet_address VARCHAR(255) DEFAULT NULL;
ALTER TABLE withdrawals ADD COLUMN wallet_network VARCHAR(50) DEFAULT NULL;
