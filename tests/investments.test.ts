import { BREEDING } from '../src/catalog.ts';
import { learn, allGrapes } from './helpers.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  newGame,
  serialize,
  deserialize,
  upkeep,
  retailPrice,
  fairPrice,
  wholesalePrice,
  demand,
  demandForecast,
  harvestQuality,
  weeklyKnowledge,
  stateSchema,
} from '../src/game.ts';
import type { GameState } from '../src/game.ts';
import {
  UPGRADES,
  UPGRADE_IDS,
  upgradeActive,
  upgradeBlocked,
  hospitalityForecast,
  annualHospitalityForecast,
  investmentUpkeep,
  investmentDemand,
  studyWeeks,
} from '../src/investments.ts';
import type { Upgrade } from '../src/investments.ts';
import { bottleBatch } from './helpers.ts';

function funded() {
  const s = allGrapes(newGame());
  for (const u of Object.values(UPGRADES)) if (u.research) learn(s, u.research);
  s.cash = 2000000;
  s.knowledge = 1000;
  return s;
}
const buy = (s: GameState, id: Upgrade) =>
  act(s, { type: 'upgrade', upgrade: id });
const pause = (s: GameState, id: Upgrade) =>
  act(s, { type: 'operateUpgrade', upgrade: id, active: false });
const resume = (s: GameState, id: Upgrade) =>
  act(s, { type: 'operateUpgrade', upgrade: id, active: true });
function tick(s: GameState, n = 1) {
  for (let i = 0; i < n; i++) s = act(s, { type: 'advance' });
  return s;
}
function stocked() {
  let s = act(funded(), { type: 'harvest', id: 1 });
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: false });
  s = tick(s, 2);
  s.batches[0].quality = 86;
  s = bottleBatch(s, s.batches[0].id);
  s.wines[0].quality = 86;
  s.reputation = 60;
  return act(s, { type: 'list', id: s.wines[0].id });
}
function hospitality(s = funded()) {
  for (const id of ['visitorCenter', 'tastingRoom', 'sommelier'] as const)
    s = buy(s, id);
  return s;
}
const valid = (s: GameState) => assert.deepEqual(deserialize(serialize(s)), s);

test('14 substantial investments charge once, enforce prerequisites and retain equipment separately', () => {
  let s = funded();
  const equipment = structuredClone(s.cellar);
  let capital = 0,
    operating = 0;
  const ids = UPGRADE_IDS.filter((id) => id !== 'cellar');
  assert.equal(ids.length, 14);
  for (const id of ids) {
    assert.ok(UPGRADES[id].cost >= 6000);
    assert.ok(UPGRADES[id].upkeep >= 180);
    const before = s,
      copy = structuredClone(s);
    capital += UPGRADES[id].cost;
    operating += UPGRADES[id].upkeep;
    s = buy(s, id);
    assert.deepEqual(before, copy);
    assert.equal(s.cash, 2000000 - capital);
    assert.equal(investmentUpkeep(s), operating);
    assert.equal(upkeep(s), 160 + operating);
    assert.equal(s.week, 6);
    assert.throws(() => buy(s, id), /already/);
    valid(s);
  }
  assert.deepEqual(s.cellar, equipment);
  assert.throws(() => buy(s, 'cellar'), /separately/);
});

test('unaffordable and unmet prerequisite purchases fail atomically', () => {
  const s = funded();
  s.cash = 12500;
  const before = structuredClone(s);
  assert.match(upgradeBlocked(s, 'sommelier')!, /Tasting room/);
  assert.throws(() => buy(s, 'sommelier'), /Requires/);
  assert.throws(() => buy(s, 'visitorCenter'), /more/);
  assert.deepEqual(s, before);
  const paused = pause(buy(funded(), 'visitorCenter'), 'visitorCenter');
  assert.throws(() => buy(paused, 'tastingRoom'), /operating/);
});

test('hospitality is seasonal, reputation-sensitive, capacity-limited and can lose money', () => {
  let s = hospitality();
  s.reputation = 12;
  s.week = 10;
  const quiet = hospitalityForecast(s);
  assert.ok(quiet.net < 0);
  s.reputation = 100;
  s.week = 7;
  const busy = hospitalityForecast(s);
  assert.equal(busy.visitors, busy.capacity);
  assert.ok(busy.net > 0);
  assert.ok(busy.revenue > quiet.revenue);
  s = buy(buy(s, 'restaurant'), 'guesthouse');
  const full = hospitalityForecast(s);
  assert.equal(full.dining, 2000);
  assert.equal(full.rooms, 24);
  assert.equal(full.revenue, busy.revenue + 2000 + 24 * 220);
  assert.equal(s.stats.sold, 0);
});

