const COLLISION_LAYER_NAMES = new Set(["collision", "collisions"]);

export type TmxLayerData = {
  name: string;
  visible: boolean;
  opacity: number;
  collides: boolean;
  tiles: number[][];
};

export function parseTmxLayers(mapElement: Element): TmxLayerData[] {
  return Array.from(mapElement.children)
    .filter((child) => child.tagName === "layer")
    .map((layerElement) => {
      const name = layerElement.getAttribute("name") ?? "Layer";
      const visible = layerElement.getAttribute("visible") !== "0";
      const opacity = Number(layerElement.getAttribute("opacity") ?? "1");

      const dataElement = layerElement.querySelector("data");
      if (!dataElement || dataElement.getAttribute("encoding") !== "csv") {
        throw new Error(`Layer "${name}" must use CSV encoding.`);
      }

      const width = getRequiredNumberAttribute(layerElement, "width");

      const values = dataElement.textContent
        ?.split(",")
        .map((v) => v.trim())
        .filter(Boolean)
        .map((v) => {
          const gid = Number(v);
          return gid === 0 ? -1 : gid;
        });

      if (!values?.length) {
        throw new Error(`Layer "${name}" has no tile data.`);
      }

      const tiles: number[][] = [];
      for (let i = 0; i < values.length; i += width) {
        tiles.push(values.slice(i, i + width));
      }

      return {
        name,
        visible,
        opacity,
        collides: layerCollides(layerElement, name),
        tiles,
      };
    });
}

export function layerCollides(layerElement: Element, name: string): boolean {
  if (COLLISION_LAYER_NAMES.has(name.toLowerCase())) return true;

  const prop = layerElement.querySelector(
    ':scope > properties > property[name="collides"]',
  );

  const value = prop?.getAttribute("value") ?? prop?.textContent ?? "";
  return value === "true";
}

export function getRequiredNumberAttribute(element: Element, attr: string): number {
  const raw = element.getAttribute(attr);
  if (raw === null) throw new Error(`Missing "${attr}"`);

  const value = Number(raw);
  if (Number.isNaN(value)) throw new Error(`Invalid "${attr}"`);

  return value;
}
