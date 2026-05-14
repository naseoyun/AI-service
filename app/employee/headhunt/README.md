# Smart Headhunt Backend

`스마트 이직 제안` 기능을 위한 백엔드입니다.

## 제공 기능

- 받은 이직 제안 목록 조회
- 이직 제안 상세 조회
- 새 제안 등록
- 제안 수락
- 수락 후 면접 진행 단계 업데이트
- 프론트 시각화용 파이프라인 데이터 제공

## 실행

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 주요 API

### `GET /api/headhunt/offers`

받은 이직 제안 목록을 조회합니다.

### `GET /api/headhunt/offers/{offer_id}`

이직 제안 상세 정보를 조회합니다.

### `POST /api/headhunt/offers`

새 이직 제안을 등록합니다.

### `POST /api/headhunt/offers/{offer_id}/accept`

제안을 수락하고 면접 진행 단계를 시작합니다.

### `PATCH /api/headhunt/offers/{offer_id}/stage`

면접 진행 단계를 변경합니다.

### `GET /api/headhunt/pipeline`

프론트에서 시각화하기 좋은 형태로 제안 목록과 단계별 현황을 반환합니다.

### `GET /api/headhunt/visualization`

`pipeline`과 같은 응답입니다. 프론트에서 시각화 데이터라는 이름으로 호출하고 싶을 때 사용합니다.
