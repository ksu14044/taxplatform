-- notifications 테이블 생성 SQL
-- MySQL 데이터베이스에 실행하세요

-- 개발 환경: 기존 테이블 삭제 후 재생성
DROP TABLE IF EXISTS notifications;

CREATE TABLE notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,                        -- 알람 받을 사용자
    sender_id BIGINT,                               -- 알람 보낸 사용자 (nullable)
    type VARCHAR(20) NOT NULL,                      -- 알람 타입: CLIENT_TO_TAX(회원→세무사), TAX_TO_CLIENT(세무사→회원)
    message TEXT NOT NULL,                          -- 알람 내용
    is_read BOOLEAN NOT NULL DEFAULT FALSE,         -- 읽음 여부
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

