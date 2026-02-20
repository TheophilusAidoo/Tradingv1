<?php
/**
 * River Trading API - Request handlers
 * All handlers receive $pdo and return JSON (or throw)
 */

function json($data) {
  echo json_encode($data);
}

function getBody() {
  $raw = file_get_contents('php://input');
  return $raw ? json_decode($raw, true) : [];
}

// --- AUTH ---
function handleAuthLogin(PDO $pdo) {
  $body = getBody();
  $email = trim($body['email'] ?? '');
  $password = $body['password'] ?? '';
  if (!$email || !$password) {
    http_response_code(400);
    json(['success' => false, 'error' => 'Email and password required']);
    return;
  }
  $stmt = $pdo->prepare("SELECT id, email, name, password_hash, balance_usdt, frozen_usdt, status, referral_code_used, credit_score, crypto_holdings, registered_at, main_withdrawal_address, main_withdrawal_network, withdrawal_password_hash FROM users WHERE email = ?");
  $stmt->execute([$email]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row || !password_verify($password, $row['password_hash'] ?? '')) {
    http_response_code(401);
    json(['success' => false, 'error' => 'Invalid email or password']);
    return;
  }
  $user = formatUser($row, $pdo);
  json(['success' => true, 'user' => $user]);
}

function handleAuthAdminLogin(PDO $pdo) {
  $body = getBody();
  $email = trim($body['email'] ?? '');
  $password = $body['password'] ?? '';
  if (!$email || !$password) {
    http_response_code(400);
    json(['success' => false, 'error' => 'Email and password required']);
    return;
  }
  $stmt = $pdo->prepare("SELECT id, email, name, password_hash, balance_usdt, frozen_usdt, status, referral_code_used, credit_score, crypto_holdings, registered_at, main_withdrawal_address, main_withdrawal_network, withdrawal_password_hash FROM users WHERE email = ? AND COALESCE(is_admin, 0) = 1");
  $stmt->execute([$email]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row || !password_verify($password, $row['password_hash'] ?? '')) {
    http_response_code(401);
    json(['success' => false, 'error' => 'Invalid email or password']);
    return;
  }
  $user = formatUser($row, $pdo);
  json(['success' => true, 'user' => $user]);
}

function handleAuthSignup(PDO $pdo) {
  $body = getBody();
  $email = trim($body['email'] ?? '');
  $password = $body['password'] ?? '';
  $name = trim($body['name'] ?? '') ?: explode('@', $email)[0] ?? 'User';
  $referralCode = trim($body['referralCode'] ?? '');
  if (!$email || !$password) {
    http_response_code(400);
    json(['success' => false, 'error' => 'Email and password required']);
    return;
  }
  if (strlen($referralCode) !== 5 || !ctype_digit($referralCode)) {
    http_response_code(400);
    json(['success' => false, 'error' => 'Valid 5-digit referral code required']);
    return;
  }
  $stmt = $pdo->prepare("SELECT id FROM referral_codes WHERE code = ? AND status = 'available'");
  $stmt->execute([$referralCode]);
  if (!$stmt->fetch()) {
    http_response_code(400);
    json(['success' => false, 'error' => 'Invalid or already used referral code']);
    return;
  }
  $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
  $stmt->execute([$email]);
  if ($stmt->fetch()) {
    http_response_code(400);
    json(['success' => false, 'error' => 'Email already registered']);
    return;
  }
  $id = 'user_' . time() . '_' . bin2hex(random_bytes(4));
  $hash = password_hash($password, PASSWORD_DEFAULT);
  $pdo->prepare("INSERT INTO users (id, email, name, password_hash, referral_code_used, credit_score, status) VALUES (?, ?, ?, ?, ?, 100, 'approved')")->execute([$id, $email, $name, $hash, $referralCode]);
  $pdo->prepare("UPDATE referral_codes SET status = 'used', used_by = ?, used_at = NOW() WHERE code = ?")->execute([$id, $referralCode]);
  $stmt = $pdo->prepare("SELECT id, email, name, balance_usdt, status, referral_code_used, credit_score, crypto_holdings, registered_at FROM users WHERE id = ?");
  $stmt->execute([$id]);
  $user = formatUser($stmt->fetch(PDO::FETCH_ASSOC), $pdo);
  json(['success' => true, 'user' => $user]);
}

function formatUser(array $row, PDO $pdo): array {
  $userId = $row['id'];
  $documents = [];
  $stmt = $pdo->prepare("SELECT id, type, url, uploaded_at FROM user_documents WHERE user_id = ?");
  $stmt->execute([$userId]);
  while ($d = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $documents[] = ['id' => $d['id'], 'type' => $d['type'], 'url' => $d['url'], 'uploadedAt' => $d['uploaded_at']];
  }
  return [
    'id' => $row['id'],
    'email' => $row['email'],
    'name' => $row['name'],
    'registeredAt' => $row['registered_at'],
    'balanceUsdt' => (float) ($row['balance_usdt'] ?? 0),
    'frozenUsdt' => (float) ($row['frozen_usdt'] ?? 0),
    'status' => $row['status'] ?? 'pending',
    'referralCodeUsed' => $row['referral_code_used'] ?? null,
    'creditScore' => (int) ($row['credit_score'] ?? 100),
    'cryptoHoldings' => $row['crypto_holdings'] ? json_decode($row['crypto_holdings'], true) : [],
    'documents' => $documents,
    'mainWithdrawalAddress' => $row['main_withdrawal_address'] ?? null,
    'mainWithdrawalNetwork' => $row['main_withdrawal_network'] ?? null,
    'hasWithdrawalPassword' => !empty($row['withdrawal_password_hash']),
    'locked' => !empty($row['locked']),
    'balanceFrozen' => !empty($row['balance_frozen']),
    'isAdmin' => !empty($row['is_admin']),
  ];
}

function assertUserNotLocked(PDO $pdo, string $userId): void {
  $stmt = $pdo->prepare("SELECT locked FROM users WHERE id = ?");
  $stmt->execute([$userId]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if ($row && !empty($row['locked'])) {
    http_response_code(403);
    json(['success' => false, 'error' => 'Account locked']);
    exit;
  }
}

function assertUserBalanceNotFrozen(PDO $pdo, string $userId): void {
  $stmt = $pdo->prepare("SELECT balance_frozen FROM users WHERE id = ?");
  $stmt->execute([$userId]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if ($row && !empty($row['balance_frozen'])) {
    http_response_code(403);
    json(['success' => false, 'error' => 'Your balance has been frozen. Please contact support.']);
    exit;
  }
}

// --- USERS ---
function handleUserDelete(PDO $pdo, string $id) {
  $stmt = $pdo->prepare("SELECT id, COALESCE(is_admin, 0) AS is_admin FROM users WHERE id = ?");
  $stmt->execute([$id]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) {
    http_response_code(404);
    json(['success' => false, 'error' => 'User not found']);
    return;
  }
  if (!empty($row['is_admin'])) {
    http_response_code(403);
    json(['success' => false, 'error' => 'Cannot delete admin users']);
    return;
  }
  $pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$id]);
  json(['success' => true]);
}

function handleUsersList(PDO $pdo) {
  $stmt = $pdo->query("SELECT * FROM users ORDER BY registered_at DESC");
  $users = [];
  while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $users[] = formatUser($row, $pdo);
  }
  json($users);
}

function handleUserGet(PDO $pdo, string $id) {
  $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
  $stmt->execute([$id]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) {
    http_response_code(404);
    json(['error' => 'User not found']);
    return;
  }
  json(formatUser($row, $pdo));
}

function handleUserApprove(PDO $pdo, string $id) {
  $pdo->prepare("UPDATE users SET status = 'approved' WHERE id = ?")->execute([$id]);
  json(['success' => true]);
}

