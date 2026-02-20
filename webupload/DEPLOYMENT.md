# River Trading – cPanel Deployment Guide

**Configured for folder: `river-trading`** – Your site URL will be `yourdomain.com/river-trading/`

## Step 1: Build & Create the Zip (on your computer)

1. **Set your API URL** (create `.env.production`):
   ```
   VITE_API_URL=/River%20trading/api
   ```
   Change `/River%20trading/api` if your folder name is different (e.g. `/river-trading/api`).

2. Open Terminal in the project folder.

3. Build and zip:
   ```bash
   ./create-deploy-zip.sh
   ```
   Or manually:
   ```bash
   npx vite build
   zip -r river-trading-deploy.zip api/ uploads/ dist/ database/ .htaccess DEPLOYMENT.md api/config.deploy.php
   ```

4. You’ll get `river-trading-deploy.zip` in the project folder.

**Note:** If `npm run build` fails (TypeScript errors), use `npx vite build` instead.

---

## Step 2: Database on cPanel

1. Log in to **cPanel** → **MySQL Databases**.
2. Create a new database (e.g. `cpanel_user_river_trading`).
3. Create a MySQL user and add it to that database with **All privileges**.
4. In **phpMyAdmin**, create the tables:
   - Use the schema in the `database/` folder.
   - Run `database/schema.sql` first.
   - Then run all `database/migrate_*.sql` files in order.
5. (Optional) Run `database/seed_admin_users.sql` and `database/seed_referral_codes.sql`.

---

## Step 3: Upload to cPanel

1. Go to **File Manager** → `public_html` (or your domain folder).
2. Upload `river-trading-deploy.zip`.
3. Right‑click the zip → **Extract**.
4. Move files if needed:
   - **Option A (subfolder):** Extract into a folder like `river-trading` or `River trading`.
   - **Option B (domain root):** Extract into `public_html` so the app is the main site.

---

## Step 4: Configure the API

1. Rename `api/config.deploy.php` to `api/config.php`.
2. Edit `api/config.php`:
   - Set `DB_HOST` (often `localhost` on cPanel).
   - Set `DB_NAME` (your database name).
   - Set `DB_USER` (database user).
   - Set `DB_PASS` (database password).
   - Set `UPLOAD_BASE` to your app URL path, e.g.:
     - `/river-trading` if in a subfolder
     - `/` if at domain root

2. Ensure `api/config.php` is **not** publicly readable (only PHP should use it).

---

## Step 5: Set Permissions

1. `uploads/` must be writable:
   - Right‑click `uploads` → **Change Permissions**.
   - Set to **755** (or 775 if needed).
2. `uploads/qrcodes/` – same as above.

---

## Step 6: Frontend API URL (important)

The React app must know the API base URL. It’s baked in at **build time** via `VITE_API_URL` in `.env.production`.

- **Before building**, create `.env.production` with:
  ```
  VITE_API_URL=/River%20trading/api
  ```
- If your cPanel folder is different (e.g. `river-trading`), use:
  ```
  VITE_API_URL=/river-trading/api
  ```
- Also update `base` in `vite.config.ts` to match (e.g. `base: '/river-trading/'`).
- Rebuild (`npx vite build`), rezip, and re-upload the `dist/` folder.

---

## Folder Structure After Upload

```
public_html/
  river-trading/          (or your folder name)
    api/
      config.php         ← Edit database settings here
      index.php
      handlers.php
      db.php
      ...
    uploads/
      qrcodes/           ← Writable (755)
    dist/
      index.html
      assets/
    database/            ← For reference / migrations
    .htaccess
    DEPLOYMENT.md
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page | Check `.htaccess` and that `mod_rewrite` is enabled in cPanel. |
| API 404 | Confirm `api/` folder is uploaded and `api/index.php` exists. |
| Database error | Verify `api/config.php` (DB name, user, password, host). |
| Login/API fails | Ensure `VITE_API_URL` matches your deployment path. Rebuild if needed. |
| Uploads fail | Ensure `uploads/` and `uploads/qrcodes/` are writable (755 or 775). |

---

## Quick Checklist

- [ ] Database created and schema applied
- [ ] `api/config.php` updated with correct DB credentials
- [ ] Zip extracted in the correct folder
- [ ] `uploads/` and `uploads/qrcodes/` writable
- [ ] If needed, `vite.config.ts` base and `VITE_API_URL` match your URL
