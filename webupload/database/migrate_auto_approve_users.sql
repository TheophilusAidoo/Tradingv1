-- Auto-approve all users: new registrations get immediate access (no document upload / approval gate)
-- Run once to approve existing pending users
UPDATE users SET status = 'approved' WHERE status = 'pending';
