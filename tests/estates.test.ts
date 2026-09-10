import { learn } from './helpers.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  newGame,
  serialize,
  deserialize,
  stateSchema,
  getEstate,
  getLand,
  estateArea,
  estatePlots,
  tankCount,
  occupiedTankCount,
  upkeep,
  harvestQuality,
  plantingCost,
  availableVarieties,
  REGION_IDS,
} from '../src/game.ts';
import { acquisitionCost, districtCost, plotId } from '../src/estates.ts';
import {
  DEFAULT_DESIGN,
  combine,
  blendProfile,
  volume,
} from '../src/winemaking.ts';
import type { GameState, RegionId } from '../src/game.ts';

function funded() {
  const s = newGame();
  s.cash = 2000000;
  return s;
}
const acquire = (s: GameState, region: RegionId = 'mosel') =>
  act(s, { type: 'acquireEstate', region, name: `${region} Estate` });
const valid = (s: GameState) => assert.deepEqual(deserialize(serialize(s)), s);

test('starting funds support the founding vineyard but cannot buy any neighboring parcel', () => {
  for (const region of REGION_IDS) {
    const s = newGame(region),
      before = structuredClone(s);
    assert.equal(s.plots.filter((p) => p.owned).length, 3);
    for (const id of [4, 5, 6]) {
      assert.ok(getLand(s, id).cost > s.cash);
      assert.throws(() => act(s, { type: 'buyPlot', id }), /more/);
      assert.deepEqual(s, before);
    }
    const harvested = act(s, { type: 'harvest', id: 1 });
    const planted = act(harvested, {
      type: 'plant',
      id: 3,
      variety: s.plots[0].variety!,
    });
    assert.ok(planted.cash > 0);
    assert.ok(planted.grapes.length > 0);
    assert.equal(planted.plots[2].growth, 15);
  }
});

test('land purchases use their quoted price and reject balances one dollar short', () => {
  for (const [id, price] of [
    [4, 16800],
    [5, 14000],
    [6, 19200],
  ]) {
    for (const estate of [1, 2]) {
      const s = estate === 1 ? funded() : acquire(funded());
      const address = plotId(estate, 0, id);
      assert.equal(getLand(s, address).cost, price);
      s.cash = price - 1;
      const before = structuredClone(s);
      assert.throws(() => act(s, { type: 'buyPlot', id: address }), /more/);
      assert.deepEqual(s, before);
      s.cash = price;
      const bought = act(s, { type: 'buyPlot', id: address });
      assert.equal(bought.cash, 0);
      assert.equal(bought.ledger[0].amount, -price);
      assert.equal(bought.plots.find((p) => p.id === address)!.owned, true);
      assert.equal(upkeep(bought), upkeep(s) + 25);
      assert.equal(bought.seed, s.seed);
      assert.equal(bought.week, s.week);
      valid(bought);
    }
  }
});

test('repricing land preserves previously purchased acreage and its historical cost', () => {
  const old = newGame();
  old.plots[4].owned = true;
  old.cash -= 3500;
  old.ledger.unshift({ week: old.week, label: 'River meadow', amount: -3500 });
  const loaded = deserialize(serialize(old));
  assert.deepEqual(loaded, old);
  assert.equal(estateArea(loaded), 4.1);
  assert.equal(getLand(loaded, 5).cost, 14000);
  assert.equal(loaded.ledger[0].amount, -3500);
});

test('v3 migration wraps the original estate without regrading or changing inventory', () => {
  const start = newGame('burgundy', 'Old Vines');
  start.cellar.tanks.forEach((t) => {
    t.capacity = 400;
  });
  let s = act(start, { type: 'harvest', id: 1 });
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: true });
  const { estates, activeEstate, ...old } = s;
  const migrated = deserialize(
    JSON.stringify({
      game: 'terroir',
      savedAt: 'old',
      state: { ...old, version: 3 },
    }),
  );
  assert.deepEqual(migrated, {
    ...s,
    estates,
    activeEstate,
    grapeLicenses: migrated.grapeLicenses,
  });
  assert.ok(migrated.grapeLicenses.includes('aligote'));
  assert.equal(migrated.version, 6);
  assert.equal(tankCount(migrated), 2);
  assert.equal(upkeep(migrated), 160);
  assert.deepEqual(migrated.batches, s.batches);
  valid(migrated);
});

