import { AssetConfig } from "../types";

export const ITEM_ASSET_KEYS = {
  HEART_ITEM: "heart-item",
  HEALTH_POTION: "health-potion",
  IRON_ORE: "iron-ore",
  IRON_INGOT: "iron-ingot",
  OBSIDIAN_ORE: "obsidian-ore",
  OBSIDIAN_INGOT: "obsidian-ingot",

  ROGUELIKE_ITEMS_SHEET: "roguelike-items-sheet",
  // PLACEHOLDER: Add your own extracted item texture keys here.
  // Example:
  // RED_POTION: "red-potion",
} as const;

export const ROGUELIKE_ITEM_FRAME_MAP: Array<{ key: string; frame: number }> = [
  // PLACEHOLDER: Add mappings from a texture key to a frame index in roguelikeitems.png.
  // The sheet is 16x16 tiles (13 columns x 15 rows).
  // frame = (row * 13) + column
  // Example:
  // { key: ITEM_ASSET_KEYS.RED_POTION, frame: 58 },
  {
    key: ITEM_ASSET_KEYS.IRON_ORE,
    frame: 58,
  },
  {
    key: ITEM_ASSET_KEYS.IRON_INGOT,
    frame: 71,
  },
  {
    key: ITEM_ASSET_KEYS.OBSIDIAN_ORE,
    frame: 55,
  },
  {
    key: ITEM_ASSET_KEYS.OBSIDIAN_INGOT,
    frame: 68,
  },
];

export const ITEM_ASSET_CONFIGS: AssetConfig[] = [
  {
    key: ITEM_ASSET_KEYS.HEART_ITEM,
    type: "image",
    path: "/assets/items/heart.png",
  },
  {
    key: ITEM_ASSET_KEYS.HEALTH_POTION,
    type: "image",
    path: "/assets/items/health-potion.png",
  },
  {
    key: ITEM_ASSET_KEYS.ROGUELIKE_ITEMS_SHEET,
    type: "spritesheet",
    path: "/assets/items/roguelikeitems.png",
    frameWidth: 16,
    frameHeight: 16,
  },
];
