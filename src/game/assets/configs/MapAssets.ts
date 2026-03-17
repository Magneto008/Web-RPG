import { AssetConfig } from "../types";

export const MAP_ASSET_KEYS = {
  PATH_OBJECTS: "path-objects",
  WORLD_MAP: "world-map",
} as const;

export const MAP_ASSET_CONFIGS: AssetConfig[] = [
  {
    key: MAP_ASSET_KEYS.PATH_OBJECTS,
    type: "spritesheet",
    path: "/assets/tiles/path-and-objects.png",
    frameWidth: 32,
    frameHeight: 32,
  },
  {
    key: MAP_ASSET_KEYS.WORLD_MAP,
    type: "xml",
    path: "/assets/maps/world-map.tmx",
  },
];
