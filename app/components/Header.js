import Image from 'next/image';

export default function Header() {
  return (
    <header className="main-header">
      <div className="header-content">
        <h1 className="brand-title">job팜</h1>
        <p className="brand-subtitle">구직자와 재직자를 위한 프리미엄 AI 서비스</p>
      </div>
    </header>
  );
}
