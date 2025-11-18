package com.taxplatform.service;

import com.taxplatform.domain.User;
import com.taxplatform.mapper.UserMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;

/**
 * User 관련 비즈니스 로직을 처리하는 Service 클래스
 */
@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserMapper userMapper;

    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    /**
     * 회원가입 처리
     * @param user User 객체
     * @return 저장된 User 객체
     * @throws IllegalArgumentException 입력 검증 실패 또는 중복된 사용자명/이메일인 경우
     */
    @Transactional
    public User register(User user) {
        // 입력 검증
        validateUserForRegistration(user);
        
        // 중복 체크
        if (userMapper.findByUsername(user.getUsername()) != null) {
            throw new IllegalArgumentException("이미 사용 중인 사용자명입니다.");
        }
        
        if (userMapper.findByEmail(user.getEmail()) != null) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        
        // 비밀번호 해싱 (간단한 SHA-256 사용, 실제로는 BCrypt 권장)
        user.setPassword(hashPassword(user.getPassword()));
        
        userMapper.insertUser(user);
        log.info(">>> User 등록 성공: username={}, email={}, userId={}", 
                user.getUsername(), user.getEmail(), user.getUserId());
        return user;
    }

    /**
     * 로그인 처리
     * @param usernameOrEmail 사용자명 또는 이메일
     * @param password 비밀번호
     * @return User 객체 (비밀번호 제외)
     * @throws IllegalArgumentException 입력 검증 실패, 사용자를 찾을 수 없거나 비밀번호가 일치하지 않는 경우
     */
    public User login(String usernameOrEmail, String password) {
        // 입력 검증
        if (usernameOrEmail == null || usernameOrEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("사용자명 또는 이메일을 입력해주세요.");
        }
        
        if (password == null || password.isEmpty()) {
            throw new IllegalArgumentException("비밀번호를 입력해주세요.");
        }
        
        User user = userMapper.findByUsernameOrEmail(usernameOrEmail);
        
        if (user == null) {
            throw new IllegalArgumentException("사용자명 또는 비밀번호가 올바르지 않습니다.");
        }
        
        String hashedPassword = hashPassword(password);
        if (!user.getPassword().equals(hashedPassword)) {
            throw new IllegalArgumentException("사용자명 또는 비밀번호가 올바르지 않습니다.");
        }
        
        // 비밀번호 제거 후 반환
        user.setPassword(null);
        log.info(">>> User 로그인 성공: username={}, userId={}", user.getUsername(), user.getUserId());
        return user;
    }
    
    /**
     * 회원가입을 위한 사용자 정보 검증
     * @param user 검증할 User 객체
     * @throws IllegalArgumentException 검증 실패 시
     */
    private void validateUserForRegistration(User user) {
        // 기본 정보 검증
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("사용자명을 입력해주세요.");
        }
        
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("이메일을 입력해주세요.");
        }
        
        // 간단한 이메일 형식 검증
        if (!user.getEmail().contains("@")) {
            throw new IllegalArgumentException("올바른 이메일 형식이 아닙니다.");
        }
        
        if (user.getPassword() == null || user.getPassword().length() < 4) {
            throw new IllegalArgumentException("비밀번호는 최소 4자 이상이어야 합니다.");
        }
        
        if (user.getName() == null || user.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("이름을 입력해주세요.");
        }
        
        // 세무플랫폼 필수 정보 검증
        if (user.getResidentNumber() == null || user.getResidentNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("주민등록번호를 입력해주세요.");
        }
        
        if (user.getPhoneNumber() == null || user.getPhoneNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("휴대폰 번호를 입력해주세요.");
        }
        
        if (user.getUserType() == null || user.getUserType().trim().isEmpty()) {
            throw new IllegalArgumentException("유형을 선택해주세요.");
        }
        
        // 유형별 검증
        String userType = user.getUserType();
        if (!userType.equals("INDIVIDUAL") && !userType.equals("CORPORATE") && !userType.equals("NON_BUSINESS")) {
            throw new IllegalArgumentException("올바른 유형을 선택해주세요.");
        }
        
        // 개인사업자 또는 법인사업자인 경우 사업자등록번호 필수
        if (userType.equals("INDIVIDUAL") && (user.getBusinessNumber() == null || user.getBusinessNumber().trim().isEmpty())) {
            throw new IllegalArgumentException("개인사업자는 사업자등록번호를 입력해주세요.");
        }
        
        // 법인사업자인 경우 사업자등록번호와 법인등록번호 필수
        if (userType.equals("CORPORATE")) {
            if (user.getBusinessNumber() == null || user.getBusinessNumber().trim().isEmpty()) {
                throw new IllegalArgumentException("법인사업자는 사업자등록번호를 입력해주세요.");
            }
            if (user.getCorporateNumber() == null || user.getCorporateNumber().trim().isEmpty()) {
                throw new IllegalArgumentException("법인사업자는 법인등록번호를 입력해주세요.");
            }
        }
    }

    /**
     * 비밀번호 해싱 (SHA-256 사용)
     * 실제 프로덕션에서는 BCrypt 같은 더 안전한 방법 사용 권장
     */
    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            log.error(">>> 비밀번호 해싱 실패", e);
            throw new RuntimeException("비밀번호 해싱 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 사용자 프로필 정보 조회
     * @param userId 사용자 ID
     * @return User 객체 (비밀번호 제외)
     * @throws IllegalArgumentException 사용자를 찾을 수 없는 경우
     */
    public User getProfile(Long userId) {
        User user = userMapper.findById(userId);

        if (user == null) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }

        // 비밀번호 제거 후 반환
        user.setPassword(null);
        log.info(">>> 프로필 조회 성공: userId={}", userId);
        return user;
    }

    /**
     * 사용자 프로필 정보 수정
     * @param userId 사용자 ID
     * @param updateData 수정할 데이터 (name, email, phoneNumber, postalCode, address, addressDetail)
     * @return 수정된 User 객체
     * @throws IllegalArgumentException 입력 검증 실패 또는 사용자를 찾을 수 없는 경우
     */
    @Transactional
    public User updateProfile(Long userId, Map<String, String> updateData) {
        // 사용자 존재 확인
        User existingUser = userMapper.findById(userId);
        if (existingUser == null) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }

        // 입력 검증
        validateProfileUpdate(updateData);

        // 이메일 중복 체크 (변경하는 경우에만)
        String newEmail = updateData.get("email");
        if (newEmail != null && !newEmail.equals(existingUser.getEmail())) {
            User userWithEmail = userMapper.findByEmail(newEmail);
            if (userWithEmail != null && !userWithEmail.getUserId().equals(userId)) {
                throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
            }
        }

        // User 객체 생성 및 업데이트
        User updateUser = new User();
        updateUser.setUserId(userId);
        updateUser.setName(updateData.get("name"));
        updateUser.setEmail(updateData.get("email"));
        updateUser.setPhoneNumber(updateData.get("phoneNumber"));
        updateUser.setPostalCode(updateData.get("postalCode"));
        updateUser.setAddress(updateData.get("address"));
        updateUser.setAddressDetail(updateData.get("addressDetail"));

        int updatedRows = userMapper.updateProfile(updateUser);
        if (updatedRows == 0) {
            throw new IllegalArgumentException("프로필 업데이트에 실패했습니다.");
        }

        // 업데이트된 사용자 정보 조회
        User updatedUser = userMapper.findById(userId);
        updatedUser.setPassword(null); // 비밀번호 제거

        log.info(">>> 프로필 업데이트 성공: userId={}, updatedFields={}", userId, updateData.keySet());
        return updatedUser;
    }

    /**
     * 프로필 업데이트를 위한 입력 검증
     * @param updateData 검증할 데이터
     * @throws IllegalArgumentException 검증 실패 시
     */
    private void validateProfileUpdate(Map<String, String> updateData) {
        // 이름 검증
        String name = updateData.get("name");
        if (name != null && (name.trim().isEmpty() || name.length() > 50)) {
            throw new IllegalArgumentException("이름은 1자 이상 50자 이하로 입력해주세요.");
        }

        // 이메일 검증
        String email = updateData.get("email");
        if (email != null && (!email.contains("@") || email.length() > 100)) {
            throw new IllegalArgumentException("올바른 이메일 형식을 입력해주세요.");
        }

        // 휴대폰 번호 검증
        String phoneNumber = updateData.get("phoneNumber");
        if (phoneNumber != null && (phoneNumber.trim().isEmpty() || phoneNumber.length() > 20)) {
            throw new IllegalArgumentException("올바른 휴대폰 번호를 입력해주세요.");
        }

        // 우편번호 검증
        String postalCode = updateData.get("postalCode");
        if (postalCode != null && postalCode.length() > 10) {
            throw new IllegalArgumentException("올바른 우편번호를 입력해주세요.");
        }

        // 주소 검증
        String address = updateData.get("address");
        if (address != null && address.length() > 200) {
            throw new IllegalArgumentException("주소는 200자 이하로 입력해주세요.");
        }

        // 상세 주소 검증
        String addressDetail = updateData.get("addressDetail");
        if (addressDetail != null && addressDetail.length() > 100) {
            throw new IllegalArgumentException("상세 주소는 100자 이하로 입력해주세요.");
        }
    }

    /**
     * 사용자 비밀번호 변경
     * @param userId 사용자 ID
     * @param currentPassword 현재 비밀번호
     * @param newPassword 새 비밀번호
     * @throws IllegalArgumentException 입력 검증 실패 또는 사용자를 찾을 수 없는 경우
     */
    @Transactional
    public void updatePassword(Long userId, String currentPassword, String newPassword) {
        // 입력 검증
        if (currentPassword == null || currentPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("현재 비밀번호를 입력해주세요.");
        }

        if (newPassword == null || newPassword.length() < 4) {
            throw new IllegalArgumentException("새 비밀번호는 최소 4자 이상이어야 합니다.");
        }

        // 사용자 존재 확인
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }

        // 현재 비밀번호 확인
        String hashedCurrentPassword = hashPassword(currentPassword);
        if (!user.getPassword().equals(hashedCurrentPassword)) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        // 새 비밀번호 해싱 및 업데이트
        String hashedNewPassword = hashPassword(newPassword);
        user.setPassword(hashedNewPassword);

        int updatedRows = userMapper.updateProfile(user);
        if (updatedRows == 0) {
            throw new IllegalArgumentException("비밀번호 변경에 실패했습니다.");
        }

        log.info(">>> 비밀번호 변경 성공: userId={}", userId);
    }
}




