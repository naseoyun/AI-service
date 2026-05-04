# Job팜 (Job Farm) 🌾

AI 기반 이력서 분석 및 커리어 통찰력을 제공하는 현대적인 구인구직 플랫폼입니다.

## 🚀 주요 기능
- **AI 이력서 분석**: OpenAI를 사용하여 이력서에서 핵심 키워드 및 주제를 추출합니다.
- **맞춤형 기업 연구**: 사용자에게 최적화된 기업 정보를 제공합니다.
- **프리미엄 UI**: Glassmorphism 디자인이 적용된 세련되고 반응형인 인터페이스.

## 🛠 기술 스택
- **Framework**: Next.js
- **Logic**: React, JavaScript
- **Styling**: Vanilla CSS (Modern CSS)
- **AI**: OpenAI API
- **Scraping**: Cheerio

## 🏁 시작하기

팀원들이 로컬 환경에서 프로젝트를 실행하려면 다음 단계를 따르세요.

### 1. 프로젝트 클론
```bash
git clone https://github.com/사용자아이디/ai-service.git
cd ai-service
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
프로젝트 루트에 `.env.local` 파일을 생성하고 아래 내용을 입력하세요 (또는 `.env.local.example` 파일을 복사하여 이름을 변경하세요).

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. 개발 서버 실행
```bash
npm run dev
```
이제 [http://localhost:3000](http://localhost:3000)에서 앱을 확인할 수 있습니다.

## 📁 폴더 구조
- `app/`: Next.js App Router (페이지 및 API 라우트)
- `public/`: 정적 이미지 및 자산
- `style.css`: 전역 스타일링

## 🤝 기여 방법
1. 새로운 기능을 개발할 때는 `feature/기능이름` 브랜치를 생성하세요.
2. 커밋 메시지는 한글 또는 영어로 명확하게 작성해 주세요.
3. 작업 완료 후 Main 브랜치로 Pull Request를 생성해 주세요.
