import Phaser from "phaser";
import {
  ASSETS,
  PLAYER_ANIMATION_FRAMES,
  PLAYER_ANIMATION_KEYS,
  preloadAssets,
} from "../assets/AssetManager";
import { Player } from "../objects/Player";

const COLLISION_LAYER_NAMES = new Set(["collision", "collisions"]);
const PLAYER_SPAWN_OBJECT_NAME = "PlayerSpawn";
const PLAYER_SPAWN_OBJECT_TYPE = "player_spawn";

type LoadedMap = {
  map: Phaser.Tilemaps.Tilemap;
  collisionLayers: Phaser.Tilemaps.TilemapLayer[];
  spawnPoint: Phaser.Math.Vector2;
};

type TmxLayerData = {
  name: string;
  visible: boolean;
  opacity: number;
  collides: boolean;
  tiles: number[][];
};

export class GameScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private player?: Player;

  constructor() {
    super("GameScene");
  }

  preload(): void {
    preloadAssets(this);
  }

  create(): void {
    this.createPlayerAnimations();

    this.objectColliders = this.physics.add.staticGroup();

    const { map, collisionLayers, spawnPoint } = this.createMap();
    const worldWidth = map.widthInPixels;
    const worldHeight = map.heightInPixels;

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBackgroundColor("#1a1a1a");
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setZoom(1);

    this.player = new Player({
      scene: this,
      x: spawnPoint.x,
      y: spawnPoint.y,
      speed: 200,
    });

    for (const collisionLayer of collisionLayers) {
      this.physics.add.collider(this.player, collisionLayer);
    }

    if (this.player && this.objectColliders) {
      this.physics.add.collider(this.player, this.objectColliders);
    }

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.registry.set("playerDebug", {
      x: this.player.x,
      y: this.player.y,
      speed: this.player.getSpeed(),
    });

    this.scene.launch("HUDScene");
  }

  update(): void {
    if (!this.player || !this.cursors) {
      return;
    }

    this.player.update(this.cursors);
    this.registry.set("playerDebug", {
      x: this.player.x,
      y: this.player.y,
      speed: this.player.getSpeed(),
    });
  }

  private createMap(): LoadedMap {
    const mapDocument = this.cache.xml.get(
      ASSETS.WORLD_MAP,
    ) as XMLDocument | null;

    if (!mapDocument) {
      throw new Error(`Failed to load TMX map "${ASSETS.WORLD_MAP}".`);
    }

    const mapElement = mapDocument.documentElement;
    const mapWidth = this.getRequiredNumberAttribute(mapElement, "width");
    const mapHeight = this.getRequiredNumberAttribute(mapElement, "height");
    const tileWidth = this.getRequiredNumberAttribute(mapElement, "tilewidth");
    const tileHeight = this.getRequiredNumberAttribute(
      mapElement,
      "tileheight",
    );
    const tilesetElement = mapElement.querySelector("tileset");

    if (!tilesetElement) {
      throw new Error("The TMX map does not define a tileset.");
    }

    const tilesetName = tilesetElement.getAttribute("name") ?? "world_tiles";
    const firstGid = Number(tilesetElement.getAttribute("firstgid") ?? "1");
    const map = this.make.tilemap({
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
      throw new Error(
        `Failed to bind tileset "${tilesetName}" to ${ASSETS.PATH_OBJECTS}.`,
      );
    }

    const collisionLayers: Phaser.Tilemaps.TilemapLayer[] = [];
    let depth = 0;

    for (const layerData of this.parseTmxLayers(mapElement)) {
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
      layer.setDepth(depth);
      layer.setVisible(layerData.visible);
      layer.setAlpha(layerData.opacity);
      depth += 1;

      if (layerData.collides) {
        layer.setCollisionByExclusion([-1]);
        collisionLayers.push(layer);
      }
    }

    this.spawnObjects(mapElement);

    return {
      map,
      collisionLayers,
      spawnPoint: this.getPlayerSpawnPoint(
        mapElement,
        mapWidth,
        mapHeight,
        tileWidth,
        tileHeight,
      ),
    };
  }

  private spawnObjects(mapElement: Element) {
    const objectLayers = Array.from(mapElement.querySelectorAll("objectgroup"));

    for (const layer of objectLayers) {
      const objects = Array.from(layer.querySelectorAll("object"));

      for (const obj of objects) {
        const gidAttr = obj.getAttribute("gid");
        if (!gidAttr) continue;

        const gid = Number(gidAttr);

        const x = Number(obj.getAttribute("x") ?? "0");
        const y = Number(obj.getAttribute("y") ?? "0");
        const rotation = Number(obj.getAttribute("rotation") ?? "0");

        const sprite = this.objectColliders?.create(
          x,
          y,
          ASSETS.PATH_OBJECTS,
          gid - 1,
        );

        if (!sprite) continue;

        sprite.setOrigin(0, 1); // Tiled bottom-left origin
        sprite.setRotation(Phaser.Math.DegToRad(rotation));
        sprite.setDepth(y);
      }
    }
  }

  private objectColliders?: Phaser.Physics.Arcade.StaticGroup;

  private parseTmxLayers(mapElement: Element): TmxLayerData[] {
    return Array.from(mapElement.children)
      .filter((child) => child.tagName === "layer")
      .map((layerElement) => {
        const name = layerElement.getAttribute("name") ?? "Layer";
        const visible = layerElement.getAttribute("visible") !== "0";
        const opacity = Number(layerElement.getAttribute("opacity") ?? "1");
        const dataElement = layerElement.querySelector("data");

        if (!dataElement || dataElement.getAttribute("encoding") !== "csv") {
          throw new Error(`Layer "${name}" must use CSV encoding in Tiled.`);
        }

        const width = this.getRequiredNumberAttribute(layerElement, "width");
        const values = dataElement.textContent
          ?.split(",")
          .map((value) => value.trim())
          .filter((value) => value.length > 0)
          .map((value) => {
            const gid = Number(value);
            return gid === 0 ? -1 : gid;
          });

        if (!values?.length) {
          throw new Error(`Layer "${name}" has no tile data.`);
        }

        const tiles: number[][] = [];

        for (let index = 0; index < values.length; index += width) {
          tiles.push(values.slice(index, index + width));
        }

        return {
          name,
          visible,
          opacity,
          collides: this.layerCollides(layerElement, name),
          tiles,
        };
      });
  }

  private layerCollides(layerElement: Element, name: string): boolean {
    if (COLLISION_LAYER_NAMES.has(name.toLowerCase())) {
      return true;
    }

    const properties = Array.from(
      layerElement.querySelectorAll(":scope > properties > property"),
    );
    const collidesProperty = properties.find(
      (property) => property.getAttribute("name") === "collides",
    );
    const value =
      collidesProperty?.getAttribute("value") ??
      collidesProperty?.textContent ??
      "";
    return value === "true";
  }

  private getPlayerSpawnPoint(
    mapElement: Element,
    mapWidth: number,
    mapHeight: number,
    tileWidth: number,
    tileHeight: number,
  ): Phaser.Math.Vector2 {
    const objectLayers = Array.from(mapElement.querySelectorAll("objectgroup"));

    for (const objectLayer of objectLayers) {
      const objects = Array.from(objectLayer.querySelectorAll("object"));

      for (const object of objects) {
        const matchesName =
          object.getAttribute("name") === PLAYER_SPAWN_OBJECT_NAME;
        const matchesType =
          object.getAttribute("type") === PLAYER_SPAWN_OBJECT_TYPE;

        if (!matchesName && !matchesType) {
          continue;
        }

        return new Phaser.Math.Vector2(
          Number(object.getAttribute("x") ?? "0"),
          Number(object.getAttribute("y") ?? "0"),
        );
      }
    }

    return new Phaser.Math.Vector2(
      (mapWidth * tileWidth) / 2,
      (mapHeight * tileHeight) / 2,
    );
  }

  private getRequiredNumberAttribute(
    element: Element,
    attributeName: string,
  ): number {
    const rawValue = element.getAttribute(attributeName);

    if (rawValue === null) {
      throw new Error(`Missing required TMX attribute "${attributeName}".`);
    }

    const value = Number(rawValue);

    if (Number.isNaN(value)) {
      throw new Error(
        `Invalid TMX attribute "${attributeName}" with value "${rawValue}".`,
      );
    }

    return value;
  }

  private createPlayerAnimations(): void {
    if (this.anims.exists(PLAYER_ANIMATION_KEYS.IDLE_RIGHT)) {
      return;
    }

    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.IDLE_UP,
      frames: this.anims.generateFrameNumbers(
        ASSETS.PLAYER_IDLE,
        PLAYER_ANIMATION_FRAMES.idle.up,
      ),
      frameRate: 2,
      repeat: -1,
    });

    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.IDLE_DOWN,
      frames: this.anims.generateFrameNumbers(
        ASSETS.PLAYER_IDLE,
        PLAYER_ANIMATION_FRAMES.idle.down,
      ),
      frameRate: 2,
      repeat: -1,
    });

    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.IDLE_RIGHT,
      frames: this.anims.generateFrameNumbers(
        ASSETS.PLAYER_IDLE,
        PLAYER_ANIMATION_FRAMES.idle.right,
      ),
      frameRate: 2,
      repeat: -1,
    });

    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.IDLE_LEFT,
      frames: this.anims.generateFrameNumbers(
        ASSETS.PLAYER_IDLE,
        PLAYER_ANIMATION_FRAMES.idle.left,
      ),
      frameRate: 2,
      repeat: -1,
    });

    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.WALK_UP,
      frames: this.anims.generateFrameNumbers(
        ASSETS.PLAYER_WALK,
        PLAYER_ANIMATION_FRAMES.walk.up,
      ),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.WALK_DOWN,
      frames: this.anims.generateFrameNumbers(
        ASSETS.PLAYER_WALK,
        PLAYER_ANIMATION_FRAMES.walk.down,
      ),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.WALK_RIGHT,
      frames: this.anims.generateFrameNumbers(
        ASSETS.PLAYER_WALK,
        PLAYER_ANIMATION_FRAMES.walk.right,
      ),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.WALK_LEFT,
      frames: this.anims.generateFrameNumbers(
        ASSETS.PLAYER_WALK,
        PLAYER_ANIMATION_FRAMES.walk.left,
      ),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.RUN_UP,
      frames: this.anims.generateFrameNumbers(
        ASSETS.PLAYER_RUN,
        PLAYER_ANIMATION_FRAMES.run.up,
      ),
      frameRate: 14,
      repeat: -1,
    });

    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.RUN_DOWN,
      frames: this.anims.generateFrameNumbers(
        ASSETS.PLAYER_RUN,
        PLAYER_ANIMATION_FRAMES.run.down,
      ),
      frameRate: 14,
      repeat: -1,
    });

    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.RUN_RIGHT,
      frames: this.anims.generateFrameNumbers(
        ASSETS.PLAYER_RUN,
        PLAYER_ANIMATION_FRAMES.run.right,
      ),
      frameRate: 14,
      repeat: -1,
    });

    this.anims.create({
      key: PLAYER_ANIMATION_KEYS.RUN_LEFT,
      frames: this.anims.generateFrameNumbers(
        ASSETS.PLAYER_RUN,
        PLAYER_ANIMATION_FRAMES.run.left,
      ),
      frameRate: 14,
      repeat: -1,
    });
  }
}
