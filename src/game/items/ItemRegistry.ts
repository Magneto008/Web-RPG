import { Player } from "../objects/Player";
import { ASSETS } from "../assets/AssetLoader";

export interface ItemData {
  id: string; // Should match the key in AssetLoader
  name: string;
  description: string;
  maxStack?: number;
  moraValue?: number;
  onUse: (player: Player) => void;
}

export const ITEM_DATABASE: Record<string, ItemData> = {
  [ASSETS.HEART_ITEM]: {
    id: ASSETS.HEART_ITEM,
    name: "Heart Gem",
    description: "A mysterious pulsing gem.\nRestores 20 Health.",
    maxStack: 99,
    onUse: (player: Player) => {
      player.heal(20);
    }
  },
  
  // Keep this commented out as a template for when you add a potion!
  /*
  [ASSETS.POTION_ITEM]: {
    id: ASSETS.POTION_ITEM,
    name: "Speed Potion",
    description: "A bubbling green brew.\nIncreases movement speed temporarily.",
    onUse: (player: Player) => {
      player.boostSpeed(10000); // Need to add boostSpeed to player before using
    }
  }
  */
};

export function getItemData(itemId: string): ItemData | undefined {
  return ITEM_DATABASE[itemId];
}
