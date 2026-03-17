import Phaser from "phaser";
import { ASSETS } from "../assets/AssetManager";
import { getPlayerSpawnPoint } from "./SpawnSystem";

const COLLISION_LAYER_NAMES = new Set(["collision", "collisions"]);

export type LoadedMap = {
  map: Phaser.Tilemaps.Tilemap;
  collisionLayers: Phaser.Tilemaps.TilemapLayer[];
  spawnPoint: Phaser.Math.Vector2;
  mapElement: Element;
};

type TmxLayerData = {
  name: string;
  visible: boolean;
  opacity: number;
  collides: boolean;
  tiles: number[][];
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

function parseTmxLayers(mapElement: Element): TmxLayerData[] {
  return Array.from(mapElement.children)
    .filter((child) => child.tagName === "layer")
    .map((layerElement) => {
      const name = layerElement.getAttribute("name") ?? "Layer";
      const visible = layerElement.getAttribute("visible") !== "0";
      const opacity = Number(layerElement.getAttribute("opacity") ?? "1");

      const dataElement = layerElement.querySelector("data");
      if (!dataElement || dataElement.getAttribute("encoding") !== "csv") {
        throw new Error(`Layer "${name}" must use CSV encoding.`);
      }

      const width = getRequiredNumberAttribute(layerElement, "width");

      const values = dataElement.textContent
        ?.split(",")
        .map((v) => v.trim())
        .filter(Boolean)
        .map((v) => {
          const gid = Number(v);
          return gid === 0 ? -1 : gid;
        });

      if (!values?.length) {
        throw new Error(`Layer "${name}" has no tile data.`);
      }

      const tiles: number[][] = [];
      for (let i = 0; i < values.length; i += width) {
        tiles.push(values.slice(i, i + width));
      }

      return {
        name,
        visible,
        opacity,
        collides: layerCollides(layerElement, name),
        tiles,
      };
    });
}

function layerCollides(layerElement: Element, name: string): boolean {
  if (COLLISION_LAYER_NAMES.has(name.toLowerCase())) return true;

  const prop = layerElement.querySelector(
    ':scope > properties > property[name="collides"]',
  );

  const value = prop?.getAttribute("value") ?? prop?.textContent ?? "";
  return value === "true";
}

function getRequiredNumberAttribute(element: Element, attr: string): number {
  const raw = element.getAttribute(attr);
  if (raw === null) throw new Error(`Missing "${attr}"`);

  const value = Number(raw);
  if (Number.isNaN(value)) throw new Error(`Invalid "${attr}"`);

  return value;
}
