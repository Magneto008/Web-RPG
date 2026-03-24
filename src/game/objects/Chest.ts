import Phaser from "phaser";
import { ASSETS } from "../assets/AssetLoader";
import { LootSystem } from "../systems/LootSystem";

interface ChestConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  itemsGroup: Phaser.Physics.Arcade.Group;
}

export class Chest extends Phaser.Physics.Arcade.Sprite {
  private isOpened = false;
  private readonly itemsGroup: Phaser.Physics.Arcade.Group;

  constructor(config: ChestConfig) {
    super(config.scene, config.x, config.y, ASSETS.CHEST, 0);
    this.itemsGroup = config.itemsGroup;

    config.scene.add.existing(this);
    config.scene.physics.add.existing(this, true);

    this.setOrigin(0.5, 0.5);
    this.setDepth(this.y);

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(26, 20);
    body.setOffset(3, 10);

    if (this.scene.anims.exists("chest_idle")) {
      this.play("chest_idle");
    }

    this.on("animationcomplete-chest_open", () => {
      if (this.scene.anims.exists("chest_opened")) {
        this.play("chest_opened");
      }
    });
  }

  open(): void {
    if (this.isOpened) {
      return;
    }

    this.isOpened = true;

    if (this.scene.anims.exists("chest_open")) {
      this.play("chest_open");
      this.once("animationcomplete-chest_open", () => {
        LootSystem.dropLoot(this.scene, this.x, this.y, this.itemsGroup);
      });
      return;
    }

    LootSystem.dropLoot(this.scene, this.x, this.y, this.itemsGroup);
  }

  getIsOpened(): boolean {
    return this.isOpened;
  }

  initOpenedState(): void {
    this.isOpened = true;
    if (this.scene.anims.exists("chest_opened")) {
      this.play("chest_opened");
      return;
    }

    this.setFrame(36);
  }
}
