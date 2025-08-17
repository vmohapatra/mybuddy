-- Profile table to store buddy profiles
CREATE TABLE IF NOT EXISTS profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    buddy_name VARCHAR(100) NOT NULL,
    buddy_personality TEXT NOT NULL,
    buddy_rules TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_email_device_buddy (email, device_id, buddy_name)
);

-- Chat history table
CREATE TABLE IF NOT EXISTS chat_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    is_user_message BOOLEAN NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Search history table
CREATE TABLE IF NOT EXISTS search_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    query TEXT NOT NULL,
    result TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Game history table
CREATE TABLE IF NOT EXISTS game_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    game_type VARCHAR(50) NOT NULL,
    game_data TEXT,
    score INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email_device ON profiles(email, device_id);
CREATE INDEX idx_chat_history_profile ON chat_history(profile_id);
CREATE INDEX idx_search_history_profile ON search_history(profile_id);
CREATE INDEX idx_game_history_profile ON game_history(profile_id);
