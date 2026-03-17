import Phaser from "phaser";
import { ASSETS, PLAYER_ANIMATION_KEYS } from "../assets/AssetManager";

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
};

export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly movementKeys: MovementKeys;
  private readonly walkSpeed: number;
  private readonly runSpeed: number;
  private currentSpeed: number;
  private facingDirection: "right" | "up" | "left" | "down" = "down";
  private currentHealth: number;
  private maxHealth: number;

  constructor({ scene, x, y, speed = 200, maxHealth = 100 }: PlayerConfig) {
    super(scene, x, y, ASSETS.PLAYER_IDLE, 0);

    this.walkSpeed = speed;
    this.runSpeed = Math.round(speed * 1.45); // Run speed multiplier (decreased from 1.6)
    this.currentSpeed = speed;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;

    scene.registry.set("playerHealth", {
      current: this.currentHealth,
      max: this.maxHealth,
    });

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
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    let velocityX = 0;
    let velocityY = 0;

    const movingLeft = cursors.left.isDown || this.movementKeys.left.isDown;
    const movingRight = cursors.right.isDown || this.movementKeys.right.isDown;
    const movingUp = cursors.up.isDown || this.movementKeys.up.isDown;
    const movingDown = cursors.down.isDown || this.movementKeys.down.isDown;
    const isMoving = movingLeft || movingRight || movingUp || movingDown;
    const isRunning =
      isMoving && (cursors.shift.isDown || this.movementKeys.sprint.isDown);
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
    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.scene.registry.set("playerHealth", {
      current: this.currentHealth,
      max: this.maxHealth,
    });
  }

  heal(amount: number): void {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    this.scene.registry.set("playerHealth", {
      current: this.currentHealth,
      max: this.maxHealth,
    });
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
