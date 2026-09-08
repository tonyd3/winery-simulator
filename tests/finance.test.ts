import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  newGame,
  deserialize,
  serialize,
  wholesalePrice,
} from '../src/game.ts';
import {
  startFinance,
  releaseResult,
  releaseFacts,
  wineLineResult,
  archiveAccounts,
} from '../src/finance.ts';
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

test('bottle facts use actual proceeds and sold costs instead of shelf price or unsold stock', () => {
  const wine = bottled().wines[0];
  wine.bottles = 75;
  wine.price = 999;
  wine.accounts = {
    costCents: 10000,
    revenueCents: 50000,
    promotionCents: 5000,
    sold: 25,
  };
  const facts = releaseFacts(wine);
  assert.equal(facts.profitCents, 42500);
  assert.equal(facts.averagePriceCents, 2000);
  assert.equal(facts.profitPerBottleCents, 1700);
  assert.equal(facts.soldPercent, 25);
  assert.equal(facts.inventoryCents, 7500);
});

test('bottle facts distinguish no sales, promotion losses, and missing historical records', () => {
  const wine = bottled().wines[0];
  assert.equal(releaseFacts(wine).profitCents, 0);
  assert.equal(releaseFacts(wine).averagePriceCents, null);
  assert.equal(releaseFacts(wine).profitPerBottleCents, null);
  assert.equal(releaseFacts(wine).soldPercent, 0);
  wine.accounts!.promotionCents = 24000;
  assert.equal(releaseFacts(wine).profitCents, -24000);
  wine.bottles = 99;
  wine.accounts!.sold = 1;
  wine.accounts!.revenueCents = 100;
  assert.ok(releaseFacts(wine).profitPerBottleCents! < 0);
  wine.accounts!.costCents = null;
  assert.equal(releaseFacts(wine).profitCents, null);
  assert.equal(releaseFacts(wine).profitPerBottleCents, null);
  assert.equal(releaseFacts(wine).averagePriceCents, 100);
  wine.accounts!.costCents = 10000;
  wine.bottles = 50; // Production survived, but the earlier sales accounts did not.
  assert.equal(releaseFacts(wine).profitCents, null);
  assert.equal(releaseFacts(wine).averagePriceCents, 100);
  delete wine.accounts;
  wine.produced = null;
  assert.equal(releaseFacts(wine).soldPercent, null);
  assert.equal(releaseFacts(wine).profitCents, null);
});

test('wine-line profit includes every release and remains unchanged when sold-out details are archived', () => {
  const s = bottled();
  const sold = act(s, { type: 'wholesale', id: s.wines[0].id }).wines[0];
  assert.equal(releaseFacts(sold).soldPercent, 100);
  const releases = Array.from({ length: 8 }, (_, i) => ({
    ...structuredClone(sold),
    id: i + 100,
    release: i + 1,
    quality: 70 + i,
  }));
  const result = wineLineResult(releases);
  assert.equal(result.profitCents, releaseResult(sold).marginCents! * 8);
  assert.equal(result.best, 77);
  const archive = {
    releases: 1,
    lastRelease: 8,
    sold: 100,
    produced: 100,
    complete: true,
    best: 77,
    accounts: archiveAccounts(releases[7]),
  };
  assert.deepEqual(wineLineResult(releases.slice(0, 7), archive), result);
  assert.equal(
    wineLineResult([], archive).profitCents,
    releaseResult(sold).marginCents,
  );
  assert.deepEqual(wineLineResult([]), { profitCents: 0, best: null });
});

test('missing release or archived accounts never become a fabricated full line profit', () => {
  const wine = bottled().wines[0];
  const archive = {
    releases: 2,
    lastRelease: 2,
    sold: 200,
    produced: 200,
    complete: true,
    best: 93,
  };
  assert.equal(wineLineResult([wine], archive).profitCents, null);
  assert.equal(wineLineResult([wine], archive).best, 93);
  assert.equal(
    wineLineResult([wine], {
      ...archive,
      accounts: {
        revenueCents: 10000,
        costCents: 0,
        promotionCents: 0,
        complete: false,
      },
    }).profitCents,
    null,
  );
  const legacy = structuredClone(wine);
  delete legacy.accounts;
  assert.equal(wineLineResult([wine, legacy]).profitCents, null);
});

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

test('partial grape processing allocates harvest cost once across successive batches', () => {
  let s = act(newGame(), { type: 'harvest', id: 1 });
  s.grapes[0].kg = 600;
  const id = s.grapes[0].id;
  const harvestCost = s.grapes[0].directCostCents!;
  s = act(s, { type: 'ferment', id, oak: false });
  assert.equal(s.grapes[0].kg, 172);
  assert.equal(
    s.batches[0].directCostCents! + s.grapes[0].directCostCents!,
    harvestCost + 28000,
  );
  s = act(act(s, { type: 'advance' }), { type: 'advance' });
  s = act(s, { type: 'reserve', id: s.batches[0].id });
  s = act(s, { type: 'ferment', id, oak: false });
  assert.equal(s.grapes.length, 0);
  assert.equal(
    productionCost(s.reserves[0].components)! + s.batches[0].directCostCents!,
    harvestCost + 28000 + 14000,
  );
  assert.deepEqual(deserialize(serialize(s)), s);
});
