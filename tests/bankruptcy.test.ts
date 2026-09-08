import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, newGame, serialize, deserialize, upkeep } from '../src/game.ts';
test('bankruptcy persists, records unpaid upkeep, and cannot advance or spend', () => {
  const start = newGame();
  start.cash = 100;
  const end = act(start, { type: 'advance' });
  assert.equal(start.cash, 100);
  assert.deepEqual(end.bankruptcy, {
    week: 7,
    bill: upkeep(start),
    unpaid: upkeep(start) - 100,
  });
  assert.equal(end.cash, 0);
  const loaded = deserialize(serialize(end));
  for (const action of [
    { type: 'advance' },
    { type: 'harvest', id: 1 },
    { type: 'rename', name: 'Escape' },
  ] as const)
    assert.throws(() => act(loaded, action), /bankrupt/);
  assert.equal(newGame().bankruptcy, null);
});
test('exact upkeep is affordable and old saves start without a bankruptcy record', () => {
  const start = newGame();
  start.cash = upkeep(start);
  assert.equal(act(start, { type: 'advance' }).bankruptcy, null);
  const raw = JSON.parse(serialize(start));
  delete raw.state.bankruptcy;
  assert.equal(deserialize(JSON.stringify(raw)).bankruptcy, null);
});