function insertUserNotification(PDO $pdo, string $userId, string $type, string $message): void {
  $tables = $pdo->query("SHOW TABLES LIKE 'user_notifications'")->fetchAll();
  if (empty($tables)) return;
  $nid = 'notif_' . time() . '_' . bin2hex(random_bytes(4));
  $pdo->prepare("INSERT INTO user_notifications (id, user_id, type, message) VALUES (?, ?, ?, ?)")
    ->execute([$nid, $userId, $type, $message]);
}

function handleUserLock(PDO $pdo, string $id) {
  $body = getBody();
  $locked = !empty($body['locked']);
  $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
  $stmt->execute([$id]);
  if (!$stmt->fetch()) {
    http_response_code(404);
    json(['error' => 'User not found']);
    return;
  }
  $pdo->prepare("UPDATE users SET locked = ? WHERE id = ?")->execute([$locked ? 1 : 0, $id]);
  insertUserNotification($pdo, $id, $locked ? 'account_locked' : 'account_unlocked',
    $locked ? 'Your account has been locked. You cannot perform any actions. Contact customer support.' : 'Your account has been unlocked.');
  json(['success' => true, 'locked' => $locked]);
}

function handleUserFreezeBalance(PDO $pdo, string $id) {
  $body = getBody();
  $frozen = !empty($body['frozen']);
  $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
  $stmt->execute([$id]);
  if (!$stmt->fetch()) {
    http_response_code(404);
    json(['error' => 'User not found']);
    return;
  }
  $pdo->prepare("UPDATE users SET balance_frozen = ? WHERE id = ?")->execute([$frozen ? 1 : 0, $id]);
  insertUserNotification($pdo, $id, $frozen ? 'balance_frozen' : 'balance_unfrozen',
    $frozen ? 'Your balance has been frozen. You cannot withdraw, deposit, or trade.' : 'Your balance has been unfrozen.');
  json(['success' => true, 'frozen' => $frozen]);
}

function handleUserNotifications(PDO $pdo, string $id) {
  $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
  $stmt->execute([$id]);
  if (!$stmt->fetch()) {
    http_response_code(404);
    json(['notifications' => []]);
    return;
  }
  $tables = $pdo->query("SHOW TABLES LIKE 'user_notifications'")->fetchAll();
  if (empty($tables)) {
    json(['notifications' => []]);
    return;
  }
  $stmt = $pdo->prepare("SELECT id, user_id as userId, type, message, created_at as createdAt FROM user_notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100");
  $stmt->execute([$id]);
  $list = $stmt->fetchAll(PDO::FETCH_ASSOC);
  json(['notifications' => $list]);
}

function handleUserCreditScore(PDO $pdo, string $id) {
  $body = getBody();
  $score = max(0, min(999, (int) ($body['creditScore'] ?? 100)));
  $pdo->prepare("UPDATE users SET credit_score = ? WHERE id = ?")->execute([$score, $id]);
  json(['success' => true]);
}

function handleUserSetWithdrawalAddress(PDO $pdo, string $id) {
  assertUserNotLocked($pdo, $id);
  $body = getBody();
  $address = trim($body['address'] ?? '');
  $network = trim($body['network'] ?? 'USDT (TRC20)');
  if (!$address) {
    http_response_code(400);
    json(['success' => false, 'error' => 'Address required']);
    return;
  }
  $stmt = $pdo->prepare("UPDATE users SET main_withdrawal_address = ?, main_withdrawal_network = ? WHERE id = ?");
  $stmt->execute([$address, $network, $id]);
  json(['success' => true]);
}

function handleUserSetWithdrawalPassword(PDO $pdo, string $id) {
  assertUserNotLocked($pdo, $id);
  $body = getBody();
  $password = $body['password'] ?? '';
  if (strlen($password) < 4) {
    http_response_code(400);
    json(['success' => false, 'error' => 'Password must be at least 4 characters']);
    return;
  }
  $hash = password_hash($password, PASSWORD_DEFAULT);
  $pdo->prepare("UPDATE users SET withdrawal_password_hash = ? WHERE id = ?")->execute([$hash, $id]);
  json(['success' => true]);
}

function handleUserChangeLoginPassword(PDO $pdo, string $id) {
  assertUserNotLocked($pdo, $id);
  $body = getBody();
  $oldPassword = $body['oldPassword'] ?? '';
  $newPassword = $body['newPassword'] ?? '';
  if (!$oldPassword || !$newPassword) {
    http_response_code(400);
    json(['success' => false, 'error' => 'Old and new password required']);
    return;
  }
  if (strlen($newPassword) < 4) {
    http_response_code(400);
    json(['success' => false, 'error' => 'New password must be at least 4 characters']);
    return;
  }
  $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
  $stmt->execute([$id]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) {
    http_response_code(404);
    json(['success' => false, 'error' => 'User not found']);
    return;
  }
  if (!password_verify($oldPassword, $row['password_hash'] ?? '')) {
    http_response_code(400);
    json(['success' => false, 'error' => 'Current password is incorrect']);
    return;
  }
  $hash = password_hash($newPassword, PASSWORD_DEFAULT);
  $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?")->execute([$hash, $id]);
  json(['success' => true]);
}

function handleUserAdjustBalance(PDO $pdo, string $id) {
  $body = getBody();
  $amount = (float) ($body['amount'] ?? 0);
  $stmt = $pdo->prepare("SELECT balance_usdt FROM users WHERE id = ?");
  $stmt->execute([$id]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) {
    http_response_code(404);
    json(['error' => 'User not found']);
    return;
  }
  $newBalance = max(0, (float) $row['balance_usdt'] + $amount);
  $pdo->prepare("UPDATE users SET balance_usdt = ? WHERE id = ?")->execute([$newBalance, $id]);
  json(['success' => true, 'balanceUsdt' => $newBalance]);
}

function handleUserAddDocument(PDO $pdo, string $userId) {
  assertUserNotLocked($pdo, $userId);
  $body = getBody();
  $docId = 'doc_' . time();
  $type = $body['type'] ?? 'ID';
  $url = $body['url'] ?? '';
  $pdo->prepare("INSERT INTO user_documents (id, user_id, type, url) VALUES (?, ?, ?, ?)")->execute([$docId, $userId, $type, $url]);
  json(['success' => true, 'document' => ['id' => $docId, 'type' => $type, 'url' => $url, 'uploadedAt' => date('c')]]);
}

