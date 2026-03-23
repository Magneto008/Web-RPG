import { AssetConfig } from "../types";

export const MAP_ASSET_KEYS = {
  PATH_OBJECTS: "path-objects",
  WORLD_MAP: "world-map",
  CHEST: "chest",
} as const;

export const MAP_ASSET_CONFIGS: AssetConfig[] = [
  {
    key: MAP_ASSET_KEYS.PATH_OBJECTS,
    type: "spritesheet",
    path: "/assets/tiles/terrain.png",
    frameWidth: 32,
    frameHeight: 32,
  },
  {
    key: MAP_ASSET_KEYS.WORLD_MAP,
    type: "xml",
    path: "/assets/maps/terrain-map.tmx",
  },
  {
    key: MAP_ASSET_KEYS.CHEST,
    type: "spritesheet",
    path: "/assets/tiles/chests.png",
    frameWidth: 32,
    frameHeight: 32,
  },
];
