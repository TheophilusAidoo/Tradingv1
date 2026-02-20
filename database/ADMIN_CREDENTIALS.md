# Admin Login Credentials

After running the migration and seed, use these accounts to access the admin panel:

| Email | Password | Role |
|-------|----------|------|
| `admin@rivertrading.com` | `Admin123!` | Admin |
| `superadmin@rivertrading.com` | `Admin123!` | Super Admin |

**Important:** Change these passwords in production!

## Setup

1. Run the migration (adds `is_admin` column):
   ```bash
   mysql -u root river_trading < database/migrate_add_admin_role.sql
   ```

2. Seed admin users:
   ```bash
   mysql -u root river_trading < database/seed_admin_users.sql
   ```

Or use phpMyAdmin: run each SQL file in order.
