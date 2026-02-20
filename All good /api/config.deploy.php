<?php
/**
 * River Trading API - Deployment config
 * RENAME this file to config.php and edit with your cPanel MySQL details
 */

// Database (cPanel MySQL)
define('DB_HOST', 'localhost');
define('DB_NAME', 'YOUR_DATABASE_NAME');
define('DB_USER', 'YOUR_DATABASE_USER');
define('DB_PASS', 'YOUR_DATABASE_PASSWORD');
define('DB_CHARSET', 'utf8mb4');

// API
define('API_BASE', '/api/');
define('CORS_ORIGIN', '*');

// Uploads - change to match your folder (e.g. /river-trading or /River%20trading)
define('UPLOAD_BASE', '/river-trading');
define('UPLOADS_DIR', dirname(__DIR__) . '/uploads');

define('SESSION_NAME', 'river_session');

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