test('weekly income and sales reconcile to the starting forecast across a season boundary', () => {
  let s = hospitality(stocked());
  s.week = 9;
  const w = s.wines[0];
  w.price = retailPrice(w, s);
  const guests = hospitalityForecast(s),
    sold = demand(w, s),
    bill = upkeep(s);
  const range = demandForecast(w, s);
  assert.ok(sold >= range.low && sold <= range.high);
  const n = tick(s);
  assert.equal(n.cash, s.cash + guests.revenue + sold * w.price - bill);
  assert.equal(n.stats.sold, s.stats.sold + sold);
  assert.equal(
    n.stats.revenue,
    s.stats.revenue + guests.revenue + sold * w.price,
  );
  assert.equal(
    n.ledger.find((x) => x.label === 'Hospitality income')!.amount,
    guests.revenue,
  );
  assert.equal(hospitalityForecast(n).season, 'Winter');
  valid(n);
});

test('suspension stops benefits, retains 25 percent costs, and cascades without automatic reopening', () => {
  let s = hospitality();
  const cash = s.cash;
  s = pause(s, 'visitorCenter');
  assert.equal(s.cash, cash);
  for (const id of ['visitorCenter', 'tastingRoom', 'sommelier'] as const) {
    assert.ok(s.suspendedUpgrades.includes(id));
    assert.equal(upgradeActive(s, id), false);
  }
  assert.equal(investmentUpkeep(s), 900);
  assert.equal(hospitalityForecast(s).revenue, 0);
  assert.throws(() => resume(s, 'sommelier'), /Resume Tasting room/);
  s = resume(deserialize(serialize(s)), 'visitorCenter');
  assert.equal(upgradeActive(s, 'tastingRoom'), false);
  s = resume(resume(s, 'tastingRoom'), 'sommelier');
  assert.equal(investmentUpkeep(s), 3600);
  assert.equal(s.cash, cash);
  valid(s);
});

test('insolvency ends the estate after income and blocks every further action', () => {
  let s = hospitality();
  s.cash = 0;
  s.reputation = 0;
  s.week = 10;
  s = tick(s);
  assert.ok(s.bankruptcy);
  assert.equal(s.cash, 0);
  assert.ok(s.bankruptcy.unpaid > 0);
  assert.throws(() => resume(s, 'visitorCenter'), /bankrupt/);
  assert.throws(() => tick(s), /bankrupt/);
  valid(s);
});

test('sommeliers change suitable wine prices and demand without changing scores or chosen shelf prices', () => {
  const base = stocked(),
    s = hospitality(base),
    wine = s.wines[0];
  assert.equal(
    retailPrice(wine, s),
    Math.round(fairPrice(wine, s.reputation) * 1.08),
  );
  assert.ok(demand(wine, s) > demand(wine, base));
  assert.equal(wine.quality, base.wines[0].quality);
  assert.equal(wine.price, base.wines[0].price);
  assert.equal(
    retailPrice({ ...wine, quality: 79 }, s),
    fairPrice({ ...wine, quality: 79 }, s.reputation),
  );
  const closed = pause(s, 'sommelier');
  assert.equal(retailPrice(wine, closed), fairPrice(wine, s.reputation));
  assert.equal(
    retailPrice({ ...wine, quality: 100 }, { ...s, reputation: 100 }),
    Math.min(
      1000,
      Math.round(fairPrice({ ...wine, quality: 100 }, 100) * 1.08),
    ),
  );
});

test('wine club rewards mature releases; export staff need premium wines and affect actual wholesale', () => {
  let s = buy(buy(buy(stocked(), 'tasting'), 'wineClub'), 'exportOffice');
  const wine = s.wines[0];
  assert.equal(investmentDemand(wine, s), 1.45);
  s.week = wine.bottled + 12;
  assert.equal(investmentDemand(wine, s), 1.35 * 1.45);
  assert.equal(investmentDemand({ ...wine, quality: 84 }, s), 1.35);
  const offer = wholesalePrice(wine, s.reputation, s);
  assert.ok(offer > wholesalePrice(wine, s.reputation));
  const n = act(s, { type: 'wholesale', id: wine.id });
  assert.equal(n.cash, s.cash + wine.bottles * offer);
  valid(n);
});

test('sorting and temperature control affect only new production and stop when suspended', () => {
  const base = funded();
  let s = buy(buy(base, 'sorting'), 'lab');
  assert.equal(
    harvestQuality(s, s.plots[0]),
    harvestQuality(base, base.plots[0]) + 2,
  );
  s = act(s, { type: 'harvest', id: 1 });
  const q = s.grapes[0].quality;
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: false });
  assert.equal(s.batches[0].quality, q + 3);
  const closed = pause(pause(s, 'sorting'), 'lab');
  assert.deepEqual(closed.batches, s.batches);
  assert.equal(
    harvestQuality(closed, closed.plots[1]),
    harvestQuality(base, base.plots[1]),
  );
  valid(closed);
});

