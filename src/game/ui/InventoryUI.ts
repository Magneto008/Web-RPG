import Phaser from "phaser";
import { ContextMenu } from "./ContextMenu";
import { Tooltip } from "./Tooltip";
import { getItemData } from "../items/ItemRegistry";
import { ASSETS } from "../assets/AssetLoader";
import { InventorySlot } from "../items/Inventory";
import {
  DropItemFromSlotPayload,
  GAME_EVENTS,
  SmeltItemFromSlotPayload,
  SplitInventorySlotPayload,
  SwapInventorySlotsPayload,
  UseItemFromSlotPayload,
} from "../events/GameEvents";
import { HealthState } from "../state/GameStore";

const LAYOUT = {
  BG_SCALE: 2,
  STATS_X_OFFSET: -245,
  STATS_Y_START: -41,
  STATS_SPACING: 63.5,
  STATS_ICON_SCALE: 1.5,
  STATS_TEXT_X_OFFSET: 43,
  GRID_X_START: -86,
  GRID_Y_START: -93,
  SLOT_SIZE: 55,
  SLOT_PADDING: 8,
  COLUMNS: 6,
  MAX_SLOTS: 24,
} as const;

interface InventoryRenderData {
  inventory: InventorySlot[];
  furnaceSlots: InventorySlot[];
  furnaceUiOpen: boolean;
  health: HealthState;
  mora: number;
}

export class InventoryUI {
  private readonly container: Phaser.GameObjects.Container;
  private readonly slots: Phaser.GameObjects.Container[] = [];
  private readonly slotBgs: Phaser.GameObjects.Image[] = [];
  private readonly statsIcons: Phaser.GameObjects.Image[] = [];
  private readonly statsText: Phaser.GameObjects.Text[] = [];
  private readonly furnaceUiObjects: Phaser.GameObjects.GameObject[] = [];

  private contextMenu?: ContextMenu;
  private dragIcon?: Phaser.GameObjects.Image;
  private isOpen = false;
  private selectedSlotIndex = -1;
  private dragSlotIndex = -1;

  private latestRenderData: InventoryRenderData = {
    inventory: [],
    furnaceSlots: [],
    furnaceUiOpen: false,
    health: { current: 0, max: 0 },
    mora: 0,
  };

  private readonly onResize = (gameSize: Phaser.Structs.Size): void => {
    this.container.setPosition(gameSize.width / 2, gameSize.height / 2);
  };

  private readonly onPointerMove = (pointer: Phaser.Input.Pointer): void => {
    if (this.dragIcon?.visible) {
      this.dragIcon.setPosition(pointer.x, pointer.y);
    }
  };

  private readonly onPointerUp = (): void => {
    this.stopDrag();
  };

  constructor(private readonly scene: Phaser.Scene, private readonly tooltip: Tooltip) {
    const { width, height } = scene.scale;
    this.container = scene.add.container(width / 2, height / 2);
    this.container.setDepth(2000);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    const bg = scene.add.image(0, 0, ASSETS.INVENTORY_BG_EMPTY);
    bg.setScale(LAYOUT.BG_SCALE);
    bg.setInteractive();
    bg.on("pointerdown", () => {
      this.selectedSlotIndex = -1;
      this.refreshSelection();
      this.closeContextMenu();
      this.tooltip.hide();
    });

    this.container.add(bg);

    scene.scale.on("resize", this.onResize);

    this.dragIcon = scene.add.image(0, 0, "").setVisible(false).setDepth(3001).setScrollFactor(0);

    scene.input.on("pointermove", this.onPointerMove);
    scene.input.on("pointerup", this.onPointerUp);
  }

  setRenderData(data: InventoryRenderData): void {
    this.latestRenderData = data;
    if (this.isOpen) {
      this.refresh();
    }
  }

  toggle(): boolean {
    this.isOpen = !this.isOpen;
    this.container.setVisible(this.isOpen);

    if (this.isOpen) {
      this.refresh();
    } else {
      this.closeContextMenu();
      this.tooltip.hide();
      this.stopDrag();
    }

    return this.isOpen;
  }

  open(): boolean {
    if (this.isOpen) {
      return false;
    }

    this.isOpen = true;
    this.container.setVisible(true);
    this.refresh();
    return true;
  }

  close(): void {
    if (!this.isOpen) {
      return;
    }

    this.isOpen = false;
    this.container.setVisible(false);
    this.closeContextMenu();
    this.tooltip.hide();
    this.stopDrag();
  }

