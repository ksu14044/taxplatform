# TaxPlatform - 프론트엔드

React + Vite 기반의 TaxPlatform 클라이언트 애플리케이션입니다.

## 기술 스택

- **React 19.2.0** - UI 라이브러리
- **Vite 7.2.2** - 빌드 도구
- **TailwindCSS 4.1.17** - CSS 프레임워크
- **React Query 5.90.8** - 서버 상태 관리

## 프로젝트 구조

```
client/
├── src/
│   ├── api/              # API 통신 로직
│   │   ├── authApi.js    # 인증 API
│   │   └── pingPongApi.js # 테스트 API
│   ├── components/       # React 컴포넌트
│   │   ├── Auth.jsx      # 로그인/회원가입
│   │   └── PingPongPage.jsx # 테스트 페이지
│   ├── styles/           # 스타일 파일
│   │   └── components/   # 컴포넌트별 CSS
│   ├── App.jsx           # 메인 App 컴포넌트
│   └── main.jsx          # 엔트리 포인트
└── public/               # 정적 파일
```

## 환경 설정

### 1. 환경 변수 파일 생성

프로젝트 루트에 환경별 `.env` 파일을 생성하세요:

#### 개발 환경 (`.env.development`)
```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

#### 배포 환경 (`.env.production`)
```bash
VITE_API_BASE_URL=https://yourdomain.cafe24.com/api
```

**중요:** 배포 시 실제 도메인으로 변경하세요!

### 2. 의존성 설치

```bash
npm install
```

## 로컬 실행

### 개발 서버 실행
```bash
npm run dev
```
- 브라우저에서 `http://localhost:5173` 접속
- 핫 리로드 지원

### 빌드
```bash
npm run build
```
- 빌드 결과물은 `dist/` 폴더에 생성됩니다

### 프리뷰
```bash
npm run preview
```
- 빌드된 결과물을 로컬에서 미리 확인

## 배포

### 카페24 호스팅 배포 방법

1. **빌드 실행**
   ```bash
   npm run build
   ```

2. **환경 변수 확인**
   - `.env.production` 파일에 실제 API URL이 설정되어 있는지 확인

3. **FTP 업로드**
   - `dist/` 폴더 내의 모든 파일을 카페24 호스팅 웹 루트 디렉토리에 업로드
   - 일반적으로 `/www` 또는 `/public_html` 디렉토리

4. **URL 접근**
   - 배포된 도메인으로 접속하여 확인

자세한 배포 가이드는 [DEPLOYMENT.md](../DEPLOYMENT.md)를 참고하세요.

## 개발 규칙

1. ✅ 타입스크립트는 사용하지 않습니다 (JavaScript만 사용)
2. ✅ 스타일은 별도의 CSS 파일로 분리하여 관리합니다
3. ✅ 반응형 웹 디자인을 적용합니다
4. ✅ TailwindCSS를 활용하여 UI를 구성합니다
5. ✅ 로컬 환경과 배포 환경을 철저히 구분합니다

## 문제 해결

### 백엔드 연결 오류
- 백엔드 서버가 실행 중인지 확인하세요
- `.env` 파일의 `VITE_API_BASE_URL`이 올바른지 확인하세요
- 브라우저 개발자 도구의 네트워크 탭에서 요청을 확인하세요

### 빌드 오류
- `node_modules` 폴더를 삭제하고 `npm install` 재실행
- Node.js 버전이 16.0 이상인지 확인하세요

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
