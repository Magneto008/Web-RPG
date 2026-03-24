import Phaser from "phaser";
import { ASSETS } from "../assets/AssetLoader";

export class StatusUI {
  private readonly debugText: Phaser.GameObjects.Text;
  private readonly moraText: Phaser.GameObjects.Text;
  private readonly moraIcon: Phaser.GameObjects.Image;

  private readonly onResize: (gameSize: Phaser.Structs.Size) => void;

  constructor(private readonly scene: Phaser.Scene, margin: number, barHeight: number, debugYOffset: number = barHeight + 8) {
    this.debugText = scene.add
      .text(margin, margin + debugYOffset, "", {
        fontFamily: '"Courier New", monospace',
        fontSize: "18px",
        color: "#f5f5f5",
        backgroundColor: "#00000088",
        padding: { x: 8, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(1000);

    const { width } = scene.scale;
    this.moraIcon = scene.add
      .image(width - 120, margin + barHeight / 2, ASSETS.MORA_ICON)
      .setScrollFactor(0)
      .setDepth(1000)
      .setScale(0.8);

    this.moraText = scene.add
      .text(width - 90, margin + barHeight / 2, "x 0", {
        fontFamily: '"Courier New", monospace',
        fontSize: "24px",
        color: "#facc15",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(1000);

    this.onResize = (gameSize: Phaser.Structs.Size): void => {
      this.moraIcon.setPosition(gameSize.width - 120, margin + barHeight / 2);
      this.moraText.setPosition(gameSize.width - 90, margin + barHeight / 2);
    };

    scene.scale.on("resize", this.onResize);
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

  destroy(): void {
    this.scene.scale.off("resize", this.onResize);
    this.debugText.destroy();
    this.moraIcon.destroy();
    this.moraText.destroy();
  }
}