test('acquiring a region adds empty land without cellar equipment or minting supplies or crops', () => {
  const before = funded(),
    copy = structuredClone(before),
    s = acquire(before);
  assert.deepEqual(before, copy);
  assert.equal(s.cash, before.cash - acquisitionCost(1));
  assert.equal(s.estates.length, 2);
  assert.equal(s.activeEstate, 2);
  assert.equal(getEstate(s).region, 'mosel');
  assert.equal(estatePlots(s).length, 6);
  assert.equal(estatePlots(s).filter((p) => p.owned).length, 3);
  assert.equal(estateArea(s), 3);
  assert.ok(estatePlots(s).every((p) => p.growth === 0 && p.variety === null));
  assert.deepEqual(estatePlots(s, 1), before.plots);
  assert.equal(tankCount(s), 2);
  assert.equal(upkeep(s) - upkeep(before), 175);
  assert.equal(s.kits, before.kits);
  assert.equal(s.knowledge, before.knowledge);
  assert.equal(s.seed, before.seed);
  assert.deepEqual(s.grapes, []);
  valid(s);
});

test('district purchases unlock six unowned parcels and preserve existing holdings in every district', () => {
  for (const estate of [1, 2]) {
    let s = estate === 1 ? funded() : acquire(funded());
    for (let districts = 1; districts < 4; districts++) {
      const before = structuredClone(s);
      s = act(s, { type: 'expandEstate', id: estate });
      assert.equal(s.cash, before.cash - districtCost(before.estates));
      assert.equal(upkeep(s) - upkeep(before), 35);
      assert.equal(tankCount(s), tankCount(before));
      assert.equal(s.plots.length, before.plots.length + 6);
      assert.equal(estateArea(s, estate), 3);
      assert.deepEqual(s.plots.slice(0, -6), before.plots);
      assert.ok(
        s.plots
          .slice(-6)
          .every((p) => !p.owned && !p.variety && p.growth === 0),
      );
      assert.equal(s.seed, before.seed);
      assert.equal(s.week, before.week);
      assert.equal(s.kits, before.kits);
      assert.equal(s.knowledge, before.knowledge);
      assert.deepEqual(s.grapes, before.grapes);
      valid(s);
    }
    assert.throws(() => act(s, { type: 'expandEstate', id: estate }), /four/);
  }
});

test('every new district parcel requires a paid purchase before planting or enlargement', () => {
  for (const estate of [1, 2]) {
    let s = estate === 1 ? funded() : acquire(funded());
    for (let district = 1; district < 4; district++) {
      s = act(s, { type: 'expandEstate', id: estate });
      for (let local = 1; local <= 6; local++) {
        const id = plotId(estate, district, local);
        const price = [16800, 14000, 14000, 16800, 14000, 19200][local - 1];
        assert.equal(getLand(s, id).cost, price);
        const before = structuredClone(s);
        assert.throws(
          () => act(s, { type: 'plant', id, variety: 'merlot' }),
          /own/,
        );
        assert.throws(
          () => act(s, { type: 'expandPlot', id }),
          /Buy this parcel/,
        );
        assert.deepEqual(s, before);
        const short = { ...s, cash: price - 1 };
        const shortBefore = structuredClone(short);
        assert.throws(() => act(short, { type: 'buyPlot', id }), /more/);
        assert.deepEqual(short, shortBefore);
        const bought = act({ ...s, cash: price }, { type: 'buyPlot', id });
        assert.equal(bought.cash, 0);
        assert.equal(bought.ledger[0].amount, -price);
        assert.equal(upkeep(bought), upkeep(s) + 25);
        assert.deepEqual(
          bought.plots.filter((p) => p.id !== id),
          s.plots.filter((p) => p.id !== id),
        );
        assert.ok(
          Math.abs(
            estateArea(bought, estate) -
              estateArea(s, estate) -
              Number(getLand(s, id).area),
          ) < 1e-9,
        );
        assert.throws(() => act(bought, { type: 'buyPlot', id }), /already/);
        valid(bought);
        s = act(s, { type: 'buyPlot', id });
        s = act(s, { type: 'plant', id, variety: 'merlot' });
        assert.equal(s.plots.find((p) => p.id === id)!.variety, 'merlot');
      }
    }
    assert.equal(estateArea(s, estate).toFixed(1), '23.4');
    valid(s);
  }
});

