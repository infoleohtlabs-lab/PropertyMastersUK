-- Add account lockout fields to users table
ALTER TABLE users 
ADD COLUMN failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN account_locked_until TIMESTAMP NULL,
ADD COLUMN is_account_locked BOOLEAN DEFAULT FALSE;

-- Create index for performance on account lockout queries
CREATE INDEX idx_users_account_locked ON users(is_account_locked, account_locked_until);
CREATE INDEX idx_users_failed_attempts ON users(failed_login_attempts);

-- Update existing users to have default values
UPDATE users 
SET failed_login_attempts = 0, 
    is_account_locked = FALSE 
WHERE failed_login_attempts IS NULL 
   OR is_account_locked IS NULL;