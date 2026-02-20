-- MSB Approvals: user ID card uploads for admin review
CREATE TABLE IF NOT EXISTS msb_approvals (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  front_url VARCHAR(500) NOT NULL,
  back_url VARCHAR(500) NOT NULL,
  status ENUM('pending', 'approved', 'declined') NOT NULL DEFAULT 'pending',
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_msb_user (user_id),
  INDEX idx_msb_status (status),
  INDEX idx_msb_submitted (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