test('regional acquisitions scale into millions and charge exactly the quoted price', () => {
  let s = funded();
  const prices = [
    250000, 1000000, 2250000, 4000000, 6250000, 9000000, 12250000,
  ];
  for (const region of REGION_IDS.filter((r) => r !== s.region)) {
    const price = prices[s.estates.length - 1];
    assert.equal(acquisitionCost(s.estates.length), price);
    const short = { ...s, cash: price - 1 };
    const before = structuredClone(short);
    assert.throws(() => acquire(short, region), /more/);
    assert.deepEqual(short, before);
    s = acquire({ ...s, cash: price }, region);
    assert.equal(s.cash, 0);
    assert.equal(s.ledger[0].amount, -price);
    valid(s);
  }
  for (const estate of [1, 2]) {
    s = estate === 1 ? funded() : acquire(funded());
    for (let district = 1; district < 4; district++) {
      const price = districtCost(s.estates);
      const short = { ...s, cash: price - 1 };
      const before = structuredClone(short);
      assert.throws(
        () => act(short, { type: 'expandEstate', id: estate }),
        /more/,
      );
      assert.deepEqual(short, before);
      s = act({ ...s, cash: price }, { type: 'expandEstate', id: estate });
      assert.equal(s.cash, 0);
      assert.equal(s.ledger[0].amount, -price);
      valid(s);
    }
  }
});

test('existing saves retain district parcels that were included at their historical purchase price', () => {
  let old = act(funded(), { type: 'expandEstate', id: 1 });
  old.plots.slice(-6).forEach((p) => {
    p.owned = true;
  });
  old.cash += 75000 - 36000;
  old.ledger[0].amount = -36000;
  old = act(old, { type: 'plant', id: plotId(1, 1), variety: 'merlot' });
  old = act(old, { type: 'expandPlot', id: plotId(1, 1) });
  const loaded = deserialize(serialize(old));
  assert.deepEqual(loaded, old);
  assert.equal(loaded.plots.filter((p) => p.owned).length, 9);
  assert.equal(estateArea(loaded).toFixed(1), '10.4');
  assert.equal(
    loaded.ledger.find((entry) => entry.label.includes('vineyard expansion'))!
      .amount,
    -36000,
  );
  assert.equal(districtCost(loaded.estates), 300000);
  const expanded = act(loaded, { type: 'expandEstate', id: 1 });
  assert.deepEqual(expanded.plots.slice(0, -6), old.plots);
  assert.ok(expanded.plots.slice(-6).every((p) => !p.owned));
  valid(expanded);
});

test('district prices follow purchases across estates and do not reset in a new region', () => {
  let s = acquire(funded());
  const prices = [75000, 300000, 675000, 1200000, 1875000, 2700000];
  const destinations = [1, 2, 3, 1, 2, 3];
  for (const [i, price] of prices.entries()) {
    if (i === 2) {
      s = acquire({ ...s, cash: acquisitionCost(s.estates.length) }, 'napa');
      assert.equal(districtCost(s.estates), price);
    }
    assert.equal(districtCost(s.estates), price);
    const short = { ...s, cash: price - 1 };
    const before = structuredClone(short);
    assert.throws(
      () => act(short, { type: 'expandEstate', id: destinations[i] }),
      /more/,
    );
    assert.deepEqual(short, before);
    s = act(
      { ...s, cash: price },
      { type: 'expandEstate', id: destinations[i] },
    );
    assert.equal(s.cash, 0);
    assert.equal(s.ledger[0].amount, -price);
    assert.equal(estateArea(s, destinations[i]), 3);
    s = deserialize(serialize(s));
    valid(s);
  }
  assert.equal(districtCost(s.estates), 3675000);
});

