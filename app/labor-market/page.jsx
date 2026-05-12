'use client'
import { useState, useEffect } from 'react'

export default function LaborMarketPage() {
  const [data, setData] = useState(null)
  const [selectedIndustry, setSelectedIndustry] = useState('전체')
  const [selectedTab, setSelectedTab] = useState(null)

  useEffect(() => {
    fetch('/result.json')
      .then(r => r.json())
      .then(setData)
  }, [])

  if (!data) return <div style={styles.loading}>불러오는 중...</div>

  const industries = data.industries
  const filtered = selectedIndustry === '전체'
    ? industries
    : industries.filter(i => i.industry === selectedIndustry)

  const industryLabels = {
    '전체': '전체',
    '금융권': '🏦 금융권',
    'IT_SW': '💻 IT SW',
    'IT_HW': '🖥 IT HW',
    '바이오': '🧬 바이오',
    '엔터': '🎬 엔터',
  }

  const barColor = (score) => {
    if (score >= 60) return 'linear-gradient(90deg, #7C3AED, #3B82F6)'
    if (score >= 40) return 'linear-gradient(90deg, #6D28D9, #8B5CF6)'
    return 'linear-gradient(90deg, #4C1D95, #7C3AED)'
  }

  const trendStyle = (trend) => {
    if (trend === '긍정적') return { background: 'rgba(124,58,237,0.3)', color: '#A78BFA', border: '1px solid rgba(167,139,250,0.4)' }
    if (trend === '부정적') return { background: 'rgba(239,68,68,0.2)', color: '#FCA5A5', border: '1px solid rgba(252,165,165,0.3)' }
    return { background: 'rgba(99,102,241,0.2)', color: '#C4B5FD', border: '1px solid rgba(196,181,253,0.3)' }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      {selectedTab ? (
        <div style={styles.inner}>
          <button style={styles.backBtn} onClick={() => setSelectedTab(null)}>← 전체 보기</button>

          <div style={styles.detailHeaderCard}>
            <div style={styles.detailTop}>
              <div>
                <div style={styles.detailIndustryName}>{industryLabels[selectedTab.industry] || selectedTab.industry}</div>
                <div style={styles.scoreBig}>{selectedTab.score}<span style={styles.scoreUnit}>점</span></div>
              </div>
              <span style={{ ...styles.badge, ...trendStyle(selectedTab.trend) }}>
                {selectedTab.emoji} {selectedTab.trend}
              </span>
            </div>
            <div style={styles.barWrap}>
              <div style={{ ...styles.bar, width: `${selectedTab.score}%`, background: barColor(selectedTab.score) }} />
            </div>
            <div style={styles.metaRow}>
              <span>분석 기사 {selectedTab.news_count}건</span>
              <span>주가 {selectedTab.stock_change}</span>
            </div>
          </div>

          <div style={styles.sectionLabel}>점수 구성</div>
          <div style={styles.card}>
            <div style={styles.scoreBreakRow}>
              <span style={styles.breakLabel}>뉴스 감성 (70%)</span>
              <span style={styles.breakVal}>긍정 {selectedTab.positive_pct}% · 중립 {selectedTab.neutral_pct}% · 부정 {selectedTab.negative_pct}%</span>
            </div>
            <div style={styles.segBar}>
              <div style={{ width: `${selectedTab.positive_pct}%`, background: 'linear-gradient(90deg,#7C3AED,#3B82F6)', height: '100%' }} />
              <div style={{ width: `${selectedTab.neutral_pct}%`, background: 'rgba(255,255,255,0.15)', height: '100%' }} />
              <div style={{ width: `${selectedTab.negative_pct}%`, background: 'rgba(239,68,68,0.6)', height: '100%' }} />
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.scoreBreakRow}>
              <span style={styles.breakLabel}>주가 등락 (30%)</span>
              <span style={{ fontWeight: 500, color: selectedTab.stock_change?.startsWith('+') ? '#A78BFA' : '#FCA5A5' }}>
                {selectedTab.stock_change?.startsWith('+') ? '▲' : '▼'} {selectedTab.stock_change}
              </span>
            </div>
          </div>

          {selectedTab.hero_news?.title && (
            <>
              <div style={styles.sectionLabel}>오늘의 주요 기사</div>
              <a href={selectedTab.hero_news.link || '#'} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <div style={styles.heroCard}>
                  <div style={styles.heroImg}>
                    <span style={styles.heroImgLabel}>{industryLabels[selectedTab.industry]} · 주요 기사</span>
                  </div>
                  <div style={styles.heroBody}>
                    <div style={styles.tagRow}>
                      <span style={{ ...styles.badge, ...trendStyle('긍정적') }}>🟢 긍정</span>
                    </div>
                    <div style={styles.heroTitle}>{selectedTab.hero_news.title}</div>
                    <div style={styles.heroMeta}>{selectedTab.hero_news.date} · 감성 점수 {selectedTab.hero_news.sentiment_score}점</div>
                  </div>
                </div>
              </a>
            </>
          )}

          {selectedTab.top5_news?.length > 0 && (
            <>
              <div style={styles.sectionLabel}>TOP 5 기사</div>
              <div style={styles.card}>
                {selectedTab.top5_news.map((news, idx) => (
                  <a key={idx} href={news.link || '#'} target="_blank" rel="noreferrer" style={styles.newsItem}>
                    <span style={styles.newsRank}>{news.rank || idx + 1}</span>
                    <span style={styles.newsTitle}>{news.title || '제목 없음'}</span>
                    <span style={{ ...styles.badge, fontSize: 10, ...trendStyle(news.sentiment === 'positive' ? '긍정적' : '부정적') }}>
                      {news.sentiment === 'positive' ? '🟢' : '🔴'}
                    </span>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

      ) : (
        <div style={styles.inner}>
          <div style={styles.pageHeader}>
            <h1 style={styles.pageTitle}>노동시장 전망</h1>
            <span style={styles.updatedAt}>{data.updated_at} 기준</span>
          </div>

          <div style={styles.tabRow}>
            {Object.entries(industryLabels).map(([key, label]) => (
              <button
                key={key}
                style={{ ...styles.tab, ...(selectedIndustry === key ? styles.tabActive : {}) }}
                onClick={() => setSelectedIndustry(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={styles.sectionLabel}>업종별 채용 전망 랭킹</div>
          {filtered.map((item) => (
            <div key={item.industry} style={styles.rankCard} onClick={() => setSelectedTab(item)}>
              <div style={styles.rankCardTop}>
                <span style={styles.rankName}>{industryLabels[item.industry] || item.industry}</span>
                <span style={{ ...styles.badge, ...trendStyle(item.trend) }}>
                  {item.emoji} {item.trend}
                </span>
              </div>
              <div style={styles.barWrap}>
                <div style={{ ...styles.bar, width: `${item.score}%`, background: barColor(item.score) }} />
              </div>
              <div style={styles.rankCardSub}>
                <span>전망 점수 {item.score}점</span>
                <span>주가 {item.stock_change}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  wrap: { minHeight: '100vh', background: 'linear-gradient(135deg, #0F0C29 0%, #1a1040 50%, #0d1b4b 100%)', position: 'relative', overflow: 'hidden', fontFamily: 'sans-serif' },
  bgGlow1: { position: 'absolute', top: '-200px', left: '-200px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)', pointerEvents: 'none' },
  bgGlow2: { position: 'absolute', bottom: '-200px', right: '-200px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)', pointerEvents: 'none' },
  inner: { maxWidth: 520, margin: '0 auto', padding: '2rem 1rem', position: 'relative', zIndex: 1 },
  loading: { textAlign: 'center', padding: '3rem', color: '#A78BFA' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  pageTitle: { fontSize: 24, fontWeight: 600, color: '#ffffff', margin: 0, background: 'linear-gradient(90deg, #A78BFA, #60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  updatedAt: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  tabRow: { display: 'flex', gap: 8, marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: 4 },
  tab: { fontSize: 13, padding: '6px 14px', borderRadius: 20, border: '1px solid rgba(167,139,250,0.3)', background: 'rgba(124,58,237,0.1)', cursor: 'pointer', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.6)' },
  tabActive: { background: 'linear-gradient(90deg, #7C3AED, #3B82F6)', color: '#fff', borderColor: 'transparent' },
  sectionLabel: { fontSize: 11, fontWeight: 500, color: 'rgba(167,139,250,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, marginTop: 20 },
  rankCard: { border: '1px solid rgba(124,58,237,0.3)', borderRadius: 16, padding: '1rem 1.2rem', marginBottom: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' },
  rankCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  rankName: { fontSize: 15, fontWeight: 500, color: '#ffffff' },
  rankCardSub: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6 },
  badge: { fontSize: 11, padding: '3px 10px', borderRadius: 20 },
  barWrap: { background: 'rgba(255,255,255,0.1)', borderRadius: 4, height: 5 },
  bar: { height: 5, borderRadius: 4, transition: 'width 0.5s' },
  backBtn: { fontSize: 13, color: 'rgba(167,139,250,0.8)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0 },
  detailHeaderCard: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 16, padding: '1.2rem', marginBottom: 8, backdropFilter: 'blur(10px)' },
  detailTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  detailIndustryName: { fontSize: 12, color: 'rgba(167,139,250,0.7)', marginBottom: 4 },
  scoreBig: { fontSize: 40, fontWeight: 700, color: '#ffffff' },
  scoreUnit: { fontSize: 20, fontWeight: 400, marginLeft: 2 },
  metaRow: { display: 'flex', gap: 16, fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8 },
  card: { border: '1px solid rgba(124,58,237,0.25)', borderRadius: 12, padding: '0.9rem 1rem', marginBottom: 10, background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)' },
  scoreBreakRow: { display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 },
  breakLabel: { color: 'rgba(196,181,253,0.8)', fontSize: 12 },
  breakVal: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  segBar: { display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden' },
  heroCard: { border: '1px solid rgba(124,58,237,0.3)', borderRadius: 16, overflow: 'hidden', marginBottom: 10, cursor: 'pointer', background: 'rgba(255,255,255,0.04)' },
  heroImg: { background: 'linear-gradient(135deg, #7C3AED, #3B82F6)', height: 80, display: 'flex', alignItems: 'flex-end', padding: '0.6rem 0.9rem' },
  heroImgLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  heroBody: { padding: '0.8rem 1rem' },
  tagRow: { display: 'flex', gap: 6, marginBottom: 8 },
  heroTitle: { fontSize: 14, fontWeight: 500, lineHeight: 1.5, marginBottom: 6, color: '#ffffff' },
  heroMeta: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  newsItem: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '0.5rem 0', borderBottom: '1px solid rgba(124,58,237,0.2)', textDecoration: 'none', color: 'inherit' },
  newsRank: { fontSize: 12, fontWeight: 500, color: 'rgba(167,139,250,0.7)', minWidth: 16 },
  newsTitle: { fontSize: 12, flex: 1, lineHeight: 1.5, color: 'rgba(255,255,255,0.85)' },
}