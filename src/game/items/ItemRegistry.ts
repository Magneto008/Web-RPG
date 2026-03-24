import { Player } from "../objects/Player";
import { ASSETS } from "../assets/AssetLoader";

type ItemType = "consumable" | "material" | "currency";

export interface ItemData {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  maxStack?: number;
  moraValue?: number;
  dropWeight?: number;
  dropGroup?: string;
  onUse?: (player: Player) => void;
}

export const ITEM_DATABASE: Record<string, ItemData> = {
  [ASSETS.HEART_ITEM]: {
    id: ASSETS.HEART_ITEM,
    name: "Heart Gem",
    description: "A mysterious pulsing gem.\nRestores 20 Health.",
    type: "consumable",
    maxStack: 99,
    onUse: (player: Player) => {
      player.heal(20);
    },
    moraValue: 100,
    dropWeight: 20,
    dropGroup: "chest",
  },

  [ASSETS.HEALTH_POTION]: {
    id: ASSETS.HEALTH_POTION,
    name: "Health Potion",
    description: "Restores the player's health to full.",
    type: "consumable",
    maxStack: 20,
    onUse: (player: Player) => {
      player.restoreFullHealth();
    },
    moraValue: 250,
    dropWeight: 15,
    dropGroup: "chest",
  },

  // PLACEHOLDER: Add your roguelike sheet items here after you add keys in ITEM_ASSET_KEYS.
  // Example:
  // [ASSETS.RED_POTION]: {
  //   id: ASSETS.RED_POTION,
  //   name: "Minor Health Potion",
  //   description: "A small red vial.\nRestores 30 Health.",
  //   type: "consumable",
  //   maxStack: 20,
  //   onUse: (player: Player) => {
  //     player.heal(30);
  //   },
  //   moraValue: 80,
  //   dropWeight: 45,
  //   dropGroup: "chest",
  // },

  [ASSETS.IRON_ORE]: {
    id: ASSETS.IRON_ORE,
    name: "Iron Ore",
    description: "Can be smelted into iron.",
    type: "material",
    maxStack: 99,
    moraValue: 50,
    dropWeight: 70,
    dropGroup: "chest",
  },

  [ASSETS.MORA_ICON]: {
    id: ASSETS.MORA_ICON,
    name: "Mora",
    description: "A currency used to purchase items.",
    type: "currency",
    maxStack: 999999,
    moraValue: 1,
    dropWeight: 50,
    dropGroup: "chest",
  },

  [ASSETS.IRON_INGOT]: {
    id: ASSETS.IRON_INGOT,
    name: "Iron Ingot",
    description: "A chunk of iron ingot.",
    type: "material",
    maxStack: 99,
    moraValue: 100,
    dropGroup: "smelter",
  },

  [ASSETS.OBSIDIAN_ORE]: {
    id: ASSETS.OBSIDIAN_ORE,
    name: "Obsidian Ore",
    description: "Can be smelted into obsidian.",
    type: "material",
    maxStack: 99,
    moraValue: 70,
    dropWeight: 70,
    dropGroup: "chest",
  },

  [ASSETS.OBSIDIAN_INGOT]: {
    id: ASSETS.OBSIDIAN_INGOT,
    name: "Obsidian Ingot",
    description: "A chunk of obsidian ingot.",
    type: "material",
    maxStack: 99,
    moraValue: 200,
    dropGroup: "smelter",
  },
};

export function getItemData(itemId: string): ItemData | undefined {
  return ITEM_DATABASE[itemId];
}
