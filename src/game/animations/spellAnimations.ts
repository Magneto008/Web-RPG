import Phaser from "phaser";
import { ASSETS } from "../assets/AssetLoader";

export const SPELL_ANIMATION_KEYS = {
  FIREBALL_LOOP: "spell-fireball-loop",
  FIREBALL_IMPACT: "spell-fireball-impact",
  ARCANE_RING: "spell-arcane-ring",
  HEAL_BURST: "spell-heal-burst",
} as const;

export function createSpellAnimations(scene: Phaser.Scene): void {
  if (!scene.anims.exists(SPELL_ANIMATION_KEYS.FIREBALL_LOOP)) {
    scene.anims.create({
      key: SPELL_ANIMATION_KEYS.FIREBALL_LOOP,
      frames: scene.anims.generateFrameNumbers(ASSETS.FIREBALL_PROJECTILE, { start: 0, end: 4 }),
      frameRate: 12,
      repeat: -1,
    });
  }

  if (!scene.anims.exists(SPELL_ANIMATION_KEYS.FIREBALL_IMPACT)) {
    scene.anims.create({
      key: SPELL_ANIMATION_KEYS.FIREBALL_IMPACT,
      frames: scene.anims.generateFrameNumbers(ASSETS.FIREBALL_IMPACT, { start: 0, end: 6 }),
      frameRate: 18,
      repeat: 0,
    });
  }

  if (!scene.anims.exists(SPELL_ANIMATION_KEYS.ARCANE_RING)) {
    scene.anims.create({
      key: SPELL_ANIMATION_KEYS.ARCANE_RING,
      frames: scene.anims.generateFrameNumbers(ASSETS.ARCANE_RING, { start: 0, end: 7 }),
      frameRate: 16,
      repeat: 0,
    });
  }

  if (!scene.anims.exists(SPELL_ANIMATION_KEYS.HEAL_BURST)) {
    scene.anims.create({
      key: SPELL_ANIMATION_KEYS.HEAL_BURST,
      frames: scene.anims.generateFrameNumbers(ASSETS.HEAL_BURST, { start: 0, end: 7 }),
      frameRate: 16,
      repeat: 0,
    });
  }
}
