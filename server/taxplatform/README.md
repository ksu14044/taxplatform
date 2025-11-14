# TaxPlatform - 백엔드

Spring Boot 기반의 TaxPlatform 서버 애플리케이션입니다.

## 기술 스택

- **Java 17**
- **Spring Boot 3.x**
- **MyBatis** - SQL 매핑 프레임워크
- **MySQL 8.0** - 데이터베이스
- **Maven** - 빌드 도구

## 프로젝트 구조

```
taxplatform/
├── src/
│   ├── main/
│   │   ├── java/com/taxplatform/
│   │   │   ├── config/          # 설정 클래스
│   │   │   │   └── WebConfig.java  # CORS 설정
│   │   │   ├── controller/      # REST 컨트롤러
│   │   │   │   ├── AuthController.java
│   │   │   │   └── ClickController.java
│   │   │   ├── domain/          # 도메인 모델
│   │   │   │   ├── User.java
│   │   │   │   └── Test.java
│   │   │   ├── dto/             # 데이터 전송 객체
│   │   │   │   └── ApiResponse.java
│   │   │   ├── exception/       # 예외 처리
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   ├── mapper/          # MyBatis 매퍼 인터페이스
│   │   │   │   ├── UserMapper.java
│   │   │   │   └── TestMapper.java
│   │   │   ├── service/         # 비즈니스 로직
│   │   │   │   ├── UserService.java
│   │   │   │   └── TestService.java
│   │   │   └── TaxPlatformApplication.java
│   │   └── resources/
│   │       ├── application.yaml          # 공통 설정
│   │       ├── application-dev.yaml      # 개발 환경 설정
│   │       ├── application-prod.yaml     # 배포 환경 설정 (Git 미포함)
│   │       ├── application-prod.yaml.example  # 배포 설정 템플릿
│   │       ├── mapper/           # MyBatis XML 매퍼
│   │       │   ├── UserMapper.xml
│   │       │   └── TestMapper.xml
│   │       └── sql/              # SQL 스크립트
│   │           └── create_users_table.sql
│   └── test/                    # 테스트 코드
└── pom.xml                      # Maven 설정
```

## 환경 설정

### 1. 개발 환경 설정

기본적으로 `dev` 프로파일이 활성화되어 있습니다. (`application.yaml` 참조)

`application-dev.yaml`에는 로컬 MySQL 설정이 포함되어 있습니다:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/test?serverTimezone=Asia/Seoul&characterEncoding=UTF-8
    username: root
    password: 1q2w3e4r!
```

필요에 따라 로컬 DB 정보를 수정하세요.

### 2. 배포 환경 설정

배포 환경을 위해 `application-prod.yaml` 파일을 생성하세요:

```bash
cd src/main/resources
cp application-prod.yaml.example application-prod.yaml
```

그리고 실제 DB 정보로 수정:

```yaml
spring:
  datasource:
    url: jdbc:mysql://YOUR_DB_HOST:3306/YOUR_DB_NAME?serverTimezone=Asia/Seoul&characterEncoding=UTF-8
    username: YOUR_DB_USERNAME
    password: YOUR_DB_PASSWORD
```

**중요:** `application-prod.yaml`은 `.gitignore`에 포함되어 Git에 커밋되지 않습니다!

### 3. 데이터베이스 설정

#### MySQL 설치 및 실행

```bash
# MySQL 실행 (로컬)
mysql -u root -p
```

#### 데이터베이스 생성

```sql
CREATE DATABASE test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE test;
```

#### 테이블 생성

프로젝트에 포함된 SQL 스크립트 실행:

```bash
mysql -u root -p test < src/main/resources/sql/create_users_table.sql
```

또는 직접 SQL 실행:

```sql
-- Users 테이블
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Test 테이블
CREATE TABLE test (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    count INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 로컬 실행

### 1. 의존성 설치 및 빌드

```bash
# Maven Wrapper 사용 (권장)
./mvnw clean install

# 또는 Maven이 설치되어 있다면
mvn clean install
```

### 2. 애플리케이션 실행

#### 개발 환경으로 실행 (기본)
```bash
./mvnw spring-boot:run
```

#### 특정 프로파일로 실행
```bash
# 개발 환경
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# 배포 환경
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod
```

#### JAR 파일로 실행
```bash
# 빌드
./mvnw clean package -DskipTests

# 실행
java -jar target/taxplatform-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev
```

### 3. 서버 접속 확인

브라우저에서 `http://localhost:8080` 접속

## API 엔드포인트

### 인증 (Auth)

#### 회원가입
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "name": "테스트 사용자"
}
```

#### 로그인
```
POST /api/auth/login
Content-Type: application/json

{
  "usernameOrEmail": "testuser",
  "password": "password123"
}
```

### 테스트 (Click)

#### 핑퐁 테스트
```
GET /api/click?count=1
```

#### 헬스 체크
```
GET /api/health
```

## 배포

### JAR 파일 빌드

```bash
# 테스트 제외하고 빌드
./mvnw clean package -DskipTests

# 테스트 포함하여 빌드
./mvnw clean package
```

빌드 완료 후 `target/` 폴더에 JAR 파일이 생성됩니다.

### 배포 환경 실행

```bash
java -jar target/taxplatform-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

자세한 배포 가이드는 [DEPLOYMENT.md](../../../DEPLOYMENT.md)를 참고하세요.

## 환경별 CORS 설정

CORS 설정은 환경별로 자동 적용됩니다:

### 개발 환경 (`application-dev.yaml`)
```yaml
cors:
  allowed-origins: http://localhost:5173,http://localhost:3000
  allowed-methods: GET,POST,PUT,DELETE,OPTIONS
  allowed-headers: "*"
  allow-credentials: true
```

### 배포 환경 (`application-prod.yaml`)
```yaml
cors:
  allowed-origins: https://yourdomain.cafe24.com
  allowed-methods: GET,POST,PUT,DELETE,OPTIONS
  allowed-headers: "*"
  allow-credentials: true
```

## 개발 팁

### 로그 확인

개발 환경에서는 SQL 쿼리가 콘솔에 출력됩니다:

```yaml
mybatis:
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
```

### 핫 리로드 (Spring DevTools)

`pom.xml`에 Spring DevTools 추가 시 자동 재시작 지원

### API 테스트

Postman, Insomnia 또는 curl을 사용하여 API 테스트:

```bash
# 회원가입
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"1234","name":"테스트"}'

# 로그인
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"test","password":"1234"}'
```

## 문제 해결

### 데이터베이스 연결 오류
- MySQL이 실행 중인지 확인: `systemctl status mysql`
- DB 접속 정보가 올바른지 확인
- 방화벽 설정 확인

### 포트 충돌
- 8080 포트가 이미 사용 중인 경우:
  ```yaml
  server:
    port: 8081
  ```

### MyBatis 매퍼 오류
- XML 파일 경로 확인: `src/main/resources/mapper/*.xml`
- 네임스페이스와 인터페이스 경로 일치 확인

## 테스트

```bash
# 전체 테스트 실행
./mvnw test

# 특정 테스트 클래스 실행
./mvnw test -Dtest=UserServiceTest
```

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

