import Phaser from "phaser";
import { preloadAssets } from "../assets/AssetLoader";
import { Player } from "../objects/Player";
import { loadMap } from "../systems/MapLoader";
import { spawnObjects } from "../systems/ObjectSpawner";
import { createPlayerAnimations } from "../animations/playerAnimations";
import { createChestAnimations } from "../animations/chestAnimations";
import { getItemData } from "../items/ItemRegistry";
import { saveGame, loadGame } from "../systems/SaveSystem";
import { Chest } from "../objects/Chest";
import { InteractionSystem } from "../systems/InteractionSystem";

export class GameScene extends Phaser.Scene {
  private player?: Player;
  private objectColliders?: Phaser.Physics.Arcade.StaticGroup;
  private items?: Phaser.Physics.Arcade.Group;
  private chests?: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super("GameScene");
  }

  preload(): void {
    preloadAssets(this);
  }

  create(): void {
    createPlayerAnimations(this);
    createChestAnimations(this);

    this.objectColliders = this.physics.add.staticGroup();
    this.chests = this.physics.add.staticGroup();

    const { map, collisionLayers, spawnPoint, mapElement } = loadMap(this);

    const worldWidth = map.widthInPixels;
    const worldHeight = map.heightInPixels;

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    this.items = this.physics.add.group();

    const savedData = loadGame();

    spawnObjects(
      mapElement,
      this.objectColliders,
      this.items,
      this.chests,
      savedData?.collectedMapItems,
    );

    this.player = new Player({
      scene: this,
      x: spawnPoint.x,
      y: spawnPoint.y,
      speed: 150, // Base walk speed (decreased from 200)
      saveData: savedData,
    });

    collisionLayers.forEach((layer) => {
      this.physics.add.collider(this.player!, layer);
    });

    this.physics.add.collider(this.player!, this.objectColliders);
    this.physics.add.collider(this.player!, this.chests);

    // Initialize Interaction System
    new InteractionSystem(this, this.player, this.items, this.chests);

    this.cameras.main.startFollow(this.player!, true, 0.1, 0.1);
    this.cameras.main.setBackgroundColor("#1a1a1a");
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setZoom(1);
    this.registry.set("playerDebug", {
      x: this.player.x,
      y: this.player.y,
      speed: this.player.getSpeed(),
    });

    this.physics.world.createDebugGraphic();

    // Map 'H' to take damage and 'G' to heal so user can test health bar
    this.input.keyboard?.on("keydown-H", () => {
      this.player?.takeDamage(10);
    });
    this.input.keyboard?.on("keydown-G", () => {
      this.player?.heal(10);
    });

    // Auto-save loop
    this.time.addEvent({
      delay: 5000, // Save every 5 seconds
      loop: true,
      callback: () => {
        if (this.player) {
          saveGame(this.player.getSaveData());
        }
      },
    });

    // Debug hotkeys for Mora and Items
    this.input.keyboard?.on("keydown-M", () => {
      this.player?.addMora(100);
      console.log("Added 100 Mora");
    });
    this.input.keyboard?.on("keydown-N", () => {
      this.player?.removeMora(100);
      console.log("Removed 100 Mora");
    });
    this.input.keyboard?.on("keydown-Y", () => {
      const itemId = window.prompt(
        "Enter the Item ID to give to the player (e.g., 'heart-item'):",
      );
      if (itemId && this.player) {
        this.player.addItem(itemId, 1);
        console.log(`Added 1x ${itemId} to inventory.`);
      }
    });
    this.input.keyboard?.on("keydown-C", () => {
      if (this.player && this.chests && this.items) {
        const chest = new Chest({
          scene: this,
          x: this.player.x + 40,
          y: this.player.y,
          itemsGroup: this.items,
        });
        chest.name = "debug_chest_" + Date.now();
        this.chests.add(chest);
        console.log("Spawned debug chest at", chest.x, chest.y);
      }
    });

    this.scene.launch("HUDScene");

    const hudScene = this.scene.get("HUDScene");
    hudScene.events.on("use-item", (itemKey: string) => {
      const itemData = getItemData(itemKey);

      if (itemData && this.player) {
        const success = this.player.removeItem(itemKey, 1);
        if (success) {
          itemData.onUse?.(this.player);
        }
      }
    });

    hudScene.events.on("revive-player", () => {
      if (this.player) {
        this.player.revive();
      }
    });
  }

  update(): void {
    if (!this.player) return;
    this.player.update();
    this.registry.set("playerDebug", {
      x: this.player.x,
      y: this.player.y,
      speed: this.player.getSpeed(),
    });
  }
}
