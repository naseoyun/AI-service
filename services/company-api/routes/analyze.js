// services/company-api/routes/analyze.js

import { Router } from 'express';
import OpenAI from 'openai';
import {
  searchCorpCode,
  fetchCorpInfo,
  fetchFinancialStatements,
  extractKeyFinancials,
  fetchEmployeeStatus, // ✅ 추가
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

// ✅ 추가: 직원현황 숫자 파싱 헬퍼
function parseNum(str) {
  return parseInt((str || '0').replace(/,/g, ''), 10) || 0;
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

    // ✅ 추가: 직원현황 조회
    let employeeStatus = null;
    try {
      const empYear = usedYear !== '-' ? String(usedYear) : String(currentYear - 1);
      const empList = await fetchEmployeeStatus(corpCode, empYear);
      console.log('✅ [4-2] 직원현황 조회 성공');

      if (empList && empList.length) {
        const male   = empList.filter(e => e.sexdstn === '남');
        const female = empList.filter(e => e.sexdstn === '여');

        const sum = (list, key) => list.reduce((acc, e) => acc + parseNum(e[key]), 0);

        const totalMale     = sum(male,   'sm');
        const totalFemale   = sum(female, 'sm');
        const regularMale   = sum(male,   'rgllbr_co');
        const regularFemale = sum(female, 'rgllbr_co');
        const contractMale  = sum(male,   'cnttk_co');
        const contractFemale= sum(female, 'cnttk_co');

        // 평균 근속·급여는 첫 번째 행 기준 (전체 합산 행)
        const refRow =
          empList.find(e => e.fo_bbm === '성별합계' && e.jan_salary_am && e.jan_salary_am !== '-') ||
          empList.find(e => e.fo_bbm === '합계' && e.jan_salary_am && e.jan_salary_am !== '-') ||
          empList.find(e => e.jan_salary_am && e.jan_salary_am !== '-') ||
          empList[0];

        employeeStatus = {
          total:        totalMale + totalFemale,
          totalMale,
          totalFemale,
          regular:      regularMale + regularFemale,
          contract:     contractMale + contractFemale,
          avgTenure:    refRow?.avrg_cnwk_sdytrn || null,
          avgMonthSalary: refRow?.jan_salary_am
            ? `${Math.round(parseNum(refRow.jan_salary_am) / 12 / 10000).toLocaleString()}만원`
            : null,
        };
       console.log(`[디버그]: 평균 급여: ${employeeStatus.avgMonthSalary}`);
       console.log(`[디버그] refRow:`, JSON.stringify(refRow, null, 2));
       console.log('[디버그] fo_bbm 목록:', empList.map(e => `${e.fo_bbm}(${e.sexdstn})`));
       console.log('[디버그] 급여 있는 행:', 
        empList
          .filter(e => e.jan_salary_am && e.jan_salary_am !== '-')
          .map(e => `${e.fo_bbm}(${e.sexdstn}): ${e.jan_salary_am}`)
      );


      }
    } catch (e) {
      console.log('⚠️ [4-2] 직원현황 조회 실패:', e.message);
    }

    console.log('🤖 [5] OpenAI 분석 시작');

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
                "salaryComment": <얼마나 잘벌까? 에 대한 답을 영업이익 및 영업이익률, 자기자본이익률, 당기순이익을 기반으로 분석해. 3줄 이내.">,
                "stabilityComment": <얼마나 튼튼할까? 에 대한 한줄 평가, 20자 이내. 예: "부채비율 낮고 자본 탄탄">,
                "revenueComment": <돈이 얼마나 오갈까? 에 대한 한줄 평가, 20자 이내. 예: "연매출 70조, 국내 최상위">
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

    const rawText = completion.choices[0].message.content;
    let aiResult;
    try {
      const clean = rawText.replace(/```json|```/g, '').trim();
      aiResult = JSON.parse(clean);
    } catch {
      console.error('AI 응답 파싱 실패:', rawText);
      return res.status(500).json({ error: 'AI 분석 결과 파싱에 실패했습니다.' });
    }

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
      employeeStatus, // ✅ 추가
    });
  } catch (err) {
    console.error('[/company/analyze] 오류:', err);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

export default router;
