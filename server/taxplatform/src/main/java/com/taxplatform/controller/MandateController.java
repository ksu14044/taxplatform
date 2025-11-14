package com.taxplatform.controller;

import com.taxplatform.dto.ApiResponse;
import com.taxplatform.service.MandateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 수임 동의 관련 API 컨트롤러
 */
@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/mandate")
public class MandateController {
    
    @Autowired
    private MandateService mandateService;
    
    /**
     * 수임 동의 신청 (회원 → 세무사)
     * @param request userId를 포함한 요청 객체
     * @return 처리 결과
     */
    @PostMapping("/request")
    public ApiResponse<String> requestMandate(@RequestBody MandateRequest request) {
        try {
            String message = mandateService.requestMandate(request.getUserId());
            return ApiResponse.success(message, message);
        } catch (Exception e) {
            return ApiResponse.error("MANDATE_REQUEST_FAILED", e.getMessage());
        }
    }
    
    /**
     * 수임 동의 요청 전송 (세무사 → 회원)
     * @param request taxAccountantId와 clientId를 포함한 요청 객체
     * @return 처리 결과
     */
    @PostMapping("/send-request")
    public ApiResponse<String> sendMandateRequest(@RequestBody SendMandateRequest request) {
        try {
            String message = mandateService.sendMandateRequest(request.getTaxAccountantId(), request.getClientId());
            return ApiResponse.success(message, message);
        } catch (Exception e) {
            return ApiResponse.error("MANDATE_SEND_FAILED", e.getMessage());
        }
    }
    
    /**
     * 수임 동의 수락 완료 (회원)
     * @param request userId를 포함한 요청 객체
     * @return 처리 결과
     */
    @PostMapping("/complete")
    public ApiResponse<String> completeMandate(@RequestBody MandateRequest request) {
        try {
            String message = mandateService.completeMandate(request.getUserId());
            return ApiResponse.success(message, message);
        } catch (Exception e) {
            return ApiResponse.error("MANDATE_COMPLETE_FAILED", e.getMessage());
        }
    }
    
    /**
     * 모든 수임 동의 내역 조회 (세무사용)
     * @return 수임 동의 내역 리스트
     */
    @GetMapping("/list")
    public ApiResponse<?> getMandateList() {
        try {
            return ApiResponse.success("수임 동의 내역 조회 성공", mandateService.getAllMandateRequests());
        } catch (Exception e) {
            return ApiResponse.error("MANDATE_LIST_FAILED", e.getMessage());
        }
    }
    
    /**
     * 수임 동의 신청 요청 DTO
     */
    public static class MandateRequest {
        private Long userId;
        
        public Long getUserId() {
            return userId;
        }
        
        public void setUserId(Long userId) {
            this.userId = userId;
        }
    }
    
    /**
     * 수임 동의 요청 전송 DTO
     */
    public static class SendMandateRequest {
        private Long taxAccountantId;
        private Long clientId;
        
        public Long getTaxAccountantId() {
            return taxAccountantId;
        }
        
        public void setTaxAccountantId(Long taxAccountantId) {
            this.taxAccountantId = taxAccountantId;
        }
        
        public Long getClientId() {
            return clientId;
        }
        
        public void setClientId(Long clientId) {
            this.clientId = clientId;
        }
    }
}

