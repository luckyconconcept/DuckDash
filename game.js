const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const WATER_SURFACE_Y = 456;
const WATERLINE = 500;
const DUCK_WATERLINE = 476;
const WATER_TUNING_MODE = false;
const STORAGE_KEY = "duck-dash-stats";
const PLAYER_NAME_KEY = "duck-dash-player-name";
const TELEMETRY_KEY = "duck-dash-last-run-telemetry";
const DEFAULT_PLAYER_NAME = "BadeEnte";
const FALLBACK_NAMES = ["QuakMeister", "SplashKing", "DuckHero", "BadeEnte", "WaterNinja"];
const COLLECTIBLE_LANES = [
  { name: "top", y: WATER_SURFACE_Y - 132, underwater: false },
  { name: "surface", y: WATER_SURFACE_Y + 6, underwater: false },
  { name: "underwater", y: WATER_SURFACE_Y + 108, underwater: true },
];
const DIVE_MIN_DURATION = 420;
const DIVE_MAX_DURATION = 920;
const DIVE_RECOVERY_DURATION = 220;
const DUCK_SURFACE_Y = DUCK_WATERLINE - 80;
const DUCK_DIVE_Y = WATER_SURFACE_Y + 86;
const DUCK_HOME_X = 220;
const DUCK_MIN_X = 72;
const DUCK_MAX_X = 720;
const HUD_PAUSE_X = GAME_WIDTH - 54;
const HUD_PAUSE_Y = 56;
const STOMP_TOP_GRACE = 48;
const STOMP_MIN_VELOCITY_Y = -180;
const STOMP_HORIZONTAL_GRACE = 112;
const CHALLENGE_COLLECTIBLE_BLOCK_DISTANCE = 430;
const MODE_CUE_CONFIG = {
  jump: { text: "SPRUNG", color: "#ffd43f", fill: 0xffc51f, icon: "uiSignalJump" },
  dive: { text: "TAUCH", color: "#9df6ff", fill: 0x1ec9e8, icon: "uiSignalDive" },
  stomp: { text: "DRAUF", color: "#ffd43f", fill: 0xffc51f, icon: "uiSignalStomp" },
  underwater: { text: "OBEN", color: "#ff70ad", fill: 0xff3f76, icon: "uiSignalStayUp" },
};
const OBSTACLE_SEQUENCES = {
  early: [
    [
      { mode: "jump", sequence: "jump_intro" },
      { mode: "dive", sequence: "dive_intro" },
      { mode: "jump", sequence: "jump_collect_arc" },
    ],
    [
      { mode: "jump", sequence: "jump_intro" },
      { mode: "jump", sequence: "jump_collect_arc" },
      { mode: "dive", sequence: "dive_intro" },
    ],
  ],
  mid: [
    [
      { mode: "jump", sequence: "jump_collect_arc" },
      { mode: "stomp", sequence: "stomp_bounce_reward" },
      { mode: "dive", sequence: "dive_intro" },
    ],
    [
      { mode: "dive", sequence: "dive_intro" },
      { mode: "jump", sequence: "jump_collect_arc" },
      { mode: "stomp", sequence: "stomp_bounce_reward" },
    ],
    [
      { mode: "stomp", sequence: "stomp_bounce_reward" },
      { mode: "jump", sequence: "jump_collect_arc" },
      { mode: "dive", sequence: "dive_pearl_tunnel" },
    ],
  ],
  later: [
    [
      { mode: "jump", sequence: "jump_collect_arc" },
      { mode: "dive", sequence: "dive_pearl_tunnel" },
      { mode: "stomp", sequence: "stomp_bounce_reward" },
      { mode: "underwater", sequence: "stay_up_surface_line" },
    ],
    [
      { mode: "dive", sequence: "dive_pearl_tunnel" },
      { mode: "stomp", sequence: "stomp_bounce_reward" },
      { mode: "underwater", sequence: "stay_up_surface_line" },
      { mode: "jump", sequence: "jump_collect_arc" },
    ],
    [
      { mode: "stomp", sequence: "stomp_bounce_reward" },
      { mode: "dive", sequence: "dive_pearl_tunnel" },
      { mode: "jump", sequence: "jump_collect_arc" },
      { mode: "underwater", sequence: "stay_up_surface_line" },
    ],
    [
      { mode: "jump", sequence: "jump_collect_arc" },
      { mode: "stomp", sequence: "stomp_bounce_reward" },
      { mode: "underwater", sequence: "stay_up_surface_line" },
      { mode: "dive", sequence: "dive_pearl_tunnel" },
    ],
  ],
};
const MISSION_POOL = [
  { metric: "pearls", target: 15, label: "Sammle 15 Perlen" },
  { metric: "dives", target: 3, label: "Tauche durch 3 Hindernisse" },
  { metric: "stomps", target: 3, label: "Stampfe 3 Gegner" },
  { metric: "combo", target: 8, label: "Erreiche Combo x8" },
  { metric: "time", target: 25, label: "Überlebe 25 Sekunden" },
];
const MISSION_REWARD = 200;
const MENU_START_HIT = {
  x: 184,
  y: 597,
  width: 320,
  height: 86,
};
const MENU_HIGHSCORE_HIT = {
  x: 792,
  y: 597,
  width: 360,
  height: 86,
};

const QUIPS = [
  "QUAK!",
  "Mehr Perlen!",
  "Badewasser ist Leben.",
  "Ich bin Geschwindigkeit.",
  "Das ist mein Badezimmer.",
];

const SoundFX = {
  ctx: null,

  unlock() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    if (!this.ctx) {
      this.ctx = new AudioContextClass();
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  },

  tone(frequency, duration = 0.08, type = "sine", gain = 0.05) {
    if (!this.ctx) {
      return;
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const oscillator = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    amp.gain.setValueAtTime(gain, this.ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    oscillator.connect(amp);
    amp.connect(this.ctx.destination);
    oscillator.start();
    oscillator.stop(this.ctx.currentTime + duration);
  },

  glide(f0, f1, duration = 0.12, type = "sawtooth", gain = 0.05) {
    if (!this.ctx) {
      return;
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    const oscillator = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1900, t);
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(f0, t);
    oscillator.frequency.linearRampToValueAtTime(f1, t + duration);
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0008, t + duration);
    oscillator.connect(filter);
    filter.connect(amp);
    amp.connect(this.ctx.destination);
    oscillator.start(t);
    oscillator.stop(t + duration + 0.02);
  },

  quack(gain = 0.06) {
    // Characteristic duck quack: a quick down-glide through a lowpass with a
    // short upward tail, instead of a flat synth beep.
    this.glide(760, 320, 0.1, "sawtooth", gain);
    window.setTimeout(() => this.glide(380, 560, 0.06, "sawtooth", gain * 0.6), 55);
  },

  jump() {
    this.quack(0.05);
  },

  dive() {
    this.tone(190, 0.12, "sine", 0.045);
  },

  collect(pitch = 1) {
    // Watery bubble 'pop'. Pitch rises with the combo for an ascending,
    // increasingly satisfying chime as the player keeps the streak alive.
    this.glide(520 * pitch, 1040 * pitch, 0.05, "sine", 0.045);
    window.setTimeout(() => this.tone(1320 * pitch, 0.045, "sine", 0.03), 40);
  },

  success() {
    this.tone(540, 0.07, "square", 0.035);
    window.setTimeout(() => this.tone(860, 0.1, "triangle", 0.04), 55);
  },

  hit() {
    this.tone(120, 0.16, "sawtooth", 0.045);
  },

  bomb() {
    this.tone(160, 0.08, "sawtooth", 0.05);
    window.setTimeout(() => this.tone(440, 0.18, "triangle", 0.045), 70);
  },
};

class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.load.image("bg", "assets/bathroom_bg_flooded.png?v=20260621-bg1");
    this.load.image("logo", "assets/logo.png");
    this.load.image("duck", "assets/duck.png");
    this.load.image("soap", "assets/soap.png?v=20260622-assets-ui1");
    this.load.image("soapV2", "assets/soap_v2.png?v=20260622-assets-ui1");
    this.load.image("toothbrush", "assets/toothbrush.png");
    this.load.image("whirlpoolV2", "assets/whirlpool_v2.png?v=20260622-assets-ui1");
    this.load.image("pearlPink", "assets/pearl_pink.png?v=20260622-assets-ui1");
    this.load.image("pearlBlue", "assets/pearl_blue.png?v=20260622-assets-ui1");
    this.load.image("pearlGold", "assets/pearl_gold.png?v=20260622-assets-ui1");
    this.load.image("shellPearl", "assets/shell_pearl.png?v=20260622-assets-ui1");
    this.load.image("starfishBonus", "assets/starfish_bonus.png?v=20260622-assets-ui1");
    this.load.image("underwaterPearls", "assets/underwater_pearls.png?v=20260622-assets-ui1");
    this.load.image("quackBombV2", "assets/quack_bomb_v2.png?v=20260622-assets-ui1");
    this.load.image("cupBrushV2", "assets/cup_brush_v2.png?v=20260622-assets-ui1");
    this.load.image("underwaterCap", "assets/underwater_cap.png?v=20260622-assets-ui1");
    this.load.image("drainPlug", "assets/drain_plug.png?v=20260622-assets-ui1");
    this.load.image("powerupMagnetV2", "assets/powerup_magnet_v2.png?v=20260622-assets-ui1");
    this.load.image("powerupShieldV2", "assets/powerup_shield_v2.png?v=20260622-assets-ui1");
    this.load.image("powerupTurboV2", "assets/powerup_turbo_v2.png?v=20260622-assets-ui1");
    this.load.image("uiPause", "assets/ui_pause.png?v=20260623-crisp1");
    this.load.image("uiHeart", "assets/ui_heart.png?v=20260622-assets-ui1");
    this.load.image("uiTrophy", "assets/ui_trophy.png?v=20260623-crisp1");
    this.load.image("duckHero", "assets/duck_hero.png?v=20260622-assets-ui1");
    this.load.image("duckGameOver", "assets/duck_gameover.png?v=20260622-assets-ui1");
    this.load.image("duckVictory", "assets/duck_victory.png?v=20260622-assets-ui1");
    this.load.image("uiPanelLarge", "assets/ui_panel_large.png?v=20260622-assets-ui1");
    this.load.image("uiPanelSmall", "assets/ui_panel_small.png?v=20260622-assets-ui1");
    this.load.image("uiButtonPrimary", "assets/ui_button_primary.png?v=20260622-assets-ui1");
    this.load.image("uiButtonSecondary", "assets/ui_button_secondary.png?v=20260622-assets-ui1");
    this.load.image("uiButtonDanger", "assets/ui_button_danger.png?v=20260622-assets-ui1");
    this.load.image("uiInputName", "assets/ui_input_name.png?v=20260622-assets-ui1");
    this.load.image("uiNameBadge", "assets/ui_name_badge.png?v=20260622-assets-ui1");
    this.load.image("uiHome", "assets/ui_home.png?v=20260623-crisp1");
    this.load.image("uiPlay", "assets/ui_play.png?v=20260623-crisp1");
    this.load.image("uiRestart", "assets/ui_restart.png?v=20260623-crisp1");
    this.load.image("uiScoreCoin", "assets/ui_score_coin.png?v=20260622-assets-ui1");
    this.load.image("uiPearlCounter", "assets/ui_pearl_counter.png?v=20260622-assets-ui1");
    this.load.image("obstacleSponge", "assets/obstacle_sponge.png?v=20260622-assets-ui1");
    this.load.image("obstacleDuckRing", "assets/obstacle_duck_ring.png?v=20260622-assets-ui1");
    this.load.image("obstacleToyBoat", "assets/obstacle_rubber_boat_toy.png?v=20260622-assets-ui1");
    this.load.image("obstacleRazorUnderwater", "assets/obstacle_razor_underwater.png?v=20260622-assets-ui1");
    this.load.image("obstacleBubbleGate", "assets/obstacle_bubble_gate.png?v=20260622-assets-ui1");
    this.load.image("obstacleTowelSink", "assets/obstacle_towel_sink.png?v=20260622-assets-ui1");
    this.load.image("powerupHeart", "assets/powerup_heart.png?v=20260622-assets-ui1");
    this.load.image("fxSplashSmall", "assets/fx_splash_small.png?v=20260622-assets-ui1");
    this.load.image("fxSplashBig", "assets/fx_splash_big.png?v=20260622-assets-ui1");
    this.load.image("fxBubblePop", "assets/fx_bubble_pop.png?v=20260622-assets-ui1");
    this.load.image("fxQuackWave", "assets/fx_quack_wave.png?v=20260622-assets-ui1");
    this.load.image("fxQuackWavePrompt", "assets/fx_quack_wave_prompt.png?v=20260622-newnew1");
    this.load.image("fxMagnetPullTrail", "assets/fx_magnet_pull_trail.png?v=20260622-newnew1");
    this.load.image("fxDiveLaneTrail", "assets/fx_dive_lane_trail.png?v=20260622-newnew1");
    this.load.image("fxSpeedLines", "assets/fx_speed_lines.png?v=20260622-assets-ui1");
    this.load.image("fxUnderwaterBubbles", "assets/fx_underwater_bubbles.png?v=20260622-assets-ui1");
    this.load.image("uiSignalJump", "assets/ui_signal_jump.png?v=20260623-cutout1");
    this.load.image("uiSignalDive", "assets/ui_signal_dive.png?v=20260623-cutout1");
    this.load.image("uiSignalStomp", "assets/ui_signal_stomp.png?v=20260623-cutout1");
    this.load.image("uiSignalStayUp", "assets/ui_signal_stay_up.png?v=20260623-cutout1");
  }

  create() {
    this.scene.start("MenuScene");
  }
}

class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    this.hasStarted = false;
    this.stats = readStats();
    this.nativeFallbackReadyAt = performance.now() + 220;
    addBackground(this);
    addWaterOverlay(this);

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x04324f, 0.08).setDepth(1.1);
    this.add.image(GAME_WIDTH / 2, 150, "logo").setScale(0.92).setDepth(3);

    this.add
      .text(GAME_WIDTH / 2, 292, "Spring. Tauch. Sammle Perlen.", {
        fontFamily: "Trebuchet MS",
        fontSize: "26px",
        fontStyle: "700",
        color: "#ffffff",
        stroke: "#123044",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.duck = this.add.image(GAME_WIDTH / 2, 416, "duckHero").setScale(0.38).setDepth(4);

    this.add.text(GAME_WIDTH / 2, 538, "BEST SCORE", hudTextStyle(26, "#ffffff")).setOrigin(0.5).setDepth(4);
    this.highscoreText = this.add
      .text(GAME_WIDTH / 2, 594, this.stats.highscore.toLocaleString("de-DE"), {
        fontFamily: "Trebuchet MS",
        fontSize: "72px",
        fontStyle: "900",
        color: "#ffd43f",
        stroke: "#123044",
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setDepth(5);

    this.tweens.add({
      targets: this.duck,
      y: "+=10",
      angle: -3,
      yoyo: true,
      repeat: -1,
      duration: 980,
      ease: "Sine.inOut",
    });
    this.time.addEvent({
      delay: 1450,
      loop: true,
      callback: () => this.menuSplash(this.duck.x - 54, this.duck.y + 42),
    });

    const startButton = makeButton(this, 330, 636, "SPIELEN");
    startButton.setDepth(5);
    startButton.on("pointerdown", () => this.startGame());

    const highscoreButton = makeButton(this, 970, 636, "BESTENLISTE");
    highscoreButton.setDepth(5);
    highscoreButton.on("pointerdown", () => this.scene.start("HighscoreScene"));

    this.input.keyboard.on("keydown", (event) => {
      if (event.code === "Space" || event.code === "Enter") {
        this.startGame();
      }
    });
    this.installNativeStartFallback();
  }

  startGame() {
    if (this.hasStarted) {
      return;
    }

    this.hasStarted = true;
    SoundFX.unlock();
    this.scene.start("GameScene");
  }

  installNativeStartFallback() {
    const startFromDom = (event) => {
      if (performance.now() < this.nativeFallbackReadyAt) {
        return;
      }

      if (this.isStartPointer(event)) {
        this.startGame();
        return;
      }

      if (this.isHighscorePointer(event)) {
        this.scene.start("HighscoreScene");
      }
    };
    const startFromKey = (event) => {
      if (event.code === "Space" || event.code === "Enter") {
        this.startGame();
      }
    };

    this.game.canvas.addEventListener("pointerdown", startFromDom);
    this.game.canvas.addEventListener("click", startFromDom);
    this.game.canvas.addEventListener("touchstart", startFromDom, { passive: true });
    window.addEventListener("keydown", startFromKey);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.canvas.removeEventListener("pointerdown", startFromDom);
      this.game.canvas.removeEventListener("click", startFromDom);
      this.game.canvas.removeEventListener("touchstart", startFromDom);
      window.removeEventListener("keydown", startFromKey);
    });
  }

  isStartPointer(event) {
    return this.isPointerWithin(event, MENU_START_HIT);
  }

  isHighscorePointer(event) {
    return this.isPointerWithin(event, MENU_HIGHSCORE_HIT);
  }

  isPointerWithin(event, hitbox) {
    const clientX = event.touches?.[0]?.clientX ?? event.clientX;
    const clientY = event.touches?.[0]?.clientY ?? event.clientY;
    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) {
      return false;
    }

    const rect = this.game.canvas.getBoundingClientRect();
    const gameX = ((clientX - rect.left) / rect.width) * GAME_WIDTH;
    const gameY = ((clientY - rect.top) / rect.height) * GAME_HEIGHT;
    return (
      gameX >= hitbox.x &&
      gameX <= hitbox.x + hitbox.width &&
      gameY >= hitbox.y &&
      gameY <= hitbox.y + hitbox.height
    );
  }

  menuSplash(x, y) {
    for (let index = 0; index < 8; index += 1) {
      const bubble = this.add.image(x, y, "pearlBlue").setScale(0.1).setAlpha(0.72).setDepth(3);
      this.tweens.add({
        targets: bubble,
        x: x + Phaser.Math.Between(-42, 42),
        y: y - Phaser.Math.Between(20, 74),
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(380, 620),
        ease: "Cubic.out",
        onComplete: () => bubble.destroy(),
      });
    }
  }
}

