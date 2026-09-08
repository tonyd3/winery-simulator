import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  newGame,
  deserialize,
  serialize,
  wholesalePrice,
} from '../src/game.ts';
import { startFinance, releaseResult } from '../src/finance.ts';
import {
  DEFAULT_DESIGN,
  productionCost,
  take,
  combine,
  volume,
} from '../src/winemaking.ts';
import type { Reserve } from '../src/winemaking.ts';

function stored() {
  let s = act(newGame(), { type: 'harvest', id: 1 });
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: false });
  s = act(act(s, { type: 'advance' }), { type: 'advance' });
  return act(s, { type: 'reserve', id: s.batches[0].id });
}
function bottled() {
  const s = stored();
  return act(s, {
    type: 'bottle',
    id: s.reserves[0].id,
    bottles: 100,
    line: { name: 'Accounts', design: DEFAULT_DESIGN },
  });
}

test('partial releases conserve harvest, fermentation, tasting and actual kit costs', () => {
  let s = stored();
  const liquidCost = productionCost(s.reserves[0].components)!;
  assert.equal(liquidCost, 46000);
  s = act(s, { type: 'supplies' });
  s = act(s, { type: 'advance' });
  assert.equal(s.kitCostCents, 48000);
  s = act(s, { type: 'tasteReserve', id: s.reserves[0].id });
  const id = s.reserves[0].id;
  for (const bottles of [101, 103, 120])
    s = act(s, {
      type: 'bottle',
      id,
      bottles,
      line: s.lines.length
        ? { id: s.lines[0].id }
        : { name: 'Cost conservation', design: DEFAULT_DESIGN },
    });
  assert.equal(s.reserves.length, 0);
  assert.equal(
    s.wines.reduce((n, w) => n + w.accounts!.costCents!, 0) + s.kitCostCents!,
    46000 + 6000 + 48000,
  );
  assert.deepEqual(deserialize(serialize(s)), s);
});

test('repeated partial blending preserves every cent and propagates missing legacy costs', () => {
  const r: Reserve = {
    id: 1,
    name: 'Mixed',
    stored: 1,
    score: null,
    components: [
      {
        variety: 'merlot',
        year: 1,
        quality: 70,
        ml: 4001,
        directCostCents: 101,
      },
      {
        variety: 'cabernet',
        year: 1,
        quality: 72,
        ml: 5002,
        directCostCents: 207,
      },
    ],
  };
  const parts = [];
  for (const ml of [750, 1001, 13, 7239]) parts.push(...take(r, ml));
  assert.equal(volume(parts), 9003);
  assert.equal(productionCost(parts), 308);
  assert.equal(productionCost(combine(parts)), 308);
  assert.equal(r.components.length, 0);
  delete parts[0].directCostCents;
  assert.equal(productionCost(combine(parts)), null);
});

test('retail and wholesale margins allocate sold cost and charge promotion only once', () => {
  let s = bottled();
  const id = s.wines[0].id;
  const originalCost = s.wines[0].accounts!.costCents!;
  s = act(s, { type: 'list', id });
  s = act(s, { type: 'marketWine', id });
  s = act(s, { type: 'advance' });
  const partial = releaseResult(s.wines[0]);
  assert.ok(s.wines[0].bottles > 0 && s.wines[0].bottles < 100);
  assert.equal(partial.costCents! + partial.inventoryCents!, originalCost);
  assert.equal(partial.promotionCents, 24000);
  const extra =
    s.wines[0].bottles * wholesalePrice(s.wines[0], s.reputation, s) * 100;
  s = act(s, { type: 'wholesale', id });
  const result = releaseResult(s.wines[0]);
  assert.equal(result.revenueCents, partial.revenueCents + extra);
  assert.equal(result.costCents, originalCost);
  assert.equal(result.inventoryCents, 0);
  assert.equal(result.marginCents, result.revenueCents - originalCost - 24000);
  assert.deepEqual(deserialize(serialize(s)), s);
});

test('seasonal totals survive ledger truncation and separate investments from operations', () => {
  let s = newGame();
  s.cash = 100000;
  s.finance = startFinance(s.week, s.cash);
  s = act(s, { type: 'buyTank', count: 1 });
  const investment = s.finance!.totals.investment;
  assert.ok(investment > 0);
  s = act(s, { type: 'harvest', id: 1 });
  s = act(s, { type: 'sellGrapes', id: s.grapes[0].id });
  for (let i = 0; i < 130; i++) s = act(s, { type: 'advance' });
  assert.equal(s.bankruptcy, null);
  assert.equal(s.ledger.length, 80);
  assert.equal(s.finance!.seasons.length, 40);
  const t = s.finance!.totals;
  assert.equal(t.investment, investment);
  assert.equal(s.cash, 100000 + (t.income - t.operating - t.investment) / 100);
  assert.ok(
    t.operating > s.finance!.seasons.reduce((n, r) => n + r.operating, 0),
  );
  assert.deepEqual(deserialize(serialize(s)), s);
});

test('legacy release and inventory costs remain unrecorded while future cash is tracked', () => {
  const raw = JSON.parse(serialize(bottled()));
  delete raw.state.finance;
  delete raw.state.kitCostCents;
  delete raw.state.wines[0].accounts;
  const s = deserialize(JSON.stringify(raw));
  assert.equal(s.finance, null);
  assert.equal(s.kitCostCents, null);
  const next = act(s, { type: 'wholesale', id: s.wines[0].id });
  assert.equal(releaseResult(next.wines[0]).marginCents, null);
  assert.ok(next.finance!.totals.income > 0);
  assert.equal(next.finance!.openingCash, s.cash);
});

test('compaction retains sold-out release accounts and keeps new bottling possible', () => {
  let s = bottled();
  const id = s.wines[0].id;
  s = act(s, { type: 'wholesale', id });
  const sold = s.wines[0],
    result = releaseResult(sold);
  s.wines = Array.from({ length: 1000 }, (_, i) => ({
    ...structuredClone(sold),
    id: 100 + i,
    release: i + 1,
  }));
  s.nextId = 1200;
  s = act(s, {
    type: 'bottle',
    id: s.reserves[0].id,
    bottles: 1,
    line: { id: s.lines[0].id },
  });
  const archive = s.lines[0].archive!;
  assert.equal(archive.releases, 251);
  assert.equal(archive.accounts!.revenueCents, result.revenueCents * 251);
  assert.equal(archive.accounts!.costCents, result.costCents! * 251);
  assert.equal(archive.accounts!.complete, true);
  assert.equal(s.wines.at(-1)!.release, 1001);
  assert.deepEqual(deserialize(serialize(s)), s);
});

test('using all legacy kits allows new purchases to establish a known cost basis', () => {
  let s = stored();
  s.kits = 100;
  s.kitCostCents = null;
  const id = s.reserves[0].id;
  s = act(s, {
    type: 'bottle',
    id,
    bottles: 100,
    line: { name: 'Legacy kits', design: DEFAULT_DESIGN },
  });
  assert.equal(s.wines[0].accounts!.costCents, null);
  assert.equal(s.kits, 0);
  assert.equal(s.kitCostCents, 0);
  s = act(act(s, { type: 'supplies' }), { type: 'advance' });
  s = act(s, { type: 'bottle', id, bottles: 100, line: { id: s.lines[0].id } });
  assert.ok(s.wines[1].accounts!.costCents! > 8000);
  assert.equal(s.kitCostCents, 40000);
  assert.deepEqual(deserialize(serialize(s)), s);
});
