import Phaser from "phaser";
import { PLAYER_ANIMATION_KEYS } from "../assets/configs/PlayerAnimationConfigs";
import { FacingDirection } from "../types/PlayerState";

const LOCKED_PLAYER_ANIMATIONS = new Set<string>([
  PLAYER_ANIMATION_KEYS.SPELL_UP,
  PLAYER_ANIMATION_KEYS.SPELL_DOWN,
  PLAYER_ANIMATION_KEYS.SPELL_LEFT,
  PLAYER_ANIMATION_KEYS.SPELL_RIGHT,
  PLAYER_ANIMATION_KEYS.THRUST_UP,
  PLAYER_ANIMATION_KEYS.THRUST_DOWN,
  PLAYER_ANIMATION_KEYS.THRUST_LEFT,
  PLAYER_ANIMATION_KEYS.THRUST_RIGHT,
  PLAYER_ANIMATION_KEYS.HURT,
]);

export class AnimationComponent {
  private swordSprite?: Phaser.GameObjects.Sprite;
  private facingDirection: FacingDirection = FacingDirection.DOWN;

  constructor(private readonly sprite: Phaser.GameObjects.Sprite) {}

  setSwordSprite(sword: Phaser.GameObjects.Sprite): void {
    this.swordSprite = sword;
    this.swordSprite.setVisible(false);
    this.swordSprite.setBlendMode(Phaser.BlendModes.ADD);
  }

  update(isMoving: boolean, vx: number, vy: number, isRunning: boolean): void {
    if (this.isLocked()) {
      if (this.swordSprite?.visible) {
        this.syncSwordPosition();
      }
      return;
    }

    if (vx < 0) {
      this.facingDirection = FacingDirection.LEFT;
    } else if (vx > 0) {
      this.facingDirection = FacingDirection.RIGHT;
    } else if (vy < 0) {
      this.facingDirection = FacingDirection.UP;
    } else if (vy > 0) {
      this.facingDirection = FacingDirection.DOWN;
    }

    const key = isMoving
      ? isRunning
        ? this.getRunKey()
        : this.getWalkKey()
      : this.getIdleKey();

    this.sprite.anims.play(key, true);
  }

  playSpellcast(): void {
    this.sprite.anims.play(this.getSpellKey(), true);
  }

  playThrust(): void {
    this.sprite.anims.play(this.getThrustKey(), true);

    if (!this.swordSprite) {
      return;
    }

    this.swordSprite.setVisible(true);
    this.swordSprite.anims.play(this.getSwordSlashKey(), true);
    this.swordSprite.setAngle(0);
    this.swordSprite.setFlipX(false);
    this.syncSwordPosition();
    this.swordSprite.once("animationcomplete", () => {
      this.swordSprite?.setVisible(false);
    });
  }

  isLocked(): boolean {
    const currentAnim = this.sprite.anims.currentAnim?.key;
    if (!currentAnim) {
      return false;
    }

    return LOCKED_PLAYER_ANIMATIONS.has(currentAnim) && this.sprite.anims.isPlaying;
  }

  private syncSwordPosition(): void {
    if (!this.swordSprite) {
      return;
    }

    let offsetX = 0;
    let offsetY = 0;

    switch (this.facingDirection) {
      case FacingDirection.RIGHT:
        offsetX = 0;
        break;
      case FacingDirection.LEFT:
        offsetX = 0;
        break;
      case FacingDirection.UP:
        offsetY = 0;
        break;
      case FacingDirection.DOWN:
        offsetY = 0;
        break;
    }

    this.swordSprite.setPosition(this.sprite.x + offsetX, this.sprite.y + offsetY);

    if (this.facingDirection === FacingDirection.UP) {
      this.swordSprite.setDepth(this.sprite.depth - 1);
      return;
    }

    this.swordSprite.setDepth(this.sprite.depth + 1);
  }

  private getIdleKey(): string {
    switch (this.facingDirection) {
      case FacingDirection.UP:
        return PLAYER_ANIMATION_KEYS.IDLE_UP;
      case FacingDirection.LEFT:
        return PLAYER_ANIMATION_KEYS.IDLE_LEFT;
      case FacingDirection.RIGHT:
        return PLAYER_ANIMATION_KEYS.IDLE_RIGHT;
      default:
        return PLAYER_ANIMATION_KEYS.IDLE_DOWN;
    }
  }

  private getWalkKey(): string {
    switch (this.facingDirection) {
      case FacingDirection.UP:
        return PLAYER_ANIMATION_KEYS.WALK_UP;
      case FacingDirection.LEFT:
        return PLAYER_ANIMATION_KEYS.WALK_LEFT;
      case FacingDirection.RIGHT:
        return PLAYER_ANIMATION_KEYS.WALK_RIGHT;
      default:
        return PLAYER_ANIMATION_KEYS.WALK_DOWN;
    }
  }

  private getRunKey(): string {
    switch (this.facingDirection) {
      case FacingDirection.UP:
        return PLAYER_ANIMATION_KEYS.RUN_UP;
      case FacingDirection.LEFT:
        return PLAYER_ANIMATION_KEYS.RUN_LEFT;
      case FacingDirection.RIGHT:
        return PLAYER_ANIMATION_KEYS.RUN_RIGHT;
      default:
        return PLAYER_ANIMATION_KEYS.RUN_DOWN;
    }
  }

  private getSpellKey(): string {
    switch (this.facingDirection) {
      case FacingDirection.UP:
        return PLAYER_ANIMATION_KEYS.SPELL_UP;
      case FacingDirection.LEFT:
        return PLAYER_ANIMATION_KEYS.SPELL_LEFT;
      case FacingDirection.RIGHT:
        return PLAYER_ANIMATION_KEYS.SPELL_RIGHT;
      default:
        return PLAYER_ANIMATION_KEYS.SPELL_DOWN;
    }
  }

  private getThrustKey(): string {
    switch (this.facingDirection) {
      case FacingDirection.UP:
        return PLAYER_ANIMATION_KEYS.THRUST_UP;
      case FacingDirection.LEFT:
        return PLAYER_ANIMATION_KEYS.THRUST_LEFT;
      case FacingDirection.RIGHT:
        return PLAYER_ANIMATION_KEYS.THRUST_RIGHT;
      default:
        return PLAYER_ANIMATION_KEYS.THRUST_DOWN;
    }
  }

  private getSwordSlashKey(): string {
    switch (this.facingDirection) {
      case FacingDirection.UP:
        return PLAYER_ANIMATION_KEYS.SWORD_SLASH_UP;
      case FacingDirection.LEFT:
        return PLAYER_ANIMATION_KEYS.SWORD_SLASH_LEFT;
      case FacingDirection.RIGHT:
        return PLAYER_ANIMATION_KEYS.SWORD_SLASH_RIGHT;
      default:
        return PLAYER_ANIMATION_KEYS.SWORD_SLASH_DOWN;
    }
  }
}
