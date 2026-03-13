let observer = null;

function getNavWidth() {
  const nav =
    document.querySelector(".ic-app-header") || document.querySelector("#menu");
  return nav ? Math.round(nav.getBoundingClientRect().width) : 68;
}

function closeDrawer() {
  const closeBtn =
    document.querySelector(
      ".ic-app-nav-toggle-and-crumbs__nav-toggle button",
    ) ||
    document.querySelector("[data-testid='close-navigation-tray']") ||
    document.querySelector(
      ".navigation-tray-container button[aria-label*='close' i]",
    ) ||
    document.querySelector("button.ic-NavToggle__link--close");
  if (closeBtn) closeBtn.click();
}

function injectDesktopButton() {
  if (document.getElementById("sb-nav-btn")) return true;
  const nav =
    document.querySelector(".ic-app-header__menu-list") ||
    document.querySelector("#menu ul");
  if (!nav) return false;

  const li = document.createElement("li");
  li.className = "menu-item ic-app-header__menu-list-item";
  li.innerHTML = `
    <button id="sb-nav-btn" class="ic-app-header__menu-list-link" title="Study Break">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="4"/>
        <line x1="8" y1="12" x2="12" y2="12"/>
        <line x1="10" y1="10" x2="10" y2="14"/>
        <circle cx="16" cy="11" r="0.8" fill="currentColor"/>
        <circle cx="18" cy="13" r="0.8" fill="currentColor"/>
      </svg>
      <div class="menu-item__text">Break</div>
    </button>
  `;
  nav.appendChild(li);
  document
    .getElementById("sb-nav-btn")
    .addEventListener("click", () => togglePanel());
  return true;
}

function injectDrawerButton() {
  const drawer =
    document.querySelector(".navigation-tray-container ul") ||
    document.querySelector("[class*='NavigationTray'] ul") ||
    document.querySelector(".ic-NavToggle-animates-list");
  if (!drawer) return false;
  if (drawer.querySelector("#sb-drawer-btn")) return true;

  const li = document.createElement("li");
  li.id = "sb-drawer-li";
  li.innerHTML = `
    <button id="sb-drawer-btn">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="4"/>
        <line x1="8" y1="12" x2="12" y2="12"/>
        <line x1="10" y1="10" x2="10" y2="14"/>
        <circle cx="16" cy="11" r="0.8" fill="currentColor"/>
        <circle cx="18" cy="13" r="0.8" fill="currentColor"/>
      </svg>
      <span>Study Break</span>
    </button>
  `;
  drawer.appendChild(li);
  drawer.querySelector("#sb-drawer-btn").addEventListener("click", () => {
    closeDrawer();
    setTimeout(() => togglePanel(true), 200);
  });
  return true;
}

function injectButton() {
  const desktopDone = injectDesktopButton();
  injectDrawerButton();
  if (!desktopDone) setTimeout(injectButton, 800);
}