// --- REFERRAL CODES ---
function handleReferralCodesList(PDO $pdo) {
  $stmt = $pdo->query("SELECT id, code, status, used_by as usedBy, used_at as usedAt, created_at as createdAt FROM referral_codes ORDER BY created_at DESC");
  json($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function handleReferralCodesGenerate(PDO $pdo) {
  $codes = [];
  $stmt = $pdo->query("SELECT code FROM referral_codes");
  while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) $codes[] = $r['code'];
  do {
    $code = (string) rand(10000, 99999);
  } while (in_array($code, $codes, true));
  $id = 'ref_' . time() . '_' . bin2hex(random_bytes(4));
  $pdo->prepare("INSERT INTO referral_codes (id, code, status) VALUES (?, ?, 'available')")->execute([$id, $code]);
  json(['id' => $id, 'code' => $code, 'status' => 'available', 'createdAt' => date('c')]);
}

function handleReferralCodesValidate(PDO $pdo) {
  $body = getBody();
  $code = trim($body['code'] ?? '');
  if (strlen($code) !== 5 || !ctype_digit($code)) {
    json(['valid' => false]);
    return;
  }
  $stmt = $pdo->prepare("SELECT id, code, status FROM referral_codes WHERE code = ? AND status = 'available'");
  $stmt->execute([$code]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  json(['valid' => (bool) $row, 'code' => $row ? $row['code'] : null]);
}

// --- PLEDGES (DEFI Staking) ---
const PLEDGE_PLANS = [
  'newuser' => ['min' => 10, 'max' => 100, 'dailyYield' => 20, 'cycleDays' => 4],
  'olduser' => ['min' => 10, 'max' => 1000, 'dailyYield' => 10, 'cycleDays' => 3],
  'small' => ['min' => 10, 'max' => 100, 'dailyYield' => 1, 'cycleDays' => 7],
];

function tableExists(PDO $pdo, string $table): bool {
  $r = $pdo->query("SHOW TABLES LIKE '" . $pdo->quote($table) . "'");
  return false; // Use SHOW TABLES correctly
}
function pledgesTableExists(PDO $pdo): bool {
  $stmt = $pdo->query("SHOW TABLES LIKE 'pledges'");
  return (bool) $stmt->fetch();
}

function handlePledgesList(PDO $pdo) {
  if (!pledgesTableExists($pdo)) {
    json([]);
    return;
  }
  $stmt = $pdo->query("SELECT id, user_id as userId, user_email as userEmail, plan_id as planId, amount, daily_yield_percent as dailyYieldPercent, cycle_days as cycleDays, status, total_earned as totalEarned, created_at as createdAt, ends_at as endsAt, completed_at as completedAt FROM pledges ORDER BY created_at DESC");
  json($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function handlePledgesForUser(PDO $pdo, string $userId) {
  $userId = trim((string) $userId);
  if (!pledgesTableExists($pdo)) {
    json(['pledges' => [], 'stats' => ['amountMined' => 0, 'todayEarnings' => 0, 'cumulativeIncome' => 0, 'incomeOrder' => 0]]);
    return;
  }
  settleMaturedPledges($pdo, $userId);
  $stmt = $pdo->prepare("SELECT id, user_id as userId, user_email as userEmail, plan_id as planId, amount, daily_yield_percent as dailyYieldPercent, cycle_days as cycleDays, status, total_earned as totalEarned, created_at as createdAt, ends_at as endsAt, completed_at as completedAt FROM pledges WHERE user_id = ? ORDER BY created_at DESC");
  $stmt->execute([$userId]);
  $pledges = $stmt->fetchAll(PDO::FETCH_ASSOC);
  $stats = computePledgeStats($pdo, $userId);
  json(['pledges' => $pledges, 'stats' => $stats]);
}

function settleMaturedPledges(PDO $pdo, string $userId): void {
  if (!pledgesTableExists($pdo)) return;
  $stmt = $pdo->prepare("SELECT * FROM pledges WHERE user_id = ? AND status = 'active' AND ends_at <= NOW()");
  $stmt->execute([$userId]);
  while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $amount = (float) $row['amount'];
    $dailyYield = (float) $row['daily_yield_percent'];
    $cycleDays = (int) $row['cycle_days'];
    $totalEarned = $amount * ($dailyYield / 100) * $cycleDays;
    $returnAmount = $amount + $totalEarned;
    $pdo->beginTransaction();
    try {
      $pdo->prepare("UPDATE users SET balance_usdt = balance_usdt + ? WHERE id = ?")->execute([$returnAmount, $userId]);
      $pdo->prepare("UPDATE pledges SET status = 'completed', total_earned = ?, completed_at = NOW() WHERE id = ?")->execute([$totalEarned, $row['id']]);
      $pdo->commit();
    } catch (Throwable $e) {
      $pdo->rollBack();
      throw $e;
    }
  }
}

function computePledgeStats(PDO $pdo, string $userId): array {
  if (!pledgesTableExists($pdo)) return ['amountMined' => 0, 'todayEarnings' => 0, 'cumulativeIncome' => 0, 'incomeOrder' => 0];
  $stmt = $pdo->prepare("SELECT amount, daily_yield_percent, total_earned, status, created_at, ends_at, cycle_days FROM pledges WHERE user_id = ?");
  $stmt->execute([$userId]);
  $amountMined = 0;
  $todayEarnings = 0;
  $cumulativeIncome = 0;
  $incomeOrder = 0;
  while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $incomeOrder++;
    $amount = (float) $row['amount'];
    $dailyYield = (float) $row['daily_yield_percent'];
    $totalEarned = (float) $row['total_earned'];
    $status = $row['status'];
    $createdAt = strtotime($row['created_at']);
    $endsAt = strtotime($row['ends_at']);
    $cycleDays = (int) $row['cycle_days'];
    if ($status === 'active') {
      $amountMined += $amount;
      $todayEarnings += $amount * ($dailyYield / 100);
      $elapsed = min($cycleDays, (time() - $createdAt) / 86400);
      $cumulativeIncome += $amount * ($dailyYield / 100) * $elapsed;
    } else {
      $cumulativeIncome += $totalEarned;
    }
  }
  return [
    'amountMined' => round($amountMined, 2),
    'todayEarnings' => round($todayEarnings, 2),
    'cumulativeIncome' => round($cumulativeIncome, 2),
    'incomeOrder' => $incomeOrder,
  ];
}

function handlePledgeCreate(PDO $pdo) {
  $body = getBody();
  $userId = (string) ($body['userId'] ?? '');
  $userEmail = trim($body['userEmail'] ?? '');
  $planId = $body['planId'] ?? '';
  $amount = (float) ($body['amount'] ?? 0);
  if (!$userId || !$userEmail || !$planId || $amount <= 0) {
    http_response_code(400);
    json(['success' => false, 'error' => 'Invalid request']);
    return;
  }
  if (!isset(PLEDGE_PLANS[$planId])) {
    http_response_code(400);
    json(['success' => false, 'error' => 'Invalid plan']);
    return;
  }
  $plan = PLEDGE_PLANS[$planId];
  if ($amount < $plan['min'] || $amount > $plan['max']) {
    http_response_code(400);
    json(['success' => false, 'error' => "Amount must be between {$plan['min']} and {$plan['max']} USDT"]);
    return;
  }
  assertUserNotLocked($pdo, $userId);
  assertUserBalanceNotFrozen($pdo, $userId);
  $stmt = $pdo->prepare("SELECT balance_usdt FROM users WHERE id = ?");
  $stmt->execute([$userId]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) {
    http_response_code(404);
    json(['success' => false, 'error' => 'User not found']);
    return;
  }
  $balance = (float) $row['balance_usdt'];
  if ($balance < $amount) {
    http_response_code(400);
    json(['success' => false, 'error' => 'Insufficient balance']);
    return;
  }
  if (!pledgesTableExists($pdo)) {
    http_response_code(503);
    json(['success' => false, 'error' => 'Pledges not available. Run database migration.']);
    return;
  }
  $pledgeId = 'pledge_' . time() . '_' . bin2hex(random_bytes(4));
  $dailyYield = $plan['dailyYield'];
  $cycleDays = $plan['cycleDays'];
  $endsAt = date('Y-m-d H:i:s', strtotime("+{$cycleDays} days"));
  $pdo->beginTransaction();
  try {
    $pdo->prepare("UPDATE users SET balance_usdt = balance_usdt - ? WHERE id = ?")->execute([$amount, $userId]);
    $pdo->prepare("INSERT INTO pledges (id, user_id, user_email, plan_id, amount, daily_yield_percent, cycle_days, status, ends_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)")
      ->execute([$pledgeId, $userId, $userEmail, $planId, $amount, $dailyYield, $cycleDays, $endsAt]);
    $pdo->commit();
  } catch (Throwable $e) {
    $pdo->rollBack();
    http_response_code(500);
    json(['success' => false, 'error' => $e->getMessage()]);
    return;
  }
  $stmt = $pdo->prepare("SELECT id, user_id as userId, user_email as userEmail, plan_id as planId, amount, daily_yield_percent as dailyYieldPercent, cycle_days as cycleDays, status, created_at as createdAt, ends_at as endsAt FROM pledges WHERE id = ?");
  $stmt->execute([$pledgeId]);
  json(['success' => true, 'pledge' => $stmt->fetch(PDO::FETCH_ASSOC)]);
}

// --- TRADES ---
function handleTradesList(PDO $pdo) {
  $stmt = $pdo->query("SELECT * FROM trades ORDER BY created_at DESC");
  $trades = [];
  while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $trades[] = formatTrade($r);
  }
  json($trades);
}

function handleTradesForUser(PDO $pdo, string $userId) {
  $stmt = $pdo->prepare("SELECT * FROM trades WHERE user_id = ? ORDER BY created_at DESC");
  $stmt->execute([$userId]);
  $trades = [];
  while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $trades[] = formatTrade($r);
  }
  json($trades);
}

