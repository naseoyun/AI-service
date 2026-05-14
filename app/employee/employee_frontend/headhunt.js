(function () {
  function openBackend() {
    window.location.href = "headhunt_backend.html";
  }

  function render() {
    const root = document.querySelector("[data-headhunt-root]") || document.body;
    root.innerHTML = `
      <main class="headhunt-shell">
        <h1 class="headhunt-title">\uc2a4\ub9c8\ud2b8 \uc774\uc9c1 \uc81c\uc548</h1>
        <p class="headhunt-subtitle">\ub354 \uc88b\uc740 \uc870\uac74\uc5d0\uc11c \uc77c\ud574\ubcf4\uc544\uc694!</p>
        <div class="headhunt-hero-art" aria-hidden="true"></div>
        <nav class="headhunt-logos" aria-label="partner logos">
          <button class="headhunt-logo" type="button">Logoipsum</button>
          <button class="headhunt-logo" type="button">Logoipsum</button>
          <button class="headhunt-logo" type="button">Logoipsum</button>
          <button class="headhunt-logo" type="button">logoipsum</button>
        </nav>
        <section class="headhunt-feature">
          <div class="headhunt-copy">
            <h2>Inbox + Stack Tracker</h2>
            <p>\ubc1b\uc740 \uc774\uc9c1 \uc81c\uc548 \ud655\uc778</p>
            <p>\uc9c1\ubb34, \uc5f0\ubd09\ubc94\uc704, \uc81c\uc548 \uba54\uc2dc\uc9c0\ub97c \ud55c\ub208\uc5d0 \ucd94\uc801\ud560 \uc218 \uc788\uc5b4\uc694!</p>
            <p>\uc774\uc9c1 \uc81c\uc548 \uc218\ub77d \ud6c4 \uba74\uc811 \uc9c4\ud589 \ub2e8\uacc4</p>
            <button class="headhunt-cta" type="button">Call to action</button>
          </div>
          <div class="headhunt-art pink" aria-hidden="true"></div>
        </section>
        <section class="headhunt-feature reverse">
          <div class="headhunt-art blur" aria-hidden="true"></div>
          <div class="headhunt-copy">
            <h2>Profile Editor</h2>
            <p>\uae30\uc874 \uc790\uc18c\uc11c &amp; AI \uac00\uc7a5 \uc790\uc18c\uc11c</p>
            <button class="headhunt-cta" type="button">Call to action</button>
          </div>
        </section>
        <section class="headhunt-grid">
          <button class="headhunt-card" type="button">
            <h3>\uc81c\uc548 \ud544\ud130\ub9c1</h3>
            <p>\ud604\uc7ac \uc7ac\uc9c1 \uc911\uc778 \ud68c\uc0ac\uc640 \uc778\uc0ac\ud300\uc740 \ub0b4 \ud504\ub85c\ud544\uc744 \ubcfc \uc218 \uc5c6\uac8c \ucc28\ub2e8\ud560 \uc218 \uc788\uc5b4\uc694!</p>
          </button>
          <button class="headhunt-card tall" type="button">
            <h3>\uc624\ud37c \uce74\ub4dc</h3>
            <p>\uae30\uc5c5\uc774 \uc81c\uc548\ud55c \uc5f0\ubd09, \uae30\uc220 \uc694\uad6c, \uc8fc\uc694 \ud504\ub85c\uc81d\ud2b8\ub97c \ud55c \ub208\uc5d0 \ubcfc \uc218 \uc788\uc5b4\uc694!</p>
          </button>
          <button class="headhunt-card" type="button">
            <h3>Auto - Resume Builder</h3>
            <p>\uacfc\uac70 \uc790\uc18c\uc11c\uc640 \ud604\uc7ac \ud68c\uc0ac \uc77c\uc744 \ubd84\uc11d\ud574 \ud604\uc7ac \uae30\uc5c5\uc758 \ub9de\ucda4\ud615 \ud504\ub85c\ud544 \uc790\ub3d9 \uc0dd\uc131</p>
          </button>
        </section>
      </main>
    `;

    root.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", openBackend);
    });
  }

  document.addEventListener("DOMContentLoaded", render);
})();
