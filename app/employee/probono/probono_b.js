(function () {
  const API_URL = "/api/probono/opportunities";
  const REFRESH_URL = "/api/probono/opportunities/refresh";

  const fallback = {
    total_count: 3,
    live_fetch_attempted: false,
    live_fetch_succeeded: false,
    fallback_used: true,
    warnings: ["Preview mode: backend is not connected, so sample opportunities are shown."],
    items: [
      {
        title: "Nonprofit homepage renewal planning support",
        organization: "Seoul Community Welfare Center",
        location: "Seoul",
        portal: "sample",
        required_skills: ["Web planning", "UX writing", "Notion"],
        recognized_hours: 4,
        apply_url: "https://www.1365.go.kr/",
        summary: "Help a welfare center reorganize pages and improve content structure."
      },
      {
        title: "Career mentoring for young job seekers",
        organization: "Gyeonggi Youth Foundation",
        location: "Gyeonggi",
        portal: "sample",
        required_skills: ["Career coaching", "Resume review", "Interview coaching"],
        recognized_hours: 2,
        apply_url: "https://www.vms.or.kr/",
        summary: "Provide one-on-one mentoring using professional hiring experience."
      },
      {
        title: "Data dashboard setup for volunteer center",
        organization: "Incheon Volunteer Center",
        location: "Incheon",
        portal: "sample",
        required_skills: ["Excel", "Data visualization", "Looker Studio"],
        recognized_hours: 6,
        apply_url: "https://www.1365.go.kr/",
        summary: "Build a simple reporting dashboard for volunteer activity statistics."
      }
    ]
  };

  async function fetchOpportunities(root) {
    const location = root.querySelector("[name='location']").value.trim();
    const skill = root.querySelector("[name='skill']").value.trim();
    const portal = root.querySelector("[name='portal']").value;
    const params = new URLSearchParams({ limit: "12", include_live: "true" });
    if (location) params.set("location", location);
    if (skill) params.set("skill", skill);
    if (portal) params.set("portal", portal);

    try {
      const response = await fetch(`${API_URL}?${params.toString()}`);
      if (!response.ok) throw new Error("Request failed");
      return await response.json();
    } catch (error) {
      return fallback;
    }
  }

  async function refresh() {
    try {
      await fetch(REFRESH_URL, { method: "POST" });
    } catch (error) {
      alert("Preview mode: backend is not connected yet.");
    }
  }

  function renderItems(root, data) {
    const alert = root.querySelector(".pbb-alert");
    const warnings = data.warnings || [];
    alert.hidden = warnings.length === 0;
    alert.textContent = warnings.join(" ");

    root.querySelector(".pbb-grid").innerHTML = (data.items || []).map((item) => `
      <article class="pbb-card">
        <h2>${item.title}</h2>
        <p>${item.organization || ""}</p>
        <p>${item.location} · ${item.portal} · ${item.recognized_hours || "-"}H</p>
        <div class="pbb-tags">${(item.required_skills || []).map((skill) => `<span>${skill}</span>`).join("")}</div>
        <p>${item.summary || ""}</p>
        <a href="${item.apply_url || "#"}" target="_blank" rel="noreferrer">\uc2e0\uccad\ud558\uae30</a>
      </article>
    `).join("");
  }

  async function render() {
    const root = document.querySelector("[data-probono-backend-root]") || document.body;
    root.innerHTML = `
      <main class="pbb-shell">
        <header class="pbb-header">
          <div>
            <h1>\ubd09\uc0ac\ud65c\ub3d9 \ub9ac\uc2a4\ud2b8</h1>
            <p>1365 / VMS \ud3ec\ud138 \ud615\ud0dc\uc758 \uc7ac\ub2a5\uae30\ubd80 \uc815\ubcf4\ub97c \uc870\ud68c\ud569\ub2c8\ub2e4.</p>
          </div>
          <button class="pbb-refresh" type="button">\ud3ec\ud138 \ub2e4\uc2dc \uac00\uc838\uc624\uae30</button>
        </header>
        <section class="pbb-filters">
          <input name="location" placeholder="\uc704\uce58: Seoul, Incheon">
          <input name="skill" placeholder="\uc9c1\ubb34 \uc5ed\ub7c9: Excel, IT">
          <select name="portal" aria-label="portal">
            <option value="">All</option>
            <option value="1365">1365</option>
            <option value="vms">VMS</option>
            <option value="sample">Sample</option>
          </select>
          <button type="button" data-search>\uac80\uc0c9</button>
        </section>
        <div class="pbb-alert" hidden></div>
        <section class="pbb-grid"></section>
      </main>
    `;

    root.querySelector("[data-search]").addEventListener("click", async () => {
      renderItems(root, await fetchOpportunities(root));
    });
    root.querySelector(".pbb-refresh").addEventListener("click", async () => {
      await refresh();
      renderItems(root, await fetchOpportunities(root));
    });
    renderItems(root, await fetchOpportunities(root));
  }

  document.addEventListener("DOMContentLoaded", render);
})();
