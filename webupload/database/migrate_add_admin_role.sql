-- Add is_admin column so only designated users can access the admin panel
-- Run: mysql -u root river_trading < database/migrate_add_admin_role.sql

ALTER TABLE users
  ADD COLUMN is_admin TINYINT(1) NOT NULL DEFAULT 0
    COMMENT '1 = can access admin panel'
    AFTER referral_code_used;

CREATE INDEX idx_users_is_admin ON users (is_admin);
