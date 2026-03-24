# Web RPG Game

A web-based 2D RPG game built using **Phaser 3** and **TypeScript**. 

## Overview
This game features a top-down perspective where the player can walk and sprint around a tile-based map. The game architecture is modular, handling map loading from Tiled (TMX) format, collision detection, sprite animations, and dynamic object spawning.

## Architecture & Structure

The codebase is organized into distinct responsibilities under the `src/` directory. Each file serves a specific purpose to make the game work.

### 1. Root React Setup (`src/`)
Files at the root of `src/` handle the React wrapper around the Phaser game.
- **`App.tsx`**: The main React component that renders the game container and mounts the Phaser game instance within it using a `useEffect` hook.
- **`main.tsx`**: The React entry point that bootstraps the application and mounts `App.tsx` to the DOM.
- **`styles.css`**: Global CSS styles for the application, ensuring the game container fills the screen correctly.
- **`vite-env.d.ts`**: TypeScript declarations for Vite's client environment variables.
- **`rexui.d.ts`**: TypeScript declarations for the RexUI Phaser plugin used for UI elements.

### 2. Core Game Setup (`src/game/`)
- **`game.ts`**: Initializes the Phaser game instance and sets up the root configuration (renderer, arcade physics, pixel-art rendering, window scaling, plugins) and registers the core scenes (`TitleScene`, `GameScene`, and `HUDScene`).

### 3. Scenes (`src/game/scenes/`)
Scenes represent different states or visual layers of the application.
- **`TitleScene.ts`**: The main menu scene displayed when the game launches, providing a play button to start the game.
- **`GameScene.ts`**: The primary gameplay loop and world container. It loads assets globally, sets up world boundaries, loads the tile map, spawns interactive objects, initializes the player, configures collision barriers, and sets the main camera.
- **`HUDScene.ts`**: A UI overlay scene that operates concurrently with the `GameScene` to display real-time player stats, health, inventory, and other UI elements.

### 4. Game Objects (`src/game/objects/`)
- **`Player.ts`**: The main interactive character, extending `Phaser.Physics.Arcade.Sprite`. It manages the player's physics body, keyboard inputs for movement, animation states, and interactions.
- **`Chest.ts`**: An interactive chest object in the game world that can be opened to yield loot or items.

### 5. Components (`src/game/components/`)
Components encapsulate reusable logic and state for game entities.
- **`AnimationComponent.ts`**: Manages sprite animations and direction facing for entities based on their movement state.
- **`HealthComponent.ts`**: Manages an entity's health state, including current health, max health, taking damage, and death handling.
- **`InventoryComponent.ts`**: Manages the player's inventory, including storing items, tracking currency (Mora), and keeping track of collected unique map items.
- **`MovementComponent.ts`**: Handles velocity and movement logic for entities based on input keys, supporting walking and sprinting speeds while normalizing diagonal movement.

### 6. Animations (`src/game/animations/`)
- **`playerAnimations.ts`**: Reads coordinates from asset configuration to generate global Phaser animation keys for the player's various states (Idle, Walk, Run) across all directions.
- **`chestAnimations.ts`**: Generates animation frames for the chest object, handling idle and opening states.

### 7. Systems (`src/game/systems/`)
Systems handle complex logic, map integration, and interactions.
- **`InteractionSystem.ts`**: Manages logic for player interactions with objects in the world, such as opening chests or picking up items.
- **`LootSystem.ts`**: Handles the generation and dropping of items from sources like chests based on predefined loot tables and probabilities.
- **`MapLoader.ts`**: Parses raw Tiled (TMX) XML files to construct a usable game world, setting up tilesets, rendering layers, and generating wall colliders.
- **`ObjectSpawner.ts`**: Iterates over `<objectgroup>` tags within the Tiled map to spawn physical decorations, interactive objects, and chests into the world.
- **`SaveSystem.ts`**: Manages saving and loading of game state (health, inventory, position) to and from local storage.
- **`SpawnSystem.ts`**: Determines the player's starting coordinates by scanning the Tiled map metadata for a `PlayerSpawn` object.

### 8. User Interface (`src/game/ui/`)
- **`ContextMenu.ts`**: A UI component that appears when interacting with items, offering context-specific actions like "Use" or "Info".
- **`GameOverScreen.ts`**: A screen overlay displayed when the player's health reaches zero, offering a revive option.
- **`HealthBar.ts`**: A visual representation of the player's current health relative to their max health.
- **`InventoryUI.ts`**: The graphical interface for managing the player's inventory, displaying collected items and resources.
- **`StatusUI.ts`**: A HUD component displaying debug text and current currency (Mora).
- **`Tooltip.ts`**: A generic UI component that shows descriptive information when hovering over or interacting with items.
- **`UIFactory.ts`**: A utility class for generating consistent UI elements like dialog boxes and text containers.

### 9. Assets & Configuration (`src/game/assets/`)
- **`AssetLoader.ts`**: A centralized system that preloads all required game assets (images, spritesheets) into the Phaser cache.
- **`types.ts`**: TypeScript type definitions for asset configurations.
- **`configs/ItemAssets.ts`**: Configuration mappings for item sprites and assets.
- **`configs/MapAssets.ts`**: Configuration mappings for map tilesets and related assets.
- **`configs/PlayerAnimationConfigs.ts`**: Constants defining the animation keys used for player movements.
- **`configs/PlayerAssets.ts`**: Configuration mappings for player spritesheets and associated dimensions.
- **`configs/UIAssets.ts`**: Configuration mappings for user interface elements, icons, and backgrounds.

### 10. Items (`src/game/items/`)
- **`ItemRegistry.ts`**: A database and registry defining the properties, types, and stats of all available items in the game.

### 11. Utilities (`src/game/utils/`)
- **`TmxParser.ts`**: Helper functions for extracting structured data, properties, and layers from raw TMX XML elements.
