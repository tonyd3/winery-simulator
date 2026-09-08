import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  newGame,
  serialize,
  deserialize,
  stateSchema,
  upkeep,
  tankCount,
  occupiedTankCount,
  fermentationPlan,
  cellarExpansionCost,
} from '../src/game.ts';
import type { GameState, Action } from '../src/game.ts';
import { DEFAULT_DESIGN, volume } from '../src/winemaking.ts';

const valid = (s: GameState) => assert.deepEqual(deserialize(serialize(s)), s);
function grapes(kg: number, s = newGame()) {
  s.grapes.push({
    id: s.nextId++,
    variety: 'merlot',
    kg,
    quality: 78,
    picked: s.week,
    estateId: 1,
  });
  return s;
}
function tick(s: GameState, weeks = 2) {
  for (let i = 0; i < weeks; i++) s = act(s, { type: 'advance' });
  return s;
}

test('floor space and small tanks are separate, repeatable paid investments', () => {
  let s = newGame();
  assert.equal(s.cellar.bays, 4);
  assert.deepEqual(
    s.cellar.tanks.map((t) => t.capacity),
    [150, 150],
  );
  const before = structuredClone(s);
  s = act(s, { type: 'buyTank', count: 2 });
  assert.equal(s.cash, before.cash - 2400);
  assert.equal(tankCount(s), 4);
  assert.equal(s.cellar.bays, 4);
  assert.equal(upkeep(s), upkeep(before));
  assert.throws(() => act(s, { type: 'buyTank' }), /Expand/);
  const floor = s;
  s = act(s, { type: 'expandCellar' });
  assert.equal(s.cash, floor.cash - 3200);
  assert.equal(s.cellar.bays, 8);
  assert.equal(tankCount(s), 4);
  assert.equal(upkeep(s), upkeep(floor) + 15);
  assert.equal(cellarExpansionCost(s), 4800);
  s = act(s, { type: 'expandCellar' });
  assert.equal(s.cellar.bays, 12);
  assert.equal(s.cash, floor.cash - 8000);
  assert.equal(s.week, before.week);
  assert.equal(s.seed, before.seed);
  valid(s);
});

test('large harvests fill multiple tanks, charge per tank and conserve all wine through reserves and bottling', () => {
  let s = grapes(360);
  const plan = fermentationPlan(s, 360);
  assert.deepEqual(plan, {
    fills: [
      { tankId: 1, liters: 150 },
      { tankId: 2, liters: 102 },
    ],
    missing: 0,
    cost: 280,
  });
  const cash = s.cash;
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: false });
  assert.equal(s.cash, cash - 280);
  assert.equal(s.batches[0].liters, 252);
  assert.equal(occupiedTankCount(s), 2);
  assert.equal(s.grapes.length, 0);
  valid(s);
  s = tick(deserialize(serialize(s)));
  s = act(s, { type: 'reserve', id: s.batches[0].id });
  assert.equal(occupiedTankCount(s), 0);
  assert.equal(volume(s.reserves[0].components), 252000);
  assert.equal(s.reserves[0].components[0].estateId, 1);
  s = act(s, {
    type: 'bottle',
    id: s.reserves[0].id,
    bottles: 336,
    line: { name: 'Tank Trial', design: DEFAULT_DESIGN },
  });
  assert.equal(s.wines[0].produced, 336);
  assert.equal(s.kits, 264);
  assert.equal(s.reserves.length, 0);
  valid(s);
});

test('a three-tank harvest requires enough whole empty tanks and locks their unused capacity', () => {
  let s = grapes(600);
  const snapshot = structuredClone(s);
  assert.equal(fermentationPlan(s, 600).missing, 120);
  assert.throws(() => act(s, { type: 'ferment', id: 1, oak: true }), /120 L/);
  assert.deepEqual(s, snapshot);
  s = act(s, { type: 'buyTank' });
  const cash = s.cash;
  s = act(s, { type: 'ferment', id: 1, oak: true });
  assert.equal(s.cash, cash - 960);
  assert.equal(s.batches[0].liters, 420);
  assert.deepEqual(s.batches[0].tankIds, [1, 2, 3]);
  valid(s);
  s = grapes(20, s);
  assert.equal(
    fermentationPlan(s, 20).missing,
    14,
    'The 30 L left in the third tank is reserved for its current harvest',
  );
  assert.throws(
    () => act(s, { type: 'ferment', id: s.grapes[0].id, oak: false }),
    /empty tanks/,
  );
});

test('small harvests occupy one tank and freed tank IDs are reused without disturbing another batch', () => {
  let s = grapes(100);
  s = act(s, { type: 'ferment', id: 1, oak: false });
  s = grapes(100, s);
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: false });
  assert.deepEqual(
    s.batches.map((b) => b.tankIds),
    [[1], [2]],
  );
  s = tick(s);
  const other = structuredClone(s.batches[1]);
  s = act(s, { type: 'reserve', id: s.batches[0].id });
  assert.deepEqual(s.batches[0], other);
  s = grapes(200, s);
  assert.deepEqual(fermentationPlan(s, 200).fills, [
    { tankId: 1, liters: 140 },
  ]);
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: false });
  assert.equal(occupiedTankCount(s), 2);
  valid(s);
});

