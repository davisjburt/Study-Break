# Study Break — Canvas LMS Extension

A Chrome extension that injects a collapsible study break panel into Canvas LMS (Instructure). Take quick mental breaks between study sessions with built-in mini-games and a Pomodoro timer — without ever leaving Canvas.

---

## Features

- 🎮 **Three mini-games** — Wordle, Typing Speed Test, Minesweeper
- ⏱ **Pomodoro timer** — 15, 25, or 45 minute sessions with auto-open on break
- 📊 **Persistent stats** — Win streaks, best WPM, and fastest Minesweeper times saved locally
- 🎨 **Accent color picker** — Five color themes
- 📱 **Responsive** — Works in both the full desktop nav and the mobile drawer nav
- 🔒 **Quiz-safe** — Disabled on Canvas quiz pages so it never interferes with exams

---

## File Structure

study-break/
├── manifest.json # Extension config, permissions, content script registration
├── background.js # Service worker (alarms, future notifications)
├── content.js # Main injection logic — nav buttons, panel, timer, settings
├── content.css # All styles for the panel, games, and nav buttons
├── games/
│ ├── words.js # Wordle answer word bank (window.WORDLE_WORDS)
│ ├── wordle.js # Wordle game renderer (window.renderWordle)
│ ├── typing.js # Typing speed test renderer (window.renderTyping)
│ └── minesweeper.js # Minesweeper renderer (window.renderMinesweeper)
└── popup/
└── popup.html # Extension toolbar popup

---

## Installation

### Development (Load Unpacked)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked**
5. Select the root folder of this project
6. Navigate to any Canvas page (e.g. `harding.instructure.com`)
7. The **Break** button will appear at the bottom of the left nav sidebar

### Updating After Changes

1. Edit your files
2. Go to `chrome://extensions`
3. Click the **↺ refresh** icon on the Study Break card
4. Hard refresh Canvas with **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows)

---

## How It Works

### Injection

`content.js` runs on every `*.instructure.com` page. It uses a `MutationObserver` to watch for Canvas's dynamic DOM and injects two buttons:

- **Desktop nav** — appended to `.ic-app-header__menu-list` (the icon sidebar)
- **Mobile drawer** — appended to `.navigation-tray-container ul` (the responsive nav tray)

The mobile drawer is destroyed and recreated by Canvas every time it opens, so the observer re-injects the button each time without duplicating it.

### Panel

The panel is a fixed `300px` overlay anchored to the right edge of the sidebar (`left = navWidth`). When a game is selected, the panel smoothly expands to `520px` using a CSS width transition. The panel overlays page content rather than pushing it.

Opening uses a double `requestAnimationFrame` to guarantee the browser paints the hidden starting state before the open class is applied, ensuring the slide animation always runs.

### Games

Each game is a self-contained renderer exposed on `window`:

| Function                              | File                   | Description                                                 |
| ------------------------------------- | ---------------------- | ----------------------------------------------------------- |
| `window.renderWordle(container)`      | `games/wordle.js`      | 6-guess word game with flip animations and keyboard support |
| `window.renderTyping(container)`      | `games/typing.js`      | Real-time WPM and accuracy typing test                      |
| `window.renderMinesweeper(container)` | `games/minesweeper.js` | 8×8 grid, 10 mines, first-click safe, flood-fill reveal     |

Each renderer accepts a DOM element, builds its own UI inside it, and registers a `_cleanup` function on the container to remove event listeners when switching games or closing the panel.

### Word Bank

`games/words.js` exposes `window.WORDLE_WORDS` — a curated list of 5-letter words loaded before `wordle.js` via `manifest.json` script ordering. The word bank is intentionally separate so it can be swapped or extended without touching game logic.

### Storage

All stats and settings are persisted with `chrome.storage.local`:

| Key                | Contents                         |
| ------------------ | -------------------------------- |
| `wordleStats`      | `{ played, wins, streak, best }` |
| `typingStats`      | `{ bestWPM, bestAcc, played }`   |
| `minesweeperStats` | `{ bestTime, wins }`             |
| `sbSettings`       | `{ duration, accent }`           |

---

## Games

### Wordle

Guess the hidden 5-letter word in 6 tries. Each guess reveals:

- 🟩 **Green** — correct letter, correct position
- 🟨 **Yellow** — correct letter, wrong position
- ⬛ **Gray** — letter not in the word

Supports both physical keyboard and on-screen keyboard. Physical keyboard input is only intercepted when the panel is open and no Canvas input is focused.

### Typing Speed Test

A random sentence is displayed. Start typing to begin the timer. Stats update in real time:

- **WPM** — words per minute (calculated from space-separated words)
- **Accuracy** — percentage of characters typed correctly
- **Time** — elapsed seconds

### Minesweeper

Classic 8×8 grid with 10 mines.

- **Left click** — reveal a cell
- **Right click** — place/remove a flag
- First click is always safe (mines are placed after)
- Flood-fill automatically reveals empty adjacent cells
- Timer starts on first click

---

## Settings

Access via the **⚙️** icon in the panel header.

| Setting           | Options                               | Default |
| ----------------- | ------------------------------------- | ------- |
| Pomodoro Duration | 15 / 25 / 45 min                      | 25 min  |
| Accent Color      | Blue / Purple / Green / Pink / Orange | Blue    |

Settings are saved to `chrome.storage.local` and restored on every page load.

---

## Pomodoro Timer

Start a focus session from the footer of the panel. When the timer ends:

- The label changes to **🎉 Break time!**
- The panel automatically opens
- A game can be launched immediately

Click **Stop** at any time to cancel the current session.

---

## Permissions

| Permission                            | Reason                                             |
| ------------------------------------- | -------------------------------------------------- |
| `storage`                             | Persist game stats and user settings               |
| `alarms`                              | Reserved for future background timer notifications |
| `host_permissions: *.instructure.com` | Inject content scripts into Canvas pages only      |

The extension does **not** read any Canvas data, make network requests, or access any page content beyond injecting its own UI elements.

---

## Browser Compatibility

| Browser         | Support                      |
| --------------- | ---------------------------- |
| Chrome 114+     | ✅ Full support              |
| Edge (Chromium) | ✅ Full support              |
| Firefox         | ❌ Requires manifest v2 port |
| Safari          | ❌ Not supported             |

---

## Known Limitations

- The panel position is recalculated at click time. If Canvas's sidebar width changes dynamically (e.g. after a page transition), a close/reopen cycle will correct the position.
- BetterCanvas and other Canvas extensions may apply CSS resets that affect styling. The `!important` declarations on panel transform and transition guard against this.
- Wordle physical keyboard is disabled when any input or textarea on the Canvas page has focus, to avoid interfering with Canvas forms.

---

## License

MIT — free to use, modify, and distribute.
