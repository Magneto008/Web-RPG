import Phaser from "phaser";

const PLAYER_SPAWN_OBJECT_NAME = "PlayerSpawn";
const PLAYER_SPAWN_OBJECT_TYPE = "player_spawn";

export function getPlayerSpawnPoint(
  mapElement: Element,
  mapWidth: number,
  mapHeight: number,
  tileWidth: number,
  tileHeight: number,
): Phaser.Math.Vector2 {
  const objectLayers = Array.from(mapElement.querySelectorAll("objectgroup"));

  for (const layer of objectLayers) {
    const objects = Array.from(layer.querySelectorAll("object"));

    for (const obj of objects) {
      const matchesName = obj.getAttribute("name") === PLAYER_SPAWN_OBJECT_NAME;
      const typeAttr = obj.getAttribute("type") || obj.getAttribute("class");
      const matchesType = typeAttr === PLAYER_SPAWN_OBJECT_TYPE;

      if (!matchesName && !matchesType) continue;

      return new Phaser.Math.Vector2(
        Number(obj.getAttribute("x") ?? "0"),
        Number(obj.getAttribute("y") ?? "0"),
      );
    }
  }

  return new Phaser.Math.Vector2(
    (mapWidth * tileWidth) / 2,
    (mapHeight * tileHeight) / 2,
  );
}