test('unaffordable and invalid equipment purchases and fermentations leave every asset unchanged', () => {
  const s = grapes(360);
  s.cash = 100;
  const snapshot = structuredClone(s);
  const actions: Action[] = [
    { type: 'buyTank' },
    { type: 'expandCellar' },
    { type: 'ferment', id: 1, oak: false },
    ...[0, -1, 1.5, 257, NaN, Infinity].map((count) => ({
      type: 'buyTank' as const,
      count,
    })),
  ];
  for (const action of actions) assert.throws(() => act(s, action));
  assert.deepEqual(s, snapshot);
  assert.throws(
    () => act(grapes(1), { type: 'ferment', id: 1, oak: false }),
    /not enough grapes/,
  );
  assert.throws(
    () => act(s, { type: 'upgrade', upgrade: 'cellar' }),
    /separately/,
  );
});

test('v4 migration retains all prior large tanks, occupied wine, portfolio and finances', () => {
  let s = newGame('mosel', 'Old Cellar');
  s.cash = 100000;
  s = act(s, { type: 'acquireEstate', region: 'napa', name: 'Western Vines' });
  s = act(s, { type: 'expandEstate', id: 2 });
  s = grapes(400, s);
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: true });
  s.upgrades.push('cellar');
  const { cellar, version, batches, ...assets } = s;
  const oldBatches = batches.map(({ tankIds, ...batch }) => batch);
  const raw = { ...assets, version: 4, batches: oldBatches };
  const loaded = deserialize(
    JSON.stringify({ game: 'terroir', savedAt: 'legacy', state: raw }),
  );
  assert.equal(loaded.version, 6);
  assert.deepEqual(loaded.cellar, {
    bays: 8,
    expansions: 0,
    tanks: Array.from({ length: 8 }, (_, i) => ({ id: i + 1, capacity: 400 })),
  });
  const {
    cellar: upgraded,
    version: v,
    batches: assigned,
    ...preserved
  } = loaded;
  assert.deepEqual(preserved, {
    ...assets,
    grapeLicenses: loaded.grapeLicenses,
  });
  assert.ok(loaded.grapeLicenses.includes('cabernet'));
  assert.ok(loaded.grapeLicenses.includes('riesling'));
  assert.deepEqual(
    assigned.map(({ tankIds, ...batch }) => batch),
    oldBatches,
  );
  assert.deepEqual(assigned[0].tankIds, [1]);
  assert.equal(upkeep(loaded), upkeep(s));
  const expanded = act(loaded, { type: 'expandCellar' });
  const purchased = act(expanded, { type: 'buyTank' });
  assert.equal(purchased.cellar.tanks.at(-1)!.capacity, 150);
  assert.equal(purchased.cellar.tanks[0].capacity, 400);
  valid(purchased);
});

test('legacy tanks are filled first and mixed capacities never lose liquid or overfill a tank', () => {
  let s = newGame();
  s.cellar.tanks[1].capacity = 400;
  assert.deepEqual(fermentationPlan(s, 500).fills, [
    { tankId: 2, liters: 350 },
  ]);
  assert.deepEqual(fermentationPlan(s, 600).fills, [
    { tankId: 2, liters: 400 },
    { tankId: 1, liters: 20 },
  ]);
  s = grapes(600, s);
  s = act(s, { type: 'ferment', id: 1, oak: false });
  assert.equal(s.batches[0].liters, 420);
  valid(s);
});

test('invalid equipment and double-booked or overloaded tank references are rejected on import', () => {
  const s = act(grapes(360), { type: 'ferment', id: 1, oak: false });
  const corruptions: ((s: GameState) => void)[] = [
    (x) => {
      x.cellar.bays = 2;
    },
    (x) => {
      x.cellar.bays = 5;
    },
    (x) => {
      x.cellar.expansions = 2;
    },
    (x) => {
      x.cellar.tanks[1].id = 1;
    },
    (x) => {
      x.batches[0].tankIds = [1];
    },
    (x) => {
      x.batches[0].tankIds = [1, 1];
    },
    (x) => {
      x.batches[0].tankIds = [1, 99];
    },
    (x) => {
      x.batches.push({ ...x.batches[0], id: x.nextId++ });
    },
    (x) => {
      x.cellar.tanks = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        capacity: 150,
      }));
    },
  ];
  for (const corrupt of corruptions) {
    const bad = structuredClone(s);
    corrupt(bad);
    assert.equal(stateSchema.safeParse(bad).success, false);
    assert.throws(() => deserialize(serialize(bad)), /compatible/);
  }
});

test('a fully equipped cellar reaches its paid limit and survives reload with 256 occupied tanks', () => {
  let s = newGame();
  s.cash = 10000000;
  while (s.cellar.bays < 256) s = act(s, { type: 'expandCellar' });
  s = act(s, { type: 'buyTank', count: 254 });
  const snapshot = structuredClone(s);
  assert.throws(() => act(s, { type: 'expandCellar' }), /maximum/);
  assert.throws(() => act(s, { type: 'buyTank' }), /Expand/);
  assert.deepEqual(s, snapshot);
  for (let i = 0; i < 128; i++) {
    s = grapes(400, s);
    s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: false });
  }
  assert.equal(occupiedTankCount(s), 256);
  assert.equal(
    s.batches.reduce((n, b) => n + b.liters, 0),
    35840,
  );
  valid(s);
});
