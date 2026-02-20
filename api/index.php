<?php
/**
 * River Trading API - Entry point
 * URL: http://localhost/river-trading/api/
 */

ob_start();
header('Access-Control-Allow-Origin: ' . (defined('CORS_ORIGIN') ? CORS_ORIGIN : '*'));
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = trim($uri, '/');
$method = $_SERVER['REQUEST_METHOD'];

if (preg_match('#qrcode/([^/]+)$#', $uri, $m) && $method === 'GET') {
  require_once __DIR__ . '/config.php';
  require_once __DIR__ . '/handlers.php';
  serveUploadedImage('qrcodes', $m[1]);
  exit;
}
if (preg_match('#proof/([^/]+)$#', $uri, $m) && $method === 'GET') {
  require_once __DIR__ . '/config.php';
  require_once __DIR__ . '/handlers.php';
  serveUploadedImage('proofs', $m[1]);
  exit;
}
if (preg_match('#msb/([^/]+)$#', $uri, $m) && $method === 'GET') {
  require_once __DIR__ . '/config.php';
  require_once __DIR__ . '/handlers.php';
  serveUploadedImage('msb', $m[1]);
  exit;
}

header('Content-Type: application/json; charset=utf-8');

try {
  require_once __DIR__ . '/config.php';
  require_once __DIR__ . '/db.php';
  require_once __DIR__ . '/handlers.php';

  $pdo = getDb();
  $parts = array_filter(explode('/', $uri));
  $last = end($parts);

  // Health
  if ($last === 'health' && $method === 'GET') {
    $pdo->query('SELECT 1');
    echo json_encode(['ok' => true, 'database' => 'connected']);
    exit;
  }

  // Auth
  if (preg_match('#auth/login$#', $uri) && $method === 'POST') { handleAuthLogin($pdo); exit; }
  if (preg_match('#auth/admin-login$#', $uri) && $method === 'POST') { handleAuthAdminLogin($pdo); exit; }
  if (preg_match('#auth/signup$#', $uri) && $method === 'POST') { handleAuthSignup($pdo); exit; }

  // Users
  if (preg_match('#users$#', $uri) && $method === 'GET') { handleUsersList($pdo); exit; }
  if (preg_match('#users/([^/]+)$#', $uri, $m) && $method === 'DELETE') { handleUserDelete($pdo, $m[1]); exit; }
  if (preg_match('#users/([^/]+)/approve$#', $uri, $m) && $method === 'POST') { handleUserApprove($pdo, $m[1]); exit; }
  if (preg_match('#users/([^/]+)/credit-score$#', $uri, $m) && $method === 'PATCH') { handleUserCreditScore($pdo, $m[1]); exit; }
  if (preg_match('#users/([^/]+)/balance$#', $uri, $m) && $method === 'PATCH') { handleUserAdjustBalance($pdo, $m[1]); exit; }
  if (preg_match('#users/([^/]+)/withdrawal-address$#', $uri, $m) && $method === 'PATCH') { handleUserSetWithdrawalAddress($pdo, $m[1]); exit; }
  if (preg_match('#users/([^/]+)/withdrawal-password$#', $uri, $m) && $method === 'PATCH') { handleUserSetWithdrawalPassword($pdo, $m[1]); exit; }
  if (preg_match('#users/([^/]+)/login-password$#', $uri, $m) && $method === 'PATCH') { handleUserChangeLoginPassword($pdo, $m[1]); exit; }
  if (preg_match('#users/([^/]+)/documents$#', $uri, $m) && $method === 'POST') { handleUserAddDocument($pdo, $m[1]); exit; }
  if (preg_match('#users/([^/]+)/lock$#', $uri, $m) && $method === 'PATCH') { handleUserLock($pdo, $m[1]); exit; }
  if (preg_match('#users/([^/]+)/freeze-balance$#', $uri, $m) && $method === 'PATCH') { handleUserFreezeBalance($pdo, $m[1]); exit; }
  if (preg_match('#users/([^/]+)/deposits$#', $uri, $m) && $method === 'GET') { handleDepositsForUser($pdo, $m[1]); exit; }
  if (preg_match('#users/([^/]+)/chat-messages$#', $uri, $m) && $method === 'GET') { handleChatMessagesForUser($pdo, $m[1]); exit; }
  if (preg_match('#users/([^/]+)/notifications$#', $uri, $m) && $method === 'GET') { handleUserNotifications($pdo, $m[1]); exit; }
  if (preg_match('#users/([^/]+)$#', $uri, $m) && $method === 'GET') { handleUserGet($pdo, $m[1]); exit; }

  // Chat (River Customer Service)
  if (preg_match('#chat/conversations$#', $uri) && $method === 'GET') { handleChatConversations($pdo); exit; }
  if (preg_match('#chat/user-unread$#', $uri) && $method === 'GET') { handleChatUserUnread($pdo); exit; }
  if (preg_match('#chat/admin-unread$#', $uri) && $method === 'GET') { handleChatAdminUnread($pdo); exit; }
  if (preg_match('#chat/messages$#', $uri) && $method === 'POST') { handleChatSend($pdo); exit; }

  // Referral codes
  if (preg_match('#referral-codes$#', $uri) && $method === 'GET') { handleReferralCodesList($pdo); exit; }
  if (preg_match('#referral-codes/generate$#', $uri) && $method === 'POST') { handleReferralCodesGenerate($pdo); exit; }
  if (preg_match('#referral-codes/validate$#', $uri) && $method === 'POST') { handleReferralCodesValidate($pdo); exit; }

  // Trades
  if (preg_match('#trades$#', $uri) && $method === 'GET') { handleTradesList($pdo); exit; }
  if (preg_match('#trades/spot$#', $uri) && $method === 'POST') { handleTradesSpot($pdo); exit; }
  if (preg_match('#trades/features$#', $uri) && $method === 'POST') { handleTradesFeatures($pdo); exit; }
  if (preg_match('#trades/process-expired$#', $uri) && $method === 'POST') { handleTradesProcessExpired($pdo); exit; }
  if (preg_match('#trades/([^/]+)/settle$#', $uri, $m) && $method === 'POST') { handleTradesSettle($pdo, $m[1]); exit; }
  if (preg_match('#users/([^/]+)/trades$#', $uri, $m) && $method === 'GET') { handleTradesForUser($pdo, $m[1]); exit; }

  // Payment methods
  if (preg_match('#payment-methods$#', $uri)) {
    if ($method === 'GET') { handlePaymentMethodsList($pdo); exit; }
    if ($method === 'POST') { handlePaymentMethodsCreate($pdo); exit; }
  }
  if (preg_match('#payment-methods/([^/]+)$#', $uri, $m) && $method === 'DELETE') { handlePaymentMethodsDelete($pdo, $m[1]); exit; }

  // Deposits
  if (preg_match('#deposits$#', $uri)) {
    if ($method === 'GET') { handleDepositsList($pdo); exit; }
    if ($method === 'POST') { handleDepositsCreate($pdo); exit; }
  }
  if (preg_match('#deposits/([^/]+)/accept$#', $uri, $m) && $method === 'POST') { handleDepositsAccept($pdo, $m[1]); exit; }
  if (preg_match('#deposits/([^/]+)/decline$#', $uri, $m) && $method === 'POST') { handleDepositsDecline($pdo, $m[1]); exit; }

  // MSB Approvals
  if (preg_match('#msb-approval/status$#', $uri) && $method === 'GET') {
    $userId = $_GET['userId'] ?? '';
    if (!$userId) { http_response_code(400); echo json_encode(['error' => 'userId required']); exit; }
    handleMsbApprovalStatus($pdo, $userId);
    exit;
  }
  if (preg_match('#msb-approval$#', $uri) && $method === 'POST') { handleMsbApprovalSubmit($pdo); exit; }
  if (preg_match('#msb-approvals$#', $uri) && $method === 'GET') { handleMsbApprovalsList($pdo); exit; }
  if (preg_match('#msb-approvals/([^/]+)/approve$#', $uri, $m) && $method === 'POST') { handleMsbApprovalApprove($pdo, $m[1]); exit; }
  if (preg_match('#msb-approvals/([^/]+)/decline$#', $uri, $m) && $method === 'POST') { handleMsbApprovalDecline($pdo, $m[1]); exit; }

  // Withdrawals
  if (preg_match('#users/([^/]+)/withdrawals$#', $uri, $m) && $method === 'GET') { handleWithdrawalsForUser($pdo, $m[1]); exit; }
  if (preg_match('#withdrawals$#', $uri)) {
    if ($method === 'GET') { handleWithdrawalsList($pdo); exit; }
    if ($method === 'POST') { handleWithdrawalsCreate($pdo); exit; }
  }
  if (preg_match('#withdrawals/([^/]+)/accept$#', $uri, $m) && $method === 'POST') { handleWithdrawalsAccept($pdo, $m[1]); exit; }
  if (preg_match('#withdrawals/([^/]+)/decline$#', $uri, $m) && $method === 'POST') { handleWithdrawalsDecline($pdo, $m[1]); exit; }

  // Features config
  if (preg_match('#features/periods$#', $uri)) { handleFeaturesPeriods($pdo); exit; }
  if (preg_match('#features/levers$#', $uri)) { handleFeaturesLevers($pdo); exit; }

  // Customer links
  if (preg_match('#customer-links$#', $uri)) { handleCustomerLinks($pdo); exit; }

  // Pledges (DEFI Staking)
  if (preg_match('#pledges$#', $uri) && $method === 'GET') { handlePledgesList($pdo); exit; }
  if (preg_match('#pledges$#', $uri) && $method === 'POST') { handlePledgeCreate($pdo); exit; }
  if (preg_match('#users/([^/]+)/pledges$#', $uri, $m) && $method === 'GET') { handlePledgesForUser($pdo, (string) rawurldecode($m[1])); exit; }

  http_response_code(404);
  echo json_encode(['error' => 'Not found', 'path' => $uri]);

} catch (PDOException $e) {
  ob_clean();
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
} catch (Throwable $e) {
  ob_clean();
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
