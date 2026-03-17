import { AssetConfig } from "../types";

export const PLAYER_ASSET_KEYS = {
  PLAYER_IDLE: "player-idle",
  PLAYER_WALK: "player-walk",
  PLAYER_RUN: "player-run",
  PLAYER_HURT: "player-hurt",
} as const;

export const PLAYER_ANIMATION_KEYS = {
  IDLE_UP: "idle-up",
  IDLE_DOWN: "idle-down",
  IDLE_LEFT: "idle-left",
  IDLE_RIGHT: "idle-right",
  WALK_UP: "walk-up",
  WALK_DOWN: "walk-down",
  WALK_LEFT: "walk-left",
  WALK_RIGHT: "walk-right",
  RUN_UP: "run-up",
  RUN_DOWN: "run-down",
  RUN_LEFT: "run-left",
  RUN_RIGHT: "run-right",
  HURT: "hurt",
} as const;

export const PLAYER_SPRITE_CONFIG = {
  frameWidth: 64,
  frameHeight: 64,
  directions: {
    up: 0,
    left: 1,
    down: 2,
    right: 3,
  },
  idleFramesPerRow: 2,
  walkFramesPerRow: 9,
  runFramesPerRow: 8,
} as const;

export const PLAYER_ANIMATION_FRAMES = {
  idle: {
    right: {
      start: PLAYER_SPRITE_CONFIG.directions.right * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.right * 13 +
        PLAYER_SPRITE_CONFIG.idleFramesPerRow -
        1,
    },
    up: {
      start: PLAYER_SPRITE_CONFIG.directions.up * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.up * 13 +
        PLAYER_SPRITE_CONFIG.idleFramesPerRow -
        1,
    },
    left: {
      start: PLAYER_SPRITE_CONFIG.directions.left * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.left * 13 +
        PLAYER_SPRITE_CONFIG.idleFramesPerRow -
        1,
    },
    down: {
      start: PLAYER_SPRITE_CONFIG.directions.down * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.down * 13 +
        PLAYER_SPRITE_CONFIG.idleFramesPerRow -
        1,
    },
  },
  walk: {
    right: {
      start: PLAYER_SPRITE_CONFIG.directions.right * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.right * 13 +
        PLAYER_SPRITE_CONFIG.walkFramesPerRow -
        1,
    },
    up: {
      start: PLAYER_SPRITE_CONFIG.directions.up * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.up * 13 +
        PLAYER_SPRITE_CONFIG.walkFramesPerRow -
        1,
    },
    left: {
      start: PLAYER_SPRITE_CONFIG.directions.left * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.left * 13 +
        PLAYER_SPRITE_CONFIG.walkFramesPerRow -
        1,
    },
    down: {
      start: PLAYER_SPRITE_CONFIG.directions.down * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.down * 13 +
        PLAYER_SPRITE_CONFIG.walkFramesPerRow -
        1,
    },
  },
  run: {
    right: {
      start: PLAYER_SPRITE_CONFIG.directions.right * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.right * 13 +
        PLAYER_SPRITE_CONFIG.runFramesPerRow -
        1,
    },
    up: {
      start: PLAYER_SPRITE_CONFIG.directions.up * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.up * 13 +
        PLAYER_SPRITE_CONFIG.runFramesPerRow -
        1,
    },
    left: {
      start: PLAYER_SPRITE_CONFIG.directions.left * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.left * 13 +
        PLAYER_SPRITE_CONFIG.runFramesPerRow -
        1,
    },
    down: {
      start: PLAYER_SPRITE_CONFIG.directions.down * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.down * 13 +
        PLAYER_SPRITE_CONFIG.runFramesPerRow -
        1,
    },
  },
  hurt: {
    start: 0,
    end: 12,
  },
} as const;

export const PLAYER_ASSET_CONFIGS: AssetConfig[] = [
  {
    key: PLAYER_ASSET_KEYS.PLAYER_IDLE,
    type: "spritesheet",
    path: "/assets/player/idle.png",
    frameWidth: PLAYER_SPRITE_CONFIG.frameWidth,
    frameHeight: PLAYER_SPRITE_CONFIG.frameHeight,
  },
  {
    key: PLAYER_ASSET_KEYS.PLAYER_WALK,
    type: "spritesheet",
    path: "/assets/player/walk.png",
    frameWidth: PLAYER_SPRITE_CONFIG.frameWidth,
    frameHeight: PLAYER_SPRITE_CONFIG.frameHeight,
  },
  {
    key: PLAYER_ASSET_KEYS.PLAYER_RUN,
    type: "spritesheet",
    path: "/assets/player/run.png",
    frameWidth: PLAYER_SPRITE_CONFIG.frameWidth,
    frameHeight: PLAYER_SPRITE_CONFIG.frameHeight,
  },
  {
    key: PLAYER_ASSET_KEYS.PLAYER_HURT,
    type: "spritesheet",
    path: "/assets/player/hurt.png",
    frameWidth: PLAYER_SPRITE_CONFIG.frameWidth,
    frameHeight: PLAYER_SPRITE_CONFIG.frameHeight,
  },
];
