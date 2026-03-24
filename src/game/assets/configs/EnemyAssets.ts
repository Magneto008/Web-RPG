import { AssetConfig } from "../types";

export const ENEMY_ASSET_KEYS = {
  GOLEM_WALK: "enemy-golem-walk",
  GOLEM_ATTACK: "enemy-golem-attack",
  GOLEM_DIE: "enemy-golem-die",
} as const;

const GOLEM_FRAME_WIDTH = 64;
const GOLEM_WALK_FRAME_HEIGHT = 64;
const GOLEM_ATTACK_FRAME_HEIGHT = 96;
const GOLEM_DIE_FRAME_HEIGHT = 64;

export const ENEMY_ASSET_CONFIGS: AssetConfig[] = [
  {
    key: ENEMY_ASSET_KEYS.GOLEM_WALK,
    type: "spritesheet",
    path: "/assets/enemies/golem/golem-walk.png",
    frameWidth: GOLEM_FRAME_WIDTH,
    frameHeight: GOLEM_WALK_FRAME_HEIGHT,
  },
  {
    key: ENEMY_ASSET_KEYS.GOLEM_ATTACK,
    type: "spritesheet",
    path: "/assets/enemies/golem/golem-atk.png",
    frameWidth: GOLEM_FRAME_WIDTH,
    frameHeight: GOLEM_ATTACK_FRAME_HEIGHT,
  },
  {
    key: ENEMY_ASSET_KEYS.GOLEM_DIE,
    type: "spritesheet",
    path: "/assets/enemies/golem/golem-die.png",
    frameWidth: GOLEM_FRAME_WIDTH,
    frameHeight: GOLEM_DIE_FRAME_HEIGHT,
  },
];
