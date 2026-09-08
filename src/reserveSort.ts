import { volume } from './winemaking';
import type { Reserve } from './winemaking';

export const RESERVE_SORT_KEY = 'terroir-reserve-sort';
export const RESERVE_SORT_OPTIONS = {
  oldest: 'Oldest first',
  newest: 'Newest first',
  most: 'Most amount',
  least: 'Least amount',
} as const;
export type ReserveSort = keyof typeof RESERVE_SORT_OPTIONS;

export function loadReserveSort(): ReserveSort {
  try {
    const saved = localStorage.getItem(RESERVE_SORT_KEY);
    if (saved && Object.hasOwn(RESERVE_SORT_OPTIONS, saved))
      return saved as ReserveSort;
  } catch {
    // Sorting remains available when browser storage is blocked.
  }
  return 'oldest';
}

export function sortReserves(reserves: readonly Reserve[], sort: ReserveSort) {
  return [...reserves].sort((a, b) => {
    const newestFirst = b.stored - a.stored || b.id - a.id;
    switch (sort) {
      case 'oldest':
        return -newestFirst;
      case 'newest':
        return newestFirst;
      case 'most':
        return volume(b.components) - volume(a.components) || newestFirst;
      case 'least':
        return volume(a.components) - volume(b.components) || newestFirst;
    }
  });
}
