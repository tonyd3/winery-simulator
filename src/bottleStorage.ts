import { z } from 'zod';

export const BOTTLE_STORAGE = {
  warehouse: {
    base: 600,
    step: 600,
    cost: 2400,
    costStep: 1200,
    maxExpansions: 199,
  },
  shelves: {
    base: 120,
    step: 60,
    cost: 900,
    costStep: 450,
    maxExpansions: 198,
  },
  defaultListing: 60,
};
export type StorageKind = 'warehouse' | 'shelves';
export const bottleStorageSchema = z
  .object({
    warehouse: z
      .number()
      .int()
      .min(0)
      .max(BOTTLE_STORAGE.warehouse.maxExpansions),
    shelves: z.number().int().min(0).max(BOTTLE_STORAGE.shelves.maxExpansions),
  })
  .strict();
type Storage = z.infer<typeof bottleStorageSchema>;
type StoredWine = {
  id: number;
  bottles: number;
  privateBottles?: number;
  listed: boolean;
  shelfSpace?: number | null;
};
type StockState = { bottleStorage?: Storage; wines: StoredWine[] };

export function storageCapacity(
  s: Pick<StockState, 'bottleStorage'>,
  kind: StorageKind,
) {
  const terms = BOTTLE_STORAGE[kind];
  return terms.base + (s.bottleStorage?.[kind] ?? 0) * terms.step;
}
export function storageExpansionCost(
  s: Pick<StockState, 'bottleStorage'>,
  kind: StorageKind,
) {
  const terms = BOTTLE_STORAGE[kind];
  return terms.cost + (s.bottleStorage?.[kind] ?? 0) * terms.costStep;
}
export const bottlesStored = (s: Pick<StockState, 'wines'>) =>
  s.wines.reduce((sum, wine) => sum + wine.bottles, 0);
export const warehouseRoom = (s: StockState) =>
  Math.max(0, storageCapacity(s, 'warehouse') - bottlesStored(s));
// Private bottles remain part of total unsold stock and warehouse capacity.
export const privateStock = (wine: Pick<StoredWine, 'privateBottles'>) =>
  wine.privateBottles ?? 0;
export const saleStock = (
  wine: Pick<StoredWine, 'bottles' | 'privateBottles'>,
) => Math.max(0, wine.bottles - privateStock(wine));
// Shelf stock is a subset of total stock, replenished for each weekly sale.
export const shelfStock = (wine: StoredWine) =>
  wine.listed ? Math.min(saleStock(wine), wine.shelfSpace ?? 0) : 0;
export const shelvesUsed = (s: Pick<StockState, 'wines'>) =>
  s.wines.reduce((sum, wine) => sum + shelfStock(wine), 0);
export const shelfRoom = (s: StockState) =>
  Math.max(0, storageCapacity(s, 'shelves') - shelvesUsed(s));
export const suggestedShelfSpace = (s: StockState, wine: StoredWine) =>
  Math.min(saleStock(wine), shelfRoom(s), BOTTLE_STORAGE.defaultListing);

// Missing fields identify old saves. Keep every bottle and listing; share the
// remaining shelves among older listings, without changing explicit allocations.
export function initializeBottleStorage<T extends StockState>(s: T) {
  s.bottleStorage ??= { warehouse: 0, shelves: 0 };
  let remaining = shelfRoom(s);
  const pending = s.wines
    .filter((w) => w.shelfSpace == null && w.listed && saleStock(w) > 0)
    .sort((a, b) => saleStock(a) - saleStock(b) || a.id - b.id);
  pending.forEach((wine, i) => {
    wine.shelfSpace = Math.min(
      saleStock(wine),
      Math.ceil(remaining / (pending.length - i)),
    );
    remaining -= wine.shelfSpace;
  });
  for (const wine of s.wines) wine.shelfSpace ??= 0;
  return s;
}
