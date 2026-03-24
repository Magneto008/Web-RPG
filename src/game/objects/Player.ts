import Phaser from "phaser";
import { ASSETS } from "../assets/AssetLoader";
import { PLAYER_ANIMATION_KEYS } from "../assets/configs/PlayerAnimationConfigs";
import { GameSaveData } from "../systems/SaveSystem";
import { HealthComponent } from "../components/HealthComponent";
import { InventoryComponent } from "../components/InventoryComponent";
import { MovementComponent } from "../components/MovementComponent";
import { AnimationComponent } from "../components/AnimationComponent";
import { Entity } from "./Entity";
import { GameStore } from "../state/GameStore";
import { PlayerState } from "../types/PlayerState";

export interface PlayerConfig {
  scene: Phaser.Scene;
  store: GameStore;
  x: number;
  y: number;
  speed?: number;
  maxHealth?: number;
  saveData?: GameSaveData | null;
}

export class Player extends Entity {
  private readonly health: HealthComponent;
  private readonly inventory: InventoryComponent;
  private readonly movement: MovementComponent;
  private readonly animsHandler: AnimationComponent;
  private playerState: PlayerState = PlayerState.IDLE;

  constructor({ scene, store, x, y, speed = 150, maxHealth = 100, saveData }: PlayerConfig) {
    super(scene, saveData?.position.x ?? x, saveData?.position.y ?? y, ASSETS.PLAYER_IDLE, 0);

    const loadedInv = InventoryComponent.load();
    const invData = saveData?.inventory ?? loadedInv?.inventory ?? {};
    const moraData = saveData?.mora ?? loadedInv?.mora ?? 0;
    const collectedData = saveData?.collectedMapItems ?? loadedInv?.collectedMapItems ?? [];

    this.health = new HealthComponent(
      store,
      saveData?.health.current ?? maxHealth,
      saveData?.health.max ?? maxHealth,
      () => this.die(),
    );
    this.inventory = new InventoryComponent(scene, store, invData, moraData, collectedData);
    this.movement = new MovementComponent(scene, speed);
    this.animsHandler = new AnimationComponent(this);

    const sword = scene.add.sprite(this.x, this.y, ASSETS.SWORD_SLASH);
    sword.setDepth(this.depth + 1);
    this.animsHandler.setSwordSprite(sword);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setCollideWorldBounds(true);

    // Keep collision box close to feet area to avoid snagging against top pixels.
    this.arcadeBody.setSize(20, 12).setOffset(22, 42);

    if (saveData?.isDead) {
      this.health.setDead(true);
      this.die();
    }
  }

  update(): void {
    if (this.health.getIsDead()) {
      return;
    }

    const { x, y, isRunning, isMoving, isSpellcasting, isThrusting } = this.movement.getVelocity(false);

    if (isSpellcasting) {
      this.playerState = PlayerState.SPELLCAST;
      this.arcadeBody.setVelocity(0, 0);
      this.animsHandler.playSpellcast();
    } else if (isThrusting) {
      this.playerState = PlayerState.THRUST;
      this.arcadeBody.setVelocity(0, 0);
      this.animsHandler.playThrust();
    }

    if (!this.animsHandler.isLocked()) {
      this.arcadeBody.setVelocity(x, y);
      this.playerState = isMoving ? (isRunning ? PlayerState.RUN : PlayerState.WALK) : PlayerState.IDLE;
    } else {
      this.arcadeBody.setVelocity(0, 0);
    }

    this.setDepth(this.y);
    this.animsHandler.update(isMoving, x, y, isRunning);
  }

  takeDamage(amount: number): void {
    this.health.takeDamage(amount);
  }

  heal(amount: number): void {
    this.health.heal(amount);
  }

  restoreFullHealth(): void {
    this.health.restoreFullHealth();
  }

  revive(): void {
    this.health.revive();
    this.playerState = PlayerState.IDLE;
    this.animsHandler.update(false, 0, 0, false);
  }

  addItem(itemKey: string, amount: number = 1): void {
    this.inventory.addItem(itemKey, amount);
  }

  removeItem(itemKey: string, amount: number = 1): boolean {
    return this.inventory.removeItem(itemKey, amount);
  }

  addMora(amount: number): void {
    this.inventory.addMora(amount);
  }

  removeMora(amount: number): boolean {
    return this.inventory.removeMora(amount);
  }

  addCollectedMapItem(id: string): void {
    this.inventory.addCollectedMapItem(id);
  }

  getSpeed(): number {
    return this.movement.getCurrentSpeed();
  }

  getInventory(): InventoryComponent {
    return this.inventory;
  }

  getPlayerState(): PlayerState {
    return this.playerState;
  }

  getSaveData(): GameSaveData {
    return {
      health: {
        current: this.health.getHealth(),
        max: this.health.getMaxHealth(),
      },
      mora: this.inventory.getMora(),
      inventory: this.inventory.getInventory(),
      collectedMapItems: this.inventory.getCollectedMapItems(),
      position: { x: this.x, y: this.y },
      isDead: this.health.getIsDead(),
    };
  }

  private die(): void {
    this.playerState = PlayerState.HURT;
    this.arcadeBody.setVelocity(0, 0);
    this.anims.play(PLAYER_ANIMATION_KEYS.HURT, true);

    const penalty = Math.floor(this.inventory.getMora() / 2);
    if (penalty > 0) {
      this.inventory.removeMora(penalty);
    }
  }
}
