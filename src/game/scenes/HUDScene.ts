import Phaser from "phaser";

type PlayerDebugState = {
  x: number;
  y: number;
  speed: number;
};

const DEFAULT_DEBUG_STATE: PlayerDebugState = {
  x: 0,
  y: 0,
  speed: 0
};

export class HUDScene extends Phaser.Scene {
  private debugText?: Phaser.GameObjects.Text;

  constructor() {
    super("HUDScene");
  }

  create(): void {
    this.debugText = this.add.text(16, 16, "", {
      fontFamily: '"Courier New", monospace',
      fontSize: "18px",
      color: "#f5f5f5",
      backgroundColor: "#00000088",
      padding: { x: 8, y: 6 }
    });

    this.debugText.setScrollFactor(0);
    this.debugText.setDepth(1000);

    this.registry.events.on("changedata-playerDebug", this.handlePlayerDebugChange, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.registry.events.off("changedata-playerDebug", this.handlePlayerDebugChange, this);
    });
    this.refreshText((this.registry.get("playerDebug") as PlayerDebugState | undefined) ?? DEFAULT_DEBUG_STATE);
  }

  private handlePlayerDebugChange(
    _parent: Phaser.Data.DataManager,
    value: PlayerDebugState
  ): void {
    this.refreshText(value);
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