function injectPanel() {
  if (document.getElementById("sb-panel")) return;

  const panel = document.createElement("div");
  panel.id = "sb-panel";
  panel.innerHTML = `
    <div id="sb-panel-header">
      <div id="sb-panel-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="#4a9eff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="4"/>
          <line x1="8" y1="12" x2="12" y2="12"/>
          <line x1="10" y1="10" x2="10" y2="14"/>
          <circle cx="16" cy="11" r="0.8" fill="#4a9eff"/>
          <circle cx="18" cy="13" r="0.8" fill="#4a9eff"/>
        </svg>
        <span>Study Break</span>
      </div>
      <div id="sb-header-actions">
        <button id="sb-settings-btn" title="Settings">⚙️</button>
        <button id="sb-close">✕</button>
      </div>
    </div>

    <div id="sb-settings" style="display:none;">
      <div class="sb-settings-section">
        <label>Pomodoro Duration</label>
        <div id="sb-duration-options">
          <button class="sb-dur-btn" data-min="15">15 min</button>
          <button class="sb-dur-btn sb-dur-active" data-min="25">25 min</button>
          <button class="sb-dur-btn" data-min="45">45 min</button>
        </div>
      </div>
      <div class="sb-settings-section">
        <label>Accent Color</label>
        <div id="sb-color-options">
          <button class="sb-color-btn sb-color-active" data-color="#4a9eff" style="background:#4a9eff;"></button>
          <button class="sb-color-btn" data-color="#a78bfa" style="background:#a78bfa;"></button>
          <button class="sb-color-btn" data-color="#34d399" style="background:#34d399;"></button>
          <button class="sb-color-btn" data-color="#f472b6" style="background:#f472b6;"></button>
          <button class="sb-color-btn" data-color="#fb923c" style="background:#fb923c;"></button>
        </div>
      </div>
    </div>

    <div id="sb-game-select">
      <button class="sb-game-btn" data-game="wordle">
        <span class="sb-game-icon">🟩</span>
        <span class="sb-game-label">Wordle</span>
        <span class="sb-game-desc">Guess the word</span>
      </button>
      <button class="sb-game-btn" data-game="typing">
        <span class="sb-game-icon">⌨️</span>
        <span class="sb-game-label">Typing</span>
        <span class="sb-game-desc">Speed test</span>
      </button>
      <button class="sb-game-btn" data-game="minesweeper">
        <span class="sb-game-icon">💣</span>
        <span class="sb-game-label">Minesweeper</span>
        <span class="sb-game-desc">Classic game</span>
      </button>
    </div>

    <div id="sb-divider"></div>
    <div id="sb-game-area"></div>

    <div id="sb-footer">
      <span id="sb-timer-label">⏱ No active timer</span>
      <button id="sb-start-timer">Start Pomodoro</button>
    </div>
  `;

  document.body.appendChild(panel);

  // Settings toggle
  let settingsOpen = false;
  document.getElementById("sb-settings-btn").addEventListener("click", () => {
    settingsOpen = !settingsOpen;
    document.getElementById("sb-settings").style.display = settingsOpen
      ? "block"
      : "none";
  });

  // Duration buttons
  let pomoDuration = 25;
  chrome.storage.local.get(["sbSettings"], (data) => {
    if (data.sbSettings?.duration) {
      pomoDuration = data.sbSettings.duration;
      document.querySelectorAll(".sb-dur-btn").forEach((b) => {
        b.classList.toggle("sb-dur-active", +b.dataset.min === pomoDuration);
      });
    }
  });
  document.querySelectorAll(".sb-dur-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      pomoDuration = +btn.dataset.min;
      document
        .querySelectorAll(".sb-dur-btn")
        .forEach((b) => b.classList.remove("sb-dur-active"));
      btn.classList.add("sb-dur-active");
      chrome.storage.local.get(["sbSettings"], (data) => {
        chrome.storage.local.set({
          sbSettings: { ...(data.sbSettings || {}), duration: pomoDuration },
        });
      });
    });
  });

  // Color buttons
  document.querySelectorAll(".sb-color-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".sb-color-btn")
        .forEach((b) => b.classList.remove("sb-color-active"));
      btn.classList.add("sb-color-active");
      document.documentElement.style.setProperty(
        "--sb-accent",
        btn.dataset.color,
      );
      chrome.storage.local.get(["sbSettings"], (data) => {
        chrome.storage.local.set({
          sbSettings: { ...(data.sbSettings || {}), accent: btn.dataset.color },
        });
      });
    });
  });

  // Load saved settings
  chrome.storage.local.get(["sbSettings"], (data) => {
    if (data.sbSettings?.accent) {
      document.documentElement.style.setProperty(
        "--sb-accent",
        data.sbSettings.accent,
      );
      document.querySelectorAll(".sb-color-btn").forEach((b) => {
        b.classList.toggle(
          "sb-color-active",
          b.dataset.color === data.sbSettings.accent,
        );
      });
    }
    if (data.sbSettings?.duration) {
      pomoDuration = data.sbSettings.duration;
    }
  });

  // Close button
  document
    .getElementById("sb-close")
    .addEventListener("click", () => togglePanel());

  // Pomodoro
  document
    .getElementById("sb-start-timer")
    .addEventListener("click", () => startTimer(pomoDuration));

  // Game buttons
  document.querySelectorAll(".sb-game-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("active")) return;
      document
        .querySelectorAll(".sb-game-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const gameArea = document.getElementById("sb-game-area");
      if (gameArea._cleanup) gameArea._cleanup();

      // Expand panel then fade game in
      document.getElementById("sb-panel").classList.add("sb-expanded");
      gameArea.classList.remove("sb-game-visible");
      loadGame(btn.dataset.game);
      setTimeout(() => gameArea.classList.add("sb-game-visible"), 200);
    });
  });
}

function togglePanel(forceOpen = false) {
  const panel = document.getElementById("sb-panel");
  panel.style.left = getNavWidth() + "px";

  const isOpen = panel.classList.contains("sb-open");
  const willOpen = forceOpen ? true : !isOpen;

  if (willOpen) {
    panel.style.visibility = "visible";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        panel.classList.add("sb-open");
      });
    });
  } else {
    panel.classList.remove("sb-open");
    panel.classList.remove("sb-expanded");

    // Reset game state on close
    document
      .querySelectorAll(".sb-game-btn")
      .forEach((b) => b.classList.remove("active"));
    const gameArea = document.getElementById("sb-game-area");
    if (gameArea._cleanup) gameArea._cleanup();
    gameArea.classList.remove("sb-game-visible");
    gameArea.innerHTML = "";

    setTimeout(() => {
      if (!panel.classList.contains("sb-open"))
        panel.style.visibility = "hidden";
    }, 360);
  }
}

function loadGame(name) {
  const area = document.getElementById("sb-game-area");
  area.innerHTML = "";
  const games = {
    wordle: window.renderWordle,
    typing: window.renderTyping,
    minesweeper: window.renderMinesweeper,
  };
  if (games[name]) games[name](area);
}

let timerInterval = null;
let timerSeconds = 0;

function startTimer(durationMin = 25) {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    document.getElementById("sb-timer-label").textContent = "⏱ No active timer";
    document.getElementById("sb-start-timer").textContent = "Start Pomodoro";
    return;
  }

  timerSeconds = durationMin * 60;
  document.getElementById("sb-start-timer").textContent = "Stop";

  timerInterval = setInterval(() => {
    timerSeconds--;
    const m = Math.floor(timerSeconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (timerSeconds % 60).toString().padStart(2, "0");
    document.getElementById("sb-timer-label").textContent =
      `⏱ ${m}:${s} remaining`;

    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      document.getElementById("sb-timer-label").textContent = "🎉 Break time!";
      document.getElementById("sb-start-timer").textContent = "Start Pomodoro";
      togglePanel(true);
    }
  }, 1000);
}

observer = new MutationObserver(() => injectDrawerButton());
observer.observe(document.body, { childList: true, subtree: true });

injectButton();
injectPanel();
