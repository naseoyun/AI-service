import requests
import xml.etree.ElementTree as ET
from datetime import datetime

def get_job_seeker_count() -> dict:
    """
    고용행정통계 API로 전국 구인구직 건수 조회
    고용노동부 공공데이터 활용
    """
    url = "https://eis.work24.go.kr/opi/joApi.do"
    
    # 최근 3개월 평균 구인건수 계산
    today = datetime.today()
    months = []
    for i in range(1, 4):
        month = today.month - i
        year = today.year
        if month <= 0:
            month += 12
            year -= 1
        months.append(f"{year}{month:02d}")

    industry_counts = {
        '금융권': 0,
        'IT_SW': 0,
        'IT_HW': 0,
        '바이오': 0,
        '엔터': 0,
    }

    total_count = 0
    valid_months = 0

    for ym in months:
        params = {
            'apiSecd': 'OPIA',
            'rsdAreaCd': '11110',
            'sxdsCd': 'M',
            'ageCd': '01',
            'rernSecd': 'XML',
            'closStdrYm': ym,
            'bgnPage': '1',
            'display': '100'
        }
        try:
            res = requests.get(url, params=params, timeout=10)
            root = ET.fromstring(res.content.decode('euc-kr'))
            cnt = int(root.findtext('rqst-cnt') or 0)
            total_count += cnt
            if cnt > 0:
                valid_months += 1
        except Exception as e:
            print(f"[고용통계 오류] {ym} - {e}")

    avg_count = total_count // max(valid_months, 1)
    
    # 구인건수를 0~100 점수로 변환 (기준: 10건 = 50점)
    score = min(100, max(0, (avg_count / 10) * 50))

    print(f"[고용통계] 평균 구인건수: {avg_count}건 → 점수: {score}")

    # 전 업종에 동일하게 적용 (전국 지표)
    for industry in industry_counts:
        industry_counts[industry] = score

    return industry_counts


if __name__ == "__main__":
    result = get_job_seeker_count()
    print(result)