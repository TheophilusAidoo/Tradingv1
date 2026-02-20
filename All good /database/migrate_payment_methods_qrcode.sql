-- Add qr_code_url column to payment_methods
-- Run this in phpMyAdmin (SQL tab) for database river_trading
--
-- If you get "Duplicate column name 'qr_code_url'" → the column already exists, you're done!
-- If you get mysql.proc errors → ignore; your column likely already exists. Check with:
--   SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_NAME='payment_methods' AND COLUMN_NAME='qr_code_url';

ALTER TABLE payment_methods ADD COLUMN qr_code_url VARCHAR(500) DEFAULT NULL;
