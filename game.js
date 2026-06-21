const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const WATERLINE = 560;
const STORAGE_KEY = "duck-dash-stats";
const COLLECTIBLE_LANES = [430, 400, 368];
const DIVE_MIN_DURATION = 260;
const DIVE_MAX_DURATION = 680;
const DIVE_RECOVERY_DURATION = 260;
const DUCK_HOME_X = 220;
const DUCK_MIN_X = 96;
const DUCK_MAX_X = 420;

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
    this.load.image("bg", "assets/bathroom_bg.jpg");
    this.load.image("logo", "assets/logo.png");
    this.load.image("duck", "assets/duck.png");
    this.load.image("soap", "assets/soap.png");
    this.load.image("toothbrush", "assets/toothbrush.png");
    this.load.image("whirlpool", "assets/whirlpool.png");
    this.load.image("pearlPink", "assets/pearl_pink.png");
    this.load.image("pearlBlue", "assets/pearl_blue.png");
    this.load.image("pearlGold", "assets/pearl_gold.png");
    this.load.image("quackBomb", "assets/quack_bomb.png");
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
    this.stats = readStats();
    addBackground(this);
    addWaterOverlay(this);

    const shade = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x06253d, 0.24);
    shade.setDepth(1);

    const card = this.add.graphics();
    card.setDepth(2);
    card.fillStyle(0x0a3a5d, 0.4);
    card.fillRoundedRect(360, 58, 560, 590, 28);
    card.lineStyle(4, 0x80f2ff, 0.46);
    card.strokeRoundedRect(360, 58, 560, 590, 28);

    this.add.image(GAME_WIDTH / 2, 170, "logo").setScale(1.02).setDepth(3);

    this.add
      .text(GAME_WIDTH / 2, 318, "Spring. Tauch. Sammle Perlen.", {
        fontFamily: "Trebuchet MS",
        fontSize: "30px",
        fontStyle: "700",
        color: "#ffffff",
        stroke: "#123044",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.highscoreText = this.add
      .text(GAME_WIDTH / 2, 374, `Highscore ${this.stats.highscore.toLocaleString("de-DE")}`, {
        fontFamily: "Trebuchet MS",
        fontSize: "28px",
        fontStyle: "700",
        color: "#ffd43f",
        stroke: "#123044",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.add.image(GAME_WIDTH / 2 - 142, 472, "pearlPink").setScale(0.56).setDepth(3);
    this.add.image(GAME_WIDTH / 2 + 148, 462, "pearlBlue").setScale(0.56).setDepth(3);
    this.duck = this.add.image(GAME_WIDTH / 2, 500, "duck").setScale(0.84).setDepth(4);
    this.tweens.add({
      targets: this.duck,
      y: 484,
      angle: -4,
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

    const startButton = makeButton(this, GAME_WIDTH / 2, 598, "START");
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

    this.add
      .text(GAME_WIDTH / 2, 666, "Space / Tap = Springen\nPfeil runter / Swipe = Tauchen\nLinks/Rechts = Driften", {
        fontFamily: "Trebuchet MS",
        fontSize: "22px",
        fontStyle: "700",
        color: "#eaffff",
        stroke: "#123044",
        strokeThickness: 4,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.input.keyboard.once("keydown-SPACE", () => this.startGame());
  }

  startGame() {
    SoundFX.unlock();
    this.scene.start("GameScene");
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
    this.lastMilestone = 0;
    this.speed = 300;
    this.spawnDelay = 1700;
    this.collectDelay = 980;
    this.lastGroundedAt = 0;
    this.jumpQueuedUntil = 0;
    this.isGameOver = false;
    this.isPaused = false;
    this.invulnerableUntil = 0;
    this.isDiving = false;
    this.diveUntil = 0;
    this.diveStartedAt = 0;
    this.diveHeld = false;
    this.diveRecoverUntil = 0;
    this.lastDiveBubbleAt = 0;
    this.diveWake = null;
    this.shieldCharges = 0;
    this.magnetUntil = 0;
    this.turboUntil = 0;
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

    addBackground(this);
    addWaterOverlay(this);
    this.createWorld();
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

    this.duck = this.physics.add.sprite(220, WATERLINE - 80, "duck");
    this.duck.setScale(0.52);
    this.setDuckNormalBody();
    this.duck.setCollideWorldBounds(true);
    this.duck.setGravityY(1320);
    this.duck.setDepth(8);

    this.ground = this.add.rectangle(GAME_WIDTH / 2, WATERLINE + 78, GAME_WIDTH, 24, 0x21a8c9, 0);
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
    const panel = this.add.graphics();
    panel.fillStyle(0x062941, 0.54);
    panel.fillRoundedRect(24, 22, 310, 132, 18);
    panel.lineStyle(2, 0x71f1ff, 0.34);
    panel.strokeRoundedRect(24, 22, 310, 132, 18);

    this.scoreText = this.add.text(48, 38, "0", hudTextStyle(34, "#ffffff"));
    this.add.image(54, 98, "pearlGold").setScale(0.28).setDepth(9);
    this.pearlText = this.add.text(84, 82, "0", hudTextStyle(24, "#ffd43f"));
    this.lifeBubbles = [0, 1, 2].map((index) => {
      const bubble = this.add.circle(63 + index * 38, 134, 13, 0x9df6ff, 0.86);
      bubble.setStrokeStyle(3, 0xffffff, 0.42);
      bubble.setDepth(9);
      return bubble;
    });
    this.actionText = this.add.text(370, 38, "DRUEBER, DRAUF, DRIFTEN oder TAUCHEN", hudTextStyle(22, "#9df6ff"));
    this.comboText = this.add.text(GAME_WIDTH - 330, 118, "", hudTextStyle(26, "#ffd43f")).setOrigin(1, 0.5);
    this.tweens.add({
      targets: this.actionText,
      alpha: 0,
      delay: 5200,
      duration: 800,
      ease: "Sine.inOut",
    });

    this.pauseButton = makeRoundButton(this, GAME_WIDTH - 70, 64, "II");
    this.pauseButton.on("pointerdown", () => this.togglePause());

    this.quipText = this.add
      .text(GAME_WIDTH / 2, 104, "", {
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
      this.touchStartX = pointer.x;
      this.touchStartY = pointer.y;
      this.touchSwipeHandled = false;
      this.touchDriftDirection = 0;
      this.touchDriftActive = false;
      this.activeTouchPointerId = pointer.id;
    });

    this.input.on("pointermove", (pointer) => {
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

  update(_, delta) {
    if (this.isGameOver || this.isPaused) {
      return;
    }

    const deltaSeconds = delta / 1000;
    this.runTime += deltaSeconds;
    this.score += deltaSeconds * 12;
    this.speed = 300 + Math.min(280, this.runTime * 6) + (this.isTurboActive() ? 65 : 0);
    if (this.duck.body.blocked.down) {
      this.lastGroundedAt = this.time.now;
    }

    if (this.duck.body.blocked.down && this.time.now < this.jumpQueuedUntil) {
      this.performJump();
    }

    this.spawnObstacleEvent.delay = this.getObstacleDelay();

    this.updateHud();
    this.updatePowerUpState();
    this.updateDiveState();
    this.syncDiveVisual();
    if (!this.isDiving && this.time.now > this.diveRecoverUntil) {
      this.duck.setAngle(Phaser.Math.Clamp(this.duck.body.velocity.y / 34, -14, 18));
    }
    this.pullNearbyCollectibles();
    this.updateHorizontalControl(deltaSeconds);
    this.updateObstacleLabels();
    this.updatePowerUpLabels();
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

    if (this.isDiving || this.time.now < this.diveRecoverUntil) {
      return;
    }

    this.isDiving = true;
    this.diveHeld = held;
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
    this.splash(this.duck.x - 38, this.duck.y + 48);
  }

  releaseDive() {
    if (!this.isDiving) {
      return;
    }

    this.diveHeld = false;
    if (this.time.now >= this.diveUntil) {
      this.finishDive();
    }
  }

  spawnObstacle() {
    if (this.isGameOver || this.isPaused) {
      return;
    }

    const options = [
      {
        key: "soap",
        y: WATERLINE - 24,
        scale: 0.6,
        speedBoost: 10,
        body: [128, 38, 66, 68],
        gap: 660,
        mode: "jump",
        prompt: "DRUEBER!",
      },
      {
        key: "soap",
        y: WATERLINE - 38,
        scale: 0.76,
        speedBoost: 14,
        body: [150, 52, 58, 60],
        gap: 740,
        mode: "jump",
        prompt: "WEIT DRUEBER!",
        visual: "soapstack",
        labelOffset: 118,
      },
      {
        key: "toothbrush",
        y: WATERLINE - 134,
        scale: 0.5,
        speedBoost: 18,
        body: [206, 46, 70, 88],
        gap: 760,
        mode: "dive",
        prompt: "TAUCH!",
      },
      {
        key: "toothbrush",
        y: WATERLINE - 105,
        scale: 0.5,
        speedBoost: 16,
        body: [128, 118, 106, 48],
        gap: 800,
        mode: "dive",
        prompt: "TAUCH!",
        visual: "cupbrush",
        labelOffset: 124,
      },
      {
        key: "pearlBlue",
        y: WATERLINE - 118,
        scale: 0.18,
        speedBoost: 12,
        body: [124, 178, -6, -16],
        gap: 820,
        mode: "dive",
        prompt: "TIEF TAUCHEN!",
        visual: "foamgate",
        labelOffset: 132,
      },
      {
        key: "whirlpool",
        y: WATERLINE - 18,
        scale: 0.54,
        speedBoost: 24,
        body: [150, 56, 86, 94],
        gap: 760,
        mode: "stomp",
        prompt: "DRAUF!",
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

    if (pick.visual === "cupbrush") {
      this.decorateCupBrush(obstacle);
    } else if (pick.visual === "foamgate") {
      this.decorateFoamGate(obstacle);
    } else if (pick.visual === "soapstack") {
      this.decorateSoapStack(obstacle);
    }

    const label = this.add.text(obstacle.x, obstacle.y - obstacle.getData("labelOffset"), pick.prompt, hudTextStyle(20, pick.mode === "dive" ? "#9df6ff" : "#ffd43f"));
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
    obstacle.setAlpha(0.001);
    const container = this.add.container(obstacle.x, obstacle.y);
    container.setDepth(7);
    container.setData("cleanup", true);

    const cupBack = this.add.graphics();
    cupBack.fillStyle(0x19bdd1, 0.9);
    cupBack.fillRoundedRect(-64, -16, 128, 86, 18);
    cupBack.lineStyle(4, 0xeaffff, 0.58);
    cupBack.strokeRoundedRect(-64, -16, 128, 86, 18);

    const water = this.add.ellipse(0, -15, 124, 28, 0x9df6ff, 0.58);
    water.setStrokeStyle(3, 0xffffff, 0.38);

    const brush = this.add.image(3, -72, "toothbrush").setScale(0.35).setAngle(-70);
    const cupFront = this.add.graphics();
    cupFront.fillStyle(0x0f9db3, 0.84);
    cupFront.fillRoundedRect(-61, 8, 122, 64, 16);
    cupFront.lineStyle(3, 0x71f1ff, 0.4);
    cupFront.strokeRoundedRect(-61, 8, 122, 64, 16);

    const shine = this.add.rectangle(-34, 34, 11, 46, 0xffffff, 0.22).setAngle(10);
    const wake = this.add.ellipse(0, 74, 154, 28, 0x71f1ff, 0.24);

    container.add([wake, cupBack, brush, water, cupFront, shine]);
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

  spawnPearlAt(x, y, key, velocityX, trailId = null) {
    const value = key === "pearlGold" ? 50 : 10;
    const pearl = this.collectibles.create(x, y, key);
    pearl.setScale(key === "pearlGold" ? 0.58 : 0.52);
    pearl.body.setCircle(54);
    pearl.body.setOffset(-6, -6);
    pearl.setVelocityX(velocityX);
    pearl.setDepth(6);
    pearl.setData("value", value);
    pearl.setData("cleanup", true);
    pearl.setData("trailId", trailId);

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
    if (this.isGameOver || this.isPaused) {
      return;
    }

    const roll = Phaser.Math.Between(1, 100);
    const key = roll > 84 ? "pearlGold" : roll > 48 ? "pearlBlue" : "pearlPink";
    const safeLane = Phaser.Utils.Array.GetRandom(COLLECTIBLE_LANES);
    this.spawnPearlAt(GAME_WIDTH + 100, safeLane, key, -this.speed * 0.78);
  }

  spawnPowerUp() {
    if (this.isGameOver || this.isPaused || this.runTime < 12 || !this.hasObstacleGap(560)) {
      return;
    }

    const options = [
      { type: "bomb", key: "quackBomb", label: "BOMBE", color: "#ffd43f", scale: 0.78, tint: null },
      { type: "magnet", key: "pearlGold", label: "MAGNET", color: "#ffd43f", scale: 0.72, tint: 0xff70ad },
      { type: "shield", key: "pearlBlue", label: "SCHILD", color: "#9df6ff", scale: 0.72, tint: 0x9df6ff },
      { type: "turbo", key: "pearlPink", label: "TURBO", color: "#ff70ad", scale: 0.72, tint: 0xff70ad },
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

  collectPearl(_, pearl) {
    if (!pearl.active) {
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
    this.addCombo(
      (value >= 50 ? 2 : 1) + (driftBonus > 0 ? 1 : 0),
      driftBonus > 0 ? `SAUBERE LINIE! +${driftBonus}` : value >= 50 ? "GOLDPERLE!" : "PERLE!",
      pearl.x,
      pearl.y - 50,
      driftBonus > 0 ? "#9df6ff" : "#ffd43f",
    );
    this.burst(pearl.x, pearl.y, [pearl.texture.key], value >= 50 ? 14 : 9, value >= 50 ? 0.18 : 0.12, value >= 50 ? 86 : 62);
    this.splash(pearl.x, pearl.y);
    pearl.setActive(false);
    pearl.body.enable = false;
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
    this.score += 35;
    this.showFloatingText("QUAK-SCHOCKWELLE!", this.duck.x + 190, this.duck.y - 120, "#ffd43f");
    this.cameras.main.shake(120, 0.006);
    this.burst(this.duck.x + 30, this.duck.y - 10, ["pearlGold", "pearlBlue", "quackBomb"], 22, 0.15, 210);

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
    const isNewHighscore = finalScore > this.stats.highscore;
    const nextStats = {
      highscore: Math.max(this.stats.highscore, finalScore),
      games: this.stats.games + 1,
    };
    writeStats(nextStats);

    const shade = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x031827, 0.72);
    shade.setDepth(30);

    const card = this.add.graphics();
    card.setDepth(31);
    card.fillStyle(0x0a3a5d, 0.94);
    card.fillRoundedRect(350, 132, 580, 442, 24);
    card.lineStyle(4, 0x69e8ff, 0.55);
    card.strokeRoundedRect(350, 132, 580, 442, 24);

    const title = isNewHighscore ? "NEUER ENTENREKORD!" : "ENTE GESTOPPT";
    const titleColor = isNewHighscore ? "#ffd43f" : "#ff70ad";
    this.add.text(GAME_WIDTH / 2, 202, title, titleStyle(46, titleColor)).setOrigin(0.5).setDepth(32);
    const scoreText = this.add
      .text(GAME_WIDTH / 2, 300, `${finalScore.toLocaleString("de-DE")}`, titleStyle(78, "#ffffff"))
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
        374,
        `Perlen ${this.pearls.toLocaleString("de-DE")}   Highscore ${nextStats.highscore.toLocaleString("de-DE")}`,
        hudTextStyle(26, "#ffd43f"),
      )
      .setOrigin(0.5)
      .setDepth(32);

    if (isNewHighscore) {
      this.cameras.main.shake(150, 0.006);
      this.burst(GAME_WIDTH / 2, 250, ["pearlGold", "pearlPink", "pearlBlue"], 42, 0.16, 290, 33);
      const ring = this.add.circle(GAME_WIDTH / 2, 306, 30);
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

    const again = makeButton(this, GAME_WIDTH / 2, 492, "NOCHMAL DASHEN");
    again.setDepth(32);
    again.on("pointerdown", () => this.scene.restart());
  }

  togglePause() {
    if (this.isGameOver) {
      return;
    }

    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.physics.pause();
      this.pauseLabel = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "PAUSE", titleStyle(74, "#ffd43f")).setOrigin(0.5).setDepth(40);
    } else {
      this.physics.resume();
      this.pauseLabel?.destroy();
    }
  }

  splash(x, y) {
    this.splashEmitter.emitParticleAt(x, y, 16);
  }

  showDiveWake() {
    this.diveWake?.destroy();
    this.diveWake = this.add.ellipse(this.duck.x + 24, this.duck.y + 42, 172, 54, 0x6ff4ff, 0.28);
    this.diveWake.setDepth(7);
    this.diveWake.setStrokeStyle(3, 0xeaffff, 0.45);
  }

  syncDiveVisual() {
    if (!this.isDiving) {
      return;
    }

    this.diveWake?.setPosition(this.duck.x + 28, this.duck.y + 42);
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
      this.tweens.add({
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
    }
  }

  updateHud() {
    this.scoreText.setText(Math.floor(this.score).toLocaleString("de-DE"));
    this.pearlText.setText(this.pearls.toLocaleString("de-DE"));
    this.lifeBubbles.forEach((bubble, index) => {
      const alive = index < this.lives;
      bubble.setAlpha(alive ? 0.86 : 0.2);
      bubble.setScale(alive ? (index < this.shieldCharges ? 1.18 : 1) : 0.78);
      if (index < this.shieldCharges) {
        bubble.setTint(0x9df6ff);
      } else {
        bubble.clearTint();
      }
    });
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
    return !this.isDiving && this.duck.body.velocity.y > -60 && duckBottom < obstacleTop + 34;
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

    const desiredVelocity = Phaser.Math.Clamp((targetX - this.duck.x) * 8, -340, 340);
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
    if (offset > 130) {
      return 12;
    }
    if (offset > 65) {
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

      obstacle.setData("passed", true);
      this.score += 25;
      this.addCombo(2, "DRUEBER!", obstacle.x, obstacle.y - 82, "#ffd43f");
      SoundFX.success();
    });
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
    this.combo += amount;
    const bonus = Math.max(0, this.combo - 2) * 2;
    this.score += bonus;
    this.comboText.setText(this.combo >= 3 ? `Combo x${this.combo}` : "");

    const comboMessage = this.combo >= 5 ? `${message} +${bonus}` : message;
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
        ["stomp", "dive", "stomp"],
        ["dive", "stomp", "dive"],
      ];
      const later = [
        ["stomp", "dive", "stomp", "dive"],
        ["dive", "stomp", "stomp", "dive"],
        ["stomp", "stomp", "dive", "stomp"],
      ];
      this.obstaclePattern = Phaser.Utils.Array.GetRandom(this.runTime < 35 ? early : later).slice();
    }

    const desiredMode = this.obstaclePattern.shift();
    const candidates = options.filter((option) => option.mode === desiredMode);
    const cupBrush = candidates.find((option) => option.visual === "cupbrush");
    if (cupBrush && !this.cupBrushIntroduced) {
      this.cupBrushIntroduced = true;
      return cupBrush;
    }

    return Phaser.Utils.Array.GetRandom(candidates.length > 0 ? candidates : options);
  }

  pullNearbyCollectibles() {
    const magnetActive = this.isMagnetActive();
    const attractDistance = magnetActive ? 360 : 210;
    const attractStrength = magnetActive ? 0.075 : 0.032;
    const collectDistance = magnetActive ? 126 : 96;

    this.collectibles.getChildren().forEach((pearl) => {
      if (!pearl.active) {
        return;
      }

      if (pearl.x < this.duck.x - 120) {
        pearl.setActive(false);
        pearl.body.enable = false;
        pearl.destroy();
        return;
      }

      if (pearl.x < this.duck.x + 14) {
        const passedDistance = Phaser.Math.Distance.Between(this.duck.x, this.duck.y, pearl.x, pearl.y);
        if (passedDistance < 150) {
          this.collectPearl(this.duck, pearl);
        }
        return;
      }

      const distance = Phaser.Math.Distance.Between(this.duck.x, this.duck.y, pearl.x, pearl.y);
      if (distance > attractDistance) {
        return;
      }

      pearl.x = Phaser.Math.Linear(pearl.x, this.duck.x + 28, attractStrength);
      pearl.y = Phaser.Math.Linear(pearl.y, this.duck.y - 4, attractStrength);
      pearl.setVelocityX(Math.min(pearl.body.velocity.x, -this.speed * 0.42));

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
    const text = this.add.text(x, y, message, hudTextStyle(28, color)).setOrigin(0.5).setDepth(22);
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
  scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x06324b, 0.1);
}

function addWaterOverlay(scene) {
  const wave = scene.add.graphics();
  wave.fillStyle(0x20c7e8, 0.32);
  wave.fillRect(0, WATERLINE - 10, GAME_WIDTH, GAME_HEIGHT - WATERLINE + 10);
  wave.lineStyle(3, 0xa4fbff, 0.28);
  wave.lineBetween(0, WATERLINE - 8, GAME_WIDTH, WATERLINE - 8);
}

function makeButton(scene, x, y, label) {
  const container = scene.add.container(x, y);
  const width = Math.max(236, label.length * 19);
  const halfWidth = width / 2;
  const bg = scene.add.graphics();
  bg.fillStyle(0xffc51f, 1);
  bg.fillRoundedRect(-halfWidth, -34, width, 68, 18);
  bg.lineStyle(4, 0xffffff, 0.42);
  bg.strokeRoundedRect(-halfWidth, -34, width, 68, 18);

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
  container.setInteractive({ useHandCursor: true });
  container.on("pointerover", () => container.setScale(1.04));
  container.on("pointerout", () => container.setScale(1));
  return container;
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
  container.setInteractive({ useHandCursor: true });
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
    return { highscore: 0, games: 0, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
  } catch {
    return { highscore: 0, games: 0 };
  }
}

function writeStats(stats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
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
  scene: [BootScene, MenuScene, GameScene],
};

window.addEventListener("load", () => {
  new Phaser.Game(config);
});
