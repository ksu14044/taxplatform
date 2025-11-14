package com.taxplatform.controller;

import com.taxplatform.domain.User;
import com.taxplatform.dto.ApiResponse;
import com.taxplatform.service.UserService;
import com.taxplatform.util.ValidationUtil;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 인증 관련 기능을 제공하는 Controller
 * 요청/응답 매핑만 담당하며, 비즈니스 로직은 Service에 위임
 */
@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostConstruct
    public void init() {
        log.info(">>> AuthController loaded");
    }

    /**
     * 회원가입 API
     * @param request 회원가입 요청 데이터
     * @return 공통 응답 형식
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String email = request.get("email");
        String password = request.get("password");
        String name = request.get("name");
        
        // 세무플랫폼 추가 필드
        String residentNumber = request.get("residentNumber");
        String phoneNumber = request.get("phoneNumber");
        String postalCode = request.get("postalCode");
        String address = request.get("address");
        String addressDetail = request.get("addressDetail");
        String userType = request.get("userType");
        String businessNumber = request.get("businessNumber");
        String corporateNumber = request.get("corporateNumber");
        
        // User 객체 생성 및 필드 설정
        User user = new User(username, email, password, name);
        user.setResidentNumber(residentNumber);
        user.setPhoneNumber(phoneNumber);
        user.setPostalCode(postalCode);
        user.setAddress(address);
        user.setAddressDetail(addressDetail);
        user.setUserType(userType);
        user.setBusinessNumber(businessNumber);
        user.setCorporateNumber(corporateNumber);
        
        // 입력 검증은 Service에서 처리하도록 위임
        User savedUser = userService.register(user);
        
        // 응답 데이터 구성
        Map<String, Object> userData = new HashMap<>();
        userData.put("userId", savedUser.getUserId());
        userData.put("username", savedUser.getUsername());
        userData.put("email", savedUser.getEmail());
        userData.put("name", savedUser.getName());
        userData.put("phoneNumber", savedUser.getPhoneNumber());
        userData.put("userType", savedUser.getUserType());
        
        log.info(">>> 회원가입 성공: username={}, email={}, userType={}", username, email, userType);
        return ResponseEntity.ok(ApiResponse.success("회원가입이 완료되었습니다.", userData));
    }

    /**
     * 로그인 API
     * @param request 로그인 요청 데이터
     * @return 공통 응답 형식
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@RequestBody Map<String, String> request) {
        String usernameOrEmail = request.get("usernameOrEmail");
        String password = request.get("password");
        
        // 비즈니스 로직은 Service에 위임
        User user = userService.login(usernameOrEmail, password);
        
        // 응답 데이터 구성
        Map<String, Object> userData = new HashMap<>();
        userData.put("userId", user.getUserId());
        userData.put("username", user.getUsername());
        userData.put("email", user.getEmail());
        userData.put("name", user.getName());
        userData.put("role", user.getRole());  // role 필드 추가
        userData.put("paymentStatus", user.getPaymentStatus());  // 결제 상태 추가
        userData.put("mandateStatus", user.getMandateStatus());  // 수임 동의 상태 추가
        
        log.info(">>> 로그인 성공: username={}, userId={}, role={}", user.getUsername(), user.getUserId(), user.getRole());
        return ResponseEntity.ok(ApiResponse.success("로그인 성공", userData));
    }
    
    /**
     * 사업자등록번호 검증 API
     * @param request 사업자등록번호
     * @return 검증 결과
     */
    @PostMapping("/verify-business-number")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyBusinessNumber(@RequestBody Map<String, String> request) {
        String businessNumber = request.get("businessNumber");
        
        Map<String, Object> result = ValidationUtil.verifyBusinessNumber(businessNumber);
        
        if ((Boolean) result.get("valid")) {
            log.info(">>> 사업자등록번호 검증 성공: {}", businessNumber);
            return ResponseEntity.ok(ApiResponse.success((String) result.get("message"), result));
        } else {
            log.warn(">>> 사업자등록번호 검증 실패: {}", businessNumber);
            return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_BUSINESS_NUMBER", (String) result.get("message")));
        }
    }
    
    /**
     * 법인등록번호 검증 API
     * @param request 법인등록번호
     * @return 검증 결과
     */
    @PostMapping("/verify-corporate-number")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyCorporateNumber(@RequestBody Map<String, String> request) {
        String corporateNumber = request.get("corporateNumber");
        
        Map<String, Object> result = ValidationUtil.verifyCorporateNumber(corporateNumber);
        
        if ((Boolean) result.get("valid")) {
            log.info(">>> 법인등록번호 검증 성공: {}", corporateNumber);
            return ResponseEntity.ok(ApiResponse.success((String) result.get("message"), result));
        } else {
            log.warn(">>> 법인등록번호 검증 실패: {}", corporateNumber);
            return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_CORPORATE_NUMBER", (String) result.get("message")));
        }
    }
    
    /**
     * 휴대폰 인증번호 전송 API
     * @param request 휴대폰 번호
     * @return 인증번호 (개발 환경에서만)
     */
    @PostMapping("/send-verification-code")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendVerificationCode(@RequestBody Map<String, String> request) {
        String phoneNumber = request.get("phoneNumber");
        
        Map<String, Object> result = ValidationUtil.sendVerificationCode(phoneNumber);
        
        if ((Boolean) result.get("success")) {
            log.info(">>> 휴대폰 인증번호 전송 성공: {}", phoneNumber);
            return ResponseEntity.ok(ApiResponse.success((String) result.get("message"), result));
        } else {
            log.warn(">>> 휴대폰 인증번호 전송 실패: {}", phoneNumber);
            return ResponseEntity.badRequest().body(ApiResponse.error("VERIFICATION_SEND_FAILED", (String) result.get("message")));
        }
    }
    
    /**
     * 휴대폰 인증번호 확인 API
     * @param request 휴대폰 번호와 인증번호
     * @return 검증 결과
     */
    @PostMapping("/verify-phone-code")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyPhoneCode(@RequestBody Map<String, String> request) {
        String phoneNumber = request.get("phoneNumber");
        String code = request.get("code");
        
        Map<String, Object> result = ValidationUtil.verifyPhoneCode(phoneNumber, code);
        
        if ((Boolean) result.get("valid")) {
            log.info(">>> 휴대폰 인증 성공: {}", phoneNumber);
            return ResponseEntity.ok(ApiResponse.success((String) result.get("message"), result));
        } else {
            log.warn(">>> 휴대폰 인증 실패: {}", phoneNumber);
            return ResponseEntity.badRequest().body(ApiResponse.error("VERIFICATION_FAILED", (String) result.get("message")));
        }
    }
}

