import Phaser from "phaser";
import { Player } from "../objects/Player";
import { Chest } from "../objects/Chest";
import { Furnace } from "../objects/Furnace";
import { getItemData } from "../items/ItemRegistry";
import { GAME_EVENTS } from "../events/GameEvents";

export class InteractionSystem {
  private overlapCollider?: Phaser.Physics.Arcade.Collider;
  private activeFurnace?: Furnace;
  private readonly onCloseFurnace = (): void => {
    this.activeFurnace = undefined;
  };

  private readonly onInteractKey = (): void => {
    const nearestFurnace = this.getNearestFurnaceInRange();
    if (nearestFurnace) {
      this.activeFurnace = nearestFurnace;
      this.scene.game.events.emit(GAME_EVENTS.UI_OPEN_INVENTORY_FOR_FURNACE);
      this.showFloatingText(
        nearestFurnace.x,
        nearestFurnace.y - 36,
        "Furnace ready: drag ore to furnace slots.",
        true,
      );
      return;
    }

    const chests = this.chests.getChildren() as Chest[];
    for (const chest of chests) {
      if (chest.getIsOpened()) {
        continue;
      }

      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, chest.x, chest.y);

      if (distance <= 40) {
        chest.open();
        if (chest.name) {
          this.player.addCollectedMapItem(chest.name);
        }
        break;
      }
    }
  };

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly items: Phaser.Physics.Arcade.Group,
    private readonly chests: Phaser.Physics.Arcade.StaticGroup,
    private readonly furnaces: Phaser.Physics.Arcade.StaticGroup,
  ) {
    this.setupOverlaps();
    this.scene.input.keyboard?.on("keydown-E", this.onInteractKey);
    this.scene.game.events.on(GAME_EVENTS.UI_CLOSE_FURNACE, this.onCloseFurnace);
  }

  destroy(): void {
    this.overlapCollider?.destroy();
    this.overlapCollider = undefined;
    this.scene.input.keyboard?.off("keydown-E", this.onInteractKey);
    this.scene.game.events.off(GAME_EVENTS.UI_CLOSE_FURNACE, this.onCloseFurnace);
  }

  queueSmeltItem(itemKey: string, furnaceSlotIndex?: number): { success: boolean; message: string } {
    const furnace = this.activeFurnace ?? this.getNearestFurnaceInRange();
    if (!furnace) {
      return {
        success: false,
        message: "Move closer to a furnace.",
      };
    }

    const result = furnace.queueInput(
      itemKey,
      new Phaser.Math.Vector2(this.player.x, this.player.y),
      furnaceSlotIndex,
    );
    this.showFloatingText(furnace.x, furnace.y - 36, result.message, result.success);
    return result;
  }

  private setupOverlaps(): void {
    this.overlapCollider = this.scene.physics.add.overlap(this.player, this.items, (_playerObj, itemObj) => {
      const player = this.player;
      const itemSprite = itemObj as Phaser.Physics.Arcade.Sprite;
      const key = itemSprite.texture.key;

      const itemData = getItemData(key);
      if (!itemData) {
        return;
      }

      if (itemSprite.getData("canBePickedUp") === false) {
        return;
      }

      let text = "";
      if (itemData.type === "currency") {
        player.addMora(itemData.moraValue || 0);
        text = `+${itemData.moraValue} Mora`;
      } else {
        player.addItem(key, 1);
        text = `+1 ${itemData.name}`;
      }

      this.showFloatingText(itemSprite.x, itemSprite.y, text, true);

      if (itemSprite.name) {
        player.addCollectedMapItem(itemSprite.name);
      }

      itemObj.destroy();
    });
  }

  private getNearestFurnaceInRange(): Furnace | undefined {
    const interactDistance = 72;
    const furnaces = this.furnaces.getChildren() as Furnace[];

    let nearestFurnace: Furnace | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const furnace of furnaces) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, furnace.x, furnace.y);
      if (distance <= interactDistance && distance < nearestDistance) {
        nearestFurnace = furnace;
        nearestDistance = distance;
      }
    }

    return nearestFurnace;
  }


  private showFloatingText(
    x: number,
    y: number,
    text: string,
    isPositive: boolean,
  ): void {
    const floatingText = this.scene.add
      .text(x, y - 20, text, {
        fontSize: "14px",
        color: isPositive ? "#ffffaa" : "#ff9f9f",
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
