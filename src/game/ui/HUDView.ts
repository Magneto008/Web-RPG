import Phaser from "phaser";
import { ASSETS } from "../assets/AssetLoader";
import { GAME_EVENTS, GameStateChangedPayload } from "../events/GameEvents";
import { GameState } from "../types/GameState";
import { GameStoreSnapshot } from "../state/GameStore";
import { GameOverScreen } from "./GameOverScreen";
import { HealthBar } from "./HealthBar";
import { InventoryUI } from "./InventoryUI";
import { ManaBar } from "./ManaBar";
import { StatusUI } from "./StatusUI";
import { Tooltip } from "./Tooltip";
import { UIFactory } from "./UIFactory";

export class HUDView {
  private readonly healthBar: HealthBar;
  private readonly manaBar: ManaBar;
  private readonly inventoryUI: InventoryUI;
  private readonly gameOverScreen: GameOverScreen;
  private readonly tooltip: Tooltip;
  private readonly statusUI: StatusUI;

  private readonly onPointerDown: (
    pointer: Phaser.Input.Pointer,
    currentlyOver: Phaser.GameObjects.GameObject[],
  ) => void;

  private readonly onKeyI: () => void;
  private readonly onKeyTab: (event: KeyboardEvent) => void;
  private readonly onOpenInventoryForFurnace: () => void;

  constructor(private readonly scene: Phaser.Scene) {
    const margin = 16;
    const barHeight = 24;

    this.healthBar = new HealthBar(scene, margin, margin, 200, barHeight);
    this.manaBar = new ManaBar(scene, margin, margin + barHeight + 4, 200, barHeight);
    this.tooltip = new Tooltip(scene);
    this.inventoryUI = new InventoryUI(scene, this.tooltip);
    this.gameOverScreen = new GameOverScreen(scene, () => {
      scene.game.events.emit(GAME_EVENTS.UI_REVIVE_PLAYER);
    });
    this.statusUI = new StatusUI(scene, margin, barHeight, barHeight * 2 + 12);

    scene.add
      .text(scene.scale.width - 250, margin, "Help", {
        fontSize: "20px",
        padding: { x: 10, y: 5 },
        backgroundColor: "#333333",
        color: "#ffffff",
      })
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.showHelp());

    this.onKeyI = () => this.toggleInventory();
    this.onKeyTab = (event: KeyboardEvent) => {
      event.preventDefault();
      this.toggleInventory();
    };

    this.onPointerDown = (_pointer, currentlyOver) => {
      if (currentlyOver.length === 0) {
        this.inventoryUI.closeContextMenu();
        this.tooltip.hide();
      }
    };

    this.onOpenInventoryForFurnace = () => {
      const openedNow = this.inventoryUI.open();
      if (openedNow) {
        const payload: GameStateChangedPayload = { state: GameState.PAUSED };
        this.scene.game.events.emit(GAME_EVENTS.GAME_STATE_CHANGED, payload);
      }
    };

    this.scene.input.mouse?.disableContextMenu();
    this.scene.input.keyboard?.on("keydown-I", this.onKeyI);
    this.scene.input.keyboard?.on("keydown-TAB", this.onKeyTab);
    this.scene.input.on("pointerdown", this.onPointerDown);
    this.scene.game.events.on(GAME_EVENTS.UI_OPEN_INVENTORY_FOR_FURNACE, this.onOpenInventoryForFurnace);
  }

  render(snapshot: Readonly<GameStoreSnapshot>): void {
    this.healthBar.update(snapshot.playerHealth.current, snapshot.playerHealth.max);
    this.manaBar.update(snapshot.playerMana.current, snapshot.playerMana.max);
    this.statusUI.updateMora(snapshot.playerMora);
    this.statusUI.updateDebug(
      snapshot.playerDebug.x,
      snapshot.playerDebug.y,
      snapshot.playerDebug.speed,
    );

    this.inventoryUI.setRenderData({
      inventory: snapshot.playerInventory,
      furnaceSlots: snapshot.furnaceSlots,
      furnaceUiOpen: snapshot.furnaceUiOpen,
      health: snapshot.playerHealth,
      mora: snapshot.playerMora,
    });

    if (snapshot.playerDead) {
      this.gameOverScreen.show();
    } else {
      this.gameOverScreen.hide();
    }
  }

  destroy(): void {
    this.scene.input.keyboard?.off("keydown-I", this.onKeyI);
    this.scene.input.keyboard?.off("keydown-TAB", this.onKeyTab);
    this.scene.input.off("pointerdown", this.onPointerDown);
    this.scene.game.events.off(
      GAME_EVENTS.UI_OPEN_INVENTORY_FOR_FURNACE,
      this.onOpenInventoryForFurnace,
    );

    this.healthBar.destroy();
    this.manaBar.destroy();
    this.inventoryUI.destroy();
    this.gameOverScreen.destroy();
    this.statusUI.destroy();
    this.tooltip.destroy();
  }

  private toggleInventory(): void {
    const isOpen = this.inventoryUI.toggle();
    if (!isOpen) {
      this.scene.game.events.emit(GAME_EVENTS.UI_CLOSE_FURNACE);
    }
    const payload: GameStateChangedPayload = {
      state: isOpen ? GameState.PAUSED : GameState.RUNNING,
    };

    this.scene.game.events.emit(GAME_EVENTS.GAME_STATE_CHANGED, payload);
  }

  private showHelp(): void {
    UIFactory.createDialog(this.scene, {
      x: this.scene.scale.width / 2,
      y: this.scene.scale.height / 2,
      title: "Game Help",
      content:
        "Welcome to the Web RPG!\n- Press [I] or [TAB] to open inventory.\n- Click objects to interact.\n- Explore and have fun!",
      backgroundKey: ASSETS.TITLE_BG,
      buttonKey: ASSETS.TITLE_PLAY,
    });
  }
}
