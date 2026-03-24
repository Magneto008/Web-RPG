import Phaser from "phaser";
import { ITEM_DATABASE } from "../items/ItemRegistry";

interface WorldItemStyleOptions {
  canBePickedUp?: boolean;
  alpha?: number;
}

export class LootSystem {
  private static readonly TARGET_WORLD_ITEM_SIZE = 26;

  static styleWorldItem(
    item: Phaser.Physics.Arcade.Sprite,
    y: number,
    options: WorldItemStyleOptions = {},
  ): void {
    const frameWidth = item.width;
    if (frameWidth > 0) {
      item.setScale(this.TARGET_WORLD_ITEM_SIZE / frameWidth);
    }

    item.setOrigin(0.5, 0.5);
    item.setDepth(y);
    item.setData("canBePickedUp", options.canBePickedUp ?? true);
    item.setAlpha(options.alpha ?? 1);
  }

  static getLootTable(dropGroup: string = "chest") {
    return Object.values(ITEM_DATABASE).filter(
      (item) => {
        if (item.dropWeight === undefined || item.dropGroup === undefined) {
          return false;
        }

        if (Array.isArray(item.dropGroup)) {
          return item.dropGroup.includes(dropGroup);
        }

        return item.dropGroup === dropGroup;
      },
    );
  }

  static dropLoot(
    scene: Phaser.Scene,
    x: number,
    y: number,
    itemsGroup: Phaser.Physics.Arcade.Group,
    dropGroup: string = "chest",
  ): Phaser.Physics.Arcade.Sprite | null {
    const lootTable = this.getLootTable(dropGroup);

    if (lootTable.length === 0) {
      console.warn(`Loot table for group "${dropGroup}" is empty.`);
      return null;
    }

    const totalWeight = lootTable.reduce(
      (sum, item) => sum + (item.dropWeight || 0),
      0,
    );

    const roll = Math.random() * totalWeight;

    let cumulative = 0;
    let selected = lootTable[lootTable.length - 1];

    for (const item of lootTable) {
      cumulative += item.dropWeight || 0;
      if (roll <= cumulative) {
        selected = item;
        break;
      }
    }

    const droppedItem = itemsGroup.create(x, y, selected.id);
    this.styleWorldItem(droppedItem, y + 10, {
      canBePickedUp: true,
      alpha: 1,
    });

    scene.tweens.add({
      targets: droppedItem,
      x: x + Phaser.Math.Between(-30, 30),
      y: y + Phaser.Math.Between(10, 30),
      duration: 600,
      ease: "Bounce.easeOut",
    });

    return droppedItem;
  }
}
