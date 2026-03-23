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

function getWaterTileGids(mapElement: Element, firstGid: number): number[] {
  const tilesetElement = mapElement.querySelector("tileset");
  if (!tilesetElement) return [];

  const waterColorIndexes = new Set<number>();
  const wangColors = tilesetElement.querySelectorAll(
    ":scope > wangsets > wangset > wangcolor",
  );

  wangColors.forEach((wangColor, idx) => {
    const name = (wangColor.getAttribute("name") ?? "").trim().toLowerCase();
    if (name === "water") {
      // Tiled wang color references are 1-based indexes.
      waterColorIndexes.add(idx + 1);
    }
  });

  if (waterColorIndexes.size === 0) return [];

  const gids = new Set<number>();
  const wangTiles = tilesetElement.querySelectorAll(
    ":scope > wangsets > wangset > wangtile",
  );

  wangTiles.forEach((wangTile) => {
    const tileId = Number(wangTile.getAttribute("tileid"));
    const wangId = wangTile.getAttribute("wangid") ?? "";

    if (Number.isNaN(tileId) || !wangId) return;

    const hasWater = wangId
      .split(",")
      .map((part) => Number(part.trim()))
      .some((value) => waterColorIndexes.has(value));

    if (hasWater) {
      gids.add(firstGid + tileId);
    }
  });

  return Array.from(gids);
}

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

  const waterTileGids = getWaterTileGids(mapElement, firstGid);
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
      continue;
    }

    if (waterTileGids.length > 0) {
      layer.setCollision(waterTileGids);
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
