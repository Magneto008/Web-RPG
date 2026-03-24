import Phaser from "phaser";
import { ASSETS } from "../assets/AssetLoader";
import { ENEMY_ANIMATION_KEYS } from "../animations/enemyAnimations";
import { Player } from "./Player";
import { FacingDirection } from "../types/PlayerState";

interface GolemEnemyConfig {
  scene: Phaser.Scene;
  target: Player;
  x: number;
  y: number;
  speed?: number;
  maxHealth?: number;
  aggroRange?: number;
  attackRange?: number;
  attackDamage?: number;
  attackCooldownMs?: number;
  onDie?: (enemy: GolemEnemy) => void;
}

export class GolemEnemy extends Phaser.Physics.Arcade.Sprite {
  private static readonly WALK_ORIGIN_Y = 0.5;
  private static readonly ATTACK_ORIGIN_Y = 2 / 3;
  private readonly target: Player;
  private readonly speed: number;
  private readonly maxHealth: number;
  private health: number;
  private readonly aggroRange: number;
  private readonly attackRange: number;
  private readonly attackDamage: number;
  private readonly attackCooldownMs: number;
  private readonly onDie?: (enemy: GolemEnemy) => void;
  private lastAttackAt = -Infinity;
  private isDead = false;
  private isAttacking = false;
  private facing: FacingDirection = FacingDirection.DOWN;

  constructor({
    scene,
    target,
    x,
    y,
    speed = 55,
    maxHealth = 75,
    aggroRange = 280,
    attackRange = 42,
    attackDamage = 8,
    attackCooldownMs = 1000,
    onDie,
  }: GolemEnemyConfig) {
    super(scene, x, y, ASSETS.GOLEM_WALK, 14);

    this.target = target;
    this.speed = speed;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
    this.aggroRange = aggroRange;
    this.attackRange = attackRange;
    this.attackDamage = attackDamage;
    this.attackCooldownMs = attackCooldownMs;
    this.onDie = onDie;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, GolemEnemy.WALK_ORIGIN_Y);
    this.setDepth(this.y);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(28, 22).setOffset(18, 38);
    body.setCollideWorldBounds(true);
  }

  update(): void {
    if (this.isDead) {
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);

    if (this.isAttacking) {
      body.setVelocity(0, 0);
      this.setDepth(this.y);
      return;
    }

    if (distance > this.aggroRange) {
      body.setVelocity(0, 0);
      this.playWalkOrIdle(false);
      this.setDepth(this.y);
      return;
    }

    if (distance <= this.attackRange && this.canAttack()) {
      this.startAttack();
      this.setDepth(this.y);
      return;
    }

    const toTarget = new Phaser.Math.Vector2(this.target.x - this.x, this.target.y - this.y);
    if (toTarget.lengthSq() > 0) {
      toTarget.normalize();
      body.setVelocity(toTarget.x * this.speed, toTarget.y * this.speed);
      this.updateFacing(toTarget.x, toTarget.y);
      this.playWalkOrIdle(true);
    } else {
      body.setVelocity(0, 0);
      this.playWalkOrIdle(false);
    }

    this.setDepth(this.y);
  }

  takeDamage(amount: number): void {
    if (this.isDead) {
      return;
    }

    this.health = Math.max(0, this.health - amount);
    this.setTintFill(0xfff3b0);
    this.scene.time.delayedCall(70, () => this.clearTint());

    if (this.health > 0) {
      return;
    }

    this.die();
  }

  getHealthPercent(): number {
    return this.maxHealth <= 0 ? 0 : this.health / this.maxHealth;
  }

  private canAttack(): boolean {
    return this.scene.time.now - this.lastAttackAt >= this.attackCooldownMs;
  }

  private startAttack(): void {
    this.isAttacking = true;
    this.lastAttackAt = this.scene.time.now;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);

    // Re-align facing right before attack so directional attack anim matches target position.
    this.updateFacing(this.target.x - this.x, this.target.y - this.y);
    this.setOrigin(0.5, GolemEnemy.ATTACK_ORIGIN_Y);

    const key = this.getAttackKey();
    this.anims.play(key, true);
    this.once(`animationcomplete-${key}`, () => {
      this.isAttacking = false;
      this.setOrigin(0.5, GolemEnemy.WALK_ORIGIN_Y);

      if (this.isDead) {
        return;
      }

      const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
      if (distance <= this.attackRange + 8) {
        this.target.takeDamage(this.attackDamage);
      }

      this.playWalkOrIdle(false);
    });
  }

  private die(): void {
    this.isDead = true;
    this.isAttacking = false;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.enable = false;

    this.setOrigin(0.5, GolemEnemy.WALK_ORIGIN_Y);
    this.clearTint();
    this.anims.play(ENEMY_ANIMATION_KEYS.GOLEM_DIE, true);
    this.once(`animationcomplete-${ENEMY_ANIMATION_KEYS.GOLEM_DIE}`, () => {
      this.onDie?.(this);
      this.disableBody(true, true);
      this.destroy();
    });
  }

  private playWalkOrIdle(isMoving: boolean): void {
    if (!isMoving) {
      this.anims.stop();
      this.setFrame(this.getIdleFrame());
      return;
    }

    this.anims.play(this.getWalkKey(), true);
  }

  private getIdleFrame(): number {
    switch (this.facing) {
      case FacingDirection.UP:
        return 0;
      case FacingDirection.LEFT:
        return 7;
      case FacingDirection.RIGHT:
        return 21;
      default:
        return 14;
    }
  }

  private updateFacing(vx: number, vy: number): void {
    if (Math.abs(vx) > Math.abs(vy)) {
      this.facing = vx >= 0 ? FacingDirection.RIGHT : FacingDirection.LEFT;
      return;
    }

    this.facing = vy >= 0 ? FacingDirection.DOWN : FacingDirection.UP;
  }

  private getWalkKey(): string {
    switch (this.facing) {
      case FacingDirection.UP:
        return ENEMY_ANIMATION_KEYS.GOLEM_WALK_UP;
      case FacingDirection.LEFT:
        return ENEMY_ANIMATION_KEYS.GOLEM_WALK_LEFT;
      case FacingDirection.RIGHT:
        return ENEMY_ANIMATION_KEYS.GOLEM_WALK_RIGHT;
      default:
        return ENEMY_ANIMATION_KEYS.GOLEM_WALK_DOWN;
    }
  }

  private getAttackKey(): string {
    switch (this.facing) {
      case FacingDirection.UP:
        return ENEMY_ANIMATION_KEYS.GOLEM_ATTACK_UP;
      case FacingDirection.LEFT:
        return ENEMY_ANIMATION_KEYS.GOLEM_ATTACK_LEFT;
      case FacingDirection.RIGHT:
        return ENEMY_ANIMATION_KEYS.GOLEM_ATTACK_RIGHT;
      default:
        return ENEMY_ANIMATION_KEYS.GOLEM_ATTACK_DOWN;
    }
  }
}
