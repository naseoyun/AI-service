'use client';
import { useState } from 'react';
import './Company.css';

export default function CompanyPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [step, setStep] = useState('home');
  const [companyData, setCompanyData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return alert('기업명을 입력해주세요!');
    setStep('loading');
    try {
      const res = await fetch('/api/company/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: searchQuery.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '오류 발생');
      setCompanyData(data);
      setStep('result');
    } catch (err) {
      setErrorMsg(err.message);
      setStep('error');
    }
  };

  return (
    <div className="company-page">
      {step === 'home' && (
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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b72ed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>          
          </div>
        </main>
      )}

      {step === 'loading' && (
        <main className="company-home">
          <p>⏳ 분석 중입니다...</p>
        </main>
      )}

      {step === 'error' && (
        <main className="company-home">
          <p>⚠️ {errorMsg}</p>
          <button onClick={() => setStep('home')}>다시 시도하기</button>
        </main>
      )}

      {step === 'result' && companyData && (
        <main className="company-result">
          <button className="back-btn" onClick={() => setStep('home')}>← 목록으로</button>

          <div className="company-header-card">
            <div className="company-info">
              <h2 className="company-name">{companyData.name}</h2>
              <p className="company-tag">{companyData.category} · {companyData.location} · {companyData.founded}년 설립</p>
              <p>평균 연봉 {companyData.avgSalary} · 이직률 {companyData.turnoverRate}</p>
            </div>
            <div className="company-score">
              <span className="score-label">{companyData.scoreLabel}</span>
              <span className="score-value">{companyData.score}점</span>
            </div>
          </div>

          <div className="result-card">
            <h3>한줄평</h3>
            <p>{companyData.oneLineSummary}</p>
          </div>

          <div className="result-grid">
            {companyData.ratings.map((r) => (
              <div className="result-card" key={r.label}>
                <h3>{r.label}</h3>
                <div className="progress-bar"><div className="progress" style={{width: `${r.value}%`}} /></div>
                <p>{r.value}점</p>
              </div>
            ))}
          </div>

          <div className="result-card">
            <h3>재무 상세 ({companyData.financials.year})</h3>
            <ul style={{listStyle:'none', padding:0}}>
              <li>매출액 {companyData.financials.revenue}</li>
              <li>영업이익 {companyData.financials.operatingProfit}</li>
              <li>순이익 {companyData.financials.netIncome}</li>
              <li>자산 {companyData.financials.totalAssets} / 자본 {companyData.financials.equity}</li>
              <li>부채 {companyData.financials.totalDebt}</li>
            </ul>
          </div>

          {/* ✅ 직원현황 — result main 안에 위치 */}
          {companyData.employeeStatus && (
            <div className="result-card">
              <h3>재무 요약 ({companyData.financials.year})</h3>
              <div className="financial-detail-grid">
                <div className="fin-item">
                  <span className="fin-question">얼마나 잘벌까? 💰</span>
                  <span className="fin-number">{companyData.financials.revenue}</span>
                  <span className="fin-comment">{companyData.financialDetail?.salaryComment}</span>
                </div>
                <div className="fin-item">
                  <span className="fin-question">얼마나 튼튼할까? 🏦</span>
                  <span className="fin-number">부채 {companyData.financials.totalDebt} / 자본 {companyData.financials.equity}</span>
                  <span className="fin-comment">{companyData.financialDetail?.stabilityComment}</span>
                </div>
                <div className="fin-item">
                  <span className="fin-question">돈이 얼마나 오갈까? 📊</span>
                  <span className="fin-number">영업이익 {companyData.financials.operatingProfit}</span>
                  <span className="fin-comment">{companyData.financialDetail?.revenueComment}</span>
                </div>
              </div>

         

              <div className="gender-bar-wrap">
                <span className="emp-label">성별 비율</span>
                <div className="gender-bar">
                  <div className="gender-male" style={{
                    width: `${Math.round(
                      companyData.employeeStatus.totalMale /
                      (companyData.employeeStatus.totalMale + companyData.employeeStatus.totalFemale) * 100
                    )}%`
                  }}>
                    남 {companyData.employeeStatus.totalMale.toLocaleString()}명
                  </div>
                  <div className="gender-female">
                    여 {companyData.employeeStatus.totalFemale.toLocaleString()}명
                  </div>
                </div>
              </div>

              <div className="contract-wrap">
                <span className="emp-label">계약형태</span>
                <div className="contract-row">
                  <div className="contract-item regular">
                    정규직 {companyData.employeeStatus.regular.toLocaleString()}명
                  </div>
                  <div className="contract-item contract">
                    계약직 {companyData.employeeStatus.contract.toLocaleString()}명
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
