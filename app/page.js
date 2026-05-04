'use client';
import { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('resume');

  const tabs = [
    { id: 'resume', label: '자소서 분석', title: '자소서 분석', desc: '자신의 경험이 담긴 네이버 블로그 링크를 넣어보세요. AI가 자소서 주제를 뽑아드립니다.' },
    { id: 'company', label: '기업 분석', title: '기업 분석', desc: '가고 싶은 기업의 재무, 문화, 비전을 심도 있게 분석해 드립니다.' },
    { id: 'market', label: '노동시장 예측', title: '노동시장 예측', desc: '미래 트렌드와 데이터에 기반한 고용 시장 변화를 미리 확인하세요.' },
    { id: 'employee', label: '재직자', title: '재직자 서비스', desc: '이미 취업한 분들을 위한 커리어 관리와 네트워크 서비스를 제공합니다.' },
  ];

  const [blogUrl, setBlogUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!blogUrl) return alert('블로그 링크를 입력해주세요.');
    setLoading(true);
    setAnalysisResult('');
    setError('');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: blogUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '분석 중 오류가 발생했습니다.');
      }
      setAnalysisResult(data.result);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <div className="bg-blur" />
      
      <header className="main-header">
        <div className="header-content">
          <h1 className="brand-title">job팜</h1>
          <p className="brand-subtitle">구직자와 재직자를 위한 서비스</p>
        </div>
        
        <nav className="nav-container">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="content-area">
        {tabs.map((tab) => (
          activeTab === tab.id && (
            <section key={tab.id} className="glass-card">
              <h2>{tab.title}</h2>
              <p>{tab.desc}</p>
              
              {tab.id === 'resume' && (
                <div className="analysis-container">
                  <div className="input-group">
                    <input 
                      type="text" 
                      placeholder="https://blog.naver.com/..." 
                      className="url-input"
                      value={blogUrl}
                      onChange={(e) => setBlogUrl(e.target.value)}
                    />
                    <button 
                      className="analyze-btn" 
                      onClick={handleAnalyze}
                      disabled={loading}
                    >
                      {loading ? '분석 중...' : '분석하기'}
                    </button>
                  </div>
                  
                  {error && (
                    <div className="error-area">
                      <p>⚠️ {error}</p>
                      {error.includes('quota') && (
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
                          OpenAI API 쿼터(잔액)가 부족합니다. 계정의 충전 상태를 확인해 주세요.
                        </p>
                      )}
                    </div>
                  )}
                  
                  {analysisResult && (
                    <div className="result-area highlight">
                      <div className="result-header">
                        <h3>✨ 분석 결과 및 자소서 추천 주제</h3>
                      </div>
                      <div className="result-text">{analysisResult}</div>
                    </div>
                  )}

                  <div className="visual-container">
                     <img 
                      src="/resume-visual.png" 
                      alt="AI Analysis" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                     />
                  </div>
                </div>
              )}
            </section>
          )
        ))}
      </div>

      <footer className="footer">
        <p>&copy; 2026 job팜. All rights reserved.</p>
      </footer>
    </main>
  );
}
