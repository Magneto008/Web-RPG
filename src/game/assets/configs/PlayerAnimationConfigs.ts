import { PLAYER_SPRITE_CONFIG } from "./PlayerAssets";

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
  SPELL_UP: "spell-up",
  SPELL_DOWN: "spell-down",
  SPELL_LEFT: "spell-left",
  SPELL_RIGHT: "spell-right",
  THRUST_UP: "thrust-up",
  THRUST_DOWN: "thrust-down",
  THRUST_LEFT: "thrust-left",
  THRUST_RIGHT: "thrust-right",
  SWORD_SLASH_UP: "sword-slash-up",
  SWORD_SLASH_DOWN: "sword-slash-down",
  SWORD_SLASH_LEFT: "sword-slash-left",
  SWORD_SLASH_RIGHT: "sword-slash-right",
} as const;

const getFrames = (direction: number, count: number) => ({
  start: direction * 13,
  end: direction * 13 + count - 1,
});

export const PLAYER_ANIMATION_FRAMES = {
  idle: {
    right: getFrames(PLAYER_SPRITE_CONFIG.directions.right, PLAYER_SPRITE_CONFIG.idleFramesPerRow),
    up: getFrames(PLAYER_SPRITE_CONFIG.directions.up, PLAYER_SPRITE_CONFIG.idleFramesPerRow),
    left: getFrames(PLAYER_SPRITE_CONFIG.directions.left, PLAYER_SPRITE_CONFIG.idleFramesPerRow),
    down: getFrames(PLAYER_SPRITE_CONFIG.directions.down, PLAYER_SPRITE_CONFIG.idleFramesPerRow),
  },
  walk: {
    right: getFrames(PLAYER_SPRITE_CONFIG.directions.right, PLAYER_SPRITE_CONFIG.walkFramesPerRow),
    up: getFrames(PLAYER_SPRITE_CONFIG.directions.up, PLAYER_SPRITE_CONFIG.walkFramesPerRow),
    left: getFrames(PLAYER_SPRITE_CONFIG.directions.left, PLAYER_SPRITE_CONFIG.walkFramesPerRow),
    down: getFrames(PLAYER_SPRITE_CONFIG.directions.down, PLAYER_SPRITE_CONFIG.walkFramesPerRow),
  },
  run: {
    right: getFrames(PLAYER_SPRITE_CONFIG.directions.right, PLAYER_SPRITE_CONFIG.runFramesPerRow),
    up: getFrames(PLAYER_SPRITE_CONFIG.directions.up, PLAYER_SPRITE_CONFIG.runFramesPerRow),
    left: getFrames(PLAYER_SPRITE_CONFIG.directions.left, PLAYER_SPRITE_CONFIG.runFramesPerRow),
    down: getFrames(PLAYER_SPRITE_CONFIG.directions.down, PLAYER_SPRITE_CONFIG.runFramesPerRow),
  },
  hurt: {
    start: 0,
    end: 12,
  },
  spellcast: {
    right: getFrames(PLAYER_SPRITE_CONFIG.directions.right, PLAYER_SPRITE_CONFIG.spellcastFramesPerRow),
    up: getFrames(PLAYER_SPRITE_CONFIG.directions.up, PLAYER_SPRITE_CONFIG.spellcastFramesPerRow),
    left: getFrames(PLAYER_SPRITE_CONFIG.directions.left, PLAYER_SPRITE_CONFIG.spellcastFramesPerRow),
    down: getFrames(PLAYER_SPRITE_CONFIG.directions.down, PLAYER_SPRITE_CONFIG.spellcastFramesPerRow),
  },
  thrust: {
    up: getFrames(PLAYER_SPRITE_CONFIG.directions.up, PLAYER_SPRITE_CONFIG.thrustFramesPerRow),
    left: getFrames(PLAYER_SPRITE_CONFIG.directions.left, PLAYER_SPRITE_CONFIG.thrustFramesPerRow),
    down: getFrames(PLAYER_SPRITE_CONFIG.directions.down, PLAYER_SPRITE_CONFIG.thrustFramesPerRow),
    right: getFrames(PLAYER_SPRITE_CONFIG.directions.right, PLAYER_SPRITE_CONFIG.thrustFramesPerRow),
  },
} as const;
