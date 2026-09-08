import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  newGame,
  serialize,
  deserialize,
  demand,
  demandForecast,
} from '../src/game.ts';
import {
  styleMarket,
  stylePreference,
  cellarStyleShares,
} from '../src/styleMarket.ts';
import { DEFAULT_DESIGN, tastingScore } from '../src/winemaking.ts';
import type { WineComponent } from '../src/winemaking.ts';
const fresh: WineComponent = {
  variety: 'chardonnay',
  year: 1,
  estateId: 1,
  ml: 150000,
  quality: 80,
  fermentation: 'steel',
  maturation: { version: 1, vessel: 'steel', weeks: 3, oakDominant: false },
};
const neutral: WineComponent = {
  ...fresh,
  maturation: { version: 1, vessel: 'neutral', weeks: 4, oakDominant: false },
};
const oak: WineComponent = {
  ...fresh,
  maturation: { version: 1, vessel: 'oak', weeks: 4, oakDominant: false },
};

test('each cellar route has a market window and combining all treatments is not universally best', () => {
  const s = newGame();
  const skin = { ...fresh, techniques: ['skin_contact'] as const };
  const treated: WineComponent = {
    ...oak,
    techniques: ['skin_contact', 'malolactic', 'lees_aging'],
  };
  for (const [week, part] of [
    [0, fresh],
    [12, neutral],
    [24, { ...skin, techniques: ['skin_contact'] }],
    [36, oak],
  ] as [number, WineComponent][]) {
    const state = { ...s, week };
    assert.ok(
      styleMarket([part], state).multiplier >
        styleMarket([treated], state).multiplier,
    );
    assert.equal(tastingScore([part]), tastingScore([fresh]));
  }
  for (const technique of ['malolactic', 'lees_aging'] as const)
    assert.ok(
      styleMarket([{ ...fresh, techniques: [technique] }], { ...s, week: 12 })
        .multiplier > styleMarket([fresh], { ...s, week: 12 }).multiplier,
    );
  for (const parts of [[fresh], [oak], [neutral], [treated]]) {
    const average =
      Array.from(
        { length: 48 },
        (_, week) => styleMarket(parts, { ...s, week }).multiplier,
      ).reduce((n, v) => n + v, 0) / 48;
    assert.ok(Math.abs(average - 1) < 1e-12);
  }
});

test('blend style follows treated volume and cannot be acquired with a trace addition', () => {
  const parts = [
    { ...fresh, ml: 99999 },
    { ...oak, ml: 1 },
  ];
  assert.ok(cellarStyleShares(parts).oak < 0.000011);
  assert.ok(cellarStyleShares(parts).fresh > 0.99998);
  assert.deepEqual(
    cellarStyleShares(parts),
    cellarStyleShares([...parts].reverse()),
  );
  assert.equal(stylePreference({ ...newGame(), week: 11 }).weeks, 1);
  assert.equal(
    stylePreference({ ...newGame(), week: 12 }).label,
    'Round, textured wines',
  );
});

test('style preferences affect real retail demand, stay in forecasts and survive reload without changing scores', () => {
  let s = newGame();
  s.week = 13;
  s.reserves = [
    { id: 1, name: 'Fresh', stored: 1, score: 80, components: [fresh] },
  ];
  s.nextId = 2;
  s = act(s, {
    type: 'bottle',
    id: 1,
    bottles: 100,
    line: { name: 'Fresh', design: DEFAULT_DESIGN },
  });
  s = act(s, { type: 'list', id: s.wines[0].id });
  const wine = s.wines[0],
    rounded = { ...wine, components: [{ ...neutral, ml: 75000 }] };
  assert.ok(demand(rounded, s) > demand(wine, s));
  for (let week = 13; week < 61; week++) {
    const state = { ...s, week, wines: [rounded] };
    const count = demand(rounded, state),
      range = demandForecast(rounded, state);
    assert.ok(count >= range.low && count <= range.high);
    assert.equal(demand(rounded, deserialize(serialize(state))), count);
  }
  assert.equal(s.wines[0].quality, 80);
});
