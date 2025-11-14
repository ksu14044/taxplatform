package com.taxplatform.controller;

import com.taxplatform.domain.Notification;
import com.taxplatform.dto.ApiResponse;
import com.taxplatform.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 알람 관련 API 컨트롤러
 */
@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/notifications")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * 알람 목록 조회
     * @param userId 사용자 ID
     * @return 알람 목록
     */
    @GetMapping
    public ApiResponse<List<Notification>> getNotifications(@RequestParam Long userId) {
        try {
            List<Notification> notifications = notificationService.getNotifications(userId);
            return ApiResponse.success("알람 목록 조회 성공", notifications);
        } catch (Exception e) {
            return ApiResponse.error("NOTIFICATION_FETCH_FAILED", e.getMessage());
        }
    }
    
    /**
     * 알람 읽음 처리
     * @param id 알람 ID
     * @return 처리 결과
     */
    @PutMapping("/{id}/read")
    public ApiResponse<String> markAsRead(@PathVariable Long id) {
        try {
            String message = notificationService.markAsRead(id);
            return ApiResponse.success(message, message);
        } catch (Exception e) {
            return ApiResponse.error("NOTIFICATION_UPDATE_FAILED", e.getMessage());
        }
    }
    
    /**
     * 읽지 않은 알람 개수 조회
     * @param userId 사용자 ID
     * @return 읽지 않은 알람 개수
     */
    @GetMapping("/unread-count")
    public ApiResponse<Integer> getUnreadCount(@RequestParam Long userId) {
        try {
            int count = notificationService.getUnreadCount(userId);
            return ApiResponse.success("읽지 않은 알람 개수 조회 성공", count);
        } catch (Exception e) {
            return ApiResponse.error("UNREAD_COUNT_FETCH_FAILED", e.getMessage());
        }
    }
}

