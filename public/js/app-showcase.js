(() => {
  const tabs = [...document.querySelectorAll("[data-app-tab]")];
  const panels = [...document.querySelectorAll("[data-app-panel]")];
  if (!tabs.length || !panels.length) return;
  function select(name) {
    tabs.forEach((tab) => { const active=tab.dataset.appTab===name;tab.classList.toggle("is-active",active);tab.setAttribute("aria-selected",String(active)); });
    panels.forEach((panel) => { const active=panel.dataset.appPanel===name;panel.hidden=!active;panel.classList.toggle("is-active",active); });
  }
  tabs.forEach((tab) => tab.addEventListener("click", () => select(tab.dataset.appTab)));
})();
