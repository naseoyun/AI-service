'use client';
import { useState } from 'react';
import './Company.css';

export default function CompanyPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleSearch = () => {
    if (!searchQuery) return alert('기업명을 입력해주세요!');
    setShowResult(true);
  };

  return (
    <div className="company-page">
      {!showResult ? (
        <main className="company-home">
          <div className="home-titles">
            <h2>요즘 뜨는 <strong>기업</strong></h2>
            <h2>분석하러 가기</h2>
          </div>
          <div className="search-pill">
            <input
              type="text"
              placeholder="기업명을 입력하세요 (예: 카카오, 삼성전자)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-btn" onClick={handleSearch}>
              🔍
            </button>
          </div>
        </main>
      ) : (
        <main className="company-result">
          <button className="back-btn" onClick={() => setShowResult(false)}>← 목록으로</button>
          <div className="company-header-card">
            <div className="company-info">
              <h2 className="company-name">{searchQuery}</h2>
              <p className="company-tag">#IT #SW #성남시 #2010설립</p>
            </div>
            <div className="company-score">
              <span className="score-label">AI 종합 점수</span>
              <span className="score-value">82점</span>
            </div>
          </div>
          
          <div className="result-grid">
            <div className="result-card">
              <h3>재무 건전성</h3>
              <div className="progress-bar"><div className="progress" style={{width: '75%'}}></div></div>
              <p>안정적인 매출 성장세를 보이고 있습니다.</p>
            </div>
            <div className="result-card">
              <h3>조직 문화</h3>
              <div className="progress-bar"><div className="progress" style={{width: '90%'}}></div></div>
              <p>수평적인 소통 문화를 지향하며 자율성이 높습니다.</p>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
