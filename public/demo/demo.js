"use strict";

const panelTitles = {
  overview: "Visão geral",
  health: "Saúde",
  weight: "Peso",
  medications: "Medicamentos",
  vaccines: "Vacinas",
  documents: "Documentos",
  alerts: "Avisos"
};

const nav = document.getElementById("demoNav");
const panelTitle = document.getElementById("panelTitle");
const toast = document.getElementById("demoToast");

let toastTimer = null;

function showPanel(panelName) {
  const targetPanel = document.querySelector(
    `[data-panel-content="${panelName}"]`
  );

  if (!targetPanel) {
    return;
  }

  document
    .querySelectorAll("[data-panel-content]")
    .forEach((panel) => {
      const isTarget = panel === targetPanel;
      panel.hidden = !isTarget;
      panel.classList.toggle("is-active", isTarget);
    });

  document
    .querySelectorAll("[data-panel]")
    .forEach((button) => {
      const isActive = button.dataset.panel === panelName;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-current", isActive ? "page" : "false");
    });

  panelTitle.textContent = panelTitles[panelName] || "Demonstração";

  const url = new URL(window.location.href);
  url.searchParams.set("aba", panelName);
  window.history.replaceState({}, "", url);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showDemoToast(
  message = "Esta ação está bloqueada e nenhuma informação será alterada."
) {
  const messageElement = toast.querySelector("span");
  messageElement.textContent = message;

  toast.classList.add("is-visible");

  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3200);
}

nav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-panel]");

  if (!button) {
    return;
  }

  showPanel(button.dataset.panel);
});

document.addEventListener("click", (event) => {
  const shortcut = event.target.closest("[data-go]");

  if (shortcut) {
    showPanel(shortcut.dataset.go);
    return;
  }

  const writeAction = event.target.closest(".demo-write");

  if (writeAction) {
    event.preventDefault();
    showDemoToast();
    return;
  }

  const documentButton = event.target.closest(".demo-document");

  if (documentButton) {
    event.preventDefault();
    showDemoToast(
      "Visualização simulada: nenhum arquivo real é aberto nesta demonstração."
    );
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    toast.classList.remove("is-visible");
  }
});

const initialPanel = new URLSearchParams(window.location.search).get("aba");

if (initialPanel && panelTitles[initialPanel]) {
  showPanel(initialPanel);
}

window.setTimeout(() => {
  showDemoToast(
    "Explore as abas livremente. Esta é uma demonstração somente leitura."
  );
}, 900);
