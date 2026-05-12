import pandas as pd
from transformers import pipeline
import os
import openai
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

print("[모델 로드] KR-FinBert-SC ...")
sentiment_model = pipeline(
    "sentiment-analysis",
    model="snunlp/KR-FinBert-SC",
    truncation=True,
    max_length=512,
)


def summarize_article(title: str) -> str:
    """기사 제목을 AI가 3줄로 요약"""
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "당신은 채용 시장 전문가입니다. 기사 제목을 보고 채용 시장 관점에서 2~3문장으로 요약해주세요."},
                {"role": "user", "content": f"기사 제목: {title}"}
            ],
            max_tokens=200
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[요약 오류] {e}")
        return ""


def analyze_sentiment(titles: list[str]) -> dict:
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
    if df_industry.empty:
        return {}

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

    hire_keywords = ["채용", "공채", "취업", "구직", "인재", "신입"]
    df_scored["hire_bonus"] = df_scored["title"].apply(
        lambda t: 0.05 if any(k in t for k in hire_keywords) else 0
    )
    df_scored["final_score"] = df_scored["sentiment_score"] + df_scored["hire_bonus"]

    hero = df_scored.sort_values(
        ["final_score", "date"], ascending=[False, False]
    ).iloc[0]

    print(f"[AI 요약] {hero['title'][:30]}...")
    summary = summarize_article(hero["title"])

    return {
        "title": hero["title"],
        "link": hero["link"],
        "date": hero["date"],
        "sentiment": hero["sentiment_label"],
        "sentiment_score": round(hero["final_score"] * 100, 1),
        "summary": summary,
    }


def get_top5_news(df_industry: pd.DataFrame, hero_title: str = "") -> list[dict]:
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