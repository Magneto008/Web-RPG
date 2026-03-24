import { AssetConfig } from "../types";

export const ITEM_ASSET_KEYS = {
  HEART_ITEM: "heart-item",
  HEALTH_POTION: "health-potion",
  IRON_ORE: "iron-ore",
  IRON_INGOT: "iron-ingot",
  OBSIDIAN_ORE: "obsidian-ore",
  OBSIDIAN_INGOT: "obsidian-ingot",
  WOOD: "wood",
  RED_POTION: "red-potion",
  GREEN_POTION: "green-potion",
  BLUE_POTION: "blue-potion",
  YELLOW_POTION: "yellow-potion",
  PURPLE_POTION: "purple-potion",
  ORANGE_POTION: "orange-potion",
  BROWN_POTION: "brown-potion",
  BLACK_POTION: "black-potion",

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
  {
    key: ITEM_ASSET_KEYS.WOOD,
    frame: 80,
  },
  {
    key: ITEM_ASSET_KEYS.RED_POTION,
    frame: 63,
  },
  {
    key: ITEM_ASSET_KEYS.GREEN_POTION,
    frame: 62,
  },
  {
    key: ITEM_ASSET_KEYS.BLUE_POTION,
    frame: 64,
  },
  {
    key: ITEM_ASSET_KEYS.YELLOW_POTION,
    frame: 74,
  },
  {
    key: ITEM_ASSET_KEYS.PURPLE_POTION,
    frame: 61,
  },
  {
    key: ITEM_ASSET_KEYS.ORANGE_POTION,
    frame: 75,
  },
  {
    key: ITEM_ASSET_KEYS.BROWN_POTION,
    frame: 72,
  },
  {
    key: ITEM_ASSET_KEYS.BLACK_POTION,
    frame: 60,
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
