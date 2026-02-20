-- River Trading - MySQL Database Schema
-- Run this in phpMyAdmin or MySQL client after creating the database

-- ---------------------------------------------------------------------------
-- 1. USERS
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) DEFAULT NULL COMMENT 'bcrypt hash for login',
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  balance_usdt DECIMAL(18, 8) NOT NULL DEFAULT 0,
  frozen_usdt DECIMAL(18, 8) NOT NULL DEFAULT 0 COMMENT 'Locked in pending withdrawals',
  status ENUM('pending', 'approved') NOT NULL DEFAULT 'pending',
  locked TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Admin can lock user; locked users cannot perform any actions',
  balance_frozen TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Admin freezes assets; user cannot withdraw, trade, or features trade',
  referral_code_used VARCHAR(10) DEFAULT NULL,
  credit_score INT UNSIGNED DEFAULT 100,
  crypto_holdings JSON DEFAULT NULL COMMENT '{"ETH": 0.5, "BTC": 0.01}',
  main_withdrawal_address VARCHAR(255) DEFAULT NULL,
  main_withdrawal_network VARCHAR(50) DEFAULT NULL,
  withdrawal_password_hash VARCHAR(255) DEFAULT NULL,
  INDEX idx_users_email (email),
  INDEX idx_users_status (status),
  INDEX idx_users_registered (registered_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 2. USER DOCUMENTS (verification uploads)
-- ---------------------------------------------------------------------------
CREATE TABLE user_documents (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  type VARCHAR(50) NOT NULL COMMENT 'ID, passport, etc.',
  url VARCHAR(500) NOT NULL,
  uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_docs_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 3. REFERRAL CODES
-- ---------------------------------------------------------------------------
CREATE TABLE referral_codes (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  status ENUM('available', 'used') NOT NULL DEFAULT 'available',
  used_by VARCHAR(64) DEFAULT NULL,
  used_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ref_codes_code (code),
  INDEX idx_ref_codes_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 4. TRADES (spot + features)
-- ---------------------------------------------------------------------------
CREATE TABLE trades (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  user_email VARCHAR(255) DEFAULT NULL,
  type ENUM('spot', 'features') NOT NULL,
  pair VARCHAR(32) NOT NULL,
  side ENUM('buy', 'sell', 'up', 'fall') NOT NULL,
  price DECIMAL(24, 8) NOT NULL DEFAULT 0,
  quantity DECIMAL(24, 8) NOT NULL,
  amount DECIMAL(24, 8) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- features-specific
  period INT UNSIGNED DEFAULT NULL COMMENT 'seconds',
  period_percent DECIMAL(6, 2) DEFAULT NULL,
  lever VARCHAR(10) DEFAULT NULL,
  features_status ENUM('pending', 'settled') DEFAULT NULL,
  features_result ENUM('win', 'lose', 'draw') DEFAULT NULL,
  payout_amount DECIMAL(18, 8) DEFAULT NULL,
  settled_at DATETIME DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_trades_user (user_id),
  INDEX idx_trades_type (type),
  INDEX idx_trades_features_pending (features_status),
  INDEX idx_trades_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 5. PAYMENT METHODS (deposit addresses)
-- ---------------------------------------------------------------------------
CREATE TABLE payment_methods (
  id VARCHAR(64) PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  network VARCHAR(50) NOT NULL,
  wallet_address VARCHAR(255) NOT NULL,
  min_amount VARCHAR(20) NOT NULL DEFAULT '0',
  unit VARCHAR(20) NOT NULL,
  qr_code_url VARCHAR(500) DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 6. WITHDRAWALS
-- ---------------------------------------------------------------------------
CREATE TABLE withdrawals (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  currency VARCHAR(20) NOT NULL DEFAULT 'USDT',
  wallet_address VARCHAR(255) DEFAULT NULL,
  wallet_network VARCHAR(50) DEFAULT NULL,
  status ENUM('pending', 'accepted', 'declined') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_withdrawals_user (user_id),
  INDEX idx_withdrawals_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 7. DEPOSITS
-- ---------------------------------------------------------------------------
CREATE TABLE deposits (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  currency VARCHAR(20) NOT NULL DEFAULT 'USDT',
  network VARCHAR(50) NOT NULL,
  tx_hash VARCHAR(255) DEFAULT NULL,
  payment_proof_url VARCHAR(500) DEFAULT NULL,
  status ENUM('pending', 'accepted', 'declined') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_deposits_user (user_id),
  INDEX idx_deposits_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 8. FEATURES PERIODS (admin-configurable timers)
-- ---------------------------------------------------------------------------
CREATE TABLE features_periods (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  seconds INT UNSIGNED NOT NULL,
  percent DECIMAL(6, 2) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_period_seconds (seconds)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 9. FEATURES LEVERS (admin-configurable multipliers)
-- ---------------------------------------------------------------------------
CREATE TABLE features_levers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lever_value VARCHAR(10) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_lever_value (lever_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 10. CHAT MESSAGES (River Customer Service - user ↔ admin)
-- ---------------------------------------------------------------------------
CREATE TABLE chat_messages (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  sender_type ENUM('user', 'admin') NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_chat_user (user_id),
  INDEX idx_chat_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 11. CUSTOMER SERVICE LINKS (admin settings)
-- ---------------------------------------------------------------------------
CREATE TABLE customer_links (
  id VARCHAR(32) PRIMARY KEY,
  label VARCHAR(50) NOT NULL,
  url VARCHAR(500) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- SEED DEFAULTS
-- ---------------------------------------------------------------------------
INSERT INTO features_periods (seconds, percent, sort_order) VALUES
  (60, 20, 1),
  (90, 30, 2),
  (120, 50, 3),
  (180, 100, 4),
  (240, 200, 5);

INSERT INTO features_levers (lever_value, sort_order) VALUES
  ('2x', 1),
  ('5x', 2),
  ('10x', 3),
  ('20x', 4),
  ('30x', 5);

INSERT INTO customer_links (id, label, url) VALUES
  ('telegram', 'Telegram', ''),
  ('whatsapp', 'WhatsApp', '');

INSERT INTO referral_codes (id, code, status) VALUES
  ('ref_seed_1', '12345', 'available'),
  ('ref_seed_2', '54321', 'available'),
  ('ref_seed_3', '99999', 'available');

-- Payment methods: no seed data. Add via Admin → Payment methods.
