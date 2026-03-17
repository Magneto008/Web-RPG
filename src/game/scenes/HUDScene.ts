import Phaser from "phaser";
import { getItemData } from "../items/ItemRegistry";

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

  private moraText?: Phaser.GameObjects.Text;

  private inventoryContainer?: Phaser.GameObjects.Container;
  private inventorySlots: Phaser.GameObjects.Container[] = [];
  private contextMenu?: Phaser.GameObjects.Container;
  private isInventoryOpen: boolean = false;
  
  private gameOverContainer?: Phaser.GameObjects.Container;

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

    const { width } = this.scale;
    const moraIcon = this.add.image(width - 120, margin + barHeight / 2, "mora-icon");
    moraIcon.setScrollFactor(0);
    moraIcon.setDepth(1000);
    moraIcon.setScale(0.8);
    
    this.moraText = this.add.text(width - 90, margin + barHeight / 2, "x 0", {
      fontFamily: '"Courier New", monospace',
      fontSize: "24px",
      color: "#facc15",
      fontStyle: "bold",
    }).setOrigin(0, 0.5);
    this.moraText.setScrollFactor(0);
    this.moraText.setDepth(1000);
    
    // Position mora icon/text dynamically on resize
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      moraIcon.setPosition(gameSize.width - 120, margin + barHeight / 2);
      this.moraText?.setPosition(gameSize.width - 90, margin + barHeight / 2);
    });

    this.registry.events.on("changedata-playerDebug", this.handlePlayerDebugChange, this);
    this.registry.events.on("changedata-playerHealth", this.handlePlayerHealthChange, this);
    this.registry.events.on("changedata-playerInventory", this.handlePlayerInventoryChange, this);
    this.registry.events.on("changedata-playerMora", this.handlePlayerMoraChange, this);
    this.registry.events.on("changedata-playerDead", this.handlePlayerDeadChange, this);
    
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.registry.events.off("changedata-playerDebug", this.handlePlayerDebugChange, this);
      this.registry.events.off("changedata-playerHealth", this.handlePlayerHealthChange, this);
      this.registry.events.off("changedata-playerInventory", this.handlePlayerInventoryChange, this);
      this.registry.events.off("changedata-playerMora", this.handlePlayerMoraChange, this);
      this.registry.events.off("changedata-playerDead", this.handlePlayerDeadChange, this);
    });

    this.createInventoryWindow();
    this.createGameOverScreen();

    // Setup input for inventory toggle
    this.input.keyboard?.on('keydown-I', this.toggleInventory, this);
    this.input.keyboard?.on('keydown-TAB', (e: Event) => {
      e.preventDefault();
      this.toggleInventory();
    });

    // Close context menu if clicked outside
    this.input.on('pointerdown', () => {
      // If we clicked, and it wasn't on the context menu or an item slot, close the menu
      this.closeContextMenu();
    });

    const initialHealth = this.registry.get("playerHealth") as PlayerHealthState | undefined;
    if (initialHealth) this.refreshHealth(initialHealth);

    const initialInv = this.registry.get("playerInventory") as Record<string, number> | undefined;
    if (initialInv) this.refreshInventory(initialInv);

    const initialMora = this.registry.get("playerMora") as number | undefined;
    if (initialMora !== undefined) this.refreshMora(initialMora);
    
    const initialDead = this.registry.get("playerDead") as boolean | undefined;
    if (initialDead !== undefined) this.handlePlayerDeadChange(this.registry, initialDead);

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

  private handlePlayerInventoryChange(
    _parent: Phaser.Data.DataManager,
    value: Record<string, number>
  ): void {
    this.refreshInventory(value);
  }

  private handlePlayerMoraChange(
    _parent: Phaser.Data.DataManager,
    value: number
  ): void {
    this.refreshMora(value);
  }
  
  private refreshMora(value: number): void {
    if (this.moraText) {
      this.moraText.setText(`x ${value}`);
    }
  }
  
  private handlePlayerDeadChange(_parent: Phaser.Data.DataManager, isDead: boolean): void {
     if (this.gameOverContainer) {
       this.gameOverContainer.setVisible(isDead);
     }
  }

  private createGameOverScreen(): void {
    const { width, height } = this.scale;
    this.gameOverContainer = this.add.container(width / 2, height / 2);
    this.gameOverContainer.setDepth(4000); // Absolute topmost
    this.gameOverContainer.setScrollFactor(0);
    this.gameOverContainer.setVisible(false);

    const bg = this.add.rectangle(0, 0, 4000, 3000, 0x000000, 0.7);
    bg.setInteractive(); // Blocks all clicks to lower containers
    this.gameOverContainer.add(bg);

    const title = this.add.text(0, -60, "GAME OVER", {
      fontFamily: '"Courier New", monospace',
      fontSize: "64px",
      color: "#ef4444",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.gameOverContainer.add(title);

    const reviveBtnBg = this.add.rectangle(0, 40, 200, 50, 0x27272a);
    reviveBtnBg.setStrokeStyle(2, 0x52525b);
    
    const reviveText = this.add.text(0, 40, "Revive", {
      fontFamily: '"Courier New", monospace',
      fontSize: "24px",
      color: "#fafafa",
      fontStyle: "bold",
    }).setOrigin(0.5);

    reviveBtnBg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => reviveBtnBg.setFillStyle(0x3f3f46))
      .on('pointerout', () => reviveBtnBg.setFillStyle(0x27272a))
      .on('pointerdown', (p: Phaser.Input.Pointer) => {
         p.event.stopPropagation();
         this.events.emit('revive-player');
      });

    this.gameOverContainer.add([reviveBtnBg, reviveText]);

    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
       this.gameOverContainer?.setPosition(gameSize.width / 2, gameSize.height / 2);
    });
  }

  private createInventoryWindow(): void {
    const { width, height } = this.scale;
    this.inventoryContainer = this.add.container(width / 2, height / 2);
    this.inventoryContainer.setDepth(2000);
    this.inventoryContainer.setScrollFactor(0);
    this.inventoryContainer.setVisible(false);

    const bg = this.add.rectangle(0, 0, 400, 300, 0x1a1a1a, 0.95);
    bg.setStrokeStyle(4, 0x3a3a3a);
    bg.setInteractive(); // Blocks clicks from passing through to game
    this.inventoryContainer.add(bg);

    const title = this.add.text(0, -120, "INVENTORY", {
      fontFamily: '"Courier New", monospace',
      fontSize: "24px",
      color: "#f5f5f5",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.inventoryContainer.add(title);
    
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.inventoryContainer?.setPosition(gameSize.width / 2, gameSize.height / 2);
    });
  }

  private toggleInventory(): void {
    this.isInventoryOpen = !this.isInventoryOpen;
    if (!this.inventoryContainer) return;

    this.inventoryContainer.setVisible(this.isInventoryOpen);

    const gameScene = this.scene.get("GameScene");
    if (this.isInventoryOpen) {
      // Refresh inventory to ensure UI is up to date when opened
      const currentInv = this.registry.get("playerInventory") as Record<string, number> || {};
      this.refreshInventory(currentInv);
      gameScene.scene.pause();
    } else {
      gameScene.scene.resume();
      this.closeContextMenu();
    }
  }

  private refreshInventory(inventory: Record<string, number>): void {
    if (!this.inventoryContainer) return;

    this.inventorySlots.forEach(slot => slot.destroy());
    this.inventorySlots = [];

    let startX = -135;
    let startY = -60;
    const slotSize = 64;
    const padding = 16;
    let index = 0;

    for (const [itemKey, count] of Object.entries(inventory)) {
      if (count <= 0) continue;

      const slotX = startX + (index % 4) * (slotSize + padding);
      const slotY = startY + Math.floor(index / 4) * (slotSize + padding);

      const slotContainer = this.add.container(slotX, slotY);
      
      const slotBg = this.add.rectangle(0, 0, slotSize, slotSize, 0x2a2a2a);
      slotBg.setStrokeStyle(2, 0x4a4a4a);
      
      const itemIcon = this.add.image(0, 0, itemKey);
      const scale = Math.min((slotSize - 16) / itemIcon.width, (slotSize - 16) / itemIcon.height);
      itemIcon.setScale(scale);

      const countText = this.add.text(slotSize / 2 - 4, slotSize / 2 - 4, `x${count}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#000000aa",
        padding: { x: 2, y: 0 }
      }).setOrigin(1, 1);

      slotContainer.add([slotBg, itemIcon, countText]);

      const hitArea = new Phaser.Geom.Rectangle(-slotSize/2, -slotSize/2, slotSize, slotSize);
      slotBg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
      
      slotBg.on('pointerover', () => {
         this.showContextMenu(slotX, slotY - 60, itemKey);
      });
      // We don't close on pointer out immediately to let them click the options.
      // We will let the background pointerdown handler close it instead.
      
      this.inventoryContainer.add(slotContainer);
      this.inventorySlots.push(slotContainer);
      index++;
    }
  }

  private showContextMenu(x: number, y: number, itemKey: string): void {
    this.closeContextMenu();

    this.contextMenu = this.add.container(x, y);
    this.contextMenu.setDepth(3000);
    this.contextMenu.setScrollFactor(0);
    this.inventoryContainer?.add(this.contextMenu);

    const bg = this.add.rectangle(0, 0, 100, 70, 0x000000, 0.95);
    bg.setOrigin(0, 0);
    bg.setStrokeStyle(2, 0x555555);
    bg.setInteractive(); // prevent clicks from passing through

    const useBg = this.add.rectangle(0, 0, 100, 35, 0x000000, 0).setOrigin(0, 0);
    const useText = this.add.text(10, 8, "Use", { fontFamily: '"Courier New", monospace', fontSize: '16px', color: '#ffffff' });
    
    useBg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => useBg.setFillStyle(0x333333, 1))
      .on('pointerout', () => useBg.setFillStyle(0x000000, 0))
      .on('pointerdown', (p: Phaser.Input.Pointer) => {
         p.event.stopPropagation();
         this.events.emit('use-item', itemKey);
         this.closeContextMenu();
         this.toggleInventory(); // close inventory safely
      });

    const infoBg = this.add.rectangle(0, 35, 100, 35, 0x000000, 0).setOrigin(0, 0);
    const infoText = this.add.text(10, 43, "Info", { fontFamily: '"Courier New", monospace', fontSize: '16px', color: '#ffffff' });

    infoBg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => infoBg.setFillStyle(0x333333, 1))
      .on('pointerout', () => infoBg.setFillStyle(0x000000, 0))
      .on('pointerdown', (p: Phaser.Input.Pointer) => {
         p.event.stopPropagation();
         
         const itemData = getItemData(itemKey);
         const name = itemData ? itemData.name : "Unknown Item";
         const desc = itemData ? itemData.description : "No description available.";
         
         window.alert(`${name}:\n\n${desc}`);
         this.closeContextMenu();
      });

    this.contextMenu.add([bg, useBg, useText, infoBg, infoText]);
  }

  private closeContextMenu(): void {
    if (this.contextMenu) {
      this.contextMenu.destroy();
      this.contextMenu = undefined;
    }
  }
}
