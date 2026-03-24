import Phaser from "phaser";
import { Player } from "../objects/Player";
import { SpellDamageTarget, SpellDefinition } from "./SpellTypes";

interface ActiveProjectileData {
  spellId: string;
  expiresAt: number;
}

type SpellCastFailureReason = "missing-spell" | "cooldown" | "mana" | "busy";

export interface SpellManagerConfig {
  scene: Phaser.Scene;
  caster: Player;
  spells: Record<string, SpellDefinition>;
  initialSpellId: string;
  projectileCollisionLayers?: Phaser.Types.Physics.Arcade.ArcadeColliderType[];
  damageTargets?: Phaser.Physics.Arcade.Group | Phaser.Physics.Arcade.StaticGroup;
  onDealDamage?: (target: SpellDamageTarget, amount: number, spellId: string) => void;
  onCastFailed?: (spellId: string, reason: SpellCastFailureReason) => void;
}

export class SpellManager {
  private readonly scene: Phaser.Scene;
  private readonly caster: Player;
  private readonly spells: Record<string, SpellDefinition>;
  private equippedSpellId: string;
  private pendingSpellId?: string;
  private readonly cooldownTimestamps = new Map<string, number>();
  private readonly projectileGroups = new Map<string, Phaser.Physics.Arcade.Group>();

  private readonly projectileCollisionLayers: Phaser.Types.Physics.Arcade.ArcadeColliderType[];
  private readonly damageTargets?: Phaser.Physics.Arcade.Group | Phaser.Physics.Arcade.StaticGroup;
  private readonly onDealDamage?: (target: SpellDamageTarget, amount: number, spellId: string) => void;
  private readonly onCastFailed?: (spellId: string, reason: SpellCastFailureReason) => void;

  constructor({
    scene,
    caster,
    spells,
    initialSpellId,
    projectileCollisionLayers = [],
    damageTargets,
    onDealDamage,
    onCastFailed,
  }: SpellManagerConfig) {
    this.scene = scene;
    this.caster = caster;
    this.spells = spells;
    this.equippedSpellId = initialSpellId;
    this.projectileCollisionLayers = projectileCollisionLayers;
    this.damageTargets = damageTargets;
    this.onDealDamage = onDealDamage;
    this.onCastFailed = onCastFailed;

    this.bootstrapProjectilePools();
  }

  update(): void {
    const now = this.scene.time.now;
    this.projectileGroups.forEach((group) => {
      group.children.each((child) => {
        const projectile = child as Phaser.Physics.Arcade.Sprite;
        if (!projectile.active) {
          return true;
        }

        const data = projectile.getData("spellData") as ActiveProjectileData | undefined;
        if (!data || now < data.expiresAt) {
          return true;
        }

        this.deactivateProjectile(projectile, true);
        return true;
      });
    });
  }

  requestCast(spellId: string = this.equippedSpellId): boolean {
    if (this.pendingSpellId) {
      this.onCastFailed?.(spellId, "busy");
      return false;
    }

    const state = this.getCastState(spellId);
    if (!state.allowed) {
      this.onCastFailed?.(spellId, state.reason);
      return false;
    }

    this.pendingSpellId = spellId;
    return true;
  }

  executePendingCast(pointer: Phaser.Input.Pointer): void {
    if (!this.pendingSpellId) {
      return;
    }

    const spellId = this.pendingSpellId;
    this.pendingSpellId = undefined;

    const state = this.getCastState(spellId);
    if (!state.allowed) {
      this.onCastFailed?.(spellId, state.reason);
      return;
    }

    const spell = this.spells[spellId];
    if (!spell) {
      this.onCastFailed?.(spellId, "missing-spell");
      return;
    }

    const manaConsumed = this.caster.useMana(spell.manaCost);
    if (!manaConsumed) {
      this.onCastFailed?.(spellId, "mana");
      return;
    }
    this.cooldownTimestamps.set(spellId, this.scene.time.now + spell.cooldown);

    switch (spell.type) {
      case "projectile":
        this.castProjectile(spell, pointer);
        return;
      case "aoe":
        this.castAoe(spell);
        return;
      case "buff":
        this.castBuff(spell);
        return;
      default:
        return;
    }
  }

  setEquippedSpell(spellId: string): void {
    if (this.spells[spellId]) {
      this.equippedSpellId = spellId;
    }
  }

  getEquippedSpellId(): string {
    return this.equippedSpellId;
  }

  getMana(): number {
    return this.caster.getMana();
  }

  getMaxMana(): number {
    return this.caster.getMaxMana();
  }

  getRemainingCooldown(spellId: string): number {
    const readyAt = this.cooldownTimestamps.get(spellId) ?? 0;
    return Math.max(0, readyAt - this.scene.time.now);
  }

  private getCastState(spellId: string): { allowed: true } | { allowed: false; reason: SpellCastFailureReason } {
    const spell = this.spells[spellId];
    if (!spell) {
      return { allowed: false, reason: "missing-spell" };
    }

    if (this.caster.getMana() < spell.manaCost) {
      return { allowed: false, reason: "mana" };
    }

    const cooldownLeft = this.getRemainingCooldown(spellId);
    if (cooldownLeft > 0) {
      return { allowed: false, reason: "cooldown" };
    }

    return { allowed: true };
  }

