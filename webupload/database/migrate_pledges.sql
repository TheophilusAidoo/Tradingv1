-- DEFI Staking pledges table
-- Run: mysql -u root river_trading < database/migrate_pledges.sql

CREATE TABLE pledges (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  plan_id VARCHAR(32) NOT NULL COMMENT 'newuser, olduser, small',
  amount DECIMAL(18, 8) NOT NULL,
  daily_yield_percent DECIMAL(8, 2) NOT NULL,
  cycle_days INT UNSIGNED NOT NULL,
  status ENUM('active', 'completed') NOT NULL DEFAULT 'active',
  total_earned DECIMAL(18, 8) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ends_at DATETIME NOT NULL,
  completed_at DATETIME DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_pledges_user (user_id),
  INDEX idx_pledges_status (status),
  INDEX idx_pledges_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
