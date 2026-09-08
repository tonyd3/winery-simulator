import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGame, act, harvestAdvice } from '../src/game.ts';
test('harvest advice never promises more ripeness at 100 percent or beyond the final harvest week', () => {
  const s = newGame();
  const p = s.plots[0];
  p.growth = 100;
  assert.match(harvestAdvice(p, 8), /Waiting cannot add ripeness/);
  assert.match(harvestAdvice(p, 9), /Last chance/);
  assert.match(harvestAdvice(p, 10), /resting/);
  p.harvestedYear = 1;
  assert.match(harvestAdvice(p, 9), /well-earned rest/);
});
test('arrival at the final harvest week creates a persistent advance warning', () => {
  const s = newGame();
  s.week = 8;
  const next = act(s, { type: 'advance' });
  assert.ok(next.events.some((e) => e.text.includes('Last harvest week')));
});
