'use client';
import { useState, useEffect } from 'react';
import './Market.css';

const sectorMap = {
  '금융권': '금융권',
  'IT_SW': 'IT/SW',
  'IT_HW': 'IT HW',
  '바이오': '바이오',
  '엔터': '엔터/미디어',
};

const emojiMap = {
  '금융권': '🏦',
  'IT_SW': '💻',
  'IT_HW': '🖥',
  '바이오': '🧬',
  '엔터': '🎬',
};

export default function MarketPage() {
  const [marketData, setMarketData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetch('/result.json')
      .then(r => r.json())
      .then(data => {
        setLastUpdated(data.updated_at);
        const converted = data.industries.map((item, idx) => ({
          id: idx + 1,
          sector: sectorMap[item.industry] || item.industry,
          emoji: emojiMap[item.industry] || '📊',
          score: item.score,
          scoreLabel: item.trend,
          stockChange: parseFloat(item.stock_change),
          articleCount: item.news_count,
          topArticle: {
            sentiment: item.hero_news?.sentiment === 'positive' ? '긍정' : item.hero_news?.sentiment === 'negative' ? '부정' : '중립',
            title: item.hero_news?.title || '',
            date: item.hero_news?.date || '',
            sentimentScore: item.hero_news?.sentiment_score || 0,
            link: item.hero_news?.link || '#',
          },
          sentimentDetail: {
            positive: item.positive_pct,
            neutral: item.neutral_pct,
            negative: item.negative_pct,
          },
          top5: item.top5_news?.map(n => ({ title: n.title, link: n.link })) || [],
        }));
        setMarketData(converted.sort((a, b) => b.score - a.score));
      });
  }, []);

  const selected = marketData.find(d => d.id === selectedId);

  if (!marketData.length) return <div className="market-page"><p style={{textAlign:'center',padding:'3rem'}}>불러오는 중...</p></div>;

  if (selected) {
    const sentimentColor = selected.topArticle.sentiment === '긍정' ? 'sentiment-positive' : selected.topArticle.sentiment === '부정' ? 'sentiment-negative' : 'sentiment-neutral';
    return (
      <div className="market-page">
        <main className="market-detail">
          <button className="back-btn" onClick={() => setSelectedId(null)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            목록으로
          </button>
          <div className="detail-layout">
            <div className="detail-left">
              <div className="detail-identity">
                <div className="detail-logo" style={{display:'flex',alignItems:'center',justifyContent:'center',fontSize:'32px',background:'#f5f5f5'}}>{selected.emoji}</div>
                <h2 className="detail-sector">{selected.sector}</h2>
              </div>
              <div className="detail-score-row">
                <span className="detail-score">{selected.score}점</span>
                <span className="detail-score-badge">{selected.scoreLabel}</span>
              </div>
              <div className="detail-meta">
                <span>분석 기사 {selected.articleCount}건</span>
                <span className={`detail-stock ${selected.stockChange >= 0 ? 'positive' : 'negative'}`}>주가 {selected.stockChange > 0 ? '+' : ''}{selected.stockChange}%</span>
              </div>
              <div className="detail-card">
                <h3 className="detail-card-title">평가 항목</h3>
                <div className="split-bar">
                  <div className="split-bar-news" style={{width:'70%'}}>뉴스 분석 70%</div>
                  <div className="split-bar-stock" style={{width:'30%'}}>주가 등락 30%</div>
                </div>
                <h4 className="detail-sub-title">상세 사항</h4>
                <div className="detail-sub-section">
                  <p className="detail-sub-label">• 뉴스 분석</p>
                  <div className="sentiment-bar-track"><div className="sentiment-bar-fill" style={{width:`${selected.sentimentDetail.positive + selected.sentimentDetail.neutral}%`}}/></div>
                  <div className="sentiment-legend">
                    <span className="legend-positive">긍정 {selected.sentimentDetail.positive}%</span>
                    <span className="legend-neutral">중립 {selected.sentimentDetail.neutral}%</span>
                    <span className="legend-negative">부정 {selected.sentimentDetail.negative}%</span>
                  </div>
                </div>
                <div className="detail-sub-section">
                  <p className="detail-sub-label">• 주가 등락</p>
                  <p className={`stock-change-value ${selected.stockChange >= 0 ? 'positive' : 'negative'}`}>{selected.stockChange > 0 ? '+' : ''}{selected.stockChange}%</p>
                </div>
              </div>
            </div>
            <div className="detail-right">
              <div className="detail-card">
                <h3 className="detail-card-title">주요 기사</h3>
                <a href={selected.topArticle.link} target="_blank" rel="noreferrer" style={{textDecoration:'none'}}>
                  <div className={`top-article ${sentimentColor}-bg`}>
                    <span className={`article-sentiment-badge ${sentimentColor}`}>{selected.topArticle.sentiment}</span>
                    <p className="article-title">{selected.topArticle.title}</p>
                    <p className="article-meta">{selected.topArticle.date} 감성 점수 {selected.topArticle.sentimentScore}점</p>
                  </div>
                </a>
              </div>
              <div className="detail-card">
                <h3 className="detail-card-title"><strong>TOP 5</strong> 기사</h3>
                <ol className="top5-list">
                  {selected.top5.map((news, i) => (
                    <li key={i} className="top5-item">
                      <span className="top5-rank">{i+1}</span>
                      <a href={news.link} target="_blank" rel="noreferrer" style={{textDecoration:'none'}}><span className="top5-title">{news.title}</span></a>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="market-page">
      <main className="market-home">
        <div className="market-home-header">
          <h2 className="market-home-title">노동시장 전망</h2>
          <span className="market-updated"><strong>{lastUpdated}</strong> 갱신</span>
        </div>
        <div className="market-grid">
          {marketData.map((item) => (
            <button key={item.id} className="market-card" onClick={() => setSelectedId(item.id)}>
              <div className="mc-top">
                <div className="mc-logo" style={{display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',background:'#f5f5f5'}}>{item.emoji}</div>
                <div className="mc-sector">{item.sector}</div>
                <span className="mc-badge">{item.scoreLabel}</span>
              </div>
              <div className="mc-score-row">
                <div className="mc-score-label">전망 점수</div>
                <div className="mc-bar-wrap">
                  <div className="mc-bar-track"><div className="mc-bar-fill" style={{width:`${item.score}%`}}/></div>
                  <span className="mc-score-num">{item.score}<span className="mc-score-unit">점</span></span>
                </div>
              </div>
              <div className="mc-bottom">
                <span className={`mc-stock ${item.stockChange >= 0 ? 'positive' : 'negative'}`}>주가 {item.stockChange > 0 ? '+' : ''}{item.stockChange}%</span>
                <span className="mc-articles">분석 기사 {item.articleCount}건</span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}