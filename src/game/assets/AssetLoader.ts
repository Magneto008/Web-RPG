import Phaser from "phaser";
import { AssetConfig } from "./types";
import { PLAYER_ASSET_KEYS, PLAYER_ASSET_CONFIGS } from "./configs/PlayerAssets";
import { MAP_ASSET_KEYS, MAP_ASSET_CONFIGS } from "./configs/MapAssets";
import { ITEM_ASSET_KEYS, ITEM_ASSET_CONFIGS } from "./configs/ItemAssets";
import { UI_ASSET_KEYS, UI_ASSET_CONFIGS } from "./configs/UIAssets";

// Combine internal configs for the loader to iterate over
const ALL_ASSET_CONFIGS: AssetConfig[] = [
  ...PLAYER_ASSET_CONFIGS,
  ...MAP_ASSET_CONFIGS,
  ...ITEM_ASSET_CONFIGS,
  ...UI_ASSET_CONFIGS,
];

// Re-export a consolidated ASSETS object so the rest of the app doesn't need to change
export const ASSETS = {
  ...PLAYER_ASSET_KEYS,
  ...MAP_ASSET_KEYS,
  ...ITEM_ASSET_KEYS,
  ...UI_ASSET_KEYS,
} as const;

/**
 * Preloads all assets into the given Phaser scene automatically.
 */
export function preloadAssets(scene: Phaser.Scene): void {
  for (const asset of ALL_ASSET_CONFIGS) {
    if (asset.type === "image") {
      scene.load.image(asset.key, asset.path);
      continue;
    }

    if (asset.type === "xml") {
      scene.load.xml(asset.key, asset.path);
      continue;
    }

    scene.load.spritesheet(asset.key, asset.path, {
      frameWidth: asset.frameWidth,
      frameHeight: asset.frameHeight,
    });
  }
}
