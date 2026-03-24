import { GameStore } from "../state/GameStore";

export class ManaComponent {
  private currentMana: number;
  private maxMana: number;

  constructor(
    private readonly store: GameStore,
    current: number,
    max: number,
  ) {
    this.currentMana = current;
    this.maxMana = max;
    this.updateStore();
  }

  restoreMana(amount: number): void {
    this.currentMana = Math.min(this.maxMana, this.currentMana + amount);
    this.updateStore();
  }

  useMana(amount: number): boolean {
    if (this.currentMana >= amount) {
      this.currentMana -= amount;
      this.updateStore();
      return true;
    }
    return false;
  }

  getMana(): number {
    return this.currentMana;
  }

  getMaxMana(): number {
    return this.maxMana;
  }

  private updateStore(): void {
    this.store.setPlayerMana({
      current: this.currentMana,
      max: this.maxMana,
    });
  }
}
