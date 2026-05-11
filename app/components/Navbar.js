'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Navbar.css';

export default function Navbar() {
  const pathname = usePathname();
  
  const isActive = (path) => pathname === path;

  return (
    <div className="navbar-wrapper">
      <header className="navbar-container">
        <div className="navbar-logo">
          <Link href="/">job<span>팜</span></Link>
        </div>
        <nav className="navbar-menu">
          <Link href="/resume" className={`menu-item ${isActive('/resume') ? 'active' : ''}`}>
            자소서 분석
          </Link>
          <Link href="/company" className={`menu-item ${isActive('/company') ? 'active' : ''}`}>
            기업 분석
          </Link>
          <Link href="/market" className={`menu-item ${isActive('/market') ? 'active' : ''}`}>
            노동시장 예측
          </Link>
          <Link href="/employee" className={`menu-item ${isActive('/employee') ? 'active' : ''}`}>
            재직자
          </Link>
        </nav>
      </header>
      <div className="navbar-divider"></div>
    </div>
  );
}