  closeContextMenu(): void {
    if (!this.contextMenu) {
      return;
    }

    this.contextMenu.destroy();
    this.contextMenu = undefined;
  }

  getIsOpen(): boolean {
    return this.isOpen;
  }

  destroy(): void {
    this.closeContextMenu();
    this.dragIcon?.destroy();
    this.container.destroy(true);
    this.scene.scale.off("resize", this.onResize);
    this.scene.input.off("pointermove", this.onPointerMove);
    this.scene.input.off("pointerup", this.onPointerUp);
  }

  private refresh(): void {
    this.slots.forEach((slot) => slot.destroy());
    this.slots.length = 0;
    this.slotBgs.length = 0;
    this.clearStats();
    this.clearFurnaceUi();

    this.addStat(
      LAYOUT.STATS_X_OFFSET,
      LAYOUT.STATS_Y_START,
      ASSETS.HP_ICON,
      `${this.latestRenderData.health.current}`,
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
      `${this.latestRenderData.mora}`,
    );

    for (let i = 0; i < LAYOUT.MAX_SLOTS; i++) {
      const slotX =
        LAYOUT.GRID_X_START + (i % LAYOUT.COLUMNS) * (LAYOUT.SLOT_SIZE + LAYOUT.SLOT_PADDING);
      const slotY =
        LAYOUT.GRID_Y_START +
        Math.floor(i / LAYOUT.COLUMNS) * (LAYOUT.SLOT_SIZE + LAYOUT.SLOT_PADDING);

      const slotContainer = this.scene.add.container(slotX, slotY);
      const slotData = this.latestRenderData.inventory[i] || { itemId: null, quantity: 0 };

      const slotBg = this.scene.add.image(0, 0, ASSETS.INVENTORY_CELL);
      slotBg.setDisplaySize(LAYOUT.SLOT_SIZE, LAYOUT.SLOT_SIZE);
      slotBg.setInteractive();

      slotBg.on("pointerover", () => slotBg.setTint(0xeeeeee));
      slotBg.on("pointerout", () => {
        slotBg.clearTint();
        this.refreshSelection();
      });

      slotBg.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        if (pointer.button === 2) {
          if (slotData.itemId) {
            this.showContextMenu(pointer.x, pointer.y, i, slotData.itemId);
          }
          return;
        }

        if (pointer.button !== 0) {
          return;
        }

        this.selectedSlotIndex = i;
        this.refreshSelection();

        if (!slotData.itemId) {
          return;
        }

        this.startDrag(i, slotData.itemId);
      });

      slotBg.on("pointerup", (pointer: Phaser.Input.Pointer) => {
        if (this.dragSlotIndex !== -1 && this.dragSlotIndex !== i) {
          this.handleDrop(this.dragSlotIndex, i, pointer);
        }
      });

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
          .text(LAYOUT.SLOT_SIZE / 2 - 6, LAYOUT.SLOT_SIZE / 2 - 6, `x${slotData.quantity}`, {
            fontFamily: '"Courier New", monospace',
            fontSize: "13px",
            color: "#ffffff",
            backgroundColor: "#000000aa",
            padding: { x: 3, y: 1 },
          })
          .setOrigin(1, 1);

