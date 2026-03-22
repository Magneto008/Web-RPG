import Phaser from "phaser";

export class InventoryComponent {
  private inventory: Record<string, number> = {};
  private mora: number = 0;
  private collectedMapItems: string[] = [];
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, inventory: Record<string, number>, mora: number, collected: string[]) {
    this.scene = scene;
    this.inventory = { ...inventory };
    this.mora = mora;
    this.collectedMapItems = [...collected];
    this.updateRegistry();
  }

  addItem(itemKey: string, amount: number = 1): void {
    if (!this.inventory[itemKey]) {
      this.inventory[itemKey] = 0;
    }
    this.inventory[itemKey] += amount;
    this.updateRegistry();
  }

  removeItem(itemKey: string, amount: number = 1): boolean {
    if (!this.inventory[itemKey] || this.inventory[itemKey] < amount) {
      return false;
    }
    this.inventory[itemKey] -= amount;
    if (this.inventory[itemKey] <= 0) {
      delete this.inventory[itemKey];
    }
    this.updateRegistry();
    return true;
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

  getInventory(): Record<string, number> {
    return this.inventory;
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
    this.scene.registry.set("playerInventory", { ...this.inventory });
    this.scene.registry.set("playerMora", this.mora);
  }
}
