import Phaser from "phaser";

export class StatusUI {
  private debugText: Phaser.GameObjects.Text;
  private moraText: Phaser.GameObjects.Text;
  private moraIcon: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, margin: number, barHeight: number) {

    this.debugText = scene.add.text(margin, margin + barHeight + 8, "", {
      fontFamily: '"Courier New", monospace',
      fontSize: "18px",
      color: "#f5f5f5",
      backgroundColor: "#00000088",
      padding: { x: 8, y: 6 },
    }).setScrollFactor(0).setDepth(1000);

    const { width } = scene.scale;
    this.moraIcon = scene.add.image(width - 120, margin + barHeight / 2, "mora-icon")
      .setScrollFactor(0).setDepth(1000).setScale(0.8);

    this.moraText = scene.add.text(width - 90, margin + barHeight / 2, "x 0", {
      fontFamily: '"Courier New", monospace',
      fontSize: "24px",
      color: "#facc15",
      fontStyle: "bold",
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(1000);

    scene.scale.on("resize", (gameSize: Phaser.Structs.Size) => {
      this.moraIcon.setPosition(gameSize.width - 120, margin + barHeight / 2);
      this.moraText.setPosition(gameSize.width - 90, margin + barHeight / 2);
    });
  }

  updateDebug(x: number, y: number, speed: number): void {
    this.debugText.setText([
      `Player X: ${Math.round(x)}`,
      `Player Y: ${Math.round(y)}`,
      `Move Speed: ${speed}`,
    ]);
  }

  updateMora(value: number): void {
    this.moraText.setText(`x ${value}`);
  }
}
