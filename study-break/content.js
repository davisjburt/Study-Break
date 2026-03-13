import { renderWordle } from "./games/wordle.js";
import { renderTyping } from "./games/typing.js";
import { renderMinesweeper } from "./games/minesweeper.js";

const GAMES = {
  wordle: renderWordle,
  typing: renderTyping,
  minesweeper: renderMinesweeper,
};

// Inject the dock into the Canvas page
function injectDock() {
  if (document.getElementById("cb-dock")) return;

  const dock = document.createElement("div");
  dock.id = "cb-dock";
  dock.innerHTML = `
    <div id="cb-header">
      🎮 Study Break
      <button id="cb-toggle">▲</button>
    </div>
    <div id="cb-body">
      <div id="cb-game-select">
        <button data-game="wordle">Wordle</button>
        <button data-game="typing">Typing</button>
        <button data-game="minesweeper">Minesweeper</button>
      </div>
      <div id="cb-game-area"></div>
      <div id="cb-break-timer"></div>
    </div>
  `;

  document.body.appendChild(dock);
  setupDockListeners();
}

function setupDockListeners() {
  document.getElementById("cb-toggle").addEventListener("click", () => {
    const body = document.getElementById("cb-body");
    body.style.display = body.style.display === "none" ? "block" : "none";
  });

  document.querySelectorAll("[data-game]").forEach((btn) => {
    btn.addEventListener("click", () => loadGame(btn.dataset.game));
  });
}

function loadGame(name) {
  const area = document.getElementById("cb-game-area");
  area.innerHTML = ""; // clear previous game
  if (GAMES[name]) GAMES[name](area);
}

// Listen for the background timer firing
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "BREAK_TIME") {
    injectDock();
    document.getElementById("cb-body").style.display = "block";
    startBreakCountdown();
  }
});

function startBreakCountdown() {
  let seconds = 5 * 60;
  const display = document.getElementById("cb-break-timer");
  const interval = setInterval(() => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    display.textContent = `Break ends in ${m}:${s}`;
    if (--seconds < 0) {
      clearInterval(interval);
      display.textContent = "⏰ Break over! Back to work.";
      chrome.runtime.sendMessage({ type: "END_BREAK" });
    }
  }, 1000);
}

injectDock();
