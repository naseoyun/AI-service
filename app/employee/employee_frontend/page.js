'use client';
import './Employee.css';

const EMPLOYEE_SERVICES = [
  { id: 1, title: '커리어 로드맵', desc: '현재 직무에서 시니어까지의 성장 경로를 AI가 설계해 드립니다.', icon: '🗺️' },
  { id: 2, title: '이직 기회 분석', desc: '나의 보유 기술로 이직 가능한 기업과 예상 연봉을 확인하세요.', icon: '📈' },
  { id: 3, title: '네트워킹', desc: '동종 업계 재직자들과 익명으로 소통하고 정보를 공유하세요.', icon: '🤝' },
  { id: 4, title: '스킬 업그레이드', desc: '직무 역량 강화를 위한 맞춤형 강의와 자격증을 추천합니다.', icon: '📚' },
];

export default function EmployeePage() {
  return (
    <div className="employee-page">
      <header className="employee-header">
        <span className="badge">재직자 전용</span>
        <h2>더 높은 곳을 향한 <strong>커리어 관리</strong></h2>
        <p>이미 취업하신 분들을 위한 프리미엄 성장 지원 서비스입니다.</p>
      </header>

      <div className="service-grid">
        {EMPLOYEE_SERVICES.map((service) => (
          <div key={service.id} className="service-card">
            <div className="service-icon">{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.desc}</p>
            <button className="detail-btn">시작하기</button>
          </div>
        ))}
      </div>

      <div className="banner-section">
        <div className="banner-content">
          <h3>나의 시장 가치는 얼마일까?</h3>
          <p>AI가 분석한 나의 실시간 예상 연봉 확인하기</p>
          <button className="banner-btn">분석 시작</button>
        </div>
      </div>
    </div>
  );
}
