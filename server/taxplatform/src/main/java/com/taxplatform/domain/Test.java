package com.taxplatform.domain;

/**
 * Test 테이블 엔티티 클래스
 */
public class Test {
    private Integer testId;
    private Integer testCount;

    public Test() {
    }

    public Test(Integer testCount) {
        this.testCount = testCount;
    }

    public Integer getTestId() {
        return testId;
    }

    public void setTestId(Integer testId) {
        this.testId = testId;
    }

    public Integer getTestCount() {
        return testCount;
    }

    public void setTestCount(Integer testCount) {
        this.testCount = testCount;
    }

    @Override
    public String toString() {
        return "Test{" +
                "testId=" + testId +
                ", testCount=" + testCount +
                '}';
    }
}






