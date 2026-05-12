'use client';
import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import './Resume.css';

function ResumeContent() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: '안녕하세요! 여러분의 경험을 자소서로 만들어 드릴게요. 어떤 경험을 자소서에 녹여내고 싶으신가요? 구체적으로 말씀해 주시면 더 좋은 자소서가 나옵니다!' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [step, setStep] = useState('input'); // 'input' | 'loading' | 'result' | 'error'
  const [resultText, setResultText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [revisionPrompt, setRevisionPrompt] = useState('');
  const [isRevising, setIsRevising] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState(null); // 'like' | 'dislike' | null

  const chatEndRef = useRef(null);

  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam) setUrl(urlParam);
  }, [searchParams]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...chatMessages, { role: 'user', content: userInput }];
    setChatMessages(newMessages);
    setUserInput('');

    // AI의 간단한 리액션 (나중에 자소서 생성 시 이 대화 내용이 모두 포함됨)
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', content: '좋은 경험이네요! 더 덧붙일 내용이 있나요? 없으시다면 상단의 분석 시작 버튼을 눌러주세요.' }]);
    }, 500);
  };

  const handleAnalyze = async () => {
    setStep('loading');
    setErrorMsg('');
    setFeedbackStatus(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url, 
          // 대화 내용을 모두 합쳐서 AI에게 전달
          additionalInfo: chatMessages.map(m => `${m.role === 'user' ? '사용자' : 'AI'}: ${m.content}`).join('\n')
        }),
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

  const handleFeedback = async (type) => {
    setFeedbackStatus(type);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, resultText, url }),
      });
      alert('피드백을 보내주셔서 감사합니다!');
    } catch (err) {
      console.error('Feedback failed:', err);
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
            <p>블로그, <strong>URL</strong>로 <strong>30초</strong>만에 자소서 생성하세요!</p>
          </div>

          <div className="input-section-wrapper">
            <div className="resume-input-pill top-pill">
              <span className="input-label">URL 입력</span>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="관련 블로그나 포트폴리오 주소를 입력하세요 (선택)"
              />
              <button className="analyze-start-btn" onClick={handleAnalyze}>분석 시작</button>
            </div>

            <div className="chat-interface-container">
              <div className="chat-window">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`chat-bubble ${msg.role}`}>
                    {msg.content}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              
              <div className="resume-input-pill bottom-pill chat-input-pill">
                <input
                  type="text"
                  placeholder="AI와 대화하며 경험을 추출해 보세요..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="submit-up-btn" onClick={handleSendMessage}>
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
          <p>AI가 대화 내용과 데이터를 분석하여 최적의 자소서를 생성 중입니다...</p>
        </div>
      )}

      {step === 'result' && (
        <main className="result-content">
          <div className="result-card">
            <div className="card-header">
              <h3 className="result-title">✨ AI 자소서 분석 결과</h3>
              <div className="header-right">
                <div className="feedback-group">
                  <button 
                    className={`feedback-btn like ${feedbackStatus === 'like' ? 'active' : ''}`}
                    onClick={() => handleFeedback('like')}
                  >👍</button>
                  <button 
                    className={`feedback-btn dislike ${feedbackStatus === 'dislike' ? 'active' : ''}`}
                    onClick={() => handleFeedback('dislike')}
                  >👎</button>
                </div>
                <button className="copy-btn" onClick={handleCopy}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </div>
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
                  placeholder="수정하고 싶은 내용을 말씀해주세요..." 
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
          <button className="retry-btn" onClick={() => setStep('input')}>처음으로 돌아가기</button>
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
