import Phaser from "phaser";

export type MovementKeys = {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  sprint: Phaser.Input.Keyboard.Key;
  spellcast: Phaser.Input.Keyboard.Key;
  thrust: Phaser.Input.Keyboard.Key;
};

export class MovementComponent {
  private keys: MovementKeys;
  private walkSpeed: number;
  private runSpeed: number;
  private currentSpeed: number;

  constructor(scene: Phaser.Scene, walkSpeed: number) {
    this.walkSpeed = walkSpeed;
    this.runSpeed = Math.round(walkSpeed * 1.45);
    this.currentSpeed = walkSpeed;

    this.keys = scene.input.keyboard!.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      sprint: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      spellcast: Phaser.Input.Keyboard.KeyCodes.F,
      thrust: Phaser.Input.Keyboard.KeyCodes.E,
    }) as MovementKeys;
  }

  getVelocity(isDead: boolean): { x: number; y: number; isRunning: boolean; isMoving: boolean; isSpellcasting: boolean; isThrusting: boolean } {
    if (isDead) return { x: 0, y: 0, isRunning: false, isMoving: false, isSpellcasting: false, isThrusting: false };

    let vx = 0;
    let vy = 0;

    const movingLeft = this.keys.left.isDown;
    const movingRight = this.keys.right.isDown;
    const movingUp = this.keys.up.isDown;
    const movingDown = this.keys.down.isDown;
    const isMoving = movingLeft || movingRight || movingUp || movingDown;
    const isRunning = isMoving && this.keys.sprint.isDown;
    const speed = isRunning ? this.runSpeed : this.walkSpeed;

    this.currentSpeed = speed;

    if (movingLeft) vx = -speed;
    else if (movingRight) vx = speed;

    if (movingUp) vy = -speed;
    else if (movingDown) vy = speed;

    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      const factor = speed / Math.sqrt(vx * vx + vy * vy);
      vx *= factor;
      vy *= factor;
    }

    const isSpellcasting = Phaser.Input.Keyboard.JustDown(this.keys.spellcast);
    const isThrusting = this.keys.thrust.isDown;

    return { x: vx, y: vy, isRunning, isMoving, isSpellcasting, isThrusting };
  }

  getCurrentSpeed(): number {
    return this.currentSpeed;
  }
}
