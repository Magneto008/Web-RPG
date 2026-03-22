import Phaser from "phaser";
import { ASSETS } from "../assets/AssetLoader";
import { Chest } from "../objects/Chest";

export function spawnObjects(
  mapElement: Element,
  group: Phaser.Physics.Arcade.StaticGroup,
  itemGroup: Phaser.Physics.Arcade.Group,
  chestGroup: Phaser.Physics.Arcade.StaticGroup,
  collectedMapItems: string[] = [],
) {
  const objectLayers = Array.from(mapElement.querySelectorAll("objectgroup"));
  const tileSize = 32;

  for (const layer of objectLayers) {
    const objects = Array.from(layer.querySelectorAll("object"));

    for (const obj of objects) {
      const gidAttr = obj.getAttribute("gid");
      const typeAttr = obj.getAttribute("type") || obj.getAttribute("class");
      const nameAttr = obj.getAttribute("name");
      const idAttr = obj.getAttribute("id");

      if (!gidAttr && typeAttr !== "item" && typeAttr !== "chest") continue;

      if (idAttr && collectedMapItems.includes(idAttr)) continue;

      // 🧠 Read properties
      const properties = Array.from(
        obj.querySelectorAll(":scope > properties > property"),
      );

      const collidesProp = properties.find(
        (p) => p.getAttribute("name") === "collides",
      );

      const collides = collidesProp?.getAttribute("value") === "true";

      const gid = Number(gidAttr);

      // 🎯 RAW Tiled coords
      const rawX = Number(obj.getAttribute("x") ?? "0");
      const rawY = Number(obj.getAttribute("y") ?? "0");
      const rotation = Number(obj.getAttribute("rotation") ?? "0");

      // ✅ Convert Tiled → Phaser (center origin)
      const x = Math.round(rawX + tileSize / 2);
      const y = Math.round(rawY - tileSize / 2);

      // 🎒 Spawn Items Array
      if (typeAttr === "item" && nameAttr === "heart") {
        const itemSprite = itemGroup.create(x, y, ASSETS.HEART_ITEM);
        if (idAttr) {
          itemSprite.name = idAttr; // Store the Tiled map ID to save state
        }
        itemSprite.setOrigin(0.5, 0.5);
        itemSprite.setDepth(y);
        // Do not add collides to items since they use overlap
        continue;
      }

      // 🎁 Spawn Chest
      if (typeAttr === "chest" || obj.getAttribute("class") === "chest") {
        const chest = new Chest({
          scene: chestGroup.scene,
          x,
          y,
          itemsGroup: itemGroup,
        });
        if (idAttr) {
          chest.name = idAttr;
          if (collectedMapItems.includes(idAttr)) {
            // If it was already opened, we mark it as opened immediately
            chest.initOpenedState();
            chestGroup.add(chest);
            continue;
          }
        }
        chestGroup.add(chest);
        continue;
      }

      // ❌ Skip non-collidable static objects
      if (!collides) continue;

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