class HighscoreScene extends Phaser.Scene {
  constructor() {
    super("HighscoreScene");
  }

  create() {
    this.stats = readStats();
    addBackground(this);
    addWaterOverlay(this);

    makeScreenShade(this, 0.48, 1);
    makeGlassPanel(this, 174, 58, 932, 594, 2, 0x0677c8);
    this.add.text(GAME_WIDTH / 2, 126, "BESTENLISTE", titleStyle(60, "#ffffff")).setOrigin(0.5).setDepth(4);

    const scores = this.stats.scores.slice(0, 5);
    if (scores.length === 0) {
      makeScoreFeatureCard(this, 260, 214, 760, 280, "Noch keine Runde", "SPIELEN UND EINTRAGEN", "uiTrophy");
    } else {
      const top = scores[0];
      makeWinnerCard(this, 244, 198, 352, 314, top);
      scores.slice(1, 5).forEach((entry, index) => {
        makeLeaderboardRow(this, 642, 210 + index * 72, 388, 60, index + 2, entry);
      });
    }

    this.add
      .text(
        GAME_WIDTH / 2,
        532,
        `Bestwert ${this.stats.highscore.toLocaleString("de-DE")}   Runden ${this.stats.games.toLocaleString("de-DE")}`,
        hudTextStyle(22, "#9df6ff"),
      )
      .setOrigin(0.5)
      .setDepth(4);

    const startButton = makeButton(this, GAME_WIDTH / 2 - 170, 588, "START", 260);
    startButton.setDepth(4);
    startButton.on("pointerdown", () => this.scene.start("GameScene"));

    const backButton = makeButton(this, GAME_WIDTH / 2 + 170, 588, "ZURÜCK", 260);
    backButton.setDepth(4);
    backButton.on("pointerdown", () => this.scene.start("MenuScene"));

    this.input.on("pointerdown", (pointer) => {
      if (isWithinButton(pointer, GAME_WIDTH / 2 - 170, 588, "START", 260)) {
        this.scene.start("GameScene");
        return;
      }

      if (isWithinButton(pointer, GAME_WIDTH / 2 + 170, 588, "ZURÜCK", 260)) {
        this.scene.start("MenuScene");
      }
    });

    this.input.keyboard.on("keydown-ESC", () => this.scene.start("MenuScene"));
    this.input.keyboard.on("keydown-SPACE", () => this.scene.start("GameScene"));
    this.input.keyboard.on("keydown-ENTER", () => this.scene.start("GameScene"));
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.stats = readStats();
    this.score = 0;
    this.runTime = 0;
    this.pearls = 0;
    this.lives = 3;
    this.combo = 0;
    this.longestCombo = 0;
    this.diveCount = 0;
    this.stompCount = 0;
    this.missionsDone = 0;
    this.missionQueue = [];
    this.activeMission = null;
    this.missionBase = { pearls: 0, dives: 0, stomps: 0, time: 0 };
    this.lastComboAt = 0;
    this.lastMilestone = 0;
    this.speed = 300;
    this.spawnDelay = 1150;
    this.collectDelay = 760;
    this.lastGroundedAt = 0;
    this.wasGrounded = true;
    this.lastAirVelocityY = 0;
    this.lastImpactSplashAt = 0;
    this.suppressLandingSplashUntil = 0;
    this.jumpQueuedUntil = 0;
    this.isGameOver = false;
    this.isPaused = false;
    this.pausedAt = 0;
    this.invulnerableUntil = 0;
    this.isDiving = false;
    this.isResurfacing = false;
    this.diveUntil = 0;
    this.diveStartedAt = 0;
    this.diveHeld = false;
    this.diveQueuedUntil = 0;
    this.diveQueuedHeld = false;
    this.diveRecoverUntil = 0;
    this.keyboardDiveActive = false;
    this.lastDiveBubbleAt = 0;
    this.diveWake = null;
    this.diveShade = null;
    this.diveBubbleTrail = null;
    this.diveStatusText = null;
    this.shieldCharges = 0;
    this.magnetUntil = 0;
    this.turboUntil = 0;
    this.bombFlashUntil = 0;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchSwipeHandled = false;
    this.touchDriftDirection = 0;
    this.touchDriftActive = false;
    this.activeTouchPointerId = null;
    this.lastDriftInputAt = 0;
    this.lastDriftBubbleAt = 0;
    this.obstaclePattern = [];
    this.rewardTrailId = 0;
    this.cupBrushIntroduced = false;
    this.pendingPowerUpRetry = false;
    this.nextPowerUpAt = 0;
    this.resultSaved = false;
    this.resultEntryId = "";
    this.telemetry = createRunTelemetry();
    this.nameInput = null;
    this.nameInputLayoutHandler = null;
    this.hudCache = {
      score: null,
      pearls: null,
      lives: null,
      shieldCharges: null,
    };

    addBackground(this);
    addWaterOverlay(this);
    this.createWorld();
    this.suppressLandingSplashUntil = this.time.now + 650;
    this.createHud();
    this.createControls();

    this.spawnObstacleEvent = this.time.addEvent({
      delay: this.spawnDelay,
      loop: true,
      callback: this.spawnObstacle,
      callbackScope: this,
    });

    this.spawnCollectibleEvent = this.time.addEvent({
      delay: this.collectDelay,
      loop: true,
      callback: this.spawnCollectible,
      callbackScope: this,
    });

    this.spawnPowerUpEvent = this.time.addEvent({
      delay: 8500,
      loop: true,
      callback: this.spawnPowerUp,
      callbackScope: this,
    });
  }

  createWorld() {
    this.obstacles = this.physics.add.group({ allowGravity: false, immovable: true });
    this.collectibles = this.physics.add.group({ allowGravity: false });
    this.powerUps = this.physics.add.group({ allowGravity: false });

    this.duck = this.physics.add.sprite(220, DUCK_SURFACE_Y, "duck");
    this.duck.setScale(0.52);
    this.setDuckNormalBody();
    this.duck.setCollideWorldBounds(true);
    this.duck.setGravityY(1320);
    this.duck.setDepth(8);

    this.ground = this.add.rectangle(GAME_WIDTH / 2, DUCK_WATERLINE + 8, GAME_WIDTH, 24, 0x21a8c9, 0);
    this.physics.add.existing(this.ground, true);
    this.surfaceCollider = this.physics.add.collider(this.duck, this.ground);
    // Obstacle outcomes are decided solely by resolveObstacleChallengeWindows()
    // using fair, mode-aware x-windows. A physics overlap here would fire on raw
    // body contact (earlier, and before a dive can register), which made wide
    // obstacles like the toothbrush cup impossible to dive through.
    this.physics.add.overlap(this.duck, this.collectibles, this.collectPearl, null, this);
    this.physics.add.overlap(this.duck, this.powerUps, this.collectPowerUp, null, this);

    this.splashEmitter = this.add.particles(0, 0, "pearlBlue", {
      speed: { min: 80, max: 190 },
      scale: { start: 0.16, end: 0 },
      alpha: { start: 0.72, end: 0 },
      lifespan: 520,
      gravityY: 260,
      emitting: false,
    });

    this.tweens.add({
      targets: this.duck,
      scaleX: 0.54,
      scaleY: 0.5,
      yoyo: true,
      repeat: -1,
      duration: 760,
      ease: "Sine.inOut",
    });
  }

