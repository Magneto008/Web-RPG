import Phaser from "phaser";

export const ASSETS = {
  PLAYER_IDLE: "player-idle",
  PLAYER_WALK: "player-walk",
  PLAYER_RUN: "player-run",
  PATH_OBJECTS: "path-objects",
  WORLD_MAP: "world-map",
  HEART_ITEM: "heart-item",
  TITLE_BG: "title-bg",
  TITLE_TEXT: "title-text",
  TITLE_PLAY: "title-play",
} as const;

export const PLAYER_ANIMATION_KEYS = {
  IDLE_UP: "idle-up",
  IDLE_DOWN: "idle-down",
  IDLE_LEFT: "idle-left",
  IDLE_RIGHT: "idle-right",
  WALK_UP: "walk-up",
  WALK_DOWN: "walk-down",
  WALK_LEFT: "walk-left",
  WALK_RIGHT: "walk-right",
  RUN_UP: "run-up",
  RUN_DOWN: "run-down",
  RUN_LEFT: "run-left",
  RUN_RIGHT: "run-right",
} as const;

export const PLAYER_SPRITE_CONFIG = {
  frameWidth: 64,
  frameHeight: 64,
  directions: {
    up: 0,
    left: 1,
    down: 2,
    right: 3,
  },
  idleFramesPerRow: 2,
  walkFramesPerRow: 9,
  runFramesPerRow: 8,
} as const;

export const PLAYER_ANIMATION_FRAMES = {
  idle: {
    right: {
      start: PLAYER_SPRITE_CONFIG.directions.right * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.right * 13 +
        PLAYER_SPRITE_CONFIG.idleFramesPerRow -
        1,
    },
    up: {
      start: PLAYER_SPRITE_CONFIG.directions.up * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.up * 13 +
        PLAYER_SPRITE_CONFIG.idleFramesPerRow -
        1,
    },
    left: {
      start: PLAYER_SPRITE_CONFIG.directions.left * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.left * 13 +
        PLAYER_SPRITE_CONFIG.idleFramesPerRow -
        1,
    },
    down: {
      start: PLAYER_SPRITE_CONFIG.directions.down * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.down * 13 +
        PLAYER_SPRITE_CONFIG.idleFramesPerRow -
        1,
    },
  },
  walk: {
    right: {
      start: PLAYER_SPRITE_CONFIG.directions.right * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.right * 13 +
        PLAYER_SPRITE_CONFIG.walkFramesPerRow -
        1,
    },
    up: {
      start: PLAYER_SPRITE_CONFIG.directions.up * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.up * 13 +
        PLAYER_SPRITE_CONFIG.walkFramesPerRow -
        1,
    },
    left: {
      start: PLAYER_SPRITE_CONFIG.directions.left * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.left * 13 +
        PLAYER_SPRITE_CONFIG.walkFramesPerRow -
        1,
    },
    down: {
      start: PLAYER_SPRITE_CONFIG.directions.down * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.down * 13 +
        PLAYER_SPRITE_CONFIG.walkFramesPerRow -
        1,
    },
  },
  run: {
    right: {
      start: PLAYER_SPRITE_CONFIG.directions.right * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.right * 13 +
        PLAYER_SPRITE_CONFIG.runFramesPerRow -
        1,
    },
    up: {
      start: PLAYER_SPRITE_CONFIG.directions.up * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.up * 13 +
        PLAYER_SPRITE_CONFIG.runFramesPerRow -
        1,
    },
    left: {
      start: PLAYER_SPRITE_CONFIG.directions.left * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.left * 13 +
        PLAYER_SPRITE_CONFIG.runFramesPerRow -
        1,
    },
    down: {
      start: PLAYER_SPRITE_CONFIG.directions.down * 13,
      end:
        PLAYER_SPRITE_CONFIG.directions.down * 13 +
        PLAYER_SPRITE_CONFIG.runFramesPerRow -
        1,
    },
  },
} as const;

type AssetConfig =
  | {
      key: string;
      type: "image";
      path: string;
    }
  | {
      key: string;
      type: "spritesheet";
      path: string;
      frameWidth: number;
      frameHeight: number;
    }
  | {
      key: string;
      type: "xml";
      path: string;
    };

const ASSET_CONFIGS: AssetConfig[] = [
  {
    key: ASSETS.PLAYER_IDLE,
    type: "spritesheet",
    path: "/assets/player/idle.png",
    frameWidth: PLAYER_SPRITE_CONFIG.frameWidth,
    frameHeight: PLAYER_SPRITE_CONFIG.frameHeight,
  },
  {
    key: ASSETS.PLAYER_WALK,
    type: "spritesheet",
    path: "/assets/player/walk.png",
    frameWidth: PLAYER_SPRITE_CONFIG.frameWidth,
    frameHeight: PLAYER_SPRITE_CONFIG.frameHeight,
  },
  {
    key: ASSETS.PLAYER_RUN,
    type: "spritesheet",
    path: "/assets/player/run.png",
    frameWidth: PLAYER_SPRITE_CONFIG.frameWidth,
    frameHeight: PLAYER_SPRITE_CONFIG.frameHeight,
  },
  {
    key: ASSETS.PATH_OBJECTS,
    type: "spritesheet",
    path: "/assets/tiles/path-and-objects.png",
    frameWidth: 32,
    frameHeight: 32,
  },
  {
    key: ASSETS.WORLD_MAP,
    type: "xml",
    path: "/assets/maps/world-map.tmx",
  },
  {
    key: ASSETS.HEART_ITEM,
    type: "image",
    path: "/assets/items/heart.png",
  },
  {
    key: ASSETS.TITLE_BG,
    type: "image",
    path: "/assets/ui/background.png",
  },
  {
    key: ASSETS.TITLE_TEXT,
    type: "image",
    path: "/assets/ui/title.png",
  },
  {
    key: ASSETS.TITLE_PLAY,
    type: "image",
    path: "/assets/ui/play.png",
  },
];

export function preloadAssets(scene: Phaser.Scene): void {
  for (const asset of ASSET_CONFIGS) {
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
