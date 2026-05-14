(function () {
  const API_URL = "/api/headhunt/pipeline";
  const acceptBase = "/api/headhunt/offers";

  const fallback = {
    total_count: 3,
    active_count: 3,
    accepted_count: 1,
    columns: [
      { stage: "offer_received", label: "Offer received", count: 2, offers: [
        { id: "demo-1", company_name: "Nexora Labs", position_title: "Backend Engineer", location: "Seoul Gangnam", salary_range: "KRW 6,500 - 8,200", progress_percent: 0 },
        { id: "demo-2", company_name: "Orbit Commerce", position_title: "Platform Developer", location: "Remote", salary_range: "KRW 5,500 - 7,000", progress_percent: 0 }
      ] },
      { stage: "accepted", label: "Accepted", count: 1, offers: [
        { id: "demo-3", company_name: "Bluefin AI", position_title: "AI Product Engineer", location: "Pangyo", salary_range: "KRW 7,000 - 9,500", progress_percent: 14 }
      ] },
      { stage: "first_interview", label: "First interview", count: 0, offers: [] },
      { stage: "negotiation", label: "Compensation negotiation", count: 0, offers: [] }
    ],
    offers: []
  };

  async function fetchPipeline() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Request failed");
      return await response.json();
    } catch (error) {
      return fallback;
    }
  }

  async function acceptOffer(id) {
    try {
      await fetch(`${acceptBase}/${id}/accept`, { method: "POST" });
    } catch (error) {
      alert("Preview mode: backend is not connected yet.");
    }
  }

  function renderPipeline(root, data) {
    root.querySelector(".hhb-stats").innerHTML = `
      <article class="hhb-stat"><strong>${data.total_count}</strong><span>\ubc1b\uc740 \uc81c\uc548</span></article>
      <article class="hhb-stat"><strong>${data.active_count}</strong><span>\uc9c4\ud589 \uc911</span></article>
      <article class="hhb-stat"><strong>${data.accepted_count}</strong><span>\uc218\ub77d\ud55c \uc81c\uc548</span></article>
    `;

    root.querySelector(".hhb-columns").innerHTML = (data.columns || []).map((column) => `
      <section class="hhb-column">
        <h2>${column.label}<span>${column.count}</span></h2>
        ${(column.offers || []).map((offer) => `
          <article class="hhb-offer">
            <h3>${offer.company_name}</h3>
            <p>${offer.position_title}</p>
            <p>${offer.location || ""} · ${offer.salary_range || ""}</p>
            <div class="hhb-progress" aria-label="progress"><span style="--progress: ${offer.progress_percent || 0}%"></span></div>
            <button type="button" data-accept="${offer.id}">\uc81c\uc548 \uc218\ub77d</button>
          </article>
        `).join("")}
      </section>
    `).join("");

    root.querySelectorAll("[data-accept]").forEach((button) => {
      button.addEventListener("click", async () => {
        await acceptOffer(button.dataset.accept);
        renderPipeline(root, await fetchPipeline());
      });
    });
  }

  async function render() {
    const root = document.querySelector("[data-headhunt-backend-root]") || document.body;
    root.innerHTML = `
      <main class="hhb-shell">
        <header class="hhb-header">
          <div>
            <h1>\uc774\uc9c1 \uc81c\uc548 \ud30c\uc774\ud504\ub77c\uc778</h1>
            <p>\ubc1b\uc740 \uc81c\uc548\uacfc \uba74\uc811 \uc9c4\ud589 \ub2e8\uacc4\ub97c \ud55c \ub208\uc5d0 \ud655\uc778\ud569\ub2c8\ub2e4.</p>
          </div>
          <button class="hhb-button" type="button">\uc0c8\ub85c\uace0\uce68</button>
        </header>
        <section class="hhb-stats"></section>
        <section class="hhb-columns"></section>
      </main>
    `;

    root.querySelector(".hhb-button").addEventListener("click", async () => {
      renderPipeline(root, await fetchPipeline());
    });
    renderPipeline(root, await fetchPipeline());
  }

  document.addEventListener("DOMContentLoaded", render);
})();
