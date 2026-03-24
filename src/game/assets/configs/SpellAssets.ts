import { AssetConfig } from "../types";

export const SPELL_ASSET_KEYS = {
  FIREBALL_PROJECTILE: "spell-fireball-projectile",
  FIREBALL_IMPACT: "spell-fireball-impact",
  ARCANE_RING: "spell-arcane-ring",
  HEAL_BURST: "spell-heal-burst",
} as const;

const SPELL_FRAME_SIZE = 64;

export const SPELL_ASSET_CONFIGS: AssetConfig[] = [
  {
    key: SPELL_ASSET_KEYS.FIREBALL_PROJECTILE,
    type: "spritesheet",
    path: "/assets/spells/fireball.png",
    frameWidth: SPELL_FRAME_SIZE,
    frameHeight: SPELL_FRAME_SIZE,
  },
  {
    key: SPELL_ASSET_KEYS.FIREBALL_IMPACT,
    type: "spritesheet",
    path: "/assets/spells/fireball-impact.png",
    frameWidth: SPELL_FRAME_SIZE,
    frameHeight: SPELL_FRAME_SIZE,
  },
  {
    key: SPELL_ASSET_KEYS.ARCANE_RING,
    type: "spritesheet",
    path: "/assets/spells/arcane-ring.png",
    frameWidth: SPELL_FRAME_SIZE,
    frameHeight: SPELL_FRAME_SIZE,
  },
  {
    key: SPELL_ASSET_KEYS.HEAL_BURST,
    type: "spritesheet",
    path: "/assets/spells/heal-burst.png",
    frameWidth: SPELL_FRAME_SIZE,
    frameHeight: SPELL_FRAME_SIZE,
  },
];
