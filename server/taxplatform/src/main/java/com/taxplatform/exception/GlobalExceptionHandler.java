package com.taxplatform.exception;

import com.taxplatform.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 전역 예외 처리 핸들러
 * 모든 Controller에서 발생하는 예외를 공통으로 처리
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * IllegalArgumentException 처리 (비즈니스 로직 검증 실패)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgumentException(IllegalArgumentException e) {
        log.warn(">>> 비즈니스 로직 검증 실패: {}", e.getMessage());
        ApiResponse<Object> response = ApiResponse.error("VALIDATION_ERROR", e.getMessage());
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * RuntimeException 처리 (일반 런타임 예외)
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> handleRuntimeException(RuntimeException e) {
        log.error(">>> 런타임 예외 발생", e);
        ApiResponse<Object> response = ApiResponse.error("RUNTIME_ERROR", "처리 중 오류가 발생했습니다.", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * Exception 처리 (기타 모든 예외)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleException(Exception e) {
        log.error(">>> 예외 발생", e);
        ApiResponse<Object> response = ApiResponse.error("INTERNAL_ERROR", "서버 내부 오류가 발생했습니다.", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}

