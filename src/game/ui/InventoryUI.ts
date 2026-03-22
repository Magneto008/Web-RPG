import Phaser from "phaser";
import { ContextMenu } from "./ContextMenu";
import { Tooltip } from "./Tooltip";
import { getItemData } from "../items/ItemRegistry";

export class InventoryUI {
  private container: Phaser.GameObjects.Container;
  private scene: Phaser.Scene;
  private slots: Phaser.GameObjects.Container[] = [];
  private isOpen: boolean = false;
  private tooltip: Tooltip;
  private contextMenu?: ContextMenu;

  constructor(scene: Phaser.Scene, tooltip: Tooltip) {
    this.scene = scene;
    this.tooltip = tooltip;

    const { width, height } = scene.scale;
    this.container = scene.add.container(width / 2, height / 2);
    this.container.setDepth(2000);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    const bg = scene.add.rectangle(0, 0, 400, 300, 0x1a1a1a, 0.95);
    bg.setStrokeStyle(4, 0x3a3a3a);
    bg.setInteractive();
    this.container.add(bg);

    const title = scene.add
      .text(0, -120, "INVENTORY", {
        fontFamily: '"Courier New", monospace',
        fontSize: "24px",
        color: "#f5f5f5",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.container.add(title);

    scene.scale.on("resize", (gameSize: Phaser.Structs.Size) => {
      this.container.setPosition(gameSize.width / 2, gameSize.height / 2);
    });
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.container.setVisible(this.isOpen);

    const gameScene = this.scene.scene.get("GameScene");
    if (this.isOpen) {
      const currentInv = (this.scene.registry.get("playerInventory") as Record<string, number>) || {};
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

    let startX = -135;
    let startY = -60;
    const slotSize = 64;
    const padding = 16;
    let index = 0;

    for (const [itemKey, count] of Object.entries(inventory)) {
      if (count <= 0) continue;

      const slotX = startX + (index % 4) * (slotSize + padding);
      const slotY = startY + Math.floor(index / 4) * (slotSize + padding);

      const slotContainer = this.scene.add.container(slotX, slotY);
      const slotBg = this.scene.add.rectangle(0, 0, slotSize, slotSize, 0x2a2a2a);
      slotBg.setStrokeStyle(2, 0x4a4a4a);

      const itemIcon = this.scene.add.image(0, 0, itemKey);
      const scale = Math.min((slotSize - 16) / itemIcon.width, (slotSize - 16) / itemIcon.height);
      itemIcon.setScale(scale);

      const countText = this.scene.add
        .text(slotSize / 2 - 4, slotSize / 2 - 4, `x${count}`, {
          fontFamily: '"Courier New", monospace',
          fontSize: "14px",
          color: "#ffffff",
          backgroundColor: "#000000aa",
          padding: { x: 2, y: 0 },
        })
        .setOrigin(1, 1);

      slotContainer.add([slotBg, itemIcon, countText]);

      const hitArea = new Phaser.Geom.Rectangle(-slotSize / 2, -slotSize / 2, slotSize, slotSize);
      slotBg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

      slotBg.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        if (pointer.button !== 0) return;
        this.showContextMenu(pointer.x, pointer.y, itemKey);
      });

      this.container.add(slotContainer);
      this.slots.push(slotContainer);
      index++;
    }
  }

  private showContextMenu(x: number, y: number, itemKey: string): void {
    this.closeContextMenu();
    
    // local coordinates for the container
    const localX = x - this.container.x;
    const localY = y - this.container.y;

    this.contextMenu = new ContextMenu(
      this.scene, localX, localY, itemKey,
      (key) => {
        this.scene.events.emit("use-item", key);
        this.toggle();
      },
      (key) => {
        const data = getItemData(key);
        if (data) {
          this.tooltip.show(data.name, data.description, x + 10, y + 10);
        }
      }
    );
    
    // Add context menu to inventory container so it follows it
    this.container.add((this.contextMenu as any).container);
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
