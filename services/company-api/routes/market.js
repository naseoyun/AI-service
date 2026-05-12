// services/company-api/routes/market.js

import { Router } from 'express';
import { fetchSaraminHot } from '../lib/saramin.js';
import { searchCorpCode, fetchCorpInfo } from '../lib/dart.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // 1. 사람인 HOT100 상위 20개 크롤링
    const hotList = await fetchSaraminHot(20);

    if (!hotList.length) {
      return res.status(502).json({ error: '사람인 크롤링 결과가 없습니다.' });
    }

    // 2. DART corp_code 병렬 조회
    const withCorpCode = await Promise.all(
      hotList.map(async (item) => {
        try {
          const results = await searchCorpCode(item.company);
          const corp = results[0] || null;
          return {
            ...item,
            corpCode: corp?.corp_code || null,
            stockCode: corp?.stock_code || null,
          };
        } catch {
          return { ...item, corpCode: null, stockCode: null };
        }
      })
    );

    // 3. 기업개황 병렬 조회
    const sectors = await Promise.all(
      withCorpCode.map(async (item) => {
        const base = {
          id: item.rank,
          rank: item.rank,
          company: item.company,
          jobTitle: item.jobTitle,
          sector: item.category || '기타',
          corpCode: item.corpCode || null,
          stockCode: item.stockCode || null,
          score: null,
          scoreLabel: null,
        };

        if (!item.corpCode) return { ...base, estDt: null, ceoName: null, address: null, homepageUrl: null };

        try {
          const info = await fetchCorpInfo(item.corpCode);
          return {
            ...base,
            sector: item.category || info.induty_code || '기타',
            estDt: info.est_dt || null,
            ceoName: info.ceo_nm || null,
            address: info.adres || null,
            homepageUrl: info.hm_url || null,
          };
        } catch {
          return { ...base, estDt: null, ceoName: null, address: null, homepageUrl: null };
        }
      })
    );

    return res.status(200).json({ sectors, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[/market] 오류:', err);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

export default router;
