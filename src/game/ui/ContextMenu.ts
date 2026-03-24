import Phaser from "phaser";

export class ContextMenu {
  readonly container: Phaser.GameObjects.Container;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    slotIndex: number,
    itemKey: string,
    onUse: (index: number, key: string) => void,
    onDrop: (index: number, key: string) => void,
    onSmelt: (index: number, key: string) => void,
    onInfo: (index: number, key: string) => void,
  ) {
    this.container = scene.add.container(x, y);
    this.container.setDepth(3000);
    this.container.setScrollFactor(0);

    const width = 100;
    const itemHeight = 30;

    const bg = scene.add.rectangle(0, 0, width, itemHeight * 4, 0x000000, 0.95);
    bg.setOrigin(0, 0);
    bg.setStrokeStyle(2, 0x555555);
    bg.setInteractive();

    const createOption = (
      label: string,
      yOffset: number,
      callback: () => void,
    ): [Phaser.GameObjects.Rectangle, Phaser.GameObjects.Text] => {
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
        .on("pointerdown", (pointer: Phaser.Input.Pointer) => {
          pointer.event.stopPropagation();
          callback();
          this.destroy();
        });

      return [optionBg, text];
    };

    const useOptions = createOption("Use", 0, () => onUse(slotIndex, itemKey));
    const dropOptions = createOption("Drop", itemHeight, () => onDrop(slotIndex, itemKey));
    const smeltOptions = createOption("Smelt", itemHeight * 2, () => onSmelt(slotIndex, itemKey));
    const infoOptions = createOption("Info", itemHeight * 3, () => onInfo(slotIndex, itemKey));

    this.container.add([bg, ...useOptions, ...dropOptions, ...smeltOptions, ...infoOptions]);
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
