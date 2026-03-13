window.renderWordle = function (container) {
  const WORDS = window.WORDLE_WORDS || [];
  if (!WORDS.length) {
    container.innerHTML = `<p style="color:#e05a5a;text-align:center;">Word list failed to load.</p>`;
    return;
  }

  // Cleanup previous instance
  if (container._wordleCleanup) {
    container._wordleCleanup();
    container._wordleCleanup = null;
  }

  const answer = WORDS[Math.floor(Math.random() * WORDS.length)];
  let currentRow = 0;
  let currentGuess = [];
  let gameOver = false;
  const letterStates = {}; // tracks best state per letter for keyboard coloring

  // ── Build DOM ──────────────────────────────────────────
  container.innerHTML = `
    <div id="wrd-wrap">
      <div id="wrd-msg"></div>
      <div id="wrd-grid"></div>
      <div id="wrd-keyboard"></div>
      <div id="wrd-stats-box"></div>
      <button class="sb-action-btn" id="wrd-new">↺ New Word</button>
    </div>
  `;

  // Grid
  const grid = document.getElementById("wrd-grid");
  for (let r = 0; r < 6; r++) {
    const row = document.createElement("div");
    row.className = "wrd-row";
    row.id = `wrd-row-${r}`;
    for (let c = 0; c < 5; c++) {
      const tile = document.createElement("div");
      tile.className = "wrd-tile";
      tile.id = `wrd-tile-${r}-${c}`;
      row.appendChild(tile);
    }
    grid.appendChild(row);
  }

  // On-screen keyboard
  const KB_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
  ];
  const keyboard = document.getElementById("wrd-keyboard");
  KB_ROWS.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "wrd-key-row";
    row.forEach((k) => {
      const btn = document.createElement("button");
      btn.textContent = k;
      btn.id = `wrd-key-${k}`;
      btn.className = "wrd-key" + (k.length > 1 ? " wrd-key-wide" : "");
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        handleKey(k);
      });
      rowEl.appendChild(btn);
    });
    keyboard.appendChild(rowEl);
  });

  document
    .getElementById("wrd-new")
    .addEventListener("click", () => window.renderWordle(container));

  // ── Key handler ─────────────────────────────────────────
  function handleKey(k) {
    if (gameOver) return;
    if (k === "⌫" || k === "BACKSPACE") {
      if (currentGuess.length > 0) {
        currentGuess.pop();
        updateRow();
      }
    } else if (k === "ENTER") {
      if (currentGuess.length < 5) {
        showMsg("Not enough letters");
        return;
      }
      submitGuess();
    } else if (/^[A-Za-z]$/.test(k)) {
      if (currentGuess.length < 5) {
        currentGuess.push(k.toUpperCase());
        updateRow();
      }
    }
  }

  function updateRow() {
    for (let c = 0; c < 5; c++) {
      const tile = document.getElementById(`wrd-tile-${currentRow}-${c}`);
      const letter = currentGuess[c] || "";
      tile.textContent = letter;
      tile.classList.toggle("wrd-filled", !!letter);
    }
  }

  // ── Guess scoring ────────────────────────────────────────
  function scoreGuess(guess, ans) {
    const result = Array(5).fill("absent");
    const ansArr = ans.toUpperCase().split("");
    const used = Array(5).fill(false);
    // Pass 1: correct
    guess.forEach((l, i) => {
      if (l === ansArr[i]) {
        result[i] = "correct";
        used[i] = true;
      }
    });
    // Pass 2: present
    guess.forEach((l, i) => {
      if (result[i] === "correct") return;
      const j = ansArr.findIndex((a, idx) => a === l && !used[idx]);
      if (j !== -1) {
        result[i] = "present";
        used[j] = true;
      }
    });
    return result;
  }

  // ── Submit guess ─────────────────────────────────────────
  function submitGuess() {
    const guess = [...currentGuess];
    const result = scoreGuess(guess, answer);
    const row = currentRow;

    // Flip tiles one by one
    guess.forEach((letter, i) => {
      const tile = document.getElementById(`wrd-tile-${row}-${i}`);
      setTimeout(() => {
        tile.classList.add("wrd-flip");
        setTimeout(() => {
          tile.classList.remove("wrd-filled");
          tile.classList.add(`wrd-${result[i]}`);
        }, 150); // halfway through flip
      }, i * 100);
    });

    // Update keyboard colors after all flips
    const DELAY = guess.length * 100 + 300;
    setTimeout(() => {
      const priority = { correct: 3, present: 2, absent: 1 };
      result.forEach((state, i) => {
        const letter = guess[i];
        const prev = letterStates[letter];
        if (!prev || priority[state] > priority[prev]) {
          letterStates[letter] = state;
          const keyEl = document.getElementById(`wrd-key-${letter}`);
          if (keyEl) {
            keyEl.classList.remove(
              "wrd-key-correct",
              "wrd-key-present",
              "wrd-key-absent",
            );
            keyEl.classList.add(`wrd-key-${state}`);
          }
        }
      });

      const won = result.every((s) => s === "correct");
      currentRow++;
      currentGuess = [];

      if (won) {
        gameOver = true;
        const msgs = [
          "Genius!",
          "Magnificent!",
          "Impressive!",
          "Splendid!",
          "Great!",
          "Phew!",
        ];
        showMsg(msgs[Math.min(currentRow - 1, 5)] + " 🎉");
        saveAndShowStats(true);
      } else if (currentRow === 6) {
        gameOver = true;
        showMsg(answer.toUpperCase(), 4000);
        saveAndShowStats(false);
      }
    }, DELAY);
  }

  // ── Message ──────────────────────────────────────────────
  let msgTimeout = null;
  function showMsg(text, duration = 2000) {
    const el = document.getElementById("wrd-msg");
    el.textContent = text;
    el.classList.add("wrd-msg-show");
    clearTimeout(msgTimeout);
    msgTimeout = setTimeout(() => {
      el.classList.remove("wrd-msg-show");
      setTimeout(() => {
        if (el.textContent === text) el.textContent = "";
      }, 300);
    }, duration);
  }

  // ── Stats ────────────────────────────────────────────────
  function saveAndShowStats(won) {
    chrome.storage.local.get(["wordleStats"], (data) => {
      const s = data.wordleStats || { played: 0, wins: 0, streak: 0, best: 0 };
      s.played++;
      if (won) {
        s.wins++;
        s.streak++;
        s.best = Math.max(s.best, s.streak);
      } else {
        s.streak = 0;
      }
      chrome.storage.local.set({ wordleStats: s });
      showStats(s);
    });
  }

  function showStats(s) {
    const pct = s.played ? Math.round((s.wins / s.played) * 100) : 0;
    document.getElementById("wrd-stats-box").innerHTML = `
      <div class="sb-stats-row">
        <div class="sb-stat"><span>${s.played}</span><label>Played</label></div>
        <div class="sb-stat"><span>${pct}%</span><label>Win %</label></div>
        <div class="sb-stat"><span>${s.streak}</span><label>Streak</label></div>
        <div class="sb-stat"><span>${s.best}</span><label>Best</label></div>
      </div>
    `;
  }

  chrome.storage.local.get(["wordleStats"], (data) => {
    if (data.wordleStats) showStats(data.wordleStats);
  });

  // ── Physical keyboard ────────────────────────────────────
  function onKeyDown(e) {
    // Don't intercept if user is typing in an input elsewhere on the page
    const tag = document.activeElement?.tagName;
    if (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      document.activeElement?.isContentEditable
    )
      return;
    // Only intercept if our panel is open
    if (!document.getElementById("sb-panel")?.classList.contains("sb-open"))
      return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      handleKey("BACKSPACE");
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleKey("ENTER");
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      handleKey(e.key);
    }
  }

  document.addEventListener("keydown", onKeyDown);
  container._wordleCleanup = () => {
    document.removeEventListener("keydown", onKeyDown);
    clearTimeout(msgTimeout);
  };
  container._cleanup = container._wordleCleanup;
};
