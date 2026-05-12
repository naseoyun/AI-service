// services/company-api/lib/saramin.js

import { chromium } from 'playwright';

export async function fetchSaraminHot(limit = 20) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('https://www.saramin.co.kr/zf_user/jobs/hot100', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    await page.waitForSelector('.list_item', { timeout: 15000 });

    const items = await page.evaluate((limit) => {
      const results = [];
      const cards = document.querySelectorAll('.list_item');

      for (let i = 0; i < Math.min(cards.length, limit); i++) {
        const card = cards[i];

        const companyEl =
          card.querySelector('.corp_name') ||
          card.querySelector('.company_name') ||
          card.querySelector('[class*="company"]');

        const titleEl =
          card.querySelector('.job_tit') ||
          card.querySelector('.title') ||
          card.querySelector('[class*="title"]');

        const categoryEl =
          card.querySelector('.job_sector') ||
          card.querySelector('.sector') ||
          card.querySelector('[class*="sector"]');

        const company = companyEl?.textContent?.trim() || '';
        const jobTitle = titleEl?.textContent?.trim() || '';
        const category = categoryEl?.textContent?.trim() || '';

        if (company) results.push({ rank: i + 1, company, jobTitle, category });
      }
      return results;
    }, limit);

    return items;
  } finally {
    await browser.close();
  }
}
