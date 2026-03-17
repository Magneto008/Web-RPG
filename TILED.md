# Tiled Workflow

This project now loads the map directly from Tiled.

## Drop-In Files

- Map TMX: `public/assets/maps/world-map.tmx`
- Tileset TSX: `public/assets/tiles/world_tiles.tsx`
- Tilesheet image: `public/assets/tiles/path-and-objects.png`

Overwrite `world-map.tmx` with your exported Tiled map when you make changes.

## Tiled Setup

- Map type: orthogonal
- Tile size: `32x32`
- Tileset image: `public/assets/tiles/path-and-objects.png`
- Recommended external tileset file: `public/assets/tiles/world_tiles.tsx`
- The TSX image source should stay `path-and-objects.png`

## Layer Conventions

- Any tile layer named `Collisions` or `Collision` becomes collidable.
- A tile layer with a boolean custom property `collides = true` also becomes collidable.
- Add a point object named `PlayerSpawn` to set the player spawn position.
  - The object type `player_spawn` also works.

## Notes

- Hidden collision layers stay hidden in game.
- If no spawn object exists, the player starts at the map center.
- The project no longer generates terrain, water, walls, trees, rocks, or UI textures at runtime.
