(function () {
  const tools = [
    {
      title: "\uc99d\uac70 \uc218\uc9d1 \uccb4\ud06c\ub9ac\uc2a4\ud2b8",
      body: "6\ud558\uc6d0\uce59\uc5d0 \ub530\ub978 \uc77c\uc9c0 \uc791\uc131 \uac00\uc774\ub4dc",
      art: "one",
      route: "harassment_backend.html"
    },
    {
      title: "AI \uc99d\uac70 \uc9c4\ub2e8\uae30",
      body: "\uc5c5\ub85c\ub4dc\ud55c \uce74\ud1a1 \ucea1\ucc98\ub098 \ub179\ucde8\ub85d \ubb38\uc7a5\uc744 \ubd84\uc11d\ud574 \uac00\ub2a5\uc131\uc744 \uc218\uce58\ud654",
      art: "two",
      route: "harassment_backend.html"
    },
    {
      title: "\ud604 \uc0c1\ud669 \uc785\ub825\ub780",
      body: "\uc5b8\uc5b4\ud3ed\ub825, \ub530\ub3cc\ub9bc, \uc0ac\uc801 \uc2ec\ubd80\ub984 \ub4f1",
      art: "three",
      route: "harassment_backend.html"
    }
  ];

  function openRoute(route) {
    window.location.href = route;
  }

  function render() {
    const root = document.querySelector("[data-harassment-root]") || document.body;
    root.innerHTML = `
      <header class="harassment-hero">
        <h1>\uc9c1\uc7a5 \ub0b4 \uad34\ub86d\ud798 \ub300\uc751 \uc13c\ud130</h1>
        <div class="harassment-actions">
          <button class="harassment-chip" type="button">\uace0\uc6a9\ub178\ub3d9\ubd80 \uc2e0\uace0 \uc5f0\uacc4</button>
          <button class="harassment-button" type="button">\ub178\ubb34\uc0ac \uac80\ud1a0 \uc2e0\uccad</button>
        </div>
        <div class="harassment-panel" aria-hidden="true"></div>
      </header>
      <section class="harassment-band">
        <div class="harassment-inner">
          <h2 class="harassment-section-title">Testimonials</h2>
          <p class="harassment-subtitle">A little line about what\u2019s being said and who\u2019s saying it.</p>
          <div class="harassment-testimonials">
            <button class="harassment-note" type="button">
              <strong>\uc0ac\uac74\uae30\ub85d\uc7a5</strong>
              <small>2026.02.07</small>
              <p>\ubd80\uc7a5\ub2d8...</p>
            </button>
            <button class="harassment-note" type="button">
              <strong>\uc99d\uac70 \uc218\uc9d1 \ud604\ud669</strong>
              <small>2026.05.01 ~</small>
              <p>\ub179\ucde8 0\uac74&nbsp; \uba54\uc2e0\uc800 5\uac74</p>
            </button>
          </div>
        </div>
      </section>
      <section class="harassment-tools"></section>
      <section class="harassment-community">
        <small>\ub178\ubb34\uc0ac Q&amp;A</small>
        <h2>\uc775\uba85 \uc0c1\ub2f4 \ucee4\ubba4\ub2c8\ud2f0</h2>
        <p>\ub178\ubb34\uc0ac\uc5d0\uac8c \uc9c8\ubb38\ud574\ubcf4\uc138\uc694. 48\uc2dc\uac04 \ub0b4\uc5d0 \uc751\ub2f5\uc744 \ubc1b\uc744 \uc218 \uc788\uc2b5\ub2c8\ub2e4.</p>
      </section>
    `;

    root.querySelectorAll(".harassment-chip, .harassment-button, .harassment-note").forEach((button) => {
      button.addEventListener("click", () => openRoute("harassment_backend.html"));
    });

    const toolWrap = root.querySelector(".harassment-tools");
    tools.forEach((tool) => {
      const button = document.createElement("button");
      button.className = "harassment-tool";
      button.type = "button";
      button.innerHTML = `
        <div class="harassment-tool-art ${tool.art}" aria-hidden="true"></div>
        <div class="harassment-tool-body">
          <h3>${tool.title}</h3>
          <p>${tool.body}</p>
          <span class="harassment-link">Call to action \u2192</span>
        </div>
      `;
      button.addEventListener("click", () => openRoute(tool.route));
      toolWrap.appendChild(button);
    });
  }

  document.addEventListener("DOMContentLoaded", render);
})();