test('viticulture staff and irrigation help growth, and staff reduce health loss on all estates', () => {
  let base = funded();
  base = act(base, { type: 'acquireEstate', region: 'mosel', name: 'River' });
  base = act(base, { type: 'plant', id: 25, variety: 'riesling' });
  base.plots.forEach((p) => {
    if (p.variety) {
      p.growth = 20;
      p.health = 70;
    }
  });
  const team = buy(buy(base, 'viticulturist'), 'irrigation');
  const a = tick(base),
    b = tick(team);
  for (const p of a.plots.filter((p) => p.variety)) {
    const improved = b.plots.find((x) => x.id === p.id)!;
    assert.equal(improved.growth, p.growth + 5);
    assert.ok(improved.health > p.health);
  }
  valid(b);
});

test('refrigeration extends freshness to five weeks and suspension restores the original limit', () => {
  let s = buy(funded(), 'coldStorage');
  s = act(s, { type: 'harvest', id: 1 });
  const n = tick(s, 3);
  assert.equal(n.grapes.length, 1);
  assert.equal(tick(n).grapes.length, 1);
  assert.equal(tick(n, 2).grapes.length, 0);
  assert.equal(tick(pause(n, 'coldStorage')).grapes.length, 0);
  valid(n);
});

test('research facilities accelerate studies and breeding without overshooting completion or rerolling results', () => {
  let s = buy(buy(funded(), 'lab'), 'researchLab');
  assert.equal(weeklyKnowledge(s), 18);
  s = act(s, { type: 'research', id: 'field_notebooks' });
  assert.equal(studyWeeks(s, s.researchProject!.remaining), 8);
  assert.ok(!tick(s, 7).research.includes('field_notebooks'));
  s = tick(s, 8);
  assert.ok(s.research.includes('field_notebooks'));
  assert.equal(weeklyKnowledge(s), 22);
  s = act(s, {
    type: 'breed',
    parents: ['merlot', 'cabernet'],
    trait: 'climate',
    name: 'Lab trial',
  });
  const result = structuredClone(s.breedingProject!.result);
  const slow = pause(s, 'researchLab');
  assert.equal(studyWeeks(s, 24), 12);
  assert.equal(studyWeeks(slow, 24), 24);
  assert.equal(tick(slow, 2).breedingProject!.remaining, BREEDING.weeks - 2);
  const ready = tick(deserialize(serialize(s)), BREEDING.weeks / 2);
  assert.equal(ready.breedingProject, null);
  assert.deepEqual({ ...ready.hybrids[0], created: result.created }, result);
  valid(ready);
});

test('old saves retain paid assets and receive new maintenance with resumable suspension state', () => {
  const s = stocked();
  s.upgrades = ['tasting', 'lab', 'cellar'];
  const { suspendedUpgrades, ...old } = s;
  const loaded = deserialize(
    JSON.stringify({ game: 'terroir', savedAt: 'previous', state: old }),
  );
  assert.deepEqual(loaded, s);
  assert.equal(investmentUpkeep(loaded), 845);
  assert.deepEqual(loaded.wines, s.wines);
  assert.equal(loaded.cash, s.cash);
  valid(pause(loaded, 'lab'));
});

test('invalid imports reject duplicate or unowned suspensions and missing facility prerequisites', () => {
  for (const change of [
    (s: GameState) => {
      s.suspendedUpgrades = ['lab'];
    },
    (s: GameState) => {
      s.upgrades = ['lab'];
      s.suspendedUpgrades = ['lab', 'lab'];
    },
    (s: GameState) => {
      s.upgrades = ['sommelier'];
    },
    (s: GameState) => {
      s.upgrades = ['cellar'];
      s.suspendedUpgrades = ['cellar'];
    },
  ]) {
    const s = newGame();
    change(s);
    assert.equal(stateSchema.safeParse(s).success, false);
    assert.throws(() => deserialize(serialize(s)), /compatible/);
  }
});

test('entry hospitality can cover full-capacity upkeep while winter still carries risk', () => {
  for (const id of ['tasting', 'visitorCenter'] as const) {
    const s = buy(funded(), id);
    s.reputation = 100;
    s.week = 7;
    const full = hospitalityForecast(s);
    assert.equal(full.visitors, full.capacity);
    assert.ok(full.net > 0);
    s.reputation = 12;
    s.week = 10;
    assert.ok(hospitalityForecast(s).net < 0);
  }
});
test('annual hospitality estimates reconcile with twelve fixed-Prestige weekly forecasts', () => {
  const s = buy(buy(funded(), 'tasting'), 'visitorCenter');
  s.reputation = 24;
  const annual = annualHospitalityForecast(s);
  const expected = Array.from({ length: 12 }, (_, i) =>
    hospitalityForecast({ ...s, week: s.week + i }),
  );
  assert.equal(
    annual.net,
    expected.reduce((n, w) => n + w.net, 0),
  );
  assert.equal(annual.upkeep, 12 * investmentUpkeep(s));
  assert.deepEqual(annualHospitalityForecast({ ...s, week: 10 }), annual);
});
