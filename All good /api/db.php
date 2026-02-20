<?php
/**
 * River Trading API - Database connection (PDO)
 */

require_once __DIR__ . '/config.php';

$db = null;

function getDb(): PDO {
  global $db;
  if ($db === null) {
    $dsn = sprintf(
      'mysql:host=%s;dbname=%s;charset=%s',
      DB_HOST,
      DB_NAME,
      DB_CHARSET
    );
    $db = new PDO($dsn, DB_USER, DB_PASS, [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
  }
  return $db;
}
