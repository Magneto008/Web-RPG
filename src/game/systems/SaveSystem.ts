import { InventorySlot } from "../items/Inventory";

export interface GameSaveData {
  health: {
    current: number;
    max: number;
  };
  mora: number;
  inventory: InventorySlot[] | Record<string, number>; // Support both for loading
  position: {
    x: number;
    y: number;
  };
  isDead: boolean;
  collectedMapItems: string[];
}

const SAVE_KEY = "web_rpg_save";

export function saveGame(data: GameSaveData): void {
  try {
    const jsonString = JSON.stringify(data);
    // Basic encoding: Convert to Base64 to deter casual editing
    const encodedData = btoa(encodeURIComponent(jsonString));
    localStorage.setItem(SAVE_KEY, encodedData);
    console.log("Game auto-saved!");
  } catch (error) {
    console.error("Failed to save game to localStorage:", error);
  }
}

export function loadGame(): GameSaveData | null {
  try {
    const encodedData = localStorage.getItem(SAVE_KEY);
    if (!encodedData) return null;
    
    // Decode Base64 back to JSON string
    const decodedString = decodeURIComponent(atob(encodedData));
    return JSON.parse(decodedString) as GameSaveData;
  } catch (error) {
    console.error("Failed to load game from localStorage:", error);
    // Return null if data is corrupted or parsing fails
    return null;
  }
}
