import { GameState } from "../types/GameState";
import { InventorySlot } from "../items/Inventory";

export const GAME_EVENTS = {
  STORE_UPDATED: "store:updated",
  UI_USE_ITEM_FROM_SLOT: "ui:use-item-from-slot",
  UI_DROP_ITEM_FROM_SLOT: "ui:drop-item-from-slot",
  UI_SWAP_INVENTORY_SLOTS: "ui:swap-inventory-slots",
  UI_SPLIT_INVENTORY_SLOT: "ui:split-inventory-slot",
  UI_SMELT_ITEM_FROM_SLOT: "ui:smelt-item-from-slot",
  UI_OPEN_INVENTORY_FOR_FURNACE: "ui:open-inventory-for-furnace",
  UI_CLOSE_FURNACE: "ui:close-furnace",
  UI_REVIVE_PLAYER: "ui:revive-player",
  UI_INVENTORY_FULL: "ui:inventory-full",
  UI_APPLY_ITEM_EFFECT: "ui:apply-item-effect",
  GAME_STATE_CHANGED: "game:state-changed",
  FURNACE_SLOTS_UPDATED: "furnace:slots-updated",
} as const;

export type GameEventName = (typeof GAME_EVENTS)[keyof typeof GAME_EVENTS];

export interface UseItemFromSlotPayload {
  slotIndex: number;
}

export interface DropItemFromSlotPayload {
  slotIndex: number;
  itemKey: string;
}

export interface SwapInventorySlotsPayload {
  fromIndex: number;
  toIndex: number;
}

export interface SplitInventorySlotPayload {
  slotIndex: number;
  amount: number;
}

export interface SmeltItemFromSlotPayload {
  slotIndex: number;
  furnaceSlotIndex?: number;
}

export interface InventoryFullPayload {
  itemKey: string;
  remaining: number;
}

export interface ApplyItemEffectPayload {
  itemId: string;
  slotIndex: number;
}

export interface GameStateChangedPayload {
  state: GameState;
}

export interface FurnaceSlotsUpdatedPayload {
  slots: InventorySlot[];
}
