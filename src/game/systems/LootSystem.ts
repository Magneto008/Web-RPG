import Phaser from "phaser";
import { ITEM_DATABASE } from "../items/ItemRegistry";

export class LootSystem {
  static getLootTable(dropGroup: string = "chest") {
    return Object.values(ITEM_DATABASE).filter(
      (item) => item.dropWeight !== undefined && item.dropGroup === dropGroup,
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
    droppedItem.setOrigin(0.5, 0.5);
    droppedItem.setDepth(y + 10);

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
