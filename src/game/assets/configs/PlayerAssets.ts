import { AssetConfig } from "../types";

export const PLAYER_ASSET_KEYS = {
  PLAYER_IDLE: "player-idle",
  PLAYER_WALK: "player-walk",
  PLAYER_RUN: "player-run",
  PLAYER_HURT: "player-hurt",
  PLAYER_SPELLCAST: "player-spellcast",
  PLAYER_THRUST: "player-thrust",
  SWORD_SLASH: "sword-slash",
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
  spellcastFramesPerRow: 5,
  thrustFramesPerRow: 6,
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
  {
    key: PLAYER_ASSET_KEYS.PLAYER_SPELLCAST,
    type: "spritesheet",
    path: "/assets/player/fireball-cast.png",
    frameWidth: PLAYER_SPRITE_CONFIG.frameWidth,
    frameHeight: PLAYER_SPRITE_CONFIG.frameHeight,
  },
  {
    key: PLAYER_ASSET_KEYS.PLAYER_THRUST,
    type: "spritesheet",
    path: "/assets/player/slash.png",
    frameWidth: PLAYER_SPRITE_CONFIG.frameWidth,
    frameHeight: PLAYER_SPRITE_CONFIG.frameHeight,
  },
  {
    key: PLAYER_ASSET_KEYS.SWORD_SLASH,
    type: "spritesheet",
    path: "/assets/player/weapons/glowsword_red_male.png",
    frameWidth: 192,
    frameHeight: 192,
  },
];
