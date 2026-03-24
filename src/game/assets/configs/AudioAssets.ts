import { AssetConfig } from "../types";

export const AUDIO_ASSET_KEYS = {
  TITLE_AMBIENT: "title_ambient",
} as const;

export const AUDIO_ASSET_CONFIGS: AssetConfig[] = [
  {
    key: AUDIO_ASSET_KEYS.TITLE_AMBIENT,
    type: "audio",
    path: "assets/sounds/background-ambient.wav",
  },
];
