import requests
import pandas as pd
import json
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEYWORDS_PATH = os.path.join(BASE_DIR, "data", "keywords.json")


def load_keywords() -> dict:
    with open(KEYWORDS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def search_news(keyword: str, display: int = 10) -> list[dict]:
    """
    네이버 뉴스 검색 API로 기사 가져오기
    """
    url = "https://openapi.naver.com/v1/search/news.json"
    headers = {
        "X-Naver-Client-Id": CLIENT_ID,
        "X-Naver-Client-Secret": CLIENT_SECRET,
    }
    params = {
        "query": keyword,
        "display": display,
        "sort": "date",
    }

    try:
        res = requests.get(url, headers=headers, params=params, timeout=5)
        res.raise_for_status()
        items = res.json().get("items", [])

        articles = []
        for item in items:
            title = item["title"].replace("<b>", "").replace("</b>", "").replace("&quot;", '"')
            articles.append({
                "keyword": keyword,
                "title": title,
                "link": item.get("originallink") or item.get("link"),
                "date": datetime.today().strftime("%Y-%m-%d"),
            })
        return articles

    except Exception as e:
        print(f"[API 오류] {keyword} - {e}")
        return []


def crawl_industry(industry: str, kw_data: dict) -> pd.DataFrame:
    all_articles = []

    for kw in kw_data.get("company", []):
        articles = search_news(kw, display=5)
        for a in articles:
            a["industry"] = industry
            a["kw_type"] = "company"
        all_articles.extend(articles)

    for kw in kw_data.get("trend", []):
        articles = search_news(kw, display=5)
        for a in articles:
            a["industry"] = industry
            a["kw_type"] = "trend"
        all_articles.extend(articles)

    return pd.DataFrame(all_articles)


def crawl_all() -> pd.DataFrame:
    keywords = load_keywords()
    all_data = []

    for industry, kw_data in keywords.items():
        print(f"[크롤링] {industry} ...")
        df = crawl_industry(industry, kw_data)
        all_data.append(df)

    result = pd.concat(all_data, ignore_index=True)
    result.drop_duplicates(subset=["title"], inplace=True)

    save_path = os.path.join(BASE_DIR, "data", "news_raw.csv")
    result.to_csv(save_path, index=False, encoding="utf-8-sig")
    print(f"[저장 완료] {save_path} ({len(result)}건)")

    return result


if __name__ == "__main__":
    crawl_all()