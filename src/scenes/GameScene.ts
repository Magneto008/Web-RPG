import Phaser from "phaser";

const PLAYER_SIZE = 32;
const PLAYER_SPEED = 200;
const GRID_SIZE = 40;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

export class GameScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private player?: Phaser.GameObjects.Rectangle;

  constructor() {
    super("GameScene");
  }

  preload(): void {
    // Intentionally empty for now. The scene still follows Phaser's standard lifecycle.
  }

  create(): void {
    this.drawMap();

    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.cameras.main.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.cameras.main.setBackgroundColor("#1a1a1a");
    this.cameras.main.setRoundPixels(true);

    this.player = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, PLAYER_SIZE, PLAYER_SIZE, 0x4ade80)
      .setOrigin(0.5, 0.5);

    this.physics.add.existing(this.player);

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(PLAYER_SIZE, PLAYER_SIZE);

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
  }

  update(): void {
    if (!this.player || !this.cursors) {
      return;
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown) {
      velocityX = -PLAYER_SPEED;
    } else if (this.cursors.right.isDown) {
      velocityX = PLAYER_SPEED;
    }

    if (this.cursors.up.isDown) {
      velocityY = -PLAYER_SPEED;
    } else if (this.cursors.down.isDown) {
      velocityY = PLAYER_SPEED;
    }

    body.setVelocity(velocityX, velocityY);

    if (velocityX !== 0 && velocityY !== 0) {
      body.velocity.normalize().scale(PLAYER_SPEED);
    }
  }

  private drawMap(): void {
    const graphics = this.add.graphics();

    graphics.fillStyle(0x202020, 1);
    graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    graphics.lineStyle(1, 0x2f2f2f, 1);

    for (let x = 0; x <= GAME_WIDTH; x += GRID_SIZE) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, GAME_HEIGHT);
    }

    for (let y = 0; y <= GAME_HEIGHT; y += GRID_SIZE) {
      graphics.moveTo(0, y);
      graphics.lineTo(GAME_WIDTH, y);
    }

    graphics.strokePath();

    // Add a few solid tiles so the scene reads like a simple map immediately.
    graphics.fillStyle(0x3b3b3b, 1);
    graphics.fillRect(80, 80, GRID_SIZE * 2, GRID_SIZE);
    graphics.fillRect(560, 120, GRID_SIZE, GRID_SIZE * 3);
    graphics.fillRect(240, 440, GRID_SIZE * 4, GRID_SIZE);
  }
}
