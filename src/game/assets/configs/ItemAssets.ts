import { AssetConfig } from "../types";

export const ITEM_ASSET_KEYS = {
  HEART_ITEM: "heart-item",
  IRON_ORE: "iron-ore",
  IRON_INGOT: "iron-ingot",
  OBSIDIAN_ORE: "obsidian-ore",
  OBSIDIAN_INGOT: "obsidian-ingot",
} as const;

export const ITEM_ASSET_CONFIGS: AssetConfig[] = [
  {
    key: ITEM_ASSET_KEYS.HEART_ITEM,
    type: "image",
    path: "/assets/items/heart.png",
  },
  {
    key: ITEM_ASSET_KEYS.IRON_ORE,
    type: "image",
    path: "/assets/items/iron-ore.png",
  },
  {
    key: ITEM_ASSET_KEYS.IRON_INGOT,
    type: "image",
    path: "/assets/items/iron-ingot.png",
  },
  {
    key: ITEM_ASSET_KEYS.OBSIDIAN_ORE,
    type: "image",
    path: "/assets/items/obsidian-ore.png",
  },
  {
    key: ITEM_ASSET_KEYS.OBSIDIAN_INGOT,
    type: "image",
    path: "/assets/items/obsidian-ingot.png",
  },
];
