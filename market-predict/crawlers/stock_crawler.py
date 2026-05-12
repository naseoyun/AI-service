import yfinance as yf
import pandas as pd
import json
import os
from datetime import datetime, timedelta


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEYWORDS_PATH = os.path.join(BASE_DIR, "data", "keywords.json")


def load_stock_tickers() -> dict:
    with open(KEYWORDS_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {industry: v["stocks"] for industry, v in data.items()}


def get_stock_change(ticker: str, days: int = 30) -> float:
    """
    특정 종목의 최근 N일 등락률 계산
    반환값: 등락률 (%) — 예) +3.2, -1.5
    """
    end = datetime.today()
    start = end - timedelta(days=days)

    try:
        df = yf.download(ticker, start=start, end=end, progress=False)
        if df.empty or len(df) < 2:
            print(f"[주가 없음] {ticker}")
            return 0.0

        first_close = float(df["Close"].iloc[0])
        last_close = float(df["Close"].iloc[-1])
        change = ((last_close - first_close) / first_close) * 100
        return round(change, 2)

    except Exception as e:
        print(f"[주가 오류] {ticker} - {e}")
        return 0.0


def get_industry_stock_score(tickers: list[str]) -> float:
    """
    업종 대표 종목들의 평균 등락률 계산
    0~100점으로 정규화 (기준: -10% = 0점, +10% = 100점)
    """
    changes = [get_stock_change(t) for t in tickers]
    avg_change = sum(changes) / len(changes) if changes else 0.0

    # -10% ~ +10% 범위를 0 ~ 100점으로 정규화
    score = (avg_change + 10) / 20 * 100
    score = max(0, min(100, score))
    return round(score, 1), round(avg_change, 2)


def get_all_stock_scores() -> dict:
    """전체 업종 주가 점수 반환"""
    tickers = load_stock_tickers()
    result = {}

    for industry, ticker_list in tickers.items():
        print(f"[주가] {industry} ...")
        score, change = get_industry_stock_score(ticker_list)
        result[industry] = {
            "stock_score": score,
            "stock_change": f"{'+' if change >= 0 else ''}{change}%"
        }

    return result


if __name__ == "__main__":
    scores = get_all_stock_scores()
    for industry, data in scores.items():
        print(f"{industry}: {data}")
