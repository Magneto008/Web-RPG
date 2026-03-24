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
import { StatusEffect } from "../types/StatusEffect";
import { ManaComponent } from "../components/ManaComponent";

export interface PlayerConfig {
  scene: Phaser.Scene;
  store: GameStore;
  x: number;
  y: number;
  speed?: number;
  maxHealth?: number;
  maxMana?: number;
  saveData?: GameSaveData | null;
}

export class Player extends Entity {
  private readonly healthComponent: HealthComponent;
  private readonly manaComponent: ManaComponent;
  private readonly inventory: InventoryComponent;
  private readonly movement: MovementComponent;
  private readonly animsHandler: AnimationComponent;
  private playerState: PlayerState = PlayerState.IDLE;
  private onSpellcastRequested?: () => boolean;
  private onSpellcastComplete?: () => void;

  public stats = {
    speed: 150,
    damage: 10,
    defense: 5,
  };

  public activeEffects: StatusEffect[] = [];

  constructor({ scene, store, x, y, speed = 150, maxHealth = 100, maxMana = 100, saveData }: PlayerConfig) {
    super(scene, saveData?.position.x ?? x, saveData?.position.y ?? y, ASSETS.PLAYER_IDLE, 0);

    const loadedInv = InventoryComponent.load();
    const invData = saveData?.inventory ?? loadedInv?.inventory ?? {};
    const moraData = saveData?.mora ?? loadedInv?.mora ?? 0;
    const collectedData = saveData?.collectedMapItems ?? loadedInv?.collectedMapItems ?? [];

    this.stats.speed = speed;

    this.healthComponent = new HealthComponent(
      store,
      saveData?.health.current ?? maxHealth,
      saveData?.health.max ?? maxHealth,
      () => this.die(),
    );

    this.manaComponent = new ManaComponent(
      store,
      saveData?.mana?.current ?? maxMana,
      saveData?.mana?.max ?? maxMana,
    );

    this.health = this.healthComponent.getHealth();
    this.maxHealth = this.healthComponent.getMaxHealth();
    this.mana = this.manaComponent.getMana();
    this.maxMana = this.manaComponent.getMaxMana();

    this.inventory = new InventoryComponent(scene, store, invData, moraData, collectedData);
    this.movement = new MovementComponent(scene, this.stats.speed);
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
      this.healthComponent.setDead(true);
      this.die();
    }
  }

  // User requested properties
  public health!: number;
  public maxHealth!: number;
  public mana!: number;
  public maxMana!: number;

  update(_time: number, delta: number): void {
    if (this.healthComponent.getIsDead()) {
      return;
    }

    this.updateEffects(delta);

    const { x, y, isRunning, isMoving, isSpellcasting, isThrusting } = this.movement.getVelocity(false);

    if (isSpellcasting) {
      const canStartSpellcast = this.onSpellcastRequested ? this.onSpellcastRequested() : true;
      if (canStartSpellcast) {
        this.playerState = PlayerState.SPELLCAST;
        this.arcadeBody.setVelocity(0, 0);
        this.animsHandler.playSpellcast(() => {
          this.onSpellcastComplete?.();
        }, 1);
      }
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
    this.healthComponent.takeDamage(amount);
    this.health = this.healthComponent.getHealth();
  }

  heal(amount: number): void {
    this.healthComponent.heal(amount);
    this.health = this.healthComponent.getHealth();
  }

  restoreMana(amount: number): void {
    this.manaComponent.restoreMana(amount);
    this.mana = this.manaComponent.getMana();
  }

  useMana(amount: number): boolean {
    const success = this.manaComponent.useMana(amount);
    if (success) {
      this.mana = this.manaComponent.getMana();
    }
    return success;
  }

  getMana(): number {
    return this.manaComponent.getMana();
  }

  getMaxMana(): number {
    return this.manaComponent.getMaxMana();
  }

  restoreFullHealth(): void {
    this.healthComponent.restoreFullHealth();
    this.health = this.healthComponent.getHealth();
  }

  addStatusEffect(effect: StatusEffect): void {
    this.activeEffects.push(effect);
    if (effect.onApply) {
      effect.onApply(this);
    }
  }

  removeStatusEffect(effectId: string): void {
    const index = this.activeEffects.findIndex((e) => e.id === effectId);
    if (index !== -1) {
      const effect = this.activeEffects[index];
      if (effect.onExpire) {
        effect.onExpire(this);
      }
      this.activeEffects.splice(index, 1);
    }
  }

  updateEffects(delta: number): void {
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i];
      effect.elapsed += delta;

      if (effect.tickInterval) {
        const lastTick = Math.floor((effect.elapsed - delta) / effect.tickInterval);
        const currentTick = Math.floor(effect.elapsed / effect.tickInterval);

        if (currentTick > lastTick) {
          if (effect.healPerTick) {
            this.heal(effect.healPerTick);
          }
          if (effect.manaPerTick) {
            this.restoreMana(effect.manaPerTick);
          }
        }
      }

      if (effect.elapsed >= effect.duration) {
        this.removeStatusEffect(effect.id);
      }
    }
  }

  revive(): void {
    this.healthComponent.revive();
    this.health = this.healthComponent.getHealth();
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
    return this.stats.speed;
  }

  getInventory(): InventoryComponent {
    return this.inventory;
  }

  getPlayerState(): PlayerState {
    return this.playerState;
  }

  setSpellcastHandlers(onRequest: () => boolean, onComplete: () => void): void {
    this.onSpellcastRequested = onRequest;
    this.onSpellcastComplete = onComplete;
  }

  getSaveData(): GameSaveData {
    return {
      health: {
        current: this.healthComponent.getHealth(),
        max: this.healthComponent.getMaxHealth(),
      },
      mana: {
        current: this.manaComponent.getMana(),
        max: this.manaComponent.getMaxMana(),
      },
      mora: this.inventory.getMora(),
      inventory: this.inventory.getInventory(),
      collectedMapItems: this.inventory.getCollectedMapItems(),
      position: { x: this.x, y: this.y },
      isDead: this.healthComponent.getIsDead(),
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
