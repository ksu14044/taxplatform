-- users 테이블 생성 SQL
-- MySQL 데이터베이스에 실행하세요

-- 개발 환경: 기존 테이블 삭제 후 재생성
-- 외래키 관계가 있는 테이블을 먼저 삭제
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    
    -- 세무플랫폼 추가 필드
    resident_number VARCHAR(255),           -- 주민등록번호 (암호화 저장)
    phone_number VARCHAR(20) NOT NULL,      -- 휴대폰 번호
    postal_code VARCHAR(10),                -- 우편번호
    address VARCHAR(255),                   -- 기본주소
    address_detail VARCHAR(255),            -- 상세주소
    user_type VARCHAR(20) NOT NULL,         -- 유형: INDIVIDUAL, CORPORATE, NON_BUSINESS
    business_number VARCHAR(20),            -- 사업자등록번호 (선택)
    corporate_number VARCHAR(20),           -- 법인등록번호 (선택)
    
    -- 역할 및 결제/수임 동의 관련 필드
    role VARCHAR(20) NOT NULL DEFAULT 'CLIENT',           -- 역할: CLIENT(회원), TAX_ACCOUNTANT(세무사)
    payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID', -- 결제상태: UNPAID(미결제), PAID(결제완료)
    last_payment_date DATETIME,                           -- 마지막 결제일 (1달 단위 체크용)
    mandate_status VARCHAR(20) NOT NULL DEFAULT 'NONE',   -- 수임동의상태: NONE(없음), REQUESTED(신청됨), SENT(세무사가 홈택스 요청 보냄), COMPLETED(완료)
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_phone_number (phone_number),
    INDEX idx_business_number (business_number),
    INDEX idx_role (role),
    INDEX idx_payment_status (payment_status),
    INDEX idx_mandate_status (mandate_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




