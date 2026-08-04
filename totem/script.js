"use strict";

const video = document.getElementById("totemVideo");
const ending = document.getElementById("ending");
const startButton = document.getElementById("startButton");

const ENDING_DURATION = 7000;
let endingTimer = null;

function showStartButton() {
  startButton.classList.add("is-visible");
}

function hideStartButton() {
  startButton.classList.remove("is-visible");
}

function hideEnding() {
  ending.classList.remove("is-visible");
  ending.setAttribute("aria-hidden", "true");
}

function showEnding() {
  ending.classList.add("is-visible");
  ending.setAttribute("aria-hidden", "false");
}

async function playVideo() {
  clearTimeout(endingTimer);
  hideEnding();

  video.currentTime = 0;
  video.muted = true;

  try {
    await video.play();
    hideStartButton();
  } catch (error) {
    console.warn("O navegador bloqueou o autoplay:", error);
    showStartButton();
  }
}

function finishVideo() {
  video.pause();
  showEnding();

  endingTimer = setTimeout(() => {
    playVideo();
  }, ENDING_DURATION);
}

video.addEventListener("ended", finishVideo);

video.addEventListener("error", () => {
  console.error("Não foi possível carregar o arquivo comercial.mp4.");
  showStartButton();
});

startButton.addEventListener("click", playVideo);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && !ending.classList.contains("is-visible")) {
    video.play().catch(showStartButton);
  }
});

playVideo();