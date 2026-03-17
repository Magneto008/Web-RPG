import Phaser from "phaser";
import { ASSETS } from "../assets/AssetLoader";
import { PLAYER_ANIMATION_KEYS } from "../assets/configs/PlayerAssets";
import { GameSaveData } from "../systems/SaveSystem";

type MovementKeys = {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  sprint: Phaser.Input.Keyboard.Key;
};

type PlayerConfig = {
  scene: Phaser.Scene;
  x: number;
  y: number;
  speed?: number;
  maxHealth?: number;
  saveData?: GameSaveData | null;
};

export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly movementKeys: MovementKeys;
  private readonly walkSpeed: number;
  private readonly runSpeed: number;
  private currentSpeed: number;
  private facingDirection: "right" | "up" | "left" | "down" = "down";
  private currentHealth: number;
  private maxHealth: number;
  private inventory: Record<string, number> = {};
  private collectedMapItems: string[] = [];
  private mora: number = 0;
  private isDead: boolean = false;

  constructor({ scene, x, y, speed = 200, maxHealth = 100, saveData }: PlayerConfig) {
    let startX = x;
    let startY = y;
    if (saveData) {
       startX = saveData.position.x;
       startY = saveData.position.y;
    }
    
    super(scene, startX, startY, ASSETS.PLAYER_IDLE, 0);

    this.walkSpeed = speed;
    this.runSpeed = Math.round(speed * 1.45); // Run speed multiplier (decreased from 1.6)
    this.currentSpeed = speed;
    
    if (saveData) {
       this.maxHealth = saveData.health.max;
       this.currentHealth = saveData.health.current;
       this.mora = saveData.mora || 0;
       this.inventory = saveData.inventory || {};
       this.collectedMapItems = saveData.collectedMapItems || [];
       this.isDead = saveData.isDead || false;
    } else {
       this.maxHealth = maxHealth;
       this.currentHealth = maxHealth;
    }

    scene.registry.set("playerHealth", {
      current: this.currentHealth,
      max: this.maxHealth,
    });
    
    scene.registry.set("playerInventory", this.inventory);
    scene.registry.set("playerMora", this.mora);
    scene.registry.set("playerDead", this.isDead);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setScale(1);
    this.setCollideWorldBounds(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(20, 12);
    body.setOffset(22, 42);

    this.movementKeys = scene.input.keyboard!.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      sprint: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    }) as MovementKeys;
    
    if (this.isDead) {
      this.die(); // Triggers the visual death state immediately if they load in dead
    }
  }

  update(): void {
    if (this.isDead) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    let velocityX = 0;
    let velocityY = 0;

    const movingLeft = this.movementKeys.left.isDown;
    const movingRight = this.movementKeys.right.isDown;
    const movingUp = this.movementKeys.up.isDown;
    const movingDown = this.movementKeys.down.isDown;
    const isMoving = movingLeft || movingRight || movingUp || movingDown;
    const isRunning = isMoving && this.movementKeys.sprint.isDown;
    const moveSpeed = isRunning ? this.runSpeed : this.walkSpeed;

    this.currentSpeed = moveSpeed;

    if (movingLeft) {
      velocityX = -moveSpeed;
    } else if (movingRight) {
      velocityX = moveSpeed;
    }

    if (movingUp) {
      velocityY = -moveSpeed;
    } else if (movingDown) {
      velocityY = moveSpeed;
    }

    body.setVelocity(velocityX, velocityY);

    if (velocityX !== 0 && velocityY !== 0) {
      body.velocity.normalize().scale(moveSpeed);
    }

    this.setDepth(this.y);

    this.updateAnimation(
      body.velocity.lengthSq() > 0,
      velocityX,
      velocityY,
      isRunning,
    );
  }

  getSpeed(): number {
    return this.currentSpeed;
  }

  getHealth(): number {
    return this.currentHealth;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  takeDamage(amount: number): void {
    if (this.isDead) return;

    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.scene.registry.set("playerHealth", {
      current: this.currentHealth,
      max: this.maxHealth,
    });

    if (this.currentHealth <= 0) {
      this.die();
    }
  }

  heal(amount: number): void {
    if (this.isDead) return;

    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    this.scene.registry.set("playerHealth", {
      current: this.currentHealth,
      max: this.maxHealth,
    });
  }

  revive(): void {
    if (!this.isDead) return;
    this.isDead = false;
    this.currentHealth = this.maxHealth;
    this.scene.registry.set("playerHealth", {
      current: this.currentHealth,
      max: this.maxHealth,
    });
    this.scene.registry.set("playerDead", false);
    
    // Play idle animation to reset
    this.updateAnimation(false, 0, 0, false);
  }

  addItem(itemKey: string, amount: number = 1): void {
    if (!this.inventory[itemKey]) {
      this.inventory[itemKey] = 0;
    }
    this.inventory[itemKey] += amount;
    this.scene.registry.set("playerInventory", { ...this.inventory });
  }

  removeItem(itemKey: string, amount: number = 1): boolean {
    if (!this.inventory[itemKey] || this.inventory[itemKey] < amount) {
      return false;
    }
    
    this.inventory[itemKey] -= amount;
    
    // Clean up empty slots map
    if (this.inventory[itemKey] <= 0) {
      delete this.inventory[itemKey];
    }
    
    this.scene.registry.set("playerInventory", { ...this.inventory });
    return true;
  }
  
  getCollectedMapItems(): string[] {
    return this.collectedMapItems;
  }

  addCollectedMapItem(id: string): void {
    if (!this.collectedMapItems.includes(id)) {
      this.collectedMapItems.push(id);
    }
  }
  
  getInventory(): Record<string, number> {
    return this.inventory;
  }

  getMora(): number {
    return this.mora;
  }

  addMora(amount: number): void {
    this.mora += amount;
    this.scene.registry.set("playerMora", this.mora);
  }

  removeMora(amount: number): boolean {
    if (this.mora < amount) return false;
    this.mora -= amount;
    this.scene.registry.set("playerMora", this.mora);
    return true;
  }

  getIsDead(): boolean {
    return this.isDead;
  }

  private die(): void {
    this.isDead = true;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);

    // Play hurt animation
    this.anims.stop();
    this.anims.play(PLAYER_ANIMATION_KEYS.HURT, true);

    // Lose half of mora as penalty
    const penalty = Math.floor(this.mora / 2);
    if (penalty > 0) {
       this.removeMora(penalty);
       console.log(`Died! Lost ${penalty} Mora.`);
    }

    this.scene.registry.set("playerDead", true);
  }

  getSaveData(): GameSaveData {
    return {
      health: {
        current: this.currentHealth,
        max: this.maxHealth
      },
      mora: this.mora,
      inventory: this.inventory,
      collectedMapItems: this.collectedMapItems,
      position: {
        x: this.x,
        y: this.y,
      },
      isDead: this.isDead
    };
  }

  private updateAnimation(
    isMoving: boolean,
    velocityX: number,
    velocityY: number,
    isRunning: boolean,
  ): void {
    if (velocityX < 0) {
      this.facingDirection = "left";
    } else if (velocityX > 0) {
      this.facingDirection = "right";
    } else if (velocityY < 0) {
      this.facingDirection = "up";
    } else if (velocityY > 0) {
      this.facingDirection = "down";
    }

    const animationKey = isMoving
      ? isRunning
        ? this.getRunAnimationKey()
        : this.getWalkAnimationKey()
      : this.getIdleAnimationKey();

    this.anims.play(animationKey, true);
  }

  private getIdleAnimationKey(): string {
    switch (this.facingDirection) {
      case "up":
        return PLAYER_ANIMATION_KEYS.IDLE_UP;
      case "left":
        return PLAYER_ANIMATION_KEYS.IDLE_LEFT;
      case "right":
        return PLAYER_ANIMATION_KEYS.IDLE_RIGHT;
      default:
        return PLAYER_ANIMATION_KEYS.IDLE_DOWN;
    }
  }

  private getWalkAnimationKey(): string {
    switch (this.facingDirection) {
      case "up":
        return PLAYER_ANIMATION_KEYS.WALK_UP;
      case "left":
        return PLAYER_ANIMATION_KEYS.WALK_LEFT;
      case "right":
        return PLAYER_ANIMATION_KEYS.WALK_RIGHT;
      default:
        return PLAYER_ANIMATION_KEYS.WALK_DOWN;
    }
  }

  private getRunAnimationKey(): string {
    switch (this.facingDirection) {
      case "up":
        return PLAYER_ANIMATION_KEYS.RUN_UP;
      case "left":
        return PLAYER_ANIMATION_KEYS.RUN_LEFT;
      case "right":
        return PLAYER_ANIMATION_KEYS.RUN_RIGHT;
      default:
        return PLAYER_ANIMATION_KEYS.RUN_DOWN;
    }
  }
}
