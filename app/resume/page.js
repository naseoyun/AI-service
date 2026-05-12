'use client';
import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import './Resume.css';

function ResumeContent() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: '안녕하세요! 자소서에 담고 싶은 특별한 경험이 있나요? 저와 대화하며 경험을 구체화해 보세요. 준비가 되시면 상단의 분석 시작 버튼을 눌러주세요!' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [step, setStep] = useState('input');
  const [resultText, setResultText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [revisionPrompt, setRevisionPrompt] = useState('');
  const [isRevising, setIsRevising] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam) setUrl(urlParam);
  }, [searchParams]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isTyping) return;

    const userMsg = { role: 'user', content: userInput };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setUserInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (res.ok) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAnalyze = async () => {
    setStep('loading');
    setErrorMsg('');

    try {
      const conversation = chatMessages.map(m => `${m.role === 'user' ? '사용자' : 'AI'}: ${m.content}`).join('\n');
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, additionalInfo: conversation }),
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
            <h2>여러분의 포트폴리오를 <strong>AI</strong>가 자소서로 자동 생성합니다!</h2>
            <p>블로그, <strong>URL</strong>로 <strong>30초</strong>만에 자소서 생성하세요!</p>
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
              <button className="analyze-start-btn" onClick={handleAnalyze}>✨ 분석 시작</button>
            </div>

            <div className="chat-area-container">
              <div className="chat-history">
                {chatMessages.map((m, i) => (
                  <div key={i} className={`chat-bubble ${m.role}`}>{m.content}</div>
                ))}
                {isTyping && <div className="chat-bubble assistant typing">...</div>}
                <div ref={chatEndRef} />
              </div>
              <div className="resume-input-pill bottom-pill chat-input">
                <input
                  type="text"
                  placeholder={isTyping ? "AI가 답변을 생각 중입니다..." : "경험을 말씀해 주세요..."}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isTyping}
                />
                <button className="submit-up-btn" onClick={handleSendMessage} disabled={isTyping}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {step === 'loading' && (
        <div className="loading-container">
          <div className="loader"></div>
          <p>AI가 대화와 블로그 내용을 종합 분석하여 자소서를 집필 중입니다...</p>
        </div>
      )}

      {step === 'result' && (
        <main className="result-content">
          <div className="result-card">
            <div className="card-header">
              <h3 className="result-title">✨ AI 자소서 분석 결과</h3>
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
                  placeholder="수정 요청 사항" 
                  value={revisionPrompt}
                  onChange={(e) => setRevisionPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRevise()}
                />
                <button onClick={handleRevise} disabled={isRevising}>{isRevising ? '...' : '수정'}</button>
              </div>
            </div>
          </div>
          <button className="retry-btn" onClick={() => setStep('input')}>처음으로</button>
        </main>
      )}

      {step === 'error' && (
        <div className="error-container">
          <p className="error-msg">⚠️ {errorMsg}</p>
          <button className="retry-btn" onClick={() => setStep('input')}>다시 시도</button>
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
