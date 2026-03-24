import { Player } from "../objects/Player";

export type StatusEffectType = "heal_over_time" | "mana_regen" | "buff" | "debuff";

export interface StatusEffect {
  id: string;
  type: StatusEffectType;
  duration: number; // in milliseconds
  tickInterval?: number; // for periodic effects
  elapsed: number;

  // effect values
  healPerTick?: number;
  manaPerTick?: number;

  stat?: string;
  value?: number;

  onApply?(player: Player): void;
  onExpire?(player: Player): void;
}
