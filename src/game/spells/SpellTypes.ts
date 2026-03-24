import Phaser from "phaser";

export type SpellType = "projectile" | "aoe" | "buff";

export interface ProjectileSpellConfig {
  textureKey: string;
  animationKey: string;
  speed: number;
  lifespanMs: number;
  poolSize?: number;
  bodyRadius?: number;
}

export interface AoeSpellConfig {
  radius: number;
  effectAnimationKey?: string;
  effectScale?: number;
}

export interface BuffSpellConfig {
  healAmount?: number;
  durationMs?: number;
  effectAnimationKey?: string;
  effectScale?: number;
}

export interface ImpactEffectConfig {
  textureKey: string;
  animationKey: string;
  scale?: number;
}

export interface CameraShakeConfig {
  durationMs: number;
  intensity: number;
}

export interface SpellDefinition {
  id: string;
  manaCost: number;
  cooldown: number;
  damage?: number;
  type: SpellType;
  projectile?: ProjectileSpellConfig;
  aoe?: AoeSpellConfig;
  buff?: BuffSpellConfig;
  impactEffect?: ImpactEffectConfig;
  cameraShake?: CameraShakeConfig;
}

export interface SpellDamageTarget extends Phaser.GameObjects.GameObject {
  x: number;
  y: number;
}
