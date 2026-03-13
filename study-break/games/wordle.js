const WORDS = ["crane", "storm", "pixel", "debug", "stack"]; // expand this list

export function renderWordle(container) {
  const answer = WORDS[Math.floor(Math.random() * WORDS.length)];
  let attempts = [];

  container.innerHTML = `
    <div id="wrd-grid"></div>
    <input id="wrd-input" maxlength="5" placeholder="Type a 5-letter word" />
    <button id="wrd-submit">Guess</button>
    <div id="wrd-msg"></div>
  `;

  document.getElementById("wrd-submit").addEventListener("click", () => {
    const guess = document.getElementById("wrd-input").value.toLowerCase();
    if (guess.length !== 5) return;
    attempts.push(guess);
    renderGrid(answer, attempts);
    if (guess === answer) {
      document.getElementById("wrd-msg").textContent = "🎉 You got it!";
    } else if (attempts.length >= 6) {
      document.getElementById("wrd-msg").textContent = `Answer: ${answer}`;
    }
    document.getElementById("wrd-input").value = "";
  });
}

function renderGrid(answer, attempts) {
  const grid = document.getElementById("wrd-grid");
  grid.innerHTML = attempts
    .map(
      (guess) =>
        `<div class="wrd-row">${[...guess]
          .map((l, i) => {
            const cls =
              l === answer[i]
                ? "green"
                : answer.includes(l)
                  ? "yellow"
                  : "gray";
            return `<span class="wrd-tile ${cls}">${l}</span>`;
          })
          .join("")}</div>`,
    )
    .join("");
}
