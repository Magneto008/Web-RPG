import { ASSETS } from "../assets/AssetLoader";
import { SPELL_ANIMATION_KEYS } from "../animations/spellAnimations";
import { SpellDefinition } from "./SpellTypes";

export const SPELL_IDS = {
  FIREBALL: "fireball",
  ARCANE_PULSE: "arcane-pulse",
  HEALING_BURST: "healing-burst",
} as const;

export const SPELL_DEFINITIONS: Record<string, SpellDefinition> = {
  [SPELL_IDS.FIREBALL]: {
    id: SPELL_IDS.FIREBALL,
    type: "projectile",
    manaCost: 20,
    cooldown: 900,
    damage: 25,
    projectile: {
      textureKey: ASSETS.FIREBALL_PROJECTILE,
      animationKey: SPELL_ANIMATION_KEYS.FIREBALL_LOOP,
      speed: 320,
      lifespanMs: 1100,
      poolSize: 24,
      bodyRadius: 10,
    },
    impactEffect: {
      textureKey: ASSETS.FIREBALL_IMPACT,
      animationKey: SPELL_ANIMATION_KEYS.FIREBALL_IMPACT,
      scale: 1,
    },
    cameraShake: {
      durationMs: 90,
      intensity: 0.0018,
    },
  },
  [SPELL_IDS.ARCANE_PULSE]: {
    id: SPELL_IDS.ARCANE_PULSE,
    type: "aoe",
    manaCost: 28,
    cooldown: 2400,
    damage: 18,
    aoe: {
      radius: 90,
      effectAnimationKey: SPELL_ANIMATION_KEYS.ARCANE_RING,
      effectScale: 1.15,
    },
  },
  [SPELL_IDS.HEALING_BURST]: {
    id: SPELL_IDS.HEALING_BURST,
    type: "buff",
    manaCost: 15,
    cooldown: 3500,
    buff: {
      healAmount: 20,
      effectAnimationKey: SPELL_ANIMATION_KEYS.HEAL_BURST,
      effectScale: 1,
    },
  },
};
