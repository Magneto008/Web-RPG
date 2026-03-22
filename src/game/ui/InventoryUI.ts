import Phaser from "phaser";
import { ContextMenu } from "./ContextMenu";
import { Tooltip } from "./Tooltip";
import { getItemData } from "../items/ItemRegistry";
import { ASSETS } from "../assets/AssetLoader";
import { InventorySlot } from "../items/Inventory";

// Adjust these values to fine-tune the inventory layout
const LAYOUT = {
  BG_SCALE: 2.0,

  // Stats alignment (Left panel)
  STATS_X_OFFSET: -245,
  STATS_Y_START: -41,
  STATS_SPACING: 63.5,
  STATS_ICON_SCALE: 1.5,
  STATS_TEXT_X_OFFSET: 43,

  // Inventory grid (Right panel)
  GRID_X_START: -86,
  GRID_Y_START: -93,
  SLOT_SIZE: 55,
  SLOT_PADDING: 8,
  COLUMNS: 6,
  MAX_SLOTS: 24, // Fixed number of slots to show
};

export class InventoryUI {
  private container: Phaser.GameObjects.Container;
  private scene: Phaser.Scene;
  private slots: Phaser.GameObjects.Container[] = [];
  private slotBgs: Phaser.GameObjects.Image[] = [];
  private isOpen: boolean = false;
  private tooltip: Tooltip;
  private contextMenu?: ContextMenu;
  private statsIcons: Phaser.GameObjects.Image[] = [];
  private statsText: Phaser.GameObjects.Text[] = [];

  // Interaction state
  private selectedSlotIndex: number = -1;
  private dragIcon?: Phaser.GameObjects.Image;
  private dragSlotIndex: number = -1;

