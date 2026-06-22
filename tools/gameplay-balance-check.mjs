#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = dirname(dirname(fileURLToPath(import.meta.url)));
const gameSource = readFileSync(join(ROOT_DIR, "game.js"), "utf8");

const GAME_WIDTH = 1280;
const DUCK_HOME_X = 220;
const WATER_SURFACE_Y = 456;
const WATERLINE = 500;
const STOMP_MIN_VELOCITY_Y = -180;
const DIVE_CHALLENGE_X_OFFSET = 26;

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
      { mode: "underwater", sequence: "stay_up_surface_line" },
      { mode: "jump", sequence: "jump_collect_arc" },
      { mode: "stomp", sequence: "stomp_bounce_reward" },
    ],
    [
      { mode: "stomp", sequence: "stomp_bounce_reward" },
      { mode: "jump", sequence: "jump_collect_arc" },
      { mode: "dive", sequence: "dive_pearl_tunnel" },
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

const obstacleOptions = [
  { key: "soapV2", mode: "jump", speedBoost: 10, gap: 470, body: [170, 96, 45, 20] },
  { key: "soapV2Stack", mode: "jump", speedBoost: 14, gap: 540, body: [164, 110, 60, 22] },
  { key: "cupBrushV2", mode: "dive", speedBoost: 16, gap: 570, body: [150, 102, 40, 56] },
  { key: "toothbrush", mode: "dive", speedBoost: 10, gap: 610, body: [158, 66, 96, 44] },
  { key: "foamgate", mode: "dive", speedBoost: 12, gap: 610, body: [840, 104, -360, 54] },
  { key: "obstacleSponge", mode: "stomp", speedBoost: 22, gap: 560, body: [208, 76, 76, 158] },
  { key: "obstacleDuckRing", mode: "stomp", speedBoost: 24, gap: 590, body: [214, 72, 72, 158] },
  { key: "underwaterCap", mode: "underwater", speedBoost: 12, gap: 580, body: [253, 131, 185, 228] },
  { key: "drainPlug", mode: "underwater", speedBoost: 18, gap: 630, body: [276, 148, 184, 232] },
];

const rewardTrails = {
  dive_intro: [
    { y: WATER_SURFACE_Y + 72, underwater: true },
    { y: WATER_SURFACE_Y + 96, underwater: true },
    { y: WATER_SURFACE_Y + 104, underwater: true },
  ],
  dive_pearl_tunnel: [
    { y: WATER_SURFACE_Y + 70, underwater: true },
    { y: WATER_SURFACE_Y + 98, underwater: true },
    { y: WATER_SURFACE_Y + 118, underwater: true },
    { y: WATER_SURFACE_Y + 108, underwater: true },
    { y: WATER_SURFACE_Y + 82, underwater: true },
  ],
  jump_intro: [
    { y: WATER_SURFACE_Y - 54 },
    { y: WATER_SURFACE_Y - 102 },
    { y: WATER_SURFACE_Y - 92 },
  ],
  jump_collect_arc: [
    { y: WATER_SURFACE_Y - 42 },
    { y: WATER_SURFACE_Y - 94 },
    { y: WATER_SURFACE_Y - 134 },
    { y: WATER_SURFACE_Y - 96 },
    { y: WATER_SURFACE_Y - 44 },
  ],
  stomp_bounce_reward: [
    { y: WATER_SURFACE_Y - 112 },
    { y: WATER_SURFACE_Y - 76 },
    { y: WATER_SURFACE_Y - 42 },
    { y: WATER_SURFACE_Y - 18 },
  ],
  stay_up_surface_line: [
    { y: WATER_SURFACE_Y - 72 },
    { y: WATER_SURFACE_Y - 58 },
    { y: WATER_SURFACE_Y - 44 },
    { y: WATER_SURFACE_Y - 30 },
  ],
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertGameSourceIncludes(snippet, message) {
  assert(gameSource.includes(snippet), `${message}: missing snippet "${snippet}"`);
}

function sequencePoolForTime(runTime) {
  if (runTime < 18) return OBSTACLE_SEQUENCES.early;
  if (runTime < 34) return OBSTACLE_SEQUENCES.mid;
  return OBSTACLE_SEQUENCES.later;
}

function allowedOptionsForTime(runTime) {
  if (runTime < 10) return obstacleOptions.slice(0, 3);
  if (runTime < 28) return obstacleOptions.slice(0, 6);
  return obstacleOptions;
}

function getObstacleDelay(runTime) {
  if (runTime > 95) return 920;
  if (runTime > 55) return 1020;
  if (runTime > 25) return 1120;
  return 1220;
}

function testSequencePoolsMatchAvailableObstacles() {
  for (const runTime of [0, 12, 20, 32, 40, 70, 110]) {
    const allowedModes = new Set(allowedOptionsForTime(runTime).map((option) => option.mode));
    const pool = sequencePoolForTime(runTime);
    for (const sequence of pool.flat()) {
      assert(
        allowedModes.has(sequence.mode),
        `At ${runTime}s sequence mode "${sequence.mode}" has no available obstacle`,
      );
    }
  }
}

function testHarnessMatchesGameSource() {
  assertGameSourceIncludes("const STOMP_MIN_VELOCITY_Y = -180;", "Stomp velocity fixture is out of sync");
  assertGameSourceIncludes("if (obstacle.x > this.duck.x + 26)", "Dive challenge offset fixture is out of sync");
  assertGameSourceIncludes("key: \"cupBrushV2\"", "Cup brush dive obstacle missing from game source");
  assertGameSourceIncludes("key: \"toothbrush\"", "Toothbrush dive obstacle missing from game source");
  assertGameSourceIncludes("body: [158, 66, 96, 44]", "Toothbrush hitbox fixture is out of sync");
  assertGameSourceIncludes("gap: 610", "Toothbrush gap fixture is out of sync");
  assertGameSourceIncludes("mid: [", "Mid-game sequence pool missing from game source");
  assertGameSourceIncludes("sequence: \"stay_up_surface_line\"", "Stay-up sequence missing from game source");
}

function testDifficultyIntroductions() {
  const earlyModes = new Set(OBSTACLE_SEQUENCES.early.flat().map((entry) => entry.mode));
  const midModes = new Set(OBSTACLE_SEQUENCES.mid.flat().map((entry) => entry.mode));
  const laterModes = new Set(OBSTACLE_SEQUENCES.later.flat().map((entry) => entry.mode));

  assert(earlyModes.has("jump") && earlyModes.has("dive"), "Early phase must introduce jump and dive");
  assert(!earlyModes.has("stomp"), "Stomp must not appear before the learning phase");
  assert(midModes.has("stomp"), "Mid phase must introduce stomp before 34s");
  assert(!midModes.has("underwater"), "Underwater hazards must not appear in mid phase");
  assert(laterModes.has("underwater"), "Later phase must include underwater stay-up hazards");
}

function testDiveFairness() {
  const firstDive = allowedOptionsForTime(0).find((option) => option.mode === "dive");
  const toothbrush = obstacleOptions.find((option) => option.key === "toothbrush");

  assert(firstDive.key === "cupBrushV2", "First dive lesson should use cupBrushV2, not the harder toothbrush");
  assert(toothbrush.speedBoost <= 12, "Toothbrush speedBoost should stay fair");
  assert(toothbrush.gap >= 600, "Toothbrush gap should give enough recovery time");
  assert(toothbrush.body[0] <= 170, "Toothbrush hitbox width is too punishing");
  assert(DIVE_CHALLENGE_X_OFFSET <= 30, "Dive challenge should not resolve too early");
}

function testStompFairness() {
  assert(STOMP_MIN_VELOCITY_Y <= -160, "Stomp should tolerate near-apex jumps");
  const stompOptions = obstacleOptions.filter((option) => option.mode === "stomp");
  assert(stompOptions.length >= 2, "Stomp needs at least two readable obstacle variants");
  for (const option of stompOptions) {
    assert(option.gap >= 550, `${option.key} stomp gap too tight`);
  }
}

function testRewardTrailsExplainActions() {
  for (const [name, trail] of Object.entries(rewardTrails)) {
    assert(trail.length >= 3, `${name} needs at least three pearls to read as a lane`);
  }

  for (const name of ["dive_intro", "dive_pearl_tunnel"]) {
    assert(rewardTrails[name].every((point) => point.underwater), `${name} must only reward dive lane`);
  }

  for (const name of ["jump_intro", "jump_collect_arc", "stomp_bounce_reward", "stay_up_surface_line"]) {
    assert(rewardTrails[name].every((point) => !point.underwater), `${name} must not lure player underwater`);
  }

  assert(
    rewardTrails.stay_up_surface_line.every((point) => point.y < WATER_SURFACE_Y),
    "Stay-up rewards must stay above the water surface",
  );
}

function simulateNinetySeconds() {
  let runTime = 0;
  const events = [];
  const patternIndex = { early: 0, mid: 0, later: 0 };
  const cursor = { early: [], mid: [], later: [] };

  while (runTime < 90) {
    const poolName = runTime < 18 ? "early" : runTime < 34 ? "mid" : "later";
    if (cursor[poolName].length === 0) {
      const pattern = OBSTACLE_SEQUENCES[poolName][patternIndex[poolName] % OBSTACLE_SEQUENCES[poolName].length];
      patternIndex[poolName] += 1;
      cursor[poolName] = pattern.slice();
    }

    const desired = cursor[poolName].shift();
    const option = allowedOptionsForTime(runTime).find((candidate) => candidate.mode === desired.mode);
    assert(option, `No obstacle available for ${desired.mode} at ${runTime.toFixed(1)}s`);
    events.push({ time: runTime, poolName, ...desired, key: option.key });
    runTime += getObstacleDelay(runTime) / 1000;
  }

  return events;
}

function testSimulatedRun() {
  const events = simulateNinetySeconds();
  assert(events.length >= 75, "90s run should contain enough obstacle decisions");
  assert(events.some((event) => event.mode === "stomp" && event.time < 34), "Stomp should appear before 34s");
  assert(!events.some((event) => event.mode === "underwater" && event.time < 34), "Underwater should not appear before 34s");

  const firstDive = events.find((event) => event.mode === "dive");
  assert(firstDive?.key === "cupBrushV2", "First simulated dive must use cupBrushV2");

  const firstUnderwater = events.find((event) => event.mode === "underwater");
  assert(firstUnderwater?.time >= 34, "First underwater hazard is too early");
}

function main() {
  const tests = [
    testHarnessMatchesGameSource,
    testSequencePoolsMatchAvailableObstacles,
    testDifficultyIntroductions,
    testDiveFairness,
    testStompFairness,
    testRewardTrailsExplainActions,
    testSimulatedRun,
  ];

  for (const test of tests) {
    test();
  }

  console.log(`Gameplay balance checks passed (${tests.length} suites).`);
  console.log(`Simulated first obstacle starts at x=${GAME_WIDTH + 120}; duck home x=${DUCK_HOME_X}.`);
}

main();
