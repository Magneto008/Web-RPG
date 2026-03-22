import Phaser from "phaser";
import { PLAYER_ANIMATION_KEYS } from "../assets/configs/PlayerAnimationConfigs";

export class AnimationComponent {
  private sprite: Phaser.GameObjects.Sprite;
  private swordSprite?: Phaser.GameObjects.Sprite;
  private facingDirection: "right" | "up" | "left" | "down" = "down";

  constructor(sprite: Phaser.GameObjects.Sprite) {
    this.sprite = sprite;
  }

  setSwordSprite(sword: Phaser.GameObjects.Sprite): void {
    this.swordSprite = sword;
    this.swordSprite.setVisible(false);
    this.swordSprite.setBlendMode(Phaser.BlendModes.ADD);
  }

  update(isMoving: boolean, vx: number, vy: number, isRunning: boolean): void {
    if (this.isLocked()) {
      // Keep sword synced during animation
      if (this.swordSprite && this.swordSprite.visible) {
        this.syncSwordPosition();
      }
      return;
    }

    if (vx < 0) this.facingDirection = "left";
    else if (vx > 0) this.facingDirection = "right";
    else if (vy < 0) this.facingDirection = "up";
    else if (vy > 0) this.facingDirection = "down";

    const key = isMoving
      ? isRunning ? this.getRunKey() : this.getWalkKey()
      : this.getIdleKey();

    this.sprite.anims.play(key, true);
  }

  private getIdleKey(): string {
    switch (this.facingDirection) {
      case "up": return PLAYER_ANIMATION_KEYS.IDLE_UP;
      case "left": return PLAYER_ANIMATION_KEYS.IDLE_LEFT;
      case "right": return PLAYER_ANIMATION_KEYS.IDLE_RIGHT;
      default: return PLAYER_ANIMATION_KEYS.IDLE_DOWN;
    }
  }

  private getWalkKey(): string {
    switch (this.facingDirection) {
      case "up": return PLAYER_ANIMATION_KEYS.WALK_UP;
      case "left": return PLAYER_ANIMATION_KEYS.WALK_LEFT;
      case "right": return PLAYER_ANIMATION_KEYS.WALK_RIGHT;
      default: return PLAYER_ANIMATION_KEYS.WALK_DOWN;
    }
  }

  private getRunKey(): string {
    switch (this.facingDirection) {
      case "up": return PLAYER_ANIMATION_KEYS.RUN_UP;
      case "left": return PLAYER_ANIMATION_KEYS.RUN_LEFT;
      case "right": return PLAYER_ANIMATION_KEYS.RUN_RIGHT;
      default: return PLAYER_ANIMATION_KEYS.RUN_DOWN;
    }
  }

  playSpellcast(): void {
    const key = this.getSpellKey();
    this.sprite.anims.play(key, true);
  }

  playThrust(): void {
    const key = this.getThrustKey();
    this.sprite.anims.play(key, true);

    if (this.swordSprite) {
      this.swordSprite.setVisible(true);
      const swordKey = this.getSwordSlashKey();
      this.swordSprite.anims.play(swordKey, true);
      
      // No manual rotation needed as the sheet has all directions
      this.swordSprite.setAngle(0);
      this.swordSprite.setFlipX(false);

      this.syncSwordPosition();

      // Auto-hide when animation ends
      this.swordSprite.once("animationcomplete", () => {
        this.swordSprite?.setVisible(false);
      });
    }
  }

  private getSwordSlashKey(): string {
    switch (this.facingDirection) {
      case "up": return PLAYER_ANIMATION_KEYS.SWORD_SLASH_UP;
      case "left": return PLAYER_ANIMATION_KEYS.SWORD_SLASH_LEFT;
      case "right": return PLAYER_ANIMATION_KEYS.SWORD_SLASH_RIGHT;
      default: return PLAYER_ANIMATION_KEYS.SWORD_SLASH_DOWN;
    }
  }

  private syncSwordPosition(): void {
    if (!this.swordSprite) return;

    let offsetX = 0;
    let offsetY = 0;
    const distance = 0; // Bring closer to hand

    switch (this.facingDirection) {
      case "right": offsetX = distance; break;
      case "left": offsetX = -distance; break;
      case "up": offsetY = -distance; break;
      case "down": offsetY = distance; break;
    }

    this.swordSprite.setPosition(this.sprite.x + offsetX, this.sprite.y + offsetY);
    
    // Depth adjustment: Up should be behind player, others in front
    if (this.facingDirection === "up") {
      this.swordSprite.setDepth(this.sprite.depth - 1);
    } else {
      this.swordSprite.setDepth(this.sprite.depth + 1);
    }
  }

  isLocked(): boolean {
    const currentAnim = this.sprite.anims.currentAnim?.key;
    if (!currentAnim) return false;

    // List of animations that cannot be interrupted by movement
    const lockedAnims = [
      PLAYER_ANIMATION_KEYS.SPELL_UP, PLAYER_ANIMATION_KEYS.SPELL_DOWN, PLAYER_ANIMATION_KEYS.SPELL_LEFT, PLAYER_ANIMATION_KEYS.SPELL_RIGHT,
      PLAYER_ANIMATION_KEYS.THRUST_UP, PLAYER_ANIMATION_KEYS.THRUST_DOWN, PLAYER_ANIMATION_KEYS.THRUST_LEFT, PLAYER_ANIMATION_KEYS.THRUST_RIGHT,
      PLAYER_ANIMATION_KEYS.HURT
    ];

    return lockedAnims.includes(currentAnim as any) && this.sprite.anims.isPlaying;
  }

  private getSpellKey(): string {
    switch (this.facingDirection) {
      case "up": return PLAYER_ANIMATION_KEYS.SPELL_UP;
      case "left": return PLAYER_ANIMATION_KEYS.SPELL_LEFT;
      case "right": return PLAYER_ANIMATION_KEYS.SPELL_RIGHT;
      default: return PLAYER_ANIMATION_KEYS.SPELL_DOWN;
    }
  }

  private getThrustKey(): string {
    switch (this.facingDirection) {
      case "up": return PLAYER_ANIMATION_KEYS.THRUST_UP;
      case "left": return PLAYER_ANIMATION_KEYS.THRUST_LEFT;
      case "right": return PLAYER_ANIMATION_KEYS.THRUST_RIGHT;
      default: return PLAYER_ANIMATION_KEYS.THRUST_DOWN;
    }
  }
}
