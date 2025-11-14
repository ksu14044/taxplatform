package com.taxplatform.util;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 세무플랫폼 검증 유틸리티 클래스
 * 사업자등록번호, 법인등록번호, 휴대폰 인증 등의 검증 로직 제공
 */
public class ValidationUtil {
    
    // 휴대폰 인증번호 저장소 (실제로는 Redis 등 사용 권장)
    private static final Map<String, String> verificationCodes = new ConcurrentHashMap<>();
    
    /**
     * 사업자등록번호 유효성 검증 (모의)
     * 실제로는 국세청 API를 호출해야 함
     * 
     * @param businessNumber 사업자등록번호 (하이픈 포함 가능)
     * @return 검증 결과
     */
    public static Map<String, Object> verifyBusinessNumber(String businessNumber) {
        Map<String, Object> result = new HashMap<>();
        
        if (businessNumber == null || businessNumber.isEmpty()) {
            result.put("valid", false);
            result.put("message", "사업자등록번호를 입력해주세요.");
            return result;
        }
        
        // 하이픈 제거
        String cleanNumber = businessNumber.replace("-", "");
        
        // 길이 검증 (10자리)
        if (cleanNumber.length() != 10) {
            result.put("valid", false);
            result.put("message", "사업자등록번호는 10자리여야 합니다.");
            return result;
        }
        
        // 숫자 검증
        if (!cleanNumber.matches("\\d{10}")) {
            result.put("valid", false);
            result.put("message", "사업자등록번호는 숫자만 입력 가능합니다.");
            return result;
        }
        
        // 모의 검증 - 실제로는 API 호출
        result.put("valid", true);
        result.put("message", "유효한 사업자등록번호입니다.");
        result.put("businessName", "테스트 사업자");
        result.put("businessType", "개인사업자");
        
        return result;
    }
    
    /**
     * 법인등록번호 유효성 검증 (모의)
     * 실제로는 법원 등기소 API를 호출해야 함
     * 
     * @param corporateNumber 법인등록번호 (하이픈 포함 가능)
     * @return 검증 결과
     */
    public static Map<String, Object> verifyCorporateNumber(String corporateNumber) {
        Map<String, Object> result = new HashMap<>();
        
        if (corporateNumber == null || corporateNumber.isEmpty()) {
            result.put("valid", false);
            result.put("message", "법인등록번호를 입력해주세요.");
            return result;
        }
        
        // 하이픈 제거
        String cleanNumber = corporateNumber.replace("-", "");
        
        // 길이 검증 (13자리)
        if (cleanNumber.length() != 13) {
            result.put("valid", false);
            result.put("message", "법인등록번호는 13자리여야 합니다.");
            return result;
        }
        
        // 숫자 검증
        if (!cleanNumber.matches("\\d{13}")) {
            result.put("valid", false);
            result.put("message", "법인등록번호는 숫자만 입력 가능합니다.");
            return result;
        }
        
        // 모의 검증 - 실제로는 API 호출
        result.put("valid", true);
        result.put("message", "유효한 법인등록번호입니다.");
        result.put("corporateName", "테스트 법인");
        result.put("corporateType", "주식회사");
        
        return result;
    }
    
    /**
     * 휴대폰 인증번호 생성 및 전송 (모의)
     * 실제로는 SMS API를 호출해야 함
     * 
     * @param phoneNumber 휴대폰 번호
     * @return 생성된 인증번호 (개발 환경에서만 반환, 실제로는 SMS로 전송)
     */
    public static Map<String, Object> sendVerificationCode(String phoneNumber) {
        Map<String, Object> result = new HashMap<>();
        
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            result.put("success", false);
            result.put("message", "휴대폰 번호를 입력해주세요.");
            return result;
        }
        
        // 휴대폰 번호 형식 검증
        String cleanPhone = phoneNumber.replace("-", "");
        if (!cleanPhone.matches("01[0-9]\\d{7,8}")) {
            result.put("success", false);
            result.put("message", "올바른 휴대폰 번호 형식이 아닙니다.");
            return result;
        }
        
        // 6자리 인증번호 생성
        String code = String.format("%06d", new Random().nextInt(1000000));
        
        // 인증번호 저장 (3분 유효)
        verificationCodes.put(phoneNumber, code);
        
        // 3분 후 자동 삭제 (실제로는 Redis TTL 사용)
        new Thread(() -> {
            try {
                Thread.sleep(3 * 60 * 1000); // 3분
                verificationCodes.remove(phoneNumber);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
        
        // 모의 전송 - 실제로는 SMS API 호출
        result.put("success", true);
        result.put("message", "인증번호가 전송되었습니다.");
        result.put("code", code); // 개발 환경에서만 반환
        result.put("expiresIn", 180); // 3분 (초 단위)
        
        return result;
    }
    
    /**
     * 휴대폰 인증번호 확인
     * 
     * @param phoneNumber 휴대폰 번호
     * @param code 사용자가 입력한 인증번호
     * @return 검증 결과
     */
    public static Map<String, Object> verifyPhoneCode(String phoneNumber, String code) {
        Map<String, Object> result = new HashMap<>();
        
        if (phoneNumber == null || phoneNumber.isEmpty() || code == null || code.isEmpty()) {
            result.put("valid", false);
            result.put("message", "휴대폰 번호와 인증번호를 입력해주세요.");
            return result;
        }
        
        String storedCode = verificationCodes.get(phoneNumber);
        
        if (storedCode == null) {
            result.put("valid", false);
            result.put("message", "인증번호가 만료되었거나 존재하지 않습니다.");
            return result;
        }
        
        if (!storedCode.equals(code)) {
            result.put("valid", false);
            result.put("message", "인증번호가 일치하지 않습니다.");
            return result;
        }
        
        // 인증 성공 시 인증번호 삭제
        verificationCodes.remove(phoneNumber);
        
        result.put("valid", true);
        result.put("message", "휴대폰 인증이 완료되었습니다.");
        
        return result;
    }
}

