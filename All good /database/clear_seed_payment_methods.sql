-- Remove seeded payment methods so only admin-configured methods appear
-- Run this once on existing databases that had the seed data
DELETE FROM payment_methods WHERE id IN ('btc-1', 'usdt-trc', 'usdt-erc', 'eth-1');
