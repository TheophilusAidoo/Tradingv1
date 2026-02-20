<?php
/**
 * River Trading API - Configuration
 * Adjust these for your XAMPP installation
 */

// Database (MySQL/MariaDB)
define('DB_HOST', 'localhost');
define('DB_NAME', 'river_trading');
define('DB_USER', 'root');
define('DB_PASS', '');  // XAMPP default: empty password
define('DB_CHARSET', 'utf8mb4');

// API
define('API_BASE', '/api/');
define('CORS_ORIGIN', '*');  // Or restrict to your frontend URL

// Uploads (match your folder name in htdocs, e.g. "River%20trading" or "river-trading")
define('UPLOAD_BASE', '/River%20trading');
define('UPLOADS_DIR', dirname(__DIR__) . '/uploads');

// Optional: session/auth
define('SESSION_NAME', 'river_session');

// Log errors but don't output to response (keeps API JSON valid)
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
