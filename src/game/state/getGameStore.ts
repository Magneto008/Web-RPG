import Phaser from "phaser";
import { GameStore } from "../state/GameStore";

export function getGameStore(scene: Phaser.Scene): GameStore {
  const store = scene.registry.get("gameStore") as GameStore | undefined;
  if (!store) {
    throw new Error("GameStore not found in registry. BootScene must run before gameplay scenes.");
  }
  return store;
}