        slotContainer.add([itemIcon, countText]);
      }

      this.container.add(slotContainer);
      this.slots.push(slotContainer);
    }

    if (this.latestRenderData.furnaceUiOpen) {
      this.addFurnaceSlots();
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

    this.setSlotContentVisibility(index, false);
  }

  private stopDrag(): void {
    if (this.dragSlotIndex === -1) {
      return;
    }

    this.setSlotContentVisibility(this.dragSlotIndex, true);
    this.dragSlotIndex = -1;
    this.dragIcon?.setVisible(false);
  }

  private setSlotContentVisibility(index: number, visible: boolean): void {
    const content = this.slots[index]?.list.slice(1) ?? [];
    for (const obj of content) {
      if ("setVisible" in obj && typeof obj.setVisible === "function") {
        obj.setVisible(visible);
      }
    }
  }

  private handleDrop(fromIndex: number, toIndex: number, pointer: Phaser.Input.Pointer): void {
    const isShift = pointer.event.shiftKey;

    if (isShift) {
      const fromSlot = this.latestRenderData.inventory[fromIndex];
      const toSlot = this.latestRenderData.inventory[toIndex];

      if (fromSlot && fromSlot.quantity > 1 && !toSlot?.itemId) {
        const payload: SplitInventorySlotPayload = {
          slotIndex: fromIndex,
          amount: Math.floor(fromSlot.quantity / 2),
        };
        this.scene.game.events.emit(GAME_EVENTS.UI_SPLIT_INVENTORY_SLOT, payload);
      } else {
        const payload: SwapInventorySlotsPayload = { fromIndex, toIndex };
        this.scene.game.events.emit(GAME_EVENTS.UI_SWAP_INVENTORY_SLOTS, payload);
      }
    } else {
      const payload: SwapInventorySlotsPayload = { fromIndex, toIndex };
      this.scene.game.events.emit(GAME_EVENTS.UI_SWAP_INVENTORY_SLOTS, payload);
    }

    this.stopDrag();
  }

  private refreshSelection(): void {
    this.slotBgs.forEach((bg, index) => {
      if (index === this.selectedSlotIndex) {
        bg.setTint(0xffff00);
      } else {
        bg.clearTint();
      }
    });
  }

  private addStat(x: number, y: number, iconKey: string, text: string): void {
    const icon = this.scene.add.image(x, y, iconKey).setScale(LAYOUT.STATS_ICON_SCALE);
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
    this.statsIcons.forEach((icon) => icon.destroy());
    this.statsText.forEach((text) => text.destroy());
    this.statsIcons.length = 0;
    this.statsText.length = 0;
  }

  private showContextMenu(x: number, y: number, slotIndex: number, itemKey: string): void {
    this.closeContextMenu();

    this.contextMenu = new ContextMenu(
      this.scene,
      x,
      y,
      slotIndex,
      itemKey,
      (index: number, _key: string) => {
        const payload: UseItemFromSlotPayload = { slotIndex: index };
        this.scene.game.events.emit(GAME_EVENTS.UI_USE_ITEM_FROM_SLOT, payload);
      },
      (index: number, key: string) => {
        const payload: DropItemFromSlotPayload = { slotIndex: index, itemKey: key };
        this.scene.game.events.emit(GAME_EVENTS.UI_DROP_ITEM_FROM_SLOT, payload);
      },
      (index: number, _key: string) => {
        const payload: SmeltItemFromSlotPayload = { slotIndex: index };
        this.scene.game.events.emit(GAME_EVENTS.UI_SMELT_ITEM_FROM_SLOT, payload);
      },
      (_index: number, key: string) => {
        const data = getItemData(key);
        if (data) {
          this.tooltip.show(data.name, data.description, x + 10, y + 10);
        }
      },
    );
  }

  private addFurnaceSlots(): void {
    const title = this.scene.add.text(-250, 150, "Furnace Input", {
      fontFamily: '"Courier New", monospace',
      fontSize: "18px",
      color: "#000000",
      fontStyle: "bold",
    });
    this.container.add(title);
    this.furnaceUiObjects.push(title);

    const slots = this.latestRenderData.furnaceSlots.slice(0, 3);
    const baseX = -245;
    const baseY = 200;

    for (let i = 0; i < 3; i++) {
      const slotData = slots[i] ?? { itemId: null, quantity: 0 };
      const x = baseX + i * (LAYOUT.SLOT_SIZE + 10);
      const y = baseY;

      const slotBg = this.scene.add.image(x, y, ASSETS.INVENTORY_CELL);
      slotBg.setDisplaySize(LAYOUT.SLOT_SIZE, LAYOUT.SLOT_SIZE);
      slotBg.setInteractive();
      slotBg.on("pointerover", () => slotBg.setTint(0xffd7d7));
      slotBg.on("pointerout", () => slotBg.clearTint());
      slotBg.on("pointerup", () => {
        if (this.dragSlotIndex === -1) {
          return;
        }

        const payload: SmeltItemFromSlotPayload = {
          slotIndex: this.dragSlotIndex,
          furnaceSlotIndex: i,
        };
        this.scene.game.events.emit(GAME_EVENTS.UI_SMELT_ITEM_FROM_SLOT, payload);
        this.stopDrag();
      });
      this.container.add(slotBg);
      this.furnaceUiObjects.push(slotBg);

      if (!slotData.itemId) {
        continue;
      }

      const itemIcon = this.scene.add.image(x, y, slotData.itemId);
      const scale = Math.min(
        (LAYOUT.SLOT_SIZE - 16) / itemIcon.width,
        (LAYOUT.SLOT_SIZE - 16) / itemIcon.height,
      );
      itemIcon.setScale(scale);
      this.container.add(itemIcon);
      this.furnaceUiObjects.push(itemIcon);
    }
  }

  private clearFurnaceUi(): void {
    this.furnaceUiObjects.forEach((obj) => obj.destroy());
    this.furnaceUiObjects.length = 0;
  }
}