  private bootstrapProjectilePools(): void {
    Object.values(this.spells).forEach((spell) => {
      if (spell.type !== "projectile" || !spell.projectile) {
        return;
      }

      const group = this.scene.physics.add.group({
        classType: Phaser.Physics.Arcade.Sprite,
        maxSize: spell.projectile.poolSize ?? 16,
        runChildUpdate: false,
      });

      this.projectileCollisionLayers.forEach((layer) => {
        this.scene.physics.add.collider(group, layer, (_projectileObj) => {
          const projectile = _projectileObj as Phaser.Physics.Arcade.Sprite;
          this.deactivateProjectile(projectile, true);
        });
      });

      if (this.damageTargets) {
        this.scene.physics.add.overlap(group, this.damageTargets, (projectileObj, targetObj) => {
          const projectile = projectileObj as Phaser.Physics.Arcade.Sprite;
          const target = targetObj as SpellDamageTarget;
          const data = projectile.getData("spellData") as ActiveProjectileData | undefined;

          if (data) {
            const projectileSpell = this.spells[data.spellId];
            if (projectileSpell?.damage && projectileSpell.damage > 0) {
              this.onDealDamage?.(target, projectileSpell.damage, data.spellId);
            }
          }

          this.deactivateProjectile(projectile, true);
        });
      }

      this.projectileGroups.set(spell.id, group);
    });
  }

  private castProjectile(spell: SpellDefinition, pointer: Phaser.Input.Pointer): void {
    if (!spell.projectile) {
      return;
    }

    const group = this.projectileGroups.get(spell.id);
    if (!group) {
      return;
    }

    const projectile = group.get(this.caster.x, this.caster.y, spell.projectile.textureKey) as Phaser.Physics.Arcade.Sprite | null;
    if (!projectile) {
      return;
    }

    projectile.setActive(true);
    projectile.setVisible(true);
    projectile.setPosition(this.caster.x, this.caster.y);
    projectile.setDepth(this.caster.y + 1);

    projectile.enableBody(true, this.caster.x, this.caster.y, true, true);
    const body = projectile.body as Phaser.Physics.Arcade.Body | null;
    if (!body) {
      this.deactivateProjectile(projectile, false);
      return;
    }

    body.setAllowGravity(false);

    if (spell.projectile.bodyRadius) {
      const radius = spell.projectile.bodyRadius;
      const offsetX = Math.max(0, (projectile.width - radius * 2) / 2);
      const offsetY = Math.max(0, (projectile.height - radius * 2) / 2);
      body.setCircle(radius, offsetX, offsetY);
    }

    projectile.anims.play(spell.projectile.animationKey, true);

    const target = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
    const direction = target.subtract(new Phaser.Math.Vector2(this.caster.x, this.caster.y));

    if (direction.lengthSq() <= 1) {
      direction.set(1, 0);
    }

    direction.normalize();
    body.setVelocity(direction.x * spell.projectile.speed, direction.y * spell.projectile.speed);
    projectile.setRotation(direction.angle());

    projectile.setData("spellData", {
      spellId: spell.id,
      expiresAt: this.scene.time.now + spell.projectile.lifespanMs,
    } as ActiveProjectileData);
  }

  private castAoe(spell: SpellDefinition): void {
    if (!spell.aoe) {
      return;
    }

    const radius = spell.aoe.radius;

    if (spell.aoe.effectAnimationKey) {
      this.playCenteredEffect(this.caster.x, this.caster.y, spell.aoe.effectAnimationKey, spell.aoe.effectScale);
    }

    const damage = spell.damage;
    if (!this.damageTargets || !damage || damage <= 0) {
      return;
    }

    this.damageTargets.children.each((targetObj) => {
      const target = targetObj as SpellDamageTarget;
      if (!target.active) {
        return true;
      }

      const distance = Phaser.Math.Distance.Between(this.caster.x, this.caster.y, target.x, target.y);
      if (distance <= radius) {
        this.onDealDamage?.(target, damage, spell.id);
      }
      return true;
    });
  }

  private castBuff(spell: SpellDefinition): void {
    if (!spell.buff) {
      return;
    }

    if (spell.buff.healAmount && spell.buff.healAmount > 0) {
      this.caster.heal(spell.buff.healAmount);
    }

    if (spell.buff.effectAnimationKey) {
      this.playCenteredEffect(this.caster.x, this.caster.y, spell.buff.effectAnimationKey, spell.buff.effectScale);
    }
  }

  private deactivateProjectile(projectile: Phaser.Physics.Arcade.Sprite, spawnImpact: boolean): void {
    if (!projectile.active) {
      return;
    }

    const data = projectile.getData("spellData") as ActiveProjectileData | undefined;
    const spell = data ? this.spells[data.spellId] : undefined;

    if (spawnImpact && spell?.impactEffect) {
      this.spawnImpactEffect(projectile.x, projectile.y, spell);
    }

    const body = projectile.body as Phaser.Physics.Arcade.Body | null;
    body?.stop();
    projectile.disableBody(true, true);
    projectile.setData("spellData", undefined);
  }

  private spawnImpactEffect(x: number, y: number, spell: SpellDefinition): void {
    if (!spell.impactEffect) {
      return;
    }

    const impact = this.scene.add.sprite(x, y, spell.impactEffect.textureKey);
    impact.setDepth(y + 2);
    impact.setScale(spell.impactEffect.scale ?? 1);
    impact.play(spell.impactEffect.animationKey);
    impact.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => impact.destroy());

    if (spell.cameraShake) {
      this.scene.cameras.main.shake(spell.cameraShake.durationMs, spell.cameraShake.intensity);
    }
  }

  private playCenteredEffect(x: number, y: number, animationKey: string, scale: number = 1): void {
    const animation = this.scene.anims.get(animationKey);
    if (!animation) {
      return;
    }

    const frameTextureKey = animation.frames[0]?.textureKey;
    if (!frameTextureKey) {
      return;
    }

    const effect = this.scene.add.sprite(x, y, frameTextureKey);
    effect.setDepth(y + 2);
    effect.setScale(scale);
    effect.play(animationKey);
    effect.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => effect.destroy());
  }
}
