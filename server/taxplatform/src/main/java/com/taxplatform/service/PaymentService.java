package com.taxplatform.service;

import com.taxplatform.domain.User;
import com.taxplatform.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * 결제 관련 비즈니스 로직을 처리하는 서비스
 */
@Service
public class PaymentService {
    
    @Autowired
    private UserMapper userMapper;
    
    /**
     * 결제 처리 (목업)
     * @param userId 사용자 ID
     * @return 결제 처리 결과 메시지
     */
    public String processPayment(Long userId) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }
        
        // 결제 상태 업데이트
        user.setPaymentStatus("PAID");
        user.setLastPaymentDate(LocalDateTime.now());
        
        int result = userMapper.updatePaymentStatus(user);
        if (result > 0) {
            return "결제가 완료되었습니다.";
        } else {
            throw new RuntimeException("결제 처리에 실패했습니다.");
        }
    }
    
    /**
     * 결제 상태 확인 (1달 이내 결제 여부 체크)
     * @param userId 사용자 ID
     * @return 결제 상태 정보
     */
    public PaymentStatusInfo checkPaymentStatus(Long userId) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }
        
        PaymentStatusInfo info = new PaymentStatusInfo();
        info.setPaymentStatus(user.getPaymentStatus());
        info.setLastPaymentDate(user.getLastPaymentDate());
        
        // 1달 이내 결제 여부 체크
        if ("PAID".equals(user.getPaymentStatus()) && user.getLastPaymentDate() != null) {
            long daysSincePayment = ChronoUnit.DAYS.between(user.getLastPaymentDate(), LocalDateTime.now());
            info.setValid(daysSincePayment <= 30);
            info.setDaysRemaining(30 - (int) daysSincePayment);
            
            // 1달이 지났으면 결제 상태를 UNPAID로 변경
            if (daysSincePayment > 30) {
                user.setPaymentStatus("UNPAID");
                userMapper.updatePaymentStatus(user);
                info.setPaymentStatus("UNPAID");
            }
        } else {
            info.setValid(false);
            info.setDaysRemaining(0);
        }
        
        return info;
    }
    
    /**
     * 결제 상태 정보 클래스
     */
    public static class PaymentStatusInfo {
        private String paymentStatus;
        private LocalDateTime lastPaymentDate;
        private boolean valid;
        private int daysRemaining;
        
        public String getPaymentStatus() {
            return paymentStatus;
        }
        
        public void setPaymentStatus(String paymentStatus) {
            this.paymentStatus = paymentStatus;
        }
        
        public LocalDateTime getLastPaymentDate() {
            return lastPaymentDate;
        }
        
        public void setLastPaymentDate(LocalDateTime lastPaymentDate) {
            this.lastPaymentDate = lastPaymentDate;
        }
        
        public boolean isValid() {
            return valid;
        }
        
        public void setValid(boolean valid) {
            this.valid = valid;
        }
        
        public int getDaysRemaining() {
            return daysRemaining;
        }
        
        public void setDaysRemaining(int daysRemaining) {
            this.daysRemaining = daysRemaining;
        }
    }
}

