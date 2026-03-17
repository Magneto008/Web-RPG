import Phaser from "phaser";
import { ASSETS } from "../assets/AssetManager";

export function spawnObjects(
  mapElement: Element,
  group: Phaser.Physics.Arcade.StaticGroup,
) {
  const objectLayers = Array.from(mapElement.querySelectorAll("objectgroup"));
  const tileSize = 32;

  for (const layer of objectLayers) {
    const objects = Array.from(layer.querySelectorAll("object"));

    for (const obj of objects) {
      const gidAttr = obj.getAttribute("gid");
      if (!gidAttr) continue;

      // 🧠 Read properties
      const properties = Array.from(
        obj.querySelectorAll(":scope > properties > property"),
      );

      const collidesProp = properties.find(
        (p) => p.getAttribute("name") === "collides",
      );

      const collides = collidesProp?.getAttribute("value") === "true";

      // ❌ Skip non-collidable objects
      if (!collides) continue;

      const gid = Number(gidAttr);

      // 🎯 RAW Tiled coords
      const rawX = Number(obj.getAttribute("x") ?? "0");
      const rawY = Number(obj.getAttribute("y") ?? "0");
      const rotation = Number(obj.getAttribute("rotation") ?? "0");

      // ✅ Convert Tiled → Phaser (center origin)
      const x = Math.round(rawX + tileSize / 2);
      const y = Math.round(rawY - tileSize / 2);

      const sprite = group.create(x, y, ASSETS.PATH_OBJECTS, gid - 1);
      if (!sprite) continue;

      // ✅ Clean setup (NO hacks)
      sprite.setOrigin(0.5, 0.5);
      sprite.setRotation(Phaser.Math.DegToRad(rotation));
      sprite.setDepth(y);

      // 🧱 Proper collision body
      sprite.setSize(tileSize, tileSize);
      sprite.refreshBody();
    }
  }
}
