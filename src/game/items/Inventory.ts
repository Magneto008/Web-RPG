import { getItemData } from "./ItemRegistry";

export type InventorySlot = {
  itemId: string | null;
  quantity: number;
};

export class Inventory {
  private slots: InventorySlot[];
  private maxSize: number;

  constructor(maxSize: number = 24, initialData?: InventorySlot[] | Record<string, number>) {
    this.maxSize = maxSize;
    this.slots = Array(maxSize).fill(null).map(() => ({ itemId: null, quantity: 0 }));

    if (initialData) {
      if (Array.isArray(initialData)) {
        // Load from array (with bounds check)
        for (let i = 0; i < Math.min(initialData.length, maxSize); i++) {
          this.slots[i] = { ...initialData[i] };
        }
      } else {
        // Migration from Record<string, number>
        this.fromLegacyRecord(initialData);
      }
    }
  }

  /**
   * Converts legacy Record format to slot-based array
   */
  private fromLegacyRecord(record: Record<string, number>): void {
    let slotIndex = 0;
    for (const [itemId, quantity] of Object.entries(record)) {
      if (slotIndex >= this.maxSize) break;
      if (quantity <= 0) continue;

      const itemData = getItemData(itemId);
      const maxStack = itemData?.maxStack ?? 99;

      let remaining = quantity;
      while (remaining > 0 && slotIndex < this.maxSize) {
        const addAmount = Math.min(remaining, maxStack);
        this.slots[slotIndex] = { itemId, quantity: addAmount };
        remaining -= addAmount;
        slotIndex++;
      }
    }
  }

  getSlots(): InventorySlot[] {
    return this.slots.map(slot => ({ ...slot }));
  }

  getSlot(index: number): InventorySlot | null {
    if (index < 0 || index >= this.maxSize) return null;
    return this.slots[index];
  }

  /**
   * Adds an item to the inventory, filling existing stacks first
   */
  addItem(itemId: string, quantity: number = 1): number {
    const itemData = getItemData(itemId);
    if (!itemData) {
      console.warn(`Attempted to add invalid item ID: ${itemId}`);
      return quantity;
    }

    const maxStack = itemData?.maxStack ?? 99;
    let remaining = quantity;

    // 1. Try to fill existing stacks
    for (let i = 0; i < this.maxSize; i++) {
      if (this.slots[i].itemId === itemId && this.slots[i].quantity < maxStack) {
        const canAdd = maxStack - this.slots[i].quantity;
        const toAdd = Math.min(remaining, canAdd);
        this.slots[i].quantity += toAdd;
        remaining -= toAdd;
        if (remaining <= 0) return 0;
      }
    }

    // 2. Occupy empty slots
    for (let i = 0; i < this.maxSize; i++) {
      if (this.slots[i].itemId === null) {
        const toAdd = Math.min(remaining, maxStack);
        this.slots[i] = { itemId, quantity: toAdd };
        remaining -= toAdd;
        if (remaining <= 0) return 0;
      }
    }

    return remaining; // Return what couldn't be added
  }

  /**
   * Removes item from inventory, starting from the last slots (standard RPG behavior)
   */
  removeItem(itemId: string, quantity: number = 1): boolean {
    // First, verify we have enough
    let total = 0;
    for (const slot of this.slots) {
      if (slot.itemId === itemId) total += slot.quantity;
    }

    if (total < quantity) return false;

    let remainingToRemove = quantity;
    // Remove from the end to keep early slots filled (optional, but common)
    for (let i = this.maxSize - 1; i >= 0; i--) {
      if (this.slots[i].itemId === itemId) {
        if (this.slots[i].quantity <= remainingToRemove) {
          remainingToRemove -= this.slots[i].quantity;
          this.slots[i] = { itemId: null, quantity: 0 };
        } else {
          this.slots[i].quantity -= remainingToRemove;
          remainingToRemove = 0;
        }
      }
      if (remainingToRemove <= 0) break;
    }

    return true;
  }

  /**
   * Removes item from a specific slot
   */
  removeItemFromSlot(index: number, quantity: number = 1): boolean {
    const slot = this.getSlot(index);
    if (!slot || !slot.itemId || slot.quantity < quantity) return false;

    slot.quantity -= quantity;
    if (slot.quantity <= 0) {
      this.slots[index] = { itemId: null, quantity: 0 };
    }
    return true;
  }

  /**
   * Swaps two slots
   */
  swapSlots(indexA: number, indexB: number): void {
    if (indexA < 0 || indexA >= this.maxSize || indexB < 0 || indexB >= this.maxSize) return;
    if (indexA === indexB) return;

    const temp = { ...this.slots[indexA] };
    this.slots[indexA] = { ...this.slots[indexB] };
    this.slots[indexB] = temp;
  }

  /**
   * Merges slot A into slot B if possible
   */
  mergeSlots(indexSrc: number, indexDest: number): boolean {
    const src = this.getSlot(indexSrc);
    const dest = this.getSlot(indexDest);

    if (!src || !dest || !src.itemId || src.itemId !== dest.itemId) return false;

    const itemData = getItemData(src.itemId);
    const maxStack = itemData?.maxStack ?? 99;

    if (dest.quantity >= maxStack) return false;

    const canAdd = maxStack - dest.quantity;
    const toAdd = Math.min(src.quantity, canAdd);

    if (toAdd <= 0) return false;

    dest.quantity += toAdd;
    src.quantity -= toAdd;

    if (src.quantity <= 0) {
      this.slots[indexSrc] = { itemId: null, quantity: 0 };
    }

    return true;
  }

  /**
   * Splits a stack in a slot into a new empty slot
   */
  splitSlot(index: number, amount: number): boolean {
    const slot = this.getSlot(index);
    if (!slot || !slot.itemId || slot.quantity <= amount) return false;

    const emptySlotIndex = this.findEmptySlot();
    if (emptySlotIndex === -1) return false;

    this.slots[emptySlotIndex] = {
      itemId: slot.itemId,
      quantity: amount,
    };
    slot.quantity -= amount;

    return true;
  }

  /**
   * Finds the first available empty slot index
   */
  findEmptySlot(): number {
    return this.slots.findIndex((s) => s.itemId === null);
  }
}
