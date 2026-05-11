import pandas as pd
from transformers import pipeline
import os


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# KR-FinBert 감성 분석 모델 로드 (최초 실행 시 ~500MB 다운로드)
print("[모델 로드] KR-FinBert-SC ...")
sentiment_model = pipeline(
    "sentiment-analysis",
    model="snunlp/KR-FinBert-SC",
    truncation=True,
    max_length=512,
)


def analyze_sentiment(titles: list[str]) -> dict:
    """
    기사 제목 리스트의 감성 분석 결과 반환
    - positive / negative / neutral 비율 및 평균 점수 계산
    """
    if not titles:
        return {"positive": 0, "neutral": 0, "negative": 0, "news_score": 50.0}

    results = sentiment_model(titles[:20])

    counts = {"positive": 0, "neutral": 0, "negative": 0}
    score_sum = 0.0

    for r in results:
        label = r["label"].lower()
        confidence = r["score"]

        if label in counts:
            counts[label] += 1

        if label == "positive":
            score_sum += confidence * 100
        elif label == "negative":
            score_sum += (1 - confidence) * 100
        else:
            score_sum += 50.0

    total = len(results)
    news_score = round(score_sum / total, 1)

    return {
        "positive": round(counts["positive"] / total * 100, 1),
        "neutral": round(counts["neutral"] / total * 100, 1),
        "negative": round(counts["negative"] / total * 100, 1),
        "news_score": news_score,
        "news_count": total,
    }


def get_hero_news(df_industry: pd.DataFrame) -> dict:
    """
    업종 기사 중 감성 점수가 가장 높은 기사 1건 선별 (히어로 카드용)
    동점 시 최신 날짜 우선
    """
    if df_industry.empty:
        return {}

    # 감성 분석 후 점수 컬럼 추가
    titles = df_industry["title"].tolist()
    results = sentiment_model(titles[:20], truncation=True, max_length=512)

    df_scored = df_industry.head(len(results)).copy()
    df_scored["sentiment_label"] = [r["label"].lower() for r in results]
    df_scored["sentiment_score"] = [
        r["score"] if r["label"].lower() == "positive"
        else 1 - r["score"] if r["label"].lower() == "negative"
        else 0.5
        for r in results
    ]

    # 채용·고용 키워드 포함 시 보너스
    hire_keywords = ["채용", "공채", "취업", "구직", "인재", "신입"]
    df_scored["hire_bonus"] = df_scored["title"].apply(
        lambda t: 0.05 if any(k in t for k in hire_keywords) else 0
    )
    df_scored["final_score"] = df_scored["sentiment_score"] + df_scored["hire_bonus"]

    hero = df_scored.sort_values(
        ["final_score", "date"], ascending=[False, False]
    ).iloc[0]

    return {
        "title": hero["title"],
        "link": hero["link"],
        "date": hero["date"],
        "sentiment": hero["sentiment_label"],
        "sentiment_score": round(hero["final_score"] * 100, 1),
    }


def get_top5_news(df_industry: pd.DataFrame, hero_title: str = "") -> list[dict]:
    """
    히어로 기사 제외한 TOP 5 기사 반환
    """
    titles = df_industry["title"].tolist()
    results = sentiment_model(titles[:20], truncation=True, max_length=512)

    df_scored = df_industry.head(len(results)).copy()
    df_scored["sentiment_label"] = [r["label"].lower() for r in results]
    df_scored["sentiment_score"] = [
        r["score"] if r["label"].lower() == "positive" else 1 - r["score"]
        for r in results
    ]

    df_scored = df_scored[df_scored["title"] != hero_title]
    top5 = df_scored.sort_values("sentiment_score", ascending=False).head(5)

    return [
        {
            "rank": i + 1,
            "title": row["title"],
            "link": row["link"],
            "date": row["date"],
            "sentiment": row["sentiment_label"],
        }
        for i, (_, row) in enumerate(top5.iterrows())
    ]


def calculate_final_score(news_score: float, stock_score: float) -> dict:
    """
    최종 전망 점수 계산
    뉴스 감성 70% + 주가 등락 30%
    """
    final = round(news_score * 0.7 + stock_score * 0.3, 1)

    if final >= 60:
        trend = "긍정적"
        emoji = "🟢"
    elif final >= 40:
        trend = "보통"
        emoji = "🟡"
    else:
        trend = "부정적"
        emoji = "🔴"

    return {"score": final, "trend": trend, "emoji": emoji}


def predict_all(news_df: pd.DataFrame, stock_scores: dict) -> list[dict]:
    """전체 업종 예측 결과 생성"""
    results = []

    for industry in news_df["industry"].unique():
        print(f"[예측] {industry} ...")
        df_industry = news_df[news_df["industry"] == industry]
        titles = df_industry["title"].tolist()

        sentiment = analyze_sentiment(titles)
        stock = stock_scores.get(industry, {"stock_score": 50.0, "stock_change": "0%"})
        final = calculate_final_score(sentiment["news_score"], stock["stock_score"])
        hero = get_hero_news(df_industry)
        top5 = get_top5_news(df_industry, hero.get("title", ""))

        results.append({
            "industry": industry,
            "score": final["score"],
            "trend": final["trend"],
            "emoji": final["emoji"],
            "news_count": sentiment["news_count"],
            "positive_pct": sentiment["positive"],
            "neutral_pct": sentiment["neutral"],
            "negative_pct": sentiment["negative"],
            "stock_change": stock["stock_change"],
            "hero_news": hero,
            "top5_news": top5,
        })

    return sorted(results, key=lambda x: x["score"], reverse=True)


if __name__ == "__main__":
    news_path = os.path.join(BASE_DIR, "data", "news_raw.csv")
    df = pd.read_csv(news_path)
    from crawlers.stock_crawler import get_all_stock_scores
    stock_scores = get_all_stock_scores()
    results = predict_all(df, stock_scores)
    for r in results:
        print(f"{r['emoji']} {r['industry']}: {r['score']}점 ({r['trend']})")
