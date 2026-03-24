import { Player } from "../objects/Player";
import { ASSETS } from "../assets/AssetLoader";

type ItemType = "consumable" | "material" | "currency";

export interface ItemData {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  maxStack?: number;
  moraValue?: number;
  dropWeight?: number;
  dropGroup?: string | string[];
  onUse?: (player: Player) => void;
}

export const ITEM_DATABASE: Record<string, ItemData> = {
  // PLACEHOLDER: Add your roguelike sheet items here after you add keys in ITEM_ASSET_KEYS.
  // Example:
  // [ASSETS.RED_POTION]: {
  //   id: ASSETS.RED_POTION,
  //   name: "Minor Health Potion",
  //   description: "A small red vial.\nRestores 30 Health.",
  //   type: "consumable",
  //   maxStack: 20,
  //   onUse: (player: Player) => {
  //     player.heal(30);
  //   },
  //   moraValue: 80,
  //   dropWeight: 45,
  //   dropGroup: "chest",
  // },

  [ASSETS.HEART_ITEM]: {
    id: ASSETS.HEART_ITEM,
    name: "Heart Gem",
    description: "A suspiciously alive rock.\nHeals you for 20 HP. Somehow.",
    type: "consumable",
    maxStack: 99,
    onUse: (player: Player) => {
      player.heal(20);
    },
    moraValue: 100,
    dropWeight: 20,
    dropGroup: ["chest", "enemy"],
  },

  [ASSETS.RED_POTION]: {
    id: ASSETS.RED_POTION,
    name: "Red Potion",
    description:
      "Bright red and very confident.\nRestores 30 HP. Still won’t fix your decision-making.",
    type: "consumable",
    maxStack: 10,
    onUse: (player: Player) => {
      player.heal(30);
    },
    moraValue: 120,
  },

  [ASSETS.GREEN_POTION]: {
    id: ASSETS.GREEN_POTION,
    name: "Regen Potion",
    description:
      "Looks healthy, which is already suspicious.\nHeals 10 HP every second for 5 seconds. Slow… just like your progress.",
    type: "consumable",
    maxStack: 10,
    onUse: (player: Player) => {
      player.addStatusEffect({
        id: "regen_small_" + Date.now(),
        type: "heal_over_time",
        duration: 5000,
        tickInterval: 1000,
        elapsed: 0,
        healPerTick: 10,
      });
    },
    moraValue: 150,
  },

  [ASSETS.BLUE_POTION]: {
    id: ASSETS.BLUE_POTION,
    name: "Mana Potion",
    description:
      "Cold, calm, and smarter than you.\nRestores 10 mana every second. Finally, some intelligence in this relationship.",
    type: "consumable",
    maxStack: 10,
    onUse: (player: Player) => {
      player.addStatusEffect({
        id: "mana_regen_" + Date.now(),
        type: "mana_regen",
        duration: 5000,
        tickInterval: 1000,
        elapsed: 0,
        manaPerTick: 10,
      });
    },
    moraValue: 150,
  },

  [ASSETS.YELLOW_POTION]: {
    id: ASSETS.YELLOW_POTION,
    name: "Speed Potion",
    description:
      "Liquid sunshine with questionable intentions.\n+50 speed for 5 seconds. Try not to run into a wall.",
    type: "consumable",
    maxStack: 10,
    onUse: (player: Player) => {
      player.addStatusEffect({
        id: "speed_boost_" + Date.now(),
        type: "buff",
        duration: 5000,
        elapsed: 0,
        stat: "speed",
        value: 50,
        onApply: (p) => (p.stats.speed += 50),
        onExpire: (p) => (p.stats.speed -= 50),
      });
    },
    moraValue: 200,
  },

  [ASSETS.PURPLE_POTION]: {
    id: ASSETS.PURPLE_POTION,
    name: "Hybrid Potion",
    description:
      "Can’t decide what it wants to be.\nRestores HP and mana. Commitment issues in liquid form.",
    type: "consumable",
    maxStack: 5,
    onUse: (player: Player) => {
      player.heal(20);
      player.restoreMana(20);
    },
    moraValue: 300,
  },

  [ASSETS.ORANGE_POTION]: {
    id: ASSETS.ORANGE_POTION,
    name: "Strength Potion",
    description:
      "Tastes like bad decisions.\n+10 damage for 5 seconds. Overcompensate responsibly.",
    type: "consumable",
    maxStack: 10,
    onUse: (player: Player) => {
      player.addStatusEffect({
        id: "damage_boost_" + Date.now(),
        type: "buff",
        duration: 5000,
        elapsed: 0,
        stat: "damage",
        value: 10,
        onApply: (p) => (p.stats.damage += 10),
        onExpire: (p) => (p.stats.damage -= 10),
      });
    },
    moraValue: 220,
  },

  [ASSETS.BLACK_POTION]: {
    id: ASSETS.BLACK_POTION,
    name: "Dark Potion",
    description:
      "Looks like a terrible idea.\nHeals a lot. Probably at a cost. You’ll find out.",
    type: "consumable",
    maxStack: 5,
    onUse: (player: Player) => {
      player.heal(50);
    },
    moraValue: 250,
  },

  [ASSETS.BROWN_POTION]: {
    id: ASSETS.BROWN_POTION,
    name: "Suspicious Potion",
    description:
      "You looked at this and thought “yeah, I’ll drink that.”\nRestores 15 HP. Bare minimum effort, just like you.",
    type: "consumable",
    maxStack: 20,
    onUse: (player: Player) => {
      player.heal(15);
    },
    moraValue: 60,
  },

  [ASSETS.IRON_ORE]: {
    id: ASSETS.IRON_ORE,
    name: "Iron Ore",
    description:
      "A rock. Congratulations.\nMaybe one day it’ll become something useful.",
    type: "material",
    maxStack: 99,
    moraValue: 50,
    dropWeight: 70,
    dropGroup: ["chest", "enemy"],
  },

  [ASSETS.MORA_ICON]: {
    id: ASSETS.MORA_ICON,
    name: "Mora",
    description: "Money. The real final boss.\nYou’ll never have enough.",
    type: "currency",
    maxStack: 999999,
    moraValue: 1,
    dropWeight: 50,
    dropGroup: ["chest", "enemy"],
  },

  [ASSETS.IRON_INGOT]: {
    id: ASSETS.IRON_INGOT,
    name: "Iron Ingot",
    description: "Look at that, you processed a rock.\nProud of you.",
    type: "material",
    maxStack: 99,
    moraValue: 100,
    dropGroup: "smelter",
  },

  [ASSETS.OBSIDIAN_ORE]: {
    id: ASSETS.OBSIDIAN_ORE,
    name: "Obsidian Ore",
    description:
      "Edgy rock for edgy people.\nProbably stronger than your willpower.",
    type: "material",
    maxStack: 99,
    moraValue: 70,
    dropWeight: 70,
    dropGroup: ["chest", "enemy"],
  },

  [ASSETS.OBSIDIAN_INGOT]: {
    id: ASSETS.OBSIDIAN_INGOT,
    name: "Obsidian Ingot",
    description:
      "Refined darkness in solid form.\nStill can’t fix your life though.",
    type: "material",
    maxStack: 99,
    moraValue: 200,
    dropGroup: "smelter",
  },

  [ASSETS.WOOD]: {
    id: ASSETS.WOOD,
    name: "Wood",
    description:
      "It’s wood.\nIf you were expecting something cooler, that’s on you.",
    type: "material",
    maxStack: 99,
    moraValue: 10,
    dropWeight: 50,
    dropGroup: ["chest", "enemy"],
  },
};

export function getItemData(itemId: string): ItemData | undefined {
  return ITEM_DATABASE[itemId];
}
