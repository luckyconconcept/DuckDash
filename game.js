const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const WATER_SURFACE_Y = 456;
const WATERLINE = 500;
const DUCK_WATERLINE = 476;
const WATER_TUNING_MODE = false;
const STORAGE_KEY = "duck-dash-stats";
const PLAYER_NAME_KEY = "duck-dash-player-name";
const DEFAULT_PLAYER_NAME = "BadeEnte";
const FALLBACK_NAMES = ["QuakMeister", "SplashKing", "DuckHero", "BadeEnte", "WaterNinja"];
const COLLECTIBLE_LANES = [292, 256, 220];
const DIVE_MIN_DURATION = 260;
const DIVE_MAX_DURATION = 680;
const DIVE_RECOVERY_DURATION = 260;
const DUCK_HOME_X = 220;
const DUCK_MIN_X = 72;
const DUCK_MAX_X = 720;
const HUD_PAUSE_X = GAME_WIDTH - 54;
const HUD_PAUSE_Y = 56;
const STOMP_TOP_GRACE = 48;
const STOMP_MIN_VELOCITY_Y = -80;
const STOMP_HORIZONTAL_GRACE = 112;
const MENU_START_HIT = {
  x: GAME_WIDTH / 2 - 160,
  y: 518,
  width: 320,
  height: 72,
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

  jump() {
    this.tone(520, 0.09, "triangle", 0.04);
  },

  dive() {
    this.tone(190, 0.12, "sine", 0.045);
  },

  collect() {
    this.tone(720, 0.06, "triangle", 0.04);
    window.setTimeout(() => this.tone(980, 0.07, "triangle", 0.035), 45);
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
    this.load.image("whirlpool", "assets/whirlpool.png");
    this.load.image("whirlpoolV2", "assets/whirlpool_v2.png?v=20260622-assets-ui1");
    this.load.image("pearlPink", "assets/pearl_pink.png?v=20260622-assets-ui1");
    this.load.image("pearlBlue", "assets/pearl_blue.png?v=20260622-assets-ui1");
    this.load.image("pearlGold", "assets/pearl_gold.png?v=20260622-assets-ui1");
    this.load.image("shellPearl", "assets/shell_pearl.png?v=20260622-assets-ui1");
    this.load.image("starfishBonus", "assets/starfish_bonus.png?v=20260622-assets-ui1");
    this.load.image("underwaterPearls", "assets/underwater_pearls.png?v=20260622-assets-ui1");
    this.load.image("quackBomb", "assets/quack_bomb.png");
    this.load.image("quackBombV2", "assets/quack_bomb_v2.png?v=20260622-assets-ui1");
    this.load.image("cupBrush", "assets/cup_brush.png");
    this.load.image("cupBrushV2", "assets/cup_brush_v2.png?v=20260622-assets-ui1");
    this.load.image("underwaterCap", "assets/underwater_cap.png?v=20260622-assets-ui1");
    this.load.image("drainPlug", "assets/drain_plug.png?v=20260622-assets-ui1");
    this.load.image("waterCurrent", "assets/water_current.png?v=20260621-underwater1");
    this.load.image("powerupMagnet", "assets/powerup_magnet.png");
    this.load.image("powerupShield", "assets/powerup_shield.png");
    this.load.image("powerupTurbo", "assets/powerup_turbo.png");
    this.load.image("powerupMagnetV2", "assets/powerup_magnet_v2.png?v=20260622-assets-ui1");
    this.load.image("powerupShieldV2", "assets/powerup_shield_v2.png?v=20260622-assets-ui1");
    this.load.image("powerupTurboV2", "assets/powerup_turbo_v2.png?v=20260622-assets-ui1");
    this.load.image("uiPause", "assets/ui_pause.png?v=20260622-assets-ui1");
    this.load.image("uiHeart", "assets/ui_heart.png?v=20260622-assets-ui1");
    this.load.image("uiTrophy", "assets/ui_trophy.png?v=20260622-assets-ui1");
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
    this.load.image("uiHome", "assets/ui_home.png?v=20260622-assets-ui1");
    this.load.image("uiPlay", "assets/ui_play.png?v=20260622-assets-ui1");
    this.load.image("uiRestart", "assets/ui_restart.png?v=20260622-assets-ui1");
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
    this.load.image("fxSpeedLines", "assets/fx_speed_lines.png?v=20260622-assets-ui1");
    this.load.image("fxUnderwaterBubbles", "assets/fx_underwater_bubbles.png?v=20260622-assets-ui1");
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
    addBackground(this);
    addWaterOverlay(this);

    makeScreenShade(this, 0.26, 1);
    makeGlassPanel(this, 338, 44, 604, 640, 2);

    this.add.image(GAME_WIDTH / 2, 132, "logo").setScale(0.66).setDepth(3);

    this.add
      .text(GAME_WIDTH / 2, 244, "Spring. Tauch. Sammle Perlen.", {
        fontFamily: "Trebuchet MS",
        fontSize: "26px",
        fontStyle: "700",
        color: "#ffffff",
        stroke: "#123044",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.highscoreText = this.add
      .text(GAME_WIDTH / 2, 320, `Highscore ${this.stats.highscore.toLocaleString("de-DE")}`, {
        fontFamily: "Trebuchet MS",
        fontSize: "28px",
        fontStyle: "700",
        color: "#ffd43f",
        stroke: "#123044",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(5);

    this.add.image(GAME_WIDTH / 2 - 208, 404, "pearlPink").setScale(0.5).setDepth(3);
    this.add.image(GAME_WIDTH / 2 + 208, 398, "pearlBlue").setScale(0.5).setDepth(3);
    this.duck = this.add.image(GAME_WIDTH / 2, 430, "duckHero").setScale(0.255).setDepth(4);
    this.tweens.add({
      targets: this.duck,
      y: 418,
      angle: -3,
      yoyo: true,
      repeat: -1,
      duration: 850,
      ease: "Sine.inOut",
    });
    this.time.addEvent({
      delay: 1450,
      loop: true,
      callback: () => this.menuSplash(this.duck.x - 54, this.duck.y + 42),
    });

    const startButton = makeButton(this, GAME_WIDTH / 2, 548, "START");
    startButton.setDepth(5);
    startButton.on("pointerdown", () => this.startGame());
    this.tweens.add({
      targets: startButton,
      scale: 1.04,
      yoyo: true,
      repeat: -1,
      duration: 760,
      ease: "Sine.inOut",
    });

    const highscoreButton = makeButton(this, GAME_WIDTH / 2, 626, "HIGHSCORE");
    highscoreButton.setDepth(5);
    highscoreButton.on("pointerdown", () => this.scene.start("HighscoreScene"));

    this.add
      .text(GAME_WIDTH / 2, 692, "Space / Tap = Springen   Pfeil runter / Swipe = Tauchen   Links/Rechts = Driften", {
        fontFamily: "Trebuchet MS",
        fontSize: "17px",
        fontStyle: "700",
        color: "#eaffff",
        stroke: "#123044",
        strokeThickness: 4,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(3);

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
      if (this.isStartPointer(event)) {
        this.startGame();
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
    const clientX = event.touches?.[0]?.clientX ?? event.clientX;
    const clientY = event.touches?.[0]?.clientY ?? event.clientY;
    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) {
      return false;
    }

    const rect = this.game.canvas.getBoundingClientRect();
    const gameX = ((clientX - rect.left) / rect.width) * GAME_WIDTH;
    const gameY = ((clientY - rect.top) / rect.height) * GAME_HEIGHT;
    return (
      gameX >= MENU_START_HIT.x &&
      gameX <= MENU_START_HIT.x + MENU_START_HIT.width &&
      gameY >= MENU_START_HIT.y &&
      gameY <= MENU_START_HIT.y + MENU_START_HIT.height
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

    makeScreenShade(this, 0.42, 1);
    makeGlassPanel(this, 286, 56, 708, 604, 2);

    this.add.image(424, 150, "uiTrophy").setScale(0.16).setDepth(3);
    this.add.image(674, 126, "logo").setScale(0.58).setDepth(3);
    this.add.text(GAME_WIDTH / 2, 226, "HIGHSCORE", titleStyle(48, "#ffd43f")).setOrigin(0.5).setDepth(3);
    this.add
      .text(
        GAME_WIDTH / 2,
        282,
        `Bestwert ${this.stats.highscore.toLocaleString("de-DE")}   Runden ${this.stats.games.toLocaleString("de-DE")}`,
        hudTextStyle(24, "#9df6ff"),
      )
      .setOrigin(0.5)
      .setDepth(3);

    const scores = this.stats.scores.slice(0, 5);
    if (scores.length === 0) {
      this.add.text(GAME_WIDTH / 2, 408, "Noch keine Runde gespeichert", hudTextStyle(28, "#ffffff")).setOrigin(0.5).setDepth(3);
    } else {
      scores.forEach((entry, index) => {
        const y = 350 + index * 50;
        const rankColor = index === 0 ? "#ffd43f" : "#ffffff";
        const row = this.add.graphics().setDepth(3);
        row.fillStyle(index === 0 ? 0x0b62c9 : 0x06324b, index === 0 ? 0.44 : 0.28);
        row.fillRoundedRect(382, y - 22, 516, 44, 14);
        this.add.text(410, y, `${index + 1}.`, hudTextStyle(24, rankColor)).setOrigin(0, 0.5).setDepth(4);
        this.add.text(466, y, sanitizePlayerName(entry.name), hudTextStyle(24, rankColor)).setOrigin(0, 0.5).setDepth(4);
        this.add.text(690, y, entry.score.toLocaleString("de-DE"), hudTextStyle(26, rankColor)).setOrigin(1, 0.5).setDepth(4);
        this.add
          .text(728, y, entry.pearls > 0 ? `${entry.pearls.toLocaleString("de-DE")} Perlen` : "Bestwert", hudTextStyle(20, "#9df6ff"))
          .setOrigin(0, 0.5)
          .setDepth(4);
      });
    }

    const startButton = makeButton(this, GAME_WIDTH / 2 - 150, 590, "START");
    startButton.setDepth(4);
    startButton.on("pointerdown", () => this.scene.start("GameScene"));

    const backButton = makeButton(this, GAME_WIDTH / 2 + 150, 590, "ZURUECK");
    backButton.setDepth(4);
    backButton.on("pointerdown", () => this.scene.start("MenuScene"));

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
    this.lastComboAt = 0;
    this.lastMilestone = 0;
    this.speed = 300;
    this.spawnDelay = 1700;
    this.collectDelay = 980;
    this.lastGroundedAt = 0;
    this.wasGrounded = true;
    this.lastAirVelocityY = 0;
    this.lastImpactSplashAt = 0;
    this.suppressLandingSplashUntil = 0;
    this.jumpQueuedUntil = 0;
    this.isGameOver = false;
    this.isPaused = false;
    this.invulnerableUntil = 0;
    this.isDiving = false;
    this.diveUntil = 0;
    this.diveStartedAt = 0;
    this.diveHeld = false;
    this.diveQueuedUntil = 0;
    this.diveQueuedHeld = false;
    this.diveRecoverUntil = 0;
    this.lastDiveBubbleAt = 0;
    this.diveWake = null;
    this.diveShade = null;
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
    this.nameInput = null;

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

    this.duck = this.physics.add.sprite(220, DUCK_WATERLINE - 80, "duck");
    this.duck.setScale(0.52);
    this.setDuckNormalBody();
    this.duck.setCollideWorldBounds(true);
    this.duck.setGravityY(1320);
    this.duck.setDepth(8);

    this.ground = this.add.rectangle(GAME_WIDTH / 2, DUCK_WATERLINE + 8, GAME_WIDTH, 24, 0x21a8c9, 0);
    this.physics.add.existing(this.ground, true);
    this.physics.add.collider(this.duck, this.ground);
    this.physics.add.overlap(this.duck, this.obstacles, this.handleHit, null, this);
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
    this.scoreHud = makeHudPill(this, 180, 24, 198, "uiScoreCoin", 0.055, "#ffffff");
    this.scoreText = this.scoreHud.text;
    this.pearlHud = makeHudPill(this, 398, 24, 152, "uiPearlCounter", 0.055, "#ffd43f");
    this.pearlText = this.pearlHud.text;
    this.lifeBubbles = this.lifeHud.hearts;
    this.comboText = this.add.text(GAME_WIDTH / 2, 120, "", hudTextStyle(26, "#ffd43f")).setOrigin(0.5).setDepth(21);
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
  }

  createControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys("A,D");
    this.input.keyboard.on("keydown-SPACE", () => this.jump());
    this.input.keyboard.on("keydown-UP", () => this.jump());
    this.input.keyboard.on("keydown-DOWN", () => this.dive(true));
    this.input.keyboard.on("keyup-DOWN", () => this.releaseDive());
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

      if (!this.touchSwipeHandled && Math.abs(deltaX) > 42 && Math.abs(deltaY) < 64) {
        this.touchDriftDirection = Math.sign(deltaX);
        this.touchDriftActive = true;
        this.lastDriftInputAt = this.time.now;
      }
    });

    this.input.on("pointerup", (pointer) => {
      if (this.isPaused || this.isGameOver) {
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

      if (!this.touchDriftActive && !this.touchSwipeHandled && deltaY < 42 && deltaX < 54) {
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
    if (isWithinButton(pointer, GAME_WIDTH / 2, 388, "WEITER")) {
      this.resumeGame();
      return;
    }

    if (isWithinButton(pointer, GAME_WIDTH / 2, 468, "NEUSTART")) {
      this.scene.restart();
      return;
    }

    if (isWithinButton(pointer, GAME_WIDTH / 2, 548, "BEENDEN")) {
      this.exitToMenu();
    }
  }

  handleGameOverPointer(pointer) {
    const isTopFive = this.stats.scores.some((entry) => entry.id === this.resultEntryId);
    const buttonY = isTopFive ? 578 : 486;

    if (isWithinButton(pointer, GAME_WIDTH / 2, 496, "SPEICHERN") && this.nameInput) {
      this.persistGameResult(this.nameInput.value);
      this.destroyNameInput();
      return;
    }

    if (isWithinButton(pointer, GAME_WIDTH / 2 - 210, buttonY, "NOCHMAL")) {
      this.destroyNameInput();
      this.scene.restart();
      return;
    }

    if (isWithinButton(pointer, GAME_WIDTH / 2 + 40, buttonY, "HIGHSCORE")) {
      this.destroyNameInput();
      this.scene.start("HighscoreScene");
      return;
    }

    if (isWithinButton(pointer, GAME_WIDTH / 2 + 275, buttonY, "MENUE")) {
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
    this.updatePowerUpState();
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

    if (this.isDiving) {
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
    this.diveHeld = held;
    this.diveQueuedUntil = 0;
    this.diveQueuedHeld = false;
    this.diveStartedAt = this.time.now;
    this.diveUntil = this.time.now + DIVE_MIN_DURATION;
    SoundFX.unlock();
    SoundFX.dive();
    this.duck.setVelocityY(520);
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
        gap: 660,
        mode: "jump",
        prompt: "DRUEBER!",
      },
      {
        key: "soapV2",
        y: WATERLINE - 38,
        scale: 0.62,
        speedBoost: 14,
        body: [164, 110, 60, 22],
        gap: 740,
        mode: "jump",
        prompt: "WEIT DRUEBER!",
        visual: "soapstack",
        labelOffset: 118,
      },
      {
        key: "toothbrush",
        y: WATERLINE - 78,
        scale: 0.5,
        speedBoost: 18,
        body: [230, 98, 58, 56],
        gap: 760,
        mode: "dive",
        prompt: "TAUCH!",
      },
      {
        key: "cupBrushV2",
        y: WATERLINE - 78,
        scale: 0.42,
        speedBoost: 16,
        body: [150, 102, 40, 56],
        gap: 800,
        mode: "dive",
        prompt: "TAUCH!",
        labelOffset: 124,
      },
      {
        key: "pearlBlue",
        y: WATERLINE - 76,
        scale: 0.18,
        speedBoost: 12,
        body: [840, 104, -360, 54],
        gap: 820,
        mode: "dive",
        prompt: "TIEF TAUCHEN!",
        visual: "foamgate",
        labelOffset: 132,
      },
      {
        key: "whirlpoolV2",
        y: WATERLINE - 18,
        scale: 0.42,
        speedBoost: 24,
        body: [168, 90, 88, 44],
        gap: 760,
        mode: "stomp",
        prompt: "DRAUF!",
      },
      {
        key: "underwaterCap",
        y: WATERLINE + 70,
        scale: 0.31,
        speedBoost: 12,
        body: [253, 131, 185, 228],
        gap: 780,
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
        gap: 840,
        mode: "underwater",
        prompt: "NICHT TAUCHEN!",
        labelOffset: 156,
      },
    ];
    const allowed = this.runTime < 18 ? options.slice(0, 3) : this.runTime < 38 ? options.slice(0, 5) : options;
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
    obstacle.setData("prompt", pick.prompt);
    obstacle.setData("labelOffset", pick.labelOffset ?? (pick.mode === "dive" ? 74 : 88));

    if (pick.key === "cupBrush" || pick.key === "cupBrushV2") {
      this.decorateCupBrush(obstacle);
    } else if (pick.visual === "foamgate") {
      this.decorateFoamGate(obstacle);
    } else if (pick.visual === "soapstack") {
      this.decorateSoapStack(obstacle);
    }

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

  decorateCupBrush(obstacle) {
    const container = this.add.container(obstacle.x, obstacle.y);
    container.setDepth(6);
    container.setData("cleanup", true);
    const wake = this.add.ellipse(0, 112, 170, 28, 0x71f1ff, 0.24);
    container.add(wake);
    obstacle.setData("visual", container);
  }

  decorateFoamGate(obstacle) {
    obstacle.setAlpha(0.001);
    const container = this.add.container(obstacle.x, obstacle.y);
    container.setDepth(7);
    container.setData("cleanup", true);

    const wake = this.add.ellipse(0, 78, 176, 32, 0x71f1ff, 0.2);
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
    const base = this.add.ellipse(0, 72, 164, 28, 0xeaffff, 0.2);
    container.add([wake, base, ...bubbles, cap]);
    obstacle.setData("visual", container);
  }

  decorateSoapStack(obstacle) {
    const container = this.add.container(obstacle.x, obstacle.y);
    container.setDepth(7);
    container.setData("cleanup", true);
    const wake = this.add.ellipse(0, 46, 178, 28, 0x71f1ff, 0.2);
    const back = this.add.image(-18, -18, "soap").setScale(0.58).setAngle(-7).setAlpha(0.82);
    const front = this.add.image(18, 6, "soap").setScale(0.62).setAngle(5);
    container.add([wake, back, front]);
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
  }

  spawnRewardTrailForObstacle(obstacle, config) {
    const trailId = (this.rewardTrailId += 1);
    const isDive = config.mode === "dive";
    const isJump = config.mode === "jump";
    const points = isDive
      ? [
          { x: -290, y: WATERLINE - 42, key: "pearlBlue" },
          { x: -170, y: WATERLINE - 55, key: "pearlBlue" },
          { x: 58, y: WATERLINE - 58, key: "pearlGold" },
          { x: 158, y: WATERLINE - 82, key: "pearlPink" },
        ]
      : isJump
        ? [
            { x: -236, y: WATERLINE - 102, key: "pearlPink" },
            { x: -126, y: WATERLINE - 162, key: "pearlBlue" },
            { x: 4, y: WATERLINE - 194, key: "pearlGold" },
            { x: 140, y: WATERLINE - 142, key: "pearlBlue" },
          ]
        : [
          { x: -248, y: WATERLINE - 116, key: "pearlPink" },
          { x: -136, y: WATERLINE - 182, key: "pearlBlue" },
          { x: -20, y: WATERLINE - 224, key: "pearlGold" },
          { x: 104, y: WATERLINE - 184, key: "pearlBlue" },
          { x: 202, y: WATERLINE - 128, key: "pearlPink" },
        ];

    points.forEach((point, index) => {
      this.time.delayedCall(index * 55, () => {
        if (this.isGameOver || !obstacle.active) {
          return;
        }

        this.spawnPearlAt(obstacle.x + point.x, point.y, point.key, -this.speed - config.speedBoost, trailId);
      });
    });
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

    const roll = Phaser.Math.Between(1, 100);
    if (this.runTime > 10 && roll > 84) {
      const underwaterY = Phaser.Math.Between(WATERLINE + 54, WATERLINE + 118);
      this.spawnPearlAt(GAME_WIDTH + 100, underwaterY, "underwaterPearls", -this.speed * 0.72, null, { underwater: true });
      return;
    }

    const key = roll > 96 ? "starfishBonus" : roll > 90 ? "shellPearl" : roll > 78 ? "pearlGold" : roll > 44 ? "pearlBlue" : "pearlPink";
    const safeLane = Phaser.Utils.Array.GetRandom(COLLECTIBLE_LANES);
    this.spawnPearlAt(GAME_WIDTH + 100, safeLane, key, -this.speed * 0.78);
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

    const value = pearl.getData("value");
    this.score += value;
    this.pearls += 1;
    SoundFX.collect();
    const driftBonus = this.getDriftBonus();
    if (driftBonus > 0) {
      this.score += driftBonus;
    }
    const isRareCollectible = value >= 80;
    this.addCombo(
      (value >= 50 ? 2 : 1) + (isRareCollectible ? 1 : 0) + (driftBonus > 0 ? 1 : 0),
      driftBonus > 0 ? `SAUBERE LINIE! +${driftBonus}` : getCollectibleMessage(pearl.texture.key),
      pearl.x,
      pearl.y - 50,
      driftBonus > 0 ? "#9df6ff" : isRareCollectible ? "#ff70ad" : "#ffd43f",
    );
    this.burst(pearl.x, pearl.y, [pearl.texture.key], value >= 50 ? 16 : 9, value >= 80 ? 0.16 : value >= 50 ? 0.18 : 0.12, value >= 80 ? 112 : value >= 50 ? 86 : 62);
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
    this.magnetUntil = this.time.now + 9000;
    this.score += 20;
    SoundFX.success();
    this.showFloatingText("MAGNET!", this.duck.x + 170, this.duck.y - 110, "#ffd43f");
    this.burst(this.duck.x + 28, this.duck.y - 20, ["pearlGold", "pearlPink", "pearlBlue"], 24, 0.12, 180);
  }

  activateShield() {
    this.shieldCharges = Math.min(2, this.shieldCharges + 1);
    this.score += 25;
    SoundFX.success();
    this.duck.setTint(0x9df6ff);
    this.showFloatingText("SCHAUMSCHILD!", this.duck.x + 180, this.duck.y - 118, "#9df6ff");
    this.burst(this.duck.x + 20, this.duck.y, ["pearlBlue"], 22, 0.12, 150);
  }

  activateTurbo() {
    this.turboUntil = this.time.now + 4800;
    this.invulnerableUntil = Math.max(this.invulnerableUntil, this.turboUntil);
    this.score += 30;
    SoundFX.success();
    this.duck.setTint(0xfff08a);
    this.showFloatingText("TURBO-BLASE!", this.duck.x + 185, this.duck.y - 120, "#ff70ad");
    this.cameras.main.shake(90, 0.003);
    this.burst(this.duck.x + 30, this.duck.y - 6, ["pearlGold", "pearlPink"], 26, 0.13, 180);
  }

  activateQuackBomb() {
    this.bombFlashUntil = this.time.now + 1100;
    this.score += 35;
    this.showFloatingText("QUAK-SCHOCKWELLE!", this.duck.x + 190, this.duck.y - 120, "#ffd43f");
    this.cameras.main.shake(120, 0.006);
    this.burst(this.duck.x + 30, this.duck.y - 10, ["pearlGold", "pearlBlue", "quackBombV2"], 22, 0.15, 210);

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
      obstacle.body.enable = false;
      this.destroyObstacleVisuals(obstacle);
      obstacle.getData("label")?.destroy();
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
      this.score += cleared * 25;
    }
  }

  handleHit(_, obstacle) {
    if (this.isGameOver || this.time.now < this.invulnerableUntil) {
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

    this.lives -= 1;
    this.combo = 0;
    this.comboText.setText("");
    SoundFX.hit();
    this.burst(this.duck.x + 40, this.duck.y + 8, ["pearlBlue"], 18, 0.1, 118);
    this.invulnerableUntil = this.time.now + 1350;
    this.cameras.main.shake(150, 0.007);

    if (obstacle?.active) {
      obstacle.body.enable = false;
      this.destroyObstacleVisuals(obstacle);
      obstacle.getData("label")?.destroy();
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

    if (this.lives > 0) {
      this.duck.setTint(0x9df6ff);
      this.showFloatingText("SCHAUMSCHILD!", this.duck.x + 170, this.duck.y - 110, "#9df6ff");
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

    this.score += 30;
    this.addCombo(3, "TURBO DURCH!", obstacle.x, obstacle.y - 90, "#ff70ad");
    SoundFX.success();
    obstacle.body.enable = false;
    this.destroyObstacleVisuals(obstacle);
    obstacle.getData("label")?.destroy();
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
    this.shieldCharges -= 1;
    this.score += 20;
    this.addCombo(2, "SCHILD HAELT!", this.duck.x + 160, this.duck.y - 95, "#9df6ff");
    SoundFX.success();
    this.cameras.main.shake(90, 0.004);
    this.burst(this.duck.x + 28, this.duck.y - 8, ["pearlBlue"], 26, 0.13, 170);

    if (obstacle?.active) {
      obstacle.body.enable = false;
      this.destroyObstacleVisuals(obstacle);
      obstacle.getData("label")?.destroy();
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

    const shade = makeScreenShade(this, 0.68, 30);
    const card = makeGlassPanel(this, 310, 88, 660, 552, 31);
    const trophy = this.add.image(430, 184, "uiTrophy").setScale(0.16).setDepth(32);
    const gameOverDuck = this.add.image(850, 226, "duckGameOver").setScale(0.24).setDepth(32);

    const title = isNewHighscore ? "NEUER ENTENREKORD!" : "ENTE GESTOPPT";
    const titleColor = isNewHighscore ? "#ffd43f" : "#ff70ad";
    this.add.text(GAME_WIDTH / 2, 158, title, titleStyle(44, titleColor)).setOrigin(0.5).setDepth(32);
    const scoreText = this.add
      .text(GAME_WIDTH / 2, 258, `${finalScore.toLocaleString("de-DE")}`, titleStyle(76, "#ffffff"))
      .setOrigin(0.5)
      .setDepth(32)
      .setScale(0.78);
    this.tweens.add({
      targets: scoreText,
      scale: 1,
      duration: 260,
      ease: "Back.out",
    });
    this.add
      .text(
        GAME_WIDTH / 2,
        334,
        `Perlen ${this.pearls.toLocaleString("de-DE")}   Highscore ${nextStats.highscore.toLocaleString("de-DE")}`,
        hudTextStyle(26, "#ffd43f"),
      )
      .setOrigin(0.5)
      .setDepth(32);

    let saveButton = null;
    let nameLabel = null;
    if (isTopFive) {
      nameLabel = this.add.text(GAME_WIDTH / 2, 390, "Name fuer die Bestenliste", hudTextStyle(20, "#9df6ff")).setOrigin(0.5).setDepth(32);
      this.add.image(GAME_WIDTH / 2, 436, "uiInputName").setDisplaySize(338, 58).setDepth(32);
      this.createNameInput(readPlayerName(), 482, 414, 316, 44);
      saveButton = makeButton(this, GAME_WIDTH / 2, 496, "SPEICHERN");
      saveButton.setDepth(32);
      saveButton.on("pointerdown", () => {
        const savedStats = this.persistGameResult(this.nameInput?.value || readPlayerName());
        this.destroyNameInput();
        nameLabel?.setText(`Gespeichert als ${savedStats.scores.find((entry) => entry.id === this.resultEntryId)?.name || readPlayerName()}`);
        saveButton?.setAlpha(0.5);
        saveButton?.disableInteractive();
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

    const buttonY = isTopFive ? 578 : 486;
    const again = makeButton(this, GAME_WIDTH / 2 - 210, buttonY, "NOCHMAL");
    again.setDepth(32);
    again.on("pointerdown", () => {
      this.destroyNameInput();
      this.scene.restart();
    });

    const highscore = makeButton(this, GAME_WIDTH / 2 + 40, buttonY, "HIGHSCORE");
    highscore.setDepth(32);
    highscore.on("pointerdown", () => {
      this.destroyNameInput();
      this.scene.start("HighscoreScene");
    });

    const menu = makeButton(this, GAME_WIDTH / 2 + 275, buttonY, "MENUE");
    menu.setDepth(32);
    menu.on("pointerdown", () => {
      this.destroyNameInput();
      this.scene.start("MenuScene");
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroyNameInput());
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
    const rect = canvas.getBoundingClientRect();
    const input = document.createElement("input");
    input.type = "text";
    input.value = sanitizePlayerName(initialName);
    input.maxLength = 12;
    input.autocomplete = "off";
    input.spellcheck = false;
    input.style.position = "fixed";
    input.style.left = `${rect.left + (x / GAME_WIDTH) * rect.width}px`;
    input.style.top = `${rect.top + (y / GAME_HEIGHT) * rect.height}px`;
    input.style.width = `${(width / GAME_WIDTH) * rect.width}px`;
    input.style.height = `${(height / GAME_HEIGHT) * rect.height}px`;
    input.style.zIndex = "1000";
    input.style.border = "3px solid rgba(157,246,255,0.95)";
    input.style.borderRadius = "14px";
    input.style.background = "rgba(5,38,64,0.92)";
    input.style.color = "#ffffff";
    input.style.font = "900 22px Trebuchet MS, sans-serif";
    input.style.textAlign = "center";
    input.style.outline = "none";
    input.style.boxShadow = "0 8px 24px rgba(0,0,0,0.28)";
    input.addEventListener("input", () => {
      input.value = filterPlayerNameInput(input.value);
    });
    document.body.appendChild(input);
    this.nameInput = input;
    input.focus();
    input.select();
  }

  destroyNameInput() {
    if (!this.nameInput) {
      return;
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
      this.physics.pause();
      this.setPearlTweensPaused(true);
      this.showPauseOverlay();
    } else {
      this.resumeGame();
    }
  }

  showPauseOverlay() {
    this.resetTouchDrift();
    this.destroyPauseOverlay();
    const shade = makeScreenShade(this, 0.54, 40);
    const card = makeGlassPanel(this, 396, 130, 488, 470, 41);
    const icon = this.add.image(GAME_WIDTH / 2, 194, "uiPause").setScale(0.14).setDepth(42);
    const title = this.add.text(GAME_WIDTH / 2, 270, "PAUSE", titleStyle(58, "#ffd43f")).setOrigin(0.5).setDepth(42);
    const stats = this.add
      .text(
        GAME_WIDTH / 2,
        322,
        `${Math.floor(this.score).toLocaleString("de-DE")} Punkte   ${this.pearls.toLocaleString("de-DE")} Perlen`,
        hudTextStyle(24, "#9df6ff"),
      )
      .setOrigin(0.5)
      .setDepth(42);
    const resume = makeButton(this, GAME_WIDTH / 2, 388, "WEITER");
    resume.setDepth(43);
    resume.on("pointerdown", () => this.resumeGame());
    const restart = makeButton(this, GAME_WIDTH / 2, 468, "NEUSTART");
    restart.setDepth(43);
    restart.on("pointerdown", () => this.scene.restart());
    const exit = makeButton(this, GAME_WIDTH / 2, 548, "BEENDEN");
    exit.setDepth(43);
    exit.on("pointerdown", () => this.exitToMenu());

    this.pauseOverlay = [shade, card, icon, title, stats, resume, restart, exit];
  }

  resumeGame() {
    if (this.isGameOver) {
      return;
    }

    this.resetTouchDrift();
    this.isPaused = false;
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

    this.diveWake?.setPosition(this.duck.x + 28, this.duck.y + 42);
    this.diveShade?.setPosition(this.duck.x + 30, this.duck.y + 52);
    this.diveStatusText?.setPosition(this.duck.x + 128, this.duck.y + 4);
    this.emitDiveBubble();
  }

  emitDiveBubble() {
    if (this.time.now < this.lastDiveBubbleAt + 78) {
      return;
    }

    this.lastDiveBubbleAt = this.time.now;
    const bubble = this.add
      .image(this.duck.x + Phaser.Math.Between(14, 68), this.duck.y + Phaser.Math.Between(18, 58), "pearlBlue")
      .setScale(0.08)
      .setAlpha(0.46)
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
    this.scoreText.setText(Math.floor(this.score).toLocaleString("de-DE"));
    this.pearlText.setText(this.pearls.toLocaleString("de-DE"));
    this.lifeBubbles.forEach((bubble, index) => {
      const alive = index < this.lives;
      bubble.setAlpha(alive ? 0.86 : 0.2);
      bubble.setScale(alive ? (index < this.shieldCharges ? 0.076 : 0.068) : 0.052);
      setHeartIconColor(bubble, index < this.shieldCharges ? 0x9df6ff : 0xff3f76);
    });
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
    if (this.combo === 0 || this.time.now - this.lastComboAt < 1900) {
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
    this.diveHeld = false;
    this.diveRecoverUntil = this.time.now + DIVE_RECOVERY_DURATION;
    this.setDuckNormalBody();
    this.duck.setVelocityY(-360);
    this.duck.setAngle(-10);
    this.duck.setAlpha(1);
    if (this.time.now >= this.invulnerableUntil && !this.isTurboActive()) {
      this.duck.clearTint();
    }
    this.diveWake?.destroy();
    this.diveWake = null;
    this.diveShade?.destroy();
    this.diveShade = null;
    this.diveStatusText?.destroy();
    this.diveStatusText = null;
    this.splash(this.duck.x - 28, this.duck.y + 48);
    this.tweens.add({
      targets: this.duck,
      angle: -4,
      duration: 180,
      ease: "Cubic.out",
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
      if (!obstacle.active || obstacle.getData("passed") || obstacle.x > this.duck.x + 74 || obstacle.x < this.duck.x - 96) {
        return;
      }

      const mode = obstacle.getData("mode");
      if (mode === "jump") {
        if (this.hasClearedJumpObstacle(obstacle)) {
          this.scoreJumpObstacle(obstacle);
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

        this.handleHit(this.duck, obstacle);
        return;
      }

      if (mode === "stomp") {
        if (this.canStomp(obstacle)) {
          this.stompObstacle(obstacle);
          return;
        }

        this.handleHit(this.duck, obstacle);
        return;
      }

      if (mode === "underwater") {
        if (this.isDiving) {
          this.handleHit(this.duck, obstacle);
          return;
        }

        obstacle.setData("passed", true);
        this.addCombo(1, "OBEN VORBEI!", obstacle.x, obstacle.y - 118, "#ff70ad");
      }
    });
  }

  scoreJumpObstacle(obstacle) {
    obstacle.setData("passed", true);
    this.score += 25;
    this.addCombo(2, "DRUEBER!", obstacle.x, obstacle.y - 82, "#ffd43f");
    SoundFX.success();
  }

  hasClearedJumpObstacle(obstacle) {
    const duckBottom = this.duck.body.y + this.duck.body.height;
    const obstacleTop = obstacle.body.y;
    return !this.isDiving && !this.duck.body.blocked.down && duckBottom < obstacleTop + 28;
  }

  stompObstacle(obstacle) {
    obstacle.body.enable = false;
    this.destroyObstacleVisuals(obstacle);
    obstacle.getData("label")?.destroy();
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
    obstacle.body.enable = false;
    this.destroyObstacleVisuals(obstacle);
    obstacle.getData("label")?.destroy();
    const isPerfect = Math.abs(this.duck.x - obstacle.x) < 64;
    this.score += isPerfect ? 50 : 30;
    this.addCombo(isPerfect ? 5 : 3, isPerfect ? "KNAPP GETAUCHT!" : "SAUBER DRUNTER!", obstacle.x, obstacle.y + 68, "#9df6ff");
    SoundFX.success();
    this.splash(this.duck.x + 24, this.duck.y + 46);
    this.burst(this.duck.x + 38, this.duck.y + 26, isPerfect ? ["pearlGold", "pearlBlue"] : ["pearlBlue"], isPerfect ? 18 : 10, 0.1, isPerfect ? 120 : 78);
  }

  addCombo(amount, message, x, y, color) {
    this.combo = Math.min(24, this.combo + amount);
    this.lastComboAt = this.time.now;
    const bonus = Math.min(18, Math.max(0, this.combo - 3));
    this.score += bonus;
    this.comboText.setText(this.combo >= 4 ? `Combo x${this.combo}` : "");

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
      const early = [
        ["jump", "dive", "jump"],
        ["jump", "jump", "dive"],
      ];
      const later = [
        ["jump", "dive", "stomp", "underwater"],
        ["dive", "underwater", "jump", "stomp"],
        ["stomp", "jump", "dive", "underwater"],
        ["jump", "stomp", "underwater", "dive"],
      ];
      this.obstaclePattern = Phaser.Utils.Array.GetRandom(this.runTime < 35 ? early : later).slice();
    }

    const desiredMode = this.obstaclePattern.shift();
    const candidates = options.filter((option) => option.mode === desiredMode);
    const cupBrush = candidates.find((option) => option.key === "cupBrush" || option.key === "cupBrushV2");
    if (cupBrush && !this.cupBrushIntroduced) {
      this.cupBrushIntroduced = true;
      return cupBrush;
    }

    return Phaser.Utils.Array.GetRandom(candidates.length > 0 ? candidates : options);
  }

  pullNearbyCollectibles() {
    const magnetActive = this.isMagnetActive();
    const attractDistance = magnetActive ? 315 : 24;
    const attractStrength = magnetActive ? 0.062 : 0;
    const collectDistance = magnetActive ? 112 : 20;
    const lateCatchDistance = magnetActive ? 138 : 20;

    this.collectibles.getChildren().forEach((pearl) => {
      if (!pearl.active) {
        return;
      }

      const underwater = pearl.getData("underwater");

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

  getObstacleDelay() {
    if (this.runTime > 95) {
      return 1080;
    }
    if (this.runTime > 55) {
      return 1250;
    }
    if (this.runTime > 25) {
      return 1450;
    }
    return 1700;
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

function addCurrentSprites(scene, depth) {
  const currents = [
    { x: 180, y: WATER_SURFACE_Y + 154, scale: 0.3, alpha: 0.18, duration: 10800 },
    { x: 760, y: WATER_SURFACE_Y + 210, scale: 0.24, alpha: 0.14, duration: 12800 },
    { x: 1180, y: WATER_SURFACE_Y + 114, scale: 0.21, alpha: 0.12, duration: 9200 },
  ];

  currents.forEach((config) => {
    const current = scene.add.image(config.x, config.y, "waterCurrent");
    current.setScale(config.scale);
    current.setAlpha(config.alpha);
    current.setDepth(depth);
    current.setBlendMode(Phaser.BlendModes.SCREEN);

    scene.tweens.add({
      targets: current,
      x: current.x - 520,
      y: current.y + 18,
      alpha: config.alpha * 0.45,
      duration: config.duration,
      repeat: -1,
      yoyo: true,
      ease: "Sine.inOut",
    });
  });
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

function addWaterCausticRibbons(scene, depth) {
  const ribbons = [
    { y: WATER_SURFACE_Y + 72, alpha: 0.18, amp: 7, wave: 74, width: 3, duration: 4200, drift: -300 },
    { y: WATER_SURFACE_Y + 126, alpha: 0.2, amp: 10, wave: 92, width: 4, duration: 5600, drift: -420 },
    { y: WATER_SURFACE_Y + 188, alpha: 0.16, amp: 12, wave: 118, width: 3, duration: 6800, drift: -360 },
  ];

  ribbons.forEach((config, index) => {
    const graphic = scene.add.graphics();
    const width = GAME_WIDTH + 620;
    graphic.x = -180 + index * 46;
    graphic.setDepth(depth);
    graphic.setAlpha(0.78);
    graphic.setBlendMode(Phaser.BlendModes.SCREEN);
    graphic.lineStyle(config.width, 0xeaffff, config.alpha);

    for (let lane = 0; lane < 3; lane += 1) {
      graphic.beginPath();
      const laneY = config.y + lane * 18;
      graphic.moveTo(0, laneY);
      for (let x = 0; x <= width; x += 18) {
        const y =
          laneY +
          Math.sin((x + lane * 38) / config.wave) * config.amp +
          Math.sin((x + index * 83) / 37) * 2.5;
        graphic.lineTo(x, y);
      }
      graphic.strokePath();
    }

    scene.tweens.add({
      targets: graphic,
      x: graphic.x + config.drift,
      alpha: 0.34,
      duration: config.duration,
      delay: index * 420,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  });
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

function drawWaterCurrent(scene, y, color, alpha, amplitude, wavelength, lanes) {
  const graphic = scene.add.graphics();
  const width = GAME_WIDTH + 560;
  graphic.x = -140;
  graphic.lineStyle(2, color, alpha);

  for (let lane = 0; lane < lanes; lane += 1) {
    const laneY = y + lane * 24;
    graphic.beginPath();
    graphic.moveTo(0, laneY);
    for (let x = 0; x <= width; x += 18) {
      const offset = Math.sin(x / wavelength + lane * 1.35) * amplitude;
      graphic.lineTo(x, laneY + offset);
    }
    graphic.strokePath();
  }

  return graphic;
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

function makeGlassPanel(scene, x, y, width, height, depth = 2) {
  const texture = width >= height ? "uiPanelLarge" : "uiPanelSmall";
  const panel = scene.add.image(x + width / 2, y + height / 2, texture);
  panel.setDepth(depth);
  panel.setDisplaySize(width, height);
  panel.setAlpha(0.92);
  return panel;
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
  const icon = scene.add.image(34, 28, iconKey).setScale(iconScale);
  const text = scene.add.text(66, 28, "0", hudTextStyle(28, color)).setOrigin(0, 0.5);
  container.add([bg, shine, icon, text]);
  return { container, text };
}

function makeLifePill(scene, x, y) {
  const container = scene.add.container(x, y).setDepth(20);
  const bg = scene.add.graphics();
  bg.fillStyle(0x0b62c9, 0.94);
  bg.fillRoundedRect(0, 0, 136, 56, 22);
  bg.lineStyle(4, 0xffffff, 0.64);
  bg.strokeRoundedRect(0, 0, 136, 56, 22);

  const shine = scene.add.rectangle(18, 9, 100, 12, 0xffffff, 0.16).setOrigin(0, 0.5);
  const hearts = [0, 1, 2].map((index) => scene.add.image(32 + index * 34, 28, "uiHeart").setScale(0.068));
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
  bg.fillCircle(34, 34, 34);
  bg.lineStyle(4, 0xffffff, 0.72);
  bg.strokeCircle(34, 34, 34);

  const glow = scene.add.circle(34, 34, 38, hexColorToNumber(color), 0.12);
  const icon = scene.add.image(34, 32, iconKey).setScale(0.28);
  const labelText = scene.add.text(34, 78, label, hudTextStyle(14, "#ffffff")).setOrigin(0.5);

  const badge = scene.add.container(62, 58);
  const badgeBg = scene.add.circle(0, 0, 15, 0xff3f9a, 1);
  badgeBg.setStrokeStyle(3, 0xffffff, 0.72);
  const badgeText = scene.add.text(0, 0, "", hudTextStyle(15, "#ffffff")).setOrigin(0.5);
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
  const icon = scene.add.image(0, 0, "uiPause").setScale(0.105);
  container.add([icon]);
  container.setSize(68, 68);
  container.setInteractive(new Phaser.Geom.Rectangle(-34, -34, 68, 68), Phaser.Geom.Rectangle.Contains);
  container.input.cursor = "pointer";
  container.setDepth(20);
  return container;
}

function makeButton(scene, x, y, label) {
  const container = scene.add.container(x, y);
  const width = Math.max(236, label.length * 19);
  const halfWidth = width / 2;
  const bg = scene.add.image(0, 0, getButtonTexture(label));
  bg.setDisplaySize(width, 68);

  const text = scene.add.text(0, 1, label, {
    fontFamily: "Trebuchet MS",
    fontSize: "28px",
    fontStyle: "900",
    color: "#ffffff",
    stroke: "#a45200",
    strokeThickness: 5,
  });
  text.setOrigin(0.5);
  container.add([bg, text]);
  container.setSize(width, 68);
  container.setInteractive(new Phaser.Geom.Rectangle(-halfWidth, -34, width, 68), Phaser.Geom.Rectangle.Contains);
  container.input.cursor = "pointer";
  container.on("pointerover", () => container.setScale(1.04));
  container.on("pointerout", () => container.setScale(1));
  return container;
}

function getButtonTexture(label) {
  if (label === "BEENDEN" || label === "MENUE" || label === "MENÜ") {
    return "uiButtonDanger";
  }

  if (label === "HIGHSCORE" || label === "ZURUECK" || label === "ZURÜCK") {
    return "uiButtonSecondary";
  }

  return "uiButtonPrimary";
}

function isWithinButton(pointer, x, y, label) {
  const width = Math.max(236, label.length * 19);
  return Math.abs(pointer.x - x) <= width / 2 && Math.abs(pointer.y - y) <= 34;
}

function isWithinRoundButton(pointer, x, y) {
  return Math.abs(pointer.x - x) <= 42 && Math.abs(pointer.y - y) <= 42;
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

function makeRoundButton(scene, x, y, label) {
  const container = scene.add.container(x, y);
  const bg = scene.add.graphics();
  bg.fillStyle(0x2f8ed8, 0.94);
  bg.fillRoundedRect(-34, -34, 68, 68, 17);
  bg.lineStyle(3, 0xffffff, 0.58);
  bg.strokeRoundedRect(-34, -34, 68, 68, 17);
  const text = scene.add.text(0, 0, label, hudTextStyle(28, "#ffffff")).setOrigin(0.5);
  container.add([bg, text]);
  container.setSize(68, 68);
  container.setInteractive(new Phaser.Geom.Rectangle(-34, -34, 68, 68), Phaser.Geom.Rectangle.Contains);
  container.input.cursor = "pointer";
  container.setDepth(20);
  return container;
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
