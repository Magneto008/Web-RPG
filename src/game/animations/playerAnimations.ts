import Phaser from "phaser";
import { ASSETS } from "../assets/AssetLoader";
import {
  PLAYER_ANIMATION_KEYS,
  PLAYER_ANIMATION_FRAMES,
} from "../assets/configs/PlayerAnimationConfigs";

export function createPlayerAnimations(scene: Phaser.Scene) {
  if (scene.anims.exists(PLAYER_ANIMATION_KEYS.IDLE_RIGHT)) return;

  const create = (key: string, frames: any, rate: number, repeat: number = -1) => {
    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNumbers(frames.sheet, frames.config),
      frameRate: rate,
      repeat: repeat,
    });
  };

  create(
    PLAYER_ANIMATION_KEYS.IDLE_UP,
    { sheet: ASSETS.PLAYER_IDLE, config: PLAYER_ANIMATION_FRAMES.idle.up },
    2,
  );
  create(
    PLAYER_ANIMATION_KEYS.IDLE_DOWN,
    { sheet: ASSETS.PLAYER_IDLE, config: PLAYER_ANIMATION_FRAMES.idle.down },
    2,
  );
  create(
    PLAYER_ANIMATION_KEYS.IDLE_LEFT,
    { sheet: ASSETS.PLAYER_IDLE, config: PLAYER_ANIMATION_FRAMES.idle.left },
    2,
  );
  create(
    PLAYER_ANIMATION_KEYS.IDLE_RIGHT,
    { sheet: ASSETS.PLAYER_IDLE, config: PLAYER_ANIMATION_FRAMES.idle.right },
    2,
  );

  create(
    PLAYER_ANIMATION_KEYS.WALK_UP,
    { sheet: ASSETS.PLAYER_WALK, config: PLAYER_ANIMATION_FRAMES.walk.up },
    10,
  );
  create(
    PLAYER_ANIMATION_KEYS.WALK_DOWN,
    { sheet: ASSETS.PLAYER_WALK, config: PLAYER_ANIMATION_FRAMES.walk.down },
    10,
  );
  create(
    PLAYER_ANIMATION_KEYS.WALK_LEFT,
    { sheet: ASSETS.PLAYER_WALK, config: PLAYER_ANIMATION_FRAMES.walk.left },
    10,
  );
  create(
    PLAYER_ANIMATION_KEYS.WALK_RIGHT,
    { sheet: ASSETS.PLAYER_WALK, config: PLAYER_ANIMATION_FRAMES.walk.right },
    10,
  );

  create(
    PLAYER_ANIMATION_KEYS.RUN_UP,
    { sheet: ASSETS.PLAYER_RUN, config: PLAYER_ANIMATION_FRAMES.run.up },
    14,
  );
  create(
    PLAYER_ANIMATION_KEYS.RUN_DOWN,
    { sheet: ASSETS.PLAYER_RUN, config: PLAYER_ANIMATION_FRAMES.run.down },
    14,
  );
  create(
    PLAYER_ANIMATION_KEYS.RUN_LEFT,
    { sheet: ASSETS.PLAYER_RUN, config: PLAYER_ANIMATION_FRAMES.run.left },
    14,
  );
  create(
    PLAYER_ANIMATION_KEYS.RUN_RIGHT,
    { sheet: ASSETS.PLAYER_RUN, config: PLAYER_ANIMATION_FRAMES.run.right },
    14,
  );
  
  create(
    PLAYER_ANIMATION_KEYS.SPELL_UP,
    { sheet: ASSETS.PLAYER_SPELLCAST, config: PLAYER_ANIMATION_FRAMES.spellcast.up },
    10,
    0
  );
  create(
    PLAYER_ANIMATION_KEYS.SPELL_DOWN,
    { sheet: ASSETS.PLAYER_SPELLCAST, config: PLAYER_ANIMATION_FRAMES.spellcast.down },
    10,
    0
  );
  create(
    PLAYER_ANIMATION_KEYS.SPELL_LEFT,
    { sheet: ASSETS.PLAYER_SPELLCAST, config: PLAYER_ANIMATION_FRAMES.spellcast.left },
    10,
    0
  );
  create(
    PLAYER_ANIMATION_KEYS.SPELL_RIGHT,
    { sheet: ASSETS.PLAYER_SPELLCAST, config: PLAYER_ANIMATION_FRAMES.spellcast.right },
    10,
    0
  );

  create(
    PLAYER_ANIMATION_KEYS.THRUST_UP,
    { sheet: ASSETS.PLAYER_THRUST, config: PLAYER_ANIMATION_FRAMES.thrust.up },
    12,
    0
  );
  create(
    PLAYER_ANIMATION_KEYS.THRUST_DOWN,
    { sheet: ASSETS.PLAYER_THRUST, config: PLAYER_ANIMATION_FRAMES.thrust.down },
    12,
    0
  );
  create(
    PLAYER_ANIMATION_KEYS.THRUST_LEFT,
    { sheet: ASSETS.PLAYER_THRUST, config: PLAYER_ANIMATION_FRAMES.thrust.left },
    12,
    0
  );
  create(
    PLAYER_ANIMATION_KEYS.THRUST_RIGHT,
    { sheet: ASSETS.PLAYER_THRUST, config: PLAYER_ANIMATION_FRAMES.thrust.right },
    12,
    0
  );

  // Sword Slash Effects (192x192)
  create(
    PLAYER_ANIMATION_KEYS.SWORD_SLASH_UP,
    { sheet: ASSETS.SWORD_SLASH, config: { start: 0, end: 5 } },
    15,
    0
  );
  create(
    PLAYER_ANIMATION_KEYS.SWORD_SLASH_LEFT,
    { sheet: ASSETS.SWORD_SLASH, config: { start: 6, end: 11 } },
    15,
    0
  );
  create(
    PLAYER_ANIMATION_KEYS.SWORD_SLASH_DOWN,
    { sheet: ASSETS.SWORD_SLASH, config: { start: 12, end: 17 } },
    15,
    0
  );
  create(
    PLAYER_ANIMATION_KEYS.SWORD_SLASH_RIGHT,
    { sheet: ASSETS.SWORD_SLASH, config: { start: 18, end: 23 } },
    15,
    0
  );

  scene.anims.create({
    key: PLAYER_ANIMATION_KEYS.HURT,
    frames: scene.anims.generateFrameNumbers(ASSETS.PLAYER_HURT, PLAYER_ANIMATION_FRAMES.hurt),
    frameRate: 10,
    repeat: 0,
  });
}
