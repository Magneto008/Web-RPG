import Phaser from "phaser";
import { ASSETS } from "../assets/AssetLoader";

export function createChestAnimations(scene: Phaser.Scene): void {
  // Idle: Row 0, Cols 0-2 -> frames 0, 1, 2
  scene.anims.create({
    key: "chest_idle",
    frames: scene.anims.generateFrameNumbers(ASSETS.CHEST, { frames: [0, 1, 2] }),
    frameRate: 4,
    repeat: -1,
  });

  // Opening: Row 1, Cols 0-2 (12-14) & Row 2, Cols 0-2 (24-26)
  scene.anims.create({
    key: "chest_open",
    frames: scene.anims.generateFrameNumbers(ASSETS.CHEST, { frames: [12, 13, 14, 24, 25, 26] }),
    frameRate: 8,
    repeat: 0,
  });

  // Opened: Row 3, Cols 0-2 -> frames 36, 37, 38
  scene.anims.create({
    key: "chest_opened",
    frames: scene.anims.generateFrameNumbers(ASSETS.CHEST, { frames: [36, 37, 38] }),
    frameRate: 4,
    repeat: -1,
  });
}
