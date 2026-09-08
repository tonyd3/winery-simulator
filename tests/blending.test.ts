import { learn } from './helpers.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  deserialize,
  newGame,
  serialize,
  stateSchema,
  wineSales,
} from '../src/game.ts';
import { assess, DEFAULT_DESIGN, volume } from '../src/winemaking.ts';
import type { GameState, Action } from '../src/game.ts';
function cellar() {
  let s = learn(newGame(), 'vintage_blending');
  s.week = 20;
  s.cellar.tanks.forEach((t) => {
    t.capacity = 400;
  });
  s.kits = 2000;
  s.batches = [
    {
      id: 1,
      tankIds: [1],
      variety: 'merlot',
      liters: 210,
      quality: 77,
      stage: 'ready',
      remaining: 0,
      age: 2,
      oak: true,
      year: 1,
    },
    {
      id: 2,
      tankIds: [2],
      variety: 'cabernet',
      liters: 150,
      quality: 83,
      stage: 'ready',
      remaining: 0,
      age: 0,
      oak: false,
      year: 2,
    },
  ];
  s.nextId = 3;
  return s;
}
function reserves() {
  let s = act(cellar(), { type: 'reserve', id: 1 });
  return act(s, { type: 'reserve', id: 2 });
}
function blended() {
  return act(reserves(), {
    type: 'blend',
    name: 'Solstice',
    portions: [
      { id: 3, ml: 90000 },
      { id: 4, ml: 60000 },
    ],
  });
}
const bottle = (s: GameState, count = 100, id = 5, lineId?: number) =>
  act(s, {
    type: 'bottle',
    id,
    bottles: count,
    line:
      lineId === undefined
        ? { name: 'Solstice', design: DEFAULT_DESIGN }
        : { id: lineId },
  });
const valid = (s: GameState) => assert.deepEqual(deserialize(serialize(s)), s);

test('reserves free tanks and preserve aged wine across years without supplies', () => {
  let s = cellar();
  s.kits = 0;
  s = act(s, { type: 'reserve', id: 1 });
  assert.equal(s.batches.length, 1);
  assert.equal(volume(s.reserves[0].components), 210000);
  assert.equal(s.reserves[0].components[0].quality, 82);
  const lot = structuredClone(s.reserves[0]);
  for (let i = 0; i < 25; i++) s = act(s, { type: 'advance' });
  assert.deepEqual(s.reserves[0], lot);
  valid(s);
  const unfinished = cellar();
  unfinished.batches[0].stage = 'fermenting';
  unfinished.batches[0].remaining = 1;
  assert.throws(() => act(unfinished, { type: 'reserve', id: 1 }), /finish/);
});

test('partial blending conserves liquid and provenance across varieties and vintages', () => {
  const s = blended();
  assert.deepEqual(
    s.reserves.map((r) => volume(r.components)),
    [120000, 90000, 150000],
  );
  assert.deepEqual(
    s.reserves[2].components.map((p) => [p.variety, p.year, p.ml]),
    [
      ['merlot', 1, 90000],
      ['cabernet', 2, 60000],
    ],
  );
  assert.equal(assess(s.reserves[2].components).expected, 86);
  assert.equal(s.kits, 2000);
  valid(s);
});

test('nested blends do not compound compatibility bonuses or discard source years', () => {
  let s = blended();
  // Add the remaining reserves back at the same 60/40 ratio.
  s = act(s, {
    type: 'blend',
    name: 'Solstice II',
    portions: [
      { id: 5, ml: 150000 },
      { id: 3, ml: 90000 },
      { id: 4, ml: 60000 },
    ],
  });
  assert.equal(assess(s.reserves.at(-1)!.components).expected, 86);
  assert.equal(s.reserves.at(-1)!.components.length, 2);
  assert.equal(
    s.reserves.reduce((n, r) => n + volume(r.components), 0),
    360000,
  );
  valid(s);
});

