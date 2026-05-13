(function () {
  const VOLUNTEER_LIST = [
    {
      title: '\ube44\uc601\ub9ac \ub2e8\uccb4 \ud648\ud398\uc774\uc9c0 \ubcf4\uc218',
      category: '#IT SW',
      skills: 'python, HTML, C++',
      hours: '6H',
      location: '\uc11c\uc6b8 \uc911\uad6c \ud544\ub3d9',
    },
    {
      title: '\ubd09\uc0ac\uba85',
      category: '#\uce74\ud14c\uace0\ub9ac',
      skills: '\uac00, \ub098, \ub2e4',
      hours: '6H',
      location: '\uc704\uce58',
    },
  ];

  const TESTIMONIALS = [
    { name: 'Andi Antennae', role: 'Director of Air Logistics', color: '#f48fb1', text: 'Your expectations will fly sky high with Namedly. I felt like I was soaring.' },
    { name: 'Sally Spiracle', role: 'Nest Founder', color: '#b39ddb', text: "When we began building this colony, I was skeptical about how we could make sure the right bugs would find us to join in." },
    { name: 'Dev Doodlebug', role: 'Life Cycle Manager', color: '#80cbc4', text: "Namedly's tools for managing our identity through many stages of development were top notch." },
    { name: 'Wanda Wingleton', role: 'Nectar Marketing', color: '#ffe082', text: 'In the garden of life, some things are just very sweet. Namedly made it so easy to find the flowers we needed.' },
    { name: 'Carl Caterpillar', role: 'Head of Growth', color: '#a5d6a7', text: "I've been transformed completely. I wouldn't use any other service." },
  ];

  const TIER = { tier: 'BRONZE 3', next: '\ub2e4\uc74c \ud2f0\uc5b4\uae4c\uc9c0 1\uc2dc\uac04', hours: '144H', points: '564,300p' };

  function render() {
    const root = document.querySelector('[data-probono-root]') || document.body;
    root.innerHTML = `
      <div class="volunteer-page" style="position:relative;">

        <button class="vol-back-btn" onclick="history.back()">\ub4a4\ub85c\uac00\uae30</button>

        <!-- 히어로 섹션 -->
        <section class="vol-hero">
          <div class="vol-hero-overlay"></div>
          <h1 class="vol-hero-title">\ud504\ub85c\ud398\uc154\ub110 \uc7ac\ub2a5\uae30\ubd80</h1>

          <!-- 봉사 탐색 카드 -->
          <div class="vol-search-card">
            <h2 class="vol-search-heading">\ubd09\uc0ac \ud0d0\uc0c9</h2>
            <div class="vol-search-bar">
              <div class="vol-search-icon-grid">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="9" height="9" rx="2" fill="#bbb"/>
                  <rect x="13" y="2" width="9" height="9" rx="2" fill="#bbb"/>
                  <rect x="2" y="13" width="9" height="9" rx="2" fill="#bbb"/>
                  <rect x="13" y="13" width="9" height="9" rx="2" fill="#bbb"/>
                </svg>
              </div>
              <input type="text" class="vol-search-input" placeholder="\ub098\uc758 \uc9c1\ubb34 \uae30\ubc18 \ubd09\uc0ac \uac80\uc0c9!" id="vol-search-input">
              <button class="vol-search-btn" type="button">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b5ef4" stroke-width="2.5">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
            </div>
            <ul class="vol-list" id="vol-list"></ul>
          </div>
        </section>

        <!-- 봉사 수첩 -->
        <section class="vol-notebook-section">
          <div class="vol-section-inner">
            <h2 class="vol-section-title">\ubd09\uc0ac \uc218\ucca9</h2>
            <p class="vol-section-sub">\ud65c\ub3d9 \uc2dc\uac04 \ubc0f \ub0b4\uc6a9\uc744 \ub9c8\uc774\ud06c\ub85c\uc18c\ud504\ud2b8 / \uad6c\uae00 \uce98\ub9b0\ub354\uc640 \uc5f0\ub3d9\ud558\uc5ec \uad00\ub9ac</p>
            <div class="testimonial-grid" id="testimonial-grid"></div>
          </div>
        </section>

        <!-- 봉사 티어 -->
        <section class="vol-tier-section">
          <div class="vol-section-inner vol-tier-inner">
            <h2 class="vol-tier-title">\ubd09\uc0ac \ud2f0\uc5b4</h2>
            <div class="vol-tier-right">
              <div class="vol-tier-info">
                <p class="vol-tier-name">${TIER.tier}</p>
                <p class="vol-tier-next">${TIER.next}</p>
                <div class="vol-tier-stats">
                  <span class="vol-tier-stat dark">${TIER.hours}</span>
                  <span class="vol-tier-stat light">${TIER.points}</span>
                </div>
              </div>
              <div class="vol-trophy">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <path d="M20 10 h40 v28 a20 20 0 0 1-40 0 Z" fill="#b5651d"/>
                  <path d="M10 12 h10 v20 a10 10 0 0 1-10 0 Z" fill="#b5651d"/>
                  <path d="M60 12 h10 v20 a10 10 0 0 1-10 0 Z" fill="#b5651d"/>
                  <rect x="32" y="58" width="16" height="6" rx="2" fill="#b5651d"/>
                  <rect x="24" y="64" width="32" height="6" rx="3" fill="#b5651d"/>
                  <path d="M34 24 l4 8 l8 1 l-6 6 l1.5 8.5 L40 44l-1.5 4 L30 44l1.5-8.5 L26 29l8-1Z" fill="#e6a020" opacity="0.6"/>
                </svg>
              </div>
            </div>
          </div>
        </section>

      </div>
    `;

    // 봉사 목록 렌더링
    const volList = root.querySelector('#vol-list');
    VOLUNTEER_LIST.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'vol-item';
      li.innerHTML = `
        <div class="vol-item-left">
          <p class="vol-item-title">${item.title}</p>
          <p class="vol-item-category">${item.category}</p>
          <p class="vol-item-meta">\uc5ed\ub7c9 : ${item.skills}</p>
          <p class="vol-item-meta">\uc778\uc815 \uc2dc\uac04 : ${item.hours}</p>
        </div>
        <div class="vol-item-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5b5ef4" stroke-width="2.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5" fill="#5b5ef4" stroke="none"/>
          </svg>
          <span>${item.location}</span>
        </div>
      `;
      volList.appendChild(li);
    });

    // 후기 그리드 렌더링
    const grid = root.querySelector('#testimonial-grid');
    TESTIMONIALS.forEach((t) => {
      const card = document.createElement('div');
      card.className = 'testimonial-card';
      card.innerHTML = `
        <div class="testimonial-header">
          <div class="testimonial-avatar" style="background:${t.color};">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </div>
          <div>
            <p class="testimonial-name">${t.name}</p>
            <p class="testimonial-role">${t.role}</p>
          </div>
        </div>
        <p class="testimonial-text">${t.text}</p>
      `;
      grid.appendChild(card);
    });
  }

  document.addEventListener('DOMContentLoaded', render);
})();
