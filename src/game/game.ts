import Phaser from "phaser";
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import { BootScene } from "./scenes/BootScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { TitleScene } from "./scenes/TitleScene";
import { GameScene } from "./scenes/GameScene";
import { HUDScene } from "./scenes/HUDScene";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const TILE_SIZE = 32;

export function createGame(parent: HTMLDivElement): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.CANVAS,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#1a1a1a",
    parent,
    pixelArt: true,
    antialias: false,
    antialiasGL: false,
    roundPixels: true,
    physics: {
      default: "arcade",
      arcade: {
        debug: false,
      },
    },
    disableContextMenu: true,
    scene: [BootScene, PreloadScene, TitleScene, GameScene, HUDScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    plugins: {
      scene: [
        {
          key: "rexUI",
          plugin: RexUIPlugin,
          mapping: "rexUI",
        },
      ],
    },
    fps: {
      target: 60,
      forceSetTimeOut: true,
    },
  };

  return new Phaser.Game(config);
}

export { GAME_HEIGHT, GAME_WIDTH, TILE_SIZE };
