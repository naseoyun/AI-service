import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const { type, resultText, url } = await req.json();
    
    const feedbackData = {
      timestamp: new Date().toISOString(),
      type,
      url,
      preview: resultText.substring(0, 100) + '...'
    };

    // 로컬 파일에 저장 (DB 대신)
    const filePath = path.join(process.cwd(), 'feedback.json');
    let existingData = [];
    
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      existingData = JSON.parse(fileContent);
    }
    
    existingData.push(feedbackData);
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json({ error: '피드백 저장 중 오류 발생' }, { status: 500 });
  }
}
