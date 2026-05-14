import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "당신은 구직자의 경험을 추출하는 전문 인터뷰어입니다. 사용자가 자신의 경험을 이야기하면, 구체적인 STAR 기법(상황, 과제, 행동, 결과)에 맞춰 내용을 보완할 수 있도록 친절하게 추가 질문을 던져주세요. 답변은 짧고 명확하게 하고, 대화를 통해 자소서에 쓸 좋은 재료를 만드는 것이 목적입니다."
        },
        ...messages
      ],
    });

    return NextResponse.json({ message: completion.choices[0].message.content });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: '대화 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
