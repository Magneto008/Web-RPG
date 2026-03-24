import { GameStore } from "../state/GameStore";

export class HealthComponent {
  private currentHealth: number;
  private maxHealth: number;
  private isDead = false;

  constructor(
    private readonly store: GameStore,
    current: number,
    max: number,
    private readonly onDie: () => void,
  ) {
    this.currentHealth = current;
    this.maxHealth = max;
    this.updateStore();
  }

  takeDamage(amount: number): void {
    if (this.isDead) {
      return;
    }

    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.updateStore();

    if (this.currentHealth <= 0) {
      this.die();
    }
  }

  heal(amount: number): void {
    if (this.isDead) {
      return;
    }

    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    this.updateStore();
  }

  restoreFullHealth(): void {
    if (this.isDead) {
      return;
    }

    this.currentHealth = this.maxHealth;
    this.updateStore();
  }

  revive(): void {
    if (!this.isDead) {
      return;
    }

    this.isDead = false;
    this.currentHealth = this.maxHealth;
    this.store.setPlayerDead(false);
    this.updateStore();
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
    this.store.setPlayerDead(dead);
  }

  private die(): void {
    this.isDead = true;
    this.store.setPlayerDead(true);
    this.onDie();
  }

  private updateStore(): void {
    this.store.setPlayerHealth({
      current: this.currentHealth,
      max: this.maxHealth,
    });
  }
}
