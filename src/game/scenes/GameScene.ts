import Phaser from "phaser";
import { preloadAssets } from "../assets/AssetManager";
import { Player } from "../objects/Player";
import { loadMap } from "../systems/MapLoader";
import { spawnObjects } from "../systems/ObjectSpawner";
import { createPlayerAnimations } from "../animations/playerAnimations";

export class GameScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private player?: Player;
  private objectColliders?: Phaser.Physics.Arcade.StaticGroup;
  private items?: Phaser.Physics.Arcade.Group;

  constructor() {
    super("GameScene");
  }

  preload(): void {
    preloadAssets(this);
  }

  create(): void {
    createPlayerAnimations(this);

    this.objectColliders = this.physics.add.staticGroup();

    const { map, collisionLayers, spawnPoint, mapElement } = loadMap(this);

    const worldWidth = map.widthInPixels;
    const worldHeight = map.heightInPixels;

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    this.items = this.physics.add.group();

    spawnObjects(mapElement, this.objectColliders, this.items);

    this.player = new Player({
      scene: this,
      x: spawnPoint.x,
      y: spawnPoint.y,
      speed: 150, // Base walk speed (decreased from 200)
    });

    collisionLayers.forEach((layer) => {
      this.physics.add.collider(this.player!, layer);
    });

    this.physics.add.collider(this.player!, this.objectColliders);

    this.physics.add.overlap(this.player!, this.items, (playerObj, itemObj) => {
      const p = playerObj as Player;
      // Only heal if the player is missing health
      if (p.getHealth() < p.getMaxHealth()) {
        p.heal(20);
        itemObj.destroy();
      }
    });

    this.cursors = this.input.keyboard?.createCursorKeys();
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

    this.scene.launch("HUDScene");
  }

  update(): void {
    if (!this.player || !this.cursors) return;
    this.player.update(this.cursors);
    this.registry.set("playerDebug", {
      x: this.player.x,
      y: this.player.y,
      speed: this.player.getSpeed(),
    });
  }
}
