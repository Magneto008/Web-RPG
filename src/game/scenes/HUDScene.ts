import Phaser from "phaser";
import { ASSETS } from "../assets/AssetLoader";
import { HealthBar } from "../ui/HealthBar";
import { InventoryUI } from "../ui/InventoryUI";
import { GameOverScreen } from "../ui/GameOverScreen";
import { Tooltip } from "../ui/Tooltip";
import { StatusUI } from "../ui/StatusUI";
import { UIFactory } from "../ui/UIFactory";

export class HUDScene extends Phaser.Scene {
  private healthBar!: HealthBar;
  private inventoryUI!: InventoryUI;
  private gameOverScreen!: GameOverScreen;
  private tooltip!: Tooltip;
  private statusUI!: StatusUI;

  constructor() { super("HUDScene"); }

  create(): void {
    const margin = 16;
    const barHeight = 24;

    this.healthBar = new HealthBar(this, margin, margin, 200, barHeight);
    this.tooltip = new Tooltip(this);
    this.inventoryUI = new InventoryUI(this, this.tooltip);
    this.gameOverScreen = new GameOverScreen(this, () => this.events.emit("revive-player"));
    this.statusUI = new StatusUI(this, margin, barHeight);

    // Help Button - Move to the left of Mora
    this.add.text(this.scale.width - 250, margin, "Help", {
      fontSize: "20px",
      padding: { x: 10, y: 5 },
      backgroundColor: "#333333",
      color: "#ffffff"
    })
    .setInteractive({ useHandCursor: true })
    .on("pointerdown", () => this.showHelp());

    this.setupRegistry();
    this.setupInput();
    this.refresh();
  }

  private showHelp(): void {
    UIFactory.createDialog(this, {
      x: this.scale.width / 2,
      y: this.scale.height / 2,
      title: "Game Help",
      content: "Welcome to the Web RPG!\n- Press [I] or [TAB] to open inventory.\n- Click objects to interact.\n- Explore and have fun!",
      backgroundKey: ASSETS.TITLE_BG,
      buttonKey: ASSETS.TITLE_PLAY,
      onConfirm: () => {
        console.log("Help dialog closed");
      }
    });
  }

  private setupRegistry(): void {
    this.registry.events.on("changedata-playerDebug", (_p: any, v: any) => this.statusUI.updateDebug(v.x, v.y, v.speed));
    this.registry.events.on("changedata-playerHealth", (_p: any, v: any) => this.healthBar.update(v.current, v.max));
    this.registry.events.on("changedata-playerInventory", (_p: any, v: any) => this.inventoryUI.refresh(v));
    this.registry.events.on("changedata-playerMora", (_p: any, v: number) => this.statusUI.updateMora(v));
    this.registry.events.on("changedata-playerDead", (_p: any, isDead: boolean) => isDead ? this.gameOverScreen.show() : this.gameOverScreen.hide());
  }

  private setupInput(): void {
    this.input.mouse?.disableContextMenu();
    this.input.keyboard?.on("keydown-I", () => this.inventoryUI.toggle());
    this.input.keyboard?.on("keydown-TAB", (e: Event) => { e.preventDefault(); this.inventoryUI.toggle(); });
    this.input.on("pointerdown", (_pointer: Phaser.Input.Pointer, currentlyOver: any[]) => {
      // Only close UI if we clicked on empty space (no game objects under pointer)
      if (currentlyOver.length === 0) {
        this.inventoryUI.closeContextMenu();
        this.tooltip.hide();
      }
    });
  }

  private refresh(): void {
    const h = this.registry.get("playerHealth"); if (h) this.healthBar.update(h.current, h.max);
    const i = this.registry.get("playerInventory"); if (i) this.inventoryUI.refresh(i);
    const m = this.registry.get("playerMora"); if (m !== undefined) this.statusUI.updateMora(m);
    if (this.registry.get("playerDead")) this.gameOverScreen.show();
    const d = this.registry.get("playerDebug") || { x: 0, y: 0, speed: 0 };
    this.statusUI.updateDebug(d.x, d.y, d.speed);
  }
}
