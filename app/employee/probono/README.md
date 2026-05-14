# Probono Volunteer Backend

`프로페셔널 재능 기부` 기능을 위한 백엔드입니다.

## 목표

1365 자원봉사포털과 VMS에서 봉사 모집 정보를 가져와 프론트에서 리스트 형태로 보여줄 수 있게 표준화합니다.

포털 화면 구조, 로그인 요구, 차단 정책에 따라 실시간 크롤링은 실패할 수 있습니다. 그래서 이 백엔드는 다음 순서로 동작합니다.

1. 1365/VMS 공개 페이지 크롤링 시도
2. 실패하거나 결과가 부족하면 샘플 데이터로 보완
3. 위치, 직무 역량, 인정시간, 모집기관, 신청 링크를 같은 형태로 반환

## 실행

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 주요 API

### `GET /api/probono/opportunities`

봉사활동 리스트를 조회합니다.

쿼리 파라미터:

- `location`: 지역 키워드
- `skill`: 필요한 역량 키워드
- `portal`: `1365`, `vms`, `sample`
- `limit`: 최대 반환 개수
- `include_live`: 실시간 크롤링 시도 여부

예시:

```bash
curl "http://127.0.0.1:8000/api/probono/opportunities?location=서울&skill=기획&limit=10"
```

### `POST /api/probono/opportunities/refresh`

실시간 크롤링을 다시 시도하고 서버 메모리 캐시를 갱신합니다.

### `GET /api/probono/skills`

봉사활동에서 감지되는 직무 역량 목록을 조회합니다.
