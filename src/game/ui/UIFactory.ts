import Phaser from "phaser";

interface DialogConfig {
  x: number;
  y: number;
  width?: number;
  height?: number;
  backgroundKey: string;
  title: string;
  content: string;
  buttonKey?: string;
  onConfirm?: () => void;
}

interface ScrollablePanelConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundKey: string;
  items: Array<{ text: string; callback: () => void }>;
}

interface FixWidthSizerLike {
  add: (gameObject: Phaser.GameObjects.GameObject) => void;
}

export class UIFactory {
  static createDialog(scene: Phaser.Scene, config: DialogConfig): Phaser.GameObjects.GameObject {
    const rexUI = scene.rexUI;

    const dialog = rexUI.add
      .dialog({
        x: config.x,
        y: config.y,
        width: config.width || 400,
        height: config.height || 300,
        background: scene.add.image(0, 0, config.backgroundKey),
        title: scene.add.text(0, 0, config.title, {
          fontSize: "24px",
          color: "#ffffff",
          fontStyle: "bold",
        }),
        content: scene.add.text(0, 0, config.content, {
          fontSize: "18px",
          color: "#ffffff",
        }),
        actions: config.buttonKey
          ? [
              rexUI.add.label({
                background: scene.add.image(0, 0, config.buttonKey),
                text: scene.add.text(0, 0, "OK", {
                  fontSize: "18px",
                  color: "#ffffff",
                }),
                space: { left: 10, right: 10, top: 10, bottom: 10 },
              }),
            ]
          : [],
        space: {
          title: 25,
          content: 25,
          action: 15,
          left: 20,
          right: 20,
          top: 20,
          bottom: 20,
        },
        align: {
          title: "center",
          content: "center",
          actions: "right",
        },
      })
      .layout();

    if (config.onConfirm) {
      dialog.on("button.click", () => {
        config.onConfirm?.();
        dialog.destroy();
      });
    }

    return dialog;
  }

  static createScrollablePanel(
    scene: Phaser.Scene,
    config: ScrollablePanelConfig,
  ): Phaser.GameObjects.GameObject {
    const rexUI = scene.rexUI;

    const panel = rexUI.add
      .scrollablePanel({
        x: config.x,
        y: config.y,
        width: config.width,
        height: config.height,
        scrollMode: 0,
        background: rexUI.add.roundRectangle(0, 0, 2, 2, 10, 0x000000, 0.8),
        panel: {
          child: rexUI.add.fixWidthSizer({
            space: { left: 10, right: 10, top: 10, bottom: 10, item: 8, line: 8 },
          }),
        },
        slider: {
          track: rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0x333333),
          thumb: rexUI.add.roundRectangle(0, 0, 0, 0, 13, 0xffffff),
        },
        mouseWheelScroller: {
          focus: false,
          speed: 0.1,
        },
        space: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10,
          panel: 10,
        },
      })
      .layout();

    const sizer = panel.getElement("panel") as unknown as FixWidthSizerLike;

    for (const item of config.items) {
      const label = rexUI.add
        .label({
          background: scene
            .add.image(0, 0, config.backgroundKey)
            .setDisplaySize(config.width - 40, 40),
          text: scene.add.text(0, 0, item.text, { fontSize: "16px" }),
          space: { left: 10, right: 10, top: 10, bottom: 10 },
        })
        .setInteractive()
        .on("pointerdown", () => item.callback());

      sizer.add(label);
    }

    // Re-layout once after all children are added to avoid repeated expensive recalculations.
    panel.layout();
    return panel;
  }
}
