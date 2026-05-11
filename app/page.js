'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import './Home.css';

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState('');

  const handleGoToResume = () => {
    if (url) {
      router.push(`/resume?url=${encodeURIComponent(url)}`);
    } else {
      router.push('/resume');
    }
  };

  return (
    <main className="home-content">
      <section className="home-top-section">
        {/* 왼쪽: 트렌드 섹션 */}
        <div className="box-panel hot-companies-panel">
          <h2 className="panel-title">요즘 뜨는 기업은?</h2>
          <div className="company-grid-3">
            <div className="company-card">
              <div className="img-placeholder" style={{ background: 'linear-gradient(135deg, #6b72ed 0%, #4338ca 100%)' }}></div>
              <p>올해 상장사 중 42%가 AI 기술을 도입했어요</p>
            </div>
            <div className="company-card">
              <div className="img-placeholder"></div>
              <p>네이버, 초거대 AI '하이퍼클로바X' 생태계 확장</p>
              <span className="card-label">IT/SW</span>
            </div>
            <div className="company-card">
              <div className="img-placeholder"></div>
              <p>삼성전자, 온디바이스 AI 시장 선점 가속화</p>
              <span className="card-label">제조/전자</span>
            </div>
          </div>
        </div>

        {/* 오른쪽: URL 입력 (AI 기능 연동) */}
        <div className="box-panel url-cta-panel">
          <h3 className="cta-title">
            블로그, 깃허브 <strong>URL</strong>로<br/>
            <strong>30초</strong>만에 자소서 생성!
          </h3>
          <div className="url-input-group">
            <input 
              type="text" 
              placeholder="네이버 블로그 URL 입력" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGoToResume()}
            />
            <button onClick={handleGoToResume} className="arrow-up-btn">↑</button>
          </div>
        </div>
      </section>

      {/* 하단 추천 기업 섹션 */}
      <section className="home-bottom-section">
        <h2 className="section-title">나에게 맞는 기업 분석</h2>
        <div className="company-grid-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="box-panel company-card-large" onClick={() => router.push('/company')}>
              <div className="img-placeholder-large"></div>
              <p className="company-name-placeholder">추천 기업 {i}</p>
              <p className="company-desc-placeholder">현직자들이 말하는 실제 기업 문화 분석</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