test('fractional volumes and 750 mL bottles conserve every milliliter', () => {
  let s = reserves();
  s = act(s, {
    type: 'blend',
    name: 'Small lot',
    portions: [
      { id: 3, ml: 1001 },
      { id: 4, ml: 1000 },
    ],
  });
  s = bottle(s, 2);
  assert.equal(volume(s.reserves.find((r) => r.id === 5)!.components), 501);
  assert.equal(volume(s.wines[0].components), 1500);
  const byGrape = new Map<string, number>();
  for (const p of [
    ...s.reserves.flatMap((r) => r.components),
    ...s.wines.flatMap((w) => w.components),
  ])
    byGrape.set(p.variety, (byGrape.get(p.variety) ?? 0) + p.ml);
  assert.deepEqual(
    [...byGrape],
    [
      ['merlot', 210000],
      ['cabernet', 150000],
    ],
  );
  assert.equal(s.kits, 1998);
  valid(s);
});

test('failed blends and bottlings cannot consume stock, kits, IDs, knowledge or RNG', () => {
  const s = blended(),
    copy = structuredClone(s);
  const invalid: Action[] = [
    {
      type: 'blend',
      name: 'Bad',
      portions: [
        { id: 3, ml: 10 },
        { id: 3, ml: 10 },
      ],
    },
    {
      type: 'blend',
      name: '',
      portions: [
        { id: 3, ml: 10 },
        { id: 4, ml: 10 },
      ],
    },
    ...[0, -1, 0.5, Infinity, NaN, 500000].map((ml) => ({
      type: 'blend' as const,
      name: 'Bad',
      portions: [
        { id: 3, ml },
        { id: 4, ml: 10 },
      ],
    })),
    ...[0, -1, 0.5, Infinity, NaN, 3000].map((bottles) => ({
      type: 'bottle' as const,
      id: 5,
      bottles,
      line: { name: 'Bad', design: DEFAULT_DESIGN },
    })),
    { type: 'bottle', id: 5, bottles: 1, line: { id: 999 } },
    {
      type: 'bottle',
      id: 5,
      bottles: 1,
      line: { name: ' ', design: DEFAULT_DESIGN },
    },
  ];
  for (const action of invalid) assert.throws(() => act(s, action));
  assert.deepEqual(s, copy);
  const empty = structuredClone(s);
  empty.kits = 0;
  assert.throws(() => bottle(empty), /kits/);
  assert.equal(empty.seed, s.seed);
});

test('wine lines retain label heritage and release history after sales and new vintages', () => {
  let s = bottle(blended());
  const first = structuredClone(s.wines[0]);
  const line = s.lines[0];
  assert.equal(first.produced, 100);
  assert.equal(first.release, 1);
  assert.equal(line.founded, 2);
  s = act(s, { type: 'wholesale', id: first.id });
  const sold = structuredClone(s.wines[0]);
  s = act(s, { type: 'rename', name: 'Renamed estate' });
  s.week = 35;
  s = bottle(s, 100, 5, line.id);
  const second = s.wines[1];
  assert.equal(s.lines.length, 1);
  assert.equal(second.release, 2);
  assert.equal(second.lineId, first.lineId);
  assert.deepEqual(second.design, first.design);
  assert.equal(second.quality, first.quality);
  assert.equal(second.founded, 2);
  assert.equal(second.estate, 'Renamed estate');
  assert.deepEqual(s.wines[0], sold);
  assert.equal(
    s.reserves.some((r) => r.id === 5),
    false,
  );
  valid(s);
});

