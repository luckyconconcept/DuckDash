const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const WATERLINE = 560;
const STORAGE_KEY = "duck-dash-stats";

const QUIPS = [
  "QUAK!",
  "Mehr Perlen!",
  "Badewasser ist Leben.",
  "Ich bin Geschwindigkeit.",
  "Das ist mein Badezimmer.",
];

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

    this.add.image(GAME_WIDTH / 2, 180, "logo").setScale(1.05);

    this.add
      .text(GAME_WIDTH / 2, 330, "Das Badezimmer ist voll. Die Ente muss durch.", {
        fontFamily: "Trebuchet MS",
        fontSize: "30px",
        fontStyle: "700",
        color: "#ffffff",
        stroke: "#123044",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.highscoreText = this.add
      .text(GAME_WIDTH / 2, 394, `Highscore ${this.stats.highscore}`, {
        fontFamily: "Trebuchet MS",
        fontSize: "28px",
        fontStyle: "700",
        color: "#ffd43f",
        stroke: "#123044",
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    this.duck = this.add.image(GAME_WIDTH / 2, 520, "duck").setScale(0.82);
    this.tweens.add({
      targets: this.duck,
      y: 500,
      angle: -4,
      yoyo: true,
      repeat: -1,
      duration: 850,
      ease: "Sine.inOut",
    });

    const startButton = makeButton(this, GAME_WIDTH / 2, 622, "START");
    startButton.on("pointerdown", () => this.scene.start("GameScene"));

    this.add
      .text(GAME_WIDTH / 2, 678, "Leertaste / Klick / Tap = Springen  |  Pfeil runter / Swipe = Tauchen  |  ESC = Pause", {
        fontFamily: "Trebuchet MS",
        fontSize: "20px",
        fontStyle: "700",
        color: "#eaffff",
        stroke: "#123044",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.input.keyboard.once("keydown-SPACE", () => this.scene.start("GameScene"));
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.stats = readStats();
    this.score = 0;
    this.pearls = 0;
    this.lastMilestone = 0;
    this.speed = 360;
    this.spawnDelay = 1450;
    this.collectDelay = 1150;
    this.isGameOver = false;
    this.isPaused = false;
    this.touchStartY = 0;

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
  }

  createWorld() {
    this.obstacles = this.physics.add.group({ allowGravity: false, immovable: true });
    this.collectibles = this.physics.add.group({ allowGravity: false });

    this.duck = this.physics.add.sprite(220, WATERLINE - 80, "duck");
    this.duck.setScale(0.52);
    this.duck.body.setSize(145, 116);
    this.duck.body.setOffset(45, 82);
    this.duck.setCollideWorldBounds(true);
    this.duck.setGravityY(1320);
    this.duck.setDepth(8);

    this.ground = this.add.rectangle(GAME_WIDTH / 2, WATERLINE + 78, GAME_WIDTH, 24, 0x21a8c9, 0);
    this.physics.add.existing(this.ground, true);
    this.physics.add.collider(this.duck, this.ground);
    this.physics.add.overlap(this.duck, this.obstacles, this.handleHit, null, this);
    this.physics.add.overlap(this.duck, this.collectibles, this.collectPearl, null, this);

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
      y: WATERLINE - 92,
      yoyo: true,
      repeat: -1,
      duration: 1050,
      ease: "Sine.inOut",
    });
  }

  createHud() {
    const panel = this.add.graphics();
    panel.fillStyle(0x062941, 0.54);
    panel.fillRoundedRect(24, 22, 310, 102, 18);
    panel.lineStyle(2, 0x71f1ff, 0.34);
    panel.strokeRoundedRect(24, 22, 310, 102, 18);

    this.scoreText = this.add.text(48, 38, "0", hudTextStyle(34, "#ffffff"));
    this.pearlText = this.add.text(50, 82, "Perlen 0", hudTextStyle(24, "#ffd43f"));

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
    this.input.keyboard.on("keydown-SPACE", () => this.jump());
    this.input.keyboard.on("keydown-UP", () => this.jump());
    this.input.keyboard.on("keydown-DOWN", () => this.dive());
    this.input.keyboard.on("keydown-ESC", () => this.togglePause());

    this.input.on("pointerdown", (pointer) => {
      this.touchStartY = pointer.y;
      this.jump();
    });

    this.input.on("pointerup", (pointer) => {
      if (pointer.y - this.touchStartY > 60) {
        this.dive();
      }
    });
  }

  update(_, delta) {
    if (this.isGameOver || this.isPaused) {
      return;
    }

    const deltaSeconds = delta / 1000;
    this.score += deltaSeconds * 12;
    this.speed = 360 + Math.min(380, this.score * 0.42);

    if (this.spawnObstacleEvent.delay > 820) {
      this.spawnObstacleEvent.delay = Math.max(820, this.spawnDelay - this.score * 1.4);
    }

    this.scoreText.setText(Math.floor(this.score).toLocaleString("de-DE"));
    this.pearlText.setText(`Perlen ${this.pearls}`);
    this.duck.setAngle(Phaser.Math.Clamp(this.duck.body.velocity.y / 34, -14, 18));

    if (this.score >= this.lastMilestone + 500) {
      this.lastMilestone += 500;
      this.showQuip();
    }

    this.children.each((child) => {
      if (child.active && child.x < -180 && child.getData("cleanup")) {
        child.destroy();
      }
    });
  }

  jump() {
    if (this.isGameOver || this.isPaused) {
      return;
    }

    if (this.duck.body.blocked.down || this.duck.y > WATERLINE - 118) {
      this.duck.setVelocityY(-640);
      this.splash(this.duck.x - 48, this.duck.y + 42);
    }
  }

  dive() {
    if (this.isGameOver || this.isPaused) {
      return;
    }

    this.duck.setVelocityY(760);
    this.duck.setAngle(18);
  }

  spawnObstacle() {
    if (this.isGameOver || this.isPaused) {
      return;
    }

    const options = [
      { key: "soap", y: WATERLINE - 50, scale: 0.68, score: 18, body: [170, 74, 42, 34] },
      { key: "toothbrush", y: WATERLINE - 80, scale: 0.55, score: 32, body: [245, 66, 48, 92] },
      { key: "whirlpool", y: WATERLINE - 42, scale: 0.62, score: 44, body: [220, 98, 50, 60] },
    ];
    const allowed = this.score < 260 ? options.slice(0, 2) : options;
    const pick = Phaser.Utils.Array.GetRandom(allowed);
    const obstacle = this.obstacles.create(GAME_WIDTH + 120, pick.y, pick.key);

    obstacle.setScale(pick.scale);
    obstacle.body.setSize(pick.body[0], pick.body[1]);
    obstacle.body.setOffset(pick.body[2], pick.body[3]);
    obstacle.setVelocityX(-this.speed - pick.score);
    obstacle.setDepth(7);
    obstacle.setData("cleanup", true);

    this.tweens.add({
      targets: obstacle,
      y: pick.y + 8,
      yoyo: true,
      repeat: -1,
      duration: 620,
      ease: "Sine.inOut",
    });
  }

  spawnCollectible() {
    if (this.isGameOver || this.isPaused) {
      return;
    }

    const roll = Phaser.Math.Between(1, 100);
    const key = roll > 84 ? "pearlGold" : roll > 48 ? "pearlBlue" : "pearlPink";
    const value = key === "pearlGold" ? 50 : 10;
    const pearl = this.collectibles.create(GAME_WIDTH + 100, Phaser.Math.Between(260, 475), key);

    pearl.setScale(key === "pearlGold" ? 0.62 : 0.56);
    pearl.body.setCircle(38);
    pearl.setVelocityX(-this.speed * 0.88);
    pearl.setDepth(6);
    pearl.setData("value", value);
    pearl.setData("cleanup", true);

    this.tweens.add({
      targets: pearl,
      y: pearl.y - 20,
      angle: 360,
      yoyo: true,
      repeat: -1,
      duration: 950,
      ease: "Sine.inOut",
    });
  }

  collectPearl(_, pearl) {
    this.score += pearl.getData("value");
    this.pearls += 1;
    this.splash(pearl.x, pearl.y);
    this.tweens.add({
      targets: pearl,
      scale: pearl.scale * 1.8,
      alpha: 0,
      duration: 170,
      onComplete: () => pearl.destroy(),
    });
  }

  handleHit() {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;
    this.physics.pause();
    this.cameras.main.shake(220, 0.012);
    this.duck.setTint(0xff6f59);
    this.duck.setAngle(-22);
    this.saveAndShowGameOver();
  }

  saveAndShowGameOver() {
    const finalScore = Math.floor(this.score);
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
    card.fillRoundedRect(390, 160, 500, 380, 24);
    card.lineStyle(4, 0x69e8ff, 0.55);
    card.strokeRoundedRect(390, 160, 500, 380, 24);

    this.add.text(GAME_WIDTH / 2, 220, "GAME OVER", titleStyle(50, "#ff70ad")).setOrigin(0.5).setDepth(32);
    this.add.text(GAME_WIDTH / 2, 306, `${finalScore.toLocaleString("de-DE")}`, titleStyle(72, "#ffffff")).setOrigin(0.5).setDepth(32);
    this.add
      .text(
        GAME_WIDTH / 2,
        374,
        finalScore >= this.stats.highscore ? "NEUER HIGHSCORE!" : `Highscore ${nextStats.highscore.toLocaleString("de-DE")}`,
        hudTextStyle(26, "#ffd43f"),
      )
      .setOrigin(0.5)
      .setDepth(32);

    const again = makeButton(this, GAME_WIDTH / 2, 470, "NOCHMAL");
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
  wave.lineStyle(4, 0xa4fbff, 0.42);

  for (let x = -80; x < GAME_WIDTH + 120; x += 130) {
    wave.beginPath();
    wave.arc(x, WATERLINE - 8, 70, Phaser.Math.DegToRad(8), Phaser.Math.DegToRad(172), false);
    wave.strokePath();
  }
}

function makeButton(scene, x, y, label) {
  const container = scene.add.container(x, y);
  const bg = scene.add.graphics();
  bg.fillStyle(0xffc51f, 1);
  bg.fillRoundedRect(-118, -34, 236, 68, 18);
  bg.lineStyle(4, 0xffffff, 0.42);
  bg.strokeRoundedRect(-118, -34, 236, 68, 18);

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
  container.setSize(236, 68);
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
