import Phaser from "phaser";
import { GAME_EVENTS } from "../events/GameEvents";
import { GameStoreSnapshot } from "../state/GameStore";
import { getGameStore } from "../state/getGameStore";
import { HUDView } from "../ui/HUDView";

export class HUDScene extends Phaser.Scene {
  private hudView?: HUDView;

  private readonly onStoreUpdated = (snapshot: Readonly<GameStoreSnapshot>): void => {
    this.hudView?.render(snapshot);
  };

  constructor() {
    super("HUDScene");
  }

  create(): void {
    this.hudView = new HUDView(this);

    const store = getGameStore(this);
    this.hudView.render(store.getSnapshot());

    this.game.events.on(GAME_EVENTS.STORE_UPDATED, this.onStoreUpdated);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(GAME_EVENTS.STORE_UPDATED, this.onStoreUpdated);
      this.hudView?.destroy();
      this.hudView = undefined;
    });
  }
}
