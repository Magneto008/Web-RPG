import Phaser from "phaser";
import { GameStore } from "../state/GameStore";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  init(): void {
    const existing = this.registry.get("gameStore") as GameStore | undefined;
    if (!existing) {
      this.registry.set("gameStore", new GameStore(this.game));
    }
  }

  create(): void {
    this.scene.start("PreloadScene");
  }
}
