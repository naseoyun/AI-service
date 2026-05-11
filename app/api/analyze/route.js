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
      if (!originalText || !revisionPrompt) {
        return NextResponse.json({ error: '원본 텍스트와 수정 프롬프트가 필요합니다.' }, { status: 400 });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: "당신은 전문적인 자기소개서 컨설턴트입니다. 이전에 작성된 자기소개서 초안을 바탕으로, 사용자의 피드백을 반영하여 글을 완벽하게 다듬어주는 역할을 합니다."
          },
          {
            role: "user",
            content: `다음 자소서 초안을 바탕으로 사용자의 수정 요청사항을 반영해 다시 작성해주세요.\n\n[이전 자소서 초안]\n${originalText}\n\n[수정 요청사항]\n${revisionPrompt}`
          }
        ],
      });
      
      return NextResponse.json({ result: completion.choices[0].message.content });
    }

    if (!url || !url.includes('blog.naver.com')) {
      return NextResponse.json({ error: '유효한 네이버 블로그 링크를 입력해주세요.' }, { status: 400 });
    }

    // 1. 네이버 블로그 원본 페이지 가져오기
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // 2. iframe 소스 찾기 (네이버 블로그는 실제 내용이 iframe 안에 있음)
    const iframeSrc = $('#mainFrame').attr('src');
    if (!iframeSrc) {
      return NextResponse.json({ error: '블로그 내용을 찾을 수 없습니다.' }, { status: 404 });
    }

    const fullIframeUrl = `https://blog.naver.com${iframeSrc}`;
    const iframeRes = await fetch(fullIframeUrl);
    const iframeHtml = await iframeRes.text();
    const $content = cheerio.load(iframeHtml);

    // 3. 본문 텍스트 추출 (주로 .se-main-container 또는 .se-viewer 에 있음)
    const blogText = $content('.se-main-container').text() || $content('.se-viewer').text() || $content('#postViewArea').text();

    if (!blogText || blogText.trim().length < 10) {
      return NextResponse.json({ error: '블로그 본문을 읽어오지 못했습니다.' }, { status: 404 });
    }

    let userPrompt = `다음 블로그 글을 분석해줘: ${blogText.substring(0, 3000)}`;
    if (additionalInfo) {
      userPrompt += `\n\n추가 요청사항: ${additionalInfo}`;
    }

    // 4. OpenAI를 사용하여 자소서 정보 추출 및 주제 생성
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "당신은 전문 취업 컨설턴트입니다. 제공된 블로그 글 내용을 분석하여 사용자의 경험을 요약하고, 이를 기반으로 자소서 작성을 위한 핵심 주제 3가지를 간단하게 뽑아주세요. 한국어로 응답하세요."
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
    });

    const result = completion.choices[0].message.content;

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: '분석 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
