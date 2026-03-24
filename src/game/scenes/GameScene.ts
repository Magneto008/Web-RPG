import Phaser from "phaser";
import { Player } from "../objects/Player";
import { loadMap } from "../systems/MapLoader";
import { spawnObjects } from "../systems/ObjectSpawner";
import { createPlayerAnimations } from "../animations/playerAnimations";
import { createChestAnimations } from "../animations/chestAnimations";
import { createFurnaceAnimations } from "../animations/furnaceAnimations";
import { saveGame, loadGame } from "../systems/SaveSystem";
import { Chest } from "../objects/Chest";
import { InteractionSystem } from "../systems/InteractionSystem";
import {
  ApplyItemEffectPayload,
  DropItemFromSlotPayload,
  FurnaceSlotsUpdatedPayload,
  GAME_EVENTS,
  GameStateChangedPayload,
  InventoryFullPayload,
  SmeltItemFromSlotPayload,
  SplitInventorySlotPayload,
  SwapInventorySlotsPayload,
  UseItemFromSlotPayload,
} from "../events/GameEvents";
import { getGameStore } from "../state/getGameStore";
import { GameState } from "../types/GameState";
import { GameStore } from "../state/GameStore";

export class GameScene extends Phaser.Scene {
  private player?: Player;
  private objectColliders?: Phaser.Physics.Arcade.StaticGroup;
  private items?: Phaser.Physics.Arcade.Group;
  private chests?: Phaser.Physics.Arcade.StaticGroup;
  private furnaces?: Phaser.Physics.Arcade.StaticGroup;
  private interactionSystem?: InteractionSystem;
  private autoSaveEvent?: Phaser.Time.TimerEvent;
  private gameStore?: GameStore;
  private gameState: GameState = GameState.RUNNING;

  private readonly onUseItemFromSlot = (payload: UseItemFromSlotPayload): void => {
    if (!this.player) {
      return;
    }

    this.player.getInventory().useItemFromSlot(payload.slotIndex, this.player);
  };

  private readonly onDropItemFromSlot = (payload: DropItemFromSlotPayload): void => {
    if (!this.player || !this.items) {
      return;
    }

    const success = this.player.getInventory().removeItemFromSlot(payload.slotIndex, 1);
    if (!success) {
      return;
    }

    const dropX = this.player.x;
    const dropY = this.player.y + 10;
    const item = this.items.create(dropX, dropY, payload.itemKey);

    item.setOrigin(0.5, 0.5);
    item.setDepth(dropY);
    item.setData("canBePickedUp", false);
    item.setAlpha(0.5);

    this.time.delayedCall(2000, () => {
      if (!item.active) {
        return;
      }

      item.setData("canBePickedUp", true);
      item.setAlpha(1);
      this.tweens.add({
        targets: item,
        alpha: 0.5,
        duration: 100,
        yoyo: true,
        repeat: 2,
      });
    });

    this.tweens.add({
      targets: item,
      y: dropY - 20,
      duration: 300,
      yoyo: true,
      ease: "Back.easeOut",
    });
  };

  private readonly onSwapInventorySlots = (payload: SwapInventorySlotsPayload): void => {
    if (!this.player) {
      return;
    }

    const inventory = this.player.getInventory();
    const slots = inventory.getInventory();
    const fromSlot = slots[payload.fromIndex];
    const toSlot = slots[payload.toIndex];

    if (fromSlot?.itemId && fromSlot.itemId === toSlot?.itemId) {
      const merged = inventory.mergeSlots(payload.fromIndex, payload.toIndex);
      if (!merged) {
        inventory.swapSlots(payload.fromIndex, payload.toIndex);
      }
      return;
    }

    inventory.swapSlots(payload.fromIndex, payload.toIndex);
  };

  private readonly onSplitInventorySlot = (payload: SplitInventorySlotPayload): void => {
    this.player?.getInventory().splitSlot(payload.slotIndex, payload.amount);
  };

  private readonly onSmeltItemFromSlot = (payload: SmeltItemFromSlotPayload): void => {
    if (!this.player || !this.interactionSystem) {
      return;
    }

    const inventorySlots = this.player.getInventory().getInventory();
    const slot = inventorySlots[payload.slotIndex];
    if (!slot?.itemId || slot.quantity <= 0) {
      return;
    }

    const removed = this.player.getInventory().removeItemFromSlot(payload.slotIndex, 1);
    if (!removed) {
      return;
    }

    const result = this.interactionSystem.queueSmeltItem(slot.itemId, payload.furnaceSlotIndex);
    if (!result.success) {
      this.player.addItem(slot.itemId, 1);
    }
  };

  private readonly onInventoryFull = (payload: InventoryFullPayload): void => {
    console.log(`Inventory full! Could not add ${payload.remaining}x ${payload.itemKey}`);
  };

