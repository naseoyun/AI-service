import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as cheerio from 'cheerio';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { url, additionalInfo, action, originalText, revisionPrompt } = await req.json();

    if (action === 'revise') {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "당신은 전문 자소서 컨설턴트입니다. 사용자의 요청에 따라 자소서를 자연스럽고 전문적으로 수정해주세요." },
          { role: "user", content: `다음 자소서를 수정해주세요.\n\n[원본]\n${originalText}\n\n[수정요청]\n${revisionPrompt}` }
        ],
      });
      return NextResponse.json({ result: completion.choices[0].message.content });
    }

    let blogContent = '';
    if (url && url.includes('blog.naver.com')) {
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      const iframeSrc = $('#mainFrame').attr('src');
      if (iframeSrc) {
        const iframeRes = await fetch(`https://blog.naver.com${iframeSrc}`);
        const iframeHtml = await iframeRes.text();
        const $content = cheerio.load(iframeHtml);
        blogContent = $content('.se-main-container').text() || $content('#postViewArea').text();
      }
    }

    const systemPrompt = `당신은 역량 중심의 자기소개서를 작성하는 전문 컨설턴트입니다. 
사용자가 제공한 블로그 내용(있을 경우)과 대화 기록을 분석하여 사용자의 핵심 경험을 추출하고, 이를 매력적인 자소서 문장으로 변환하세요.
단순히 요약하는 것이 아니라, 실제 기업에 제출할 수 있는 수준의 완성된 문장으로 작성해야 합니다.`;

    const userPrompt = `
[블로그 내용]
${blogContent}

[사용자 경험 추출 대화 기록]
${additionalInfo}

위 정보를 바탕으로 다음 항목을 포함한 자소서를 작성해주세요:
1. 지원자의 핵심 역량 요약
2. 경험을 구체적인 수치와 행동 중심으로 기술한 본문
3. 인사담당자의 눈길을 끌 수 있는 소제목
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
    });

    return NextResponse.json({ result: completion.choices[0].message.content });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json({ error: '분석 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
