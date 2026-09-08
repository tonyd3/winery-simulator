import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  demand,
  deserialize,
  fairPrice,
  newGame,
  serialize,
  stateSchema,
  upkeep,
  wholesalePrice,
  wineSales,
} from '../src/game.ts';
import type { GameState } from '../src/game.ts';
import { JUDGING, MARKETING, wineAward } from '../src/promotion.ts';
import { DEFAULT_DESIGN } from '../src/winemaking.ts';

function bottled(quality = 96) {
  let s = newGame();
  s.week = 8;
  s.batches = [
    {
      id: 1,
      variety: 'merlot',
      liters: 300,
      quality,
      stage: 'ready',
      remaining: 0,
      age: 0,
      oak: false,
      year: 1,
    },
  ];
  s.nextId = 2;
  s = act(s, { type: 'reserve', id: 1 });
  s.reserves[0].score = quality;
  return act(s, {
    type: 'bottle',
    id: 2,
    bottles: 200,
    line: { name: 'The Gathering', design: DEFAULT_DESIGN },
  });
}
const listed = (s = bottled()) => act(s, { type: 'list', id: s.wines[0].id });
const tick = (s: GameState) => act(s, { type: 'advance' });
const valid = (s: GameState) => assert.deepEqual(deserialize(serialize(s)), s);

test('marketing charges once, boosts retail only, and leaves production and shelf price intact', () => {
  const before = listed(),
    wine = before.wines[0];
  const s = act(before, { type: 'marketWine', id: wine.id });
  assert.equal(s.cash, before.cash - MARKETING.cost);
  assert.equal(s.ledger[0].amount, -MARKETING.cost);
  assert.deepEqual(s.stats, before.stats);
  assert.equal(s.seed, before.seed);
  assert.equal(s.wines[0].price, wine.price);
  assert.equal(s.wines[0].quality, wine.quality);
  assert.equal(s.wines[0].bottles, wine.bottles);
  assert.equal(
    fairPrice(s.wines[0], s.reputation),
    fairPrice(wine, s.reputation) + 2,
  );
  assert.ok(demand(s.wines[0], s) > demand(wine, before));
  assert.equal(
    wholesalePrice(s.wines[0], s.reputation),
    wholesalePrice(wine, s.reputation),
  );
  assert.equal(before.wines[0].marketingWeeks, 0);
  valid(s);
});

test('campaign boosts exactly four sales weeks, survives reload, expires, and can be renewed', () => {
  let s = listed();
  s = act(s, { type: 'marketWine', id: s.wines[0].id });
  s = act(s, {
    type: 'price',
    id: s.wines[0].id,
    price: fairPrice(s.wines[0], s.reputation),
  });
  for (let week = 1; week <= MARKETING.weeks; week++) {
    const before = s,
      expected = demand(s.wines[0], s);
    s = tick(deserialize(serialize(s)));
    assert.equal(s.wines[0].bottles, before.wines[0].bottles - expected);
    assert.equal(
      s.cash,
      before.cash + expected * before.wines[0].price - upkeep(before),
    );
    assert.equal(s.wines[0].marketingWeeks, MARKETING.weeks - week);
  }
  assert.ok(s.wines[0].bottles > 0);
  assert.equal(
    fairPrice(s.wines[0], s.reputation),
    fairPrice({ quality: s.wines[0].quality }, s.reputation),
  );
  assert.match(s.log.map((e) => e.text).join('\n'), /campaign has ended/);
  const funds = s.cash;
  s = act(s, { type: 'marketWine', id: s.wines[0].id });
  assert.equal(s.cash, funds - MARKETING.cost);
  assert.equal(s.wines[0].marketingWeeks, 4);
  valid(s);
});

test('paid outreach rejects unavailable, duplicate, unlisted marketing and unaffordable actions immutably', () => {
  const original = bottled(),
    id = original.wines[0].id;
  assert.throws(
    () => act(original, { type: 'marketWine', id }),
    /List this wine/,
  );
  for (const type of ['marketWine', 'judgeWine'] as const) {
    assert.throws(() => act(original, { type, id: 999 }), /not found/);
    const poor = listed(original);
    poor.cash = 1;
    const copy = structuredClone(poor);
    assert.throws(() => act(poor, { type, id }), /Need/);
    assert.deepEqual(poor, copy);
    const started = act(listed(original), { type, id });
    const startedCopy = structuredClone(started);
    assert.throws(() => act(started, { type, id }));
    assert.deepEqual(started, startedCopy);
    const sold = act(original, { type: 'wholesale', id });
    assert.throws(() => act(sold, { type, id }), /sold out/);
  }
});

