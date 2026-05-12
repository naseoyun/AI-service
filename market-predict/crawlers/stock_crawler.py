import FinanceDataReader as fdr
import pandas as pd
import os
from datetime import datetime, timedelta

STOCK_TICKERS = {
    '금융권': ['105560', '055550'],
    'IT_SW': ['035420', '035720'],
    'IT_HW': ['005930', '000660'],
    '바이오': ['207940', '068270'],
    '엔터': ['352820', '041510'],
}

def get_stock_change(ticker: str, days: int = 30) -> float:
    end = datetime.today()
    start = end - timedelta(days=days)
    try:
        df = fdr.DataReader(ticker, start, end)
        if df.empty or len(df) < 2:
            print(f"[주가 없음] {ticker}")
            return 0.0
        first_close = float(df['Close'].iloc[0])
        last_close = float(df['Close'].iloc[-1])
        change = ((last_close - first_close) / first_close) * 100
        return round(change, 2)
    except Exception as e:
        print(f"[주가 오류] {ticker} - {e}")
        return 0.0

def get_industry_stock_score(tickers: list) -> tuple:
    changes = [get_stock_change(t) for t in tickers]
    avg_change = sum(changes) / len(changes) if changes else 0.0
    score = (avg_change + 10) / 20 * 100
    score = max(0, min(100, score))
    return round(score, 1), round(avg_change, 2)

def get_all_stock_scores() -> dict:
    result = {}
    for industry, ticker_list in STOCK_TICKERS.items():
        print(f"[주가] {industry} ...")
        score, change = get_industry_stock_score(ticker_list)
        result[industry] = {
            "stock_score": score,
            "stock_change": f"{'+' if change >= 0 else ''}{change}%"
        }
        print(f"  → {change}% (점수: {score})")
    return result

if __name__ == "__main__":
    scores = get_all_stock_scores()
    for industry, data in scores.items():
        print(f"{industry}: {data}")