function formatTrade(array $r): array {
  return [
    'id' => $r['id'],
    'userId' => $r['user_id'],
    'userEmail' => $r['user_email'] ?? null,
    'type' => $r['type'],
    'pair' => $r['pair'],
    'side' => $r['side'],
    'price' => (float) $r['price'],
    'quantity' => (float) $r['quantity'],
    'amount' => (float) $r['amount'],
    'createdAt' => $r['created_at'],
    'period' => $r['period'] ? (int) $r['period'] : null,
    'periodPercent' => $r['period_percent'] ? (float) $r['period_percent'] : null,
    'lever' => $r['lever'] ?? null,
    'featuresStatus' => $r['features_status'] ?? null,
    'featuresResult' => $r['features_result'] ?? null,
    'payoutAmount' => $r['payout_amount'] ? (float) $r['payout_amount'] : null,
    'settledAt' => $r['settled_at'] ?? null,
  ];
}

function getBaseSymbol(string $pair): string {
  $parts = explode('/', $pair);
  return $parts[0] ?? 'ETH';
}

function handleTradesSpot(PDO $pdo) {
  $body = getBody();
  $userId = $body['userId'] ?? '';
  $pair = $body['pair'] ?? '';
  $side = $body['side'] ?? '';
  $price = (float) ($body['price'] ?? 0);
  $quantity = (float) ($body['quantity'] ?? 0);
  if (!$userId || !$pair || !in_array($side, ['buy', 'sell'], true) || $price <= 0 || $quantity <= 0) {
    http_response_code(400);
    json(['success' => false, 'error' => 'Invalid request']);
    return;
  }
  assertUserNotLocked($pdo, $userId);
  assertUserBalanceNotFrozen($pdo, $userId);
  $amount = $price * $quantity;
  $stmt = $pdo->prepare("SELECT balance_usdt, crypto_holdings FROM users WHERE id = ?");
  $stmt->execute([$userId]);
  $user = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$user) {
    http_response_code(404);
    json(['success' => false, 'error' => 'User not found']);
    return;
  }
  $holdings = $user['crypto_holdings'] ? json_decode($user['crypto_holdings'], true) : [];
  $baseSymbol = getBaseSymbol($pair);
  if ($side === 'buy') {
    if ((float) $user['balance_usdt'] < $amount) {
      http_response_code(400);
      json(['success' => false, 'error' => 'Insufficient USDT balance']);
      return;
    }
    $holdings[$baseSymbol] = ($holdings[$baseSymbol] ?? 0) + $quantity;
    $pdo->prepare("UPDATE users SET balance_usdt = balance_usdt - ?, crypto_holdings = ? WHERE id = ?")->execute([$amount, json_encode($holdings), $userId]);
  } else {
    $current = $holdings[$baseSymbol] ?? 0;
    if ($current < $quantity) {
      http_response_code(400);
      json(['success' => false, 'error' => "Insufficient $baseSymbol balance"]);
      return;
    }
    $holdings[$baseSymbol] = max(0, $current - $quantity);
    $pdo->prepare("UPDATE users SET balance_usdt = balance_usdt + ?, crypto_holdings = ? WHERE id = ?")->execute([$amount, json_encode($holdings), $userId]);
  }
  $tradeId = 'trade_' . time() . '_' . bin2hex(random_bytes(4));
  $pdo->prepare("INSERT INTO trades (id, user_id, type, pair, side, price, quantity, amount) VALUES (?, ?, 'spot', ?, ?, ?, ?, ?)")->execute([$tradeId, $userId, $pair, $side, $price, $quantity, $amount]);
  json(['success' => true, 'tradeId' => $tradeId]);
}

function parseLeverNum(string $lever): float {
  if (preg_match('/^(\d+(?:\.\d+)?)x$/i', $lever, $m)) return (float) $m[1];
  return 1;
}

function handleTradesFeatures(PDO $pdo) {
  $body = getBody();
  $userId = $body['userId'] ?? '';
  $userEmail = $body['userEmail'] ?? '';
  $pair = $body['pair'] ?? '';
  $variant = $body['variant'] ?? '';
  $amount = (float) ($body['amount'] ?? 0);
  $periodSeconds = (int) ($body['periodSeconds'] ?? 120);
  $periodPercent = (float) ($body['periodPercent'] ?? 50);
  $lever = $body['lever'] ?? '1x';
  if (!$userId || !$pair || !in_array($variant, ['up', 'fall'], true) || $amount <= 0) {
    http_response_code(400);
    json(['success' => false, 'error' => 'Invalid request']);
    return;
  }
  assertUserNotLocked($pdo, $userId);
  assertUserBalanceNotFrozen($pdo, $userId);
  $stmt = $pdo->prepare("SELECT balance_usdt FROM users WHERE id = ?");
  $stmt->execute([$userId]);
  $user = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$user || (float) $user['balance_usdt'] < $amount) {
    http_response_code(400);
    json(['success' => false, 'error' => 'Insufficient USDT balance']);
    return;
  }
  $pdo->prepare("UPDATE users SET balance_usdt = balance_usdt - ? WHERE id = ?")->execute([$amount, $userId]);
  $tradeId = 'trade_' . time() . '_' . bin2hex(random_bytes(4));
  $pdo->prepare("INSERT INTO trades (id, user_id, user_email, type, pair, side, price, quantity, amount, period, period_percent, lever, features_status) VALUES (?, ?, ?, 'features', ?, ?, 0, ?, ?, ?, ?, ?, 'pending')")->execute([$tradeId, $userId, $userEmail, $pair, $variant, $amount, $amount, $periodSeconds, $periodPercent, $lever]);
  json(['success' => true, 'tradeId' => $tradeId]);
}

function handleTradesSettle(PDO $pdo, string $tradeId) {
  $body = getBody();
  $result = $body['result'] ?? '';
  if (!in_array($result, ['win', 'lose', 'draw'], true)) {
    http_response_code(400);
    json(['success' => false, 'error' => 'Invalid result']);
    return;
  }
  $stmt = $pdo->prepare("SELECT * FROM trades WHERE id = ? AND type = 'features' AND features_status = 'pending'");
  $stmt->execute([$tradeId]);
  $t = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$t) {
    http_response_code(404);
    json(['success' => false, 'error' => 'Order not found or already settled']);
    return;
  }
  $stake = (float) $t['amount'];
  $payout = 0;
  if ($result === 'win') {
    $leverNum = parseLeverNum($t['lever'] ?? '1x');
    $periodPct = (float) ($t['period_percent'] ?? 50);
    $profit = $stake * ($periodPct / 100) * $leverNum;
    $payout = $stake + $profit;
  } elseif ($result === 'draw') {
    $payout = $stake;
  }
  if ($payout > 0) {
    $pdo->prepare("UPDATE users SET balance_usdt = balance_usdt + ? WHERE id = ?")->execute([$payout, $t['user_id']]);
  }
  $pdo->prepare("UPDATE trades SET features_result = ?, features_status = 'settled', payout_amount = ?, settled_at = NOW() WHERE id = ?")->execute([$result, $payout, $tradeId]);
  json(['success' => true]);
}

