package com.taxplatform.mapper;

import com.taxplatform.domain.User;
import org.apache.ibatis.annotations.Mapper;

/**
 * User 테이블 MyBatis Mapper 인터페이스
 */
@Mapper
public interface UserMapper {
    
    /**
     * 사용자 정보를 데이터베이스에 저장
     * @param user User 객체
     * @return 저장된 행의 수
     */
    int insertUser(User user);
    
    /**
     * 사용자명으로 사용자 조회
     * @param username 사용자명
     * @return User 객체
     */
    User findByUsername(String username);
    
    /**
     * 이메일로 사용자 조회
     * @param email 이메일
     * @return User 객체
     */
    User findByEmail(String email);
    
    /**
     * 사용자명 또는 이메일로 사용자 조회 (로그인용)
     * @param usernameOrEmail 사용자명 또는 이메일
     * @return User 객체
     */
    User findByUsernameOrEmail(String usernameOrEmail);
    
    /**
     * 사용자 ID로 사용자 조회
     * @param userId 사용자 ID
     * @return User 객체
     */
    User findById(Long userId);
    
    /**
     * 결제 상태 업데이트
     * @param user User 객체 (userId, paymentStatus, lastPaymentDate 필요)
     * @return 업데이트된 행의 수
     */
    int updatePaymentStatus(User user);
    
    /**
     * 수임 동의 상태 업데이트
     * @param user User 객체 (userId, mandateStatus 필요)
     * @return 업데이트된 행의 수
     */
    int updateMandateStatus(User user);
    
    /**
     * 모든 세무사 목록 조회
     * @return 세무사 User 객체 리스트
     */
    java.util.List<User> findAllTaxAccountants();
    
    /**
     * 수임 동의 신청한 모든 회원 조회 (REQUESTED, SENT, COMPLETED 상태)
     * @return 수임 동의 신청 회원 리스트
     */
    java.util.List<User> findAllMandateRequests();
}




