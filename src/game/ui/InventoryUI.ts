import Phaser from "phaser";
import { ContextMenu } from "./ContextMenu";
import { Tooltip } from "./Tooltip";
import { getItemData } from "../items/ItemRegistry";
import { ASSETS } from "../assets/AssetLoader";

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
  private isOpen: boolean = false;
  private tooltip: Tooltip;
  private contextMenu?: ContextMenu;
  private statsIcons: Phaser.GameObjects.Image[] = [];
  private statsText: Phaser.GameObjects.Text[] = [];

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

    scene.scale.on("resize", (gameSize: Phaser.Structs.Size) => {
      this.container.setPosition(gameSize.width / 2, gameSize.height / 2);
    });
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.container.setVisible(this.isOpen);

    const gameScene = this.scene.scene.get("GameScene");
    if (this.isOpen) {
      const currentInv =
        (this.scene.registry.get("playerInventory") as Record<
          string,
          number
        >) || {};
      this.refresh(currentInv);
      gameScene.scene.pause();
    } else {
      gameScene.scene.resume();
      this.closeContextMenu();
      this.tooltip.hide();
    }
  }

  refresh(inventory: Record<string, number>): void {
    this.slots.forEach((slot) => slot.destroy());
    this.slots = [];
    this.clearStats();

    // Stats Section
    const hp = this.scene.registry.get("playerHealth") || {
      current: 0,
      max: 0,
    };
    this.addStat(
      LAYOUT.STATS_X_OFFSET,
      LAYOUT.STATS_Y_START,
      ASSETS.HP_ICON,
      `${hp.current}/${hp.max}`,
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
      "0/100",
    );

    // Inventory Items Filter
    const inventoryItems = Object.entries(inventory).filter(
      ([_, count]) => count > 0,
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

      // Always render slot background
      const slotBg = this.scene.add.image(0, 0, ASSETS.INVENTORY_CELL);
      slotBg.setDisplaySize(LAYOUT.SLOT_SIZE, LAYOUT.SLOT_SIZE);
      slotContainer.add(slotBg);

      // Render item if exists for this slot
      if (i < inventoryItems.length) {
        const [itemKey, count] = inventoryItems[i];

        const itemIcon = this.scene.add.image(0, 0, itemKey);
        const scale = Math.min(
          (LAYOUT.SLOT_SIZE - 16) / itemIcon.width,
          (LAYOUT.SLOT_SIZE - 16) / itemIcon.height,
        );
        itemIcon.setScale(scale);

        const countText = this.scene.add
          .text(
            LAYOUT.SLOT_SIZE / 2 - 6,
            LAYOUT.SLOT_SIZE / 2 - 6,
            `x${count}`,
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

        // Interactive area for item
        const hitArea = new Phaser.Geom.Rectangle(
          -LAYOUT.SLOT_SIZE / 2,
          -LAYOUT.SLOT_SIZE / 2,
          LAYOUT.SLOT_SIZE,
          LAYOUT.SLOT_SIZE,
        );
        slotBg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

        slotBg.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
          // Trigger context menu ONLY on Right Click (button 2)
          // Note: rexUI's click events can sometimes interfere with Phaser's native pointer events,
          // especially when dealing with right-clicks or specific button presses.
          // Ensure no rexUI elements are overlapping or capturing these events if unexpected behavior occurs.
          if (pointer.button === 2) {
            console.log("DEBUG: Right click on", itemKey, "at", pointer.x, pointer.y);
            this.showContextMenu(pointer.x, pointer.y, itemKey);
          }
        });
      }

      this.container.add(slotContainer);
      this.slots.push(slotContainer);
    }
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

  private showContextMenu(x: number, y: number, itemKey: string): void {
    this.closeContextMenu();

    this.contextMenu = new ContextMenu(
      this.scene,
      x,
      y,
      itemKey,
      (key) => {
        this.scene.events.emit("use-item", key);
        this.toggle();
      },
      (key) => {
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
