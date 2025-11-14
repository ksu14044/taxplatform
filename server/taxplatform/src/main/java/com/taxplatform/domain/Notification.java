package com.taxplatform.domain;

import java.time.LocalDateTime;

/**
 * Notification 테이블 엔티티 클래스
 */
public class Notification {
    private Long notificationId;
    private Long userId;                // 알람 받을 사용자
    private Long senderId;              // 알람 보낸 사용자 (nullable)
    private String type;                // 알람 타입: CLIENT_TO_TAX, TAX_TO_CLIENT
    private String message;             // 알람 내용
    private Boolean isRead;             // 읽음 여부
    private LocalDateTime createdAt;

    public Notification() {
    }

    public Notification(Long userId, Long senderId, String type, String message) {
        this.userId = userId;
        this.senderId = senderId;
        this.type = type;
        this.message = message;
        this.isRead = false;
    }

    public Long getNotificationId() {
        return notificationId;
    }

    public void setNotificationId(Long notificationId) {
        this.notificationId = notificationId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "Notification{" +
                "notificationId=" + notificationId +
                ", userId=" + userId +
                ", senderId=" + senderId +
                ", type='" + type + '\'' +
                ", message='" + message + '\'' +
                ", isRead=" + isRead +
                ", createdAt=" + createdAt +
                '}';
    }
}

