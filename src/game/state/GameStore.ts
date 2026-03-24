import Phaser from "phaser";
import { InventorySlot } from "../items/Inventory";
import { GAME_EVENTS } from "../events/GameEvents";
import { GameState } from "../types/GameState";

export interface HealthState {
  current: number;
  max: number;
}

export interface ManaState {
  current: number;
  max: number;
}

export interface PlayerDebugState {
  x: number;
  y: number;
  speed: number;
}

export interface GameStoreSnapshot {
  playerHealth: HealthState;
  playerInventory: InventorySlot[];
  furnaceSlots: InventorySlot[];
  furnaceUiOpen: boolean;
  playerMora: number;
  playerMana: ManaState;
  playerDead: boolean;
  playerDebug: PlayerDebugState;
  gameState: GameState;
}

const EMPTY_HEALTH: HealthState = { current: 0, max: 0 };
const EMPTY_MANA: ManaState = { current: 0, max: 0 };
const EMPTY_DEBUG: PlayerDebugState = { x: 0, y: 0, speed: 0 };

export class GameStore {
  private snapshot: GameStoreSnapshot = {
    playerHealth: EMPTY_HEALTH,
    playerInventory: [],
    furnaceSlots: Array.from({ length: 3 }, () => ({ itemId: null, quantity: 0 })),
    furnaceUiOpen: false,
    playerMora: 0,
    playerMana: EMPTY_MANA,
    playerDead: false,
    playerDebug: EMPTY_DEBUG,
    gameState: GameState.RUNNING,
  };

  constructor(private readonly game: Phaser.Game) {}

  getSnapshot(): Readonly<GameStoreSnapshot> {
    return this.snapshot;
  }

  setPlayerHealth(value: HealthState): void {
    this.snapshot = { ...this.snapshot, playerHealth: value };
    this.emitUpdate();
  }

  setPlayerInventory(value: InventorySlot[]): void {
    this.snapshot = { ...this.snapshot, playerInventory: value };
    this.emitUpdate();
  }

  setFurnaceSlots(value: InventorySlot[]): void {
    this.snapshot = { ...this.snapshot, furnaceSlots: value };
    this.emitUpdate();
  }

  setFurnaceUiOpen(value: boolean): void {
    this.snapshot = { ...this.snapshot, furnaceUiOpen: value };
    this.emitUpdate();
  }

  setPlayerMora(value: number): void {
    this.snapshot = { ...this.snapshot, playerMora: value };
    this.emitUpdate();
  }

  setPlayerMana(value: ManaState): void {
    const current = this.snapshot.playerMana;
    if (current.current === value.current && current.max === value.max) {
      return;
    }

    this.snapshot = { ...this.snapshot, playerMana: value };
    this.emitUpdate();
  }

  setPlayerDead(value: boolean): void {
    this.snapshot = { ...this.snapshot, playerDead: value };
    this.emitUpdate();
  }

  setPlayerDebug(value: PlayerDebugState): void {
    this.snapshot = { ...this.snapshot, playerDebug: value };
    this.emitUpdate();
  }

  setGameState(value: GameState): void {
    this.snapshot = { ...this.snapshot, gameState: value };
    this.emitUpdate();
  }

  private emitUpdate(): void {
    this.game.events.emit(GAME_EVENTS.STORE_UPDATED, this.snapshot);
  }
}
