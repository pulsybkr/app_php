CREATE TABLE IF NOT EXISTS notification_message (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id INT NOT NULL,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    translated_content TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_receiver (receiver_id),
    INDEX idx_receiver_read (receiver_id, is_read),
    INDEX idx_created_at (created_at)
);