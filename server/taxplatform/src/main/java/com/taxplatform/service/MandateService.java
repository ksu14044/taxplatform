package com.taxplatform.service;

import com.taxplatform.domain.User;
import com.taxplatform.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 수임 동의 관련 비즈니스 로직을 처리하는 서비스
 */
@Service
public class MandateService {
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * 회원이 수임 동의 신청
     * @param userId 회원 사용자 ID
     * @return 처리 결과 메시지
     */
    public String requestMandate(Long userId) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }
        
        // 수임 동의 상태 업데이트
        user.setMandateStatus("REQUESTED");
        int result = userMapper.updateMandateStatus(user);
        
        if (result > 0) {
            // 모든 세무사에게 알람 전송
            List<User> taxAccountants = userMapper.findAllTaxAccountants();
            for (User taxAccountant : taxAccountants) {
                String message = user.getName() + "님이 수임 동의를 신청했습니다.";
                notificationService.createNotification(taxAccountant.getUserId(), userId, "CLIENT_TO_TAX", message);
            }
            return "수임 동의 신청이 완료되었습니다.";
        } else {
            throw new RuntimeException("수임 동의 신청에 실패했습니다.");
        }
    }
    
    /**
     * 세무사가 홈택스 처리 후 회원에게 알람 전송
     * @param taxAccountantId 세무사 사용자 ID
     * @param clientId 회원 사용자 ID
     * @return 처리 결과 메시지
     */
    public String sendMandateRequest(Long taxAccountantId, Long clientId) {
        User taxAccountant = userMapper.findById(taxAccountantId);
        User client = userMapper.findById(clientId);

        if (taxAccountant == null || client == null) {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }

        if (!"TAX_ACCOUNTANT".equals(taxAccountant.getRole())) {
            throw new RuntimeException("세무사만 수임 동의 요청을 보낼 수 있습니다.");
        }

        // 수임 동의 상태 업데이트
        client.setMandateStatus("SENT");
        int result = userMapper.updateMandateStatus(client);

        if (result > 0) {
            // 회원에게 알람 전송
            String message = "세무사가 수임 동의 요청을 보냈습니다. 홈택스에서 수임 동의 요청을 수락해주세요.";
            notificationService.createNotification(clientId, taxAccountantId, "TAX_TO_CLIENT", message);
            return "수임 동의 요청이 전송되었습니다.";
        } else {
            throw new RuntimeException("수임 동의 요청 전송에 실패했습니다.");
        }
    }

    /**
     * 세무사가 회원에게 수임 해제 요청 전송
     * @param taxAccountantId 세무사 사용자 ID
     * @param clientId 회원 사용자 ID
     * @return 처리 결과 메시지
     */
    public String sendMandateReleaseRequest(Long taxAccountantId, Long clientId) {
        User taxAccountant = userMapper.findById(taxAccountantId);
        User client = userMapper.findById(clientId);

        if (taxAccountant == null || client == null) {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }

        if (!"TAX_ACCOUNTANT".equals(taxAccountant.getRole())) {
            throw new RuntimeException("세무사만 수임 해제 요청을 보낼 수 있습니다.");
        }

        // 수임 동의 상태를 NONE으로 리셋
        client.setMandateStatus("NONE");
        int result = userMapper.updateMandateStatus(client);

        if (result > 0) {
            // 회원에게 수임 해제 요청 알람 전송
            String message = "세무사가 기존 세무사와의 수임 관계 해제를 요청했습니다. 홈택스에서 기존 세무사와의 수임 관계를 해제한 후 다시 수임 동의 신청을 진행해주세요.";
            notificationService.createNotification(clientId, taxAccountantId, "TAX_TO_CLIENT", message);

            return "수임 해제 요청이 전송되었습니다.";
        } else {
            throw new RuntimeException("수임 해제 요청 처리에 실패했습니다.");
        }
    }
    
    /**
     * 회원이 홈택스에서 수임 동의 수락 완료
     * @param userId 회원 사용자 ID
     * @return 처리 결과 메시지
     */
    public String completeMandate(Long userId) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }
        
        // 수임 동의 상태 업데이트
        user.setMandateStatus("COMPLETED");
        int result = userMapper.updateMandateStatus(user);
        
        if (result > 0) {
            return "수임 동의가 완료되었습니다.";
        } else {
            throw new RuntimeException("수임 동의 완료 처리에 실패했습니다.");
        }
    }
    
    /**
     * 모든 수임 동의 내역 조회 (세무사용)
     * @return 수임 동의 신청한 모든 회원 리스트
     */
    public List<User> getAllMandateRequests() {
        // REQUESTED, SENT, COMPLETED 상태인 모든 회원 조회
        return userMapper.findAllMandateRequests();
    }
}

