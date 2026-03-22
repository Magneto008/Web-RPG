import Phaser from "phaser";
import { ASSETS } from "../assets/AssetLoader";
import { getPlayerSpawnPoint } from "./SpawnSystem";
import {
  parseTmxLayers,
  getRequiredNumberAttribute,
} from "../utils/TmxParser";

export type LoadedMap = {
  map: Phaser.Tilemaps.Tilemap;
  collisionLayers: Phaser.Tilemaps.TilemapLayer[];
  spawnPoint: Phaser.Math.Vector2;
  mapElement: Element;
};

export function loadMap(scene: Phaser.Scene): LoadedMap {
  const mapDocument = scene.cache.xml.get(
    ASSETS.WORLD_MAP,
  ) as XMLDocument | null;

  if (!mapDocument) {
    throw new Error(`Failed to load TMX map "${ASSETS.WORLD_MAP}".`);
  }

  const mapElement = mapDocument.documentElement;

  const mapWidth = getRequiredNumberAttribute(mapElement, "width");
  const mapHeight = getRequiredNumberAttribute(mapElement, "height");
  const tileWidth = getRequiredNumberAttribute(mapElement, "tilewidth");
  const tileHeight = getRequiredNumberAttribute(mapElement, "tileheight");

  const tilesetElement = mapElement.querySelector("tileset");
  if (!tilesetElement) {
    throw new Error("The TMX map does not define a tileset.");
  }

  const tilesetName = tilesetElement.getAttribute("name") ?? "world_tiles";
  const firstGid = Number(tilesetElement.getAttribute("firstgid") ?? "1");

  const map = scene.make.tilemap({
    tileWidth,
    tileHeight,
    width: mapWidth,
    height: mapHeight,
  });

  const tileset = map.addTilesetImage(
    tilesetName,
    ASSETS.PATH_OBJECTS,
    tileWidth,
    tileHeight,
    0,
    0,
    firstGid,
  );

  if (!tileset) {
    throw new Error(`Failed to bind tileset "${tilesetName}".`);
  }

  const collisionLayers: Phaser.Tilemaps.TilemapLayer[] = [];
  let depth = 0;

  for (const layerData of parseTmxLayers(mapElement)) {
    const layer = map.createBlankLayer(
      layerData.name,
      tileset,
      0,
      0,
      mapWidth,
      mapHeight,
      tileWidth,
      tileHeight,
    );

    if (!layer) {
      throw new Error(`Failed to create tile layer "${layerData.name}".`);
    }

    layer.putTilesAt(layerData.tiles, 0, 0);
    layer.setDepth(depth++);
    layer.setVisible(layerData.visible);
    layer.setAlpha(layerData.opacity);

    if (layerData.collides) {
      layer.setCollisionByExclusion([-1]);
      collisionLayers.push(layer);
    }
  }

  return {
    map,
    collisionLayers,
    spawnPoint: getPlayerSpawnPoint(
      mapElement,
      mapWidth,
      mapHeight,
      tileWidth,
      tileHeight,
    ),
    mapElement,
  };
}
