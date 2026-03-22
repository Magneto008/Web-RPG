import Phaser from "phaser";

export class ContextMenu {
  public container: Phaser.GameObjects.Container;
  private onUse: (index: number, key: string) => void;
  private onDrop: (index: number, key: string) => void;
  private onInfo: (index: number, key: string) => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    slotIndex: number,
    itemKey: string,
    onUse: (index: number, key: string) => void,
    onDrop: (index: number, key: string) => void,
    onInfo: (index: number, key: string) => void
  ) {
    this.onUse = onUse;
    this.onDrop = onDrop;
    this.onInfo = onInfo;

    this.container = scene.add.container(x, y);
    this.container.setDepth(3000);
    this.container.setScrollFactor(0);

    const width = 100;
    const itemHeight = 35;
    const bg = scene.add.rectangle(0, 0, width, itemHeight * 3, 0x000000, 0.95);
    bg.setOrigin(0, 0);
    bg.setStrokeStyle(2, 0x555555);
    bg.setInteractive();

    const createOption = (label: string, yOffset: number, callback: () => void) => {
      const optionBg = scene.add.rectangle(0, yOffset, width, itemHeight, 0x000000, 0).setOrigin(0, 0);
      const text = scene.add.text(10, yOffset + 8, label, {
        fontFamily: '"Courier New", monospace',
        fontSize: "16px",
        color: "#ffffff",
      });

      optionBg
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => optionBg.setFillStyle(0x333333, 1))
        .on("pointerout", () => optionBg.setFillStyle(0x000000, 0))
        .on("pointerdown", (p: Phaser.Input.Pointer) => {
          p.event.stopPropagation();
          callback();
          this.destroy();
        });

      return [optionBg, text];
    };

    const useOptions = createOption("Use", 0, () => this.onUse(slotIndex, itemKey));
    const dropOptions = createOption("Drop", itemHeight, () => this.onDrop(slotIndex, itemKey));
    const infoOptions = createOption("Info", itemHeight * 2, () => this.onInfo(slotIndex, itemKey));

    this.container.add([bg, ...useOptions, ...dropOptions, ...infoOptions]);
  }

  destroy(): void {
    this.container.destroy();
  }
}
