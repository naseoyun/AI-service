import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const { type, url, resultText } = await req.json();
    
    const feedbackData = {
      timestamp: new Date().toISOString(),
      type,
      url,
      preview: resultText ? resultText.substring(0, 100) : ''
    };

    const filePath = path.join(process.cwd(), 'feedback.json');
    let existingData = [];
    
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        existingData = JSON.parse(fileContent);
      } catch (e) {
        existingData = [];
      }
    }
    
    existingData.push(feedbackData);
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback Save Error:', error);
    return NextResponse.json({ error: '피드백 저장 실패' }, { status: 500 });
  }
}
