import Phaser from "phaser";
import { ASSETS } from "../assets/AssetManager";

export function spawnObjects(
  scene: Phaser.Scene,
  mapElement: Element,
  group: Phaser.Physics.Arcade.StaticGroup,
) {
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

      const sprite = group.create(x, y, ASSETS.PATH_OBJECTS, gid - 1);
      if (!sprite) continue;

      sprite.setOrigin(0, 1);
      sprite.setRotation(Phaser.Math.DegToRad(rotation));
      sprite.setDepth(y);
    }
  }
}
