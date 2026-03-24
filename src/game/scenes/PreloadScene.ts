import Phaser from "phaser";
import { preloadAssets } from "../assets/AssetLoader";
import { registerRoguelikeItemTextures } from "../assets/registerRoguelikeItemTextures";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload(): void {
    preloadAssets(this);
  }

  create(): void {
    registerRoguelikeItemTextures(this);
    this.scene.start("TitleScene");
  }
}
