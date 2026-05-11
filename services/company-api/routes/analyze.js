// services/company-api/routes/analyze.js

import { Router } from 'express';
import OpenAI from 'openai';
import {
  searchCorpCode,
  fetchCorpInfo,
  fetchFinancialStatements,
  extractKeyFinancials,
} from '../lib/dart.js';

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function scoreToLabel(score) {
  if (score >= 80) return '우수';
  if (score >= 60) return '보통';
  if (score >= 40) return '주의';
  return '위험';
}

function toHundredMillion(amountStr) {
  const num = parseInt((amountStr || '0').replace(/,/g, ''), 10);
  if (isNaN(num)) return '정보없음';
  return `${Math.round(num / 100000000).toLocaleString()}억원`;
}

router.post('/', async (req, res) => {
  const { companyName, corpCode: inputCorpCode } = req.body;
  console.log('🔍 [1] 요청 수신:', companyName);

  if (!companyName) {
    return res.status(400).json({ error: '기업명을 입력해주세요.' });
  }

  try {
    let corpCode = inputCorpCode;
    if (!corpCode) {
      const results = await searchCorpCode(companyName);
      console.log('🏢 [2] corp_code 검색 결과:', results);
      if (!results.length) {
        return res.status(404).json({ error: `"${companyName}"에 해당하는 DART 등록 기업을 찾을 수 없습니다.` });
      }
      corpCode = results[0].corp_code;
      console.log('✅ [2] corp_code 확보:', corpCode);
    }

    const corpInfo = await fetchCorpInfo(corpCode);
    console.log('✅ [3] 기업정보 조회 성공:', corpInfo.corp_name);

    const currentYear = new Date().getFullYear();
    let financials = null;
    let usedYear = null;

    for (const year of [currentYear - 1, currentYear - 2]) {
      try {
        console.log(`📊 [4] 재무제표 조회 시도: ${year}년`);
        const list = await fetchFinancialStatements(corpCode, String(year));
        if (list.length > 0) {
          financials = extractKeyFinancials(list);
          usedYear = year;
          console.log('✅ [4] 재무제표 조회 성공:', usedYear);
          break;
        }
      } catch (e) {
        console.log(`❌ [4] ${year}년 재무제표 실패:`, e.message);
        continue;
      }
    }

    if (!financials) {
      financials = {
      revenue: '0', operatingProfit: '0', netIncome: '0',
      totalAssets: '0', totalDebt: '0', equity: '0', rawList: [],
    };
    usedYear = '-';
    console.log('⚠️ [4] 재무제표 없음 — 공란으로 진행');
  }

    console.log('🤖 [5] OpenAI 분석 시작');

    // 4. OpenAI 재무 분석
    const financialSummary = `
기업명: ${companyName}
기준연도: ${usedYear}
매출액: ${toHundredMillion(financials.revenue)}
영업이익: ${toHundredMillion(financials.operatingProfit)}
당기순이익: ${toHundredMillion(financials.netIncome)}
자산총계: ${toHundredMillion(financials.totalAssets)}
부채총계: ${toHundredMillion(financials.totalDebt)}
자본총계: ${toHundredMillion(financials.equity)}
주요 계정과목:
${financials.rawList.map((r) => `- ${r.sj_nm} / ${r.account_nm}: ${r.thstrm_amount}`).join('\n')}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      max_tokens: 1000,
      messages: [
        {
          role: 'system',
          content: `당신은 취업 준비생을 위한 기업 재무 분석 전문가입니다.
주어진 재무제표 데이터를 바탕으로 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.
{
  "overallScore": <0~100 정수, 재무건전성 종합 점수>,
  "oneLineSummary": <직장인 관점에서 이 회사에 대한 솔직한 한줄평, 20자 이내>,
  "ratings": {
    "financialHealth": <0~100, 재무 건전성>,
    "orgStability": <0~100, 조직 안정성>,
    "growthPotential": <0~100, 성장 가능성>,
    "jobFit": <0~100, 직무 적합도>
  },
  "financialDetail": {
    "earningsLevel": <"높음"|"보통"|"낮음">,
    "stability": <"안정"|"보통"|"불안정">,
    "cashFlow": <"양호"|"보통"|"주의">
  },
  "avgSalary": <예상 평균 연봉 만원 단위 정수, 정보 없으면 null>,
  "turnoverRisk": <"낮음"|"보통"|"높음">
}`,
        },
        {
          role: 'user',
          content: `다음 재무 정보를 분석해주세요:\n${financialSummary}`,
        },
      ],
    });

    // 5. AI 응답 파싱
    const rawText = completion.choices[0].message.content;
    let aiResult;
    try {
      const clean = rawText.replace(/```json|```/g, '').trim();
      aiResult = JSON.parse(clean);
    } catch {
      console.error('AI 응답 파싱 실패:', rawText);
      return res.status(500).json({ error: 'AI 분석 결과 파싱에 실패했습니다.' });
    }

    // 6. 응답 조립
    const score = aiResult.overallScore ?? 50;

    return res.status(200).json({
      name: companyName,
      corpCode,
      category: corpInfo.induty_code || '미분류',
      location: corpInfo.adres || '',
      founded: corpInfo.est_dt ? corpInfo.est_dt.substring(0, 4) : '',
      homepageUrl: corpInfo.hm_url || '',
      ceoName: corpInfo.ceo_nm || '',
      score,
      scoreLabel: scoreToLabel(score),
      financials: {
        revenue: toHundredMillion(financials.revenue),
        operatingProfit: toHundredMillion(financials.operatingProfit),
        netIncome: toHundredMillion(financials.netIncome),
        totalAssets: toHundredMillion(financials.totalAssets),
        totalDebt: toHundredMillion(financials.totalDebt),
        equity: toHundredMillion(financials.equity),
        year: usedYear,
      },
      avgSalary: aiResult.avgSalary ? `${aiResult.avgSalary.toLocaleString()}만원` : '정보없음',
      turnoverRate: aiResult.turnoverRisk,
      oneLineSummary: `"${aiResult.oneLineSummary}"`,
      ratings: [
        { label: '재무 건전성', value: aiResult.ratings?.financialHealth ?? 50 },
        { label: '조직 안정성', value: aiResult.ratings?.orgStability ?? 50 },
        { label: '성장 가능성', value: aiResult.ratings?.growthPotential ?? 50 },
        { label: '직무 적합도', value: aiResult.ratings?.jobFit ?? 50 },
      ],
      financialDetail: aiResult.financialDetail,
    });
  } catch (err) {
    console.error('[/company/analyze] 오류:', err);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

export default router;
