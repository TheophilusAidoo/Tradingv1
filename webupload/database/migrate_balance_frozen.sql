-- Admin can freeze user's balance; frozen users cannot withdraw, trade, or features trade
ALTER TABLE users ADD COLUMN balance_frozen TINYINT(1) NOT NULL DEFAULT 0 AFTER locked;
