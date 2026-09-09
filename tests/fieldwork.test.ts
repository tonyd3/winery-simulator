import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  newGame,
  serialize,
  deserialize,
  fieldWorkPlan,
  calendar,
  harvestYield,
  harvestQuality,
  estatePlots,
} from '../src/game.ts';

test('bulk picking matches individual harvests, preserving costs, yields, scores and parcel sources', () => {
  const s = newGame();
  s.plots[1].growth = 90;
  s.plots[0].expansions = s.plots[0].bearingExpansions = 2;
  const before = structuredClone(s);
  const plan = fieldWorkPlan(s, 'harvestAll');
  assert.equal(plan.plots.length, 2);
  assert.equal(plan.cost, 540);
  const picked = act(s, { type: 'harvestAll' });
  const individual = plan.plots.reduce(
    (state, p) => act(state, { type: 'harvest', id: p.id }),
    s,
  );
  assert.equal(picked.cash, s.cash - 540);
  assert.deepEqual(picked.grapes, individual.grapes);
  assert.deepEqual(picked.ledger, individual.ledger);
  assert.deepEqual(picked.finance, individual.finance);
  for (const p of plan.plots) {
    const lot = picked.grapes.find((g) => g.parcel?.id === p.id)!;
    assert.equal(lot.kg, harvestYield(s, p));
    assert.equal(lot.quality, harvestQuality(s, p));
    assert.equal(lot.estateId, s.activeEstate);
  }
  assert.deepEqual(deserialize(serialize(picked)), picked);
  assert.deepEqual(s, before);
  assert.throws(() => act(picked, { type: 'harvestAll' }), /No parcels/);
});

test('bulk tending skips unplanted, full-health, already-tended and harvested parcels', () => {
  let s = newGame();
  s.plots[0].health = 78;
  s.plots[1].health = 100;
  assert.equal(fieldWorkPlan(s, 'tendAll').plots.length, 1);
  const tended = act(s, { type: 'tendAll' });
  assert.equal(tended.cash, s.cash - 90);
  assert.equal(tended.plots[0].health, 94);
  assert.equal(tended.plots[0].tended, s.week);
  assert.deepEqual(tended.plots.slice(1), s.plots.slice(1));
  assert.throws(() => act(tended, { type: 'tendAll' }), /No vines/);
  s = act(s, { type: 'harvest', id: s.plots[0].id });
  assert.throws(() => act(s, { type: 'tend', id: s.plots[0].id }), /resting/);
  assert.throws(() => act(s, { type: 'tendAll' }), /No vines/);
  const winter = { ...newGame(), week: 10 };
  for (const type of ['harvestAll', 'tendAll'] as const)
    assert.throws(() => act(winter, { type }), /No/);
});

test('bulk work is atomic when total funds or fresh-lot space cannot cover every parcel', () => {
  const s = newGame();
  s.plots[1].growth = 90;
  for (const type of ['harvestAll', 'tendAll'] as const) {
    const poor = { ...s, cash: fieldWorkPlan(s, type).cost - 1 };
    const copy = structuredClone(poor);
    assert.throws(() => act(poor, { type }), /Need/);
    assert.deepEqual(poor, copy);
  }
  const sample = act(s, { type: 'harvest', id: 1 }).grapes[0];
  const full = {
    ...s,
    grapes: Array.from({ length: 575 }, (_, i) => ({ ...sample, id: i + 100 })),
    nextId: 700,
  };
  const copy = structuredClone(full);
  assert.throws(() => act(full, { type: 'harvestAll' }), /make room/);
  assert.deepEqual(full, copy);
});

test('bulk work spans districts of the selected estate and leaves the other estate untouched', () => {
  let s = { ...newGame(), cash: 1000000 };
  s = act(s, { type: 'expandEstate', id: 1 });
  const district = s.plots.find((p) => p.id === 7)!;
  district.owned = true;
  district.variety = 'merlot';
  district.growth = 100;
  s = act(s, { type: 'acquireEstate', region: 'napa', name: 'Other estate' });
  for (const p of estatePlots(s)) {
    if (p.owned) {
      p.variety = 'merlot';
      p.growth = 100;
    }
  }
  s = act(s, { type: 'visitEstate', id: 1 });
  const other = structuredClone(estatePlots(s, 2));
  const picked = act(s, { type: 'harvestAll' });
  assert.equal(picked.grapes.length, 2);
  assert.equal(
    picked.plots.find((p) => p.id === 7)!.harvestedYear,
    calendar(s.week).year,
  );
  assert.deepEqual(estatePlots(picked, 2), other);
  assert.deepEqual(deserialize(serialize(picked)), picked);
});
