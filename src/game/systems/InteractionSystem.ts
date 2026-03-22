import Phaser from "phaser";
import { Player } from "../objects/Player";
import { Chest } from "../objects/Chest";
import { getItemData } from "../items/ItemRegistry";

export class InteractionSystem {
  private scene: Phaser.Scene;
  private player: Player;
  private items: Phaser.Physics.Arcade.Group;
  private chests: Phaser.Physics.Arcade.StaticGroup;

  constructor(scene: Phaser.Scene, player: Player, items: Phaser.Physics.Arcade.Group, chests: Phaser.Physics.Arcade.StaticGroup) {
    this.scene = scene;
    this.player = player;
    this.items = items;
    this.chests = chests;

    this.setupOverlaps();
    this.setupKeyboardInteractions();
  }

  private setupOverlaps(): void {
    this.scene.physics.add.overlap(this.player, this.items, (playerObj, itemObj) => {
      const p = playerObj as Player;
      const staticSprite = itemObj as Phaser.Physics.Arcade.Sprite;
      const key = staticSprite.texture.key;

      const itemData = getItemData(key);
      if (!itemData) return;

      // Check for pickup delay
      if (staticSprite.getData("canBePickedUp") === false) return;

      let text = "";
      if (itemData.type === "currency") {
        p.addMora(itemData.moraValue || 0);
        text = `+${itemData.moraValue} Mora`;
      } else {
        p.addItem(key, 1);
        text = `+1 ${itemData.name}`;
      }

      this.showFloatingText(staticSprite.x, staticSprite.y, text);

      if (staticSprite.name) {
        p.addCollectedMapItem(staticSprite.name);
      }
      itemObj.destroy();
    });
  }

  private setupKeyboardInteractions(): void {
    this.scene.input.keyboard?.on("keydown-E", () => {
      const allChests = this.chests.getChildren() as Chest[];
      const interactDistance = 40;

      for (const chest of allChests) {
        if (!chest.getIsOpened()) {
          const distance = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            chest.x, chest.y
          );

          if (distance <= interactDistance) {
            chest.open();
            if (chest.name) {
              this.player.addCollectedMapItem(chest.name);
            }
            break;
          }
        }
      }
    });
  }

  private showFloatingText(x: number, y: number, text: string): void {
    const floatingText = this.scene.add
      .text(x, y - 20, text, {
        fontSize: "14px",
        color: "#ffffaa",
        stroke: "#000000",
        strokeThickness: 3,
        fontFamily: "monospace",
      })
      .setOrigin(0.5)
      .setDepth(y + 100);

    this.scene.tweens.add({
      targets: floatingText,
      y: y - 50,
      alpha: 0,
      duration: 2000,
      ease: "Power2",
      onComplete: () => floatingText.destroy(),
    });
  }
}
