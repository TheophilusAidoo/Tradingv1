# River Trading – XAMPP + PHP Database Setup

This guide walks you through setting up MySQL and PHP for River Trading using XAMPP.

---

## 1. Install XAMPP

1. Download XAMPP: https://www.apachefriends.org/
2. Install (use a path **without spaces** if possible, e.g. `C:\xampp`)
3. Open **XAMPP Control Panel**
4. Start **Apache** and **MySQL** (green “Running” status)

---

## 2. Create the Database

### Option A: phpMyAdmin (recommended)

1. In a browser, go to: **http://localhost/phpmyadmin**
2. Click **New** → Database name: `river_trading` → Create
3. Select the `river_trading` database
4. Click **Import**
5. Choose file: `database/schema.sql` from your project
6. Click **Go** at the bottom
7. Confirm success

### Option B: MySQL command line

```bash
# In XAMPP MySQL shell or terminal:
mysql -u root -p
CREATE DATABASE river_trading CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE river_trading;
SOURCE C:/path/to/River trading/database/schema.sql;
```

---

## 3. Configure the PHP API

1. Open **api/config.php**
2. Adjust if your setup differs from defaults:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'river_trading');
define('DB_USER', 'root');
define('DB_PASS', '');  // XAMPP default: empty
```

---

## 4. Expose the API via Apache

### Option A: Project in `htdocs` (recommended)

1. Copy your whole project into XAMPP’s web root, e.g.:
   - Windows: `C:\xampp\htdocs\river-trading\`
   - Mac: `/Applications/XAMPP/htdocs/river-trading/`

2. API base URL: **http://localhost/river-trading/api/**

3. Health check: **http://localhost/river-trading/api/health**

### Option B: Virtual host (optional)

1. Edit `C:\xampp\apache\conf\extra\httpd-vhosts.conf`:

```apache
<VirtualHost *:80>
  ServerName river-trading.local
  DocumentRoot "C:/xampp/htdocs/river-trading"
  <Directory "C:/xampp/htdocs/river-trading">
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
  </Directory>
</VirtualHost>
```

2. Add `127.0.0.1 river-trading.local` to `C:\Windows\System32\drivers\etc\hosts`
3. Restart Apache
4. API URL: **http://river-trading.local/api/**

---

## 5. Test the API

1. Open: **http://localhost/river-trading/api/health**  
   Expected: `{"ok":true,"database":"connected"}`

2. Open: **http://localhost/river-trading/api/users**  
   Expected: JSON array of users (empty `[]` if no users yet)

---

## 6. Connect the Frontend to the Database

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set your API URL. **Match your actual folder name in htdocs:**
   - Folder `River trading` (with space): `VITE_API_URL=http://localhost/River%20trading/api`
   - Folder `river-trading` (no space): `VITE_API_URL=http://localhost/river-trading/api`

3. Rebuild the frontend and run it:
   ```bash
   npm run build
   npm run dev
   ```

4. The app will now use the database instead of localStorage. You can:
   - **Sign up** with email, password, and referral code (create codes in Admin → Referral codes)
   - **Log in** with email and password
   - **Place trades** – they are stored in the database
   - **Admin panel** – users, withdrawals, features orders, and settings are loaded from the DB

5. To switch back to localStorage (offline mode), remove or empty `VITE_API_URL` in `.env` and rebuild.

---

## 7. Database Schema Overview

| Table              | Purpose                                   |
|--------------------|-------------------------------------------|
| `users`            | Accounts, balance, status, crypto holdings|
| `user_documents`   | KYC/verification uploads                  |
| `referral_codes`   | Admin referral codes                      |
| `trades`           | Spot trades + features orders             |
| `payment_methods`  | Deposit wallet addresses                  |
| `withdrawals`      | Withdrawal requests                       |
| `deposits`         | Deposit requests                          |
| `features_periods` | Selection period timers (60s, 120s, …)    |
| `features_levers`  | Selection levers (2x, 5x, 10x, …)         |
| `customer_links`   | Telegram/WhatsApp links                   |

---

## 8. Next Steps (Optional)

Your React app still uses `localStorage`. To move to the database:

- Add **deposits** API so user deposits are persisted

- Add **admin auth** to protect the admin panel when you’re ready.

---

## 9. Payment methods with QR code (migration)

If your `payment_methods` table was created before QR support, run this in phpMyAdmin:

```sql
ALTER TABLE payment_methods ADD COLUMN qr_code_url VARCHAR(500) DEFAULT NULL AFTER unit;
```

(If you get "Duplicate column" error, the column already exists — skip.)

---

## 10. Troubleshooting

| Problem                    | Solution                                              |
|---------------------------|--------------------------------------------------------|
| Apache won’t start         | Port 80 in use → change port in `httpd.conf` or stop Skype/IIS |
| MySQL won’t start          | Port 3306 in use → change MySQL port in XAMPP          |
| `Access denied` for DB    | Check `DB_USER` / `DB_PASS` in `config.php`            |
| 404 on API                 | Ensure project is under `htdocs` and path is correct    |
| CORS errors in browser     | Set `CORS_ORIGIN` in `config.php` or allow all origins |