test('judging resolves after two weeks with one saved result and an independent permanent medal', () => {
  const before = bottled(),
    id = before.wines[0].id;
  let s = act(before, { type: 'judgeWine', id });
  assert.equal(s.cash, before.cash - JUDGING.cost);
  assert.equal(s.wines[0].judging!.remaining, 2);
  assert.deepEqual(
    act(deserialize(serialize(before)), { type: 'judgeWine', id }),
    s,
  );
  const score = s.wines[0].judging!.score;
  assert.ok(score >= 91 && score <= 100);
  assert.equal(wineAward(s.wines[0]), null);
  assert.equal(
    fairPrice(s.wines[0], s.reputation),
    fairPrice(before.wines[0], s.reputation),
  );
  s = tick(deserialize(serialize(s)));
  assert.equal(s.wines[0].judging!.remaining, 1);
  assert.equal(wineAward(s.wines[0]), null);
  s = tick(deserialize(serialize(s)));
  assert.equal(wineAward(s.wines[0])!.name, 'Gold');
  assert.equal(s.wines[0].judging!.score, score);
  assert.equal(s.wines[0].quality, before.wines[0].quality);
  assert.equal(s.wines[0].bottles, 200);
  assert.deepEqual(s.stats, before.stats);
  assert.equal(
    fairPrice(s.wines[0], s.reputation),
    fairPrice(before.wines[0], s.reputation) + 6,
  );
  assert.ok(
    wholesalePrice(s.wines[0], s.reputation) >
      wholesalePrice(before.wines[0], s.reputation),
  );
  for (let i = 0; i < 8; i++) s = tick(s);
  assert.equal(wineAward(s.wines[0])!.name, 'Gold');
  assert.throws(() => act(s, { type: 'judgeWine', id }), /only once/);
  const wholesaleFunds = s.cash;
  const wholesaleRevenue =
    s.wines[0].bottles * wholesalePrice(s.wines[0], s.reputation);
  s = act(s, { type: 'wholesale', id });
  assert.equal(s.cash, wholesaleFunds + wholesaleRevenue);
  assert.equal(s.stats.sold, 200);
  assert.equal(s.wines[0].judging!.score, score);
  assert.equal(wineAward(s.wines[0])!.name, 'Gold');
  valid(s);
});

test('an unsuccessful judging entry remains in sold-out history without inflating sales or quality', () => {
  let s = bottled(60);
  const id = s.wines[0].id;
  s = act(s, { type: 'judgeWine', id });
  s = act(s, { type: 'wholesale', id });
  s = tick(tick(s));
  assert.equal(s.wines.length, 1);
  assert.equal(s.wines[0].judging!.remaining, 0);
  assert.equal(wineAward(s.wines[0]), null);
  assert.equal(s.wines[0].quality, 60);
  assert.equal(s.stats.sold, 200);
  assert.deepEqual(wineSales(s.wines), { count: 200, complete: true });
  assert.equal(
    fairPrice(s.wines[0], s.reputation),
    fairPrice({ quality: 60 }, s.reputation),
  );
  assert.match(s.log.map((e) => e.text).join('\n'), /without a medal/);
  assert.throws(() => act(s, { type: 'judgeWine', id }), /only once/);
  valid(s);
});

test('medal thresholds and combined boosts apply to each release without compounding multipliers', () => {
  const s = listed(),
    w = s.wines[0];
  for (const [score, name, bonus] of [
    [79, null, 0],
    [80, 'Bronze', 2],
    [84, 'Bronze', 2],
    [85, 'Silver', 4],
    [89, 'Silver', 4],
    [90, 'Gold', 6],
    [100, 'Gold', 6],
  ] as const) {
    const judged = { ...w, judging: { score, remaining: 0 } };
    assert.equal(wineAward(judged)?.name ?? null, name);
    assert.equal(
      fairPrice(judged, s.reputation),
      fairPrice(w, s.reputation) + bonus,
    );
  }
  const combined = {
    ...w,
    judging: { score: 90, remaining: 0 },
    marketingWeeks: 4,
  };
  combined.price = fairPrice(combined, s.reputation);
  assert.equal(combined.price, fairPrice(w, s.reputation) + 8);
  assert.equal(
    demand(combined, s),
    Math.floor((18 + s.reputation * 0.55) * 1.7),
  );
  assert.equal(demand({ ...combined, listed: false }, s), 0);
  assert.equal(demand({ ...combined, bottles: 1 }, s), 1);
});

test('pausing listings and selling out do not freeze campaign time or carry bonuses into a new release', () => {
  let s = listed();
  const id = s.wines[0].id;
  s = act(s, { type: 'marketWine', id });
  s = act(s, { type: 'judgeWine', id });
  s = act(s, { type: 'list', id });
  s = tick(s);
  assert.equal(s.wines[0].bottles, 200);
  assert.equal(s.wines[0].marketingWeeks, 3);
  s = act(s, { type: 'wholesale', id });
  s = tick(tick(tick(s)));
  assert.equal(s.wines[0].marketingWeeks, 0);
  assert.equal(wineAward(s.wines[0])!.name, 'Gold');
  s = act(s, {
    type: 'bottle',
    id: 2,
    bottles: 200,
    line: { id: s.lines[0].id },
  });
  assert.equal(s.wines[1].marketingWeeks, 0);
  assert.equal(s.wines[1].judging, null);
  assert.equal(s.wines[1].release, 2);
  assert.equal(s.stats.sold, 200);
  valid(s);
});

test('older saves retain prices, cash and sales while malformed outreach state is rejected', () => {
  const original = listed();
  const raw = JSON.parse(serialize(original));
  delete raw.state.wines[0].marketingWeeks;
  delete raw.state.wines[0].judging;
  assert.deepEqual(deserialize(JSON.stringify(raw)), original);
  for (const change of [
    (s: any) => (s.wines[0].marketingWeeks = -1),
    (s: any) => (s.wines[0].marketingWeeks = 5),
    (s: any) => (s.wines[0].marketingWeeks = 0.5),
    (s: any) => (s.wines[0].judging = { score: 101, remaining: 1 }),
    (s: any) => (s.wines[0].judging = { score: 90, remaining: 3 }),
    (s: any) => (s.wines[0].judging = { score: 90.5, remaining: 0 }),
    (s: any) => (s.wines[0].judging = { score: 90, remaining: -1 }),
    (s: any) => (s.wines[0].judging = { score: 90, remaining: 0, bonus: 100 }),
  ]) {
    const bad = structuredClone(original);
    change(bad);
    assert.equal(stateSchema.safeParse(bad).success, false);
  }
});