test('per-release sales reconcile retail and wholesale without losing sold-out history', () => {
  let s = bottle(blended());
  const firstId = s.wines[0].id;
  s = bottle(s, 100, 5, s.lines[0].id);
  assert.deepEqual(wineSales(s.wines), { count: 0, complete: true });
  s = act(s, { type: 'list', id: firstId });
  s = act(s, { type: 'advance' });
  const retail = 100 - s.wines[0].bottles;
  assert.ok(retail > 0 && retail < 100);
  assert.equal(s.wines[1].bottles, 100);
  assert.deepEqual(wineSales(s.wines), { count: retail, complete: true });
  assert.equal(s.stats.sold, retail);
  s = act(deserialize(serialize(s)), { type: 'wholesale', id: firstId });
  assert.equal(s.wines.length, 2);
  assert.equal(s.wines[0].bottles, 0);
  assert.deepEqual(wineSales([s.wines[0]]), { count: 100, complete: true });
  assert.deepEqual(wineSales([s.wines[1]]), { count: 0, complete: true });
  assert.equal(s.stats.sold, 100);
  assert.throws(() => act(s, { type: 'wholesale', id: firstId }), /sold out/);
  s = act(s, { type: 'advance' });
  assert.deepEqual(wineSales(s.wines), { count: 100, complete: true });
  valid(s);
});

test('existing saves recover known sales and track new legacy sales without inventing old totals', () => {
  let original = bottle(blended());
  original = bottle(original, 100, 5, original.lines[0].id);
  const raw = JSON.parse(serialize(original));
  raw.state.wines[0].produced = null;
  raw.state.wines[0].bottles = 70;
  raw.state.wines[1].bottles = 76;
  raw.state.stats.sold = 54;
  for (const wine of raw.state.wines) delete wine.salesSinceTracking;
  let s = deserialize(JSON.stringify(raw));
  const legacyId = s.wines[0].id;
  assert.deepEqual(wineSales([s.wines[0]]), { count: 0, complete: false });
  assert.deepEqual(wineSales([s.wines[1]]), { count: 24, complete: true });
  assert.deepEqual(wineSales(s.wines), { count: 24, complete: false });
  assert.equal(s.stats.sold, 54);
  s = act(s, { type: 'list', id: legacyId });
  s = act(s, { type: 'advance' });
  const retail = 70 - s.wines[0].bottles;
  assert.ok(retail > 0 && retail < 70);
  assert.deepEqual(wineSales([s.wines[0]]), { count: retail, complete: false });
  s = act(deserialize(serialize(s)), { type: 'wholesale', id: legacyId });
  assert.deepEqual(wineSales([s.wines[0]]), { count: 70, complete: false });
  assert.deepEqual(wineSales(s.wines), { count: 94, complete: false });
  assert.equal(s.stats.sold, 124);
  assert.equal(s.wines[0].produced, null);
  valid(s);
});

test('tasting variation is bounded, persisted, deterministic, and locked for partial releases', () => {
  const original = blended(),
    expected = assess(original.reserves[2].components).expected;
  const s = bottle(original, 80),
    w = s.wines[0];
  assert.ok(w.quality >= expected - 3 && w.quality <= expected + 3);
  assert.deepEqual(bottle(deserialize(serialize(original)), 80), s);
  const partial = bottle(deserialize(serialize(s)), 120, 5, s.lines[0].id);
  assert.equal(partial.wines[1].quality, w.quality);
  assert.equal(partial.seed, s.seed);
  const scores = new Set<number>();
  for (let year = 1; year <= 20; year++) {
    const trial = structuredClone(original);
    trial.reserves[2].components.forEach((part) => {
      part.year += year;
    });
    scores.add(bottle(trial).wines[0].quality);
  }
  assert.ok(scores.size >= 4);
});

test('splitting bottlings does not multiply research rewards', () => {
  const original = blended();
  const all = bottle(original, 200);
  let split = bottle(original, 1);
  for (let i = 1; i < 200; i++) split = bottle(split, 1, 5, split.lines[0].id);
  assert.equal(split.knowledge, all.knowledge);
  assert.equal(split.kits, all.kits);
  assert.equal(split.stats.bottled, all.stats.bottled);
  valid(split);
});

