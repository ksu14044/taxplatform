package com.taxplatform.controller;

import com.taxplatform.dto.ApiResponse;
import com.taxplatform.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 결제 관련 API 컨트롤러
 */
@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/payment")
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;
    
    /**
     * 결제 처리 (목업)
     * @param request userId를 포함한 요청 객체
     * @return 결제 처리 결과
     */
    @PostMapping("/process")
    public ApiResponse<String> processPayment(@RequestBody PaymentRequest request) {
        try {
            String message = paymentService.processPayment(request.getUserId());
            return ApiResponse.success(message, message);
        } catch (Exception e) {
            return ApiResponse.error("PAYMENT_PROCESS_FAILED", e.getMessage());
        }
    }
    
    /**
     * 결제 상태 확인
     * @param userId 사용자 ID
     * @return 결제 상태 정보
     */
    @GetMapping("/status")
    public ApiResponse<PaymentService.PaymentStatusInfo> checkPaymentStatus(@RequestParam Long userId) {
        try {
            PaymentService.PaymentStatusInfo info = paymentService.checkPaymentStatus(userId);
            return ApiResponse.success("결제 상태 조회 성공", info);
        } catch (Exception e) {
            return ApiResponse.error("PAYMENT_STATUS_CHECK_FAILED", e.getMessage());
        }
    }
    
    /**
     * 결제 요청 DTO
     */
    public static class PaymentRequest {
        private Long userId;
        
        public Long getUserId() {
            return userId;
        }
        
        public void setUserId(Long userId) {
            this.userId = userId;
        }
    }
}

