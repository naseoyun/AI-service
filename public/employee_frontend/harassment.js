(function () {
  const EVIDENCE_RECORDS = [
    { id: 1, title: '\uc0ac\uac74\uae30\ub85d\uc7a5', content: '\ub0b4\uc6a9' },
    { id: 2, title: '\uc0ac\uac74\uae30\ub85d\uc7a5', content: '\ub0b4\uc6a9' },
  ];

  const FEATURE_CARDS = [
    {
      gradient: 'gradient-green',
      title: '\uc99d\uac70 \uc218\uc9d1 \uccb4\ud06c\ub9ac\uc2a4\ud2b8',
      desc: '6\ud558\uc6d0\uce59\uc5d0 \ub530\ub978 \uc77c\uc9c0 \uc791\uc131 \uac00\uc774\ub4dc',
      route: 'harassment_backend.html',
    },
    {
      gradient: 'gradient-brown',
      title: 'AI \uc99d\uac70 \uc9c4\ub2e8\uae30',
      desc: '\uc5c5\ub85c\ub4dc\ud55c \uce74\ud1a1 \ucea1\ucc98\ub098 \ub179\ucde8\ub85d \ubb38\uc7a5\uc744 \ubd84\uc11d\ud574 \uac00\ub2a5\uc131\uc744 \uc218\uce58\ud654',
      route: 'harassment_backend.html',
    },
    {
      gradient: 'gradient-teal',
      title: '\ud604 \uc0c1\ud669 \uc785\ub825\ub780',
      desc: '\uc5b8\uc5b4\ud3ed\ub825, \ub530\ub3cc\ub9bc, \uc0ac\uc801 \uc2ec\ubd80\ub984 \ub4f1',
      route: 'harassment_backend.html',
    },
  ];

  function render() {
    const root = document.querySelector('[data-harassment-root]') || document.body;
    root.innerHTML = `
      <div class="report-page" style="position:relative;">

        <button class="report-back-btn" onclick="history.back()">\ub4a4\ub85c\uac00\uae30</button>

        <section class="harassment-hero">
          <div class="hero-overlay"></div>
          <div class="hero-content">
            <h1 class="hero-title">\uc9c1\uc7a5 \ub0b4 \uad34\ub86d\ud798 \ub300\uc751 \uc13c\ud130</h1>
            <p class="hero-sub">\uc804\ubb38\uac00\uc640 \ud568\uaed8\ud558\ub294 \uc9c1\uc7a5 \ub0b4 \uad34\ub86d\ud798 \ub300\uc751</p>
          </div>
          <div class="incident-card">
            <h3 class="incident-label">\uc0ac\uac74 \uae30\ub85d</h3>
            <textarea class="incident-textarea" placeholder="\uc791\uc131" id="incident-input"></textarea>
          </div>
        </section>

        <section class="evidence-section">
          <h2 class="section-title">\uc99d\uac70 \uc790\ub8cc \uae30\ub85d</h2>
          <div class="evidence-grid" id="evidence-grid"></div>
        </section>

        <section class="feature-section">
          <div class="feature-grid" id="feature-grid"></div>
        </section>

        <section class="community-section">
          <p class="community-tag">\ub178\ubb34\uc0ac Q&amp;A</p>
          <h2 class="community-title">\uc775\uba85 \uc0c1\ub2f4 \ucee4\ubba4\ub2c8\ud2f0</h2>
          <p class="community-desc">\ub178\ubb34\uc0ac\ub2d8\uaed8 \uc9c8\ubb38\ud574\ubcf4\uc138\uc694. 48\uc2dc\uac04 \ub0b4\uc5d0 \uc751\ub2f5\uc744 \ubc1b\uc73c\uc2e4 \uc218 \uc788\uc2b5\ub2c8\ub2e4.</p>
        </section>

      </div>
    `;

    // 증거 카드
    const evidenceGrid = root.querySelector('#evidence-grid');
    EVIDENCE_RECORDS.forEach((rec) => {
      const card = document.createElement('div');
      card.className = 'evidence-card';
      card.innerHTML = `
        <div class="evidence-card-top">
          <div class="evidence-dot"></div>
          <span class="evidence-card-title">${rec.title}</span>
        </div>
        <p class="evidence-card-content">${rec.content}</p>
      `;
      evidenceGrid.appendChild(card);
    });

    // 기능 카드
    const featureGrid = root.querySelector('#feature-grid');
    FEATURE_CARDS.forEach((card) => {
      const el = document.createElement('div');
      el.className = 'feature-card';
      el.innerHTML = `
        <div class="feature-thumb ${card.gradient}"></div>
        <div class="feature-body">
          <h3 class="feature-title">${card.title}</h3>
          <p class="feature-desc">${card.desc}</p>
          <button class="feature-cta">Call to action <span class="cta-arrow">→</span></button>
        </div>
      `;
      el.querySelector('.feature-cta').addEventListener('click', () => {
        window.location.href = card.route;
      });
      featureGrid.appendChild(el);
    });
  }

  document.addEventListener('DOMContentLoaded', render);
})();
