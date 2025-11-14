package com.taxplatform.domain;

import java.time.LocalDateTime;

/**
 * User 테이블 엔티티 클래스
 */
public class User {
    private Long userId;
    private String username;
    private String email;
    private String password;
    private String name;
    
    // 세무플랫폼 추가 필드
    private String residentNumber;      // 주민등록번호 (암호화 저장)
    private String phoneNumber;         // 휴대폰 번호
    private String postalCode;          // 우편번호
    private String address;             // 기본주소
    private String addressDetail;       // 상세주소
    private String userType;            // 유형: INDIVIDUAL(개인사업자), CORPORATE(법인사업자), NON_BUSINESS(비사업자)
    private String businessNumber;      // 사업자등록번호 (선택)
    private String corporateNumber;     // 법인등록번호 (선택)
    
    // 역할 및 결제/수임 동의 관련 필드
    private String role;                // 역할: CLIENT(회원), TAX_ACCOUNTANT(세무사)
    private String paymentStatus;       // 결제상태: UNPAID(미결제), PAID(결제완료)
    private LocalDateTime lastPaymentDate;  // 마지막 결제일 (1달 단위 체크용)
    private String mandateStatus;       // 수임동의상태: NONE(없음), REQUESTED(신청됨), SENT(세무사가 홈택스 요청 보냄), COMPLETED(완료)
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public User() {
    }

    public User(String username, String email, String password, String name) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.name = name;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getResidentNumber() {
        return residentNumber;
    }

    public void setResidentNumber(String residentNumber) {
        this.residentNumber = residentNumber;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getAddressDetail() {
        return addressDetail;
    }

    public void setAddressDetail(String addressDetail) {
        this.addressDetail = addressDetail;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }

    public String getBusinessNumber() {
        return businessNumber;
    }

    public void setBusinessNumber(String businessNumber) {
        this.businessNumber = businessNumber;
    }

    public String getCorporateNumber() {
        return corporateNumber;
    }

    public void setCorporateNumber(String corporateNumber) {
        this.corporateNumber = corporateNumber;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

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

    public String getMandateStatus() {
        return mandateStatus;
    }

    public void setMandateStatus(String mandateStatus) {
        this.mandateStatus = mandateStatus;
    }

    @Override
    public String toString() {
        return "User{" +
                "userId=" + userId +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", name='" + name + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", userType='" + userType + '\'' +
                ", role='" + role + '\'' +
                ", paymentStatus='" + paymentStatus + '\'' +
                ", mandateStatus='" + mandateStatus + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}




