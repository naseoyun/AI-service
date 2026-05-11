'use client';
import { useState } from 'react';
import './Market.css';

const MARKET_DATA = [
  { id: 1, sector: '금융권', score: 85, label: '매우 맑음', change: '+12%', desc: '디지털 전환 가속화로 IT 인력 수요 급증' },
  { id: 2, sector: 'IT/SW', score: 92, label: '매우 맑음', change: '+15%', desc: 'AI 및 클라우드 분야 채용 시장 확대' },
  { id: 3, sector: '제조/전자', score: 65, label: '보통', change: '-2%', desc: '반도체 경기 회복세에 따른 완만한 상승' },
  { id: 4, sector: '서비스/유통', score: 45, label: '흐림', change: '-5%', desc: '비대면 서비스 전환으로 인한 오프라인 축소' },
];

export default function MarketPage() {
  return (
    <div className="market-page">
      <header className="market-header">
        <h2>실시간 <strong>노동시장</strong> 전망</h2>
        <p>AI가 분석한 업종별 채용 트렌드를 확인하세요.</p>
      </header>

      <div className="market-grid">
        {MARKET_DATA.map((item) => (
          <div key={item.id} className="market-card">
            <div className="card-top">
              <span className="sector-badge">{item.sector}</span>
              <span className={`status-badge ${item.score > 80 ? 'good' : 'normal'}`}>{item.label}</span>
            </div>
            <div className="score-area">
              <span className="score-num">{item.score}</span>
              <span className="score-unit">점</span>
            </div>
            <div className="progress-bar">
              <div className="progress" style={{ width: `${item.score}%` }}></div>
            </div>
            <p className="market-desc">{item.desc}</p>
            <div className="card-footer">
              <span>전월 대비 채용 공고</span>
              <span className="change-val">{item.change}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}