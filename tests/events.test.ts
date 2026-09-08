import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, newGame, serialize, deserialize } from '../src/game.ts';
test('urgent events persist past routine notes and acknowledgement retains history', () => {
  let s = act(newGame(), { type: 'harvest', id: 1 });
  for (let i = 0; i < 3; i++) s = act(s, { type: 'advance' });
  assert.ok(s.events.some((e) => e.text.includes('spoiled')));
  assert.ok(s.pendingEvents > 0);
  s = deserialize(serialize(s));
  const events = structuredClone(s.events);
  s = act(s, { type: 'acknowledgeEvents' });
  assert.equal(s.pendingEvents, 0);
  assert.deepEqual(s.events, events);
  assert.deepEqual(deserialize(serialize(s)), s);
});
test('research completion is recorded even when another event follows it', () => {
  let s = newGame();
  s.researchProject = {
    id: 'ampelography',
    remaining: 1,
    duration: 6,
    paused: false,
  };
  s = act(s, { type: 'advance' });
  assert.ok(s.events.some((e) => e.text.includes('completed')));
  assert.equal(s.pendingEvents, 1);
});
