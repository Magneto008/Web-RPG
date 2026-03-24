import Phaser from "phaser";
import { Inventory, InventorySlot } from "../items/Inventory";
import { getItemData } from "../items/ItemRegistry";
import type { Player } from "../objects/Player";
import { GameStore } from "../state/GameStore";
import { GAME_EVENTS } from "../events/GameEvents";

export interface InventorySaveData {
  inventory: InventorySlot[];
  mora: number;
  collectedMapItems: string[];
}

export class InventoryComponent {
  private inventory: Inventory;
  private mora = 0;
  private collectedMapItems: string[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly store: GameStore,
    inventory: InventorySlot[] | Record<string, number>,
    mora: number,
    collected: string[],
  ) {
    this.inventory = new Inventory(24, inventory);
    this.mora = mora;
    this.collectedMapItems = [...collected];
    this.updateStore();
  }

  addItem(itemKey: string, amount: number = 1): void {
    const remaining = this.inventory.addItem(itemKey, amount);
    this.updateStore();

    if (remaining > 0) {
      this.scene.game.events.emit(GAME_EVENTS.UI_INVENTORY_FULL, { itemKey, remaining });
    }
  }

  removeItem(itemKey: string, amount: number = 1): boolean {
    const success = this.inventory.removeItem(itemKey, amount);
    if (success) {
      this.updateStore();
    }
    return success;
  }

  removeItemFromSlot(index: number, amount: number = 1): boolean {
    const success = this.inventory.removeItemFromSlot(index, amount);
    if (success) {
      this.updateStore();
    }
    return success;
  }

  swapSlots(indexA: number, indexB: number): void {
    this.inventory.swapSlots(indexA, indexB);
    this.updateStore();
  }

  mergeSlots(indexSrc: number, indexDest: number): boolean {
    const success = this.inventory.mergeSlots(indexSrc, indexDest);
    if (success) {
      this.updateStore();
    }
    return success;
  }

  useItemFromSlot(index: number, player: Player): boolean {
    const slot = this.inventory.getSlot(index);
    if (!slot || !slot.itemId) {
      return false;
    }

    const itemData = getItemData(slot.itemId);
    if (!itemData || itemData.type !== "consumable") {
      return false;
    }

    this.scene.game.events.emit(GAME_EVENTS.UI_APPLY_ITEM_EFFECT, {
      itemId: slot.itemId,
      slotIndex: index,
    });

    const success = this.inventory.removeItemFromSlot(index, 1);
    if (!success) {
      return false;
    }

    itemData.onUse?.(player);
    this.updateStore();
    return true;
  }

  addMora(amount: number): void {
    this.mora += amount;
    this.store.setPlayerMora(this.mora);
  }

  removeMora(amount: number): boolean {
    if (this.mora < amount) {
      return false;
    }

    this.mora -= amount;
    this.store.setPlayerMora(this.mora);
    return true;
  }

  getInventory(): InventorySlot[] {
    return this.inventory.getSlots();
  }

  splitSlot(index: number, amount: number): boolean {
    const success = this.inventory.splitSlot(index, amount);
    if (success) {
      this.updateStore();
    }
    return success;
  }

  getMora(): number {
    return this.mora;
  }

  getCollectedMapItems(): string[] {
    return this.collectedMapItems;
  }

  addCollectedMapItem(id: string): void {
    if (!this.collectedMapItems.includes(id)) {
      this.collectedMapItems.push(id);
    }
  }

  private updateStore(): void {
    this.store.setPlayerInventory(this.inventory.getSlots());
    this.store.setPlayerMora(this.mora);
    this.save();
  }

  save(): void {
    const data: InventorySaveData = {
      inventory: this.inventory.getSlots(),
      mora: this.mora,
      collectedMapItems: this.collectedMapItems,
    };
    localStorage.setItem("player_inventory_v1", JSON.stringify(data));
  }

  static load(): InventorySaveData | null {
    const saved = localStorage.getItem("player_inventory_v1");
    if (!saved) {
      return null;
    }

    try {
      return JSON.parse(saved) as InventorySaveData;
    } catch (error) {
      console.error("Failed to parse player inventory data", error);
      return null;
    }
  }
}
