(function () {
  const routes = {
    harassment: "harassment.html",
    probono: "probono.html",
    headhunt: "headhunt.html",
    extra: "#"
  };

  const cards = [
    {
      key: "harassment",
      title: "\uc9c1\uc7a5 \ub0b4 \uad34\ub86d\ud798 \ub300\uc751 \uc13c\ud130",
      art: "harassment"
    },
    {
      key: "probono",
      title: "\ud504\ub85c\ud398\uc154\ub110 \uc7ac\ub2a5 \uae30\ubd80",
      art: "probono"
    },
    {
      key: "headhunt",
      title: "\uc2a4\ub9c8\ud2b8 \uc774\uc9c1 \uc81c\uc548",
      art: "headhunt"
    },
    {
      key: "extra",
      title: "\ub300\ub098\ubb34\uc232",
      art: "extra"
    }
  ];

  function goTo(key) {
    const route = routes[key];
    if (!route || route === "#") return;
    window.location.href = route;
  }

  function render() {
    const root = document.querySelector("[data-employee-root]") || document.body;
    root.innerHTML = `
      <main class="employee-shell">
        <h1 class="employee-title">Employees Only Page</h1>
        <section class="employee-grid" aria-label="employee services"></section>
        <footer class="employee-footer">
          <section>
            <h3>For Working Professionals,</h3>
            <p>Protect your work.</p>
            <p>Contribute your skills.</p>
            <p>Build your next opportunity.</p>
          </section>
          <section>
            <h3>Reach out</h3>
            <a href="mailto:hello@example.com">Email</a>
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">Linkedin</a>
          </section>
        </footer>
      </main>
    `;

    const grid = root.querySelector(".employee-grid");
    cards.forEach((card) => {
      const button = document.createElement("button");
      button.className = "employee-card";
      button.type = "button";
      button.dataset.route = card.key;
      button.innerHTML = `
        <div class="employee-art ${card.art}" aria-hidden="true"></div>
        <div class="employee-meta">
          <h2>${card.title}</h2>
          <span class="employee-year">2025</span>
        </div>
      `;
      button.addEventListener("click", () => goTo(card.key));
      grid.appendChild(button);
    });
  }

  document.addEventListener("DOMContentLoaded", render);
})();
