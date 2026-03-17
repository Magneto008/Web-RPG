# Web RPG Game

A web-based 2D RPG game built using **Phaser 3** and **TypeScript**. 

## Overview
This game features a top-down perspective where the player can walk and sprint around a tile-based map. The game architecture is modular, handling map loading from Tiled (TMX) format, collision detection, sprite animations, and dynamic object spawning.

## Architecture & Structure

The codebase is organized into distinct responsibilities under the `src/game/` directory:

### 1. Core Setup (`game.ts`)
Initializes the Phaser game instance and sets up the root configuration.
- **`createGame(parent: HTMLDivElement)`**: Configures the Phaser renderer, Arcade physics, pixel-art rendering, window scaling, and registers the core scenes (`GameScene` and `HUDScene`).

### 2. Scenes (`scenes/`)
Scenes represent different states or visual layers of the application.
- **`GameScene.ts`**: The primary gameplay loop and world container.
  - `preload()`: Loads all textures and assets globally.
  - `create()`: Sets up the world boundaries, loads the tile map (`loadMap`), spawns interactive objects (`spawnObjects`), initializes the `Player`, configures collision barriers, and sets the main camera to follow the player. It also launches the HUD.
  - `update()`: Runs every frame to update player logic and broadcast telemetry to the HUD.
- **`HUDScene.ts`**: A UI overlay scene that operates concurrently with the GameScene.
  - `create()`: Creates text elements and subscribes to `changedata-playerDebug` events via the Phaser registry.
  - `handlePlayerDebugChange()` & `refreshText()`: Updates the on-screen display with the player's real-time X/Y coordinates and movement speed.

### 3. Game Objects (`objects/`)
- **`Player.ts`**: The main interactive character, extending `Phaser.Physics.Arcade.Sprite`.
  - `constructor()`: Initializes the physics body (size/offset) and registers WASD + Shift keyboard inputs.
  - `update(cursors)`: Evaluates keyboard input to apply movement vectors. It normalizes diagonal velocity to maintain consistent speeds, and toggles between walk and sprint speeds.
  - `updateAnimation(...)`: Dynamically selects the correct animation state (idle, walk, or run) and directional facing based on the current velocity vector.

### 4. Animations (`animations/`)
- **`playerAnimations.ts`**: 
  - `createPlayerAnimations(scene)`: Reads coordinates from asset configuration to generate global Phaser animation keys for the player's various states (Idle, Walk, Run) across all 4 directions.

### 5. Systems (`systems/`)
Systems extract complex logic away from scenes, largely dealing with Tiled map integration.
- **`MapLoader.ts`**: Parses raw Tiled (TMX) XML files into a usable game world.
  - `loadMap(scene)`: Extracts XML nodes to construct a `Phaser.Tilemaps.Tilemap`, binds the tileset image, and iterates through layers to render them. It handles setting up wall colliders based on Tiled properties.
  - `parseTmxLayers(mapElement)`: Decodes base64/CSV map data arrays into Phasers' expected 2D tile layout format.
- **`ObjectSpawner.ts`**:
  - `spawnObjects(mapElement, group)`: Iterates over the `<objectgroup>` tags within the Tiled map. Finds physical map decorations (e.g. rocks, trees), parses custom Tiled properties like `collides="true"`, and places them as static physics bodies into the world.
- **`SpawnSystem.ts`**:
  - `getPlayerSpawnPoint(mapElement, ...)`: Scans the Tiled map metadata for a specific rect object named `PlayerSpawn` to determine the player's start coordinates, falling back to the map center if missing.
