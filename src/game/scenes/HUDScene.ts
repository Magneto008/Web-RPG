import Phaser from "phaser";

type PlayerDebugState = {
  x: number;
  y: number;
  speed: number;
};

type PlayerHealthState = {
  current: number;
  max: number;
};

const DEFAULT_DEBUG_STATE: PlayerDebugState = {
  x: 0,
  y: 0,
  speed: 0
};

export class HUDScene extends Phaser.Scene {
  private debugText?: Phaser.GameObjects.Text;
  private healthBarBg?: Phaser.GameObjects.Graphics;
  private healthBarFill?: Phaser.GameObjects.Graphics;

  constructor() {
    super("HUDScene");
  }

  create(): void {
    const margin = 16;
    const barWidth = 200;
    const barHeight = 24;

    this.healthBarBg = this.add.graphics();
    this.healthBarBg.setScrollFactor(0);
    this.healthBarBg.setDepth(1000);
    this.healthBarBg.fillStyle(0x000000, 0.8);
    this.healthBarBg.fillRect(margin, margin, barWidth, barHeight);
    this.healthBarBg.lineStyle(2, 0xffffff, 1);
    this.healthBarBg.strokeRect(margin, margin, barWidth, barHeight);

    this.healthBarFill = this.add.graphics();
    this.healthBarFill.setScrollFactor(0);
    this.healthBarFill.setDepth(1001);

    this.debugText = this.add.text(margin, margin + barHeight + 8, "", {
      fontFamily: '"Courier New", monospace',
      fontSize: "18px",
      color: "#f5f5f5",
      backgroundColor: "#00000088",
      padding: { x: 8, y: 6 }
    });

    this.debugText.setScrollFactor(0);
    this.debugText.setDepth(1000);

    this.registry.events.on("changedata-playerDebug", this.handlePlayerDebugChange, this);
    this.registry.events.on("changedata-playerHealth", this.handlePlayerHealthChange, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.registry.events.off("changedata-playerDebug", this.handlePlayerDebugChange, this);
      this.registry.events.off("changedata-playerHealth", this.handlePlayerHealthChange, this);
    });

    const initialHealth = this.registry.get("playerHealth") as PlayerHealthState | undefined;
    if (initialHealth) this.refreshHealth(initialHealth);

    this.refreshText((this.registry.get("playerDebug") as PlayerDebugState | undefined) ?? DEFAULT_DEBUG_STATE);
  }

  private handlePlayerDebugChange(
    _parent: Phaser.Data.DataManager,
    value: PlayerDebugState
  ): void {
    this.refreshText(value);
  }

  private handlePlayerHealthChange(
    _parent: Phaser.Data.DataManager,
    value: PlayerHealthState
  ): void {
    this.refreshHealth(value);
  }

  private refreshHealth(health: PlayerHealthState): void {
    if (!this.healthBarFill) return;
    
    const margin = 16;
    const barWidth = 200;
    const barHeight = 24;
    const padding = 2; // inner padding for the fill
    
    this.healthBarFill.clear();
    
    const percentage = Math.max(0, Math.min(1, health.current / health.max));
    
    // Choose color based on health percentage
    let color = 0x4ade80; // Green
    if (percentage < 0.3) color = 0xf87171; // Red
    else if (percentage < 0.6) color = 0xfacc15; // Yellow
    
    this.healthBarFill.fillStyle(color, 1);
    
    const fillWidth = Math.max(0, (barWidth - padding * 2) * percentage);
    if (fillWidth > 0) {
      this.healthBarFill.fillRect(
        margin + padding, 
        margin + padding, 
        fillWidth, 
        barHeight - padding * 2
      );
    }
  }

  private refreshText(value: PlayerDebugState): void {
    if (!this.debugText) {
      return;
    }

    this.debugText.setText([
      `Player X: ${Math.round(value.x)}`,
      `Player Y: ${Math.round(value.y)}`,
      `Move Speed: ${value.speed}`
    ]);
  }
}
