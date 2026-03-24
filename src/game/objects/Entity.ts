import Phaser from "phaser";

export abstract class Entity extends Phaser.Physics.Arcade.Sprite {
  protected get arcadeBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  abstract update(): void;
}