  private readonly onApplyItemEffect = (payload: ApplyItemEffectPayload): void => {
    console.log(`Applying effect for ${payload.itemId} from slot ${payload.slotIndex}`);
  };

  private readonly onRevivePlayer = (): void => {
    this.player?.revive();
  };

  private readonly onFurnaceSlotsUpdated = (payload: FurnaceSlotsUpdatedPayload): void => {
    this.gameStore?.setFurnaceSlots(payload.slots);
  };

  private readonly onOpenInventoryForFurnace = (): void => {
    this.gameStore?.setFurnaceUiOpen(true);
  };

  private readonly onCloseFurnace = (): void => {
    this.gameStore?.setFurnaceUiOpen(false);
  };

  private readonly onGameStateChanged = (payload: GameStateChangedPayload): void => {
    this.gameState = payload.state;
    this.gameStore?.setGameState(payload.state);

    if (payload.state === GameState.PAUSED) {
      this.physics.world.pause();
      if (this.player) {
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0, 0);
      }
      return;
    }

    this.physics.world.resume();
  };

  private readonly onDebugTakeDamage = (): void => this.player?.takeDamage(10);
  private readonly onDebugHeal = (): void => this.player?.heal(10);
  private readonly onDebugAddMora = (): void => this.player?.addMora(100);
  private readonly onDebugRemoveMora = (): void => { this.player?.removeMora(100); };

  private readonly onDebugGiveItem = (): void => {
    const itemId = window.prompt("Enter the Item ID to give to the player (e.g., 'heart-item'):");
    if (itemId && this.player) {
      this.player.addItem(itemId, 1);
    }
  };

  private readonly onDebugSpawnChest = (): void => {
    if (!this.player || !this.chests || !this.items) {
      return;
    }

    const chest = new Chest({
      scene: this,
      x: this.player.x + 40,
      y: this.player.y,
      itemsGroup: this.items,
    });
    chest.name = `debug_chest_${Date.now()}`;
    this.chests.add(chest);
  };

  constructor() {
    super("GameScene");
  }

  create(): void {
    this.gameStore = getGameStore(this);
    this.gameStore.setGameState(GameState.RUNNING);
    this.gameStore.setFurnaceSlots(Array.from({ length: 3 }, () => ({ itemId: null, quantity: 0 })));
    this.gameStore.setFurnaceUiOpen(false);
    this.gameState = GameState.RUNNING;

    createPlayerAnimations(this);
    createChestAnimations(this);
    createFurnaceAnimations(this);

    this.objectColliders = this.physics.add.staticGroup();
    this.chests = this.physics.add.staticGroup();
    this.furnaces = this.physics.add.staticGroup();

    const { map, collisionLayers, spawnPoint, mapElement } = loadMap(this);
    const worldWidth = map.widthInPixels;
    const worldHeight = map.heightInPixels;

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    this.items = this.physics.add.group();

    const savedData = loadGame();
    spawnObjects(
      mapElement,
      this.objectColliders,
      this.items,
      this.chests,
      this.furnaces,
      savedData?.collectedMapItems,
    );

    this.player = new Player({
      scene: this,
      store: this.gameStore,
      x: spawnPoint.x,
      y: spawnPoint.y,
      speed: 150,
      saveData: savedData,
    });

    collisionLayers.forEach((layer) => {
      if (this.player) {
        this.physics.add.collider(this.player, layer);
      }
    });

    if (this.player) {
      this.physics.add.collider(this.player, this.objectColliders);
      this.physics.add.collider(this.player, this.chests);
      this.physics.add.collider(this.player, this.furnaces);
      this.interactionSystem = new InteractionSystem(
        this,
        this.player,
        this.items,
        this.chests,
        this.furnaces,
      );
    }

    this.cameras.main.startFollow(this.player!, true, 0.1, 0.1);
    this.cameras.main.setBackgroundColor("#1a1a1a");
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setZoom(1);

    this.gameStore.setPlayerDebug({
      x: this.player?.x ?? 0,
      y: this.player?.y ?? 0,
      speed: this.player?.getSpeed() ?? 0,
    });

    this.registerDebugHotkeys();
    this.registerGlobalEvents();

    this.autoSaveEvent = this.time.addEvent({
      delay: 5000,
      loop: true,
      callback: () => {
        if (this.player) {
          saveGame(this.player.getSaveData());
        }
      },
    });

    if (!this.scene.isActive("HUDScene")) {
      this.scene.launch("HUDScene");
    }
    this.scene.bringToTop("HUDScene");

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unregisterDebugHotkeys();
      this.unregisterGlobalEvents();
      this.interactionSystem?.destroy();
      this.interactionSystem = undefined;
      this.autoSaveEvent?.remove(false);
      this.autoSaveEvent = undefined;
      this.physics.world.resume();
    });
  }

  update(): void {
    if (!this.player || this.gameState === GameState.PAUSED) {
      return;
    }

    this.player.update();
    this.gameStore?.setPlayerDebug({
      x: this.player.x,
      y: this.player.y,
      speed: this.player.getSpeed(),
    });
  }

  private registerGlobalEvents(): void {
    this.game.events.on(GAME_EVENTS.UI_USE_ITEM_FROM_SLOT, this.onUseItemFromSlot);
    this.game.events.on(GAME_EVENTS.UI_DROP_ITEM_FROM_SLOT, this.onDropItemFromSlot);
    this.game.events.on(GAME_EVENTS.UI_SWAP_INVENTORY_SLOTS, this.onSwapInventorySlots);
    this.game.events.on(GAME_EVENTS.UI_SPLIT_INVENTORY_SLOT, this.onSplitInventorySlot);
    this.game.events.on(GAME_EVENTS.UI_SMELT_ITEM_FROM_SLOT, this.onSmeltItemFromSlot);
    this.game.events.on(GAME_EVENTS.UI_INVENTORY_FULL, this.onInventoryFull);
    this.game.events.on(GAME_EVENTS.UI_APPLY_ITEM_EFFECT, this.onApplyItemEffect);
    this.game.events.on(GAME_EVENTS.UI_REVIVE_PLAYER, this.onRevivePlayer);
    this.game.events.on(GAME_EVENTS.GAME_STATE_CHANGED, this.onGameStateChanged);
    this.game.events.on(GAME_EVENTS.FURNACE_SLOTS_UPDATED, this.onFurnaceSlotsUpdated);
    this.game.events.on(GAME_EVENTS.UI_OPEN_INVENTORY_FOR_FURNACE, this.onOpenInventoryForFurnace);
    this.game.events.on(GAME_EVENTS.UI_CLOSE_FURNACE, this.onCloseFurnace);
  }

  private unregisterGlobalEvents(): void {
    this.game.events.off(GAME_EVENTS.UI_USE_ITEM_FROM_SLOT, this.onUseItemFromSlot);
    this.game.events.off(GAME_EVENTS.UI_DROP_ITEM_FROM_SLOT, this.onDropItemFromSlot);
    this.game.events.off(GAME_EVENTS.UI_SWAP_INVENTORY_SLOTS, this.onSwapInventorySlots);
    this.game.events.off(GAME_EVENTS.UI_SPLIT_INVENTORY_SLOT, this.onSplitInventorySlot);
    this.game.events.off(GAME_EVENTS.UI_SMELT_ITEM_FROM_SLOT, this.onSmeltItemFromSlot);
    this.game.events.off(GAME_EVENTS.UI_INVENTORY_FULL, this.onInventoryFull);
    this.game.events.off(GAME_EVENTS.UI_APPLY_ITEM_EFFECT, this.onApplyItemEffect);
    this.game.events.off(GAME_EVENTS.UI_REVIVE_PLAYER, this.onRevivePlayer);
    this.game.events.off(GAME_EVENTS.GAME_STATE_CHANGED, this.onGameStateChanged);
    this.game.events.off(GAME_EVENTS.FURNACE_SLOTS_UPDATED, this.onFurnaceSlotsUpdated);
    this.game.events.off(GAME_EVENTS.UI_OPEN_INVENTORY_FOR_FURNACE, this.onOpenInventoryForFurnace);
    this.game.events.off(GAME_EVENTS.UI_CLOSE_FURNACE, this.onCloseFurnace);
  }

  private registerDebugHotkeys(): void {
    this.input.keyboard?.on("keydown-H", this.onDebugTakeDamage);
    this.input.keyboard?.on("keydown-G", this.onDebugHeal);
    this.input.keyboard?.on("keydown-M", this.onDebugAddMora);
    this.input.keyboard?.on("keydown-N", this.onDebugRemoveMora);
    this.input.keyboard?.on("keydown-Y", this.onDebugGiveItem);
    this.input.keyboard?.on("keydown-C", this.onDebugSpawnChest);
  }

  private unregisterDebugHotkeys(): void {
    this.input.keyboard?.off("keydown-H", this.onDebugTakeDamage);
    this.input.keyboard?.off("keydown-G", this.onDebugHeal);
    this.input.keyboard?.off("keydown-M", this.onDebugAddMora);
    this.input.keyboard?.off("keydown-N", this.onDebugRemoveMora);
    this.input.keyboard?.off("keydown-Y", this.onDebugGiveItem);
    this.input.keyboard?.off("keydown-C", this.onDebugSpawnChest);
  }
}
