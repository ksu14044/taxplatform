package com.taxplatform.service;

import com.taxplatform.domain.Test;
import com.taxplatform.mapper.TestMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Test 관련 비즈니스 로직을 처리하는 Service 클래스
 */
@Service
public class TestService {

    private static final Logger log = LoggerFactory.getLogger(TestService.class);

    private final TestMapper testMapper;

    public TestService(TestMapper testMapper) {
        this.testMapper = testMapper;
    }

    /**
     * 핑퐁 카운트를 데이터베이스에 저장
     * @param count 저장할 카운트 값
     * @return 저장된 Test 객체 (testId 포함)
     * @throws IllegalArgumentException count가 유효하지 않은 경우
     * @throws RuntimeException DB 저장 실패 시
     */
    @Transactional
    public Test saveClickCount(int count) {
        // 입력 검증
        if (count < 0) {
            throw new IllegalArgumentException("카운트는 0 이상이어야 합니다.");
        }
        
        Test test = new Test(count);
        int result = testMapper.insertTest(test);
        
        if (result == 0) {
            log.error(">>> Test 저장 실패: count={}, result=0", count);
            throw new RuntimeException("데이터베이스에 저장하지 못했습니다.");
        }
        
        log.info(">>> Test 저장 성공: count={}, testId={}", count, test.getTestId());
        return test;
    }
}

