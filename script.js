/**
 * ============================================================================
 * ROCK PAPER SCISSORS TOURNAMENT - CYBER ARENA
 * Complete Game Engine, Tournament State Machine, AI Systems & LocalStorage
 * ============================================================================
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
   * 1. CONSTANTS, OPPONENTS & CONFIGURATION
   * -------------------------------------------------------------------------- */
  const CHOICES = {
    ROCK: 'rock',
    PAPER: 'paper',
    SCISSORS: 'scissors'
  };

  const CHOICE_BEATS = {
    [CHOICES.ROCK]: CHOICES.SCISSORS,
    [CHOICES.SCISSORS]: CHOICES.PAPER,
    [CHOICES.PAPER]: CHOICES.ROCK
  };

  const CHOICE_INFO = {
    [CHOICES.ROCK]: { name: 'Rock', icon: 'assets/images/rock.svg', emoji: '✊', beats: 'Scissors', action: 'crushes' },
    [CHOICES.PAPER]: { name: 'Paper', icon: 'assets/images/paper.svg', emoji: '✋', beats: 'Rock', action: 'covers' },
    [CHOICES.SCISSORS]: { name: 'Scissors', icon: 'assets/images/scissors.svg', emoji: '✌️', beats: 'Paper', action: 'cuts' }
  };

  const OPPONENTS = [
    {
      round: 1,
      name: 'Rookie Bot',
      title: 'Beginner AI',
      level: 'LVL 1',
      avatar: 'assets/images/bot_rookie.svg',
      quotes: {
        intro: "Beep boop! I'm still learning! Ready to clash?",
        win: "Hooray! My randomizer picked a winner!",
        lose: "Aww! You crushed my circuits!",
        draw: "A draw! Great minds calculate together!",
        matchWin: "Rookie Bot takes the set! Good practice!",
        matchLose: "System error: player was too clever! Advancing..."
      }
    },
    {
      round: 2,
      name: 'Smart Bot',
      title: 'Tactical AI',
      level: 'LVL 2',
      avatar: 'assets/images/bot_smart.svg',
      quotes: {
        intro: "Analyzing your tactical habits. Proceed with caution.",
        win: "Pattern calculated. Point to Smart Bot.",
        lose: "Unusual variance detected in your play. Recalibrating.",
        draw: "Identical vectors. Neutral outcome.",
        matchWin: "Analysis complete: you have been eliminated.",
        matchLose: "Impressive strategy. Passing you to the Final tier."
      }
    },
    {
      round: 3,
      name: 'Master Bot',
      title: 'Predictive Grandmaster',
      level: 'LVL 3',
      avatar: 'assets/images/bot_master.svg',
      quotes: {
        intro: "Welcome to the Final. Only true instinct prevails here.",
        win: "Your sequences are written in your past gestures.",
        lose: "A sharp strike! You have refined discipline.",
        draw: "Our wills collide evenly. Focus your energy.",
        matchWin: "The Final remains unbreached. Bow before mastery.",
        matchLose: "Remarkable! You have earned the right to face the Champion!"
      }
    },
    {
      round: 4,
      name: 'Champion Bot',
      title: 'Grand Tournament Monarch',
      level: 'LVL 4',
      avatar: 'assets/images/bot_champion.svg',
      quotes: {
        intro: "I am the reigning Monarch of the Arena! Dare you challenge my throne?",
        win: "The crown stays right where it belongs!",
        lose: "Magnificent! A blow that actually staggers me!",
        draw: "The arena shakes! The crowd roars for our duel!",
        matchWin: "Another challenger falls. Better luck next tournament!",
        matchLose: "Impossible... Defeated! Hail the new TOURNAMENT CHAMPION!"
      }
    }
  ];

  const RANDOM_NAMES = [
    'CyberNinja', 'NeonValkyrie', 'PixelWarrior', 'QuantumAce',
    'ShadowByte', 'VectorStrike', 'NovaChampion', 'GlitchHunter',
    'ApexBlaster', 'TitanZero', 'CipherHawk', 'EchoPulse'
  ];

  const STORAGE_KEYS = {
    LEADERBOARD: 'rps_tournament_leaderboard',
    CAREER_STATS: 'rps_tournament_career_stats',
    AUDIO_MUTED: 'rps_tournament_audio_muted',
    LAST_USER: 'rps_tournament_last_user'
  };

  /* --------------------------------------------------------------------------
   * 2. GAME STATE
   * -------------------------------------------------------------------------- */
  const gameState = {
    // Player
    username: 'Challenger',
    avatar: '⚡',
    difficulty: 'standard', // 'casual' | 'standard' | 'hardcore'

    // Tournament
    currentRoundIndex: 0, // 0 to 3
    playerMatchWins: 0,   // First to 2
    opponentMatchWins: 0, // First to 2
    isTurnInProgress: false,

    // Turn & Run History
    matchTurns: [],       // Array of turns in current match
    playerMoveHistory: [], // All moves made by player in tournament
    botMoveHistory: [],
    runTurnsPlayed: 0,
    runPlayerWins: 0,
    runBotWins: 0,
    runDraws: 0,
    runGestureCounts: { [CHOICES.ROCK]: 0, [CHOICES.PAPER]: 0, [CHOICES.SCISSORS]: 0 },

    // Markov transition memory for AI: { [prevMove]: { rock: N, paper: N, scissors: N } }
    transitionMatrix: {
      [CHOICES.ROCK]: { [CHOICES.ROCK]: 1, [CHOICES.PAPER]: 1, [CHOICES.SCISSORS]: 1 },
      [CHOICES.PAPER]: { [CHOICES.ROCK]: 1, [CHOICES.PAPER]: 1, [CHOICES.SCISSORS]: 1 },
      [CHOICES.SCISSORS]: { [CHOICES.ROCK]: 1, [CHOICES.PAPER]: 1, [CHOICES.SCISSORS]: 1 }
    },

    // Audio
    isMuted: false
  };

  /* --------------------------------------------------------------------------
   * 3. AUDIO SYSTEM (Dual-Support: Web Audio API Synth + HTML5 Audio Fallback)
   * -------------------------------------------------------------------------- */
  class SoundManager {
    constructor() {
      this.audioCtx = null;
      this.initWebAudio();
    }

    initWebAudio() {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      } catch (e) {
        console.warn('Web Audio API not supported, using fallback elements');
      }
    }

    resumeContext() {
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    }

    play(soundType) {
      if (gameState.isMuted) return;
      this.resumeContext();

      // Try playing synthesized Web Audio effect first for instant zero-latency feedback
      if (this.audioCtx) {
        try {
          this.synthesizeSound(soundType);
          return;
        } catch (err) {
          // Fall through to audio element fallback
        }
      }

      // Fallback to HTML5 audio element if synth fails
      const el = document.getElementById(`snd-${soundType}`);
      if (el) {
        el.currentTime = 0;
        el.play().catch(() => {});
      }
    }

    synthesizeSound(type) {
      const ctx = this.audioCtx;
      if (!ctx) return;
      const now = ctx.currentTime;

      switch (type) {
        case 'click': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }

        case 'countdown': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(659.25, now); // E5 note
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }

        case 'clash': {
          // Punchy noise burst + low sub drop
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.22);
          break;
        }

        case 'win': {
          // Bright major triad arpeggio (C5 - E5 - G5)
          const notes = [523.25, 659.25, 783.99];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = now + idx * 0.09;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.25, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.2);
          });
          break;
        }

        case 'lose': {
          // Descending dissonance
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.linearRampToValueAtTime(110, now + 0.35);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.35);
          break;
        }

        case 'draw': {
          // Dual neutral chime
          [440, 440].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = now + idx * 0.12;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.2, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.1);
          });
          break;
        }

        case 'victory': {
          // Grand fanfare chord progression
          const chords = [
            { f: 523.25, t: 0.00 },
            { f: 659.25, t: 0.14 },
            { f: 783.99, t: 0.28 },
            { f: 1046.50, t: 0.44 }
          ];
          chords.forEach(({ f, t }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = now + t;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, start);
            gain.gain.setValueAtTime(0.3, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.4);
          });
          break;
        }
      }
    }
  }

  const sound = new SoundManager();

  /* --------------------------------------------------------------------------
   * 4. LOCALSTORAGE LEADERBOARD & CAREER STATS MANAGER
   * -------------------------------------------------------------------------- */
  const StorageManager = {
    // Default seed records so the tournament leaderboard feels alive
    defaultLeaderboard: [
      { id: '1', username: 'CyberValkyrie', avatar: '🔥', tournamentsWon: 5, matchesWon: 24, winRate: 85, difficulty: 'hardcore', date: '2026-10-28' },
      { id: '2', username: 'NeonStriker', avatar: '⚡', tournamentsWon: 3, matchesWon: 16, winRate: 78, difficulty: 'standard', date: '2026-10-30' },
      { id: '3', username: 'GlitchMaster', avatar: '👾', tournamentsWon: 2, matchesWon: 12, winRate: 72, difficulty: 'standard', date: '2026-11-01' },
      { id: '4', username: 'ByteNinja', avatar: '🥷', tournamentsWon: 1, matchesWon: 7, winRate: 64, difficulty: 'casual', date: '2026-11-02' }
    ],

    getLeaderboard() {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
        if (!data) {
          localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(this.defaultLeaderboard));
          return [...this.defaultLeaderboard];
        }
        return JSON.parse(data);
      } catch (e) {
        return [...this.defaultLeaderboard];
      }
    },

    saveLeaderboardEntry(entry) {
      try {
        const board = this.getLeaderboard();
        // Check if player already has an entry; if so, update their stats
        const existingIdx = board.findIndex(b => b.username.toLowerCase() === entry.username.toLowerCase());
        if (existingIdx >= 0) {
          const old = board[existingIdx];
          old.tournamentsWon += entry.tournamentsWon;
          old.matchesWon += entry.matchesWon;
          old.winRate = Math.round((old.winRate + entry.winRate) / 2);
          old.difficulty = entry.difficulty;
          old.date = entry.date;
          old.avatar = entry.avatar || old.avatar;
        } else {
          board.push({
            id: Date.now().toString(),
            ...entry
          });
        }
        localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(board));
      } catch (e) {
        console.error('Failed to save leaderboard:', e);
      }
    },

    clearLeaderboard() {
      try {
        localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify([]));
      } catch (e) {}
    },

    getCareerStats() {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.CAREER_STATS);
        if (!data) {
          return {
            tournamentsPlayed: 0,
            tournamentsWon: 0,
            matchesWon: 0,
            matchesLost: 0,
            currentStreak: 0,
            bestStreak: 0,
            gestureCounts: { [CHOICES.ROCK]: 0, [CHOICES.PAPER]: 0, [CHOICES.SCISSORS]: 0 }
          };
        }
        return JSON.parse(data);
      } catch (e) {
        return {
          tournamentsPlayed: 0,
          tournamentsWon: 0,
          matchesWon: 0,
          matchesLost: 0,
          currentStreak: 0,
          bestStreak: 0,
          gestureCounts: { [CHOICES.ROCK]: 0, [CHOICES.PAPER]: 0, [CHOICES.SCISSORS]: 0 }
        };
      }
    },

    updateCareerStats(updates) {
      try {
        const stats = this.getCareerStats();
        if (updates.tournamentsPlayed) stats.tournamentsPlayed += updates.tournamentsPlayed;
        if (updates.tournamentsWon) stats.tournamentsWon += updates.tournamentsWon;
        if (updates.matchesWon) stats.matchesWon += updates.matchesWon;
        if (updates.matchesLost) stats.matchesLost += updates.matchesLost;

        if (updates.streakIncrement) {
          stats.currentStreak += 1;
          if (stats.currentStreak > stats.bestStreak) stats.bestStreak = stats.currentStreak;
        } else if (updates.streakReset) {
          stats.currentStreak = 0;
        }

        if (updates.gesture) {
          stats.gestureCounts[updates.gesture] = (stats.gestureCounts[updates.gesture] || 0) + 1;
        }

        localStorage.setItem(STORAGE_KEYS.CAREER_STATS, JSON.stringify(stats));
        return stats;
      } catch (e) {
        return null;
      }
    }
  };

  /* --------------------------------------------------------------------------
   * 5. OPPONENT AI DECISION ENGINE (Distinct Personalities, Fair & Beatable)
   * -------------------------------------------------------------------------- */
  const BotBrain = {
    /**
     * Helper to select a random choice, optionally with custom weights.
     */
    weightedChoice(weights) {
      const sum = weights.rock + weights.paper + weights.scissors;
      const r = Math.random() * sum;
      if (r < weights.rock) return CHOICES.ROCK;
      if (r < weights.rock + weights.paper) return CHOICES.PAPER;
      return CHOICES.SCISSORS;
    },

    /**
     * Returns the move that BEATS the given move.
     */
    getCounterMove(move) {
      if (move === CHOICES.ROCK) return CHOICES.PAPER;
      if (move === CHOICES.PAPER) return CHOICES.SCISSORS;
      return CHOICES.ROCK;
    },

    /**
     * Returns the move that LOSES to the given move.
     */
    getLosingMove(move) {
      return CHOICE_BEATS[move];
    },

    /**
     * Compute computer choice based on opponent personality and selected difficulty.
     */
    decideMove(opponentRound, playerHistory, botHistory, difficulty) {
      // If no history yet, randomize
      if (playerHistory.length === 0) {
        return this.weightedChoice({ rock: 35, paper: 35, scissors: 30 });
      }

      const lastPlayerMove = playerHistory[playerHistory.length - 1];
      const lastBotMove = botHistory[botHistory.length - 1];

      // In 'casual' mode, introduce a 40% chance of making a suboptimal move
      if (difficulty === 'casual' && Math.random() < 0.4) {
        return this.getLosingMove(lastPlayerMove);
      }

      // --- ROUND 1: ROOKIE BOT ---
      // Beginner: 70% random, 30% favors Rock
      if (opponentRound === 1) {
        return this.weightedChoice({ rock: 45, paper: 25, scissors: 30 });
      }

      // --- ROUND 2: SMART BOT ---
      // Intermediate: Win-Stay, Lose-Shift Heuristic
      // If player won last turn, player often repeats it or shifts to what beats the bot.
      if (opponentRound === 2) {
        if (Math.random() < 0.35) {
          // Random exploration factor (keeps it fair)
          return this.weightedChoice({ rock: 33, paper: 33, scissors: 34 });
        }
        // Predict player will repeat winning move or counter bot's last move
        const predictedPlayerMove = lastPlayerMove;
        return this.getCounterMove(predictedPlayerMove);
      }

      // --- ROUND 3: MASTER BOT ---
      // Advanced: Markov Sequence Matrix (tracks transitions P(next | current))
      if (opponentRound === 3) {
        if (Math.random() < 0.3) {
          // 30% exploration noise so player can win with varied play
          return this.weightedChoice({ rock: 33, paper: 33, scissors: 34 });
        }

        const transitions = gameState.transitionMatrix[lastPlayerMove] || { rock: 1, paper: 1, scissors: 1 };
        // Find player's most frequent transition from their last move
        let predictedMove = CHOICES.ROCK;
        let maxCount = -1;
        for (const [choice, count] of Object.entries(transitions)) {
          if (count > maxCount) {
            maxCount = count;
            predictedMove = choice;
          }
        }
        return this.getCounterMove(predictedMove);
      }

      // --- ROUND 4: CHAMPION BOT ---
      // Grandmaster: Double-bluff counter & streak detection
      if (opponentRound === 4) {
        // 25% noise for beatability
        if (Math.random() < 0.25) {
          return this.weightedChoice({ rock: 33, paper: 33, scissors: 34 });
        }

        // Check if player repeated same move twice
        if (playerHistory.length >= 2 && playerHistory[playerHistory.length - 1] === playerHistory[playerHistory.length - 2]) {
          // Player often shifts away on 3rd move to avoid being too predictable.
          // The third move they wouldn't expect:
          const repeated = playerHistory[playerHistory.length - 1];
          const shiftOption = Object.values(CHOICES).find(c => c !== repeated);
          return this.getCounterMove(shiftOption);
        }

        // Counter player's most frequent move in the entire tournament run
        const counts = gameState.runGestureCounts;
        let mostFrequent = CHOICES.ROCK;
        let highest = -1;
        for (const [c, cnt] of Object.entries(counts)) {
          if (cnt > highest) {
            highest = cnt;
            mostFrequent = c;
          }
        }
        return this.getCounterMove(mostFrequent);
      }

      // Default safe fallback
      return this.weightedChoice({ rock: 34, paper: 33, scissors: 33 });
    }
  };

  /* --------------------------------------------------------------------------
   * 6. DOM ELEMENTS CACHE
   * -------------------------------------------------------------------------- */
  const DOM = {
    // Canvas
    canvas: document.getElementById('bg-canvas'),

    // Screens
    screenHome: document.getElementById('screen-home'),
    screenRegister: document.getElementById('screen-register'),
    screenDifficulty: document.getElementById('screen-difficulty'),
    screenArena: document.getElementById('screen-arena'),
    screenEnd: document.getElementById('screen-tournament-end'),
    screenLeaderboard: document.getElementById('screen-leaderboard'),
    screenInstructions: document.getElementById('screen-instructions'),

    // Modals
    modalStats: document.getElementById('modal-stats'),
    modalRoundResult: document.getElementById('modal-round-result'),
    modalConfirm: document.getElementById('modal-confirm'),

    // Global Header
    btnAudioToggle: document.getElementById('btn-audio-toggle'),
    audioIcon: document.getElementById('audio-icon'),
    btnStats: document.getElementById('btn-stats'),

    // Home Screen
    homeTournamentsWon: document.getElementById('home-tournaments-won'),
    homeWinRate: document.getElementById('home-win-rate'),
    homeBestStreak: document.getElementById('home-best-streak'),
    btnHomeStart: document.getElementById('btn-home-start'),
    btnHomeInstructions: document.getElementById('btn-home-instructions'),
    btnHomeLeaderboard: document.getElementById('btn-home-leaderboard'),

    // Registration Screen
    registerForm: document.getElementById('register-form'),
    playerUsername: document.getElementById('player-username'),
    btnRandomName: document.getElementById('btn-random-name'),
    usernameError: document.getElementById('username-error'),
    avatarOptions: document.querySelectorAll('.avatar-option'),
    btnRegisterNext: document.getElementById('btn-register-next'),
    btnBackHomeList: document.querySelectorAll('.btn-back-home'),

    // Difficulty Screen
    btnBackRegister: document.getElementById('btn-back-register'),
    difficultyCards: document.querySelectorAll('.difficulty-card'),
    btnStartTournament: document.getElementById('btn-start-tournament'),

    // Arena Screen
    bracketSteps: document.querySelectorAll('.round-step'),
    btnQuitTournament: document.getElementById('btn-quit-tournament'),
    arenaRoundTag: document.getElementById('arena-round-tag'),
    arenaDiffTag: document.getElementById('arena-diff-tag'),
    opponentAvatar: document.getElementById('opponent-avatar'),
    opponentName: document.getElementById('opponent-name'),
    opponentLevel: document.getElementById('opponent-level'),
    opponentDialogue: document.getElementById('opponent-dialogue'),
    opponentScoreOrbs: document.getElementById('opponent-score-orbs'),
    opponentChoiceDisplay: document.getElementById('opponent-choice-display'),
    opponentChoiceLabel: document.getElementById('opponent-choice-label'),
    playerNameDisplay: document.getElementById('player-name-display'),
    playerAvatarDisplay: document.getElementById('player-avatar-display'),
    playerScoreOrbs: document.getElementById('player-score-orbs'),
    playerChoiceDisplay: document.getElementById('player-choice-display'),
    playerChoiceLabel: document.getElementById('player-choice-label'),
    clashCountdown: document.getElementById('clash-countdown'),
    clashResultBanner: document.getElementById('clash-result-banner'),
    clashVerdict: document.getElementById('clash-verdict'),
    clashSub: document.getElementById('clash-sub'),
    arenaInstruction: document.getElementById('arena-instruction'),
    weaponBtns: document.querySelectorAll('.weapon-btn'),
    historyLog: document.getElementById('history-log'),

    // Round Result Modal
    roundResultTitle: document.getElementById('round-result-title'),
    roundResultSub: document.getElementById('round-result-sub'),
    modalResultIcon: document.getElementById('modal-result-icon'),
    resTurnsPlayed: document.getElementById('res-turns-played'),
    resPlayerWins: document.getElementById('res-player-wins'),
    resBotWins: document.getElementById('res-bot-wins'),
    resDraws: document.getElementById('res-draws'),
    btnNextRound: document.getElementById('btn-next-round'),

    // Tournament End Screen
    endVictoryContainer: document.getElementById('end-victory-container'),
    endDefeatContainer: document.getElementById('end-defeat-container'),
    defeatReason: document.getElementById('defeat-reason'),
    summaryPlayerName: document.getElementById('summary-player-name'),
    summaryDifficulty: document.getElementById('summary-difficulty'),
    summaryRoundsCleared: document.getElementById('summary-rounds-cleared'),
    summaryMatchesWon: document.getElementById('summary-matches-won'),
    summaryWinRate: document.getElementById('summary-win-rate'),
    summaryFavWeapon: document.getElementById('summary-fav-weapon'),
    btnPlayAgain: document.getElementById('btn-play-again'),
    btnEndLeaderboard: document.getElementById('btn-end-leaderboard'),
    btnEndHome: document.getElementById('btn-end-home'),

    // Leaderboard Screen
    leaderboardBody: document.getElementById('leaderboard-body'),
    leaderboardEmpty: document.getElementById('leaderboard-empty'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    btnClearLeaderboard: document.getElementById('btn-clear-leaderboard'),
    btnLeaderboardPlay: document.getElementById('btn-leaderboard-play'),

    // Instructions Screen
    btnInstructionsPlay: document.getElementById('btn-instructions-play'),

    // Stats Modal
    btnCloseStats: document.getElementById('btn-close-stats'),
    btnStatsCloseBottom: document.getElementById('btn-stats-close-bottom'),
    statTournamentsPlayed: document.getElementById('stat-tournaments-played'),
    statTournamentsWon: document.getElementById('stat-tournaments-won'),
    statMatchesWon: document.getElementById('stat-matches-won'),
    statMatchesLost: document.getElementById('stat-matches-lost'),
    statOverallWinRate: document.getElementById('stat-overall-winrate'),
    statCurrentStreak: document.getElementById('stat-current-streak'),
    statRockCount: document.getElementById('stat-rock-count'),
    statPaperCount: document.getElementById('stat-paper-count'),
    statScissorsCount: document.getElementById('stat-scissors-count'),
    barRock: document.getElementById('bar-rock'),
    barPaper: document.getElementById('bar-paper'),
    barScissors: document.getElementById('bar-scissors'),

    // Confirm Dialog
    confirmTitle: document.getElementById('confirm-title'),
    confirmDesc: document.getElementById('confirm-desc'),
    btnConfirmCancel: document.getElementById('btn-confirm-cancel'),
    btnConfirmOk: document.getElementById('btn-confirm-ok'),

    // Toast
    toastContainer: document.getElementById('toast-container')
  };

  /* --------------------------------------------------------------------------
   * 7. AMBIENT PARTICLE BACKGROUND (Interactive Canvas)
   * -------------------------------------------------------------------------- */
  class ParticleBackground {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.numParticles = 50;
      this.mouse = { x: null, y: null, radius: 120 };

      this.resize();
      this.init();
      this.bindEvents();
      this.animate = this.animate.bind(this);
      requestAnimationFrame(this.animate);
    }

    resize() {
      this.width = this.canvas.width = window.innerWidth;
      this.height = this.canvas.height = window.innerHeight;
      this.numParticles = Math.min(65, Math.floor((this.width * this.height) / 18000));
    }

    init() {
      this.particles = [];
      for (let i = 0; i < this.numParticles; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 2 + 1,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          color: Math.random() > 0.5 ? 'rgba(56, 189, 248, ' : 'rgba(168, 85, 247, ',
          alpha: Math.random() * 0.6 + 0.2
        });
      }
    }

    bindEvents() {
      window.addEventListener('resize', () => {
        this.resize();
        this.init();
      });

      window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      });

      window.addEventListener('mouseout', () => {
        this.mouse.x = null;
        this.mouse.y = null;
      });
    }

    animate() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Connect particles within distance
      for (let i = 0; i < this.particles.length; i++) {
        const p1 = this.particles[i];

        // Update position
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Bounce on boundary
        if (p1.x < 0 || p1.x > this.width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > this.height) p1.vy *= -1;

        // Mouse avoidance/attraction
        if (this.mouse.x !== null) {
          const dx = this.mouse.x - p1.x;
          const dy = this.mouse.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < this.mouse.radius) {
            p1.x -= dx * 0.02;
            p1.y -= dy * 0.02;
          }
        }

        // Draw particle
        this.ctx.beginPath();
        this.ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = p1.color + p1.alpha + ')';
        this.ctx.fill();

        // Connect with nearby particles
        for (let j = i + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(147, 197, 253, ${0.15 * (1 - dist / 110)})`;
            this.ctx.lineWidth = 0.8;
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();
          }
        }
      }

      requestAnimationFrame(this.animate);
    }
  }

  /* --------------------------------------------------------------------------
   * 8. NAVIGATION & SCREEN CONTROLLER
   * -------------------------------------------------------------------------- */
  const ScreenRouter = {
    screens: [
      DOM.screenHome,
      DOM.screenRegister,
      DOM.screenDifficulty,
      DOM.screenArena,
      DOM.screenEnd,
      DOM.screenLeaderboard,
      DOM.screenInstructions
    ],

    show(screenEl) {
      this.screens.forEach(s => {
        if (s) s.classList.remove('active');
      });
      if (screenEl) {
        screenEl.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      this.onScreenChange(screenEl);
    },

    onScreenChange(screenEl) {
      if (screenEl === DOM.screenHome) {
        updateHomeStats();
      } else if (screenEl === DOM.screenLeaderboard) {
        renderLeaderboard('tournaments');
      }
    }
  };

  /* --------------------------------------------------------------------------
   * 9. UI HELPERS & NOTIFICATIONS
   * -------------------------------------------------------------------------- */
  function showToast(message, icon = '⚡') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    DOM.toastContainer.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3200);
  }

  function showConfirmDialog({ title, desc, onOk }) {
    sound.play('click');
    DOM.confirmTitle.textContent = title || 'Are you sure?';
    DOM.confirmDesc.textContent = desc || 'Please confirm this action.';
    DOM.modalConfirm.classList.remove('hidden');

    const handleOk = () => {
      DOM.modalConfirm.classList.add('hidden');
      cleanup();
      if (typeof onOk === 'function') onOk();
    };

    const handleCancel = () => {
      DOM.modalConfirm.classList.add('hidden');
      cleanup();
    };

    const cleanup = () => {
      DOM.btnConfirmOk.removeEventListener('click', handleOk);
      DOM.btnConfirmCancel.removeEventListener('click', handleCancel);
    };

    DOM.btnConfirmOk.addEventListener('click', handleOk);
    DOM.btnConfirmCancel.addEventListener('click', handleCancel);
  }

  function updateHomeStats() {
    const stats = StorageManager.getCareerStats();
    DOM.homeTournamentsWon.textContent = stats.tournamentsWon || 0;
    const totalMatches = (stats.matchesWon || 0) + (stats.matchesLost || 0);
    const winRate = totalMatches > 0 ? Math.round((stats.matchesWon / totalMatches) * 100) : 0;
    DOM.homeWinRate.textContent = `${winRate}%`;
    DOM.homeBestStreak.textContent = stats.bestStreak || 0;
  }

  /* --------------------------------------------------------------------------
   * 10. TOURNAMENT ENGINE
   * -------------------------------------------------------------------------- */
  const Tournament = {
    /**
     * Start a new tournament run with the current player & difficulty settings.
     */
    initRun() {
      gameState.currentRoundIndex = 0;
      gameState.playerMatchWins = 0;
      gameState.opponentMatchWins = 0;
      gameState.playerMoveHistory = [];
      gameState.botMoveHistory = [];
      gameState.runTurnsPlayed = 0;
      gameState.runPlayerWins = 0;
      gameState.runBotWins = 0;
      gameState.runDraws = 0;
      gameState.runGestureCounts = { [CHOICES.ROCK]: 0, [CHOICES.PAPER]: 0, [CHOICES.SCISSORS]: 0 };

      // Reset transition matrix
      gameState.transitionMatrix = {
        [CHOICES.ROCK]: { [CHOICES.ROCK]: 1, [CHOICES.PAPER]: 1, [CHOICES.SCISSORS]: 1 },
        [CHOICES.PAPER]: { [CHOICES.ROCK]: 1, [CHOICES.PAPER]: 1, [CHOICES.SCISSORS]: 1 },
        [CHOICES.SCISSORS]: { [CHOICES.ROCK]: 1, [CHOICES.PAPER]: 1, [CHOICES.SCISSORS]: 1 }
      };

      StorageManager.updateCareerStats({ tournamentsPlayed: 1 });
      this.setupRound(0);
      ScreenRouter.show(DOM.screenArena);
      showToast(`Tournament Started! Round 1: Quarterfinal`, '⚔️');
    },

    /**
     * Set up match state and UI for a specific tournament round.
     */
    setupRound(roundIndex) {
      gameState.currentRoundIndex = roundIndex;
      gameState.playerMatchWins = 0;
      gameState.opponentMatchWins = 0;
      gameState.matchTurns = [];
      gameState.isTurnInProgress = false;

      const opp = OPPONENTS[roundIndex];

      // Update Bracket Indicator
      DOM.bracketSteps.forEach((step, idx) => {
        step.classList.remove('active', 'completed', 'locked');
        if (idx < roundIndex) {
          step.classList.add('completed');
        } else if (idx === roundIndex) {
          step.classList.add('active');
        } else {
          step.classList.add('locked');
        }
      });

      // Update Round Meta
      const roundNames = ['QUARTERFINAL', 'SEMIFINAL', 'FINAL', 'CHAMPIONSHIP BONUS MATCH'];
      DOM.arenaRoundTag.textContent = `ROUND ${roundIndex + 1}: ${roundNames[roundIndex]}`;
      DOM.arenaDiffTag.textContent = gameState.difficulty.toUpperCase();

      // Update Opponent Card
      DOM.opponentAvatar.src = opp.avatar;
      DOM.opponentName.textContent = opp.name;
      DOM.opponentLevel.textContent = opp.level;
      DOM.opponentDialogue.textContent = `"${opp.quotes.intro}"`;

      // Update Player Card
      DOM.playerNameDisplay.textContent = gameState.username;
      DOM.playerAvatarDisplay.textContent = gameState.avatar;

      // Reset Score Orbs
      this.updateScoreOrbs();

      // Reset Choice Displays
      this.resetChoiceBoxes();

      // Reset History Strip
      DOM.historyLog.innerHTML = '<span class="empty-log">Round just started. Choose your first move!</span>';

      // Reset Clash UI
      DOM.clashCountdown.classList.add('hidden');
      DOM.clashResultBanner.classList.add('hidden');
      DOM.arenaInstruction.textContent = 'Pick your weapon below:';

      // Enable Weapon Buttons
      this.setWeaponsEnabled(true);
    },

    /**
     * Reset the interactive choice reveal boxes back to mystery state.
     */
    resetChoiceBoxes() {
      DOM.playerChoiceDisplay.className = 'choice-slot';
      DOM.playerChoiceDisplay.innerHTML = '<span class="mystery-q">?</span>';
      DOM.playerChoiceLabel.textContent = 'Your Move';

      DOM.opponentChoiceDisplay.className = 'choice-slot';
      DOM.opponentChoiceDisplay.innerHTML = '<span class="mystery-q">?</span>';
      DOM.opponentChoiceLabel.textContent = 'Waiting...';
    },

    /**
     * Update the visual Best-of-3 score orbs.
     */
    updateScoreOrbs() {
      const oppOrbs = DOM.opponentScoreOrbs.querySelectorAll('.orb');
      const playerOrbs = DOM.playerScoreOrbs.querySelectorAll('.orb');

      oppOrbs.forEach((orb, i) => {
        orb.classList.toggle('won', i < gameState.opponentMatchWins);
      });

      playerOrbs.forEach((orb, i) => {
        orb.classList.toggle('won', i < gameState.playerMatchWins);
      });
    },

    /**
     * Enable or disable the Rock, Paper, Scissors buttons.
     */
    setWeaponsEnabled(enabled) {
      DOM.weaponBtns.forEach(btn => {
        btn.disabled = !enabled;
        btn.classList.toggle('disabled', !enabled);
        if (enabled) {
          btn.classList.remove('selected-weapon');
        }
      });
    },

    /**
     * Handle user selection of Rock, Paper, or Scissors.
     */
    handlePlayerChoice(choice) {
      if (gameState.isTurnInProgress) return;
      gameState.isTurnInProgress = true;
      sound.play('click');

      // Highlight selected button & lock controls
      DOM.weaponBtns.forEach(btn => {
        if (btn.dataset.choice === choice) {
          btn.classList.add('selected-weapon');
        }
      });
      this.setWeaponsEnabled(false);

      // Track statistics
      gameState.runGestureCounts[choice] = (gameState.runGestureCounts[choice] || 0) + 1;
      StorageManager.updateCareerStats({ gesture: choice });

      // If player had a previous move, update Markov transition count
      if (gameState.playerMoveHistory.length > 0) {
        const prevMove = gameState.playerMoveHistory[gameState.playerMoveHistory.length - 1];
        if (gameState.transitionMatrix[prevMove]) {
          gameState.transitionMatrix[prevMove][choice] = (gameState.transitionMatrix[prevMove][choice] || 0) + 1;
        }
      }

      // Display Player Pick
      const pInfo = CHOICE_INFO[choice];
      DOM.playerChoiceDisplay.className = 'choice-slot revealed';
      DOM.playerChoiceDisplay.innerHTML = `<img src="${pInfo.icon}" alt="${pInfo.name}">`;
      DOM.playerChoiceLabel.textContent = pInfo.name;

      // Start Bot animated preparation
      DOM.opponentChoiceDisplay.className = 'choice-slot shake';
      DOM.opponentChoiceDisplay.innerHTML = `<span class="mystery-q">✊</span>`;
      DOM.opponentChoiceLabel.textContent = 'Thinking...';

      // Decide bot choice in advance based on algorithms
      const botChoice = BotBrain.decideMove(
        gameState.currentRoundIndex + 1,
        gameState.playerMoveHistory,
        gameState.botMoveHistory,
        gameState.difficulty
      );

      // Start Countdown Sequence
      this.runCountdown(() => {
        this.resolveTurn(choice, botChoice);
      });
    },

    /**
     * Animated Countdown (3... 2... 1... SHOOT!)
     */
    runCountdown(onComplete) {
      DOM.clashResultBanner.classList.add('hidden');
      DOM.clashCountdown.classList.remove('hidden');

      // Duration adjusted by difficulty
      const stepDuration = gameState.difficulty === 'hardcore' ? 500 : 700;
      const countSteps = ['3', '2', '1', 'GO!'];
      let stepIndex = 0;

      const tick = () => {
        DOM.clashCountdown.textContent = countSteps[stepIndex];
        sound.play('countdown');

        stepIndex++;
        if (stepIndex < countSteps.length) {
          setTimeout(tick, stepDuration);
        } else {
          setTimeout(() => {
            DOM.clashCountdown.classList.add('hidden');
            if (typeof onComplete === 'function') onComplete();
          }, 350);
        }
      };

      tick();
    },

    /**
     * Resolve the outcome of a single clash turn.
     */
    resolveTurn(playerChoice, botChoice) {
      // Append to histories
      gameState.playerMoveHistory.push(playerChoice);
      gameState.botMoveHistory.push(botChoice);
      gameState.runTurnsPlayed++;

      const opp = OPPONENTS[gameState.currentRoundIndex];
      const botInfo = CHOICE_INFO[botChoice];
      const playerInfo = CHOICE_INFO[playerChoice];

      // Reveal Opponent Choice
      DOM.opponentChoiceDisplay.className = 'choice-slot revealed';
      DOM.opponentChoiceDisplay.innerHTML = `<img src="${botInfo.icon}" alt="${botInfo.name}">`;
      DOM.opponentChoiceLabel.textContent = botInfo.name;

      sound.play('clash');

      // Calculate outcome
      let verdict = 'draw'; // 'win' | 'lose' | 'draw'
      let message = '';

      if (playerChoice === botChoice) {
        verdict = 'draw';
        message = `Both chose ${playerInfo.name}. Turn is a Draw!`;
        gameState.runDraws++;
        sound.play('draw');
        DOM.opponentDialogue.textContent = `"${opp.quotes.draw}"`;
      } else if (CHOICE_BEATS[playerChoice] === botChoice) {
        verdict = 'win';
        message = `${playerInfo.name} ${playerInfo.action} ${botInfo.name}! You scored a point!`;
        gameState.playerMatchWins++;
        gameState.runPlayerWins++;
        sound.play('win');
        DOM.opponentDialogue.textContent = `"${opp.quotes.lose}"`;
        StorageManager.updateCareerStats({ streakIncrement: true });
      } else {
        verdict = 'lose';
        message = `${botInfo.name} ${botInfo.action} ${playerInfo.name}! ${opp.name} scored a point!`;
        gameState.opponentMatchWins++;
        gameState.runBotWins++;
        sound.play('lose');
        DOM.opponentDialogue.textContent = `"${opp.quotes.win}"`;
        StorageManager.updateCareerStats({ streakReset: true });
      }

      // Update Score Orbs
      this.updateScoreOrbs();

      // Display Clash Banner
      DOM.clashResultBanner.classList.remove('hidden');
      DOM.clashVerdict.className = verdict;
      DOM.clashVerdict.textContent = verdict === 'win' ? 'POINT SCORED!' : (verdict === 'lose' ? 'POINT CONCEDED!' : 'DRAW TURN!');
      DOM.clashSub.textContent = message;

      // Log into match history strip
      this.logTurn(playerChoice, botChoice, verdict);

      // Check for match completion (First to 2 wins)
      setTimeout(() => {
        if (gameState.playerMatchWins >= 2) {
          this.handleRoundVictory();
        } else if (gameState.opponentMatchWins >= 2) {
          this.handleRoundDefeat();
        } else {
          // Prepare for next turn
          DOM.arenaInstruction.textContent = 'Next turn ready. Choose your weapon!';
          gameState.isTurnInProgress = false;
          this.setWeaponsEnabled(true);
        }
      }, 1600);
    },

    /**
     * Add turn entry pill to the match history strip.
     */
    logTurn(pChoice, bChoice, verdict) {
      if (DOM.historyLog.querySelector('.empty-log')) {
        DOM.historyLog.innerHTML = '';
      }

      const entry = document.createElement('div');
      entry.className = `history-entry ${verdict}`;
      const pEmoji = CHOICE_INFO[pChoice].emoji;
      const bEmoji = CHOICE_INFO[bChoice].emoji;
      const label = verdict === 'win' ? 'W' : (verdict === 'lose' ? 'L' : 'D');

      entry.innerHTML = `<span>${pEmoji} vs ${bEmoji}</span> <span>[${label}]</span>`;
      DOM.historyLog.prepend(entry);
    },

    /**
     * Round Victory (First to 2 points)
     */
    handleRoundVictory() {
      const opp = OPPONENTS[gameState.currentRoundIndex];
      StorageManager.updateCareerStats({ matchesWon: 1 });

      const isChampionship = gameState.currentRoundIndex === 3;

      if (isChampionship) {
        // Tournament Grand Victory!
        this.handleTournamentGrandVictory();
      } else {
        // Show Round Result Modal to advance to next round
        sound.play('victory');
        const nextRoundIndex = gameState.currentRoundIndex + 1;
        const nextOpp = OPPONENTS[nextRoundIndex];

        DOM.modalResultIcon.textContent = '🎉';
        DOM.roundResultTitle.textContent = `ROUND ${gameState.currentRoundIndex + 1} CLEARED!`;
        DOM.roundResultSub.textContent = `You conquered ${opp.name} (${gameState.playerMatchWins} - ${gameState.opponentMatchWins})`;

        DOM.resTurnsPlayed.textContent = gameState.matchTurns.length || (gameState.playerMatchWins + gameState.opponentMatchWins);
        DOM.resPlayerWins.textContent = gameState.playerMatchWins;
        DOM.resBotWins.textContent = gameState.opponentMatchWins;
        DOM.resDraws.textContent = gameState.runDraws;

        DOM.btnNextRound.textContent = `Advance to ${nextOpp.name} (${nextOpp.title}) →`;
        DOM.modalRoundResult.classList.remove('hidden');
      }
    },

    /**
     * Advance to the next tournament round after winning.
     */
    advanceToNextRound() {
      DOM.modalRoundResult.classList.add('hidden');
      const nextRound = gameState.currentRoundIndex + 1;
      this.setupRound(nextRound);
      showToast(`Entering Round ${nextRound + 1}! Opponent: ${OPPONENTS[nextRound].name}`, '⚡');
    },

    /**
     * Player Defeat in Round (First to 2 points by Bot) -> Elimination
     */
    handleRoundDefeat() {
      const opp = OPPONENTS[gameState.currentRoundIndex];
      StorageManager.updateCareerStats({ matchesLost: 1 });
      sound.play('lose');

      // Populate Tournament End Screen as Defeat
      DOM.endVictoryContainer.classList.add('hidden');
      DOM.endDefeatContainer.classList.remove('hidden');
      DOM.defeatReason.textContent = `You fought valiantly, but ${opp.name} secured the round (${gameState.opponentMatchWins} - ${gameState.playerMatchWins}). Your tournament run has concluded.`;

      this.populateEndRunSummary(false);
      ScreenRouter.show(DOM.screenEnd);
    },

    /**
     * Grand Tournament Championship Victory!
     */
    handleTournamentGrandVictory() {
      sound.play('victory');
      StorageManager.updateCareerStats({ tournamentsWon: 1 });

      // Save to Leaderboard
      const totalTurns = gameState.runTurnsPlayed;
      const winRate = totalTurns > 0 ? Math.round((gameState.runPlayerWins / totalTurns) * 100) : 100;

      StorageManager.saveLeaderboardEntry({
        username: gameState.username,
        avatar: gameState.avatar,
        tournamentsWon: 1,
        matchesWon: 4, // Cleared 4 rounds
        winRate: winRate,
        difficulty: gameState.difficulty,
        date: new Date().toISOString().split('T')[0]
      });

      // Show Victory End Screen
      DOM.endVictoryContainer.classList.remove('hidden');
      DOM.endDefeatContainer.classList.add('hidden');

      this.populateEndRunSummary(true);
      ScreenRouter.show(DOM.screenEnd);

      // Trigger Confetti
      triggerConfetti();
    },

    /**
     * Fill the End Game summary card with run statistics.
     */
    populateEndRunSummary(isVictory) {
      DOM.summaryPlayerName.textContent = gameState.username;
      DOM.summaryDifficulty.textContent = gameState.difficulty.toUpperCase();
      DOM.summaryRoundsCleared.textContent = isVictory ? '4 / 4 (CHAMPION)' : `${gameState.currentRoundIndex} / 4`;
      DOM.summaryMatchesWon.textContent = `${gameState.currentRoundIndex + (isVictory ? 1 : 0)} Rounds`;

      const totalClashes = gameState.runPlayerWins + gameState.runBotWins + gameState.runDraws;
      const rate = totalClashes > 0 ? Math.round((gameState.runPlayerWins / totalClashes) * 100) : 0;
      DOM.summaryWinRate.textContent = `${rate}%`;

      // Determine favorite gesture
      const counts = gameState.runGestureCounts;
      let fav = CHOICES.ROCK;
      let maxCnt = -1;
      for (const [c, cnt] of Object.entries(counts)) {
        if (cnt > maxCnt) {
          maxCnt = cnt;
          fav = c;
        }
      }
      DOM.summaryFavWeapon.textContent = `${CHOICE_INFO[fav].name} (${CHOICE_INFO[fav].emoji})`;
    }
  };

  /* --------------------------------------------------------------------------
   * 11. CONFETTI CELEBRATION EFFECT (Canvas Based)
   * -------------------------------------------------------------------------- */
  function triggerConfetti() {
    const canvas = DOM.canvas;
    const ctx = canvas.getContext('2d');
    const confettiCount = 120;
    const confetti = [];
    const colors = ['#38bdf8', '#a855f7', '#facc15', '#22c55e', '#ec4899', '#ffffff'];

    for (let i = 0; i < confettiCount; i++) {
      confetti.push({
        x: canvas.width / 2,
        y: canvas.height * 0.4,
        w: Math.random() * 8 + 4,
        h: Math.random() * 12 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 16,
        vy: Math.random() * -14 - 4,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        gravity: 0.35,
        opacity: 1
      });
    }

    let frames = 0;
    function renderConfetti() {
      frames++;
      for (let i = 0; i < confetti.length; i++) {
        const c = confetti[i];
        c.x += c.vx;
        c.y += c.vy;
        c.vy += c.gravity;
        c.rotation += c.vRot;
        if (frames > 80) c.opacity -= 0.015;

        if (c.opacity > 0) {
          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.rotate((c.rotation * Math.PI) / 180);
          ctx.fillStyle = c.color;
          ctx.globalAlpha = Math.max(0, c.opacity);
          ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
          ctx.restore();
        }
      }

      if (frames < 180) {
        requestAnimationFrame(renderConfetti);
      }
    }

    renderConfetti();
  }

  /* --------------------------------------------------------------------------
   * 12. LEADERBOARD UI CONTROLLER
   * -------------------------------------------------------------------------- */
  function renderLeaderboard(sortKey = 'tournaments') {
    const data = StorageManager.getLeaderboard();

    // Sort by requested criterion
    if (sortKey === 'tournaments') {
      data.sort((a, b) => (b.tournamentsWon || 0) - (a.tournamentsWon || 0) || (b.matchesWon || 0) - (a.matchesWon || 0));
    } else if (sortKey === 'matches') {
      data.sort((a, b) => (b.matchesWon || 0) - (a.matchesWon || 0) || (b.tournamentsWon || 0) - (a.tournamentsWon || 0));
    } else if (sortKey === 'winrate') {
      data.sort((a, b) => (b.winRate || 0) - (a.winRate || 0));
    }

    DOM.leaderboardBody.innerHTML = '';

    if (data.length === 0) {
      DOM.leaderboardEmpty.classList.remove('hidden');
      return;
    }
    DOM.leaderboardEmpty.classList.add('hidden');

    data.forEach((entry, idx) => {
      const tr = document.createElement('tr');

      let rankClass = '';
      let rankBadge = `#${idx + 1}`;
      if (idx === 0) { rankClass = 'rank-gold'; rankBadge = '🥇 1st'; }
      else if (idx === 1) { rankClass = 'rank-silver'; rankBadge = '🥈 2nd'; }
      else if (idx === 2) { rankClass = 'rank-bronze'; rankBadge = '🥉 3rd'; }

      tr.innerHTML = `
        <td class="rank-cell ${rankClass}">${rankBadge}</td>
        <td>
          <div class="fighter-name-cell">
            <span>${entry.avatar || '⚡'}</span>
            <strong>${escapeHtml(entry.username)}</strong>
          </div>
        </td>
        <td><strong>${entry.tournamentsWon || 0}</strong></td>
        <td>${entry.matchesWon || 0}</td>
        <td><span class="pill-tag">${entry.winRate || 0}%</span></td>
        <td><span class="pill-tag diff">${(entry.difficulty || 'standard').toUpperCase()}</span></td>
        <td style="color: var(--text-dim); font-size: 0.82rem;">${entry.date || 'Recent'}</td>
      `;
      DOM.leaderboardBody.appendChild(tr);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  /* --------------------------------------------------------------------------
   * 13. CAREER STATISTICS MODAL CONTROLLER
   * -------------------------------------------------------------------------- */
  function openStatsModal() {
    sound.play('click');
    const stats = StorageManager.getCareerStats();

    DOM.statTournamentsPlayed.textContent = stats.tournamentsPlayed || 0;
    DOM.statTournamentsWon.textContent = stats.tournamentsWon || 0;
    DOM.statMatchesWon.textContent = stats.matchesWon || 0;
    DOM.statMatchesLost.textContent = stats.matchesLost || 0;

    const totalMatches = (stats.matchesWon || 0) + (stats.matchesLost || 0);
    const winRate = totalMatches > 0 ? Math.round((stats.matchesWon / totalMatches) * 100) : 0;
    DOM.statOverallWinRate.textContent = `${winRate}%`;
    DOM.statCurrentStreak.textContent = stats.currentStreak || 0;

    // Gesture distributions
    const r = stats.gestureCounts[CHOICES.ROCK] || 0;
    const p = stats.gestureCounts[CHOICES.PAPER] || 0;
    const s = stats.gestureCounts[CHOICES.SCISSORS] || 0;
    const totalGestures = r + p + s || 1;

    const rPct = Math.round((r / totalGestures) * 100);
    const pPct = Math.round((p / totalGestures) * 100);
    const sPct = 100 - rPct - pPct;

    DOM.statRockCount.textContent = `${r} (${rPct}%)`;
    DOM.statPaperCount.textContent = `${p} (${pPct}%)`;
    DOM.statScissorsCount.textContent = `${s} (${sPct}%)`;

    DOM.barRock.style.width = `${Math.max(5, rPct)}%`;
    DOM.barPaper.style.width = `${Math.max(5, pPct)}%`;
    DOM.barScissors.style.width = `${Math.max(5, sPct)}%`;

    DOM.modalStats.classList.remove('hidden');
  }

  function closeStatsModal() {
    sound.play('click');
    DOM.modalStats.classList.add('hidden');
  }

  /* --------------------------------------------------------------------------
   * 14. EVENT LISTENERS & INITIALIZATION
   * -------------------------------------------------------------------------- */
  function bindEvents() {
    // Audio Toggle
    DOM.btnAudioToggle.addEventListener('click', () => {
      gameState.isMuted = !gameState.isMuted;
      DOM.audioIcon.textContent = gameState.isMuted ? '🔇' : '🔊';
      localStorage.setItem(STORAGE_KEYS.AUDIO_MUTED, gameState.isMuted ? '1' : '0');
      if (!gameState.isMuted) sound.play('click');
      showToast(gameState.isMuted ? 'Audio muted' : 'Audio unmuted', gameState.isMuted ? '🔇' : '🔊');
    });

    // Stats Modal Open/Close
    DOM.btnStats.addEventListener('click', openStatsModal);
    DOM.btnCloseStats.addEventListener('click', closeStatsModal);
    DOM.btnStatsCloseBottom.addEventListener('click', closeStatsModal);

    // Home Navigation
    DOM.btnHomeStart.addEventListener('click', () => {
      sound.play('click');
      ScreenRouter.show(DOM.screenRegister);
      setTimeout(() => DOM.playerUsername.focus(), 150);
    });

    DOM.btnHomeInstructions.addEventListener('click', () => {
      sound.play('click');
      ScreenRouter.show(DOM.screenInstructions);
    });

    DOM.btnHomeLeaderboard.addEventListener('click', () => {
      sound.play('click');
      ScreenRouter.show(DOM.screenLeaderboard);
    });

    DOM.btnBackHomeList.forEach(btn => {
      btn.addEventListener('click', () => {
        sound.play('click');
        ScreenRouter.show(DOM.screenHome);
      });
    });

    // Registration Form
    DOM.btnRandomName.addEventListener('click', () => {
      sound.play('click');
      const random = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
      DOM.playerUsername.value = random;
      DOM.usernameError.textContent = '';
    });

    DOM.avatarOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        sound.play('click');
        DOM.avatarOptions.forEach(o => {
          o.classList.remove('selected');
          o.setAttribute('aria-checked', 'false');
        });
        opt.classList.add('selected');
        opt.setAttribute('aria-checked', 'true');
        gameState.avatar = opt.dataset.avatar;
      });
    });

    DOM.registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = DOM.playerUsername.value.trim();
      if (!val) {
        DOM.usernameError.textContent = 'Please enter a codename to proceed.';
        return;
      }
      if (val.length < 2 || val.length > 15) {
        DOM.usernameError.textContent = 'Codename must be between 2 and 15 characters.';
        return;
      }
      DOM.usernameError.textContent = '';
      gameState.username = val;
      localStorage.setItem(STORAGE_KEYS.LAST_USER, val);
      sound.play('click');
      ScreenRouter.show(DOM.screenDifficulty);
    });

    DOM.btnBackRegister.addEventListener('click', () => {
      sound.play('click');
      ScreenRouter.show(DOM.screenRegister);
    });

    // Difficulty Selection
    DOM.difficultyCards.forEach(card => {
      card.addEventListener('click', () => {
        sound.play('click');
        DOM.difficultyCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        gameState.difficulty = card.dataset.difficulty;
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });

    DOM.btnStartTournament.addEventListener('click', () => {
      sound.play('click');
      Tournament.initRun();
    });

    // Arena Controls
    DOM.btnQuitTournament.addEventListener('click', () => {
      showConfirmDialog({
        title: 'Forfeit Tournament?',
        desc: 'Giving up now will terminate your current tournament streak and reset your progress.',
        onOk: () => {
          StorageManager.updateCareerStats({ streakReset: true });
          showToast('Tournament forfeited', '⚠️');
          ScreenRouter.show(DOM.screenHome);
        }
      });
    });

    // Weapon Choices (Click)
    DOM.weaponBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const choice = btn.dataset.choice;
        Tournament.handlePlayerChoice(choice);
      });
    });

    // Keyboard Shortcuts (1/R = Rock, 2/P = Paper, 3/S = Scissors, Esc = Close Modal)
    window.addEventListener('keydown', (e) => {
      // If modal is active and Esc pressed, close it
      if (e.key === 'Escape') {
        if (!DOM.modalStats.classList.contains('hidden')) closeStatsModal();
        if (!DOM.modalConfirm.classList.contains('hidden')) DOM.modalConfirm.classList.add('hidden');
        return;
      }

      // Hotkeys only apply when arena is visible and input is active
      if (!DOM.screenArena.classList.contains('active')) return;
      if (gameState.isTurnInProgress) return;

      const key = e.key.toLowerCase();
      if (key === '1' || key === 'r') {
        Tournament.handlePlayerChoice(CHOICES.ROCK);
      } else if (key === '2' || key === 'p') {
        Tournament.handlePlayerChoice(CHOICES.PAPER);
      } else if (key === '3' || key === 's') {
        Tournament.handlePlayerChoice(CHOICES.SCISSORS);
      }
    });

    // Round Result Modal Next Round
    DOM.btnNextRound.addEventListener('click', () => {
      sound.play('click');
      Tournament.advanceToNextRound();
    });

    // Tournament End Screen Navigation
    DOM.btnPlayAgain.addEventListener('click', () => {
      sound.play('click');
      ScreenRouter.show(DOM.screenDifficulty);
    });

    DOM.btnEndLeaderboard.addEventListener('click', () => {
      sound.play('click');
      ScreenRouter.show(DOM.screenLeaderboard);
    });

    DOM.btnEndHome.addEventListener('click', () => {
      sound.play('click');
      ScreenRouter.show(DOM.screenHome);
    });

    // Leaderboard Tabs & Actions
    DOM.tabBtns.forEach(tab => {
      tab.addEventListener('click', () => {
        sound.play('click');
        DOM.tabBtns.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        renderLeaderboard(tab.dataset.sort);
      });
    });

    DOM.btnClearLeaderboard.addEventListener('click', () => {
      showConfirmDialog({
        title: 'Clear Leaderboard?',
        desc: 'This will erase all recorded champion entries in local storage permanently.',
        onOk: () => {
          StorageManager.clearLeaderboard();
          renderLeaderboard('tournaments');
          showToast('Leaderboard data cleared', '🗑️');
        }
      });
    });

    DOM.btnLeaderboardPlay.addEventListener('click', () => {
      sound.play('click');
      ScreenRouter.show(DOM.screenRegister);
    });

    // Instructions Screen Start
    DOM.btnInstructionsPlay.addEventListener('click', () => {
      sound.play('click');
      ScreenRouter.show(DOM.screenRegister);
    });

    // Global Modal Backdrop Click to Close (when clicking outside content)
    [DOM.modalStats, DOM.modalConfirm].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
        }
      });
    });
  }

  function initApp() {
    // Initialize Canvas Particles
    new ParticleBackground(DOM.canvas);

    // Load Mute State
    try {
      const savedMute = localStorage.getItem(STORAGE_KEYS.AUDIO_MUTED);
      if (savedMute === '1') {
        gameState.isMuted = true;
        DOM.audioIcon.textContent = '🔇';
      }
    } catch (e) {}

    // Load Last Username
    try {
      const lastUser = localStorage.getItem(STORAGE_KEYS.LAST_USER);
      if (lastUser) {
        DOM.playerUsername.value = lastUser;
      }
    } catch (e) {}

    // Bind all events
    bindEvents();

    // Setup Android back button navigation
    setupBackButtonNavigation();

    // Refresh Home Stats
    updateHomeStats();
  }

  function setupBackButtonNavigation() {
    const handleBackAction = () => {
      // 1. If Confirmation dialog is open, close it
      if (!DOM.modalConfirm.classList.contains('hidden')) {
        DOM.modalConfirm.classList.add('hidden');
        return true;
      }
      // 2. If Stats modal is open, close it
      if (!DOM.modalStats.classList.contains('hidden')) {
        closeStatsModal();
        return true;
      }
      // 3. If Round Result modal is open, advance to next round
      if (!DOM.modalRoundResult.classList.contains('hidden')) {
        Tournament.advanceToNextRound();
        return true;
      }
      // 4. If on Arena screen, trigger quit confirmation
      if (DOM.screenArena.classList.contains('active')) {
        DOM.btnQuitTournament.click();
        return true;
      }
      // 5. If on Difficulty screen, go back to Registration
      if (DOM.screenDifficulty.classList.contains('active')) {
        DOM.btnBackRegister.click();
        return true;
      }
      // 6. If on Registration, Leaderboard, Instructions, or End, go back to Home
      if (
        DOM.screenRegister.classList.contains('active') ||
        DOM.screenLeaderboard.classList.contains('active') ||
        DOM.screenInstructions.classList.contains('active') ||
        DOM.screenEnd.classList.contains('active')
      ) {
        ScreenRouter.show(DOM.screenHome);
        return true;
      }
      // 7. On Home screen, if Capacitor App plugin exists, exit
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        window.Capacitor.Plugins.App.exitApp();
        return true;
      }
      return false;
    };

    // Capacitor App Plugin Listener
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
      window.Capacitor.Plugins.App.addListener('backButton', () => {
        handleBackAction();
      });
    }

    // Standard Android WebView backbutton event
    document.addEventListener('backbutton', (e) => {
      e.preventDefault();
      handleBackAction();
    }, false);
  }

  // Launch when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
