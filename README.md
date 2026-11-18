# 🏆 Rock Paper Scissors Tournament - Cyber Arena

A modern, responsive, browser-based **Rock Paper Scissors Tournament** game built with pure **HTML5, CSS3, and Vanilla JavaScript**. Designed as a complete, polished mini-game suitable for a BTech Computer Science & Engineering Software Engineering mini-project demonstration.

![Project Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-blue?style=for-the-badge)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20(Pure%20Offline)-purple?style=for-the-badge)

---

## 🎮 Game Overview

Instead of isolated single matches, **Rock Paper Scissors Tournament** immerses the player into an elimination tournament ladder against four increasingly sophisticated AI opponents.

Each round is a **Best-of-Three** contest where the first combatant to score **2 wins** advances to the next stage. A single match loss results in elimination from the tournament. Conquering all four opponents awards the **Grand Championship Trophy**, recording the player's run in the persistent **Hall of Champions Leaderboard**.

---

## 🌟 Key Features

### 1. 🏟️ Tournament System (4 Rounds)
* **Round 1 (Quarterfinal):** vs. **Rookie Bot (LVL 1)** — Friendly beginner AI with uniform randomized moves and slight rock favoritism.
* **Round 2 (Semifinal):** vs. **Smart Bot (LVL 2)** — Tactical AI employing *Win-Stay / Lose-Shift* heuristics and recent player move counters.
* **Round 3 (Final):** vs. **Master Bot (LVL 3)** — Advanced AI with 1-step *Markov Sequence Prediction* to anticipate player gesture transitions.
* **Round 4 (Championship Bonus Match):** vs. **Champion Bot (LVL 4)** — Grandmaster AI utilizing double-bluff detection, tournament-wide gesture frequency analysis, and streak adaptation.
* **Fair & Beatable:** Every AI retains a 25%–35% randomized exploratory factor so skill and varied strategy always triumph.

### 2. ⚡ Modern Cyber / Glassmorphism UI
* **Dark Cyberpunk Aesthetic:** Deep space backdrop with glowing neon cyan (`#38bdf8`), neon purple (`#a855f7`), and championship gold (`#facc15`).
* **Interactive Background Canvas:** 60fps floating cyber particle constellations reacting smoothly to mouse hovering.
* **Glassmorphism Panels:** Frosted backdrop blurs, luminous borders, subtle drop shadows, and responsive layouts.
* **Dynamic Animations:** Screen transitions, countdown overlays, choice reveal slots with hand gesture shakes, and confetti explosions.

### 3. 🕹️ Combat Arena & Game Mechanics
* **Authentic Rules:** Rock crushes Scissors, Scissors cuts Paper, Paper covers Rock.
* **Draw System:** Identical choices result in a Draw turn which is replayed fairly without awarding points to either side.
* **Visual Match Scoreboard:** Glowing energy orbs tracking match points (first to 2).
* **Live Match History Strip:** Chronological timeline showing player vs bot choices and outcomes.
* **Multiple Input Methods:** Click/tap buttons or use keyboard hotkeys (`1`/`R` for Rock, `2`/`P` for Paper, `3`/`S` for Scissors, `Esc` for modals).
* **Input Lock Protection:** Choice buttons are disabled during countdown and animations to prevent duplicate inputs or race conditions.

### 4. 📊 Persistence & Career Analytics
* **Hall of Champions (Leaderboard):** Persistent player rankings stored via browser `localStorage`.
  - Sort by *Tournaments Won*, *Matches Won*, or *Win Rate %*.
  - Full clear/reset data functionality with confirmation modal.
* **Career Combat Stats Modal:** Lifetime overview of total tournaments played/won, matches won/lost, win streaks, and a visual percentage bar chart of gesture preferences.

### 5. 🔊 Dual-Mode Audio System
* **Zero Dependency Audio:** Synthesized retro/cyber audio effects generated in real-time via the **Web Audio API** (Oscillators + Gain nodes).
* **Audio File Fallback:** Pre-rendered 16-bit PCM `.wav` sound effects in `assets/sounds/` (`click`, `countdown`, `clash`, `win`, `lose`, `draw`, `victory`).
* **Mute/Unmute Toggle:** Global audio control button with persistent state stored in `localStorage`.

---

## 🖥️ Screen Architecture (8 Core Screens)

| Screen | ID | Description |
| :--- | :--- | :--- |
| **1. Home Screen** | `#screen-home` | Hero banner with animated trophy, quick career statistics preview, and navigation buttons. |
| **2. Player Registration** | `#screen-register` | Username input (validation + character counter), random name generator, and 6 combat avatars. |
| **3. Difficulty Selection** | `#screen-difficulty` | Casual (Recruit), Standard (Tournament Pro), and Hardcore (Neural Overdrive) mode selector. |
| **4. Tournament Arena** | `#screen-arena` | Live battlefield with bracket progress map, fighter cards, speech bubbles, VS countdown, and weapon deck. |
| **5. Match Result Screen** | `#modal-round-result` | Mid-tournament celebration modal showing match statistics and unlocking the next round opponent. |
| **6. Tournament End Screen** | `#screen-tournament-end` | Grand Championship Victory screen (animated trophy + confetti) or Tournament Elimination recap screen. |
| **7. Leaderboard Screen** | `#screen-leaderboard` | Hall of Champions rankings table with sort tabs and LocalStorage data reset option. |
| **8. Instructions Screen** | `#screen-instructions` | Rules explanation, tournament progression breakdown, and detailed profiles of all four bot opponents. |

---

## 📁 Project Folder Structure

