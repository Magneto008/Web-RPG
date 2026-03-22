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
  private isOpened: boolean = false;
  private itemsGroup: Phaser.Physics.Arcade.Group;

  constructor(config: ChestConfig) {
    super(config.scene, config.x, config.y, ASSETS.CHEST, 0);
    this.itemsGroup = config.itemsGroup;

    // Add to specific group and physics
    config.scene.add.existing(this);
    config.scene.physics.add.existing(this, true); // True means Static body

    // Set origin and body size matching Map assets logic
    this.setOrigin(0.5, 0.5);
    // Depth sorting so player can walk behind/in front of it depending on Y
    this.setDepth(this.y);

    const tileSize = 32;
    // Set collision area a bit smaller so player has to touch it closely
    // Or just make it 32x32 to match tile
    this.setSize(tileSize, tileSize);

    // Check if the chest animations exist; some maps might not have called it yet
    if (this.scene.anims.exists("chest_idle")) {
      this.play("chest_idle");
    }

    this.on("animationcomplete-chest_open", () => {
      if (this.scene.anims.exists("chest_opened")) {
        this.play("chest_opened");
      }
    });
  }

  public open(): void {
    if (this.isOpened) return;

    this.isOpened = true;

    if (this.scene.anims.exists("chest_open")) {
      this.play("chest_open");
      this.once("animationcomplete-chest_open", () => {
        LootSystem.dropLoot(this.scene, this.x, this.y, this.itemsGroup);
      });
    } else {
      LootSystem.dropLoot(this.scene, this.x, this.y, this.itemsGroup);
    }
  }

  public getIsOpened(): boolean {
    return this.isOpened;
  }

  public initOpenedState(): void {
    this.isOpened = true;
    if (this.scene.anims.exists("chest_opened")) {
      this.play("chest_opened");
    } else {
      this.setFrame(36);
    }
  }
}
