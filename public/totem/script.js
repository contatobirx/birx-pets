"use strict";

const VIDEO_URL =
  "https://videos.birx.com.br/comercial.mp4";

const ENDING_DURATION_MS = 7000;
const VIDEO_LOAD_TIMEOUT_MS = 20000;

const video = document.getElementById("totemVideo");
const ending = document.getElementById("ending");
const loadingScreen = document.getElementById("loadingScreen");
const errorScreen = document.getElementById("errorScreen");
const startButton = document.getElementById("startButton");
const retryButton = document.getElementById("retryButton");

let endingTimer = null;
let loadingTimer = null;
let cycleRunning = false;

function showElement(element, className = "is-visible") {
  element.classList.add(className);
}

function hideElement(element, className = "is-visible") {
  element.classList.remove(className);
}

function showLoading() {
  loadingScreen.classList.remove("is-hidden");
}

function hideLoading() {
  loadingScreen.classList.add("is-hidden");
}

function showError() {
  clearTimeout(loadingTimer);

  hideLoading();
  hideElement(startButton);
  showElement(errorScreen);

  errorScreen.setAttribute("aria-hidden", "false");
}

function hideError() {
  hideElement(errorScreen);
  error