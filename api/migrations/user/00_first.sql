-- Up Migration

-- Create a table to store your users
-- We will use email as the primary way to identify a user.
CREATE TABLE IF NOT EXISTS users (
     id TEXT PRIMARY KEY,                           -- Unique identifier for the user (e.g., a UUID)
     email TEXT NOT NULL UNIQUE,                    -- User's email address, must be unique
     name TEXT,                              -- User's name (optional)
     timezone TEXT DEFAULT 'UTC', -- User's timezone, defaulting to UTC
     status TEXT DEFAULT 'unverified',        -- Status of the user (e.g., 'active', 'inactive', 'banned')
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of when the user was created
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp of the last update
);

-- Create an index on the email column for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Create a table to store one-time passwords (OTPs)
CREATE TABLE IF NOT EXISTS otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,         -- Auto-incrementing primary key
    user_id TEXT NOT NULL,                        -- Foreign key referencing the users table
    otp_code TEXT NOT NULL,                       -- The generated OTP code
    expires_at TIMESTAMP NOT NULL,                -- The expiration time for the OTP
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of when the OTP was created
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_otps_user_id ON otps (user_id);

-- Create a table to store refresh tokens
-- This allows users to stay logged in for longer periods without re-entering an OTP
CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,         -- Auto-incrementing primary key
      user_id TEXT NOT NULL,                        -- Foreign key referencing the users table
      token TEXT NOT NULL UNIQUE,                   -- The refresh token string
      expires_at TIMESTAMP NOT NULL,                -- The expiration time for the refresh token
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of when the token was created
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);

-- Create a trigger to automatically update the 'updated_at' timestamp on the users table
CREATE TRIGGER IF NOT EXISTS trigger_users_updated_at
    AFTER UPDATE ON users FOR EACH ROW
BEGIN
UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;


CREATE TABLE IF NOT EXISTS user_plan (
     id TEXT PRIMARY KEY,
     user_id TEXT NOT NULL,
     customer_id INTEGER NOT NULL,
     created_at TIMESTAMP NOT NULL,
     ends_at TIMESTAMP,
     renews_at TIMESTAMP,
     updated_at TIMESTAMP,
     subscription_id TEXT,
     product_name TEXT NOT NULL,
     status TEXT NOT NULL,
     FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_plan_user_id ON user_plan (user_id);

CREATE TABLE IF NOT EXISTS demo_users (
     id TEXT PRIMARY KEY,                           -- Unique identifier for the demo user
     email TEXT NOT NULL UNIQUE,                    -- Demo user's email address, must be unique
     otp TEXT NOT NULL,                          -- One-time password for the demo user
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of when the demo user was created
     expires_at TIMESTAMP,                     -- Expiration time for the demo user
     FOREIGN KEY (id) REFERENCES users (id) ON DELETE CASCADE
);