// services/company-api/lib/dart.js
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DART_KEY = process.env.DART_API_KEY;
const BASE = 'https://opendart.fss.or.kr/api';

export async function searchCorpCode(companyName) {
  const xml = readFileSync(join(__dirname, '../CORPCODE.xml'), 'utf-8');

  const parseBlock = (block) => {
    const get = (tag) => block.match(new RegExp(`<${tag}>([^<]*)<\\/${tag}>`))?.[1]?.trim() || '';
    return {
      corp_code: get('corp_code'),
      corp_name: get('corp_name'),
      stock_code: get('stock_code'),
    };
  };

  const blocks = [...xml.matchAll(/<list>([\s\S]*?)<\/list>/g)].map(m => parseBlock(m[0]));

  const exact = blocks.filter(c => c.corp_name === companyName);
  if (exact.length) return exact;

  const fuzzy = blocks.filter(c => c.corp_name.includes(companyName));
  return fuzzy.slice(0, 5);
}

export async function fetchCorpInfo(corpCode) {
  const url = new URL(`${BASE}/company.json`);
  url.searchParams.set('crtfc_key', DART_KEY);
  url.searchParams.set('corp_code', corpCode);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== '000') throw new Error(`DART 기업개황 오류: ${data.message}`);
  return data;
}

export async function fetchFinancialStatements(
  corpCode,
  bsnsYear = '2023',
  reprtCode = '11011',
  fsDiv = 'CFS'
) {
  const url = new URL(`${BASE}/fnlttSinglAcntAll.json`);
  url.searchParams.set('crtfc_key', DART_KEY);
  url.searchParams.set('corp_code', corpCode);
  url.searchParams.set('bsns_year', bsnsYear);
  url.searchParams.set('reprt_code', reprtCode);
  url.searchParams.set('fs_div', fsDiv);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== '000') {
    if (fsDiv === 'CFS') {
      return fetchFinancialStatements(corpCode, bsnsYear, reprtCode, 'OFS');
    }
    throw new Error(`DART 재무제표 오류: ${data.message}`);
  }

  return data.list || [];
}

export function extractKeyFinancials(statementList) {
  const income = statementList.filter((s) => s.sj_div === 'IS' || s.sj_div === 'CIS');
  const balance = statementList.filter((s) => s.sj_div === 'BS');

  const getAmount = (list, keyword) => {
    const item = list.find((s) => s.account_nm?.includes(keyword));
    return item?.thstrm_amount || '0';
  };

  return {
    revenue: getAmount(income, '매출액'),
    operatingProfit: getAmount(income, '영업이익'),
    netIncome: getAmount(income, '당기순이익'),
    totalAssets: getAmount(balance, '자산총계'),
    totalDebt: getAmount(balance, '부채총계'),
    equity: getAmount(balance, '자본총계'),
    rawList: statementList.slice(0, 30),
  };
}

// ✅ 추가: 직원현황 조회
export async function fetchEmployeeStatus(corpCode, bsnsYear = '2023', reprtCode = '11011') {
  const url = new URL(`${BASE}/empSttus.json`);
  url.searchParams.set('crtfc_key', DART_KEY);
  url.searchParams.set('corp_code', corpCode);
  url.searchParams.set('bsns_year', bsnsYear);
  url.searchParams.set('reprt_code', reprtCode);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== '000') return null;
  return data.list || [];
}
