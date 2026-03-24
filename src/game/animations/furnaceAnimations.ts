import Phaser from "phaser";
import { ASSETS } from "../assets/AssetLoader";

export const FURNACE_ANIMATION_KEYS = {
  IDLE: "furnace_idle",
  SMELTING: "furnace_smelting",
} as const;

export function createFurnaceAnimations(scene: Phaser.Scene): void {
  if (!scene.anims.exists(FURNACE_ANIMATION_KEYS.IDLE)) {
    scene.anims.create({
      key: FURNACE_ANIMATION_KEYS.IDLE,
      frames: scene.anims.generateFrameNumbers(ASSETS.FURNACE, { frames: [0] }),
      frameRate: 1,
      repeat: -1,
    });
  }

  if (!scene.anims.exists(FURNACE_ANIMATION_KEYS.SMELTING)) {
    scene.anims.create({
      key: FURNACE_ANIMATION_KEYS.SMELTING,
      frames: scene.anims.generateFrameNumbers(ASSETS.FURNACE, { start: 1, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });
  }
}
