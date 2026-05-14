# Worker Harassment Analysis Backend

재직자 파트의 첫 번째 기능인 `직장 내 괴롭힘 대응 센터` 백엔드입니다.

## 실행

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 주요 API

### `POST /api/employee/harassment/analyze`

문자 캡처 이미지를 업로드하면 OCR로 텍스트를 추출하고, 근로기준법상 직장 내 괴롭힘 판단 요소에 맞춰 가능성을 0~100점으로 계산합니다.

멀티파트 필드:

- `image`: 문자 캡처 이미지 파일
- `message_text`: OCR 없이 직접 분석할 텍스트. 이미지와 함께 보내면 OCR 실패 시 대체 텍스트로 사용됩니다.

예시:

```bash
curl -X POST "http://127.0.0.1:8000/api/employee/harassment/analyze" ^
  -F "image=@chat.png"
```

또는 OCR 없이:

```bash
curl -X POST "http://127.0.0.1:8000/api/employee/harassment/analyze" ^
  -F "message_text=오늘도 야근 안 하면 인사평가 불이익 줄 거야"
```

## 응답 개요

- `probability_score`: 괴롭힘 성립 가능성 점수
- `risk_level`: `low`, `medium`, `high`, `critical`
- `criteria`: 법적 판단 요소별 감지 결과
- `evidence`: 점수 산정 근거
- `recommended_actions`: 다음 대응 제안

이 API는 법률 자문이 아니라 초기 위험도 분류용입니다.

# OCR 실행 환경 설정

## 1. Tesseract OCR 설치

Windows용 Tesseract OCR을 설치합니다.

설치 링크:
[https://github.com/UB-Mannheim/tesseract/wiki](https://github.com/UB-Mannheim/tesseract/wiki)

설치 시 한국어 언어팩(Korean)도 함께 체크합니다.

기본 설치 경로:
C:\Program Files\Tesseract-OCR\

---

## 2. Python 라이브러리 설치

VS Code 터미널에서 아래 명령어를 실행합니다.

pip install pytesseract pillow

---

## 3. OCR 경로 연결

Python 코드에서 Tesseract 실행 경로를 지정합니다.

import pytesseract
from PIL import Image

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

text = pytesseract.image_to_string(
Image.open("chat.png"),
lang="kor"
)

print(text)
