import { AssetConfig } from "../types";

export const UI_ASSET_KEYS = {
  TITLE_BG: "title-bg",
  TITLE_TEXT: "title-text",
  TITLE_PLAY: "title-play",
  MORA_ICON: "mora-icon",
  INVENTORY_BG: "inventory-bg",
  INVENTORY_BG_EMPTY: "inventory-bg-empty",
  INVENTORY_CELL: "inventory-cell",
  HP_ICON: "hp-icon",
  ARMOR_ICON: "armor-icon",
  WEIGHT_ICON: "weight-icon",
} as const;

export const UI_ASSET_CONFIGS: AssetConfig[] = [
  {
    key: UI_ASSET_KEYS.TITLE_BG,
    type: "image",
    path: "/assets/ui/background.png",
  },
  {
    key: UI_ASSET_KEYS.TITLE_TEXT,
    type: "image",
    path: "/assets/ui/title.png",
  },
  {
    key: UI_ASSET_KEYS.TITLE_PLAY,
    type: "image",
    path: "/assets/ui/play.png",
  },
  {
    key: UI_ASSET_KEYS.MORA_ICON,
    type: "image",
    path: "/assets/ui/mora.png",
  },
  {
    key: UI_ASSET_KEYS.INVENTORY_BG,
    type: "image",
    path: "/assets/ui/Inventory and Stats/Inventory Stats.png",
  },
  {
    key: UI_ASSET_KEYS.INVENTORY_BG_EMPTY,
    type: "image",
    path: "/assets/ui/Inventory and Stats/Inventory Stats Empty.png",
  },
  {
    key: UI_ASSET_KEYS.INVENTORY_CELL,
    type: "image",
    path: "/assets/ui/Inventory and Stats/Inventory Cell.png",
  },
  {
    key: UI_ASSET_KEYS.HP_ICON,
    type: "image",
    path: "/assets/ui/Inventory and Stats/HP Icon.png",
  },
  {
    key: UI_ASSET_KEYS.ARMOR_ICON,
    type: "image",
    path: "/assets/ui/Inventory and Stats/Armor Icon.png",
  },
  {
    key: UI_ASSET_KEYS.WEIGHT_ICON,
    type: "image",
    path: "/assets/ui/Inventory and Stats/Weight Icon.png",
  },
];
