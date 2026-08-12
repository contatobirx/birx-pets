"use strict";

const panelTitles = {
  emergency: "Central de emergência",
  health: "Saúde",
  id: "Carteirinha digital",
  vaccines: "Vacinas",
  documents: "Documentos",
  timeline: "Timeline",
  access: "Acessos",
  sightings: "Avistamentos",
  medications: "Medicamentos",
  weight: "Peso",
  appointments: "Agendamentos",
  routine: "Rotinas e lembretes"
};

const panelWrap = document.querySelector(".demo-panel-wrap");
const panelTitle = document.getElementById("panelTitle");
const closePanel = document.getElementById("closePanel");
const toast = document.getElementById("demoToast");
let toastTimer = null;

function showToast(message = "Esta ação está bloqueada e nenhuma informação será alterada.") {
  toast.querySelector("span").textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3000);
}

function showPanel(name) {
  const target = document.querySelector(`[data-panel-content="${name}"]`);
  if (!target) {
    showToast("Esta área estará disponível na versão completa da demonstração.");
    return;
  }

  document.querySelectorAll("[data-panel-content]").forEach((panel) => {
    const active = panel === target;
    panel.hidden = !active;
    panel.classList.toggle("is-active", active);
  });

  panelTitle.textContent = panelTitles[name] || "Prévia";
  panelWrap.classList.add("is-open");
  panelWrap.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("click", (event) => {
  const panelButton = event.target.closest("[data-panel]");
  if (panelButton) {
    showPanel(panelButton.dataset.panel);
    return;
  }

  if (event.target.closest(".demo-write")) {
    event.preventDefault();
    showToast();
  }
});

closePanel.addEventListener("click", () => {
  panelWrap.classList.remove("is-open");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

setTimeout(() => {
  showToast("Toque nas ações rápidas para explorar. Esta versão é somente leitura.");
}, 700);
