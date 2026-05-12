(function () {
  function openBackend() {
    window.location.href = "probono_backend.html";
  }

  function render() {
    const root = document.querySelector("[data-probono-root]") || document.body;
    root.innerHTML = `
      <main class="probono-shell">
        <h1 class="probono-title">\ud504\ub85c\ud398\uc154\ub110 \uc7ac\ub2a5 \uae30\ubd80</h1>
        <section class="probono-list">
          <div class="probono-row">
            <div class="probono-tags">
              <span>IT</span><span>\uadf8\ub9ac\uace0</span><span>\uc0ac\ud68c\uc801 \uac00\uce58</span>
            </div>
            <button class="probono-item" type="button">
              <h2>\ube44\uc601\ub9ac \ub2e8\uccb4 \ud648\ud398\uc774\uc9c0 \ubcf4\uc218</h2>
              <p>\uc704\uce58 : Seoul, Pildong-ro 39a</p>
              <p>\ud544\uc694\ud55c \uc9c1\ubb34 \uc5ed\ub7c9 : python, HTML, C++</p>
              <p>\uc778\uc815 \ubd09\uc0ac\uc2dc\uac04 : 6H</p>
              <div class="probono-art splash" aria-hidden="true"></div>
            </button>
          </div>
          <div class="probono-row">
            <div class="probono-tags">
              <span>Business</span><span>\uadf8\ub9ac\uace0</span><span>\uc0ac\ud68c\uc801 \uac00\uce58</span>
            </div>
            <button class="probono-item" type="button">
              <h2>\ubd80\ub3d9\uc0b0 \ud558\uc704\uacc4\uce35 \uad00\ub9ac</h2>
              <p>\uc704\uce58 : Incheon, Namdong-gu</p>
              <p>\ud544\uc694\ud55c \uc9c1\ubb34 \uc5ed\ub7c9 : \uacf5\uc778\uc911\uac1c\uc0ac \uc790\uaca9\uc99d(2000\ub144 \uc774\ud6c4)</p>
              <p>\uc778\uc815 \ubd09\uc0ac\uc2dc\uac04 : 4H / day</p>
              <div class="probono-art glow" aria-hidden="true"></div>
            </button>
          </div>
        </section>
        <section class="probono-search-head">
          <div>
            <small>\u2699\ufe0f \ub0b4 \uc9c1\ubb34\ub85c \ud560 \uc218 \uc788\ub294 \ubd09\uc0ac \ucc3e\uae30</small>
            <h2>\ub514\uc9c0\ud138 \ubd09\uc0ac \uc218\ucca9</h2>
            <p>\ud544\uc694 \uc2dc\uac04 \ubc0f \ub0b4 \ud65c\uc6a9 \uc544\uc774\ud504\ub85c\uc2a4\ud2b8 \uad6c\uae00 \uc0f5\ub54c\uc9c0\uc640 \uc5ed\ub7c9\ub3d9\uc5b4 \uad00\ub9ac</p>
          </div>
          <div class="probono-controls">
            <select aria-label="category">
              <option>Category</option>
              <option>IT</option>
              <option>Business</option>
            </select>
            <button type="button">Search</button>
          </div>
        </section>
        <section class="probono-testimonials">
          <button class="probono-quote" type="button"><strong>Andi Antenna</strong><small>Director of Air Logistics</small><p>Your expectations will fly sky high with Namedy. I felt like I was soaring.</p></button>
          <button class="probono-quote" type="button"><strong>Sally Spiracle</strong><small>Nest Founder</small><p>When we began building this colony, I was skeptical about how we could make sure the right bugs would find us to join in.</p></button>
          <button class="probono-quote" type="button"><strong>Dee Doodlebug</strong><small>Life Cycle Manager</small><p>Namedy's tools for managing our identity through many stages of development impressed me.</p></button>
        </section>
        <section class="probono-mileage">
          <div>
            <h2>\ubd09\uc0ac \ub9c8\uc77c\ub9ac\uc9c0</h2>
            <p>friendly neighborhood level \ud83d\udc4c</p>
            <span class="probono-pill">144H</span>
            <span class="probono-pill light">564,300p</span>
          </div>
          <div class="probono-flower" aria-hidden="true"></div>
        </section>
      </main>
    `;

    root.querySelectorAll("button, .probono-item").forEach((button) => {
      button.addEventListener("click", openBackend);
    });
  }

  document.addEventListener("DOMContentLoaded", render);
})();
