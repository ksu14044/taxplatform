package com.taxplatform.mapper;

import com.taxplatform.domain.Test;
import org.apache.ibatis.annotations.Mapper;

/**
 * Test 테이블 MyBatis Mapper 인터페이스
 */
@Mapper
public interface TestMapper {
    
    /**
     * test_count를 test 테이블에 저장
     * @param test Test 객체 (testCount 포함)
     * @return 저장된 행의 수
     */
    int insertTest(Test test);
}






