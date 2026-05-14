/*메인 화면입니다*/

'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import './Home.css';

const RECOMMENDED = [
  { name: '삼성전자', desc: '반도체·가전 글로벌 1위', color: 'linear-gradient(135deg, #1428A0 0%, #4169E1 100%)', img: 'https://i.namu.wiki/i/XSIOAAJo3KQI6q9CtG7Zs35kWdJDGJytIUResnjEOP4v3Z5MpOXUD9KUkg3BrcdqZKNiH73iP9u3bATIX87Fhg.svg' },
  { name: '네이버', desc: 'AI·플랫폼 국내 1위', color: 'linear-gradient(135deg, #03C75A 0%, #027A38 100%)', img: 'https://i.namu.wiki/i/O_WfY01sM81pAk50fxe-CgHx-pVnipkiexM-biFWhdIBezk7_xJfDiu7P8hzraM5oNm0r92GCaXrfoZ14RNHVg.svg' },
  { name: 'LG전자', desc: '가전·전자 글로벌 선두', color: 'linear-gradient(135deg, #A50034 0%, #E0003A 100%)', img: 'https://i.namu.wiki/i/uegeGGdGwLUoZq34ddYdG5LJ3RrIR2n6Whncq5lWNi9p85iJtQB0F0wAV8M6ofNzkHcFrGBOnzIGDBThzNbzsg.svg' },
  { name: 'SK하이닉스', desc: '메모리 반도체 선두', color: 'linear-gradient(135deg, #EA0029 0%, #FF6B6B 100%)', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/SK_Hynix.svg/1280px-SK_Hynix.svg.png' },
];

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

  const handleTabClick = (tab) => {
    if (tab.id === 'market') {
      router.push('/labor-market');
      return;
    }
  };

  return (
    <main className="home-content">
      <section className="home-top-section">
        {/* 왼쪽: 트렌드 섹션 */}
        <div className="box-panel hot-companies-panel" style={{ cursor: 'pointer' }} onClick={() => router.push('/market')}>
          <h2 className="panel-title">요즘 뜨는 기업은?</h2>
          <div className="company-grid-3">
            <div className="company-card">
              <div className="img-placeholder" style={{ background: 'url("https://witground.com/wp-content/uploads/2025/09/%EC%9D%B8%EA%B3%B5%EC%A7%80%EB%8A%A5AI%EC%9D%B4%EB%9E%80-%EB%AC%B4%EC%97%87%EC%9D%B8%EA%B0%80-%EC%B4%88%EB%B3%B4%EC%9E%90%EB%A5%BC-%EC%9C%84%ED%95%9C-%EA%B0%9C%EB%85%90-%EC%A0%95%EB%A6%AC.jpg") center/contain no-repeat' }}></div>
              <p>올해 상장사 중 42%가 AI 기술을 도입했어요</p>
            </div>
            <div className="company-card">
              <div className="img-placeholder" style={{ background: 'url("https://pds.joongang.co.kr/news/component/htmlphoto_mmdata/202106/03/84463395-bda8-4ca6-8f6e-ad5a24460a4a.jpg") center/contain no-repeat' }}></div>
              <p>네이버, 초거대 AI '하이퍼클로바X' 생태계 확장</p>
              <span className="card-label">IT/SW</span>
            </div>
            <div className="company-card">
              <div className="img-placeholder" style={{ background: 'url("https://cdn.straightnews.co.kr/news/photo/202304/229187_130575_134.jpg") center/cover no-repeat' }}></div>
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
              placeholder="지금 바로 쓰러가기"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGoToResume()}
            />
            <button onClick={handleGoToResume} className="go-btn">go</button>
          </div>
        </div>
      </section>

      {/* 하단 추천 기업 섹션 */}
      <section className="home-bottom-section">
        <h2 className="section-title">나에게 맞는 기업 분석</h2>
        <div className="company-grid-4">
          {RECOMMENDED.map((company) => (
            <div
              key={company.name}
              className="box-panel company-card-large"
              style={{ cursor: 'pointer' }}
              onClick={() => router.push(`/company?name=${encodeURIComponent(company.name)}`)}
            >
              <div className="img-placeholder-large" style={{ 
                background: `url("${company.img}") center/60% no-repeat`,
                backgroundColor: '#f1f1f1'
              }}></div>
              <p className="company-name-placeholder">{company.name}</p>
              <p className="company-desc-placeholder">{company.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
