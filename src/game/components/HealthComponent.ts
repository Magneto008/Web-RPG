import Phaser from "phaser";

export class HealthComponent {
  private currentHealth: number;
  private maxHealth: number;
  private isDead: boolean = false;
  private scene: Phaser.Scene;
  private onDie: () => void;

  constructor(scene: Phaser.Scene, current: number, max: number, onDie: () => void) {
    this.scene = scene;
    this.currentHealth = current;
    this.maxHealth = max;
    this.onDie = onDie;
    this.updateRegistry();
  }

  takeDamage(amount: number): void {
    if (this.isDead) return;

    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.updateRegistry();

    if (this.currentHealth <= 0) {
      this.die();
    }
  }

  heal(amount: number): void {
    if (this.isDead) return;

    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    this.updateRegistry();
  }

  revive(): void {
    if (!this.isDead) return;
    this.isDead = false;
    this.currentHealth = this.maxHealth;
    this.updateRegistry();
    this.scene.registry.set("playerDead", false);
  }

  getHealth(): number {
    return this.currentHealth;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getIsDead(): boolean {
    return this.isDead;
  }

  setDead(dead: boolean): void {
    this.isDead = dead;
    this.scene.registry.set("playerDead", dead);
  }

  private die(): void {
    this.isDead = true;
    this.scene.registry.set("playerDead", true);
    this.onDie();
  }

  private updateRegistry(): void {
    this.scene.registry.set("playerHealth", {
      current: this.currentHealth,
      max: this.maxHealth,
    });
  }
}
