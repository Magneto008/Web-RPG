import Phaser from "phaser";
import { preloadAssets, ASSETS } from "../assets/AssetManager";

export class TitleScene extends Phaser.Scene {
  private bgImage?: Phaser.GameObjects.Image;
  private titleImage?: Phaser.GameObjects.Image;
  private playButton?: Phaser.GameObjects.Image;
  constructor() {
    super("TitleScene");
  }

  preload(): void {
    preloadAssets(this);
  }

  create(): void {
    const { width, height } = this.scale;

    this.bgImage = this.add.image(width / 2, height / 2, ASSETS.TITLE_BG).setOrigin(0.5);
    this.titleImage = this.add.image(width / 2, height / 2 - 150, ASSETS.TITLE_TEXT)
      .setOrigin(0.5)
      .setScale(0.5); // Adjust title scale

    this.playButton = this.add.image(width / 2, height / 2 + 150, ASSETS.TITLE_PLAY)
      .setOrigin(0.5)
      .setScale(0.25); // Made button a bit smaller
    
    const baseScale = 0.25;
    const hoverScale = 0.28;

    this.playButton
      .setInteractive({ 
        useHandCursor: true, 
        pixelPerfect: true, 
        alphaTolerance: 100 // Ignores transparent padding and faint glows
      })
      .on("pointerover", () => {
        this.playButton?.setScale(hoverScale);
        this.playButton?.setTint(0xffffff); // Ensure full brightness
      })
      .on("pointerout", () => {
        this.playButton?.setScale(baseScale);
        this.playButton?.clearTint();
      })
      .on("pointerdown", () => {
        this.scene.start("GameScene");
      });

    this.scale.on("resize", this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off("resize", this.handleResize, this);
    });
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    if (!this.cameras.main) return;
    this.cameras.main.setSize(gameSize.width, gameSize.height);
    
    // Scale background to perfectly cover the entire screen
    if (this.bgImage) {
      this.bgImage.setPosition(gameSize.width / 2, gameSize.height / 2);
      const scaleX = gameSize.width / this.bgImage.width;
      const scaleY = gameSize.height / this.bgImage.height;
      const scale = Math.max(scaleX, scaleY);
      this.bgImage.setScale(scale);
    }

    if (this.titleImage) {
      this.titleImage.setPosition(gameSize.width / 2, gameSize.height / 2 - 150);
    }
    
    if (this.playButton) {
      this.playButton.setPosition(gameSize.width / 2, gameSize.height / 2 + 150);
    }
  }
}
