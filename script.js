const NOTES_JSON_URL = "https://raw.githubusercontent.com/anuprasnepal/notes-storage/refs/heads/main/pdfs/notes.json";

  let allNotes = [];
  let activeFilter = "all";

  async function init() {
    try {
      const res = await fetch(NOTES_JSON_URL);
      if (!res.ok) throw new Error("Failed to fetch notes.json");
      allNotes = await res.json();
      buildFilters();
      renderNotes();
      updateTimestamp();
    } catch (e) {
      document.getElementById("grid").innerHTML =
        `<div class="state-msg">⚠ Could not load notes. Check your JSON URL.</div>`;
    }
  }

  function buildFilters() {
    const subjects = ["all", ...new Set(allNotes.map(n => n.subject).filter(Boolean))];
    const container = document.getElementById("filter-btns");
    container.innerHTML = subjects.map(s =>
      `<button class="filter-btn ${s === "all" ? "active" : ""}"
               data-subject="${s}"
               onclick="setFilter('${s}')">${s}</button>`
    ).join("");
  }

  function setFilter(subject) {
    activeFilter = subject;
    document.querySelectorAll(".filter-btn").forEach(b =>
      b.classList.toggle("active", b.dataset.subject === subject)
    );
    renderNotes();
  }

function renderNotes() {
  const query = document.getElementById("search").value.toLowerCase();

  let filtered = allNotes
    .filter(n => activeFilter === "all" || n.subject === activeFilter)
    .filter(n =>
      n.title.toLowerCase().includes(query) ||
      (n.subject || "").toLowerCase().includes(query)
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  document.getElementById("note-count").textContent =
    `${filtered.length} note${filtered.length !== 1 ? "s" : ""}`;

  const grid = document.getElementById("grid");

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="state-msg">No notes found.</div>`;
    return;
  }

  grid.innerHTML = filtered.map((note, i) => {
    // 🛠️ THE FIX: Added '/gh' after the domain and simplified the swap
    const viewableUrl = note.url
      .replace("raw.githubusercontent.com", "cdn.jsdelivr.net/gh")
      .replace("/refs/heads/", "@");

    return `
      <div class="card" style="animation-delay:${i * 40}ms"
           onclick="window.open('${viewableUrl}', '_blank')">
        ${note.subject ? `<div class="card-subject">${note.subject}</div>` : ""}
        <div class="card-title">${note.title}</div>
        <div class="card-date">${formatDate(note.date)}</div>
        <span class="card-open">Open in Browser Viewer →</span>
      </div>
    `;
  }).join("");
}
  function formatDate(dateStr) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric"
    });
  }

  function updateTimestamp() {
    document.getElementById("last-updated").textContent =
      "Fetched: " + new Date().toLocaleTimeString();
  }

  init();