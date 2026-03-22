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
  dropWeight?: number; // chance weight
  dropGroup?: string; // optional grouping (chest, boss, etc.)
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

  [ASSETS.IRON_ORE]: {
    id: ASSETS.IRON_ORE,
    name: "Iron Ore",
    description: "A chunk of iron ore.\nCan be smelted into iron.",
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
    description: "A chunk of obsidian ore.\nCan be smelted into obsidian.",
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