  createHud() {
    this.lifeHud = makeLifePill(this, 24, 24);
    this.scoreHud = makeHudPill(this, 166, 24, 192, "uiScoreCoin", 0.044, "#ffffff");
    this.scoreText = this.scoreHud.text;
    this.pearlHud = makeHudPill(this, 378, 24, 150, "uiPearlCounter", 0.044, "#ffd43f");
    this.pearlText = this.pearlHud.text;
    this.lifeBubbles = this.lifeHud.hearts;
    this.comboText = this.add.text(GAME_WIDTH / 2, 120, "", hudTextStyle(26, "#ffd43f")).setOrigin(0.5).setDepth(21);
    this.missionText = this.add.text(GAME_WIDTH / 2, 96, "", hudTextStyle(17, "#9df6ff")).setOrigin(0.5).setDepth(21);
    this.specialSlots = {
      shield: makeSpecialSlot(this, 788, 28, "powerupShieldV2", "SCHILD", "#9df6ff"),
      magnet: makeSpecialSlot(this, 888, 28, "powerupMagnetV2", "MAGNET", "#ffd43f"),
      turbo: makeSpecialSlot(this, 988, 28, "powerupTurboV2", "TURBO", "#ff70ad"),
      bomb: makeSpecialSlot(this, 1088, 28, "quackBombV2", "BOMBE", "#ffd43f"),
    };

    this.pauseButton = makePauseIconButton(this, HUD_PAUSE_X, HUD_PAUSE_Y);

    this.quipText = this.add
      .text(GAME_WIDTH / 2, 156, "", {
        fontFamily: "Trebuchet MS",
        fontSize: "32px",
        fontStyle: "900",
        color: "#ffd43f",
        stroke: "#0a2840",
        strokeThickness: 7,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.showOnboardingHint();
    this.startMission();
  }

  startMission() {
    if (this.missionQueue.length === 0) {
      this.missionQueue = Phaser.Utils.Array.Shuffle(MISSION_POOL.map((mission) => ({ ...mission })));
    }
    // Don't hand out a mission that can't progress yet: stomp obstacles only
    // appear from ~18s, so a "stomp" goal before then would be impossible.
    // Rotate such goals to the back and pick the first reachable one.
    const reachable = (mission) => mission.metric !== "stomps" || this.runTime >= 18;
    let picked = null;
    for (let i = 0; i < this.missionQueue.length; i += 1) {
      const candidate = this.missionQueue.shift();
      if (reachable(candidate)) {
        picked = candidate;
        break;
      }
      this.missionQueue.push(candidate);
    }
    this.activeMission = picked || this.missionQueue.shift() || null;
    this.missionBase = {
      pearls: this.pearls,
      dives: this.diveCount,
      stomps: this.stompCount,
      time: this.runTime,
    };
    this.refreshMissionHud();
  }

  missionProgress() {
    const mission = this.activeMission;
    if (!mission) {
      return 0;
    }
    switch (mission.metric) {
      case "pearls":
        return this.pearls - this.missionBase.pearls;
      case "dives":
        return this.diveCount - this.missionBase.dives;
      case "stomps":
        return this.stompCount - this.missionBase.stomps;
      case "combo":
        return this.combo;
      case "time":
        return Math.floor(this.runTime - this.missionBase.time);
      default:
        return 0;
    }
  }

  refreshMissionHud() {
    if (!this.missionText) {
      return;
    }
    if (!this.activeMission) {
      this.missionText.setText("");
      return;
    }
    const progress = Math.min(this.missionProgress(), this.activeMission.target);
    this.missionText.setText(`ZIEL: ${this.activeMission.label}  (${progress}/${this.activeMission.target})`);
  }

  updateMission() {
    if (!this.activeMission) {
      return;
    }
    if (this.missionProgress() >= this.activeMission.target) {
      this.completeMission();
      return;
    }
    this.refreshMissionHud();
  }

  completeMission() {
    this.missionsDone += 1;
    this.score += MISSION_REWARD;
    this.showFloatingText(`MISSION! +${MISSION_REWARD}`, GAME_WIDTH / 2, 150, "#ffd43f");
    this.burst(GAME_WIDTH / 2, 150, ["pearlGold", "pearlPink"], 16, 0.12, 140);
    SoundFX.success();
    this.startMission();
  }

  showOnboardingHint() {
    // Lightweight onboarding: name the core controls for the first few seconds
    // so a new player learns jump/dive/stomp before they turn lethal.
    const hint = this.add
      .text(
        GAME_WIDTH / 2,
        214,
        "↑ / Tippen = Springen      ↓ = Tauchen\nAuf einen Gegner fallen = Drauf!",
        {
          fontFamily: "Trebuchet MS",
          fontSize: "23px",
          fontStyle: "700",
          color: "#eaffff",
          stroke: "#0a2840",
          strokeThickness: 5,
          align: "center",
        },
      )
      .setOrigin(0.5)
      .setDepth(21)
      .setAlpha(0);

    this.tweens.add({ targets: hint, alpha: 1, duration: 280 });
    this.tweens.add({
      targets: hint,
      alpha: 0,
      delay: 5200,
      duration: 700,
      onComplete: () => hint.destroy(),
    });
  }

  createControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys("A,D,S,W");
    this.input.keyboard.on("keydown-SPACE", () => this.jump());
    this.input.keyboard.on("keydown-UP", () => this.jump());
    this.input.keyboard.on("keydown-W", () => this.jump());
    this.input.keyboard.on("keydown-DOWN", () => this.dive(true));
    this.input.keyboard.on("keydown-S", () => this.dive(true));
    this.input.keyboard.on("keyup-DOWN", () => this.releaseDive());
    this.input.keyboard.on("keyup-S", () => this.releaseDive());
    this.input.keyboard.on("keydown-ESC", () => this.togglePause());

    this.input.on("pointerdown", (pointer) => {
      if (this.isGameOver) {
        this.handleGameOverPointer(pointer);
        return;
      }

      if (this.isPaused) {
        this.handlePausePointer(pointer);
        return;
      }

      if (isWithinRoundButton(pointer, HUD_PAUSE_X, HUD_PAUSE_Y)) {
        this.togglePause();
        return;
      }

      this.touchStartX = pointer.x;
      this.touchStartY = pointer.y;
      this.touchSwipeHandled = false;
      this.touchDriftDirection = 0;
      this.touchDriftActive = false;
      this.activeTouchPointerId = pointer.id;
    });

    this.input.on("pointermove", (pointer) => {
      if (this.isPaused || this.isGameOver) {
        return;
      }

      if (!pointer.isDown || pointer.id !== this.activeTouchPointerId) {
        return;
      }

      const deltaX = pointer.x - this.touchStartX;
      const deltaY = pointer.y - this.touchStartY;
      if (!this.touchSwipeHandled && !this.touchDriftActive && deltaY > 72 && Math.abs(deltaX) < 48) {
        this.touchSwipeHandled = true;
        this.touchDriftDirection = 0;
        this.touchDriftActive = false;
        this.dive(true);
        return;
      }

      // Drift threshold kept clearly above the tap threshold (60) so a tap with
      // a small sideways slip still registers as a jump rather than a drift.
      if (!this.touchSwipeHandled && Math.abs(deltaX) > 64 && Math.abs(deltaY) < 64) {
        this.touchDriftDirection = Math.sign(deltaX);
        this.touchDriftActive = true;
        this.lastDriftInputAt = this.time.now;
      }
    });

    this.input.on("pointerup", (pointer) => {
      if (this.isPaused || this.isGameOver) {
        this.resetTouchDrift();
        return;
      }

      if (pointer.id !== this.activeTouchPointerId) {
        return;
      }

      const deltaX = Math.abs(pointer.x - this.touchStartX);
      const deltaY = pointer.y - this.touchStartY;
      if (this.touchSwipeHandled) {
        this.releaseDive();
        this.resetTouchDrift();
        return;
      }

      if (!this.touchDriftActive && !this.touchSwipeHandled && deltaY < 48 && deltaX < 60) {
        this.jump();
      }

      this.resetTouchDrift();
    });

    this.input.on("pointerupoutside", () => this.resetTouchDrift());
    this.input.on("pointercancel", () => this.resetTouchDrift());
  }

  resetTouchDrift() {
    this.touchDriftDirection = 0;
    this.touchDriftActive = false;
    this.activeTouchPointerId = null;
  }

  handlePausePointer(pointer) {
    if (isWithinButton(pointer, GAME_WIDTH / 2, 318, "WEITER", 390)) {
      this.resumeGame();
      return;
    }

    if (isWithinButton(pointer, GAME_WIDTH / 2, 412, "NEUSTART", 390)) {
      this.scene.restart();
      return;
    }

    if (isWithinButton(pointer, GAME_WIDTH / 2, 506, "MENÜ", 390)) {
      this.exitToMenu();
    }
  }

  handleGameOverPointer(pointer) {
    const isTopFive = this.stats.scores.some((entry) => entry.id === this.resultEntryId);
    const buttonY = isTopFive ? 572 : 558;

    if (isWithinButton(pointer, 412, buttonY, "NOCHMAL", 190)) {
      this.savePendingGameOverName();
      this.destroyNameInput();
      this.scene.restart();
      return;
    }

    if (isWithinButton(pointer, 640, buttonY, isTopFive ? "BESTÄTIGEN" : "HIGHSCORE", isTopFive ? 224 : 196)) {
      this.savePendingGameOverName();
      this.destroyNameInput();
      this.scene.start("HighscoreScene");
      return;
    }

    if (isWithinButton(pointer, 852, buttonY, "MENÜ", 166)) {
      this.savePendingGameOverName();
      this.destroyNameInput();
      this.scene.start("MenuScene");
    }
  }

  update(_, delta) {
    if (this.isGameOver || this.isPaused) {
      return;
    }

    const deltaSeconds = delta / 1000;
    this.runTime += deltaSeconds;
    this.speed = 300 + Math.min(280, this.runTime * 6) + (this.isTurboActive() ? 65 : 0);
    const isGrounded = this.duck.body.blocked.down;
    if (!isGrounded) {
      this.lastAirVelocityY = this.duck.body.velocity.y;
    }

    if (isGrounded && !this.wasGrounded) {
      this.waterImpactSplash(this.duck.x - 12, this.duck.y + 50, this.lastAirVelocityY);
    }
    this.wasGrounded = isGrounded;

    if (isGrounded) {
      this.lastGroundedAt = this.time.now;
    }

    if (isGrounded && this.time.now < this.jumpQueuedUntil) {
      this.performJump();
    }

    this.spawnObstacleEvent.delay = this.getObstacleDelay();

    this.updateHud();
    this.expireCombo();
    this.updateMission();
    this.updatePowerUpState();
    this.updateKeyboardDiveInput();
    this.updateDiveState();
    this.processQueuedDive();
    this.syncDiveVisual();
    if (!this.isDiving && this.time.now > this.diveRecoverUntil) {
      this.duck.setAngle(Phaser.Math.Clamp(this.duck.body.velocity.y / 34, -14, 18));
    }
    this.pullNearbyCollectibles();
    this.updateHorizontalControl(deltaSeconds);
    this.updateObstacleLabels();
    this.updatePowerUpLabels();
    this.resolveObstacleChallengeWindows();
    this.rewardPassedJumpObstacles();

    if (this.score >= this.lastMilestone + 500) {
      this.lastMilestone += 500;
      this.showQuip();
    }

    // Safety net: an obstacle whose body was disabled (so it stopped scrolling)
    // but which isn't being animated out is frozen and would never reach the
    // off-screen cleanup. Remove any such stuck element regardless of how it got
    // there. Legit removals disable the body and add a tween in the same call,
    // so an in-flight removal is still tweening and is left alone.
    this.obstacles.getChildren().forEach((obstacle) => {
      if (obstacle.active && obstacle.body && !obstacle.body.enable && !this.tweens.isTweening(obstacle)) {
        this.destroyObstacleVisuals(obstacle);
        obstacle.getData("label")?.destroy();
        obstacle.destroy();
      }
    });

    this.children.each((child) => {
      if (child.active && child.x < -180 && child.getData("cleanup")) {
        if (child.getData("mode")) {
          this.destroyObstacleVisuals(child);
        }
        child.getData("label")?.destroy();
        this.tweens.killTweensOf(child.getData("ring"));
        child.getData("visual")?.destroy();
        this.tweens.killTweensOf(child);
        child.destroy();
      }
    });
  }

  jump() {
    if (this.isGameOver || this.isPaused) {
      return;
    }

    if (this.isDiving || this.isResurfacing) {
      return;
    }

    SoundFX.unlock();
    if (this.duck.body.blocked.down || this.time.now - this.lastGroundedAt < 130) {
      this.performJump();
      return;
    }

    this.jumpQueuedUntil = this.time.now + 170;
  }

  performJump() {
    this.jumpQueuedUntil = 0;
    SoundFX.jump();
    this.duck.setVelocityY(-720);
    this.splash(this.duck.x - 48, this.duck.y + 42);
  }

  dive(held = false) {
    if (this.isGameOver || this.isPaused) {
      return;
    }

    if (this.isDiving || this.isResurfacing) {
      return;
    }

    if (this.time.now < this.diveRecoverUntil) {
      this.diveQueuedUntil = this.time.now + 190;
      this.diveQueuedHeld = held;
      return;
    }

    this.startDive(held);
  }

  startDive(held = false) {
    this.isDiving = true;
    this.isResurfacing = false;
    this.diveHeld = held;
    this.diveQueuedUntil = 0;
    this.diveQueuedHeld = false;
    // Drop any buffered jump so it can't fire on the frame the duck resurfaces.
    this.jumpQueuedUntil = 0;
    this.diveStartedAt = this.time.now;
    this.diveUntil = this.time.now + DIVE_MIN_DURATION;
    SoundFX.unlock();
    SoundFX.dive();
    if (this.surfaceCollider) {
      this.surfaceCollider.active = false;
    }
    this.duck.body.allowGravity = false;
    this.duck.body.checkCollision.down = false;
    this.duck.body.checkCollision.up = false;
    this.duck.setVelocityY(0);
    this.duck.y = Math.max(this.duck.y, WATER_SURFACE_Y + 28);
    this.duck.setAngle(18);
    this.duck.setAlpha(0.72);
    this.duck.setTint(0x6ff4ff);
    this.duck.body.setSize(108, 52);
    this.duck.body.setOffset(66, 132);
    this.showDiveWake();
    this.showDiveStatus();
    this.splash(this.duck.x - 38, this.duck.y + 48);
  }

  releaseDive() {
    if (this.isGameOver || this.isPaused) {
      this.diveQueuedUntil = 0;
      this.diveQueuedHeld = false;
      this.diveHeld = false;
      return;
    }

    if (!this.isDiving) {
      this.diveQueuedUntil = 0;
      this.diveQueuedHeld = false;
      return;
    }

    this.diveHeld = false;
    if (this.time.now >= this.diveUntil) {
      this.finishDive();
    }
  }

  processQueuedDive() {
    if (this.diveQueuedUntil === 0) {
      return;
    }

    if (this.isDiving || this.time.now < this.diveRecoverUntil) {
      return;
    }

    if (this.time.now > this.diveQueuedUntil) {
      this.diveQueuedUntil = 0;
      this.diveQueuedHeld = false;
      return;
    }

    this.startDive(this.diveQueuedHeld);
  }

  updateKeyboardDiveInput() {
    const keyboardDive = Boolean(this.cursors.down?.isDown || this.wasd.S?.isDown);
    if (keyboardDive) {
      this.keyboardDiveActive = true;
      this.dive(true);
      return;
    }

    if (this.keyboardDiveActive) {
      this.keyboardDiveActive = false;
      this.releaseDive();
    }
  }

  spawnObstacle() {
    if (WATER_TUNING_MODE || this.isGameOver || this.isPaused) {
      return;
    }

    const options = [
      {
        key: "soapV2",
        y: WATERLINE - 24,
        scale: 0.5,
        speedBoost: 10,
        body: [170, 96, 45, 20],
        gap: 470,
        mode: "jump",
        prompt: "DRUEBER!",
      },
      {
        key: "soapV2",
        y: WATERLINE - 38,
        scale: 0.62,
        speedBoost: 14,
        body: [164, 110, 60, 22],
        gap: 540,
        mode: "jump",
        prompt: "WEIT DRUEBER!",
        visual: "soapstack",
        labelOffset: 118,
      },
      {
        key: "cupBrushV2",
        y: WATERLINE - 78,
        scale: 0.42,
        speedBoost: 16,
        body: [150, 102, 40, 56],
        gap: 570,
        mode: "dive",
        prompt: "TAUCH!",
        labelOffset: 124,
      },
      {
        key: "toothbrush",
        y: WATERLINE - 72,
        scale: 0.46,
        speedBoost: 10,
        body: [158, 66, 96, 44],
        gap: 610,
        mode: "dive",
        prompt: "TAUCH!",
        labelOffset: 106,
      },
      {
        key: "pearlBlue",
        y: WATERLINE - 76,
        scale: 0.18,
        speedBoost: 12,
        body: [840, 104, -360, 54],
        gap: 610,
        mode: "dive",
        prompt: "TIEF TAUCHEN!",
        visual: "foamgate",
        labelOffset: 132,
      },
      {
        key: "obstacleSponge",
        y: WATERLINE - 22,
        scale: 0.42,
        speedBoost: 22,
        body: [208, 76, 76, 158],
        gap: 560,
        mode: "stomp",
        prompt: "DRAUF!",
        labelOffset: 122,
      },
      {
        key: "obstacleDuckRing",
        y: WATERLINE - 22,
        scale: 0.42,
        speedBoost: 24,
        body: [214, 72, 72, 158],
        gap: 590,
        mode: "stomp",
        prompt: "DRAUF!",
        labelOffset: 124,
      },
      {
        key: "underwaterCap",
        y: WATERLINE + 70,
        scale: 0.31,
        speedBoost: 12,
        body: [253, 131, 185, 228],
        gap: 580,
        mode: "underwater",
        prompt: "OBEN BLEIBEN!",
        labelOffset: 142,
      },
      {
        key: "drainPlug",
        y: WATERLINE + 92,
        scale: 0.27,
        speedBoost: 18,
        body: [276, 148, 184, 232],
        gap: 630,
        mode: "underwater",
        prompt: "NICHT TAUCHEN!",
        labelOffset: 156,
      },
    ];
    const allowed = this.runTime < 10 ? options.slice(0, 3) : this.runTime < 28 ? options.slice(0, 6) : options;
    const pick = this.getNextObstacle(allowed);
    if (!this.hasObstacleGap(pick.gap)) {
      return;
    }

    const obstacle = this.obstacles.create(GAME_WIDTH + 120, pick.y, pick.key);

    obstacle.setScale(pick.scale);
    obstacle.body.setSize(pick.body[0], pick.body[1]);
    obstacle.body.setOffset(pick.body[2], pick.body[3]);
    obstacle.setVelocityX(-this.speed - pick.speedBoost);
    obstacle.setDepth(7);
    obstacle.setData("cleanup", true);
    obstacle.setData("mode", pick.mode);
    obstacle.setData("sequence", pick.sequence);
    obstacle.setData("prompt", pick.prompt);
    obstacle.setData("labelOffset", pick.labelOffset ?? (pick.mode === "dive" ? 74 : 88));
    incrementCounter(this.telemetry.challenge.spawnedByMode, pick.mode);

    if (pick.key === "cupBrush" || pick.key === "cupBrushV2") {
      this.decorateCupBrush(obstacle);
    } else if (pick.visual === "foamgate") {
      this.decorateFoamGate(obstacle);
    } else if (pick.visual === "soapstack") {
      this.decorateSoapStack(obstacle);
    }
    this.decorateModeCue(obstacle, pick);

    const labelColor = pick.mode === "dive" ? "#9df6ff" : pick.mode === "underwater" ? "#ff70ad" : "#ffd43f";
    const label = this.add.text(obstacle.x, obstacle.y - obstacle.getData("labelOffset"), pick.prompt, hudTextStyle(20, labelColor));
    label.setOrigin(0.5);
    label.setDepth(9);
    label.setData("cleanup", true);
    obstacle.setData("label", label);
    this.spawnRewardTrailForObstacle(obstacle, pick);

    this.tweens.add({
      targets: obstacle,
      y: pick.y + 8,
      yoyo: true,
      repeat: -1,
      duration: 620,
      ease: "Sine.inOut",
    });
  }

  decorateCupBrush() {
    // Wake/shadow ellipse removed per design; the cup sprite stands on its own.
  }

  decorateFoamGate(obstacle) {
    obstacle.setAlpha(0.001);
    const container = this.add.container(obstacle.x, obstacle.y);
    container.setDepth(7);
    container.setData("cleanup", true);

    const gate = this.add.image(0, 0, "obstacleBubbleGate").setScale(0.36).setAlpha(0.92);
    const bubbles = [];
    for (let index = 0; index < 8; index += 1) {
      const side = index % 2 === 0 ? -1 : 1;
      const bubble = this.add
        .image(side * Phaser.Math.Between(22, 54), -72 + index * 22, "pearlBlue")
        .setScale(0.12 + (index % 3) * 0.035)
        .setAlpha(0.72);
      bubbles.push(bubble);
    }

    const cap = this.add.ellipse(0, -88, 130, 32, 0xeaffff, 0.26);
    container.add([gate, ...bubbles, cap]);
    obstacle.setData("visual", container);
  }

  decorateSoapStack(obstacle) {
    const container = this.add.container(obstacle.x, obstacle.y);
    container.setDepth(7);
    container.setData("cleanup", true);
    const back = this.add.image(-18, -18, "soap").setScale(0.58).setAngle(-7).setAlpha(0.82);
    const front = this.add.image(18, 6, "soap").setScale(0.62).setAngle(5);
    container.add([back, front]);
    obstacle.setAlpha(0.001);
    obstacle.setData("visual", container);
  }

  syncObstacleVisuals(obstacle) {
    const visual = obstacle.getData("visual");
    if (!visual?.active) {
      return;
    }

    visual.setPosition(obstacle.x, obstacle.y);
    visual.setAlpha(obstacle.alpha > 0.01 ? obstacle.alpha : 1);
  }

  destroyObstacleVisuals(obstacle) {
    obstacle.getData("visual")?.destroy();
    this.tweens.killTweensOf(obstacle.getData("cueRing"));
    obstacle.getData("cue")?.destroy();
  }

  prepareObstacleForRemoval(obstacle) {
    if (!obstacle?.active) {
      return;
    }

    obstacle.body.enable = false;
    this.tweens.killTweensOf(obstacle);
    this.destroyObstacleVisuals(obstacle);
    obstacle.getData("label")?.destroy();
  }

  recordChallengeOutcome(obstacle, outcome) {
    if (!obstacle?.active || obstacle.getData("telemetryOutcome")) {
      return;
    }

    const mode = obstacle.getData("mode") || "unknown";
    const bucketName = `${outcome}ByMode`;
    if (!this.telemetry.challenge[bucketName]) {
      this.telemetry.challenge[bucketName] = {};
    }
    obstacle.setData("telemetryOutcome", outcome);
    incrementCounter(this.telemetry.challenge[bucketName], mode);
  }

  decorateModeCue(obstacle, config) {
    const cueConfig = MODE_CUE_CONFIG[config.mode];
    if (!cueConfig) {
      return;
    }

    const cue = this.add.container(obstacle.x - 250, obstacle.y - (config.labelOffset ?? 100));
    cue.setDepth(10);
    cue.setAlpha(0);
    cue.setData("cleanup", true);

    let pulseTarget;
    if (cueConfig.icon && this.textures.exists(cueConfig.icon)) {
      // Use the round signal badge as the advance-warning cue.
      const baseScale = 0.095;
      const icon = this.add.image(0, 0, cueConfig.icon).setScale(baseScale);
      cue.add(icon);
      pulseTarget = icon;
      this.tweens.add({
        targets: icon,
        scale: baseScale * 1.1,
        yoyo: true,
        repeat: -1,
        duration: 560,
        ease: "Sine.inOut",
      });
    } else {
      const ring = this.add.circle(0, 0, 34, cueConfig.fill, 0.42);
      ring.setStrokeStyle(4, 0xffffff, 0.7);
      const text = this.add.text(0, 1, cueConfig.text, hudTextStyle(cueConfig.text.length > 5 ? 12 : 14, cueConfig.color)).setOrigin(0.5);
      cue.add([ring, text]);
      pulseTarget = ring;
      this.tweens.add({
        targets: ring,
        scale: 1.18,
        alpha: 0.62,
        yoyo: true,
        repeat: -1,
        duration: 520,
        ease: "Sine.inOut",
      });
    }

    obstacle.setData("cue", cue);
    obstacle.setData("cueRing", pulseTarget);
  }

  spawnRewardTrailForObstacle(obstacle, config) {
    const trailId = (this.rewardTrailId += 1);
    const sequence = config.sequence ?? config.mode;
    const points = this.getRewardTrailPoints(sequence);
    incrementCounter(this.telemetry.reward.spawnedBySequence, sequence, points.length);

    points.forEach((point, index) => {
      this.time.delayedCall(index * 55, () => {
        if (this.isGameOver || !obstacle.active) {
          return;
        }

        this.spawnPearlAt(obstacle.x + point.x, point.y, point.key, -this.speed - config.speedBoost, trailId, {
          sequence,
          underwater: point.underwater,
        });
      });
    });
  }

  getRewardTrailPoints(sequence) {
    if (sequence === "dive_intro") {
      return [
        { x: -278, y: WATER_SURFACE_Y + 72, key: "pearlBlue", underwater: true },
        { x: -150, y: WATER_SURFACE_Y + 96, key: "pearlBlue", underwater: true },
        { x: -20, y: WATER_SURFACE_Y + 104, key: "pearlGold", underwater: true },
      ];
    }

    if (sequence === "dive_pearl_tunnel") {
      return [
        { x: -330, y: WATER_SURFACE_Y + 70, key: "pearlBlue", underwater: true },
        { x: -216, y: WATER_SURFACE_Y + 98, key: "pearlBlue", underwater: true },
        { x: -92, y: WATER_SURFACE_Y + 118, key: "pearlGold", underwater: true },
        { x: 42, y: WATER_SURFACE_Y + 108, key: "pearlPink", underwater: true },
        { x: 166, y: WATER_SURFACE_Y + 82, key: "pearlBlue", underwater: true },
      ];
    }

    if (sequence === "jump_intro") {
      return [
        { x: -230, y: WATER_SURFACE_Y - 54, key: "pearlPink" },
        { x: -108, y: WATER_SURFACE_Y - 102, key: "pearlBlue" },
        { x: 34, y: WATER_SURFACE_Y - 92, key: "pearlGold" },
      ];
    }

    if (sequence === "jump_collect_arc") {
      return [
        { x: -272, y: WATER_SURFACE_Y - 42, key: "pearlPink" },
        { x: -164, y: WATER_SURFACE_Y - 94, key: "pearlBlue" },
        { x: -36, y: WATER_SURFACE_Y - 134, key: "pearlGold" },
        { x: 104, y: WATER_SURFACE_Y - 96, key: "pearlBlue" },
        { x: 224, y: WATER_SURFACE_Y - 44, key: "pearlPink" },
      ];
    }

    if (sequence === "stomp_bounce_reward") {
      return [
        { x: -282, y: WATER_SURFACE_Y - 112, key: "pearlBlue" },
        { x: -168, y: WATER_SURFACE_Y - 76, key: "pearlPink" },
        { x: -34, y: WATER_SURFACE_Y - 42, key: "pearlGold" },
        { x: 112, y: WATER_SURFACE_Y - 18, key: "pearlBlue" },
      ];
    }

    if (sequence === "stay_up_surface_line") {
      return [
        { x: -278, y: WATER_SURFACE_Y - 72, key: "pearlPink" },
        { x: -156, y: WATER_SURFACE_Y - 58, key: "pearlBlue" },
        { x: -24, y: WATER_SURFACE_Y - 44, key: "pearlGold" },
        { x: 122, y: WATER_SURFACE_Y - 30, key: "pearlPink" },
      ];
    }

    return [
      { x: -220, y: WATER_SURFACE_Y - 42, key: "pearlPink" },
      { x: -90, y: WATER_SURFACE_Y - 64, key: "pearlBlue" },
      { x: 44, y: WATER_SURFACE_Y - 42, key: "pearlGold" },
    ];
  }

  spawnPearlAt(x, y, key, velocityX, trailId = null, options = {}) {
    const value = getCollectibleValue(key);
    const pearl = this.collectibles.create(x, y, key);
    pearl.setScale(getCollectibleScale(key));
    if (key === "underwaterPearls") {
      pearl.body.setCircle(174);
      pearl.body.setOffset(233, 233);
    } else {
      pearl.body.setCircle(24);
      pearl.body.setOffset(24, 24);
    }
    pearl.setVelocityX(velocityX);
    pearl.setDepth(options.underwater ? 5 : 6);
    pearl.setData("value", value);
    pearl.setData("cleanup", true);
    pearl.setData("trailId", trailId);
    pearl.setData("sequence", options.sequence ?? null);
    pearl.setData("underwater", Boolean(options.underwater));

    this.tweens.add({
      targets: pearl,
      y: pearl.y - 18,
      angle: 360,
      yoyo: true,
      repeat: -1,
      duration: 860,
      ease: "Sine.inOut",
    });

    return pearl;
  }

  spawnCollectible() {
    if (WATER_TUNING_MODE || this.isGameOver || this.isPaused) {
      return;
    }

    if (this.hasActiveChallengeCollectibleWindow()) {
      return;
    }

    const roll = Phaser.Math.Between(1, 100);
    const laneRoll = Phaser.Math.Between(1, 100);
    const lane =
      laneRoll > 66
        ? COLLECTIBLE_LANES[2]
        : laneRoll > 34
          ? COLLECTIBLE_LANES[1]
          : COLLECTIBLE_LANES[0];

    if (lane.underwater && this.runTime > 8 && roll > 86) {
      this.spawnPearlAt(GAME_WIDTH + 100, lane.y + Phaser.Math.Between(-18, 18), "underwaterPearls", -this.speed * 0.72, null, { underwater: true });
      return;
    }

    const key = roll > 96 ? "starfishBonus" : roll > 90 ? "shellPearl" : roll > 78 ? "pearlGold" : roll > 44 ? "pearlBlue" : "pearlPink";
    this.spawnPearlAt(GAME_WIDTH + 100, lane.y + Phaser.Math.Between(-12, 12), key, -this.speed * 0.78, null, { underwater: lane.underwater });
  }

  spawnPowerUp() {
    if (WATER_TUNING_MODE || this.isGameOver || this.isPaused || this.runTime < 12) {
      return;
    }

    if (this.time.now < this.nextPowerUpAt) {
      return;
    }

    if (!this.hasObstacleGap(560)) {
      this.queuePowerUpRetry();
      return;
    }

    this.pendingPowerUpRetry = false;
    this.nextPowerUpAt = this.time.now + 6800;
    const options = [
      { type: "bomb", key: "quackBombV2", label: "BOMBE", icon: "", color: "#ffd43f", ring: 0xffd43f, scale: 0.52, tint: null },
      { type: "magnet", key: "powerupMagnetV2", label: "MAGNET", icon: "", color: "#ffd43f", ring: 0xff70ad, scale: 0.45, tint: null },
      { type: "shield", key: "powerupShieldV2", label: "SCHILD", icon: "", color: "#9df6ff", ring: 0x9df6ff, scale: 0.45, tint: null },
      { type: "turbo", key: "powerupTurboV2", label: "TURBO", icon: "", color: "#ff70ad", ring: 0xff70ad, scale: 0.46, tint: null },
    ];
    const config = Phaser.Utils.Array.GetRandom(this.runTime < 32 ? options.slice(0, 3) : options);
    incrementCounter(this.telemetry.powerup.spawnedByType, config.type);
    const powerUp = this.powerUps.create(GAME_WIDTH + 120, Phaser.Math.Between(285, 420), config.key);
    powerUp.setScale(config.scale);
    powerUp.body.setCircle(48);
    powerUp.setVelocityX(-this.speed * 0.82);
    powerUp.setDepth(6);
    powerUp.setData("cleanup", true);
    powerUp.setData("type", config.type);
    powerUp.setData("labelOffset", 76);
    if (config.tint) {
      powerUp.setTint(config.tint);
    }

    const label = this.add.text(powerUp.x, powerUp.y - 76, config.label, hudTextStyle(18, config.color)).setOrigin(0.5).setDepth(9);
    label.setData("cleanup", true);
    powerUp.setData("label", label);
    this.decoratePowerUp(powerUp, config);

    this.tweens.add({
      targets: powerUp,
      y: powerUp.y - 18,
      angle: 10,
      yoyo: true,
      repeat: -1,
      duration: 780,
      ease: "Sine.inOut",
    });
  }

  queuePowerUpRetry() {
    if (this.pendingPowerUpRetry) {
      return;
    }

    this.pendingPowerUpRetry = true;
    this.time.delayedCall(1450, () => {
      this.pendingPowerUpRetry = false;
      if (this.isPaused && !this.isGameOver) {
        this.queuePowerUpRetry();
        return;
      }

      this.spawnPowerUp();
    });
  }

  decoratePowerUp(powerUp, config) {
    const visual = this.add.container(powerUp.x, powerUp.y);
    visual.setDepth(8);
    visual.setData("cleanup", true);
    const ring = this.add.circle(0, 0, 48, config.ring, 0.12);
    ring.setStrokeStyle(5, config.ring, 0.72);
    const children = [ring];
    if (config.icon) {
      children.push(this.add.text(0, 1, config.icon, hudTextStyle(24, config.color)).setOrigin(0.5));
    }
    visual.add(children);
    powerUp.setData("visual", visual);
    powerUp.setData("ring", ring);
    this.tweens.add({
      targets: ring,
      scale: 1.18,
      alpha: 0.5,
      yoyo: true,
      repeat: -1,
      duration: 520,
      ease: "Sine.inOut",
    });
  }

  collectPearl(_, pearl) {
    if (!pearl.active) {
      return;
    }

    if (pearl.getData("underwater") && !this.isDiving) {
      return;
    }

    const baseValue = pearl.getData("value");
    const value = Math.round(baseValue * this.getComboMultiplier());
    const sequence = pearl.getData("sequence");
    if (sequence) {
      incrementCounter(this.telemetry.reward.collectedBySequence, sequence);
    }
    if (this.isMagnetActive()) {
      incrementCounter(this.telemetry.powerup.usedEffect, "magnetPearlCollect");
    }
    this.score += value;
    this.pearls += 1;
    SoundFX.collect(1 + Math.min(0.6, this.combo * 0.03));
    const driftBonus = this.getDriftBonus();
    if (driftBonus > 0) {
      this.score += driftBonus;
    }
    const isRareCollectible = baseValue >= 80;
    this.addCombo(
      (baseValue >= 50 ? 2 : 1) + (isRareCollectible ? 1 : 0) + (driftBonus > 0 ? 1 : 0),
      driftBonus > 0 ? `SAUBERE LINIE! +${driftBonus}` : getCollectibleMessage(pearl.texture.key),
      pearl.x,
      pearl.y - 50,
      driftBonus > 0 ? "#9df6ff" : isRareCollectible ? "#ff70ad" : "#ffd43f",
    );
    this.burst(pearl.x, pearl.y, [pearl.texture.key], baseValue >= 50 ? 16 : 9, baseValue >= 80 ? 0.16 : baseValue >= 50 ? 0.18 : 0.12, baseValue >= 80 ? 112 : baseValue >= 50 ? 86 : 62);
    this.splash(pearl.x, pearl.y);
    pearl.setActive(false);
    pearl.body.enable = false;
    this.tweens.killTweensOf(pearl);
    this.tweens.add({
      targets: pearl,
      scale: pearl.scale * 1.8,
      alpha: 0,
      duration: 170,
      onComplete: () => pearl.destroy(),
    });
  }

  collectPowerUp(_, powerUp) {
    const type = powerUp.getData("type") || "bomb";
    incrementCounter(this.telemetry.powerup.collectedByType, type);
    powerUp.getData("label")?.destroy();
    this.tweens.killTweensOf(powerUp.getData("ring"));
    powerUp.getData("visual")?.destroy();
    this.tweens.killTweensOf(powerUp);
    powerUp.destroy();

    if (type === "magnet") {
      this.activateMagnet();
      return;
    }

    if (type === "shield") {
      this.activateShield();
      return;
    }

    if (type === "turbo") {
      this.activateTurbo();
      return;
    }

    SoundFX.bomb();
    this.activateQuackBomb();
  }

  activateMagnet() {
    incrementCounter(this.telemetry.powerup.usedEffect, "magnetActivated");
    this.magnetUntil = this.time.now + 9000;
    this.score += 5;
    SoundFX.success();
    this.showFloatingText("MAGNET!", this.duck.x + 170, this.duck.y - 110, "#ffd43f");
    this.burst(this.duck.x + 28, this.duck.y - 20, ["pearlGold", "pearlPink", "pearlBlue"], 24, 0.12, 180);
    this.showMagnetTrail();
  }

  activateShield() {
    incrementCounter(this.telemetry.powerup.usedEffect, "shieldActivated");
    this.shieldCharges = Math.min(2, this.shieldCharges + 1);
    this.score += 5;
    SoundFX.success();
    this.duck.setTint(0x9df6ff);
    this.showFloatingText("SCHAUMSCHILD!", this.duck.x + 180, this.duck.y - 118, "#9df6ff");
    this.burst(this.duck.x + 20, this.duck.y, ["pearlBlue"], 22, 0.12, 150);
  }

  activateTurbo() {
    incrementCounter(this.telemetry.powerup.usedEffect, "turboActivated");
    this.turboUntil = this.time.now + 3500;
    this.invulnerableUntil = Math.max(this.invulnerableUntil, this.turboUntil);
    this.score += 5;
    SoundFX.success();
    this.duck.setTint(0xfff08a);
    this.showFloatingText("TURBO-BLASE!", this.duck.x + 185, this.duck.y - 120, "#ff70ad");
    this.cameras.main.shake(90, 0.003);
    this.burst(this.duck.x + 30, this.duck.y - 6, ["pearlGold", "pearlPink"], 26, 0.13, 180);

    const speedLines = this.add.image(this.duck.x - 42, this.duck.y + 18, "fxSpeedLines").setScale(0.46).setAlpha(0.62).setDepth(6);
    this.tweens.add({
      targets: speedLines,
      x: speedLines.x - 150,
      alpha: 0,
      duration: 520,
      ease: "Cubic.out",
      onComplete: () => speedLines.destroy(),
    });
  }

  activateQuackBomb() {
    incrementCounter(this.telemetry.powerup.usedEffect, "bombActivated");
    this.bombFlashUntil = this.time.now + 1100;
    this.score += 5;
    this.showFloatingText("QUAK-SCHOCKWELLE!", this.duck.x + 190, this.duck.y - 120, "#ffd43f");
    this.cameras.main.shake(120, 0.006);
    this.burst(this.duck.x + 30, this.duck.y - 10, ["pearlGold", "pearlBlue", "quackBombV2"], 22, 0.15, 210);

    const waveKey = this.textures.exists("fxQuackWavePrompt") ? "fxQuackWavePrompt" : "fxQuackWave";
    const wave = this.add.image(this.duck.x, this.duck.y + 8, waveKey).setScale(waveKey === "fxQuackWavePrompt" ? 0.18 : 0.16).setAlpha(0.88).setDepth(17);
    this.tweens.add({
      targets: wave,
      scale: 1.05,
      alpha: 0,
      duration: 440,
      ease: "Cubic.out",
      onComplete: () => wave.destroy(),
    });

    const ring = this.add.circle(this.duck.x, this.duck.y, 18);
    ring.setDepth(18);
    ring.setStrokeStyle(8, 0x6ff4ff, 0.9);
    this.tweens.add({
      targets: ring,
      radius: 520,
      alpha: 0,
      duration: 420,
      ease: "Cubic.out",
      onComplete: () => ring.destroy(),
    });

    let cleared = 0;
    this.obstacles.getChildren().forEach((obstacle) => {
      if (!obstacle.active || obstacle.x < this.duck.x - 60 || obstacle.x > GAME_WIDTH + 140) {
        return;
      }

      cleared += 1;
      this.recordChallengeOutcome(obstacle, "bombCleared");
      this.prepareObstacleForRemoval(obstacle);
      this.tweens.add({
        targets: obstacle,
        x: obstacle.x + 210,
        y: obstacle.y - 80,
        angle: obstacle.angle + 50,
        alpha: 0,
        duration: 320,
        ease: "Back.in",
        onComplete: () => obstacle.destroy(),
      });
    });

    if (cleared > 0) {
      this.score += cleared * 10;
      incrementCounter(this.telemetry.powerup.usedEffect, "bombCleared", cleared);
    }
  }

  showMagnetTrail() {
    if (!this.textures.exists("fxMagnetPullTrail")) {
      return;
    }

    const trail = this.add.image(this.duck.x + 8, this.duck.y + 4, "fxMagnetPullTrail").setScale(0.2).setAlpha(0.62).setDepth(17);
    trail.setBlendMode(Phaser.BlendModes.SCREEN);
    this.tweens.add({
      targets: trail,
      scale: 0.34,
      angle: 16,
      alpha: 0,
      duration: 620,
      ease: "Cubic.out",
      onComplete: () => trail.destroy(),
    });
  }

  handleHit(_, obstacle) {
    if (this.isGameOver) {
      return;
    }

    // resolveObstacleChallengeWindows() runs in update() before the physics
    // overlap fires and is the authority on each obstacle's outcome. Once it
    // has resolved an obstacle, the overlap must not re-process it.
    if (obstacle.getData("passed")) {
      return;
    }

    if (this.time.now < this.invulnerableUntil && !this.isTurboActive()) {
      return;
    }

    const mode = obstacle.getData("mode");
    if (mode === "underwater" && !this.isDiving) {
      return;
    }

    if (mode === "dive" && this.isDiving) {
      this.passUnderObstacle(obstacle);
      return;
    }

    if (mode === "stomp" && this.canStomp(obstacle)) {
      this.stompObstacle(obstacle);
      return;
    }

    if (this.isTurboActive()) {
      this.burstThroughObstacle(obstacle);
      return;
    }

    if (this.shieldCharges > 0) {
      this.absorbHit(obstacle);
      return;
    }

    this.recordChallengeOutcome(obstacle, "hit");
    // 0 hearts is a "last chance": the run only ends when a hit lands while
    // already out of hearts. So a hit is fatal only if lives is already 0.
    const fatal = this.lives <= 0;
    if (!fatal) {
      this.lives -= 1;
    }
    this.combo = 0;
    this.comboText.setText("");
    SoundFX.hit();
    this.burst(this.duck.x + 40, this.duck.y + 8, ["pearlBlue"], 18, 0.1, 118);
    this.invulnerableUntil = this.time.now + 1350;
    this.cameras.main.shake(150, 0.007);

    if (obstacle?.active) {
      this.prepareObstacleForRemoval(obstacle);
      this.tweens.add({
        targets: obstacle,
        x: obstacle.x + 150,
        y: obstacle.y - 52,
        angle: obstacle.angle + 35,
        alpha: 0,
        duration: 260,
        ease: "Back.in",
        onComplete: () => obstacle.destroy(),
      });
    }

    if (!fatal) {
      const lastChance = this.lives <= 0;
      this.duck.setTint(lastChance ? 0xff8a5c : 0x9df6ff);
      this.showFloatingText(
        lastChance ? "LETZTE CHANCE!" : "AUTSCH!",
        this.duck.x + 170,
        this.duck.y - 110,
        lastChance ? "#ff8a5c" : "#9df6ff",
      );
      this.tweens.add({
        targets: this.duck,
        alpha: 0.44,
        yoyo: true,
        repeat: 5,
        duration: 110,
        onComplete: () => {
          this.duck.clearTint();
          this.duck.setAlpha(1);
        },
      });
      return;
    }

    this.isGameOver = true;
    this.physics.pause();
    this.setPearlTweensPaused(true);
    this.cameras.main.shake(220, 0.012);
    this.duck.setTint(0xff6f59);
    this.duck.setAngle(-22);
    this.saveAndShowGameOver();
  }

  burstThroughObstacle(obstacle) {
    if (!obstacle?.active) {
      return;
    }

    this.recordChallengeOutcome(obstacle, "turboCleared");
    incrementCounter(this.telemetry.powerup.usedEffect, "turboCleared");
    this.score += 30;
    this.addCombo(3, "TURBO DURCH!", obstacle.x, obstacle.y - 90, "#ff70ad");
    SoundFX.success();
    this.prepareObstacleForRemoval(obstacle);
    this.burst(obstacle.x, obstacle.y, ["pearlPink", "pearlGold"], 22, 0.12, 160);
    this.tweens.add({
      targets: obstacle,
      x: obstacle.x + 180,
      alpha: 0,
      scale: obstacle.scale * 1.3,
      duration: 220,
      ease: "Cubic.out",
      onComplete: () => obstacle.destroy(),
    });
  }

  absorbHit(obstacle) {
    this.recordChallengeOutcome(obstacle, "absorbed");
    incrementCounter(this.telemetry.powerup.usedEffect, "shieldAbsorb");
    this.shieldCharges -= 1;
    this.score += 20;
    this.addCombo(2, "SCHILD HAELT!", this.duck.x + 160, this.duck.y - 95, "#9df6ff");
    SoundFX.success();
    this.cameras.main.shake(90, 0.004);
    this.burst(this.duck.x + 28, this.duck.y - 8, ["pearlBlue"], 26, 0.13, 170);

    if (obstacle?.active) {
      this.prepareObstacleForRemoval(obstacle);
      this.tweens.add({
        targets: obstacle,
        x: obstacle.x + 150,
        y: obstacle.y - 60,
        angle: obstacle.angle + 28,
        alpha: 0,
        duration: 240,
        ease: "Back.in",
        onComplete: () => obstacle.destroy(),
      });
    }
  }

  saveAndShowGameOver() {
    const finalScore = Math.floor(this.score);
    const previousHighscore = this.stats.highscore;
    const nextStats = this.persistGameResult(readPlayerName());
    const isNewHighscore = finalScore > previousHighscore;
    const isTopFive = nextStats.scores.some((entry) => entry.id === this.resultEntryId);
    this.publishRunTelemetry(finalScore);

    const shade = makeScreenShade(this, 0.54, 30);
    const card = makeGlassPanel(this, 260, 96, 760, 522, 31, 0x086fc0);
    const gameOverDuck = this.add.image(404, 366, "duckGameOver").setScale(0.36).setDepth(32);
    const resultColumnX = 794;
    const resultBoxX = 638;
    const resultBoxWidth = 312;

    const title = isNewHighscore ? "NEUER ENTENREKORD!" : "ENTE GESTOPPT";
    const titleColor = isNewHighscore ? "#ffd43f" : "#ff70ad";
    const titleSize = isNewHighscore ? 44 : 50;
    this.add.text(GAME_WIDTH / 2, 152, title, titleStyle(titleSize, titleColor)).setOrigin(0.5).setDepth(32);
    // PUNKTE box: number + label centered as a group in the box.
    makeScoreBox(this, resultBoxX, 218, resultBoxWidth, 118, "", "", "#ffffff", 32);
    const scoreText = this.add
      .text(resultColumnX, 268, `${finalScore.toLocaleString("de-DE")}`, titleStyle(60, "#ffffff"))
      .setOrigin(0.5)
      .setDepth(32)
      .setScale(0.78);
    this.tweens.add({
      targets: scoreText,
      scale: 1,
      duration: 260,
      ease: "Back.out",
    });
    this.add.text(resultColumnX, 312, "PUNKTE", hudTextStyle(19, "#ffffff")).setOrigin(0.5).setDepth(33);
    // PERLEN box: pearl icon + number centered as one unit, label below.
    makeScoreBox(this, resultBoxX, 358, resultBoxWidth, 78, "", "", "#ff70ad", 32);
    const pearlNum = this.add.text(0, 386, this.pearls.toLocaleString("de-DE"), titleStyle(34, "#ffffff")).setOrigin(0.5).setDepth(33);
    const pearlIcon = this.add.image(0, 386, "pearlPink").setScale(0.24).setDepth(33);
    const pearlGroupW = pearlIcon.displayWidth + 12 + pearlNum.width;
    pearlIcon.setX(resultColumnX - pearlGroupW / 2 + pearlIcon.displayWidth / 2);
    pearlNum.setX(pearlIcon.x + pearlIcon.displayWidth / 2 + 12 + pearlNum.width / 2);
    this.add.text(resultColumnX, 418, "PERLEN", hudTextStyle(15, "#ffffff")).setOrigin(0.5).setDepth(33);
    if (!isTopFive) {
      this.add
        .text(GAME_WIDTH / 2, 474, `Highscore ${nextStats.highscore.toLocaleString("de-DE")}`, hudTextStyle(22, "#ffd43f"))
        .setOrigin(0.5)
        .setDepth(32);
    }

    // Run summary in the free band under the duck (above the buttons): turns the
    // game-over screen into a self-comparison hook that pulls "one more try".
    const totalSeconds = Math.floor(this.runTime);
    const timeLabel = `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
    const sumBucket = (bucket) => Object.values(bucket || {}).reduce((acc, n) => acc + n, 0);
    const ch = this.telemetry.challenge;
    const overcome =
      sumBucket(ch.clearedByMode) +
      sumBucket(ch.turboClearedByMode) +
      sumBucket(ch.bombClearedByMode) +
      sumBucket(ch.absorbedByMode);
    // Shown only when there's no name-input crowding the footer (non-top-5 runs).
    if (!isTopFive) {
      this.add
        .text(
          GAME_WIDTH / 2,
          506,
          `ZEIT ${timeLabel}    ·    BESTE COMBO x${this.longestCombo}    ·    GEGNER ${overcome}`,
          hudTextStyle(18, "#eaffff"),
        )
        .setOrigin(0.5)
        .setDepth(33);
    }

    let nameLabel = null;
    if (isTopFive) {
      nameLabel = this.add.text(resultColumnX, 460, "BESTENLISTE NAME", hudTextStyle(18, "#9df6ff")).setOrigin(0.5).setDepth(32);
      this.add.image(resultColumnX, 498, "uiInputName").setDisplaySize(resultBoxWidth, 42).setDepth(32);
      this.createNameInput(readPlayerName(), resultBoxX, 482, resultBoxWidth, 32);
      // Enter confirms the name and jumps to the leaderboard.
      this.nameInput?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          this.savePendingGameOverName();
          this.destroyNameInput();
          this.scene.start("HighscoreScene");
        }
      });
    }

    if (isNewHighscore) {
      this.cameras.main.shake(150, 0.006);
      this.burst(GAME_WIDTH / 2, 242, ["pearlGold", "pearlPink", "pearlBlue"], 42, 0.16, 290, 33);
      const ring = this.add.circle(GAME_WIDTH / 2, 260, 30);
      ring.setDepth(32);
      ring.setStrokeStyle(7, 0xffd43f, 0.85);
      this.tweens.add({
        targets: ring,
        radius: 260,
        alpha: 0,
        duration: 520,
        ease: "Cubic.out",
        onComplete: () => ring.destroy(),
      });
    }

    const buttonY = isTopFive ? 572 : 558;
    const again = makeButton(this, 412, buttonY, "NOCHMAL", 190, { icon: false, fontSize: 23 });
    again.setDepth(32);
    again.on("pointerdown", () => {
      this.savePendingGameOverName();
      this.destroyNameInput();
      this.scene.restart();
    });

    // When the player is entering a top-5 name, the middle button confirms the
    // name and jumps to the leaderboard; otherwise it just opens the leaderboard.
    const midLabel = isTopFive ? "BESTÄTIGEN" : "HIGHSCORE";
    const midWidth = isTopFive ? 224 : 196;
    const highscore = makeButton(this, 640, buttonY, midLabel, midWidth, { icon: false, fontSize: 23 });
    highscore.setDepth(32);
    highscore.on("pointerdown", () => {
      this.savePendingGameOverName();
      this.destroyNameInput();
      this.scene.start("HighscoreScene");
    });

    const menu = makeButton(this, 852, buttonY, "MENÜ", 166, { icon: false, fontSize: 23 });
    menu.setDepth(32);
    menu.on("pointerdown", () => {
      this.savePendingGameOverName();
      this.destroyNameInput();
      this.scene.start("MenuScene");
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroyNameInput());
  }

  publishRunTelemetry(finalScore) {
    this.telemetry.endedAt = new Date().toISOString();
    this.telemetry.final = {
      score: finalScore,
      pearls: this.pearls,
      runTime: Number(this.runTime.toFixed(2)),
      lives: this.lives,
    };
    publishRunTelemetry(this.telemetry);
  }

  savePendingGameOverName() {
    if (!this.nameInput) {
      return;
    }

    this.persistGameResult(this.nameInput.value);
  }

  persistGameResult(name) {
    const finalScore = Math.floor(this.score);
    const cleanName = sanitizePlayerName(name);
    writePlayerName(cleanName);

    const currentStats = readStats();
    const entryId = this.resultEntryId || `${Date.now()}-${Phaser.Math.Between(1000, 9999)}`;
    const existingScores = currentStats.scores.filter((entry) => entry.id !== entryId);
    const resultEntry = {
      id: entryId,
      name: cleanName,
      score: finalScore,
      pearls: this.pearls,
      date: new Date().toISOString(),
    };
    const scores = finalScore > 0 ? [...existingScores, resultEntry].sort((a, b) => b.score - a.score).slice(0, 5) : existingScores;
    const nextStats = {
      highscore: Math.max(currentStats.highscore, finalScore, scores[0]?.score ?? 0),
      games: currentStats.games + (this.resultSaved ? 0 : 1),
      scores,
    };

    this.resultSaved = true;
    this.resultEntryId = entryId;
    this.stats = nextStats;
    writeStats(nextStats);
    return nextStats;
  }

  createNameInput(initialName, x, y, width, height) {
    this.destroyNameInput();
    const canvas = this.game.canvas;
    const input = document.createElement("input");
    input.type = "text";
    input.value = sanitizePlayerName(initialName);
    input.maxLength = 12;
    input.autocomplete = "off";
    input.spellcheck = false;
    input.style.position = "fixed";
    input.style.zIndex = "1000";
    input.style.border = "2px solid rgba(157,246,255,0.95)";
    input.style.borderRadius = "12px";
    input.style.background = "rgba(5,38,64,0.92)";
    input.style.color = "#ffffff";
    input.style.boxSizing = "border-box";
    input.style.padding = "0 12px";
    input.style.textAlign = "center";
    input.style.outline = "none";
    input.style.boxShadow = "0 8px 24px rgba(0,0,0,0.28)";
    input.addEventListener("input", () => {
      input.value = filterPlayerNameInput(input.value);
    });
    document.body.appendChild(input);
    this.nameInput = input;
    this.nameInputLayoutHandler = () => {
      const rect = canvas.getBoundingClientRect();
      const pixelHeight = Math.max(24, (height / GAME_HEIGHT) * rect.height);
      const fontSize = Phaser.Math.Clamp(pixelHeight * 0.55, 13, 19);
      input.style.left = `${rect.left + (x / GAME_WIDTH) * rect.width}px`;
      input.style.top = `${rect.top + (y / GAME_HEIGHT) * rect.height}px`;
      input.style.width = `${(width / GAME_WIDTH) * rect.width}px`;
      input.style.height = `${pixelHeight}px`;
      input.style.font = `900 ${fontSize}px Trebuchet MS, sans-serif`;
      input.style.lineHeight = `${Math.max(18, pixelHeight - 4)}px`;
      input.style.borderRadius = `${Math.max(8, Math.min(12, pixelHeight * 0.34))}px`;
    };
    this.nameInputLayoutHandler();
    window.addEventListener("resize", this.nameInputLayoutHandler);
    window.addEventListener("orientationchange", this.nameInputLayoutHandler);
    input.focus();
    input.select();
  }

  destroyNameInput() {
    if (!this.nameInput) {
      return;
    }

    if (this.nameInputLayoutHandler) {
      window.removeEventListener("resize", this.nameInputLayoutHandler);
      window.removeEventListener("orientationchange", this.nameInputLayoutHandler);
      this.nameInputLayoutHandler = null;
    }
    this.nameInput.remove();
    this.nameInput = null;
  }

  togglePause() {
    if (this.isGameOver) {
      return;
    }

    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.pausedAt = this.time.now;
      this.physics.pause();
      this.setPearlTweensPaused(true);
      this.showPauseOverlay();
    } else {
      this.resumeGame();
    }
  }

  compensatePausedTime() {
    // this.time.now keeps advancing while paused, so absolute deadlines would
    // otherwise expire during the pause. Shift active deadlines and past
    // timestamps forward by the paused duration.
    if (!this.pausedAt) {
      return;
    }
    const pausedFor = this.time.now - this.pausedAt;
    this.pausedAt = 0;
    for (const key of ["magnetUntil", "turboUntil", "invulnerableUntil", "nextPowerUpAt", "diveUntil", "diveRecoverUntil"]) {
      if (this[key] > this.time.now - pausedFor) {
        this[key] += pausedFor;
      }
    }
    if (this.lastComboAt) {
      this.lastComboAt += pausedFor;
    }
  }

  showPauseOverlay() {
    this.resetTouchDrift();
    this.destroyPauseOverlay();
    const shade = makeScreenShade(this, 0.56, 40);
    const card = makeGlassPanel(this, 360, 96, 560, 474, 41, 0x0878ca);
    const title = this.add.text(GAME_WIDTH / 2, 178, "PAUSE", titleStyle(64, "#ffffff")).setOrigin(0.5).setDepth(42);
    const stats = this.add
      .text(
        GAME_WIDTH / 2,
        232,
        `${Math.floor(this.score).toLocaleString("de-DE")} Punkte   ${this.pearls.toLocaleString("de-DE")} Perlen`,
        hudTextStyle(20, "#9df6ff"),
      )
      .setOrigin(0.5)
      .setDepth(42);
    const resume = makeButton(this, GAME_WIDTH / 2, 318, "WEITER", 390);
    resume.setDepth(43);
    resume.on("pointerdown", () => this.resumeGame());
    const restart = makeButton(this, GAME_WIDTH / 2, 412, "NEUSTART", 390);
    restart.setDepth(43);
    restart.on("pointerdown", () => this.scene.restart());
    const exit = makeButton(this, GAME_WIDTH / 2, 506, "MENÜ", 390);
    exit.setDepth(43);
    exit.on("pointerdown", () => this.exitToMenu());

    this.pauseOverlay = [shade, card, title, stats, resume, restart, exit];
  }

  resumeGame() {
    if (this.isGameOver) {
      return;
    }

    this.resetTouchDrift();
    this.isPaused = false;
    this.compensatePausedTime();
    this.destroyPauseOverlay();
    this.physics.resume();
    this.setPearlTweensPaused(false);
  }

  destroyPauseOverlay() {
    if (!Array.isArray(this.pauseOverlay)) {
      this.pauseOverlay = null;
      return;
    }

    this.pauseOverlay.forEach((element) => element?.destroy());
    this.pauseOverlay = null;
  }

  exitToMenu() {
    this.resetTouchDrift();
    this.isPaused = false;
    this.setPearlTweensPaused(false);
    this.scene.start("MenuScene");
  }

  setPearlTweensPaused(paused) {
    this.children.each((child) => {
      if (!isPearlAnimationTarget(child)) {
        return;
      }

      this.tweens.getTweensOf(child).forEach((tween) => {
        if (paused) {
          tween.pause();
        } else if (tween.paused) {
          tween.resume();
        }
      });
    });
  }

  splash(x, y) {
    this.splashEmitter.emitParticleAt(x, y, 16);
  }

  waterImpactSplash(x, y, fallVelocity = 0) {
    if (this.time.now < this.suppressLandingSplashUntil || this.time.now < this.lastImpactSplashAt + 140) {
      return;
    }

    this.lastImpactSplashAt = this.time.now;
    const intensity = Phaser.Math.Clamp(Math.abs(fallVelocity) / 520, 0.75, 1.55);
    this.splashEmitter.emitParticleAt(x, y, Math.round(24 * intensity));

    const wake = this.add.ellipse(x + 6, y + 16, 68, 16);
    wake.setDepth(7);
    wake.setStrokeStyle(4, 0xeaffff, 0.72);
    this.tweens.add({
      targets: wake,
      scaleX: 2.25,
      scaleY: 1.45,
      alpha: 0,
      duration: 360,
      ease: "Cubic.out",
      onComplete: () => wake.destroy(),
    });

    const count = Math.round(10 + intensity * 8);
    for (let index = 0; index < count; index += 1) {
      const side = index % 2 === 0 ? -1 : 1;
      const droplet = this.add
        .image(x + Phaser.Math.Between(-18, 18), y + Phaser.Math.Between(-4, 10), "pearlBlue")
        .setScale(Phaser.Math.FloatBetween(0.055, 0.105))
        .setAlpha(0.68)
        .setDepth(10);
      this.tweens.add({
        targets: droplet,
        x: droplet.x + side * Phaser.Math.Between(44, Math.round(105 * intensity)),
        y: droplet.y - Phaser.Math.Between(36, Math.round(95 * intensity)),
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(320, 560),
        ease: "Cubic.out",
        onComplete: () => droplet.destroy(),
      });
    }
  }

  showDiveWake() {
    this.diveWake?.destroy();
    this.diveWake = this.add.ellipse(this.duck.x + 24, this.duck.y + 42, 172, 54, 0x6ff4ff, 0.28);
    this.diveWake.setDepth(7);
    this.diveWake.setStrokeStyle(3, 0xeaffff, 0.45);

    this.diveShade?.destroy();
    this.diveShade = this.add.ellipse(this.duck.x + 22, this.duck.y + 52, 190, 72, 0x0ba4c8, 0.24);
    this.diveShade.setDepth(8);

    this.diveBubbleTrail?.destroy();
    const trailKey = this.textures.exists("fxDiveLaneTrail") ? "fxDiveLaneTrail" : "fxUnderwaterBubbles";
    this.diveBubbleTrail = this.add.image(this.duck.x + 16, this.duck.y + 42, trailKey);
    this.diveBubbleTrail.setScale(trailKey === "fxDiveLaneTrail" ? 0.16 : 0.3);
    this.diveBubbleTrail.setAlpha(trailKey === "fxDiveLaneTrail" ? 0.54 : 0.58);
    this.diveBubbleTrail.setDepth(9);
    if (trailKey === "fxDiveLaneTrail") {
      this.diveBubbleTrail.setBlendMode(Phaser.BlendModes.SCREEN);
    }
  }

  showDiveStatus() {
    this.diveStatusText?.destroy();
    this.diveStatusText = this.add.text(this.duck.x + 118, this.duck.y + 2, "UNTER WASSER", hudTextStyle(18, "#9df6ff"));
    this.diveStatusText.setOrigin(0.5);
    this.diveStatusText.setDepth(22);
    this.diveStatusText.setAlpha(0.92);
  }

  syncDiveVisual() {
    if (!this.isDiving) {
      return;
    }

    this.duck.body.allowGravity = false;
    this.duck.body.checkCollision.down = false;
    this.duck.body.checkCollision.up = false;
    this.duck.setVelocityY(0);
    this.duck.y = Phaser.Math.Linear(this.duck.y, DUCK_DIVE_Y, 0.24);
    this.duck.setAlpha(0.68 + Math.sin(this.time.now / 90) * 0.04);
    this.diveWake?.setPosition(this.duck.x + 28, this.duck.y + 42);
    this.diveShade?.setPosition(this.duck.x + 30, this.duck.y + 52);
    this.diveBubbleTrail?.setPosition(this.duck.x + 20, this.duck.y + 42);
    this.diveBubbleTrail?.setAlpha(0.5 + Math.sin(this.time.now / 120) * 0.08);
    this.diveStatusText?.setPosition(this.duck.x + 128, this.duck.y + 4);
    this.emitDiveBubble();
  }

  emitDiveBubble() {
    if (this.time.now < this.lastDiveBubbleAt + 78) {
      return;
    }

    this.lastDiveBubbleAt = this.time.now;
    const bubble = this.add
      .image(this.duck.x + Phaser.Math.Between(14, 68), this.duck.y + Phaser.Math.Between(18, 58), "fxBubblePop")
      .setScale(0.11)
      .setAlpha(0.5)
      .setDepth(9);
    this.tweens.add({
      targets: bubble,
      x: bubble.x + Phaser.Math.Between(8, 32),
      y: bubble.y - Phaser.Math.Between(24, 58),
      alpha: 0,
      scale: 0,
      duration: 420,
      ease: "Cubic.out",
      onComplete: () => bubble.destroy(),
    });
  }

  burst(x, y, keys, count = 12, scale = 0.12, distance = 80, depth = 21) {
    for (let index = 0; index < count; index += 1) {
      const key = Phaser.Utils.Array.GetRandom(keys);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const travel = Phaser.Math.Between(distance * 0.35, distance);
      const particle = this.add.image(x, y, key).setScale(scale).setAlpha(0.9).setDepth(depth);
      const tween = this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * travel,
        y: y + Math.sin(angle) * travel * 0.72,
        angle: Phaser.Math.Between(-160, 160),
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(360, 680),
        ease: "Cubic.out",
        onComplete: () => particle.destroy(),
      });
      if ((this.isPaused || this.isGameOver) && isPearlAnimationTarget(particle)) {
        tween.pause();
      }
    }
  }

  updateHud() {
    const scoreValue = Math.floor(this.score);
    if (this.hudCache.score !== scoreValue) {
      this.hudCache.score = scoreValue;
      this.scoreText.setText(scoreValue.toLocaleString("de-DE"));
    }

    if (this.hudCache.pearls !== this.pearls) {
      this.hudCache.pearls = this.pearls;
      this.pearlText.setText(this.pearls.toLocaleString("de-DE"));
    }

    if (this.hudCache.lives !== this.lives || this.hudCache.shieldCharges !== this.shieldCharges) {
      this.hudCache.lives = this.lives;
      this.hudCache.shieldCharges = this.shieldCharges;
      this.lifeBubbles.forEach((bubble, index) => {
        const alive = index < this.lives;
        bubble.setAlpha(alive ? 0.86 : 0.2);
        bubble.setScale(alive ? (index < this.shieldCharges ? 0.058 : 0.052) : 0.04);
        setHeartIconColor(bubble, index < this.shieldCharges ? 0x9df6ff : 0xff3f76);
      });
    }
    this.updatePowerHud();
  }

  updatePowerHud() {
    const magnetSeconds = Math.ceil(Math.max(0, this.magnetUntil - this.time.now) / 1000);
    const turboSeconds = Math.ceil(Math.max(0, this.turboUntil - this.time.now) / 1000);
    updateSpecialSlot(this.specialSlots.shield, this.shieldCharges > 0 ? `${this.shieldCharges}` : "", this.shieldCharges > 0);
    updateSpecialSlot(this.specialSlots.magnet, magnetSeconds > 0 ? `${magnetSeconds}s` : "", magnetSeconds > 0);
    updateSpecialSlot(this.specialSlots.turbo, turboSeconds > 0 ? `${turboSeconds}s` : "", turboSeconds > 0);
    updateSpecialSlot(this.specialSlots.bomb, this.time.now < this.bombFlashUntil ? "!" : "", this.time.now < this.bombFlashUntil);
  }

  expireCombo() {
    if (this.combo === 0 || this.time.now - this.lastComboAt < 1400) {
      return;
    }

    this.combo = 0;
    this.comboText.setText("");
  }

  updatePowerUpState() {
    if (this.isTurboActive()) {
      this.duck.setTint(0xfff08a);
      return;
    }

    if (this.isDiving) {
      this.duck.setTint(0x6ff4ff);
      return;
    }

    if (this.shieldCharges > 0) {
      this.duck.setTint(0x9df6ff);
      return;
    }

    if (this.time.now >= this.invulnerableUntil) {
      this.duck.clearTint();
    }
  }

  isMagnetActive() {
    return this.time.now < this.magnetUntil;
  }

  isTurboActive() {
    return this.time.now < this.turboUntil;
  }

  setDuckNormalBody() {
    this.duck.body.setSize(120, 92);
    this.duck.body.setOffset(58, 100);
  }

  updateDiveState() {
    if (!this.isDiving) {
      return;
    }

    if (this.time.now < this.diveUntil) {
      return;
    }

    if (this.diveHeld && this.time.now < this.diveStartedAt + DIVE_MAX_DURATION) {
      return;
    }

    this.finishDive();
  }

  finishDive() {
    if (!this.isDiving) {
      return;
    }

    this.isDiving = false;
    this.isResurfacing = true;
    this.diveHeld = false;
    this.diveRecoverUntil = this.time.now + DIVE_RECOVERY_DURATION;
    this.setDuckNormalBody();
    this.duck.body.allowGravity = false;
    this.duck.body.checkCollision.down = false;
    this.duck.body.checkCollision.up = false;
    this.duck.setVelocityY(0);
    this.duck.setAngle(-10);
    this.duck.setAlpha(1);
    if (this.time.now >= this.invulnerableUntil && !this.isTurboActive()) {
      this.duck.clearTint();
    }
    this.diveWake?.destroy();
    this.diveWake = null;
    this.diveShade?.destroy();
    this.diveShade = null;
    this.diveBubbleTrail?.destroy();
    this.diveBubbleTrail = null;
    this.diveStatusText?.destroy();
    this.diveStatusText = null;
    this.splash(this.duck.x - 28, this.duck.y + 48);
    this.tweens.add({
      targets: this.duck,
      y: DUCK_SURFACE_Y,
      angle: -4,
      duration: 240,
      ease: "Cubic.out",
      onComplete: () => {
        // Don't re-enable gravity/collision on a duck that died mid-resurface
        // (the tween keeps running after physics.pause() on game-over).
        if (this.isGameOver) {
          return;
        }
        this.isResurfacing = false;
        this.setDuckNormalBody();
        this.duck.body.allowGravity = true;
        this.duck.body.checkCollision.down = true;
        this.duck.body.checkCollision.up = true;
        if (this.surfaceCollider) {
          this.surfaceCollider.active = true;
        }
        this.duck.setVelocityY(0);
      },
    });
    this.time.delayedCall(210, () => {
      if (!this.isGameOver && !this.isDiving && this.shieldCharges === 0 && !this.isTurboActive() && this.time.now >= this.invulnerableUntil) {
        this.duck.clearTint();
      }
    });
  }

  canStomp(obstacle) {
    const duckBottom = this.duck.body.y + this.duck.body.height;
    const obstacleTop = obstacle.body.y;
    const isAboveObstacle = duckBottom < obstacleTop + STOMP_TOP_GRACE;
    const isNearApexOrFalling = this.duck.body.velocity.y > STOMP_MIN_VELOCITY_Y;
    const isCenteredEnough = Math.abs(this.duck.x - obstacle.x) < STOMP_HORIZONTAL_GRACE;
    return !this.isDiving && isNearApexOrFalling && isAboveObstacle && isCenteredEnough;
  }

  isPreparingStomp(obstacle) {
    const duckBottom = this.duck.body.y + this.duck.body.height;
    const obstacleTop = obstacle.body.y;
    const isStillAboveObstacle = duckBottom < obstacleTop + STOMP_TOP_GRACE + 34;
    const isNearStompLine = Math.abs(this.duck.x - obstacle.x) < STOMP_HORIZONTAL_GRACE + 48;
    const isStillApproaching = obstacle.x > this.duck.x - 12;
    return !this.isDiving && isStillAboveObstacle && isNearStompLine && isStillApproaching;
  }

  updateHorizontalControl(deltaSeconds) {
    const movingLeft = this.cursors.left?.isDown || this.wasd.A?.isDown || this.touchDriftDirection < 0;
    const movingRight = this.cursors.right?.isDown || this.wasd.D?.isDown || this.touchDriftDirection > 0;
    let targetX = DUCK_HOME_X;

    if (movingLeft && !movingRight) {
      targetX = DUCK_MIN_X;
    } else if (movingRight && !movingLeft) {
      targetX = DUCK_MAX_X;
    }

    const desiredVelocity = Phaser.Math.Clamp((targetX - this.duck.x) * 8, -520, 520);
    this.duck.setVelocityX(desiredVelocity);
    this.duck.x = Phaser.Math.Clamp(this.duck.x, DUCK_MIN_X, DUCK_MAX_X);

    if ((movingLeft || movingRight) && !this.isDiving) {
      const lean = movingLeft ? -7 : 7;
      this.lastDriftInputAt = this.time.now;
      this.duck.setAngle(Phaser.Math.Linear(this.duck.angle, lean, Math.min(1, deltaSeconds * 10)));
      this.emitDriftBubble();
    }
  }

  getDriftBonus() {
    if (this.isDiving || this.time.now - this.lastDriftInputAt > 260) {
      return 0;
    }

    // Only reward drifting when there's actually an obstacle to dodge nearby —
    // otherwise it's free score for wiggling on an empty lane.
    const dodging = this.obstacles
      .getChildren()
      .some((o) => o.active && !o.getData("passed") && o.x > this.duck.x - 60 && o.x < this.duck.x + 420);
    if (!dodging) {
      return 0;
    }

    const offset = Math.abs(this.duck.x - DUCK_HOME_X);
    if (offset > 280) {
      return 12;
    }
    if (offset > 140) {
      return 6;
    }
    return 0;
  }

  emitDriftBubble() {
    if (this.time.now < this.lastDriftBubbleAt + 120) {
      return;
    }

    this.lastDriftBubbleAt = this.time.now;
    const bubble = this.add.image(this.duck.x - 62, this.duck.y + 42, "pearlBlue").setScale(0.08).setAlpha(0.42).setDepth(6);
    this.tweens.add({
      targets: bubble,
      x: bubble.x - Phaser.Math.Between(18, 42),
      y: bubble.y - Phaser.Math.Between(8, 30),
      alpha: 0,
      scale: 0,
      duration: 360,
      ease: "Cubic.out",
      onComplete: () => bubble.destroy(),
    });
  }

  rewardPassedJumpObstacles() {
    this.obstacles.getChildren().forEach((obstacle) => {
      if (!obstacle.active || obstacle.getData("mode") !== "jump" || obstacle.getData("passed")) {
        return;
      }

      if (obstacle.x > this.duck.x - 46) {
        return;
      }

      if (!this.hasClearedJumpObstacle(obstacle)) {
        return;
      }

      this.scoreJumpObstacle(obstacle);
    });
  }

  resolveObstacleChallengeWindows() {
    this.obstacles.getChildren().forEach((obstacle) => {
      // A hit on an earlier obstacle this frame can end the run mid-loop; stop
      // resolving the rest so no score/combo is awarded after game-over.
      if (this.isGameOver) {
        return;
      }
      if (!obstacle.active || obstacle.getData("passed") || obstacle.x > this.duck.x + 74 || obstacle.x < this.duck.x - 96) {
        return;
      }

      // Resolve a HIT only at near-contact, not when the obstacle first enters
      // the window. Clearing/passing can happen anywhere in the window, so the
      // player has until the obstacle actually reaches the duck to jump/dive.
      const hitX = this.duck.x + 34;
      const mode = obstacle.getData("mode");
      if (mode === "jump") {
        if (this.hasClearedJumpObstacle(obstacle)) {
          this.scoreJumpObstacle(obstacle);
          return;
        }
        if (obstacle.x > hitX) {
          return;
        }
        this.handleHit(this.duck, obstacle);
        return;
      }

      if (mode === "dive") {
        if (this.isDiving) {
          this.passUnderObstacle(obstacle);
          return;
        }
        if (obstacle.x > hitX) {
          return;
        }
        this.handleHit(this.duck, obstacle);
        return;
      }

      if (mode === "stomp") {
        if (this.canStomp(obstacle)) {
          this.stompObstacle(obstacle);
          return;
        }

        if (this.isPreparingStomp(obstacle)) {
          return;
        }
        if (obstacle.x > hitX) {
          return;
        }
        this.handleHit(this.duck, obstacle);
        return;
      }

      if (mode === "underwater") {
        if (this.isDiving) {
          if (obstacle.x > hitX) {
            return;
          }
          this.handleHit(this.duck, obstacle);
          return;
        }
        if (obstacle.x > this.duck.x + 26) {
          return;
        }
        obstacle.setData("passed", true);
        this.recordChallengeOutcome(obstacle, "cleared");
        this.addCombo(1, "OBEN VORBEI!", obstacle.x, obstacle.y - 118, "#ff70ad");
      }
    });
  }

  scoreJumpObstacle(obstacle) {
    obstacle.setData("passed", true);
    this.recordChallengeOutcome(obstacle, "cleared");
    this.score += 25;
    this.addCombo(2, "DRUEBER!", obstacle.x, obstacle.y - 82, "#ffd43f");
    SoundFX.success();
  }

  hasClearedJumpObstacle(obstacle) {
    const duckBottom = this.duck.body.y + this.duck.body.height;
    const obstacleTop = obstacle.body.y;
    // Generous clearance scaled to obstacle height: the collision body can sit
    // a little above the visible art, so requiring the duck below the very top
    // made tall obstacles (soap stack) need an unrealistically high jump.
    const clearance = Math.max(28, obstacle.body.height * 0.5);
    return !this.isDiving && !this.duck.body.blocked.down && duckBottom < obstacleTop + clearance;
  }

  stompObstacle(obstacle) {
    this.stompCount += 1;
    this.recordChallengeOutcome(obstacle, "cleared");
    this.prepareObstacleForRemoval(obstacle);
    const isPerfect = Math.abs(this.duck.x - obstacle.x) < 54;
    this.score += isPerfect ? 55 : 35;
    this.addCombo(isPerfect ? 5 : 3, isPerfect ? "PERFEKT DRAUF!" : "PLATSCH!", obstacle.x, obstacle.y - 90, "#ffd43f");
    SoundFX.success();
    this.duck.setVelocityY(-520);
    this.splash(obstacle.x, obstacle.y);
    this.burst(obstacle.x, obstacle.y, isPerfect ? ["pearlGold", "pearlBlue"] : ["pearlBlue"], isPerfect ? 30 : 20, isPerfect ? 0.13 : 0.1, isPerfect ? 170 : 130);
    if (isPerfect) {
      this.cameras.main.shake(80, 0.0035);
    }

    this.tweens.add({
      targets: obstacle,
      y: obstacle.y + 42,
      scaleX: obstacle.scaleX * 1.2,
      scaleY: obstacle.scaleY * 0.42,
      alpha: 0,
      duration: 240,
      ease: "Back.in",
      onComplete: () => obstacle.destroy(),
    });
  }

  updateObstacleLabels() {
    this.obstacles.getChildren().forEach((obstacle) => {
      this.syncObstacleVisuals(obstacle);
      const cue = obstacle.getData("cue");
      if (cue?.active) {
        const labelOffset = obstacle.getData("labelOffset") ?? 100;
        cue.setPosition(obstacle.x - 250, obstacle.y - labelOffset);
        // Fade the cue by time-to-duck, not by a fixed x. This guarantees the
        // warning stays readable for >=0.6s before impact at any speed: full
        // alpha from ~0.8s out, fading to 0 at ~0.3s out (cue clears the impact).
        const timeToDuck = (obstacle.x - this.duck.x) / Math.max(1, this.speed);
        cue.setAlpha(Phaser.Math.Clamp((timeToDuck - 0.3) / 0.5, 0, 0.95));
      }
      const label = obstacle.getData("label");
      if (!label?.active) {
        return;
      }

      label.setPosition(obstacle.x, obstacle.y - obstacle.getData("labelOffset"));
      label.setAlpha(Phaser.Math.Clamp((obstacle.x - 250) / 280, 0, 1));
    });
  }

  updatePowerUpLabels() {
    this.powerUps.getChildren().forEach((powerUp) => {
      const visual = powerUp.getData("visual");
      if (visual?.active) {
        visual.setPosition(powerUp.x, powerUp.y);
      }

      const label = powerUp.getData("label");
      if (!label?.active) {
        return;
      }

      label.setPosition(powerUp.x, powerUp.y - powerUp.getData("labelOffset"));
      label.setAlpha(Phaser.Math.Clamp((powerUp.x - 210) / 260, 0, 1));
    });
  }

  passUnderObstacle(obstacle) {
    if (obstacle.getData("passed")) {
      return;
    }

    obstacle.setData("passed", true);
    this.diveCount += 1;
    this.recordChallengeOutcome(obstacle, "cleared");
    this.prepareObstacleForRemoval(obstacle);
    const isPerfect = Math.abs(this.duck.x - obstacle.x) < 64;
    this.score += isPerfect ? 50 : 30;
    this.addCombo(isPerfect ? 5 : 3, isPerfect ? "KNAPP GETAUCHT!" : "SAUBER DRUNTER!", obstacle.x, obstacle.y + 68, "#9df6ff");
    SoundFX.success();
    this.splash(this.duck.x + 24, this.duck.y + 46);
    this.burst(this.duck.x + 38, this.duck.y + 26, isPerfect ? ["pearlGold", "pearlBlue"] : ["pearlBlue"], isPerfect ? 18 : 10, 0.1, isPerfect ? 120 : 78);
    // prepareObstacleForRemoval() disables the body, which stops the obstacle's
    // scroll velocity. Without an explicit removal tween it would freeze in place
    // and never reach the off-screen cleanup, so keep it drifting left and fade
    // it out (matching how stomp/hit/turbo obstacles are cleared).
    if (obstacle.active) {
      this.tweens.add({
        targets: obstacle,
        x: obstacle.x - 240,
        alpha: 0,
        duration: 360,
        ease: "Sine.in",
        onComplete: () => obstacle.destroy(),
      });
    }
  }

  getComboMultiplier() {
    // Every 4 combo steps adds +0.2x to collected pearl value, capped at x2.0
    // (reached at combo 20). Ramps slower than before so the multiplier rewards
    // a sustained streak rather than peaking after a handful of pearls.
    return 1 + Math.min(1.0, Math.floor(this.combo / 4) * 0.2);
  }

  addCombo(amount, message, x, y, color) {
    this.combo = Math.min(24, this.combo + amount);
    this.longestCombo = Math.max(this.longestCombo, this.combo);
    this.lastComboAt = this.time.now;
    const bonus = Math.min(18, Math.max(0, this.combo - 3));
    this.score += bonus;
    const mult = this.getComboMultiplier();
    const multLabel = mult > 1 ? `  Perlen x${mult % 1 === 0 ? mult : mult.toFixed(2)}` : "";
    this.comboText.setText(this.combo >= 4 ? `Combo x${this.combo}${multLabel}` : "");

    const comboMessage = bonus > 0 ? `${message} +${bonus}` : message;
    this.showFloatingText(comboMessage, x, y, color);

    this.tweens.killTweensOf(this.comboText);
    this.comboText.setScale(1.18);
    this.tweens.add({
      targets: this.comboText,
      scale: 1,
      duration: 180,
      ease: "Back.out",
    });
  }

  getNextObstacle(options) {
    if (this.obstaclePattern.length === 0) {
      let sequencePool = OBSTACLE_SEQUENCES.later;
      if (this.runTime < 18) {
        sequencePool = OBSTACLE_SEQUENCES.early;
      } else if (this.runTime < 34) {
        sequencePool = OBSTACLE_SEQUENCES.mid;
      }

      this.obstaclePattern = Phaser.Utils.Array.GetRandom(sequencePool).slice();
    }

    const desired = this.obstaclePattern.shift();
    const desiredMode = typeof desired === "string" ? desired : desired.mode;
    const sequence = typeof desired === "string" ? desired : desired.sequence;
    const candidates = options.filter((option) => option.mode === desiredMode);
    const cupBrush = candidates.find((option) => option.key === "cupBrush" || option.key === "cupBrushV2");
    if (cupBrush && !this.cupBrushIntroduced) {
      this.cupBrushIntroduced = true;
      return { ...cupBrush, sequence };
    }

    const pick = Phaser.Utils.Array.GetRandom(candidates.length > 0 ? candidates : options);
    return { ...pick, sequence };
  }

  pullNearbyCollectibles() {
    const magnetActive = this.isMagnetActive();

    this.collectibles.getChildren().forEach((pearl) => {
      if (!pearl.active) {
        return;
      }

      const underwater = pearl.getData("underwater");
      // While diving, scoop nearby underwater reward pearls. The dive depth
      // leaves the duck ~40-90px above the reward trail, so the default 20px
      // pickup radius could never reach it — the rewards were uncollectable
      // without a magnet. The wider radius only applies to underwater pearls
      // during a dive, so surface pearls are unaffected.
      const diveScoop = this.isDiving && underwater;
      const attractDistance = magnetActive ? 315 : diveScoop ? 170 : 24;
      const attractStrength = magnetActive ? 0.062 : diveScoop ? 0.06 : 0;
      const collectDistance = magnetActive ? 112 : diveScoop ? 100 : 20;
      const lateCatchDistance = magnetActive ? 138 : diveScoop ? 120 : 20;

      if (pearl.x < this.duck.x - 120) {
        pearl.setActive(false);
        pearl.body.enable = false;
        pearl.destroy();
        return;
      }

      if (pearl.x < this.duck.x + 14) {
        const passedDistance = Phaser.Math.Distance.Between(this.duck.x, this.duck.y, pearl.x, pearl.y);
        if ((!underwater || this.isDiving) && passedDistance < lateCatchDistance) {
          this.collectPearl(this.duck, pearl);
        }
        return;
      }

      if (underwater && !this.isDiving) {
        return;
      }

      const distance = Phaser.Math.Distance.Between(this.duck.x, this.duck.y, pearl.x, pearl.y);
      if (distance > attractDistance) {
        return;
      }

      pearl.x = Phaser.Math.Linear(pearl.x, this.duck.x + 28, attractStrength);
      pearl.y = Phaser.Math.Linear(pearl.y, this.duck.y - 4, attractStrength);
      const targetVelocity = -this.speed * (magnetActive ? 0.24 : 0.42);
      pearl.setVelocityX(Math.max(pearl.body.velocity.x, targetVelocity));

      if (distance < collectDistance) {
        this.collectPearl(this.duck, pearl);
      }
    });
  }

  hasObstacleGap(requiredGap) {
    return !this.obstacles.getChildren().some((obstacle) => obstacle.active && obstacle.x > GAME_WIDTH - requiredGap);
  }

  hasActiveChallengeCollectibleWindow() {
    return this.obstacles
      .getChildren()
      .some((obstacle) => obstacle.active && obstacle.x > GAME_WIDTH - CHALLENGE_COLLECTIBLE_BLOCK_DISTANCE && obstacle.x < GAME_WIDTH + 240);
  }

  getObstacleDelay() {
    if (this.runTime > 95) {
      return 920;
    }
    if (this.runTime > 55) {
      return 1020;
    }
    if (this.runTime > 25) {
      return 1120;
    }
    return 1220;
  }

  showFloatingText(message, x, y, color) {
    const size = message.length >= 17 ? 20 : message.length > 12 ? 24 : 28;
    const text = this.add.text(x, y, message, hudTextStyle(size, color)).setOrigin(0.5).setDepth(22);
    this.tweens.add({
      targets: text,
      y: y - 54,
      alpha: 0,
      scale: 1.16,
      duration: 880,
      ease: "Cubic.out",
      onComplete: () => text.destroy(),
    });
  }

  showQuip() {
    this.quipText.setText(Phaser.Utils.Array.GetRandom(QUIPS));
    this.tweens.killTweensOf(this.quipText);
    this.quipText.setScale(0.8).setAlpha(0);
    this.tweens.add({
      targets: this.quipText,
      alpha: 1,
      scale: 1,
      duration: 180,
      yoyo: true,
      hold: 980,
      ease: "Back.out",
    });
  }
}

function addBackground(scene) {
  scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "bg").setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
  scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x06324b, 0.04);
}

function addWaterOverlay(scene) {
  const baseDepth = 1;
  const wash = scene.add.graphics();
  wash.setDepth(baseDepth);
  wash.fillGradientStyle(0x6ff4ff, 0x6ff4ff, 0x0877b8, 0x043d76, 0, 0, 0.1, 0.15);
  wash.fillRect(0, WATER_SURFACE_Y + 10, GAME_WIDTH, GAME_HEIGHT - WATER_SURFACE_Y - 10);

  addAnimatedWaterSurface(scene, baseDepth + 0.18);
  addSurfaceFoamFlecks(scene, baseDepth + 0.26);
  addSurfaceShimmer(scene, baseDepth + 0.24);

  addBathtubRunoff(scene, baseDepth + 0.35);
  addWaterGlints(scene, baseDepth + 0.2);
}

function addAnimatedWaterSurface(scene, depth) {
  const bands = [
    { y: WATER_SURFACE_Y + 2, color: 0xeaffff, alpha: 0.34, width: 17, amp: 10, wave: 72, speed: 1700, drift: -430, bob: 11 },
    { y: WATER_SURFACE_Y + 13, color: 0x7cfaff, alpha: 0.28, width: 13, amp: 13, wave: 104, speed: 2200, drift: 470, bob: -10 },
    { y: WATER_SURFACE_Y + 25, color: 0xffffff, alpha: 0.2, width: 10, amp: 9, wave: 58, speed: 2000, drift: -360, bob: 8 },
    { y: WATER_SURFACE_Y + 39, color: 0x9df6ff, alpha: 0.16, width: 8, amp: 11, wave: 132, speed: 2800, drift: 390, bob: -7 },
  ];

  bands.forEach((band, index) => {
    const surface = drawSoftSurfaceBand(scene, band);
    surface.setDepth(depth + index * 0.01);
    surface.setBlendMode(Phaser.BlendModes.SCREEN);
    scene.tweens.add({
      targets: surface,
      x: surface.x + band.drift,
      y: band.bob,
      alpha: 0.48,
      duration: band.speed,
      delay: index * 180,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  });
}

function drawSoftSurfaceBand(scene, band) {
  const graphic = scene.add.graphics();
  const width = GAME_WIDTH + 520;
  graphic.x = -260;
  graphic.setAlpha(0.86);
  graphic.lineStyle(band.width, band.color, band.alpha);
  graphic.beginPath();
  graphic.moveTo(0, band.y);

  for (let x = 0; x <= width; x += 16) {
    const y = band.y + Math.sin(x / band.wave) * band.amp + Math.sin(x / 37) * 1.8;
    graphic.lineTo(x, y);
  }

  graphic.strokePath();
  return graphic;
}

function addSurfaceFoamFlecks(scene, depth) {
  for (let index = 0; index < 30; index += 1) {
    const fleck = scene.add.ellipse(
      Phaser.Math.Between(12, GAME_WIDTH - 12),
      WATER_SURFACE_Y + Phaser.Math.Between(2, 30),
      Phaser.Math.Between(30, 92),
      Phaser.Math.Between(4, 10),
      0xeaffff,
      Phaser.Math.FloatBetween(0.16, 0.34),
    );
    fleck.setDepth(depth);
    fleck.setBlendMode(Phaser.BlendModes.SCREEN);
    fleck.setAngle(Phaser.Math.Between(-12, 12));

    scene.tweens.add({
      targets: fleck,
      x: fleck.x + Phaser.Math.Between(-320, 320),
      y: fleck.y + Phaser.Math.Between(-10, 12),
      alpha: Phaser.Math.FloatBetween(0.04, 0.14),
      scaleX: Phaser.Math.FloatBetween(1.55, 2.4),
      duration: Phaser.Math.Between(1200, 2600),
      delay: Phaser.Math.Between(0, 1500),
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }
}

function addSurfaceShimmer(scene, depth) {
  for (let index = 0; index < 7; index += 1) {
    const shimmer = scene.add.ellipse(
      Phaser.Math.Between(60, GAME_WIDTH - 60),
      WATER_SURFACE_Y + Phaser.Math.Between(22, 54),
      Phaser.Math.Between(120, 240),
      Phaser.Math.Between(6, 12),
      0xeaffff,
      Phaser.Math.FloatBetween(0.08, 0.16),
    );
    shimmer.setDepth(depth);
    shimmer.setBlendMode(Phaser.BlendModes.SCREEN);
    shimmer.setAngle(Phaser.Math.Between(-6, 6));

    scene.tweens.add({
      targets: shimmer,
      x: shimmer.x - Phaser.Math.Between(180, 340),
      alpha: Phaser.Math.FloatBetween(0.02, 0.08),
      scaleX: Phaser.Math.FloatBetween(1.15, 1.55),
      duration: Phaser.Math.Between(2400, 4200),
      delay: Phaser.Math.Between(0, 1600),
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }
}

function addBathtubRunoff(scene, depth) {
  const streams = [
    { x: 274, y: 296, length: 86, delay: 0 },
    { x: 320, y: 308, length: 74, delay: 700 },
    { x: 504, y: 288, length: 108, delay: 300 },
    { x: 528, y: 304, length: 92, delay: 1150 },
  ];

  streams.forEach((stream) => {
    const line = scene.add.rectangle(stream.x, stream.y + stream.length / 2, 3, stream.length, 0x9df6ff, 0.16);
    line.setDepth(depth);
    line.setOrigin(0.5);

    scene.tweens.add({
      targets: line,
      alpha: 0.05,
      duration: 1800,
      delay: stream.delay,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    const drop = scene.add.ellipse(stream.x, stream.y + 8, 7, 16, 0xd8ffff, 0.48);
    drop.setDepth(depth + 0.01);
    scene.tweens.add({
      targets: drop,
      y: stream.y + stream.length - 4,
      alpha: 0.06,
      scaleY: 1.8,
      duration: 2200,
      delay: stream.delay,
      repeat: -1,
      ease: "Sine.in",
      onRepeat: () => {
        drop.setY(stream.y + 8);
        drop.setAlpha(0.48);
        drop.setScale(1);
      },
    });
  });
}

function addWaterGlints(scene, depth) {
  for (let index = 0; index < 16; index += 1) {
    const glint = scene.add.ellipse(
      Phaser.Math.Between(20, GAME_WIDTH - 20),
      Phaser.Math.Between(WATER_SURFACE_Y + 34, GAME_HEIGHT - 26),
      Phaser.Math.Between(42, 98),
      Phaser.Math.Between(4, 9),
      0xeaffff,
      Phaser.Math.FloatBetween(0.07, 0.16),
    );
    glint.setDepth(depth);
    glint.setAngle(Phaser.Math.Between(-8, 8));

    scene.tweens.add({
      targets: glint,
      x: glint.x - Phaser.Math.Between(180, 360),
      alpha: Phaser.Math.FloatBetween(0.03, 0.1),
      duration: Phaser.Math.Between(2800, 5200),
      delay: Phaser.Math.Between(0, 2200),
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }
}

function makeGlassPanel(scene, x, y, width, height, depth = 2, fillColor = 0x0878ca) {
  const panel = scene.add.graphics();
  panel.setDepth(depth);
  // Soft drop shadow.
  panel.fillStyle(0x051d35, 0.22);
  panel.fillRoundedRect(x + 8, y + 12, width, height, 30);
  // Gentle outer glow.
  panel.fillStyle(0x9df6ff, 0.16);
  panel.fillRoundedRect(x - 5, y - 5, width + 10, height + 10, 34);
  // Single clean fill (no headline band — flat and calm).
  panel.fillStyle(fillColor, 0.96);
  panel.fillRoundedRect(x, y, width, height, 30);
  // Thin top sheen at the very edge for a touch of depth (not a box).
  panel.fillStyle(0xffffff, 0.08);
  panel.fillRoundedRect(x + 16, y + 10, width - 32, 14, 7);
  // One border.
  panel.lineStyle(6, 0xffffff, 0.9);
  panel.strokeRoundedRect(x, y, width, height, 30);
  return panel;
}

function makeScoreBox(scene, x, y, width, height, value, label, color = "#ffffff", depth = 3) {
  const graphic = scene.add.graphics().setDepth(depth);
  graphic.fillStyle(0x0b62c9, 0.5);
  graphic.fillRoundedRect(x, y, width, height, 18);
  graphic.lineStyle(4, 0x9df6ff, 0.55);
  graphic.strokeRoundedRect(x, y, width, height, 18);
  if (value) {
    scene.add.text(x + width / 2, y + height * 0.42, value, titleStyle(44, color)).setOrigin(0.5).setDepth(depth + 1);
  }
  if (label) {
    scene.add.text(x + width / 2, y + height * 0.74, label, hudTextStyle(22, "#ffffff")).setOrigin(0.5).setDepth(depth + 1);
  }
  return graphic;
}

function makeScoreFeatureCard(scene, x, y, width, height, title, value, iconKey) {
  const graphic = scene.add.graphics().setDepth(3);
  graphic.fillStyle(0xffc51f, 0.92);
  graphic.fillRoundedRect(x, y, width, height, 20);
  graphic.lineStyle(5, 0xffffff, 0.76);
  graphic.strokeRoundedRect(x, y, width, height, 20);
  scene.add.image(x + 92, y + height / 2, iconKey).setScale(0.14).setDepth(4);
  scene.add.text(x + 186, y + 88, title, hudTextStyle(30, "#ffffff")).setOrigin(0, 0.5).setDepth(4);
  scene.add.text(x + 186, y + 158, value, titleStyle(42, "#123044")).setOrigin(0, 0.5).setDepth(4);
  return graphic;
}

function makeWinnerCard(scene, x, y, width, height, entry) {
  // No yellow box — the champion duck, name and score sit directly on the panel.
  scene.add.image(x + width / 2, y + height * 0.36, "duckVictory").setScale(0.24).setDepth(4);
  addFittedText(scene, x + width / 2, y + height * 0.68, sanitizePlayerName(entry.name), hudTextStyle(32, "#ffffff"), width - 40, { originX: 0.5, depth: 4 });
  addFittedText(scene, x + width / 2, y + height * 0.86, entry.score.toLocaleString("de-DE"), titleStyle(52, "#ffffff"), width - 36, { originX: 0.5, depth: 4 });
  return null;
}

function makeLeaderboardRow(scene, x, y, width, height, rank, entry) {
  const graphic = scene.add.graphics().setDepth(3);
  graphic.fillStyle(0x063f78, 0.58);
  graphic.fillRoundedRect(x, y, width, height, 16);
  graphic.lineStyle(2, 0x9df6ff, 0.22);
  graphic.strokeRoundedRect(x, y, width, height, 16);
  const medalColor = rank === 2 ? 0xbfd5e8 : rank === 3 ? 0xca7a34 : 0x0b62c9;
  const medal = scene.add.circle(x + 36, y + height / 2, 20, medalColor, 0.95).setDepth(4);
  medal.setStrokeStyle(3, 0xffffff, 0.62);
  scene.add.text(x + 36, y + height / 2, `${rank}`, hudTextStyle(18, "#ffffff")).setOrigin(0.5).setDepth(5);
  addFittedText(scene, x + 76, y + height / 2, sanitizePlayerName(entry.name), hudTextStyle(23, "#ffffff"), width - 206, { depth: 4 });
  addFittedText(scene, x + width - 22, y + height / 2, entry.score.toLocaleString("de-DE"), hudTextStyle(24, "#ffffff"), 118, { originX: 1, depth: 4 });
  return graphic;
}

function makeScreenShade(scene, alpha = 0.32, depth = 1) {
  const shade = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x031827, alpha);
  shade.setDepth(depth);
  return shade;
}

function makeHudPill(scene, x, y, width, iconKey, iconScale, color) {
  const container = scene.add.container(x, y).setDepth(20);
  const bg = scene.add.graphics();
  bg.fillStyle(0x0b62c9, 0.94);
  bg.fillRoundedRect(0, 0, width, 56, 22);
  bg.lineStyle(4, 0xffffff, 0.64);
  bg.strokeRoundedRect(0, 0, width, 56, 22);

  const shine = scene.add.rectangle(18, 9, width - 36, 12, 0xffffff, 0.16).setOrigin(0, 0.5);
  const icon = scene.add.image(30, 28, iconKey).setScale(iconScale);
  const text = scene.add.text(56, 28, "0", hudTextStyle(27, color)).setOrigin(0, 0.5);
  container.add([bg, shine, icon, text]);
  return { container, text };
}

function makeLifePill(scene, x, y) {
  const container = scene.add.container(x, y).setDepth(20);
  const bg = scene.add.graphics();
  bg.fillStyle(0x0b62c9, 0.94);
  bg.fillRoundedRect(0, 0, 122, 56, 22);
  bg.lineStyle(4, 0xffffff, 0.64);
  bg.strokeRoundedRect(0, 0, 122, 56, 22);

  const shine = scene.add.rectangle(16, 9, 90, 12, 0xffffff, 0.16).setOrigin(0, 0.5);
  const hearts = [0, 1, 2].map((index) => scene.add.image(28 + index * 31, 28, "uiHeart").setScale(0.052));
  container.add([bg, shine, ...hearts]);
  return { container, hearts };
}

function setHeartIconColor(heart, color) {
  heart.setTint(color);
}

function makeSpecialSlot(scene, x, y, iconKey, label, color) {
  const container = scene.add.container(x, y).setDepth(20);
  const bg = scene.add.graphics();
  bg.fillStyle(0x0b62c9, 0.9);
  bg.fillCircle(34, 34, 31);
  bg.lineStyle(4, 0xffffff, 0.72);
  bg.strokeCircle(34, 34, 31);

  const glow = scene.add.circle(34, 34, 34, hexColorToNumber(color), 0.12);
  const icon = scene.add.image(34, 32, iconKey).setScale(0.22);
  const labelText = scene.add.text(34, 74, label, hudTextStyle(13, "#ffffff")).setOrigin(0.5);

  const badge = scene.add.container(59, 55);
  const badgeBg = scene.add.circle(0, 0, 13, 0xff3f9a, 1);
  badgeBg.setStrokeStyle(3, 0xffffff, 0.72);
  const badgeText = scene.add.text(0, 0, "", hudTextStyle(13, "#ffffff")).setOrigin(0.5);
  badge.add([badgeBg, badgeText]);
  badge.setVisible(false);

  container.add([glow, bg, icon, labelText, badge]);
  container.setAlpha(0.64);
  return { container, glow, icon, labelText, badge, badgeText };
}

function updateSpecialSlot(slot, badgeValue, active) {
  if (!slot) {
    return;
  }

  if (slot.badgeValue === badgeValue && slot.activeState === active) {
    return;
  }

  slot.badgeValue = badgeValue;
  slot.activeState = active;
  slot.container.setAlpha(active ? 1 : 0.58);
  slot.container.setScale(active ? 1.06 : 1);
  slot.glow.setAlpha(active ? 0.3 : 0.1);
  slot.icon.setAlpha(active ? 1 : 0.68);
  slot.labelText.setAlpha(active ? 1 : 0.68);
  slot.badge.setVisible(Boolean(badgeValue));
  slot.badgeText.setText(badgeValue);
}

function hexColorToNumber(color) {
  return Number.parseInt(color.replace("#", ""), 16);
}

function makePauseIconButton(scene, x, y) {
  const container = scene.add.container(x, y);
  const icon = scene.add.image(0, 0, "uiPause").setScale(0.092);
  container.add([icon]);
  container.setSize(68, 68);
  container.setInteractive(new Phaser.Geom.Rectangle(-34, -34, 68, 68), Phaser.Geom.Rectangle.Contains);
  container.input.cursor = "pointer";
  container.setDepth(20);
  return container;
}

function makeRoundIconButton(scene, x, y, iconKey, iconScale = 0.08, fill = 0x2f8ed8) {
  const container = scene.add.container(x, y);
  const bg = scene.add.graphics();
  bg.fillStyle(fill, 0.95);
  bg.fillCircle(0, 0, 38);
  bg.lineStyle(4, 0xffffff, 0.72);
  bg.strokeCircle(0, 0, 38);
  const icon = scene.add.image(0, 0, iconKey).setScale(iconScale);
  container.add([bg, icon]);
  container.setSize(76, 76);
  container.setInteractive(new Phaser.Geom.Circle(0, 0, 38), Phaser.Geom.Circle.Contains);
  container.input.cursor = "pointer";
  return container;
}

function makeButton(scene, x, y, label, minWidthOverride = null, options = {}) {
  const container = scene.add.container(x, y);
  const iconKey = options.icon === false ? null : getButtonIcon(label);
  const heroButton = label === "SPIELEN" || label === "BESTENLISTE";
  const minWidth = label === "BESTENLISTE" ? 312 : label === "SPIELEN" ? 292 : 190;
  const largeButton = heroButton || (minWidthOverride ?? 0) >= 300;
  const fontPx = options.fontSize ? options.fontSize : largeButton ? (label.length > 10 ? 26 : 30) : label.length > 10 ? 20 : 23;
  const height = largeButton ? 74 : 62;
  const iconGap = iconKey ? (largeButton ? 50 : 42) : 0;
  // Width derived from the actual text width so the label always fits the pill.
  const estTextW = label.length * fontPx * 0.6;
  const width = minWidthOverride ?? Math.max(minWidth, Math.ceil(estTextW + iconGap + 64));
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const radius = halfHeight;
  const colors = getButtonColors(label);

  // Crisp pill drawn with graphics — no image stretching, so it never distorts.
  const g = scene.add.graphics();
  g.fillStyle(0x06243d, 0.26);
  g.fillRoundedRect(-halfWidth, -halfHeight + 5, width, height, radius);
  g.fillStyle(colors.fill, 1);
  g.fillRoundedRect(-halfWidth, -halfHeight, width, height, radius);
  // Subtle top gloss: a thin pill strip with its OWN radius so it never clamps
  // into a lens/blob.
  const glossH = Math.round(height * 0.34);
  g.fillStyle(0xffffff, 0.18);
  g.fillRoundedRect(-halfWidth + 10, -halfHeight + 5, width - 20, glossH, glossH / 2);
  g.lineStyle(3, colors.stroke, 0.95);
  g.strokeRoundedRect(-halfWidth, -halfHeight, width, height, radius);

  // Lay out icon + text as a centered group.
  const icon = iconKey ? scene.add.image(0, 0, iconKey).setScale(largeButton ? 0.07 : 0.058) : null;
  const text = scene.add
    .text(0, 0, label, {
      fontFamily: "Trebuchet MS",
      fontSize: `${fontPx}px`,
      fontStyle: "900",
      color: "#ffffff",
      stroke: colors.textStroke,
      strokeThickness: 4,
    })
    .setOrigin(0.5);
  if (icon) {
    const iconW = icon.displayWidth;
    const groupW = iconW + 12 + text.width;
    icon.setX(-groupW / 2 + iconW / 2);
    text.setX(icon.x + iconW / 2 + 12 + text.width / 2);
  }

  container.add(icon ? [g, icon, text] : [g, text]);
  container.setSize(width, height);
  container.setInteractive(new Phaser.Geom.Rectangle(-halfWidth, -halfHeight, width, height), Phaser.Geom.Rectangle.Contains);
  container.input.cursor = "pointer";
  container.on("pointerover", () => container.setScale(1.04));
  container.on("pointerout", () => container.setScale(1));
  return container;
}

function getButtonAssetKey(label) {
  if (label === "BEENDEN" || label === "MENUE" || label === "MENÜ") {
    return "uiButtonDanger";
  }

  if (label === "HIGHSCORE" || label === "BESTENLISTE" || label === "ZURUECK" || label === "ZURÜCK" || label === "NEUSTART") {
    return "uiButtonSecondary";
  }

  return "uiButtonPrimary";
}

function getButtonColors(label) {
  if (label === "BEENDEN" || label === "MENUE" || label === "MENÜ") {
    return { fill: 0xff3f76, stroke: 0xffffff, textStroke: "#7b1738" };
  }

  if (label === "HIGHSCORE" || label === "BESTENLISTE" || label === "ZURUECK" || label === "ZURÜCK" || label === "NEUSTART") {
    return { fill: 0x2f8ed8, stroke: 0xffffff, textStroke: "#123044" };
  }

  return { fill: 0xffc51f, stroke: 0xffffff, textStroke: "#a45200" };
}

function getButtonIcon(label) {
  if (label === "SPIELEN" || label === "START" || label === "WEITER") {
    return "uiPlay";
  }
  if (label === "NOCHMAL" || label === "NEUSTART") {
    return "uiRestart";
  }
  if (label === "MENUE" || label === "MENÜ" || label === "BEENDEN") {
    return "uiHome";
  }
  if (label === "HIGHSCORE" || label === "BESTENLISTE") {
    return "uiTrophy";
  }
  return null;
}

function isWithinButton(pointer, x, y, label, minWidthOverride = null) {
  const minWidth = label === "BESTENLISTE" ? 312 : label === "SPIELEN" ? 292 : 190;
  const largeButton = label === "SPIELEN" || label === "BESTENLISTE" || (minWidthOverride ?? 0) >= 300;
  const width = minWidthOverride ?? minWidth;
  const height = largeButton ? 74 : 62;
  return Math.abs(pointer.x - x) <= width / 2 && Math.abs(pointer.y - y) <= height / 2;
}

function isWithinRoundButton(pointer, x, y) {
  // Match the visible 68px pause button (±34) so taps next to it in the HUD
  // don't accidentally pause.
  return Math.abs(pointer.x - x) <= 34 && Math.abs(pointer.y - y) <= 34;
}

function getCollectibleValue(key) {
  if (key === "starfishBonus") {
    return 150;
  }
  if (key === "shellPearl") {
    return 100;
  }
  if (key === "underwaterPearls") {
    return 80;
  }
  if (key === "pearlGold") {
    return 50;
  }
  return 10;
}

function getCollectibleScale(key) {
  if (key === "starfishBonus") {
    return 0.44;
  }
  if (key === "shellPearl") {
    return 0.42;
  }
  if (key === "underwaterPearls") {
    return 0.206;
  }
  return key === "pearlGold" ? 0.58 : 0.52;
}

function getCollectibleMessage(key) {
  if (key === "starfishBonus") {
    return "SEESTERN!";
  }
  if (key === "shellPearl") {
    return "MUSCHELPERLE!";
  }
  if (key === "underwaterPearls") {
    return "TIEFENPERLEN!";
  }
  if (key === "pearlGold") {
    return "GOLDPERLE!";
  }
  return "PERLE!";
}

function isPearlAnimationTarget(target) {
  return ["pearlPink", "pearlBlue", "pearlGold", "shellPearl", "starfishBonus", "underwaterPearls"].includes(target?.texture?.key);
}

function hudTextStyle(size, color) {
  return {
    fontFamily: "Trebuchet MS",
    fontSize: `${size}px`,
    fontStyle: "900",
    color,
    stroke: "#123044",
    strokeThickness: 5,
  };
}

function titleStyle(size, color) {
  return {
    fontFamily: "Trebuchet MS",
    fontSize: `${size}px`,
    fontStyle: "900",
    color,
    stroke: "#10314c",
    strokeThickness: 8,
  };
}

function addFittedText(scene, x, y, value, style, maxWidth, options = {}) {
  const text = scene.add.text(x, y, value, style);
  text.setOrigin(options.originX ?? 0, options.originY ?? 0.5);
  text.setDepth(options.depth ?? 4);
  const measuredWidth = Math.max(1, text.width);
  text.setScale(Math.min(1, maxWidth / measuredWidth));
  return text;
}

function createRunTelemetry() {
  return {
    startedAt: new Date().toISOString(),
    endedAt: null,
    final: null,
    challenge: {
      spawnedByMode: {},
      clearedByMode: {},
      hitByMode: {},
      absorbedByMode: {},
      turboClearedByMode: {},
      bombClearedByMode: {},
    },
    reward: {
      spawnedBySequence: {},
      collectedBySequence: {},
    },
    powerup: {
      spawnedByType: {},
      collectedByType: {},
      usedEffect: {},
    },
  };
}

function incrementCounter(bucket, key, amount = 1) {
  const normalizedKey = key || "unknown";
  bucket[normalizedKey] = (bucket[normalizedKey] || 0) + amount;
}

function publishRunTelemetry(telemetry) {
  try {
    const snapshot = JSON.parse(JSON.stringify(telemetry));
    window.__duckDashLastRunTelemetry = snapshot;
    localStorage.setItem(TELEMETRY_KEY, JSON.stringify(snapshot));
  } catch {
    // Telemetry is diagnostic only; the run result should never depend on it.
  }
}

function readStats() {
  try {
    return normalizeStats(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return normalizeStats(null);
  }
}

function writeStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeStats(stats)));
  } catch {
    // Highscore persistence is optional; game-over UI must still render.
  }
}

function readPlayerName() {
  try {
    return sanitizePlayerName(localStorage.getItem(PLAYER_NAME_KEY));
  } catch {
    return DEFAULT_PLAYER_NAME;
  }
}

function writePlayerName(name) {
  try {
    localStorage.setItem(PLAYER_NAME_KEY, sanitizePlayerName(name));
  } catch {
    // Player names are optional; scores still work with the default name.
  }
}

function sanitizePlayerName(name) {
  const clean = filterPlayerNameInput(name).trim();
  return clean || DEFAULT_PLAYER_NAME;
}

function filterPlayerNameInput(name) {
  return String(name || "")
    .replace(/[^A-Za-z0-9 _äöüÄÖÜß-]/g, "")
    .slice(0, 12);
}

function normalizeStats(raw) {
  const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const games = Math.max(0, Math.floor(Number(source.games) || 0));
  let scores = Array.isArray(source.scores)
    ? source.scores
        .map((entry, index) => ({
          id: typeof entry?.id === "string" ? entry.id : typeof entry?.date === "string" ? entry.date : `legacy-${index}`,
          name: sanitizePlayerName(entry?.name || FALLBACK_NAMES[index % FALLBACK_NAMES.length]),
          score: Math.max(0, Math.floor(Number(entry?.score) || 0)),
          pearls: Math.max(0, Math.floor(Number(entry?.pearls) || 0)),
          date: typeof entry?.date === "string" ? entry.date : "",
        }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
    : [];
  const storedHighscore = Math.max(0, Math.floor(Number(source.highscore) || 0));
  if (scores.length === 0 && storedHighscore > 0) {
    scores = [{ id: "legacy-highscore", name: FALLBACK_NAMES[0], score: storedHighscore, pearls: 0, date: "" }];
  }
  return {
    highscore: Math.max(storedHighscore, scores[0]?.score ?? 0),
    games,
    scores,
  };
}

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#6ee6f2",
  // Allow a second simultaneous touch so holding a drift swipe and tapping to
  // jump both register (the touch handling already tracks activeTouchPointerId).
  input: { activePointers: 2 },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false,
  },
  scene: [BootScene, MenuScene, HighscoreScene, GameScene],
};

window.addEventListener("load", () => {
  new Phaser.Game(config);
});
