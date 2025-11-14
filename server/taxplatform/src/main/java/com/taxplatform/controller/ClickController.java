package com.taxplatform.controller;

import com.taxplatform.domain.Test;
import com.taxplatform.dto.ApiResponse;
import com.taxplatform.service.TestService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 핑퐁 기능을 제공하는 Controller
 * 요청/응답 매핑만 담당하며, 비즈니스 로직은 Service에 위임
 */
@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api")
public class ClickController {

    private static final Logger log = LoggerFactory.getLogger(ClickController.class);

    private final TestService testService;

    public ClickController(TestService testService) {
        this.testService = testService;
    }

    @PostConstruct
    public void init() {
        log.info(">>> ClickController loaded");
    }

    /**
     * 헬스 체크 API
     * @return 서버 상태 응답
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        log.debug(">>> /api/health called");
        
        Map<String, Object> data = new HashMap<>();
        data.put("status", "UP");
        data.put("service", "TaxPlatform");
        
        return ResponseEntity.ok(ApiResponse.success("서버가 정상 작동 중입니다.", data));
    }

    /**
     * 핑퐁 API
     * @param count 카운트 값
     * @return 공통 응답 형식
     */
    @GetMapping("/click")
    public ResponseEntity<ApiResponse<Map<String, Object>>> click(@RequestParam int count) {
        log.info(">>> /api/click called, count = {}", count);
        
        // 비즈니스 로직은 Service에 위임
        Test savedTest = testService.saveClickCount(count);
        
        // 응답 데이터 구성
        Map<String, Object> data = new HashMap<>();
        data.put("receivedCount", count);
        data.put("testId", savedTest.getTestId());
        
        log.info(">>> 핑퐁 처리 완료: count={}, testId={}", count, savedTest.getTestId());
        
        return ResponseEntity.ok(ApiResponse.success("핑퐁 성공! 백엔드에서 응답하고 DB에 저장했습니다.", data));
    }
}