function handleTradesProcessExpired(PDO $pdo) {
  $now = time();
  $count = 0;

  // 1. Auto-settle expired orders with no admin result as draw (return stake)
  $stmt = $pdo->query("SELECT * FROM trades WHERE type = 'features' AND features_status = 'pending' AND features_result IS NULL");
  while ($t = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $created = strtotime($t['created_at']);
    $periodSec = (int) ($t['period']);
    if ($now >= $created + $periodSec) {
      $stake = (float) $t['amount'];
      $pdo->prepare("UPDATE users SET balance_usdt = balance_usdt + ? WHERE id = ?")->execute([$stake, $t['user_id']]);
      $pdo->prepare("UPDATE trades SET features_result = 'draw', features_status = 'settled', payout_amount = ?, settled_at = NOW() WHERE id = ?")->execute([$stake, $t['id']]);
      $count++;
    }
  }

  // 2. Settle orders where admin set result and timer has expired
  $stmt = $pdo->query("SELECT * FROM trades WHERE type = 'features' AND features_status = 'pending' AND features_result IS NOT NULL");
  while ($t = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $created = strtotime($t['created_at']);
    $periodSec = (int) ($t['period']);
    if ($now >= $created + $periodSec) {
      $stake = (float) $t['amount'];
      $result = $t['features_result'];
      $payout = 0;
      if ($result === 'win') {
        $leverNum = parseLeverNum($t['lever'] ?? '1x');
        $periodPct = (float) ($t['period_percent'] ?? 50);
        $profit = $stake * ($periodPct / 100) * $leverNum;
        $payout = $stake + $profit;
      } elseif ($result === 'draw') {
        $payout = $stake;
      }
      if ($payout > 0) {
        $pdo->prepare("UPDATE users SET balance_usdt = balance_usdt + ? WHERE id = ?")->execute([$payout, $t['user_id']]);
      }
      $pdo->prepare("UPDATE trades SET features_status = 'settled', payout_amount = ?, settled_at = NOW() WHERE id = ?")->execute([$payout, $t['id']]);
      $count++;
    }
  }
  json(['settled' => $count]);
}

// --- STATIC IMAGE SERVE (QR codes and payment proofs) ---
function serveUploadedImage(string $subdir, string $filename) {
  $safe = preg_replace('/[^a-zA-Z0-9._-]/', '', $filename);
  if ($safe !== $filename) {
    http_response_code(400);
    exit;
  }
  $baseDir = defined('UPLOADS_DIR') ? UPLOADS_DIR : (dirname(__DIR__) . '/uploads');
  $path = rtrim($baseDir, '/\\') . '/' . $subdir . '/' . $safe;
  if (!is_file($path) || !is_readable($path)) {
    http_response_code(404);
    exit;
  }
  $mime = 'image/png';
  $ext = strtolower(pathinfo($safe, PATHINFO_EXTENSION));
  if (in_array($ext, ['jpg', 'jpeg'], true)) $mime = 'image/jpeg';
  elseif ($ext === 'gif') $mime = 'image/gif';
  elseif ($ext === 'webp') $mime = 'image/webp';
  elseif ($ext === 'svg') $mime = 'image/svg+xml';
  elseif ($ext === 'pdf') $mime = 'application/pdf';
  header('Content-Type: ' . $mime);
  header('Cache-Control: public, max-age=86400');
  ob_clean();
  readfile($path);
  exit;
}

// --- PAYMENT METHODS ---
function handlePaymentMethodsList(PDO $pdo) {
  $stmt = $pdo->query("SELECT id, label, network, wallet_address as walletAddress, min_amount as minAmount, unit, qr_code_url as qrCodeUrl FROM payment_methods ORDER BY sort_order");
  $list = [];
  while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $r['qrCodeUrl'] = $r['qrCodeUrl'] ?? null;
    $list[] = $r;
  }
  json($list);
}

function handlePaymentMethodsCreate(PDO $pdo) {
  try {
    $file = isset($_FILES['qrcode']) && is_array($_FILES['qrcode']) ? $_FILES['qrcode'] : null;
    $tmpPath = $file && isset($file['tmp_name']) ? $file['tmp_name'] : '';
    $walletName = trim($_POST['walletName'] ?? $_POST['label'] ?? '');
    $walletAddress = trim($_POST['walletAddress'] ?? '');
    if (!$walletName || !$walletAddress) {
      http_response_code(400);
      json(['success' => false, 'error' => 'Wallet name and wallet address are required']);
      return;
    }
    $qrCodeUrl = null;
    if (!empty($tmpPath) && is_uploaded_file($tmpPath)) {
      $mime = null;
      if (function_exists('finfo_open')) {
        $finfo = @finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo !== false) {
          $mime = finfo_file($finfo, $tmpPath);
          finfo_close($finfo);
        }
      }
      if (empty($mime) && $file) {
        $mime = $file['type'] ?? '';
      }
      if (empty($mime) && $file) {
        $ext = strtolower(pathinfo($file['name'] ?? '', PATHINFO_EXTENSION));
        $mimeMap = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'gif' => 'image/gif', 'webp' => 'image/webp', 'bmp' => 'image/bmp', 'svg' => 'image/svg+xml'];
        $mime = $mimeMap[$ext] ?? 'image/png';
      }
      $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];
      if (!in_array($mime ?? '', $allowed, true)) {
        http_response_code(400);
        json(['success' => false, 'error' => 'Please upload an image (JPEG, PNG, GIF, WebP, BMP or SVG)']);
        return;
      }
      $extMap = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp', 'image/bmp' => 'bmp', 'image/svg+xml' => 'svg'];
      $ext = $extMap[$mime] ?? 'png';
      $baseDir = defined('UPLOADS_DIR') ? UPLOADS_DIR : (dirname(__DIR__) . '/uploads');
      $dir = rtrim($baseDir, '/\\') . '/qrcodes';
      if (!is_dir($dir)) {
        if (!@mkdir($dir, 0777, true)) {
          http_response_code(500);
          json(['success' => false, 'error' => 'Could not create upload directory. Run: chmod -R 777 "' . dirname($dir) . '"']);
          return;
        }
        @chmod($dir, 0777);
      }
      $filename = 'qr_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
      $path = $dir . DIRECTORY_SEPARATOR . $filename;
      $saved = move_uploaded_file($tmpPath, $path);
      if (!$saved && is_readable($tmpPath)) {
        $saved = @copy($tmpPath, $path);
      }
      if (!$saved) {
        http_response_code(500);
        json(['success' => false, 'error' => 'Failed to save image. Ensure uploads folder exists and is writable: ' . dirname($dir)]);
        return;
      }
      $base = defined('UPLOAD_BASE') ? UPLOAD_BASE : '/River%20trading';
      $qrCodeUrl = rtrim($base, '/') . '/uploads/qrcodes/' . $filename;
    }
    $id = 'pm-' . time() . '-' . bin2hex(random_bytes(4));
    $maxSort = (int) $pdo->query("SELECT COALESCE(MAX(sort_order), 0) FROM payment_methods")->fetchColumn();
    $stmt = $pdo->prepare("INSERT INTO payment_methods (id, label, network, wallet_address, min_amount, unit, qr_code_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$id, $walletName, $walletName, $walletAddress, '0', 'USDT', $qrCodeUrl, $maxSort + 1]);
    json(['success' => true, 'id' => $id]);
  } catch (PDOException $e) {
    http_response_code(500);
    json(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
  } catch (Throwable $e) {
    http_response_code(500);
    json(['success' => false, 'error' => $e->getMessage()]);
  }
}

