-- Seed admin users for River Trading admin panel
-- Run after migrate_add_admin_role.sql
-- Default password for all seed admins: Admin123!

-- IMPORTANT: Change these passwords in production!

INSERT INTO users (
  id, email, name, password_hash, is_admin, status, credit_score
) VALUES
  (
    'admin_1',
    'admin@rivertrading.com',
    'Admin User',
    '$2y$10$ryKfkQWMeTmYpgkQCJYtUusoEkZ06owPsu/mgv4LOgBCeHWmcGOPW',
    1,
    'approved',
    100
  ),
  (
    'admin_2',
    'superadmin@rivertrading.com',
    'Super Admin',
    '$2y$10$ryKfkQWMeTmYpgkQCJYtUusoEkZ06owPsu/mgv4LOgBCeHWmcGOPW',
    1,
    'approved',
    100
  )
ON DUPLICATE KEY UPDATE
  is_admin = 1,
  password_hash = VALUES(password_hash);
