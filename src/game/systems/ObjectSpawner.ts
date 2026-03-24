import Phaser from "phaser";
import { ASSETS } from "../assets/AssetLoader";
import { Chest } from "../objects/Chest";
import { Furnace } from "../objects/Furnace";
import { LootSystem } from "./LootSystem";

export function spawnObjects(
  mapElement: Element,
  group: Phaser.Physics.Arcade.StaticGroup,
  itemGroup: Phaser.Physics.Arcade.Group,
  chestGroup: Phaser.Physics.Arcade.StaticGroup,
  furnaceGroup: Phaser.Physics.Arcade.StaticGroup,
  collectedMapItems: string[] = [],
): void {
  const objectLayers = Array.from(mapElement.querySelectorAll("objectgroup"));
  const fallbackTileSize = 32;
  const collisionBodySize = Math.floor(fallbackTileSize * 0.88);

  for (const layer of objectLayers) {
    const objects = Array.from(layer.querySelectorAll("object"));

    for (const obj of objects) {
      const gidAttr = obj.getAttribute("gid");
      const typeAttr = obj.getAttribute("type") || obj.getAttribute("class");
      const nameAttr = obj.getAttribute("name");
      const idAttr = obj.getAttribute("id");

      if (!gidAttr && typeAttr !== "item" && typeAttr !== "chest" && typeAttr !== "furnace") {
        continue;
      }

      if (idAttr && collectedMapItems.includes(idAttr)) {
        continue;
      }

      const properties = Array.from(obj.querySelectorAll(":scope > properties > property"));
      const collidesProp = properties.find((p) => p.getAttribute("name") === "collides");
      const collides = collidesProp?.getAttribute("value") === "true";

      const rawX = Number(obj.getAttribute("x") ?? "0");
      const rawY = Number(obj.getAttribute("y") ?? "0");
      const objWidth = Number(obj.getAttribute("width") ?? `${fallbackTileSize}`);
      const objHeight = Number(obj.getAttribute("height") ?? `${fallbackTileSize}`);
      const rotation = Number(obj.getAttribute("rotation") ?? "0");

      // Convert Tiled object coordinates to centered sprite coordinates.
      const x = Math.round(rawX + objWidth / 2);
      const y = Math.round(rawY - objHeight / 2);

      if (typeAttr === "item" && nameAttr === "heart") {
        const itemSprite = itemGroup.create(x, y, ASSETS.HEART_ITEM);
        if (idAttr) {
          itemSprite.name = idAttr;
        }
        LootSystem.styleWorldItem(itemSprite, y, {
          canBePickedUp: true,
          alpha: 1,
        });
        continue;
      }

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
            chest.initOpenedState();
          }
        }

        chestGroup.add(chest);
        continue;
      }

      if (typeAttr === "furnace" || obj.getAttribute("class") === "furnace") {
        const furnace = new Furnace({
          scene: furnaceGroup.scene,
          x,
          y,
          itemsGroup: itemGroup,
        });
        furnaceGroup.add(furnace);
        continue;
      }

      if (!collides) {
        continue;
      }

      const gid = Number(gidAttr);
      const sprite = group.create(x, y, ASSETS.PATH_OBJECTS, gid - 1);
      if (!sprite) {
        continue;
      }

      sprite.setOrigin(0.5, 0.5);
      sprite.setRotation(Phaser.Math.DegToRad(rotation));
      sprite.setDepth(y);

      // Slightly trim static colliders so player movement feels less sticky near corners.
      sprite.setSize(collisionBodySize, collisionBodySize);
      sprite.refreshBody();
    }
  }
}