function handlePaymentMethodsDelete(PDO $pdo, string $id) {
  $stmt = $pdo->prepare("SELECT qr_code_url FROM payment_methods WHERE id = ?");
  $stmt->execute([$id]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) {
    http_response_code(404);
    json(['success' => false, 'error' => 'Not found']);
    return;
  }
  $pdo->prepare("DELETE FROM payment_methods WHERE id = ?")->execute([$id]);
  if (!empty($row['qr_code_url'])) {
    $path = (defined('UPLOADS_DIR') ? UPLOADS_DIR : dirname(__DIR__) . '/uploads') . '/qrcodes/' . basename($row['qr_code_url']);
    if (file_exists($path)) @unlink($path);
  }
  json(['success' => true]);
}

// --- DEPOSITS ---
function handleDepositsForUser(PDO $pdo, string $userId) {
  $stmt = $pdo->prepare("SELECT id, user_id as userId, user_email as userEmail, amount, currency, network, tx_hash as txHash, payment_proof_url as paymentProofUrl, status, created_at as createdAt FROM deposits WHERE user_id = ? ORDER BY created_at DESC");
  $stmt->execute([$userId]);
  json($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function handleDepositsList(PDO $pdo) {
  $stmt = $pdo->query("SELECT id, user_id as userId, user_email as userEmail, amount, currency, network, tx_hash as txHash, payment_proof_url as paymentProofUrl, status, created_at as createdAt FROM deposits ORDER BY created_at DESC");
  json($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function handleDepositsCreate(PDO $pdo) {
  try {
    $file = isset($_FILES['paymentProof']) && is_array($_FILES['paymentProof']) ? $_FILES['paymentProof'] : null;
    $tmpPath = $file && isset($file['tmp_name']) ? $file['tmp_name'] : '';
    $userId = trim($_POST['userId'] ?? '');
    $userEmail = trim($_POST['userEmail'] ?? '');
    $amount = (float) ($_POST['amount'] ?? 0);
    $currency = trim($_POST['currency'] ?? 'USDT');
    $network = trim($_POST['network'] ?? '');

    if (!$userId || !$userEmail || $amount <= 0) {
      http_response_code(400);
      json(['success' => false, 'error' => 'Invalid request']);
      return;
    }
    assertUserNotLocked($pdo, $userId);
    assertUserBalanceNotFrozen($pdo, $userId);
    if (empty($tmpPath) || !is_uploaded_file($tmpPath)) {
      http_response_code(400);
      json(['success' => false, 'error' => 'Please upload payment proof (screenshot of your transaction)']);
      return;
    }

    $mime = null;
    if (function_exists('finfo_open')) {
      $finfo = @finfo_open(FILEINFO_MIME_TYPE);
      if ($finfo !== false) {
        $mime = finfo_file($finfo, $tmpPath);
        finfo_close($finfo);
      }
    }
    if (empty($mime) && $file) $mime = $file['type'] ?? '';
    if (empty($mime) && $file) {
      $ext = strtolower(pathinfo($file['name'] ?? '', PATHINFO_EXTENSION));
      $mimeMap = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'gif' => 'image/gif', 'webp' => 'image/webp'];
      $mime = $mimeMap[$ext] ?? 'image/png';
    }
    $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($mime ?? '', $allowed, true)) {
      http_response_code(400);
      json(['success' => false, 'error' => 'Please upload an image (JPEG, PNG, GIF or WebP)']);
      return;
    }
    $extMap = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp'];
    $ext = $extMap[$mime] ?? 'png';
    $baseDir = defined('UPLOADS_DIR') ? UPLOADS_DIR : (dirname(__DIR__) . '/uploads');
    $dir = rtrim($baseDir, '/\\') . '/proofs';
    if (!is_dir($dir)) {
      @mkdir($dir, 0777, true);
    }
    $filename = 'proof_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $path = $dir . DIRECTORY_SEPARATOR . $filename;
    $saved = move_uploaded_file($tmpPath, $path) || (is_readable($tmpPath) && @copy($tmpPath, $path));
    if (!$saved) {
      http_response_code(500);
      json(['success' => false, 'error' => 'Failed to save payment proof']);
      return;
    }
    $base = defined('UPLOAD_BASE') ? UPLOAD_BASE : '/River%20trading';
    $paymentProofUrl = rtrim($base, '/') . '/uploads/proofs/' . $filename;

    $id = 'dep-' . time() . '-' . bin2hex(random_bytes(4));
    $stmt = $pdo->prepare("INSERT INTO deposits (id, user_id, user_email, amount, currency, network, payment_proof_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')");
    $stmt->execute([$id, $userId, $userEmail, $amount, $currency, $network ?: $currency, $paymentProofUrl]);
    json(['success' => true, 'id' => $id]);
  } catch (PDOException $e) {
    http_response_code(500);
    json(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
  } catch (Throwable $e) {
    http_response_code(500);
    json(['success' => false, 'error' => $e->getMessage()]);
  }
}

function handleDepositsAccept(PDO $pdo, string $id) {
  $stmt = $pdo->prepare("SELECT * FROM deposits WHERE id = ? AND status = 'pending'");
  $stmt->execute([$id]);
  $d = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$d) {
    http_response_code(404);
    json(['success' => false, 'error' => 'Deposit not found']);
    return;
  }
  $pdo->prepare("UPDATE users SET balance_usdt = balance_usdt + ? WHERE id = ?")->execute([$d['amount'], $d['user_id']]);
  $pdo->prepare("UPDATE deposits SET status = 'accepted' WHERE id = ?")->execute([$id]);
  json(['success' => true]);
}

function handleDepositsDecline(PDO $pdo, string $id) {
  $pdo->prepare("UPDATE deposits SET status = 'declined' WHERE id = ? AND status = 'pending'")->execute([$id]);
  json(['success' => true]);
}

// --- MSB APPROVALS ---
function handleMsbApprovalStatus(PDO $pdo, string $userId) {
  $stmt = $pdo->prepare("SELECT id, user_id as userId, user_email as userEmail, front_url as frontUrl, back_url as backUrl, status, submitted_at as submittedAt, reviewed_at as reviewedAt FROM msb_approvals WHERE user_id = ?");
  $stmt->execute([$userId]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) {
    json(['submitted' => false]);
    return;
  }
  json(['submitted' => true, 'status' => $row['status'], 'submittedAt' => $row['submittedAt'], 'frontUrl' => $row['frontUrl'], 'backUrl' => $row['backUrl'], 'reviewedAt' => $row['reviewedAt']]);
}

function handleMsbApprovalSubmit(PDO $pdo) {
  try {
    $userId = $_POST['userId'] ?? '';
    $userEmail = trim($_POST['userEmail'] ?? '');
    $frontFile = $_FILES['frontFile'] ?? null;
    $backFile = $_FILES['backFile'] ?? null;

    if (!$userId || !$userEmail || empty($frontFile['tmp_name']) || empty($backFile['tmp_name'])) {
      http_response_code(400);
      json(['success' => false, 'error' => 'User ID, email, front ID image, and back ID image are required']);
      return;
    }

    assertUserNotLocked($pdo, $userId);

    $stmt = $pdo->prepare("SELECT id FROM msb_approvals WHERE user_id = ?");
    $stmt->execute([$userId]);
    if ($stmt->fetch()) {
      http_response_code(400);
      json(['success' => false, 'error' => 'You have already submitted your MSB documents. No need to submit again.']);
      return;
    }

    $baseDir = defined('UPLOADS_DIR') ? UPLOADS_DIR : (dirname(__DIR__) . '/uploads');
    $dir = rtrim($baseDir, '/\\') . '/msb';
    if (!is_dir($dir)) {
      @mkdir($dir, 0777, true);
    }

    $saveFile = function ($file, string $prefix) use ($dir): string {
      $tmpPath = $file['tmp_name'];
      if (empty($tmpPath) || !is_uploaded_file($tmpPath)) return '';
      $ext = strtolower(pathinfo($file['name'] ?? '', PATHINFO_EXTENSION)) ?: 'png';
      if (!in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'], true)) $ext = 'png';
      $filename = $prefix . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
      $path = $dir . DIRECTORY_SEPARATOR . $filename;
      if (!move_uploaded_file($tmpPath, $path) && !(is_readable($tmpPath) && @copy($tmpPath, $path))) return '';
      return $filename;
    };

    $frontFilename = $saveFile($frontFile, 'msb_front');
    $backFilename = $saveFile($backFile, 'msb_back');
    if (!$frontFilename || !$backFilename) {
      http_response_code(500);
      json(['success' => false, 'error' => 'Failed to save uploaded files']);
      return;
    }

    $id = 'msb-' . time() . '-' . bin2hex(random_bytes(4));
    $pdo->prepare("INSERT INTO msb_approvals (id, user_id, user_email, front_url, back_url, status) VALUES (?, ?, ?, ?, ?, 'pending')")->execute([$id, $userId, $userEmail, $frontFilename, $backFilename]);
    json(['success' => true, 'id' => $id]);
  } catch (PDOException $e) {
    http_response_code(500);
    json(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
  } catch (Throwable $e) {
    http_response_code(500);
    json(['success' => false, 'error' => $e->getMessage()]);
  }
}

function handleMsbApprovalsList(PDO $pdo) {
  $stmt = $pdo->query("SELECT id, user_id as userId, user_email as userEmail, front_url as frontUrl, back_url as backUrl, status, submitted_at as submittedAt, reviewed_at as reviewedAt FROM msb_approvals ORDER BY submitted_at DESC");
  json($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function handleMsbApprovalApprove(PDO $pdo, string $id) {
  $stmt = $pdo->prepare("SELECT * FROM msb_approvals WHERE id = ?");
  $stmt->execute([$id]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) {
    http_response_code(404);
    json(['success' => false, 'error' => 'Not found']);
    return;
  }
  $pdo->prepare("UPDATE msb_approvals SET status = 'approved', reviewed_at = NOW() WHERE id = ?")->execute([$id]);
  json(['success' => true]);
}

function handleMsbApprovalDecline(PDO $pdo, string $id) {
  $stmt = $pdo->prepare("SELECT * FROM msb_approvals WHERE id = ?");
  $stmt->execute([$id]);
  if (!$stmt->fetch()) {
    http_response_code(404);
    json(['success' => false, 'error' => 'Not found']);
    return;
  }
  $pdo->prepare("UPDATE msb_approvals SET status = 'declined', reviewed_at = NOW() WHERE id = ?")->execute([$id]);
  json(['success' => true]);
}

// --- WITHDRAWALS ---
function handleWithdrawalsForUser(PDO $pdo, string $userId) {
  $stmt = $pdo->prepare("SELECT id, user_id as userId, user_email as userEmail, amount, currency, wallet_address as walletAddress, wallet_network as walletNetwork, status, created_at as createdAt FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC");
  $stmt->execute([$userId]);
  json($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function handleWithdrawalsList(PDO $pdo) {
  $stmt = $pdo->query("SELECT id, user_id as userId, user_email as userEmail, amount, currency, wallet_address as walletAddress, wallet_network as walletNetwork, status, created_at as createdAt FROM withdrawals ORDER BY created_at DESC");
  json($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function handleWithdrawalsCreate(PDO $pdo) {
  $body = getBody();
  $userId = $body['userId'] ?? '';
  $userEmail = $body['userEmail'] ?? '';
  $amount = (float) ($body['amount'] ?? 0);
  $currency = trim($body['currency'] ?? 'USDT');
  $withdrawalPassword = $body['withdrawalPassword'] ?? '';
  if (!$userId || !$userEmail || $amount <= 0) {
    http_response_code(400);
    json(['success' => false, 'error' => 'Invalid request']);
    return;
  }
  assertUserNotLocked($pdo, $userId);
  assertUserBalanceNotFrozen($pdo, $userId);
  $stmt = $pdo->prepare("SELECT balance_usdt, frozen_usdt, main_withdrawal_address, main_withdrawal_network, withdrawal_password_hash FROM users WHERE id = ?");
  $stmt->execute([$userId]);
  $u = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$u) {
    http_response_code(404);
    json(['success' => false, 'error' => 'User not found']);
    return;
  }
  $balance = (float) $u['balance_usdt'];
  $frozen = (float) ($u['frozen_usdt'] ?? 0);
  $available = $balance - $frozen;
  if ($available < $amount) {
    http_response_code(400);
    json(['success' => false, 'error' => 'Insufficient balance']);
    return;
  }
  $walletAddress = trim($u['main_withdrawal_address'] ?? '');
  $walletNetwork = trim($u['main_withdrawal_network'] ?? '') ?: 'USDT (TRC20)';
  if (!$walletAddress) {
    http_response_code(400);
    json(['success' => false, 'error' => 'Please set your main withdrawal address in Profile first']);
    return;
  }
  $wHash = $u['withdrawal_password_hash'] ?? null;
  if (!$wHash) {
    http_response_code(400);
    json(['success' => false, 'error' => 'Please set your withdrawal password in Profile first']);
    return;
  }
  if (!password_verify($withdrawalPassword, $wHash)) {
    http_response_code(400);
    json(['success' => false, 'error' => 'Incorrect withdrawal password']);
    return;
  }
  $id = 'wd-' . time();
  $pdo->prepare("INSERT INTO withdrawals (id, user_id, user_email, amount, currency, wallet_address, wallet_network, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')")->execute([$id, $userId, $userEmail, $amount, $currency, $walletAddress, $walletNetwork]);
  $pdo->prepare("UPDATE users SET frozen_usdt = frozen_usdt + ? WHERE id = ?")->execute([$amount, $userId]);
  json(['success' => true, 'id' => $id]);
}

function handleWithdrawalsAccept(PDO $pdo, string $id) {
  $stmt = $pdo->prepare("SELECT * FROM withdrawals WHERE id = ? AND status = 'pending'");
  $stmt->execute([$id]);
  $w = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$w) {
    http_response_code(404);
    json(['success' => false, 'error' => 'Withdrawal not found']);
    return;
  }
  $pdo->prepare("UPDATE users SET balance_usdt = balance_usdt - ?, frozen_usdt = GREATEST(0, frozen_usdt - ?) WHERE id = ?")->execute([$w['amount'], $w['amount'], $w['user_id']]);
  $pdo->prepare("UPDATE withdrawals SET status = 'accepted' WHERE id = ?")->execute([$id]);
  json(['success' => true]);
}

function handleWithdrawalsDecline(PDO $pdo, string $id) {
  $stmt = $pdo->prepare("SELECT user_id, amount FROM withdrawals WHERE id = ? AND status = 'pending'");
  $stmt->execute([$id]);
  $w = $stmt->fetch(PDO::FETCH_ASSOC);
  if ($w) {
    $pdo->prepare("UPDATE users SET frozen_usdt = GREATEST(0, frozen_usdt - ?) WHERE id = ?")->execute([$w['amount'], $w['user_id']]);
  }
  $pdo->prepare("UPDATE withdrawals SET status = 'declined' WHERE id = ? AND status = 'pending'")->execute([$id]);
  json(['success' => true]);
}

// --- FEATURES CONFIG ---
function handleFeaturesPeriods(PDO $pdo) {
  if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT seconds, percent FROM features_periods ORDER BY sort_order");
    $list = [];
    while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $list[] = ['seconds' => (int) $r['seconds'], 'percent' => (float) $r['percent']];
    }
    json($list);
  } else {
    $body = getBody();
    $periods = $body['periods'] ?? [];
    if (!is_array($periods) || empty($periods)) {
      http_response_code(400);
      json(['success' => false, 'error' => 'At least one period required']);
      return;
    }
    try {
      $pdo->exec("DELETE FROM features_periods");
      $stmt = $pdo->prepare("INSERT INTO features_periods (seconds, percent, sort_order) VALUES (?, ?, ?)");
      $i = 0;
      foreach ($periods as $p) {
        $sec = (int) ($p['seconds'] ?? 0);
        $pct = (float) ($p['percent'] ?? 0);
        if ($sec > 0) $stmt->execute([$sec, $pct, ++$i]);
      }
      json(['success' => true]);
    } catch (PDOException $e) {
      http_response_code(400);
      json(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
  }
}

function handleFeaturesLevers(PDO $pdo) {
  if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT lever_value FROM features_levers ORDER BY sort_order");
    $list = [];
    while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $list[] = $r['lever_value'];
    }
    json($list);
  } else {
    $body = getBody();
    $levers = $body['levers'] ?? [];
    $pdo->exec("DELETE FROM features_levers");
    $stmt = $pdo->prepare("INSERT INTO features_levers (lever_value, sort_order) VALUES (?, ?)");
    $i = 0;
    foreach ($levers as $l) {
      $v = trim((string) $l);
      if ($v !== '') $stmt->execute([$v, ++$i]);
    }
    json(['success' => true]);
  }
}

// --- CHAT (River Customer Service) ---
function handleChatMessagesForUser(PDO $pdo, string $userId) {
  $since = isset($_GET['since']) ? trim((string) $_GET['since']) : '';
  $waitSec = isset($_GET['wait']) ? max(1, min(30, (int) $_GET['wait'])) : 0;

  $fetchAll = function () use ($pdo, $userId) {
    $stmt = $pdo->prepare("SELECT id, user_id as userId, sender_type as senderType, content, created_at as createdAt FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC");
    $stmt->execute([$userId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  };

  if ($waitSec > 0 && $since !== '') {
    $deadline = time() + $waitSec;
    $checkInterval = 500000; // 0.5 sec in microseconds
    while (time() < $deadline) {
      $stmt = $pdo->prepare("SELECT 1 FROM chat_messages WHERE user_id = ? AND created_at > ? LIMIT 1");
      $stmt->execute([$userId, $since]);
      if ($stmt->fetch()) {
        json($fetchAll());
        return;
      }
      usleep($checkInterval);
    }
  }
  json($fetchAll());
}

function handleChatSend(PDO $pdo) {
  $body = getBody();
  $userId = trim($body['userId'] ?? '');
  $content = trim($body['content'] ?? '');
  $senderType = strtolower(trim($body['senderType'] ?? 'user'));
  if (!in_array($senderType, ['user', 'admin'], true)) $senderType = 'user';
  if (!$userId || $content === '') {
    http_response_code(400);
    json(['success' => false, 'error' => 'userId and content required']);
    return;
  }
  $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
  $stmt->execute([$userId]);
  if (!$stmt->fetch()) {
    http_response_code(404);
    json(['success' => false, 'error' => 'User not found']);
    return;
  }
  $id = 'chat_' . time() . '_' . bin2hex(random_bytes(4));
  $pdo->prepare("INSERT INTO chat_messages (id, user_id, sender_type, content) VALUES (?, ?, ?, ?)")->execute([$id, $userId, $senderType, $content]);
  $stmt = $pdo->prepare("SELECT id, user_id as userId, sender_type as senderType, content, created_at as createdAt FROM chat_messages WHERE id = ?");
  $stmt->execute([$id]);
  $msg = $stmt->fetch(PDO::FETCH_ASSOC);
  json(['success' => true, 'message' => $msg]);
}

function handleChatUserUnread(PDO $pdo) {
  $userId = isset($_GET['userId']) ? trim((string) $_GET['userId']) : '';
  $since = isset($_GET['since']) ? trim((string) $_GET['since']) : '';
  $waitSec = isset($_GET['wait']) ? max(1, min(45, (int) $_GET['wait'])) : 0;
  if (!$userId || $since === '') {
    json(['hasUnread' => false]);
    return;
  }
  $check = function () use ($pdo, $userId, $since) {
    $stmt = $pdo->prepare("SELECT 1 FROM chat_messages WHERE user_id = ? AND sender_type = 'admin' AND created_at > ? LIMIT 1");
    $stmt->execute([$userId, $since]);
    return (bool) $stmt->fetch();
  };
  if ($waitSec > 0) {
    $deadline = time() + $waitSec;
    $interval = 300000; // 0.3 sec
    while (time() < $deadline) {
      if ($check()) {
        json(['hasUnread' => true]);
        return;
      }
      usleep($interval);
    }
  }
  json(['hasUnread' => $check()]);
}

function handleChatAdminUnread(PDO $pdo) {
  $since = isset($_GET['since']) ? trim((string) $_GET['since']) : '';
  $waitSec = isset($_GET['wait']) ? max(1, min(45, (int) $_GET['wait'])) : 0;
  if ($since === '') {
    json(['hasUnread' => false]);
    return;
  }
  $check = function () use ($pdo, $since) {
    $stmt = $pdo->prepare("SELECT 1 FROM chat_messages WHERE sender_type = 'user' AND created_at > ? LIMIT 1");
    $stmt->execute([$since]);
    return (bool) $stmt->fetch();
  };
  if ($waitSec > 0) {
    $deadline = time() + $waitSec;
    $interval = 300000; // 0.3 sec
    while (time() < $deadline) {
      if ($check()) {
        json(['hasUnread' => true]);
        return;
      }
      usleep($interval);
    }
  }
  json(['hasUnread' => $check()]);
}

function handleChatConversations(PDO $pdo) {
  $stmt = $pdo->query("
    SELECT u.id, u.email, u.name, 
      (SELECT COUNT(*) FROM chat_messages m WHERE m.user_id = u.id AND m.sender_type = 'user') as user_msg_count,
      (SELECT MAX(m.created_at) FROM chat_messages m WHERE m.user_id = u.id) as last_at
    FROM users u
    WHERE EXISTS (SELECT 1 FROM chat_messages m WHERE m.user_id = u.id)
    ORDER BY last_at DESC
  ");
  $list = [];
  while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $list[] = ['userId' => $r['id'], 'email' => $r['email'], 'name' => $r['name'], 'lastAt' => $r['last_at']];
  }
  json($list);
}

// --- CUSTOMER LINKS ---
function handleCustomerLinks(PDO $pdo) {
  if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT id, label, url FROM customer_links");
    $list = [];
    while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $list[] = $r;
    }
    json($list);
  } else {
    $body = getBody();
    $id = $body['id'] ?? '';
    $url = $body['url'] ?? '';
    if ($id) $pdo->prepare("UPDATE customer_links SET url = ? WHERE id = ?")->execute([$url, $id]);
    json(['success' => true]);
  }
}
