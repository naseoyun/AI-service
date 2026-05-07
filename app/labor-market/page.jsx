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

  const trendColor = (trend) => {
    if (trend === '긍정적') return '#1a4a08'
    if (trend === '부정적') return '#6b1515'
    return '#5a3205'
  }

  const trendBg = (trend) => {
    if (trend === '긍정적') return '#c8f0a0'
    if (trend === '부정적') return '#fbc8c8'
    return '#fde8b0'
  }

  const barColor = (score) => {
    if (score >= 60) return '#639922'
    if (score >= 40) return '#BA7517'
    return '#A32D2D'
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h1 style={styles.title}>노동시장 전망</h1>
        <span style={styles.updated}>{data.updated_at} 기준</span>
      </div>

      <div style={styles.tabRow}>
        {Object.entries(industryLabels).map(([key, label]) => (
          <button
            key={key}
            style={{ ...styles.tab, ...(selectedIndustry === key ? styles.tabActive : {}) }}
            onClick={() => { setSelectedIndustry(key); setSelectedTab(null) }}
          >
            {label}
          </button>
        ))}
      </div>

      {selectedTab ? (
        <div>
          <button style={styles.backBtn} onClick={() => setSelectedTab(null)}>← 전체 보기</button>

          <div style={styles.detailHeader}>
            <div>
              <div style={styles.detailIndustryName}>{industryLabels[selectedTab.industry] || selectedTab.industry}</div>
              <div style={styles.scoreBig}>{selectedTab.score}점</div>
            </div>
            <span style={{ ...styles.badge, background: trendBg(selectedTab.trend), color: trendColor(selectedTab.trend) }}>
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

          <div style={styles.sectionLabel}>점수 구성</div>
          <div style={styles.card}>
            <div style={styles.scoreBreakRow}>
              <span style={styles.breakLabel}>뉴스 감성 (70%)</span>
              <span style={styles.breakVal}>긍정 {selectedTab.positive_pct}% · 중립 {selectedTab.neutral_pct}% · 부정 {selectedTab.negative_pct}%</span>
            </div>
            <div style={styles.segBar}>
              <div style={{ width: `${selectedTab.positive_pct}%`, background: '#639922', height: '100%' }} />
              <div style={{ width: `${selectedTab.neutral_pct}%`, background: '#888', height: '100%' }} />
              <div style={{ width: `${selectedTab.negative_pct}%`, background: '#A32D2D', height: '100%' }} />
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.scoreBreakRow}>
              <span style={styles.breakLabel}>주가 등락 (30%)</span>
              <span style={{ fontWeight: 500, color: selectedTab.stock_change?.startsWith('+') ? '#7dc44e' : '#e06060' }}>
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
                      <span style={{ ...styles.badge, background: trendBg('긍정적'), color: trendColor('긍정적') }}>🟢 긍정</span>
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
                    <span style={{
                      ...styles.newsBadge,
                      background: trendBg(news.sentiment === 'positive' ? '긍정적' : '부정적'),
                      color: trendColor(news.sentiment === 'positive' ? '긍정적' : '부정적'),
                    }}>
                      {news.sentiment === 'positive' ? '🟢' : '🔴'}
                    </span>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

      ) : (
        <div>
          <div style={styles.sectionLabel}>업종별 채용 전망 랭킹</div>
          {filtered.map((item) => (
            <div key={item.industry} style={styles.rankCard} onClick={() => setSelectedTab(item)}>
              <div style={styles.rankCardTop}>
                <span style={styles.rankName}>{industryLabels[item.industry] || item.industry}</span>
                <span style={{ ...styles.badge, background: trendBg(item.trend), color: trendColor(item.trend) }}>
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
  wrap: { maxWidth: 480, margin: '0 auto', padding: '1.5rem 1rem', fontFamily: 'sans-serif', color: '#ffffff' },
  loading: { textAlign: 'center', padding: '3rem', color: '#aaa' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  title: { fontSize: 20, fontWeight: 500, margin: 0, color: '#ffffff' },
  updated: { fontSize: 12, color: '#aaaaaa' },
  tabRow: { display: 'flex', gap: 6, marginBottom: '1rem', overflowX: 'auto', paddingBottom: 4 },
  tab: { fontSize: 13, padding: '4px 12px', borderRadius: 20, border: '1px solid #444', background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap', color: '#cccccc' },
  tabActive: { background: '#ffffff', color: '#111111', borderColor: 'transparent' },
  sectionLabel: { fontSize: 11, fontWeight: 500, color: '#aaaaaa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginTop: 16 },
  rankCard: { border: '1px solid #333', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: 10, cursor: 'pointer', background: '#1e1e1e' },
  rankCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  rankName: { fontSize: 14, fontWeight: 500, color: '#ffffff' },
  rankCardSub: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888888', marginTop: 4 },
  badge: { fontSize: 11, padding: '2px 8px', borderRadius: 20 },
  barWrap: { background: '#333', borderRadius: 4, height: 5 },
  bar: { height: 5, borderRadius: 4, transition: 'width 0.4s' },
  backBtn: { fontSize: 13, color: '#aaaaaa', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 12, padding: 0 },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  detailIndustryName: { fontSize: 12, color: '#aaaaaa', marginBottom: 4 },
  scoreBig: { fontSize: 32, fontWeight: 500, color: '#ffffff' },
  metaRow: { display: 'flex', gap: 16, fontSize: 11, color: '#888888', marginTop: 6, marginBottom: 4 },
  card: { border: '1px solid #333', borderRadius: 10, padding: '0.7rem 0.9rem', marginBottom: 8, background: '#1e1e1e' },
  scoreBreakRow: { display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 },
  breakLabel: { color: '#aaaaaa', fontSize: 12 },
  breakVal: { fontSize: 12, color: '#cccccc' },
  segBar: { display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden' },
  heroCard: { border: '1px solid #333', borderRadius: 12, overflow: 'hidden', marginBottom: 10, cursor: 'pointer' },
  heroImg: { background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', height: 70, display: 'flex', alignItems: 'flex-end', padding: '0.5rem 0.75rem' },
  heroImgLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  heroBody: { padding: '0.6rem 0.75rem', background: '#1e1e1e' },
  tagRow: { display: 'flex', gap: 6, marginBottom: 6 },
  heroTitle: { fontSize: 13, fontWeight: 500, lineHeight: 1.4, marginBottom: 4, color: '#ffffff' },
  heroMeta: { fontSize: 11, color: '#888888' },
  newsItem: { display: 'flex', alignItems: 'flex-start', gap: 8, padding: '0.4rem 0', borderBottom: '1px solid #333', textDecoration: 'none', color: 'inherit' },
  newsRank: { fontSize: 12, fontWeight: 500, color: '#888888', minWidth: 16 },
  newsTitle: { fontSize: 12, flex: 1, lineHeight: 1.4, color: '#ffffff' },
  newsBadge: { fontSize: 11, padding: '1px 6px', borderRadius: 8, flexShrink: 0 },
}