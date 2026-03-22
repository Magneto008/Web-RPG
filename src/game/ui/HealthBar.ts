import Phaser from "phaser";

export class HealthBar {
  private bg: Phaser.GameObjects.Graphics;
  private fill: Phaser.GameObjects.Graphics;
  private x: number;
  private y: number;
  private width: number;
  private height: number;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number = 200, height: number = 24) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.bg = scene.add.graphics();
    this.bg.setScrollFactor(0);
    this.bg.setDepth(1000);
    this.bg.fillStyle(0x000000, 0.8);
    this.bg.fillRect(x, y, width, height);
    this.bg.lineStyle(2, 0xffffff, 1);
    this.bg.strokeRect(x, y, width, height);

    this.fill = scene.add.graphics();
    this.fill.setScrollFactor(0);
    this.fill.setDepth(1001);
  }

  update(current: number, max: number): void {
    this.fill.clear();

    const percentage = Math.max(0, Math.min(1, current / max));
    const padding = 2;

    let color = 0x4ade80; // Green
    if (percentage < 0.3) color = 0xf87171; // Red
    else if (percentage < 0.6) color = 0xfacc15; // Yellow

    this.fill.fillStyle(color, 1);

    const fillWidth = Math.max(0, (this.width - padding * 2) * percentage);
    if (fillWidth > 0) {
      this.fill.fillRect(
        this.x + padding,
        this.y + padding,
        fillWidth,
        this.height - padding * 2
      );
    }
  }

  destroy(): void {
    this.bg.destroy();
    this.fill.destroy();
  }
}
