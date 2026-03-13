window.renderTyping = function (container) {
  const SENTENCES = [
    "The quick brown fox jumps over the lazy dog.",
    "Any fool can write code that a computer can understand.",
    "First, solve the problem. Then, write the code.",
    "Code is like humor. When you have to explain it, it is bad.",
    "Simplicity is the soul of efficiency.",
    "Make it work, make it right, make it fast.",
    "A user interface is like a joke. If you have to explain it, it is not that good.",
    "The best way to get a project done faster is to start sooner.",
    "Fix the cause, not the symptom.",
    "Experience is the name everyone gives to their mistakes.",
    "Knowledge is power and curiosity is the engine that drives it.",
    "Good software, like good wine, takes time to develop properly.",
    "Debugging is twice as hard as writing the code in the first place.",
    "The most important property of a program is whether it accomplishes the intention of its user.",
    "Programs must be written for people to read, and only incidentally for machines to execute.",
  ];

  if (container._cleanup) container._cleanup();

  const text = SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
  let startTime = null;
  let finished = false;
  let timerInterval = null;

  container.innerHTML = `
    <div id="typ-container">
      <div id="typ-stats-row">
        <div class="sb-stat"><span id="typ-wpm">—</span><label>WPM</label></div>
        <div class="sb-stat"><span id="typ-acc">—</span><label>Acc</label></div>
        <div class="sb-stat"><span id="typ-time">0s</span><label>Time</label></div>
      </div>
      <div id="typ-text"></div>
      <input id="typ-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Click here and start typing..." />
      <div id="typ-result"></div>
      <button class="sb-action-btn" id="typ-retry">↺ New Text</button>
    </div>
  `;

  const textEl = document.getElementById("typ-text");
  text.split("").forEach((char, i) => {
    const span = document.createElement("span");
    span.textContent = char === " " ? "\u00a0" : char;
    span.id = `typ-char-${i}`;
    if (i === 0) span.classList.add("typ-cursor");
    textEl.appendChild(span);
  });

  const input = document.getElementById("typ-input");

  input.addEventListener("input", () => {
    if (finished) return;
    const val = input.value;

    if (!startTime && val.length > 0) {
      startTime = Date.now();
      timerInterval = setInterval(updateStats, 300);
    }

    for (let i = 0; i < text.length; i++) {
      const span = document.getElementById(`typ-char-${i}`);
      span.className = "";
      if (i < val.length) {
        span.classList.add(val[i] === text[i] ? "typ-correct" : "typ-wrong");
      } else if (i === val.length) {
        span.classList.add("typ-cursor");
      }
    }

    if (val === text) {
      finished = true;
      clearInterval(timerInterval);
      input.disabled = true;
      const elapsed = (Date.now() - startTime) / 1000;
      const wpm = Math.round((text.split(" ").length / elapsed) * 60);
      const acc = calcAccuracy(val, text);
      document.getElementById("typ-result").innerHTML = `
        <div class="typ-finish">✅ <strong>${wpm} WPM</strong> · <strong>${acc}%</strong> · ${elapsed.toFixed(1)}s</div>
      `;
      saveStats(wpm, acc);
    }
  });

  function updateStats() {
    if (!startTime) return;
    const elapsed = (Date.now() - startTime) / 1000;
    const words = input.value.trim().split(/\s+/).filter(Boolean).length;
    const wpm = Math.round((words / elapsed) * 60);
    const acc = calcAccuracy(input.value, text);
    document.getElementById("typ-wpm").textContent = wpm;
    document.getElementById("typ-acc").textContent = acc + "%";
    document.getElementById("typ-time").textContent = Math.round(elapsed) + "s";
  }

  function calcAccuracy(typed, original) {
    if (!typed.length) return 100;
    let correct = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === original[i]) correct++;
    }
    return Math.round((correct / typed.length) * 100);
  }

  function saveStats(wpm, acc) {
    chrome.storage.local.get(["typingStats"], (data) => {
      const s = data.typingStats || { bestWPM: 0, bestAcc: 0, played: 0 };
      s.played++;
      const newBestWPM = wpm > s.bestWPM;
      s.bestWPM = Math.max(s.bestWPM, wpm);
      s.bestAcc = Math.max(s.bestAcc, acc);
      chrome.storage.local.set({ typingStats: s });
      document.getElementById("typ-result").innerHTML += `
        <div class="typ-record">🏆 Best: ${s.bestWPM} WPM · ${s.bestAcc}% · ${s.played} games</div>
      `;
    });
  }

  document.getElementById("typ-retry").addEventListener("click", () => {
    clearInterval(timerInterval);
    window.renderTyping(container);
  });

  setTimeout(() => input.focus(), 100);
  container._cleanup = () => clearInterval(timerInterval);
};
