-- Run this if you already imported schema.sql but have no referral codes
-- (Sign up requires valid referral codes)
INSERT IGNORE INTO referral_codes (id, code, status) VALUES
  ('ref_seed_1', '12345', 'available'),
  ('ref_seed_2', '54321', 'available'),
  ('ref_seed_3', '99999', 'available');
