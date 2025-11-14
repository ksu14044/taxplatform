# TaxPlatform

세무 플랫폼을 위한 풀스택 웹 애플리케이션입니다.

## 프로젝트 구조

```
TaxPlatform/
├── client/                 # 프론트엔드 (React + Vite)
│   ├── src/
│   │   ├── api/           # API 통신 로직
│   │   ├── components/    # React 컴포넌트
│   │   └── styles/        # CSS 스타일
│   └── README.md          # 프론트엔드 가이드
│
├── server/                 # 백엔드 (Spring Boot)
│   └── taxplatform/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/  # Java 소스 코드
│       │   │   └── resources/  # 설정 파일
│       │   └── test/      # 테스트 코드
│       └── README.md      # 백엔드 가이드
│
└── DEPLOYMENT.md          # 배포 가이드
```

## 기술 스택

### 프론트엔드
- **React 19.2.0** - UI 라이브러리
- **Vite 7.2.2** - 빌드 도구
- **TailwindCSS 4.1.17** - CSS 프레임워크
- **React Query 5.90.8** - 서버 상태 관리

### 백엔드
- **Java 17** - 프로그래밍 언어
- **Spring Boot 3.x** - 백엔드 프레임워크
- **MyBatis** - SQL 매핑 프레임워크
- **MySQL 8.0** - 데이터베이스

## 빠른 시작

### 사전 요구사항

- **Node.js** 16.0 이상
- **Java** 17 이상
- **MySQL** 8.0 이상
- **Maven** 3.6 이상 (또는 Maven Wrapper 사용)

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd TaxPlatform
```

### 2. 데이터베이스 설정

```bash
# MySQL 접속
mysql -u root -p

# 데이터베이스 생성
CREATE DATABASE test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE test;

# 테이블 생성
source server/taxplatform/src/main/resources/sql/create_users_table.sql;
```

### 3. 백엔드 실행

```bash
cd server/taxplatform

# 의존성 설치 및 실행
./mvnw spring-boot:run
```

백엔드 서버: `http://localhost:8080`

### 4. 프론트엔드 실행

새 터미널을 열고:

```bash
cd client

# 환경 변수 파일 생성
# .env.development 파일을 생성하고 다음 내용 추가:
# VITE_API_BASE_URL=http://localhost:8080/api

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

프론트엔드 서버: `http://localhost:5173`

## 환경 설정

### 프론트엔드 환경 변수

프로젝트 루트(`client/`)에 환경 변수 파일 생성:

**개발 환경** (`.env.development`):
```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

**배포 환경** (`.env.production`):
```bash
VITE_API_BASE_URL=https://yourdomain.cafe24.com/api
```

### 백엔드 환경 설정

개발 환경은 기본 설정(`application-dev.yaml`)을 사용합니다.

배포 환경을 위해 `server/taxplatform/src/main/resources/application-prod.yaml` 생성:

```bash
cd server/taxplatform/src/main/resources
cp application-prod.yaml.example application-prod.yaml
```

그리고 실제 DB 정보로 수정합니다.

## 주요 기능

- ✅ 사용자 인증 (회원가입/로그인)
- ✅ 백엔드 통신 테스트 (핑퐁)
- ✅ 반응형 웹 디자인
- ✅ 환경별 설정 분리 (개발/배포)
- ✅ Glassmorphism UI 디자인

## 개발 규칙

1. ✅ **타입스크립트는 사용하지 않습니다** (JavaScript만 사용)
2. ✅ **스타일은 별도의 파일로 분리**하여 컴포넌트에 적용합니다
3. ✅ **반응형 웹 디자인**으로 구현합니다
4. ✅ **UI/UX는 사용자 친화적**이게 구성하고, 깔끔한 레이아웃과 최신 트렌드를 반영합니다
5. ✅ **TailwindCSS 라이브러리**를 사용합니다
6. ✅ **로컬 환경과 배포 환경을 철저히 구분**합니다

## API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인

### 테스트
- `GET /api/click?count={count}` - 핑퐁 테스트
- `GET /api/health` - 헬스 체크

## 배포

카페24 호스팅 환경으로 배포하는 방법은 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.

### 배포 요약

**프론트엔드:**
```bash
cd client
npm run build
# dist/ 폴더를 카페24 FTP로 업로드
```

**백엔드:**
```bash
cd server/taxplatform
./mvnw clean package -DskipTests
# target/*.jar 파일을 서버에 배포
java -jar taxplatform-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## 문서

- [프론트엔드 README](./client/README.md)
- [백엔드 README](./server/taxplatform/README.md)
- [배포 가이드](./DEPLOYMENT.md)

## 프로젝트 상태

현재 프로젝트는 다음 기능들이 구현되어 있습니다:

- ✅ 기본 인증 시스템 (회원가입/로그인)
- ✅ 사용자 관리
- ✅ 백엔드 통신 테스트
- ✅ 환경별 설정 분리
- ✅ 반응형 UI 디자인
- ✅ CORS 설정
- ✅ 데이터베이스 연동

## 문제 해결

### 일반적인 문제

**1. 백엔드 연결 오류**
- 백엔드 서버가 실행 중인지 확인
- 환경 변수 설정 확인
- CORS 설정 확인

**2. 데이터베이스 연결 오류**
- MySQL 서버 실행 확인
- DB 접속 정보 확인
- 데이터베이스 및 테이블 생성 확인

**3. 프론트엔드 빌드 오류**
- Node.js 버전 확인 (16.0 이상)
- `node_modules` 삭제 후 재설치: `rm -rf node_modules && npm install`

자세한 문제 해결 방법은 각 폴더의 README를 참고하세요.

## 개발 팀

이 프로젝트는 세무 플랫폼 개발을 위해 제작되었습니다.

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

---

더 자세한 정보는 각 폴더의 README 파일을 참고하세요:
- [프론트엔드 가이드](./client/README.md)
- [백엔드 가이드](./server/taxplatform/README.md)
- [배포 가이드](./DEPLOYMENT.md)

