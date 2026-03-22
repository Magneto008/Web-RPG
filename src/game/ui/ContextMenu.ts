import Phaser from "phaser";

export class ContextMenu {
  public container: Phaser.GameObjects.Container;
  private onUse: (key: string) => void;
  private onInfo: (key: string) => void;

  constructor(scene: Phaser.Scene, x: number, y: number, itemKey: string, onUse: (key: string) => void, onInfo: (key: string) => void) {
    this.onUse = onUse;
    this.onInfo = onInfo;

    this.container = scene.add.container(x, y);
    this.container.setDepth(3000);
    this.container.setScrollFactor(0);

    const bg = scene.add.rectangle(0, 0, 100, 70, 0x000000, 0.95);
    bg.setOrigin(0, 0);
    bg.setStrokeStyle(2, 0x555555);
    bg.setInteractive();

    const useBg = scene.add.rectangle(0, 0, 100, 35, 0x000000, 0).setOrigin(0, 0);
    const useText = scene.add.text(10, 8, "Use", {
      fontFamily: '"Courier New", monospace',
      fontSize: "16px",
      color: "#ffffff",
    });

    useBg
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => useBg.setFillStyle(0x333333, 1))
      .on("pointerout", () => useBg.setFillStyle(0x000000, 0))
      .on("pointerdown", (p: Phaser.Input.Pointer) => {
        p.event.stopPropagation();
        this.onUse(itemKey);
        this.destroy();
      });

    const infoBg = scene.add.rectangle(0, 35, 100, 35, 0x000000, 0).setOrigin(0, 0);
    const infoText = scene.add.text(10, 43, "Info", {
      fontFamily: '"Courier New", monospace',
      fontSize: "16px",
      color: "#ffffff",
    });

    infoBg
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => infoBg.setFillStyle(0x333333, 1))
      .on("pointerout", () => infoBg.setFillStyle(0x000000, 0))
      .on("pointerdown", (p: Phaser.Input.Pointer) => {
        p.event.stopPropagation();
        this.onInfo(itemKey);
        this.destroy();
      });

    this.container.add([bg, useBg, useText, infoBg, infoText]);
  }

  destroy(): void {
    this.container.destroy();
  }
}
