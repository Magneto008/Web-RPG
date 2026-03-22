import Phaser from "phaser";

export class Tooltip {
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Rectangle;
  private nameText: Phaser.GameObjects.Text;
  private descText: Phaser.GameObjects.Text;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(3500);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    this.bg = scene.add
      .rectangle(0, 0, 200, 100, 0x000000, 0.95)
      .setOrigin(0)
      .setStrokeStyle(2, 0x888888);

    this.nameText = scene.add.text(10, 8, "", {
      fontFamily: '"Courier New", monospace',
      fontSize: "16px",
      color: "#ffd166",
      fontStyle: "bold",
    });

    this.descText = scene.add.text(10, 35, "", {
      fontFamily: '"Courier New", monospace',
      fontSize: "13px",
      color: "#ffffff",
      wordWrap: { width: 180 },
    });

    this.container.add([this.bg, this.nameText, this.descText]);
  }

  show(name: string, desc: string, x: number, y: number): void {
    this.nameText.setText(name);
    this.descText.setText(desc);

    const padding = 10;
    const width = Math.max(this.nameText.width, this.descText.width) + padding * 2;
    const height = this.nameText.height + this.descText.height + padding * 2 + 10;

    this.bg.setSize(width, height);

    const { width: screenW, height: screenH } = this.scene.scale;
    let posX = x;
    let posY = y;

    if (posX + width > screenW) posX = x - width - 10;
    if (posY + height > screenH) posY = screenH - height - 10;

    this.container.setPosition(posX, posY);
    this.scene.tweens.killTweensOf(this.container);
    this.container.setAlpha(0);
    this.container.setVisible(true);

    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 120,
    });
  }

  hide(): void {
    this.container.setVisible(false);
  }

  destroy(): void {
    this.container.destroy();
  }
}
