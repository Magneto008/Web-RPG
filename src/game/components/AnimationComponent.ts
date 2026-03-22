import Phaser from "phaser";
import { PLAYER_ANIMATION_KEYS } from "../assets/configs/PlayerAnimationConfigs";

export class AnimationComponent {
  private sprite: Phaser.GameObjects.Sprite;
  private facingDirection: "right" | "up" | "left" | "down" = "down";

  constructor(sprite: Phaser.GameObjects.Sprite) {
    this.sprite = sprite;
  }

  update(isMoving: boolean, vx: number, vy: number, isRunning: boolean): void {
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
}
