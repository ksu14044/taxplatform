# TaxPlatform 배포 가이드

카페24 호스팅 환경을 기준으로 작성된 배포 가이드입니다.

## 목차
1. [배포 환경 요구사항](#배포-환경-요구사항)
2. [프론트엔드 배포](#프론트엔드-배포)
3. [백엔드 배포](#백엔드-배포)
4. [데이터베이스 설정](#데이터베이스-설정)
5. [배포 후 확인사항](#배포-후-확인사항)

---

## 배포 환경 요구사항

### 프론트엔드
- 정적 파일 호스팅 지원
- HTTPS 지원 (권장)

### 백엔드
- Java 17 이상
- Spring Boot 실행 환경
- MySQL 8.0 이상

---

## 프론트엔드 배포

### 1. 환경 변수 설정

프로젝트 루트(`client/`)에 `.env.production` 파일 생성:

```bash
VITE_API_BASE_URL=https://yourdomain.cafe24.com/api
```

**중요:** `yourdomain.cafe24.com`을 실제 백엔드 도메인으로 변경하세요!

### 2. 빌드

```bash
cd client
npm install
npm run build
```

빌드 완료 후 `dist/` 폴더가 생성됩니다.

### 3. 카페24 호스팅 업로드

#### FTP 접속 정보 확인
1. 카페24 호스팅 관리 페이지 접속
2. FTP 계정 정보 확인 (호스트, 아이디, 비밀번호)

#### 파일 업로드
1. FileZilla 또는 다른 FTP 클라이언트 사용
2. `dist/` 폴더 내의 **모든 파일** 업로드
3. 업로드 경로: `/www` 또는 `/public_html`

#### 파일 구조 예시
```
/www/
├── index.html
├── assets/
│   ├── index-xxxxx.js
│   └── index-xxxxx.css
└── vite.svg
```

### 4. 도메인 연결 확인

브라우저에서 도메인 접속하여 정상 작동 확인

---

## 백엔드 배포

### 1. 환경 설정 파일 생성

`server/taxplatform/src/main/resources/application-prod.yaml` 파일 생성:

```yaml
spring:
  datasource:
    url: jdbc:mysql://카페24DB호스트:3306/데이터베이스명?serverTimezone=Asia/Seoul&characterEncoding=UTF-8
    username: DB사용자명
    password: DB비밀번호
    driver-class-name: com.mysql.cj.jdbc.Driver
    
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000

mybatis:
  configuration:
    log-impl: org.apache.ibatis.logging.slf4j.Slf4jImpl

cors:
  allowed-origins: https://yourdomain.cafe24.com
  allowed-methods: GET,POST,PUT,DELETE,OPTIONS
  allowed-headers: "*"
  allow-credentials: true

logging:
  level:
    com.taxplatform: INFO
    org.springframework: WARN
    org.hibernate: WARN
```

**중요:** 실제 DB 정보와 도메인으로 변경하세요!

### 2. JAR 파일 빌드

```bash
cd server/taxplatform
mvnw clean package -DskipTests
```

또는 Maven이 설치되어 있다면:

```bash
mvn clean package -DskipTests
```

빌드 완료 후 `target/` 폴더에 `.jar` 파일 생성

### 3. 카페24 서버 배포

#### SSH 접속
```bash
ssh 사용자명@호스트주소
```

#### JAR 파일 업로드
FTP 또는 SCP를 사용하여 JAR 파일 업로드:

```bash
scp target/taxplatform-0.0.1-SNAPSHOT.jar 사용자명@호스트:/home/사용자명/app/
```

#### 실행 스크립트 생성

`start.sh` 파일 생성:

```bash
#!/bin/bash
nohup java -jar taxplatform-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod \
  > app.log 2>&1 &

echo $! > app.pid
echo "Application started with PID: $(cat app.pid)"
```

`stop.sh` 파일 생성:

```bash
#!/bin/bash
if [ -f app.pid ]; then
    PID=$(cat app.pid)
    kill $PID
    rm app.pid
    echo "Application stopped (PID: $PID)"
else
    echo "PID file not found"
fi
```

실행 권한 부여:

```bash
chmod +x start.sh stop.sh
```

#### 애플리케이션 실행

```bash
./start.sh
```

#### 로그 확인

```bash
tail -f app.log
```

---

## 데이터베이스 설정

### 1. 카페24 MySQL 데이터베이스 생성

1. 카페24 호스팅 관리 페이지 접속
2. DB 관리 메뉴에서 MySQL 데이터베이스 생성
3. DB 접속 정보 확인 (호스트, 포트, DB명, 사용자명, 비밀번호)

### 2. 테이블 생성

MySQL 클라이언트 또는 phpMyAdmin 접속:

```bash
mysql -h 호스트 -u 사용자명 -p 데이터베이스명
```

테이블 생성 SQL 실행:

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

또는 프로젝트의 SQL 파일 사용:
```bash
mysql -h 호스트 -u 사용자명 -p 데이터베이스명 < server/taxplatform/src/main/resources/sql/create_users_table.sql
```

### 3. DB 연결 테스트

애플리케이션 실행 후 로그에서 DB 연결 성공 메시지 확인:

```bash
tail -f app.log | grep -i "mysql\|database\|hikari"
```

---

## 배포 후 확인사항

### 1. 프론트엔드 체크리스트

- [ ] 웹사이트가 도메인으로 정상 접속되는가?
- [ ] 모든 페이지가 정상적으로 로드되는가?
- [ ] 이미지 및 CSS가 정상적으로 로드되는가?
- [ ] HTTPS가 적용되어 있는가? (권장)

### 2. 백엔드 체크리스트

- [ ] 애플리케이션이 정상적으로 실행되는가?
- [ ] 로그에 에러가 없는가?
- [ ] API 엔드포인트가 정상적으로 응답하는가?
- [ ] 데이터베이스 연결이 정상인가?

### 3. 통합 테스트

- [ ] 프론트엔드에서 로그인이 정상적으로 되는가?
- [ ] 회원가입이 정상적으로 되는가?
- [ ] 데이터가 DB에 정상적으로 저장되는가?
- [ ] CORS 설정이 올바르게 작동하는가?

### 4. API 테스트 (curl 사용)

#### Health Check
```bash
curl https://yourdomain.cafe24.com/api/health
```

#### 회원가입
```bash
curl -X POST https://yourdomain.cafe24.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass",
    "name": "테스트"
  }'
```

#### 로그인
```bash
curl -X POST https://yourdomain.cafe24.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "testuser",
    "password": "testpass"
  }'
```

---

## 문제 해결

### CORS 오류
- `application-prod.yaml`의 `cors.allowed-origins`가 프론트엔드 도메인과 일치하는지 확인
- 프로토콜(http/https)까지 정확히 일치해야 함

### 데이터베이스 연결 오류
- DB 호스트, 포트, 사용자명, 비밀번호 확인
- 방화벽 설정 확인 (카페24 고객센터 문의)

### 애플리케이션 실행 오류
- Java 버전 확인: `java -version`
- 로그 파일 확인: `tail -f app.log`
- 포트 중복 확인: `netstat -tulpn | grep 8080`

### 프론트엔드 라우팅 404 오류
카페24 서버 설정에서 모든 요청을 `index.html`로 리다이렉트하도록 설정:

`.htaccess` 파일 생성:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 유지보수

### 애플리케이션 재시작
```bash
./stop.sh
./start.sh
```

### 로그 모니터링
```bash
tail -f app.log
```

### 디스크 용량 확인
```bash
df -h
```

### 로그 정리 (오래된 로그 삭제)
```bash
# 7일 이상 된 로그 압축
find . -name "*.log" -mtime +7 -exec gzip {} \;

# 30일 이상 된 압축 로그 삭제
find . -name "*.log.gz" -mtime +30 -delete
```

---

## 보안 권장사항

1. **환경 변수 파일 보안**
   - `application-prod.yaml`을 Git에 커밋하지 마세요
   - 서버에서 파일 권한 설정: `chmod 600 application-prod.yaml`

2. **비밀번호 관리**
   - DB 비밀번호는 강력한 비밀번호 사용
   - 정기적으로 비밀번호 변경

3. **HTTPS 사용**
   - 카페24에서 SSL 인증서 설정
   - HTTP에서 HTTPS로 자동 리다이렉트 설정

4. **방화벽 설정**
   - 필요한 포트만 개방 (80, 443, 8080)
   - SSH 접근 제한 설정

---

## 추가 지원

문제가 발생하면 다음을 확인하세요:
1. 로그 파일 (`app.log`)
2. 카페24 호스팅 관리 페이지
3. 카페24 고객센터 (1544-4088)

배포 과정에서 문제가 발생하면 개발팀에 문의하세요.

