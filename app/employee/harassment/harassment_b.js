(function () {
  const API_URL = "/api/employee/harassment/analyze";
  const sampleText = "\ud300\uc7a5\uc774 \uc624\ub298\ub3c4 \ub2e8\ud1a1\ubc29\uc5d0\uc11c \ubb34\ub2a5\ud558\ub2e4\uace0 \uacf5\uac1c\uc801\uc73c\ub85c \ub9dd\uc2e0\uc744 \uc92c\uace0 \uc57c\uadfc \uc548 \ud558\uba74 \uc778\uc0ac\ud3c9\uac00 \ubd88\uc774\uc775\uc744 \uc8fc\uaca0\ub2e4\uace0 \uacc4\uc18d \ud611\ubc15\ud588\uc2b5\ub2c8\ub2e4.";

  function fallbackAnalyze(text) {
    const dangerWords = ["\ubb34\ub2a5", "\ud611\ubc15", "\ubd88\uc774\uc775", "\uc57c\uadfc", "\ub9dd\uc2e0", "\uacc4\uc18d"];
    const hits = dangerWords.filter((word) => text.includes(word));
    const score = Math.min(92, 28 + hits.length * 11);
    return {
      probability_score: score,
      risk_level: score >= 75 ? "high" : score >= 45 ? "medium" : "low",
      criteria: [
        { name: "\uc6b0\uc704\uc131", matched: text.includes("\ud300\uc7a5") || text.includes("\uc0c1\uc0ac"), score: 70, evidence: ["\uc0c1\uae09\uc790 \uc5b8\uae09"] },
        { name: "\uc5c5\ubb34 \uad00\ub828\uc131", matched: text.includes("\uc57c\uadfc") || text.includes("\uc5c5\ubb34"), score: 68, evidence: ["\uadfc\ubb34 \uad00\ub828 \ud45c\ud604"] },
        { name: "\uc801\uc815\ubc94\uc704 \ucd08\uacfc", matched: hits.length > 1, score: 82, evidence: hits },
        { name: "\uc815\uc2e0\uc801 \uace0\ud1b5", matched: text.includes("\ub9dd\uc2e0") || text.includes("\ud611\ubc15"), score: 76, evidence: ["\uacf5\uac1c \ubaa8\uc695 \ub610\ub294 \ud611\ubc15"] }
      ],
      recommended_actions: [
        "\uc6d0\ubcf8 \ucea1\ucc98, \ub0a0\uc9dc, \ub300\ud654 \uc0c1\ub300\ub97c \ubcf4\uc874\ud558\uc138\uc694.",
        "\ubc18\ubcf5 \ud589\uc704\uac00 \uc788\ub2e4\uba74 \ud0c0\uc784\ub77c\uc778\uc744 \uc815\ub9ac\ud558\uc138\uc694.",
        "\ud544\uc694\ud558\uba74 \ub178\ubb34\uc0ac \ub610\ub294 \uacf5\uc2dd \uc0c1\ub2f4 \ucc44\ub110\uc744 \uac80\ud1a0\ud558\uc138\uc694."
      ],
      warnings: ["Backend API connection was not available, so local preview scoring was used."]
    };
  }

  async function analyze(text, file) {
    try {
      const form = new FormData();
      if (text) form.append("message_text", text);
      if (file) form.append("image", file);
      const response = await fetch(API_URL, { method: "POST", body: form });
      if (!response.ok) throw new Error("Request failed");
      return await response.json();
    } catch (error) {
      return fallbackAnalyze(text);
    }
  }

  function renderResult(root, data) {
    const result = root.querySelector(".hb-result");
    result.hidden = false;
    result.innerHTML = `
      <div class="hb-score-row">
        <div class="hb-score" style="--score: ${data.probability_score}%">${data.probability_score}</div>
        <div>
          <span class="hb-risk">${data.risk_level}</span>
          <h2>\ub178\ub3d9\ubc95\uc0c1 \uad34\ub86d\ud798 \uc131\ub9bd \uac00\ub2a5\uc131</h2>
          <p>${(data.warnings || []).join(" ")}</p>
        </div>
      </div>
      <div class="hb-grid">
        ${(data.criteria || []).map((item) => `
          <article class="hb-criterion">
            <strong>${item.name} · ${item.score || 0}</strong>
            <p>${(item.evidence || []).join(", ") || "\uac10\uc9c0\ub41c \uadfc\uac70\uac00 \uc801\uc2b5\ub2c8\ub2e4."}</p>
          </article>
        `).join("")}
      </div>
      <section class="hb-actions">
        <h3>\ucd94\ucc9c \ub300\uc751</h3>
        <ul>${(data.recommended_actions || []).map((item) => `<li>${item}</li>`).join("")}</ul>
      </section>
    `;
  }

  function render() {
    const root = document.querySelector("[data-harassment-backend-root]") || document.body;
    root.innerHTML = `
      <main class="hb-shell">
        <header class="hb-top">
          <div>
            <h1>AI \uc99d\uac70 \uc9c4\ub2e8\uae30</h1>
            <p>\ubb38\uc790 \ucea1\ucc98\ub098 \ud14d\uc2a4\ud2b8\ub97c \ub123\uc73c\uba74 \ucd08\uae30 \uc704\ud5d8\ub3c4\ub97c \ubcf4\uc5ec\uc90d\ub2c8\ub2e4.</p>
          </div>
          <button class="hb-button secondary" type="button" data-sample>\uc608\uc2dc \ub123\uae30</button>
        </header>
        <section class="hb-card hb-form">
          <textarea placeholder="\uc5ec\uae30\uc5d0 \ub300\ud654 \ub0b4\uc6a9\uc744 \ubd99\uc5ec\ub123\uc73c\uc138\uc694."></textarea>
          <div class="hb-side">
            <label class="hb-file">
              <span>\ubb38\uc790 \ucea1\ucc98 \uc5c5\ub85c\ub4dc</span>
              <input type="file" accept="image/*">
            </label>
            <button class="hb-button" type="button" data-analyze>\ubd84\uc11d\ud558\uae30</button>
          </div>
        </section>
        <section class="hb-card hb-result" hidden></section>
      </main>
    `;

    const textArea = root.querySelector("textarea");
    const fileInput = root.querySelector("input[type='file']");
    root.querySelector("[data-sample]").addEventListener("click", () => {
      textArea.value = sampleText;
    });
    root.querySelector("[data-analyze]").addEventListener("click", async () => {
      const data = await analyze(textArea.value.trim(), fileInput.files[0]);
      renderResult(root, data);
    });
  }

  document.addEventListener("DOMContentLoaded", render);
})();
