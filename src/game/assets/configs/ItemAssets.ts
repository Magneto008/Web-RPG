import { AssetConfig } from "../types";

export const ITEM_ASSET_KEYS = {
  HEART_ITEM: "heart-item",
} as const;

export const ITEM_ASSET_CONFIGS: AssetConfig[] = [
  {
    key: ITEM_ASSET_KEYS.HEART_ITEM,
    type: "image",
    path: "/assets/items/heart.png",
  },
];
