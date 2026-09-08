import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sortReserves } from '../src/reserveSort.ts';
import type { Reserve } from '../src/winemaking.ts';

const lot = (id: number, stored: number, ...amounts: number[]): Reserve => ({
  id,
  stored,
  name: `Lot ${id}`,
  score: null,
  components: amounts.map((ml) => ({
    variety: 'merlot',
    year: 1,
    quality: 80,
    ml,
  })),
});
const ids = (lots: Reserve[]) => lots.map((r) => r.id);

test('reserve amount sorting totals blends, retains small remnants, and breaks ties by recency', () => {
  const reserves = [
    lot(1, 10, 500),
    lot(2, 20, 250),
    lot(3, 30, 240000),
    lot(4, 40, 100000, 150000),
    lot(5, 40, 250000),
  ];
  const original = structuredClone(reserves);
  assert.deepEqual(ids(sortReserves(reserves, 'most')), [5, 4, 3, 1, 2]);
  assert.deepEqual(ids(sortReserves(reserves, 'least')), [2, 1, 3, 5, 4]);
  assert.deepEqual(reserves, original);
});

test('reserve recency uses storage week, then lot ID for same-week additions', () => {
  const reserves = [lot(4, 30, 1000), lot(2, 10, 1000), lot(3, 30, 1000)];
  assert.deepEqual(ids(sortReserves(reserves, 'newest')), [4, 3, 2]);
  assert.deepEqual(ids(sortReserves(reserves, 'oldest')), [2, 3, 4]);
});

test('amount sorting follows current inventory after a partial bottling', () => {
  const reserves = [lot(1, 10, 1500), lot(2, 20, 1000)];
  assert.deepEqual(ids(sortReserves(reserves, 'most')), [1, 2]);
  reserves[0].components[0].ml -= 750;
  assert.deepEqual(ids(sortReserves(reserves, 'most')), [2, 1]);
  assert.deepEqual(sortReserves([], 'newest'), []);
});
