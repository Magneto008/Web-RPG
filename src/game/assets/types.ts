export type AssetConfig =
  | {
      key: string;
      type: "image";
      path: string;
    }
  | {
      key: string;
      type: "spritesheet";
      path: string;
      frameWidth: number;
      frameHeight: number;
    }
  | {
      key: string;
      type: "xml";
      path: string;
    }
  | {
      key: string;
      type: "audio";
      path: string;
    };
