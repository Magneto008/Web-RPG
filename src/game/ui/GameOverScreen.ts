import Phaser from "phaser";

export class GameOverScreen {
  private container: Phaser.GameObjects.Container;
  private onRevive: () => void;

  constructor(scene: Phaser.Scene, onRevive: () => void) {
    this.onRevive = onRevive;

    const { width, height } = scene.scale;
    this.container = scene.add.container(width / 2, height / 2);
    this.container.setDepth(4000);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    const bg = scene.add.rectangle(0, 0, 4000, 3000, 0x000000, 0.7);
    bg.setInteractive(); // Block clicks
    this.container.add(bg);

    const title = scene.add
      .text(0, -60, "GAME OVER", {
        fontFamily: '"Courier New", monospace',
        fontSize: "64px",
        color: "#ef4444",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.container.add(title);

    const reviveBtnBg = scene.add.rectangle(0, 40, 200, 50, 0x27272a);
    reviveBtnBg.setStrokeStyle(2, 0x52525b);

    const reviveText = scene.add
      .text(0, 40, "Revive", {
        fontFamily: '"Courier New", monospace',
        fontSize: "24px",
        color: "#fafafa",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    reviveBtnBg
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => reviveBtnBg.setFillStyle(0x3f3f46))
      .on("pointerout", () => reviveBtnBg.setFillStyle(0x27272a))
      .on("pointerdown", (p: Phaser.Input.Pointer) => {
        p.event.stopPropagation();
        this.onRevive();
      });

    this.container.add([reviveBtnBg, reviveText]);

    scene.scale.on("resize", (gameSize: Phaser.Structs.Size) => {
      this.container.setPosition(gameSize.width / 2, gameSize.height / 2);
    });
  }

  show(): void {
    this.container.setVisible(true);
  }

  hide(): void {
    this.container.setVisible(false);
  }

  destroy(): void {
    this.container.destroy();
  }
}
