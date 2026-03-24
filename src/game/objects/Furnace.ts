import Phaser from "phaser";
import { ASSETS } from "../assets/AssetLoader";
import { FURNACE_ANIMATION_KEYS } from "../animations/furnaceAnimations";
import { GAME_EVENTS } from "../events/GameEvents";
import { InventorySlot } from "../items/Inventory";
import { LootSystem } from "../systems/LootSystem";

interface FurnaceConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  itemsGroup: Phaser.Physics.Arcade.Group;
}

interface SmeltingRecipe {
  inputItem: string;
  outputItem: string;
  label: string;
}

export interface SmeltResult {
  success: boolean;
  message: string;
}

const SMELT_DURATION_MS = 3200;
const INPUT_SLOT_COUNT = 3;

const SMELTING_RECIPES: SmeltingRecipe[] = [
  {
    inputItem: ASSETS.OBSIDIAN_ORE,
    outputItem: ASSETS.OBSIDIAN_INGOT,
    label: "Obsidian",
  },
  {
    inputItem: ASSETS.IRON_ORE,
    outputItem: ASSETS.IRON_INGOT,
    label: "Iron",
  },
];

export class Furnace extends Phaser.Physics.Arcade.Sprite {
  private readonly itemsGroup: Phaser.Physics.Arcade.Group;
  private readonly inputSlots: Array<string | null> = Array(INPUT_SLOT_COUNT).fill(null);
  private readonly slotDropTargets: Array<Phaser.Math.Vector2 | null> = Array(INPUT_SLOT_COUNT).fill(null);
  private isSmelting = false;

  constructor(config: FurnaceConfig) {
    super(config.scene, config.x, config.y, ASSETS.FURNACE, 0);
    this.itemsGroup = config.itemsGroup;

    config.scene.add.existing(this);
    config.scene.physics.add.existing(this, true);

    this.setOrigin(0.5, 0.5);
    this.setDepth(this.y);

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    // Collide mainly with the furnace base so movement around chimney stays natural.
    body.setSize(44, 28);
    body.setOffset(10, 66);

    if (this.scene.anims.exists(FURNACE_ANIMATION_KEYS.IDLE)) {
      this.play(FURNACE_ANIMATION_KEYS.IDLE);
    } else {
      this.setFrame(0);
    }

    this.emitSlotsChanged();
  }

  queueInput(itemKey: string, dropNear: Phaser.Math.Vector2, preferredSlotIndex?: number): SmeltResult {
    const recipe = SMELTING_RECIPES.find((entry) => entry.inputItem === itemKey);
    if (!recipe) {
      return {
        success: false,
        message: "This item cannot be smelted.",
      };
    }

    let slotIndex = this.inputSlots.findIndex((slot) => slot === null);
    if (
      preferredSlotIndex !== undefined &&
      preferredSlotIndex >= 0 &&
      preferredSlotIndex < INPUT_SLOT_COUNT
    ) {
      if (this.inputSlots[preferredSlotIndex] === null) {
        slotIndex = preferredSlotIndex;
      } else {
        return {
          success: false,
          message: "Selected furnace slot is occupied.",
        };
      }
    }

    if (slotIndex === -1) {
      return {
        success: false,
        message: "Furnace input slots are full.",
      };
    }

    this.inputSlots[slotIndex] = recipe.inputItem;
    this.slotDropTargets[slotIndex] = dropNear.clone();
    this.emitSlotsChanged();
    this.tryStartSmelting();

    const queued = this.inputSlots.filter((slot) => slot !== null).length;
    return {
      success: true,
      message: `Queued ${recipe.label} ore (${queued}/${INPUT_SLOT_COUNT})`,
    };
  }

  getSlotState(): InventorySlot[] {
    return this.inputSlots.map((itemId) => {
      if (!itemId) {
        return { itemId: null, quantity: 0 };
      }

      return { itemId, quantity: 1 };
    });
  }

  private emitSlotsChanged(): void {
    this.scene.game.events.emit(GAME_EVENTS.FURNACE_SLOTS_UPDATED, {
      slots: this.getSlotState(),
    });
  }

  private tryStartSmelting(): void {
    if (this.isSmelting) {
      return;
    }

    const nextIndex = this.inputSlots.findIndex((slot) => slot !== null);
    if (nextIndex === -1) {
      if (this.scene.anims.exists(FURNACE_ANIMATION_KEYS.IDLE)) {
        this.play(FURNACE_ANIMATION_KEYS.IDLE);
      } else {
        this.setFrame(0);
      }
      return;
    }

    const inputItem = this.inputSlots[nextIndex];
    if (!inputItem) {
      return;
    }

    const recipe = SMELTING_RECIPES.find((entry) => entry.inputItem === inputItem);
    if (!recipe) {
      this.inputSlots[nextIndex] = null;
      this.slotDropTargets[nextIndex] = null;
      this.emitSlotsChanged();
      this.tryStartSmelting();
      return;
    }

    this.isSmelting = true;
    if (this.scene.anims.exists(FURNACE_ANIMATION_KEYS.SMELTING)) {
      this.play(FURNACE_ANIMATION_KEYS.SMELTING);
    }

    this.scene.time.delayedCall(SMELT_DURATION_MS, () => {
      const dropNear = this.slotDropTargets[nextIndex];
      this.inputSlots[nextIndex] = null;
      this.slotDropTargets[nextIndex] = null;
      this.emitSlotsChanged();

      this.spawnSmeltedDrop(recipe.outputItem, dropNear);
      this.isSmelting = false;
      this.tryStartSmelting();
    });
  }

  private spawnSmeltedDrop(itemKey: string, dropNear: Phaser.Math.Vector2 | null): void {
    const target = dropNear ?? new Phaser.Math.Vector2(this.x + 56, this.y + 26);
    const dropX = target.x;
    const dropY = target.y + 10;

    const item = this.itemsGroup.create(dropX, dropY, itemKey);
    LootSystem.styleWorldItem(item, dropY, {
      canBePickedUp: true,
      alpha: 1,
    });

    this.scene.tweens.add({
      targets: item,
      y: dropY - 10,
      duration: 220,
      yoyo: true,
      ease: "Sine.easeOut",
    });
  }
}
