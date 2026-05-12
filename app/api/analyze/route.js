import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as cheerio from 'cheerio';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { url, additionalInfo, action, originalText, revisionPrompt } = await req.json();

    // 1. 자소서 수정 로직
    if (action === 'revise') {
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini", // 원래 사용하던 모델명으로 복구
        messages: [
          { role: "system", content: "당신은 전문 자소서 컨설턴트입니다. 사용자의 요청에 따라 자소서를 자연스럽고 전문적으로 수정해주세요." },
          { role: "user", content: `다음 자소서를 수정해주세요.\n\n[원본]\n${originalText}\n\n[수정요청]\n${revisionPrompt}` }
        ],
      });
      return NextResponse.json({ result: completion.choices[0].message.content });
    }

    // 2. 블로그 크롤링 로직 (기존 안정 버전 방식)
    let blogContent = '';
    if (url && url.includes('blog.naver.com')) {
      try {
        const response = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        const html = await response.text();
        const $ = cheerio.load(html);
        const iframeSrc = $('#mainFrame').attr('src');
        if (iframeSrc) {
          const iframeRes = await fetch(`https://blog.naver.com${iframeSrc}`);
          const iframeHtml = await iframeRes.text();
          const $content = cheerio.load(iframeHtml);
          blogContent = $content('.se-main-container').text() || $content('#postViewArea').text();
        }
      } catch (e) {
        console.error('Crawl failed');
      }
    }

    // 3. 자소서 생성 프롬프트 (500자 완성형)
    const systemPrompt = `당신은 10년 차 전문 취업 컨설턴트입니다. 
제공된 정보를 바탕으로 매력적인 [소제목]과 STAR 기법이 적용된 완성된 '500자 분량의 자기소개서'를 작성하세요. 
주제만 나열하지 말고 실제 제출 가능한 수준의 본문을 만들어야 합니다.`;

    const userPrompt = `
[분석 자료]
- 블로그 내용: ${blogContent || '없음'}
- 추가 경험 정보: ${additionalInfo || '없음'}

위 정보를 바탕으로 완성된 500자 자기소개서 1항목을 작성해 주세요.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini", // 원래 사용하던 모델명으로 복구
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
    });

    return NextResponse.json({ result: completion.choices[0].message.content });
  } catch (error) {
    console.error('API Error Details:', error);
    return NextResponse.json({ error: '분석 중 오류가 발생했습니다. 모델 권한이나 설정을 확인해주세요.' }, { status: 500 });
  }
}
