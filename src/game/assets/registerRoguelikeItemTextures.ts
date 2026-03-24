import Phaser from "phaser";
import {
  ITEM_ASSET_KEYS,
  ROGUELIKE_ITEM_FRAME_MAP,
} from "./configs/ItemAssets";

export function registerRoguelikeItemTextures(scene: Phaser.Scene): void {
  // PLACEHOLDER:
  // 1) Add texture keys in ITEM_ASSET_KEYS.
  // 2) Add { key, frame } rows in ROGUELIKE_ITEM_FRAME_MAP.
  // This function will auto-create 16x16 textures for each mapping.
  for (const item of ROGUELIKE_ITEM_FRAME_MAP) {
    if (scene.textures.exists(item.key)) {
      continue;
    }

    const rt = scene.add.renderTexture(0, 0, 16, 16);
    rt.setVisible(false);

    rt.drawFrame(ITEM_ASSET_KEYS.ROGUELIKE_ITEMS_SHEET, item.frame, 0, 0);
    rt.saveTexture(item.key);
    rt.destroy();
  }
}
