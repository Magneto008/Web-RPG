import Phaser from "phaser";
import { ASSETS } from "../assets/AssetLoader";
import {
  PLAYER_ANIMATION_KEYS,
  PLAYER_ANIMATION_FRAMES,
} from "../assets/configs/PlayerAnimationConfigs";

export function createPlayerAnimations(scene: Phaser.Scene) {
  if (scene.anims.exists(PLAYER_ANIMATION_KEYS.IDLE_RIGHT)) return;

  const create = (key: string, frames: any, rate: number) => {
    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNumbers(frames.sheet, frames.config),
      frameRate: rate,
      repeat: -1,
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

  scene.anims.create({
    key: PLAYER_ANIMATION_KEYS.HURT,
    frames: scene.anims.generateFrameNumbers(ASSETS.PLAYER_HURT, PLAYER_ANIMATION_FRAMES.hurt),
    frameRate: 10,
    repeat: 0,
  });
}
