import Phaser from "phaser";
import { ASSETS } from "../assets/AssetLoader";

export const ENEMY_ANIMATION_KEYS = {
  GOLEM_WALK_UP: "golem-walk-up",
  GOLEM_WALK_LEFT: "golem-walk-left",
  GOLEM_WALK_DOWN: "golem-walk-down",
  GOLEM_WALK_RIGHT: "golem-walk-right",
  GOLEM_ATTACK_UP: "golem-attack-up",
  GOLEM_ATTACK_LEFT: "golem-attack-left",
  GOLEM_ATTACK_DOWN: "golem-attack-down",
  GOLEM_ATTACK_RIGHT: "golem-attack-right",
  GOLEM_DIE: "golem-die",
} as const;

function rowFrames(row: number): Phaser.Types.Animations.GenerateFrameNumbers {
  const start = row * 7;
  return { start, end: start + 6 };
}

export function createEnemyAnimations(scene: Phaser.Scene): void {
  const create = (
    key: string,
    texture: string,
    row: number,
    frameRate: number,
    repeat: number,
  ): void => {
    if (scene.anims.exists(key)) {
      return;
    }

    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNumbers(texture, rowFrames(row)),
      frameRate,
      repeat,
    });
  };

  create(ENEMY_ANIMATION_KEYS.GOLEM_WALK_UP, ASSETS.GOLEM_WALK, 0, 8, -1);
  create(ENEMY_ANIMATION_KEYS.GOLEM_WALK_LEFT, ASSETS.GOLEM_WALK, 1, 8, -1);
  create(ENEMY_ANIMATION_KEYS.GOLEM_WALK_DOWN, ASSETS.GOLEM_WALK, 2, 8, -1);
  create(ENEMY_ANIMATION_KEYS.GOLEM_WALK_RIGHT, ASSETS.GOLEM_WALK, 3, 8, -1);

  create(ENEMY_ANIMATION_KEYS.GOLEM_ATTACK_UP, ASSETS.GOLEM_ATTACK, 0, 10, 0);
  create(ENEMY_ANIMATION_KEYS.GOLEM_ATTACK_LEFT, ASSETS.GOLEM_ATTACK, 1, 10, 0);
  create(ENEMY_ANIMATION_KEYS.GOLEM_ATTACK_DOWN, ASSETS.GOLEM_ATTACK, 2, 10, 0);
  create(ENEMY_ANIMATION_KEYS.GOLEM_ATTACK_RIGHT, ASSETS.GOLEM_ATTACK, 3, 10, 0);

  if (!scene.anims.exists(ENEMY_ANIMATION_KEYS.GOLEM_DIE)) {
    scene.anims.create({
      key: ENEMY_ANIMATION_KEYS.GOLEM_DIE,
      frames: scene.anims.generateFrameNumbers(ASSETS.GOLEM_DIE, rowFrames(0)),
      frameRate: 10,
      repeat: 0,
    });
  }
}
