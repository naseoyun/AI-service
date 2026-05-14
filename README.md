# Job팜 (Job Farm) 🌾

> AI 기반 구직자·재직자 통합 커리어 플랫폼

**배포 URL**: https://ai-service-beta-eight.vercel.app/

---

## 주요 기능

### 구직자
- **자소서 분석** — 블로그/포트폴리오 URL 또는 AI 대화를 통해 자기소개서 자동 생성 및 수정
- **기업 분석** — DART 재무데이터 + OpenAI 기반 기업 재무건전성·조직 안정성 분석
- **노동시장 예측** — 뉴스 감성분석 + 주가 데이터를 결합한 업종별 고용 전망 제공

### 재직자
- **직장 내 괴롭힘 대응 센터** — 사례 분석 및 대응 가이드
- **스마트 이직 제안** — 현 역량 기반 이직 포지션 추천
- **프로페셔널 재능 기부** — 재직자 재능 기부 매칭

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | Next.js 16, React, Vanilla CSS |
| AI | OpenAI GPT-4o-mini |
| 데이터 수집 | Cheerio, Python (뉴스·주가·고용통계 크롤링) |
| 기업 데이터 | DART 전자공시 API |
| 배포 | Vercel |

---

## 로컬 실행 방법

### 1. 클론
```bash
git clone https://github.com/naseoyun/AI-service.git
cd AI-service
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 설정
`.env.local.example`을 복사해 `.env.local` 생성 후 키 입력
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Next.js 서버 실행
```bash
npm run dev
```

### 5. 기업분석 API 서버 실행 (별도 터미널)
```bash
cd services/company-api
node server.js
```

두 서버를 동시에 실행해야 기업 분석 기능이 작동합니다.  
Next.js: http://localhost:3000 / company-api: http://localhost:4000

---

## 프로젝트 구조

```
AI-service/
├── app/                    # Next.js 페이지 및 API 라우트
│   ├── api/                # 자소서 분석, 채팅, 피드백 API
│   ├── resume/             # 자소서 분석 페이지
│   ├── company/            # 기업 분석 페이지
│   ├── market/             # 노동시장 예측 페이지
│   └── employee/           # 재직자 서비스 페이지
├── services/company-api/   # 기업분석 Express 서버
├── market-predict/         # 노동시장 예측 크롤링 파이프라인 (Python)
└── public/                 # 정적 파일
```

---

## 팀원 기여 가이드

1. `feature/기능이름` 브랜치 생성 후 작업
2. 커밋 메시지는 `feat:`, `fix:`, `refactor:` 등 prefix 사용
3. 작업 완료 후 main 브랜치로 Pull Request 생성