test('a ten-million-dollar existing portfolio has substantial later purchases without retroactive charges', () => {
  let s = acquire(acquire(funded()), 'napa');
  s = act(s, { type: 'expandEstate', id: 1 });
  s.cash = 10000000;
  const before = structuredClone(s);
  s = deserialize(serialize(s));
  assert.deepEqual(s, before);
  assert.equal(acquisitionCost(s.estates.length), 2250000);
  assert.equal(districtCost(s.estates), 300000);
  s = acquire(s, 'rioja');
  s = acquire(s, 'barossa');
  assert.equal(s.cash, 3750000);
  assert.equal(acquisitionCost(s.estates.length), 6250000);
  const limited = structuredClone(s);
  assert.throws(() => acquire(s, 'mendoza'), /more/);
  assert.deepEqual(s, limited);
  valid(s);
});

test('invalid or unaffordable purchases never consume money or partially create an estate', () => {
  const s = funded(),
    copy = structuredClone(s);
  for (const action of [
    { type: 'acquireEstate', region: 'bordeaux', name: 'Duplicate region' },
    { type: 'acquireEstate', region: 'mosel', name: '' },
    { type: 'acquireEstate', region: 'mosel', name: s.name },
    { type: 'acquireEstate', region: 'mars', name: 'Invalid region' },
    { type: 'expandEstate', id: 99 },
    { type: 'visitEstate', id: 99 },
  ])
    assert.throws(() => act(s, action as Parameters<typeof act>[1]));
  assert.deepEqual(s, copy);
  const poor = newGame();
  assert.throws(() => acquire(poor), /more/);
  assert.throws(() => act(poor, { type: 'expandEstate', id: 1 }), /more/);
  assert.equal(poor.plots.length, 6);
  assert.equal(poor.cash, 12500);
});

test('each region supplies its own soils, grape access, planting discount and harvest quality', () => {
  let s = acquire(funded());
  const id = plotId(2);
  assert.equal(getLand(s, id).region, 'mosel');
  assert.equal(getLand(s, id).soil, getLand(newGame('mosel'), 1).soil);
  assert.ok(!availableVarieties(s, 'mosel').some(([v]) => v === 'riesling'));
  learn(s, 'grape_riesling');
  assert.ok(
    availableVarieties(s).some(([v]) => v === 'riesling'),
    'Regional vines are available to the shared nursery',
  );
  const before = s.cash;
  s = act(s, { type: 'plant', id, variety: 'riesling' });
  assert.equal(before - s.cash, plantingCost(s, 'riesling', 'mosel'));
  const p = s.plots.find((p) => p.id === id)!;
  p.growth = 100;
  p.health = 100;
  const local = newGame('mosel');
  local.plots[0] = { ...p, id: 1 };
  assert.equal(harvestQuality(s, p), harvestQuality(local, local.plots[0]));
  const atHome = { ...p, id: 1 };
  assert.ok(harvestQuality(s, p) > harvestQuality(s, atHome));
  assert.equal(getLand(s, plotId(1)).region, 'bordeaux');
  valid(s);
});

test('unselected estates keep growing and a visit cannot alter simulation outcomes', () => {
  let s = acquire(funded());
  learn(s, 'grape_riesling');
  s = act(s, { type: 'plant', id: plotId(2), variety: 'riesling' });
  const home = act(s, { type: 'visitEstate', id: 1 });
  const away = act(home, { type: 'visitEstate', id: 2 });
  const nextHome = act(home, { type: 'advance' }),
    nextAway = act(away, { type: 'advance' });
  assert.deepEqual(nextHome.plots, nextAway.plots);
  assert.equal(nextHome.seed, nextAway.seed);
  assert.equal(nextHome.cash, nextAway.cash);
  assert.ok(nextHome.plots.find((p) => p.id === plotId(2))!.growth > 15);
  assert.equal(deserialize(serialize(nextAway)).activeEstate, 2);
  valid(nextHome);
  valid(nextAway);
});

