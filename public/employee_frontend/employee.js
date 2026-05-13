(function () {
  const routes = {
    harassment: "/employee_frontend/harassment.html",
    probono: "/employee_frontend/probono.html",
    headhunt: "/employee_frontend/headhunt.html",
    extra: "#"
  };

  const cards = [
    {
      key: "harassment",
      title: "\uc9c1\uc7a5 \ub0b4 \uad34\ub86d\ud798 \ub300\uc751 \uc13c\ud130",
      section: "section-top-left",
      bg: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80"
    },
    {
      key: "headhunt",
      title: "\uc2a4\ub9c8\ud2b8 \uc774\uc9c1 \uc81c\uc548",
      section: "section-top-right",
      bg: "/employee_frontend/headhunt.png"    },
    {
      key: "probono",
      title: "\ud504\ub85c\ud398\uc154\ub110 \uc7ac\ub2a5 \uae30\ubd80",
      section: "section-bottom-left",
      bg: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80"
    },
    {
      key: "extra",
      title: "\ub300\ub098\ubb34\uc232",
      section: "section-bottom-right",
      bg: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80"
    }
  ];

  function goTo(key) {
    if (key === "extra") {
      alert("\ud604\uc7ac \uc900\ube44 \uc911\uc785\ub2c8\ub2e4. \uc870\uae08\ub9cc \uae30\ub2e4\ub824\uc8fc\uc138\uc694!");
      return;
    }
    const route = routes[key];
    if (!route || route === "#") return;
    window.location.href = route;
  }

  function render() {
    const root = document.querySelector("[data-employee-root]") || document.body;
    root.innerHTML = `
      <a href="/" class="floating-home-btn" aria-label="메인 홈으로 가기">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </a>

      <main class="employee-shell">
        <section class="employee-grid" aria-label="employee services"></section>

        <div class="center-logo-box">
          <svg viewBox="0 0 300 90" width="240" height="72" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="78" font-family="'Arial Black', sans-serif" font-size="86" font-weight="900" fill="#4DEB28" letter-spacing="-3">job팜</text>
            <text x="232" y="78" font-family="'Arial Black', sans-serif" font-size="86" font-weight="900" fill="#c47a1e">+</text>
          </svg>
          <p class="logo-sub">재직자를 위한 맞춤형 AI 컨설턴트</p>
        </div>
      </main>
    `;

    const grid = root.querySelector(".employee-grid");
    cards.forEach((card) => {
      const button = document.createElement("button");
      button.className = `employee-card ${card.section}`;
      button.type = "button";
      button.dataset.route = card.key;
      button.style.backgroundImage = `url('${card.bg}')`;
      button.innerHTML = `
        <div class="overlay"></div>
        <span class="section-title">${card.title}</span>
      `;
      button.addEventListener("click", () => goTo(card.key));
      grid.appendChild(button);
    });
  }

  document.addEventListener("DOMContentLoaded", render);
})();
