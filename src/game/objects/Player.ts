import Phaser from "phaser";
import { ASSETS } from "../assets/AssetLoader";
import { PLAYER_ANIMATION_KEYS } from "../assets/configs/PlayerAnimationConfigs";
import { GameSaveData } from "../systems/SaveSystem";
import { HealthComponent } from "../components/HealthComponent";
import { InventoryComponent } from "../components/InventoryComponent";
import { MovementComponent } from "../components/MovementComponent";
import { AnimationComponent } from "../components/AnimationComponent";

export class Player extends Phaser.Physics.Arcade.Sprite {
  private health: HealthComponent;
  private inventory: InventoryComponent;
  private movement: MovementComponent;
  private animsHandler: AnimationComponent;

  constructor({ scene, x, y, speed = 150, maxHealth = 100, saveData }: any) {
    super(scene, saveData?.position.x ?? x, saveData?.position.y ?? y, ASSETS.PLAYER_IDLE, 0);

    const loadedInv = InventoryComponent.load();
    const invData = saveData?.inventory ?? loadedInv?.inventory ?? {};
    const moraData = saveData?.mora ?? loadedInv?.mora ?? 0;
    const collectedData = saveData?.collectedMapItems ?? loadedInv?.collectedMapItems ?? [];

    this.health = new HealthComponent(scene, saveData?.health.current ?? maxHealth, saveData?.health.max ?? maxHealth, () => this.die());
    this.inventory = new InventoryComponent(scene, invData, moraData, collectedData);
    this.movement = new MovementComponent(scene, speed);
    this.animsHandler = new AnimationComponent(this);

    // Initialise Sword Slash Effect
    const sword = scene.add.sprite(this.x, this.y, ASSETS.SWORD_SLASH);
    sword.setDepth(this.depth + 1);
    this.animsHandler.setSwordSprite(sword);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 0.5);
    this.setCollideWorldBounds(true);
    (this.body as any).setSize(20, 12).setOffset(22, 42);

    if (saveData?.isDead) { this.health.setDead(true); this.die(); }
  }

  update(): void {
    if (this.health.getIsDead()) return;
    
    const { x, y, isRunning, isMoving, isSpellcasting, isThrusting } = this.movement.getVelocity(false);
    
    if (isSpellcasting) {
      (this.body as any).setVelocity(0, 0);
      this.animsHandler.playSpellcast();
    } else if (isThrusting) {
      (this.body as any).setVelocity(0, 0);
      this.animsHandler.playThrust();
    }

    if (!this.animsHandler.isLocked()) {
      (this.body as any).setVelocity(x, y);
    } else {
      (this.body as any).setVelocity(0, 0);
    }

    this.setDepth(this.y);
    this.animsHandler.update(isMoving, x, y, isRunning);
  }

  takeDamage(amt: number): void { this.health.takeDamage(amt); }
  heal(amt: number): void { this.health.heal(amt); }
  revive(): void { this.health.revive(); this.animsHandler.update(false, 0, 0, false); }
  addItem(k: string, a: number = 1): void { this.inventory.addItem(k, a); }
  removeItem(k: string, a: number = 1): boolean { return this.inventory.removeItem(k, a); }
  addMora(a: number): void { this.inventory.addMora(a); }
  removeMora(a: number): boolean { return this.inventory.removeMora(a); }
  addCollectedMapItem(id: string): void { this.inventory.addCollectedMapItem(id); }
  getSpeed(): number { return this.movement.getCurrentSpeed(); }
  getInventory(): InventoryComponent { return this.inventory; }
  getSaveData(): GameSaveData {
    return {
      health: { current: this.health.getHealth(), max: this.health.getMaxHealth() },
      mora: this.inventory.getMora(),
      inventory: this.inventory.getInventory(),
      collectedMapItems: this.inventory.getCollectedMapItems(),
      position: { x: this.x, y: this.y },
      isDead: this.health.getIsDead(),
    };
  }

  private die(): void {
    (this.body as any).setVelocity(0, 0);
    this.anims.play(PLAYER_ANIMATION_KEYS.HURT, true);
    const p = Math.floor(this.inventory.getMora() / 2);
    if (p > 0) this.inventory.removeMora(p);
  }
}
