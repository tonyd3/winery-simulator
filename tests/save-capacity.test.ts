import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGame, deserialize, serialize } from '../src/game.ts';

function nearLimit(compact: boolean) {
  const raw = JSON.parse(serialize(newGame()));
  delete raw.state.finance;
  delete raw.state.kitCostCents;
  delete raw.state.stats.qualitySold;
  delete raw.state.stats.qualityPoints;
  raw.state.log[0].text = '';
  const encode = () => JSON.stringify(raw, null, compact ? undefined : 2);
  const target = 1_999_950;
  while (encode().length < target)
    raw.state.reserves.push({
      id: raw.state.nextId++,
      name: 'Capacity fixture',
      stored: raw.state.week,
      score: null,
      components: Array.from({ length: 500 }, () => ({
        variety: 'merlot',
        year: 1,
        ml: 1500,
        quality: 70,
      })),
    });
  while (encode().length > target) raw.state.reserves.at(-1).components.pop();
  raw.state.log[0].text = 'x'.repeat(target - encode().length);
  return encode();
}

test('near-limit legacy saves remain loadable after migration and autosave', () => {
  const original = nearLimit(false);
  assert.equal(original.length, 1_999_950);
  const migrated = deserialize(original);
  const saved = serialize(migrated);
  assert.ok(saved.length <= 2_000_000);
  assert.deepEqual(deserialize(saved), migrated);
});

test('an oversized normalized save is rejected before it can replace existing storage', () => {
  const original = nearLimit(true);
  assert.equal(original.length, 1_999_950);
  assert.throws(() => deserialize(original), /cannot fit after migration/);
});