test('estate origins survive fermentation, reserves, cross-estate blending, partial bottling and reloads', () => {
  let s = acquire(funded(), 'napa');
  s = act(s, { type: 'buyTank', count: 2 });
  s = act(s, { type: 'plant', id: plotId(2), variety: 'merlot' });
  for (const id of [1, plotId(2)]) {
    const p = s.plots.find((p) => p.id === id)!;
    p.growth = 100;
    p.health = 100;
    s = act(s, { type: 'harvest', id });
  }
  assert.deepEqual(
    s.grapes.map((g) => g.estateId),
    [1, 2],
  );
  for (const g of [...s.grapes]) {
    // Equal quality isolates provenance from the existing quality grouping key.
    s.grapes.find((x) => x.id === g.id)!.quality = 80;
    s = act(s, { type: 'ferment', id: g.id, oak: false });
  }
  for (let i = 0; i < 2; i++) s = act(s, { type: 'advance' });
  for (const b of [...s.batches]) s = act(s, { type: 'reserve', id: b.id });
  const lots = [...s.reserves];
  learn(s, 'regional_blending');
  s = act(s, {
    type: 'blend',
    name: 'Two Estates',
    portions: lots.map((r) => ({ id: r.id, ml: 30000 })),
  });
  const r = s.reserves.at(-1)!;
  assert.equal(r.components.length, 2);
  assert.deepEqual(r.components.map((p) => p.estateId).sort(), [1, 2]);
  assert.equal(combine(r.components).length, 2);
  assert.equal(blendProfile(r.components).sources.length, 2);
  assert.equal(
    blendProfile(r.components).compatibility,
    0,
    'Estate diversity is not grape diversity',
  );
  s = act(s, {
    type: 'bottle',
    id: r.id,
    bottles: 10,
    line: { name: 'Two Estates', design: DEFAULT_DESIGN },
  });
  assert.equal(volume(s.wines[0].components), 7500);
  assert.deepEqual(s.wines[0].components.map((p) => p.estateId).sort(), [1, 2]);
  assert.equal(volume(s.reserves.at(-1)!.components), 52500);
  valid(s);
});

test('the full portfolio supports 192 parcels while processing capacity is purchased independently', () => {
  let s = funded();
  s.cash = 500000000; // Capacity coverage funds the full scaled portfolio, parcels and equipment.
  for (const region of REGION_IDS.filter((r) => r !== s.region))
    s = acquire(s, region);
  for (const e of [...s.estates]) {
    for (let i = 0; i < 3; i++) s = act(s, { type: 'expandEstate', id: e.id });
    for (const p of estatePlots(s, e.id).filter((p) => !p.owned))
      s = act(s, { type: 'buyPlot', id: p.id });
  }
  for (let i = 0; i < 16; i++) s = act(s, { type: 'expandCellar' });
  s = act(s, { type: 'buyTank', count: 66 });
  assert.equal(s.estates.length, 8);
  assert.equal(s.plots.length, 192);
  assert.equal(tankCount(s), 68);
  assert.equal(
    s.estates.reduce((n, e) => n + estateArea(s, e.id), 0).toFixed(1),
    '217.6',
  );
  for (const p of [...s.plots]) {
    if (!p.variety) s = act(s, { type: 'plant', id: p.id, variety: 'merlot' });
    s.plots.find((x) => x.id === p.id)!.growth = 100;
    s = act(s, { type: 'harvest', id: p.id });
  }
  assert.equal(s.grapes.length, 192);
  for (const g of s.grapes.slice(0, 34))
    s = act(s, { type: 'ferment', id: g.id, oak: false });
  assert.equal(occupiedTankCount(s), 68);
  assert.throws(
    () => act(s, { type: 'ferment', id: s.grapes[0].id, oak: false }),
    /tanks/,
  );
  valid(s);
});

test('save validation rejects malformed estate ownership, regions, capacity and origin references', () => {
  const s = acquire(funded());
  for (const corrupt of [
    (x: GameState) => {
      x.estates = [];
    },
    (x: GameState) => {
      x.estates[1].region = x.region;
    },
    (x: GameState) => {
      x.estates[1].districts = 2;
    },
    (x: GameState) => {
      x.estates[1].id = 3;
    },
    (x: GameState) => {
      x.activeEstate = 8;
    },
    (x: GameState) => {
      x.plots.pop();
    },
    (x: GameState) => {
      x.plots[6].id = 1;
    },
    (x: GameState) => {
      x.grapes.push({
        id: x.nextId++,
        variety: 'merlot',
        kg: 100,
        quality: 80,
        picked: x.week,
        estateId: 8,
      });
    },
  ]) {
    const bad = structuredClone(s);
    corrupt(bad);
    assert.equal(stateSchema.safeParse(bad).success, false);
    assert.throws(() => deserialize(serialize(bad)), /compatible/);
  }
});