  constructor(scene: Phaser.Scene, tooltip: Tooltip) {
    this.scene = scene;
    this.tooltip = tooltip;

    const { width, height } = scene.scale;
    this.container = scene.add.container(width / 2, height / 2);
    this.container.setDepth(2000);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    // Background Image
    const bg = scene.add.image(0, 0, ASSETS.INVENTORY_BG_EMPTY);
    bg.setScale(LAYOUT.BG_SCALE);
    bg.setInteractive();
    this.container.add(bg);

    // Stop drag if clicking background (also hides tooltip)
    bg.on("pointerdown", () => {
      this.selectedSlotIndex = -1;
      this.refreshSelection();
      this.closeContextMenu();
      this.tooltip.hide();
    });

    scene.scale.on("resize", (gameSize: Phaser.Structs.Size) => {
      this.container.setPosition(gameSize.width / 2, gameSize.height / 2);
    });

    // Create drag icon (hidden initially)
    this.dragIcon = scene.add
      .image(0, 0, "")
      .setVisible(false)
      .setDepth(3001)
      .setScrollFactor(0);

    // Global pointer move for dragging
    scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.dragIcon?.visible) {
        this.dragIcon.setPosition(pointer.x, pointer.y);
      }
    });

    // Global pointer up to catch drops outside slots
    scene.input.on("pointerup", () => {
      this.stopDrag();
    });
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.container.setVisible(this.isOpen);

    const gameScene = this.scene.scene.get("GameScene");
    if (this.isOpen) {
      const currentInv =
        (this.scene.registry.get("playerInventory") as InventorySlot[]) || [];
      this.refresh(currentInv);
      gameScene.scene.pause();
    } else {
      gameScene.scene.resume();
      this.closeContextMenu();
      this.tooltip.hide();
      this.stopDrag();
    }
  }

  refresh(inventory: InventorySlot[]): void {
    this.slots.forEach((slot) => slot.destroy());
    this.slots = [];
    this.slotBgs = [];
    this.clearStats();

    // Stats Section
    const hp = this.scene.registry.get("playerHealth") || {
      current: 0,
      max: 0,
    };
    const mora = this.scene.registry.get("playerMora") || 0;

    this.addStat(
      LAYOUT.STATS_X_OFFSET,
      LAYOUT.STATS_Y_START,
      ASSETS.HP_ICON,
      `${hp.current}`,
    );
    this.addStat(
      LAYOUT.STATS_X_OFFSET,
      LAYOUT.STATS_Y_START + LAYOUT.STATS_SPACING,
      ASSETS.ARMOR_ICON,
      "0",
    );
    this.addStat(
      LAYOUT.STATS_X_OFFSET,
      LAYOUT.STATS_Y_START + LAYOUT.STATS_SPACING * 2,
      ASSETS.WEIGHT_ICON,
      `${mora}`,
    );

    // Inventory Section - Fixed Grid
    for (let i = 0; i < LAYOUT.MAX_SLOTS; i++) {
      const slotX =
        LAYOUT.GRID_X_START +
        (i % LAYOUT.COLUMNS) * (LAYOUT.SLOT_SIZE + LAYOUT.SLOT_PADDING);
      const slotY =
        LAYOUT.GRID_Y_START +
        Math.floor(i / LAYOUT.COLUMNS) *
          (LAYOUT.SLOT_SIZE + LAYOUT.SLOT_PADDING);

      const slotContainer = this.scene.add.container(slotX, slotY);
      const slotData = inventory[i] || { itemId: null, quantity: 0 };

      // Slot background
      const slotBg = this.scene.add.image(0, 0, ASSETS.INVENTORY_CELL);
      slotBg.setDisplaySize(LAYOUT.SLOT_SIZE, LAYOUT.SLOT_SIZE);
      slotBg.setInteractive();
      slotContainer.add(slotBg);
      this.slotBgs.push(slotBg);

      if (slotData.itemId) {
        const itemIcon = this.scene.add.image(0, 0, slotData.itemId);
        const scale = Math.min(
          (LAYOUT.SLOT_SIZE - 16) / itemIcon.width,
          (LAYOUT.SLOT_SIZE - 16) / itemIcon.height,
        );
        itemIcon.setScale(scale);

        const countText = this.scene.add
          .text(
            LAYOUT.SLOT_SIZE / 2 - 6,
            LAYOUT.SLOT_SIZE / 2 - 6,
            `x${slotData.quantity}`,
            {
              fontFamily: '"Courier New", monospace',
              fontSize: "13px",
              color: "#ffffff",
              backgroundColor: "#000000aa",
              padding: { x: 3, y: 1 },
            },
          )
          .setOrigin(1, 1);

        slotContainer.add([itemIcon, countText]);

        // Drag start
        slotBg.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
          if (pointer.button === 0) {
            // Left click
            this.selectedSlotIndex = i;
            this.refreshSelection();
            this.startDrag(i, slotData.itemId!);
          }
        });
      }

      // Hover state (visual only)
      slotBg.on("pointerover", (_pointer: Phaser.Input.Pointer) => {
        slotBg.setTint(0xeeeeee);
      });

      slotBg.on("pointerout", () => {
        slotBg.clearTint();
        this.refreshSelection();
      });

      // Pointer Down (Combined Handling)
      slotBg.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        if (pointer.button === 2) {
          // Right Click
          if (slotData.itemId) {
            this.showContextMenu(pointer.x, pointer.y, i, slotData.itemId);
          }
        } else if (pointer.button === 0) {
          // Left Click
          this.selectedSlotIndex = i;
          this.refreshSelection();
        }
      });

      // Drop Handling
      slotBg.on("pointerup", (pointer: Phaser.Input.Pointer) => {
        if (this.dragSlotIndex !== -1 && this.dragSlotIndex !== i) {
          this.handleDrop(this.dragSlotIndex, i, pointer);
        }
      });

      this.container.add(slotContainer);
      this.slots.push(slotContainer);
    }

    this.refreshSelection();
  }

  private startDrag(index: number, itemId: string): void {
    this.dragSlotIndex = index;
    if (this.dragIcon) {
      this.dragIcon.setTexture(itemId);
      const scale = Math.min(
        (LAYOUT.SLOT_SIZE - 16) / this.dragIcon.width,
        (LAYOUT.SLOT_SIZE - 16) / this.dragIcon.height,
      );
      this.dragIcon.setScale(scale);
      this.dragIcon.setVisible(true);
      this.dragIcon.setAlpha(0.7);
    }
    // Hide item in slot while dragging
    const itemContent = this.slots[index].list.slice(1);
    itemContent.forEach((obj) => (obj as any).setVisible(false));
  }

  private stopDrag(): void {
    if (this.dragSlotIndex === -1) return;

    // Restore visibility of dragged item in its original slot
    const itemContent = this.slots[this.dragSlotIndex].list.slice(1);
    itemContent.forEach((obj) => (obj as any).setVisible(true));

    this.dragSlotIndex = -1;
    if (this.dragIcon) this.dragIcon.setVisible(false);
  }

  private handleDrop(
    fromIndex: number,
    toIndex: number,
    pointer: Phaser.Input.Pointer,
  ): void {
    const isShift = pointer.event.shiftKey;

    if (isShift) {
      // Split logic: get quantity from registry/inventory
      const inventory =
        (this.scene.registry.get("playerInventory") as InventorySlot[]) || [];
      const fromSlot = inventory[fromIndex];
      const toSlot = inventory[toIndex];

      // Only split if target is empty and source has > 1
      if (fromSlot && fromSlot.quantity > 1 && !toSlot?.itemId) {
        const splitAmount = Math.floor(fromSlot.quantity / 2);
        this.scene.events.emit("split-inventory-slot", fromIndex, splitAmount);
      } else {
        // Fallback to swap if split not possible
        this.scene.events.emit("swap-inventory-slots", fromIndex, toIndex);
      }
    } else {
      this.scene.events.emit("swap-inventory-slots", fromIndex, toIndex);
    }

    this.stopDrag();
  }

  private refreshSelection(): void {
    this.slotBgs.forEach((bg, index) => {
      if (index === this.selectedSlotIndex) {
        bg.setTint(0xffff00); // Yellow highlight for selection
      } else {
        bg.clearTint();
      }
    });
  }

  private addStat(x: number, y: number, iconKey: string, text: string): void {
    const icon = this.scene.add
      .image(x, y, iconKey)
      .setScale(LAYOUT.STATS_ICON_SCALE);
    const valText = this.scene.add
      .text(x + LAYOUT.STATS_TEXT_X_OFFSET, y, text, {
        fontFamily: '"Courier New", monospace',
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5);

    this.container.add([icon, valText]);
    this.statsIcons.push(icon);
    this.statsText.push(valText);
  }

  private clearStats(): void {
    this.statsIcons.forEach((i) => i.destroy());
    this.statsText.forEach((t) => t.destroy());
    this.statsIcons = [];
    this.statsText = [];
  }

  private showContextMenu(
    x: number,
    y: number,
    slotIndex: number,
    itemKey: string,
  ): void {
    this.closeContextMenu();
    this.contextMenu = new ContextMenu(
      this.scene,
      x,
      y,
      slotIndex,
      itemKey,
      (_idx: number, key: string) => {
        this.scene.events.emit("use-item-from-slot", _idx, key);
      },
      (_idx: number, key: string) => {
        this.scene.events.emit("drop-item-from-slot", _idx, key);
      },
      (_idx: number, key: string) => {
        const data = getItemData(key);
        if (data) {
          this.tooltip.show(data.name, data.description, x + 10, y + 10);
        }
      },
    );
  }

  closeContextMenu(): void {
    if (this.contextMenu) {
      this.contextMenu.destroy();
      this.contextMenu = undefined;
    }
  }

  getIsOpen(): boolean {
    return this.isOpen;
  }
}
