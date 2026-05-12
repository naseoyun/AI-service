import json
import os
from datetime import datetime

from crawlers.news_crawler import crawl_all
from crawlers.stock_crawler import get_all_stock_scores
from predict.market_predictor import predict_all


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(BASE_DIR, "data", "result.json")


def run():
    print("=" * 40)
    print("노동시장 예측 파이프라인 시작")
    print(f"실행 시각: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 40)

    # 1. 뉴스 크롤링
    print("\n[1/3] 뉴스 크롤링 중...")
    news_df = crawl_all()

    # 2. 주가 수집
    print("\n[2/3] 주가 데이터 수집 중...")
    stock_scores = get_all_stock_scores()

    # 3. 예측 실행
    print("\n[3/3] 노동시장 전망 예측 중...")
    results = predict_all(news_df, stock_scores)

    # 4. 결과 저장
    output = {
        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "industries": results,
    }
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n[완료] 결과 저장: {OUTPUT_PATH}")
    print("\n--- 업종별 전망 요약 ---")
    for r in results:
        print(f"  {r['emoji']} {r['industry']:10s} {r['score']:5.1f}점  ({r['trend']})  주가 {r['stock_change']}")


if __name__ == "__main__":
    run()
