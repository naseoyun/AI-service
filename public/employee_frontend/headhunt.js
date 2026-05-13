(function () {
  function render() {
    const root = document.querySelector('[data-headhunt-root]') || document.body;
    root.innerHTML = `
      <div class="jobchange-page" style="position:relative;">

        <button class="jc-back-btn" onclick="history.back()">\ub4a4\ub85c\uac00\uae30</button>

        <!-- 히어로 섹션 -->
        <section class="headhunt-hero">
          <div class="headhunt-hero-overlay"></div>
          <div class="headhunt-hero-content">
            <h1 class="headhunt-title">\uc2a4\ub9c8\ud2b8 \uc774\uc9c1 \uc81c\uc548</h1>
            <p class="headhunt-subtitle">\ub354 \uc88b\uc740 \uc870\uac74\uc5d0\uc11c \uc77c\ud574\ubcf4\uc544\uc694!</p>
          </div>

          <!-- 메인 카드 -->
          <div class="headhunt-main-card">

            <!-- 이직 목록 행 -->
            <div class="headhunt-row">
              <div class="headhunt-text-block">
                <h2 class="headhunt-block-title">\uc774\uc9c1 \ubaa9\ub85d</h2>
                <p class="headhunt-block-desc">
                  \ubc1b\uc740 \uc774\uc9c1 \uc81c\uc548 \ubaa9\ub85d<br>
                  \uc9c1\ubb34, \uc5f0\ubd09\ubc94\uc704, \uc81c\uc548 \uba54\uc2dc\uc9c0\ub97c \ud655\uc778\ud560 \uc218\uc788\uc5b4\uc694!
                </p>
                <p class="headhunt-block-desc headhunt-step">
                  \uc774\uc9c1 \uc81c\uc548 \uc218\ub77d \ud6c4 \uba74\uc811 \uc9c4\ud589 \ub2e8\uacc4<br>
                  \uc81c\uc548 → \uc11c\ub958\ud1b5\uacfc → \uba74\uc811 → \ucd5c\uc885 \uc624\ud37c
                </p>
                <button class="headhunt-btn-dark">\ubc14\ub85c\uac00\uae30</button>
              </div>
              <div class="headhunt-thumb headhunt-thumb-pink-dots"></div>
            </div>

            <!-- Profile Editor 행 -->
            <div class="headhunt-row">
              <div class="headhunt-thumb headhunt-thumb-gradient-pink"></div>
              <div class="headhunt-text-block">
                <h2 class="headhunt-block-title headhunt-block-title-en">Profile Editor</h2>
                <p class="headhunt-block-desc">\uae30\uc874 \uc790\uc18c\uc11c &amp; AI \uac00\uacf5 \uc790\uc18c\uc11c</p>
                <button class="headhunt-btn-dark">\ubc14\ub85c\uac00\uae30</button>
              </div>
            </div>

          </div>
        </section>

        <!-- 하단 기능 카드 -->
        <section class="headhunt-features">
          <div class="headhunt-features-inner">

            <!-- 좌측 열 -->
            <div class="headhunt-feature-col">
              <div class="headhunt-feature-card">
                <div class="headhunt-feature-text">
                  <h3 class="headhunt-feature-title">\uc81c\uc548 \ud544\ud130\ub9c1</h3>
                  <p class="headhunt-feature-desc">\ud604\uc7ac \uc7ac\uc9c1 \uc911\uc778 \ud68c\uc0ac\uc640 \uc778\uc0ac\ud300\uc740 \ub0b4 \ud504\ub85c\ud544\uc744 \ubcfc \uc218 \uc5c6\uac8c \ucc28\ub2e8\ud560 \uc218\uc788\uc5b4\uc694!</p>
                </div>
                <div class="headhunt-feature-thumb headhunt-thumb-butterfly"></div>
              </div>
              <div class="headhunt-feature-card">
                <div class="headhunt-feature-text">
                  <h3 class="headhunt-feature-title">Auto - Resume Builder</h3>
                  <p class="headhunt-feature-desc">\uacfc\uac70 \uc790\uc18c\uc11c\uc640 \ud604\uc7ac \ubcf4\uc0ac \ud65c\ub3d9 \ub370\uc774\ud130\ub97c \ud569\uccd0 \uae30\uc5c5\uc6a9 \ud504\ub85c\ud544 \uc790\ub3d9 \uc0dd\uc131</p>
                </div>
                <div class="headhunt-feature-thumb headhunt-thumb-mountains"></div>
              </div>
            </div>

            <!-- 우측 열 -->
            <div class="headhunt-feature-col">
              <div class="headhunt-feature-card headhunt-feature-card-tall">
                <div class="headhunt-feature-text">
                  <h3 class="headhunt-feature-title">\uc624\ud37c \uce74\ub4dc</h3>
                  <p class="headhunt-feature-desc">\uae30\uc5c5\uc774 \uc81c\uc548\ud55c \uc5f0\ubd09 \uc0c1\uc2b9\ub960, \uc720\uc5f0 \uadfc\ubb34 \uc5ec\ubd80, \uc8fc\uc694 \ud504\ub85c\uc81d\ud2b8\ub97c \ud55c \ub208\uc5d0 \ubcfc \uc218\uc788\uc5b4\uc694!</p>
                </div>
                <div class="headhunt-feature-thumb headhunt-thumb-flower"></div>
              </div>
            </div>

          </div>
        </section>

      </div>
    `;
  }

  document.addEventListener('DOMContentLoaded', render);
})();
