-- Add locked column so admin can block users from using the system
ALTER TABLE users ADD COLUMN locked TINYINT(1) NOT NULL DEFAULT 0 AFTER status;
