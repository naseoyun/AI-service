'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import './Resume.css';

function ResumeContent() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [step, setStep] = useState('input'); // 'input' | 'loading' | 'result' | 'error'
  const [resultText, setResultText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [revisionPrompt, setRevisionPrompt] = useState('');
  const [isRevising, setIsRevising] = useState(false);

  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setUrl(urlParam);
    }
  }, [searchParams]);

  const handleAnalyze = async () => {
    if (!url.trim()) return alert('URL을 입력해주세요!');
    if (!url.includes('blog.naver.com')) return alert('네이버 블로그 링크를 입력해주세요.');

    setStep('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, additionalInfo }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '분석 중 오류가 발생했습니다.');

      setResultText(data.result);
      setStep('result');
    } catch (err) {
      setErrorMsg(err.message);
      setStep('error');
    }
  };

  const handleRevise = async () => {
    if (!revisionPrompt.trim()) return;
    setIsRevising(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'revise',
          originalText: resultText,
          revisionPrompt: revisionPrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResultText(data.result);
      setRevisionPrompt('');
    } catch (err) {
      alert('수정 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setIsRevising(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resultText).then(() => alert('복사되었습니다!'));
  };

  return (
    <div className="resume-container">
      {step === 'input' && (
        <main className="resume-content">
          <div className="resume-titles">
            <h2>여러분의 모아둔 포트폴리오를 <strong>AI</strong>가 자소서로 자동 생성합니다!</h2>
            <p>블로그, 깃허브 <strong>URL</strong>로 <strong>30초</strong>만에 자소서 생성!</p>
          </div>

          <div className="input-section-wrapper">
            <div className="resume-input-pill top-pill">
              <span className="input-label">URL 입력</span>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="blog.naver.com/... 주소를 입력하세요"
              />
            </div>

            <div className="resume-input-pill bottom-pill">
              <input
                type="text"
                placeholder="AI가 더 알아야 하는 것은 없나요? (예: 지원 직무, 강조할 경험)"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
              <button className="submit-up-btn" onClick={handleAnalyze}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
                </svg>
              </button>
            </div>
          </div>
        </main>
      )}

      {step === 'loading' && (
        <div className="loading-container">
          <div className="loader"></div>
          <p>AI가 블로그 내용을 분석하여 자소서를 생성하고 있습니다...</p>
        </div>
      )}

      {step === 'result' && (
        <main className="result-content">
          <div className="result-card">
            <div className="card-header">
              <h3 className="result-title">✨ AI 자소서 추천 주제 및 분석 결과</h3>
              <button className="copy-btn" onClick={handleCopy}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
            <div className="card-body">
              {resultText.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            
            <div className="revision-section">
              <div className="revision-input-group">
                <input 
                  type="text" 
                  placeholder="수정하고 싶은 내용을 말씀해주세요 (예: 더 전문적인 어조로 바꿔줘)" 
                  value={revisionPrompt}
                  onChange={(e) => setRevisionPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRevise()}
                />
                <button onClick={handleRevise} disabled={isRevising}>
                  {isRevising ? '...' : '수정'}
                </button>
              </div>
            </div>
          </div>
          <button className="retry-btn" onClick={() => setStep('input')}>다시 생성하기</button>
        </main>
      )}

      {step === 'error' && (
        <div className="error-container">
          <p className="error-msg">⚠️ {errorMsg}</p>
          <button className="retry-btn" onClick={() => setStep('input')}>다시 시도하기</button>
        </div>
      )}
    </div>
  );
}

export default function ResumePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResumeContent />
    </Suspense>
  );
}