```text
rock-paper-scissors-tournament/
│
├── index.html              # Clean semantic HTML5 structure & accessibility tags
├── style.css               # Cyberpunk neon theme, glassmorphism, animations & responsive media queries
├── script.js               # Modular Vanilla JS game engine, bot AI logic, state machine & LocalStorage
├── README.md               # Complete project documentation and guide
│
└── assets/
    ├── images/             # Crisp resolution-independent SVG vector graphics
    │   ├── rock.svg        # Neon rock weapon icon
    │   ├── paper.svg       # Neon paper weapon icon
    │   ├── scissors.svg    # Neon scissors weapon icon
    │   ├── bot_rookie.svg  # Round 1 Rookie Bot avatar
    │   ├── bot_smart.svg   # Round 2 Smart Bot avatar
    │   ├── bot_master.svg  # Round 3 Master Bot avatar
    │   ├── bot_champion.svg# Round 4 Champion Bot avatar
    │   ├── trophy.svg      # Glowing championship trophy
    │   └── logo.svg        # RPS Arena banner logo
    │
    └── sounds/             # Standalone 16-bit PCM WAV sound effects
        ├── click.wav       # UI button interaction blip
        ├── countdown.wav   # Arcade countdown pip
        ├── clash.wav       # Punchy clash impact effect
        ├── win.wav         # Rising victorious triad chord
        ├── lose.wav        # Descending dissonance tone
        ├── draw.wav        # Dual neutral chime
        └── victory.wav     # Grand championship fanfare
```

---

## 🚀 How to Run Locally

### Option 1: Direct File Launch (No Server Needed)
Because all scripts and SVG assets are self-contained and the audio engine includes Web Audio API synthesis:
1. Navigate to the `rock-paper-scissors-tournament/` folder.
2. Double-click **`index.html`** to open it in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, Safari).

### Option 2: Using VS Code Live Server
1. Open the `rock-paper-scissors-tournament` folder in Visual Studio Code.
2. Right-click `index.html` and select **"Open with Live Server"**.
3. The game will run at `http://127.0.0.1:5500/`.

### Option 3: Using Python HTTP Server (Command Line)
If Python is installed on your system:
```bash
cd rock-paper-scissors-tournament
python -m http.server 8080
```
Open your browser and visit: `http://localhost:8080`

---

## 🧠 Opponent AI Algorithms & Heuristics

The four opponents showcase classic computer science algorithms for decision-making under imperfect information:

1. **Rookie Bot (Quarterfinal):**
   $$\text{Decision} = \text{UniformRandom}(\{R, P, S\}) \text{ with } P(R) = 0.45$$
   Demonstrates baseline probabilistic sampling.

2. **Smart Bot (Semifinal):**
   Implements a **Win-Stay, Lose-Shift Heuristic**:
   $$\text{PredictedPlayerMove} = \text{PlayerMove}_{t-1}$$
   $$\text{BotMove}_t = \text{Counter}(\text{PredictedPlayerMove})$$
   Blended with 35% exploration noise to ensure unpredictability.

3. **Master Bot (Final):**
   Utilizes a **First-Order Markov Chain Transition Matrix** $M_{i, j} = \text{Count}(Move_t = j \mid Move_{t-1} = i)$:
   $$\text{NextMovePrediction} = \arg\max_{j} M_{\text{PlayerMove}_{t-1}, j}$$
   $$\text{BotMove}_t = \text{Counter}(\text{NextMovePrediction})$$
   Punishes repetitive transition patterns.

4. **Champion Bot (Championship Bonus Match):**
   Features a **Multi-Strategy Dynamic Selector**:
   - Double-bluff detector: Detects when a player plays the same move twice in a row and counters the expected pivot.
   - Global frequency counter: Tracks the player's overall weapon preference across all 4 rounds.
   - Retains 25% randomized divergence to guarantee that the bot remains fair and beatable.

---

## ⌨️ Controls & Shortcuts

| Action | Control / Shortcut |
| :--- | :--- |
| **Select Rock** | Click Rock Card or press `1` / `R` |
| **Select Paper** | Click Paper Card or press `2` / `P` |
| **Select Scissors** | Click Scissors Card or press `3` / `S` |
| **Close Modals** | Click `✕`, click backdrop, or press `Escape` |
| **Toggle Sound** | Click `🔊`/`🔇` icon in the top header |
| **Career Stats** | Click stats graph icon in header |

---

## 🛠️ Technical Specifications
* **Architecture:** Modular MVC / State-Machine architecture implemented in Vanilla JavaScript (ES6+).
* **DOM Rendering:** Event-driven updates with zero external framework dependencies.
* **Storage:** Browser `Window.localStorage` API with JSON serialization and schema fallbacks.
* **Audio Synthesis:** Real-time dual-tier audio pipeline (`Web Audio API` AudioContext oscillators + HTML5 `<audio>` elements).
* **Visual Effects:** HTML5 Canvas 2D API for 60fps particle constellations and physics-based victory confetti.
* **CSS:** CSS custom properties (variables), Flexbox, CSS Grid, and responsive `@media` breakpoints.
* **Browser Compatibility:** Chrome 90+, Edge 90+, Firefox 88+, Safari 14+, Opera 76+.

---

## 🎓 Academic Software Engineering Relevance
* **State Pattern:** Clean separation of tournament phases (Registration $\rightarrow$ Difficulty $\rightarrow$ Arena $\rightarrow$ Resolution $\rightarrow$ Advancement / Elimination).
* **Defensive Programming:** HTML escaping for user inputs, input lock during animations, and bounds checking.
* **Accessible Design:** Semantic HTML5 elements (`<header>`, `<main>`, `<section>`), ARIA labels, role attributes, and keyboard navigation.
