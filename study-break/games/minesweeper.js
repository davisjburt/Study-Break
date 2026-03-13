window.renderMinesweeper = function (container) {
  const ROWS = 8,
    COLS = 8,
    MINES = 10;
  let board = [],
    revealed = [],
    flagged = [];
  let gameOver = false,
    startTime = null,
    timerInterval = null,
    firstClick = true;

  if (container._cleanup) container._cleanup();

  container.innerHTML = `
    <div id="msw-container">
      <div id="msw-header">
        <span id="msw-mines">💣 ${MINES}</span>
        <button id="msw-reset">🙂</button>
        <span id="msw-timer">⏱ 0s</span>
      </div>
      <div id="msw-grid"></div>
      <div id="msw-msg"></div>
      <div id="msw-record"></div>
    </div>
  `;

  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  revealed = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  flagged = Array.from({ length: ROWS }, () => Array(COLS).fill(false));

  renderGrid();
  document
    .getElementById("msw-reset")
    .addEventListener("click", () => window.renderMinesweeper(container));

  chrome.storage.local.get(["minesweeperStats"], (data) => {
    if (data.minesweeperStats?.bestTime) {
      document.getElementById("msw-record").textContent =
        `🏆 Best: ${data.minesweeperStats.bestTime}s`;
    }
  });

  function placeMines(safeR, safeC) {
    let placed = 0;
    while (placed < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      if (
        board[r][c] !== -1 &&
        !(Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1)
      ) {
        board[r][c] = -1;
        placed++;
      }
    }
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (board[r][c] !== -1)
          board[r][c] = neighbors(r, c).filter(
            ([nr, nc]) => board[nr][nc] === -1,
          ).length;
  }

  function neighbors(r, c) {
    const res = [];
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const nr = r + dr,
          nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) res.push([nr, nc]);
      }
    return res;
  }

  function renderGrid() {
    const grid = document.getElementById("msw-grid");
    grid.innerHTML = "";
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement("div");
        cell.className = "msw-cell msw-hidden";
        cell.dataset.r = r;
        cell.dataset.c = c;
        cell.addEventListener("click", handleClick);
        cell.addEventListener("contextmenu", handleFlag);
        grid.appendChild(cell);
      }
  }

  function handleClick(e) {
    if (gameOver) return;
    const r = +e.currentTarget.dataset.r,
      c = +e.currentTarget.dataset.c;
    if (flagged[r][c] || revealed[r][c]) return;
    if (firstClick) {
      firstClick = false;
      placeMines(r, c);
      startTime = Date.now();
      timerInterval = setInterval(() => {
        document.getElementById("msw-timer").textContent =
          `⏱ ${Math.floor((Date.now() - startTime) / 1000)}s`;
      }, 500);
    }
    if (board[r][c] === -1) {
      revealAll();
      gameOver = true;
      clearInterval(timerInterval);
      document.getElementById("msw-reset").textContent = "😵";
      document.getElementById("msw-msg").textContent = "💥 Game over!";
      return;
    }
    floodReveal(r, c);
    updateGrid();
    checkWin();
  }

  function handleFlag(e) {
    e.preventDefault();
    if (gameOver) return;
    const r = +e.currentTarget.dataset.r,
      c = +e.currentTarget.dataset.c;
    if (revealed[r][c]) return;
    flagged[r][c] = !flagged[r][c];
    updateGrid();
    const remaining = MINES - flagged.flat().filter(Boolean).length;
    document.getElementById("msw-mines").textContent = `💣 ${remaining}`;
  }

  function floodReveal(r, c) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    if (revealed[r][c] || flagged[r][c]) return;
    revealed[r][c] = true;
    if (board[r][c] === 0)
      neighbors(r, c).forEach(([nr, nc]) => floodReveal(nr, nc));
  }

  function revealAll() {
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (board[r][c] === -1) revealed[r][c] = true;
    updateGrid();
  }

  const NUM_COLORS = [
    "",
    "#4a9eff",
    "#4caf50",
    "#e05a5a",
    "#7b2ff7",
    "#ff9800",
    "#00bcd4",
    "#333",
    "#888",
  ];

  function updateGrid() {
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        const cell = document.querySelector(
          `#msw-grid [data-r="${r}"][data-c="${c}"]`,
        );
        if (!cell) continue;
        cell.className = "msw-cell";
        cell.textContent = "";
        cell.style.color = "";
        if (!revealed[r][c] && flagged[r][c]) {
          cell.classList.add("msw-hidden");
          cell.textContent = "🚩";
        } else if (!revealed[r][c]) {
          cell.classList.add("msw-hidden");
        } else if (board[r][c] === -1) {
          cell.classList.add("msw-mine");
          cell.textContent = "💣";
        } else {
          cell.classList.add("msw-revealed");
          if (board[r][c] > 0) {
            cell.textContent = board[r][c];
            cell.style.color = NUM_COLORS[board[r][c]];
          }
        }
      }
  }

  function checkWin() {
    const unrevealedSafe = board.flat().filter((v, i) => {
      const r = Math.floor(i / COLS),
        c = i % COLS;
      return v !== -1 && !revealed[r][c];
    }).length;
    if (unrevealedSafe === 0) {
      gameOver = true;
      clearInterval(timerInterval);
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      document.getElementById("msw-reset").textContent = "😎";
      document.getElementById("msw-msg").textContent =
        `🎉 You won in ${elapsed}s!`;
      chrome.storage.local.get(["minesweeperStats"], (data) => {
        const s = data.minesweeperStats || { bestTime: null, wins: 0 };
        s.wins++;
        if (!s.bestTime || elapsed < s.bestTime) s.bestTime = elapsed;
        chrome.storage.local.set({ minesweeperStats: s });
        document.getElementById("msw-record").textContent =
          `🏆 Best: ${s.bestTime}s · ${s.wins} wins`;
      });
    }
  }

  container._cleanup = () => clearInterval(timerInterval);
};
