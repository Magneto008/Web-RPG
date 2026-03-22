import Phaser from "phaser";
import { Inventory, InventorySlot } from "../items/Inventory";
import { getItemData } from "../items/ItemRegistry";
import type { Player } from "../objects/Player";

export class InventoryComponent {
  private inventory: Inventory;
  private mora: number = 0;
  private collectedMapItems: string[] = [];
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, inventory: InventorySlot[] | Record<string, number>, mora: number, collected: string[]) {
    this.scene = scene;
    this.inventory = new Inventory(24, inventory);
    this.mora = mora;
    this.collectedMapItems = [...collected];
    this.updateRegistry();
  }

  addItem(itemKey: string, amount: number = 1): void {
    const remaining = this.inventory.addItem(itemKey, amount);
    this.updateRegistry();
    
    if (remaining > 0) {
      this.scene.events.emit("inventory-full", { itemKey, remaining });
    }
  }

  removeItem(itemKey: string, amount: number = 1): boolean {
    const success = this.inventory.removeItem(itemKey, amount);
    if (success) {
      this.updateRegistry();
    }
    return success;
  }

  /**
   * Removes item from a specific slot index
   */
  removeItemFromSlot(index: number, amount: number = 1): boolean {
    const success = this.inventory.removeItemFromSlot(index, amount);
    if (success) {
      this.updateRegistry();
    }
    return success;
  }

  /**
   * Swaps two inventory slots
   */
  swapSlots(indexA: number, indexB: number): void {
    this.inventory.swapSlots(indexA, indexB);
    this.updateRegistry();
  }

  /**
   * Merges slot A into slot B
   */
  mergeSlots(indexSrc: number, indexDest: number): boolean {
    const success = this.inventory.mergeSlots(indexSrc, indexDest);
    if (success) {
      this.updateRegistry();
    }
    return success;
  }

  /**
   * Uses item from a specific slot
   */
  useItemFromSlot(index: number, player: Player): boolean {
    const slot = this.inventory.getSlot(index);
    if (!slot || !slot.itemId) return false;

    const itemData = getItemData(slot.itemId);
    if (!itemData) return false;

    if (itemData.type === "consumable") {
      this.scene.events.emit("apply-item-effect", { itemId: slot.itemId, slotIndex: index });
      
      const success = this.inventory.removeItemFromSlot(index, 1);
      if (success) {
        itemData.onUse?.(player);
        this.updateRegistry();
        return true;
      }
    }

    return false;
  }

  addMora(amount: number): void {
    this.mora += amount;
    this.scene.registry.set("playerMora", this.mora);
  }

  removeMora(amount: number): boolean {
    if (this.mora < amount) return false;
    this.mora -= amount;
    this.scene.registry.set("playerMora", this.mora);
    return true;
  }

  getInventory(): InventorySlot[] {
    return this.inventory.getSlots();
  }

  /**
   * Splits a stack in slot index
   */
  splitSlot(index: number, amount: number): boolean {
    const success = this.inventory.splitSlot(index, amount);
    if (success) {
      this.updateRegistry();
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

  private updateRegistry(): void {
    this.scene.registry.set("playerInventory", this.inventory.getSlots());
    this.scene.registry.set("playerMora", this.mora);
    this.save();
  }

  public save(): void {
    const data = {
      inventory: this.inventory.getSlots(),
      mora: this.mora,
      collectedMapItems: this.collectedMapItems,
    };
    localStorage.setItem("player_inventory_v1", JSON.stringify(data));
  }

  public static load(): any {
    const saved = localStorage.getItem("player_inventory_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse player inventory data", e);
      }
    }
    return null;
  }
}
