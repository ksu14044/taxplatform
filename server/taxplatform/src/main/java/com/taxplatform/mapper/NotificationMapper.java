package com.taxplatform.mapper;

import com.taxplatform.domain.Notification;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

/**
 * Notification 테이블 MyBatis Mapper 인터페이스
 */
@Mapper
public interface NotificationMapper {
    
    /**
     * 알람 생성
     * @param notification Notification 객체
     * @return 저장된 행의 수
     */
    int insertNotification(Notification notification);
    
    /**
     * 사용자별 알람 목록 조회
     * @param userId 사용자 ID
     * @return Notification 객체 리스트
     */
    List<Notification> findByUserId(Long userId);
    
    /**
     * 알람 읽음 처리
     * @param notificationId 알람 ID
     * @return 업데이트된 행의 수
     */
    int markAsRead(Long notificationId);
    
    /**
     * 읽지 않은 알람 개수 조회
     * @param userId 사용자 ID
     * @return 읽지 않은 알람 개수
     */
    int countUnreadByUserId(Long userId);
}

