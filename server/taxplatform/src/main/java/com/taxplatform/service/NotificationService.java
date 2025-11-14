package com.taxplatform.service;

import com.taxplatform.domain.Notification;
import com.taxplatform.mapper.NotificationMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 알람 관련 비즈니스 로직을 처리하는 서비스
 */
@Service
public class NotificationService {
    
    @Autowired
    private NotificationMapper notificationMapper;
    
    /**
     * 알람 생성
     * @param userId 알람 받을 사용자 ID
     * @param senderId 알람 보낸 사용자 ID (nullable)
     * @param type 알람 타입
     * @param message 알람 내용
     * @return 생성된 Notification 객체
     */
    public Notification createNotification(Long userId, Long senderId, String type, String message) {
        Notification notification = new Notification(userId, senderId, type, message);
        int result = notificationMapper.insertNotification(notification);
        
        if (result > 0) {
            return notification;
        } else {
            throw new RuntimeException("알람 생성에 실패했습니다.");
        }
    }
    
    /**
     * 알람 목록 조회
     * @param userId 사용자 ID
     * @return Notification 객체 리스트
     */
    public List<Notification> getNotifications(Long userId) {
        return notificationMapper.findByUserId(userId);
    }
    
    /**
     * 알람 읽음 처리
     * @param notificationId 알람 ID
     * @return 처리 결과 메시지
     */
    public String markAsRead(Long notificationId) {
        int result = notificationMapper.markAsRead(notificationId);
        
        if (result > 0) {
            return "알람을 읽음 처리했습니다.";
        } else {
            throw new RuntimeException("알람 읽음 처리에 실패했습니다.");
        }
    }
    
    /**
     * 읽지 않은 알람 개수 조회
     * @param userId 사용자 ID
     * @return 읽지 않은 알람 개수
     */
    public int getUnreadCount(Long userId) {
        return notificationMapper.countUnreadByUserId(userId);
    }
}