test('v2 migration preserves old scores, labels, inventory and sold-out history', () => {
  const raw: any = cellar();
  raw.version = 2;
  raw.research = [];
  delete raw.lines;
  delete raw.reserves;
  raw.wines = [
    {
      id: 3,
      variety: 'pinot',
      year: 1,
      quality: 90,
      bottles: 80,
      price: 29,
      listed: true,
      label: 'Founders Cuvée',
    },
    {
      id: 4,
      variety: 'pinot',
      year: 2,
      quality: 94,
      bottles: 0,
      price: 31,
      listed: false,
      label: 'Founders Cuvée',
    },
  ];
  raw.nextId = 5;
  const s = deserialize(
    JSON.stringify({ game: 'terroir', savedAt: 'legacy', state: raw }),
  );
  assert.equal(s.version, 6);
  assert.deepEqual(s.batches, raw.batches);
  assert.equal(s.lines.length, 1);
  assert.deepEqual(
    s.wines.map((w) => [
      w.quality,
      w.bottles,
      w.price,
      w.label,
      w.listed,
      w.produced,
    ]),
    [
      [90, 80, 29, 'Founders Cuvée', true, null],
      [94, 0, 31, 'Founders Cuvée', false, null],
    ],
  );
  assert.deepEqual(
    s.wines.map((w) => w.release),
    [1, 2],
  );
  valid(s);
  let next = act(s, { type: 'reserve', id: 1 });
  next = bottle(next, 1, next.reserves[0].id, next.lines[0].id);
  assert.equal(next.wines[2].release, 3);
  valid(next);
});

test('save validation rejects corrupt recipes, volumes, line references and release numbers', () => {
  const s = bottle(blended());
  for (const corrupt of [
    (x: any) => (x.reserves[0].components[0].ml = -1),
    (x: any) => (x.reserves[0].components[0].variety = 'missing'),
    (x: any) => (x.reserves[0].components[0].year = 9999),
    (x: any) => (x.reserves[0].score = 101),
    (x: any) => (x.wines[0].lineId = 999),
    (x: any) => (x.wines[0].release = 2),
    (x: any) => (x.wines[0].produced = 99),
    (x: any) => (x.wines[0].salesSinceTracking = -1),
    (x: any) => (x.wines[0].salesSinceTracking = 1.5),
    (x: any) => (x.wines[0].salesSinceTracking = 1000001),
    (x: any) => x.wines[0].components[0].ml++,
    (x: any) => (x.wines[0].design.style = 'missing'),
    (x: any) => x.reserves.push({ ...x.reserves[0] }),
    (x: any) => x.wines.push({ ...x.wines[0], id: x.nextId++ }),
  ]) {
    const bad = structuredClone(s);
    corrupt(bad);
    assert.equal(stateSchema.safeParse(bad).success, false);
  }
});

test('large release histories stop safely before producing an unreadable save', () => {
  let s = newGame();
  // Isolate the save-size guard from the physical bottle-storage limit.
  s.bottleStorage.warehouse = 199;
  s.week = 1200;
  s.kits = 100000;
  s.lines = [{ id: 1, name: 'Century', founded: 1, design: DEFAULT_DESIGN }];
  s.reserves = [
    {
      id: 2,
      name: 'Century reserves',
      stored: 1200,
      score: null,
      components: Array.from({ length: 500 }, (_, i) => ({
        variety: ['merlot', 'cabernet', 'pinot', 'syrah', 'chardonnay'][i % 5],
        year: Math.floor(i / 5) + 1,
        quality: 80,
        ml: 200000,
      })),
    },
  ];
  s.nextId = 3;
  valid(s);
  let stopped = false;
  for (let i = 0; i < 100; i++) {
    const before = serialize(s);
    try {
      s = act(s, { type: 'bottle', id: 2, bottles: 1000, line: { id: 1 } });
    } catch (error) {
      assert.match(String(error), /archive capacity/);
      assert.deepEqual(deserialize(before), s);
      stopped = true;
      break;
    }
  }
  assert.equal(stopped, true);
  assert.ok(s.wines.length > 10);
  valid(s);
});
