import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  newGame,
  quality,
  serialize,
  deserialize,
  stateSchema,
  occupiedTankCount,
  harvestQuality,
} from '../src/game.ts';
import type { Action, GameState } from '../src/game.ts';
import { VARIETIES, REGION_IDS } from '../src/catalog.ts';
import {
  GRAPE_MATURATION,
  VESSEL_IDS,
  MATURATION_LIMIT,
  createMaturationProfile,
  resolveMaturation,
  maturationProfileSchema,
  maturationOutlook,
} from '../src/maturation.ts';
import type { MaturationVessel } from '../src/maturation.ts';
import {
  DEFAULT_DESIGN,
  combine,
  take,
  volume,
  assess,
  componentSchema,
  productionCost,
} from '../src/winemaking.ts';
import { tastingProfile, tastingNotesSchema } from '../src/wineSensory.ts';
import { learn } from './helpers.ts';

function tick(s: GameState, weeks = 1) {
  for (let i = 0; i < weeks; i++) s = act(s, { type: 'advance' });
  return s;
}
function ready(variety = 'merlot', kg = 140, oak = false) {
  let s = newGame('bordeaux', 'Test estate');
  s.cash = 100000;
  s.grapes.push({
    id: s.nextId++,
    variety,
    kg,
    quality: 80,
    picked: s.week,
    estateId: 1,
  });
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak });
  return tick(s, 2);
}
function aged(variety: string, vessel: MaturationVessel, weeks?: number) {
  let s = ready(variety);
  s = act(s, { type: 'age', id: s.batches[0].id, vessel });
  return tick(
    s,
    weeks ?? s.batches[0].maturationProfile!.routes[vessel].readyFrom,
  );
}
function reload(s: GameState) {
  const result = deserialize(serialize(s));
  assert.deepEqual(result, s);
  return result;
}

test('all 52 grapes have bounded maturation routes in all regions and complete cellar recipes', () => {
  assert.deepEqual(
    Object.keys(GRAPE_MATURATION).sort(),
    Object.keys(VARIETIES).sort(),
  );
  for (const region of REGION_IDS)
    for (const variety of Object.keys(VARIETIES)) {
      for (const techniques of [
        [],
        ['skin_contact', 'malolactic', 'lees_aging'],
      ] as const) {
        const p = createMaturationProfile(variety, [], region, 80, techniques);
        assert.ok(
          maturationProfileSchema.safeParse(p).success,
          `${region}: ${variety}`,
        );
        for (const vessel of VESSEL_IDS)
          for (let age = 0; age <= MATURATION_LIMIT; age++) {
            const result = maturationOutlook(p, vessel, age);
            assert.ok(Number.isFinite(result.adjustment));
            assert.ok(result.adjustment >= -8 && result.adjustment <= 6);
          }
      }
    }
});

test('every catalog grape completes fermentation, maturation, and bottling with valid saved tasting notes', () => {
  for (const variety of Object.keys(VARIETIES)) {
    for (const vessel of VESSEL_IDS) {
      let s = aged(variety, vessel, MATURATION_LIMIT);
      s = act(s, { type: 'reserve', id: s.batches[0].id });
      s = act(s, {
        type: 'bottle',
        id: s.reserves[0].id,
        bottles: 1,
        line: { name: 'Catalog coverage', design: DEFAULT_DESIGN },
      });
      assert.equal(s.wines[0].components[0].variety, variety);
      assert.equal(s.wines[0].components[0].maturation!.vessel, vessel);
      assert.ok(tastingNotesSchema.safeParse(s.wines[0].tasting).success);
      reload(s);
    }
  }
});

test('finished new batches wait for an explicit plan without aging or charging for a default vessel', () => {
  const s = ready('sagrantino');
  assert.equal(s.batches[0].stage, 'ready');
  assert.ok(s.pendingEvents > 0);
  assert.match(s.events[0].text, /Choose a maturation plan/);
  const waiting = tick(s, 4);
  assert.equal(waiting.batches[0].stage, 'ready');
  assert.equal(waiting.batches[0].age, 0);
  assert.equal(waiting.batches[0].maturationPlan, undefined);
  assert.equal(quality(waiting.batches[0]), quality(s.batches[0]));
});

test('maturation preserves picking records and charges barrel service to both estate and partial-release accounts', () => {
  for (const [vessel, perTank] of [
    ['steel', 0],
    ['neutral', 80],
    ['oak', 180],
  ] as const) {
    for (const autoTransfer of [false, true]) {
      let s = act(newGame(), { type: 'harvest', id: 1 });
      const harvest = structuredClone(s.grapes[0].harvest);
      assert.ok(harvest);
      s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: false });
      s = tick(s, 2);
      const batch = structuredClone(s.batches[0]);
      const charge = perTank * batch.tankIds.length;
      const operating = s.finance!.totals.operating;
      const investments = s.finance!.totals.investment;
      const cash = s.cash;
      s = act(s, {
        type: 'age',
        id: batch.id,
        vessel,
        targetWeeks: 3,
        autoTransfer,
      });
      assert.equal(s.cash, cash - charge);
      assert.equal(s.finance!.totals.operating, operating + charge * 100);
      assert.equal(s.finance!.totals.investment, investments);
      const expectedCost = batch.directCostCents! + charge * 100;
      assert.equal(s.batches[0].directCostCents, expectedCost);
      s = tick(s, 3);
      if (!autoTransfer) s = act(s, { type: 'reserve', id: batch.id });
      else assert.ok(s.events.some((e) => /moved into reserves/.test(e.text)));
      assert.equal(productionCost(s.reserves[0].components), expectedCost);
      assert.deepEqual(s.reserves[0].components[0].harvest, harvest);
      const id = s.reserves[0].id;
      s = act(s, {
        type: 'bottle',
        id,
        bottles: 1,
        line: { name: 'Tracked maturation', design: DEFAULT_DESIGN },
      });
      assert.equal(
        s.wines[0].accounts!.costCents! +
          productionCost(s.reserves[0].components)!,
        expectedCost,
      );
      assert.deepEqual(s.wines[0].components[0].harvest, harvest);
      assert.match(s.wines[0].tasting!.vintage!, /100% recorded harvest/);
      reload(s);
    }
  }
  const missingCosts = aged('merlot', 'oak');
  const stored = act(missingCosts, {
    type: 'reserve',
    id: missingCosts.batches[0].id,
  });
  assert.equal(productionCost(stored.reserves[0].components), null);
});

test('combining wine retains distinct picking and vessel histories while conserving all recorded costs', () => {
  const base = {
    variety: 'savagnin',
    year: 1,
    quality: 80,
    ml: 1000,
    directCostCents: 101,
    fermentation: 'steel' as const,
  };
  const parts = [80, 100].flatMap((ripeness) =>
    VESSEL_IDS.map((vessel) => ({
      ...base,
      harvest: { ripeness, health: 90, sunExposure: 0.5 },
      maturation: { version: 1 as const, vessel, weeks: 4, oakDominant: false },
    })),
  );
  const merged = combine([...parts, ...parts]);
  assert.equal(merged.length, 6);
  assert.equal(productionCost(merged), 1212);
  assert.equal(volume(merged), 12000);
  const reserve = {
    id: 1,
    name: 'Mixed histories',
    stored: 1,
    score: null,
    components: merged,
  };
  const drawn = take(reserve, 751);
  const restored = combine([...drawn, ...reserve.components]);
  assert.deepEqual(restored, merged);
});

test('Riesling prefers freshness, Chardonnay supports both styles, and Pinot tolerates measured oak', () => {
  assert.ok(
    quality(aged('riesling', 'steel').batches[0]) >
      quality(aged('riesling', 'oak').batches[0]),
  );
  assert.equal(
    quality(aged('chardonnay', 'steel').batches[0]),
    quality(aged('chardonnay', 'oak').batches[0]),
  );
  assert.equal(
    quality(aged('pinot', 'neutral').batches[0]),
    quality(aged('pinot', 'oak').batches[0]),
  );
  assert.ok(
    ready('nebbiolo').batches[0].maturationProfile!.routes.neutral.readyFrom >
      ready('riesling').batches[0].maturationProfile!.routes.steel.readyFrom,
  );
  const nebbiolo = aged('nebbiolo', 'neutral', 8);
  const stored = act(nebbiolo, { type: 'reserve', id: nebbiolo.batches[0].id });
  assert.ok(
    !tastingProfile(stored.reserves[0].components, stored).aromas.includes(
      'Vanilla',
    ),
  );
});

test('an exceptional fresh white can reach 90 in steel while poor fruit cannot be rescued by aging', () => {
  let s = newGame('mosel');
  s.cash = 100000;
  s.plots[0].health = s.plots[0].growth = 100;
  s.upgrades = ['lab'];
  const fruit = harvestQuality(s, s.plots[0]);
  s = act(s, { type: 'harvest', id: 1 });
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: false });
  s = tick(s, 2);
  s = act(s, { type: 'age', id: s.batches[0].id, vessel: 'steel' });
  s = tick(s, s.batches[0].maturationProfile!.routes.steel.readyFrom);
  s = act(s, { type: 'reserve', id: s.batches[0].id });
  const scores = Array.from(
    { length: 12 },
    (_, seed) =>
      act(
        { ...s, seed: (seed + 1) * 1000 },
        {
          type: 'bottle',
          id: s.reserves[0].id,
          bottles: 1,
          line: { name: 'Steel Riesling', design: DEFAULT_DESIGN },
        },
      ).wines[0].quality,
  );
  assert.ok(
    Math.max(...scores) >= 90,
    `Fruit ${fruit}, tasting scores ${scores.join(', ')}`,
  );
  const poor = ready('cabernet');
  poor.batches[0].quality = 45;
  for (const vessel of VESSEL_IDS) {
    const started = act(poor, { type: 'age', id: poor.batches[0].id, vessel });
    assert.ok(quality(tick(started, 8).batches[0]) <= 51);
  }
});

test('waiting plateaus in steel and neutral oak, while excessive French oak lowers balance even for Cabernet', () => {
  for (const vessel of ['steel', 'neutral'] as const) {
    const s = aged('cabernet', vessel);
    assert.equal(quality(tick(s, 12).batches[0]), quality(s.batches[0]));
  }
  const s = aged('cabernet', 'oak');
  const over = tick(s, 12);
  assert.equal(over.batches[0].age, MATURATION_LIMIT);
  assert.ok(quality(over.batches[0]) < quality(s.batches[0]));
  assert.equal(quality(tick(over, 3).batches[0]), quality(over.batches[0]));
  const stored = act(over, { type: 'reserve', id: over.batches[0].id });
  assert.match(
    tastingProfile(stored.reserves[0].components, stored).palate,
    /Oak dominates/,
  );
});

test('maturation charges once for all assigned tanks, rejects invalid plans atomically, and cannot start during fermentation', () => {
  const s = ready('merlot', 360);
  assert.equal(s.batches[0].tankIds.length, 2);
  const neutral = act(s, {
    type: 'age',
    id: s.batches[0].id,
    vessel: 'neutral',
    targetWeeks: 3,
  });
  assert.equal(neutral.cash, s.cash - 160);
  assert.equal(occupiedTankCount(neutral), 2);
  assert.equal(
    act(s, { type: 'age', id: s.batches[0].id, vessel: 'steel' }).cash,
    s.cash,
  );
  assert.equal(
    act(s, { type: 'age', id: s.batches[0].id, vessel: 'oak' }).cash,
    s.cash - 360,
  );
  assert.throws(
    () =>
      act(neutral, { type: 'age', id: neutral.batches[0].id, vessel: 'oak' }),
    /finished/,
  );
  for (const args of [
    { vessel: 'plastic' },
    { targetWeeks: 0 },
    { targetWeeks: 1.5 },
    { targetWeeks: 13 },
    { targetWeeks: NaN },
    { autoTransfer: 'yes' },
  ]) {
    const original = structuredClone(s);
    assert.throws(
      () => act(s, { type: 'age', id: s.batches[0].id, ...args } as Action),
      /Choose a vessel/,
    );
    assert.deepEqual(s, original);
  }
  const poor = { ...s, cash: 159 };
  assert.throws(
    () => act(poor, { type: 'age', id: s.batches[0].id, vessel: 'neutral' }),
    /need.*more/i,
  );
  assert.equal(poor.cash, 159);
  const fermenting = structuredClone(s);
  fermenting.batches[0].stage = 'fermenting';
  fermenting.batches[0].remaining = 1;
  assert.throws(
    () => act(fermenting, { type: 'age', id: s.batches[0].id }),
    /finished/,
  );
});

test('automatic transfer happens exactly on schedule, frees every tank, and preserves the whole wine', () => {
  let s = ready('merlot', 360);
  const batch = s.batches[0];
  s = act(s, {
    type: 'age',
    id: batch.id,
    vessel: 'neutral',
    targetWeeks: 3,
    autoTransfer: true,
  });
  s = reload(tick(s, 2));
  assert.equal(s.reserves.length, 0);
  assert.equal(occupiedTankCount(s), 2);
  const expectedQuality = quality({ ...s.batches[0], age: 3 });
  s = reload(tick(s));
  assert.equal(s.batches.length, 0);
  assert.equal(occupiedTankCount(s), 0);
  assert.equal(volume(s.reserves[0].components), batch.liters * 1000);
  assert.equal(s.reserves[0].components[0].quality, expectedQuality);
  assert.deepEqual(s.reserves[0].components[0].maturation, {
    version: 1,
    vessel: 'neutral',
    weeks: 3,
    oakDominant: false,
  });
  const frozen = structuredClone(s.reserves[0]);
  assert.deepEqual(tick(s, 12).reserves[0], frozen);
});

test('full reserves stop a scheduled transfer without losing wine or repeatedly warning; manual recovery works', () => {
  let s = ready('merlot');
  s.reserves = Array.from({ length: 256 }, () => ({
    id: s.nextId++,
    name: 'Stored wine',
    stored: s.week,
    score: null,
    components: [{ variety: 'merlot', year: 1, quality: 70, ml: 1000 }],
  }));
  s = act(s, {
    type: 'age',
    id: s.batches[0].id,
    vessel: 'neutral',
    targetWeeks: 1,
    autoTransfer: true,
  });
  s = reload(tick(s));
  assert.equal(s.reserves.length, 256);
  assert.equal(s.batches[0].liters, 98);
  assert.equal(s.batches[0].maturationPlan!.autoTransfer, false);
  assert.equal(occupiedTankCount(s), 1);
  s = tick(s);
  assert.equal(s.batches[0].age, 2);
  // Free a real slot by bottling its whole contents, then move the waiting batch.
  const r = s.reserves[0];
  r.components[0].ml = 750;
  s = act(s, {
    type: 'bottle',
    id: r.id,
    bottles: 1,
    line: { name: 'Release', design: DEFAULT_DESIGN },
  });
  s = act(s, { type: 'reserve', id: s.batches[0].id });
  assert.equal(s.reserves.length, 256);
  assert.equal(s.batches.length, 0);
  reload(s);
});

test('simultaneous scheduled transfers use the last free reserve space without skipping or losing a batch', () => {
  let s = ready('merlot');
  s.grapes.push({
    id: s.nextId++,
    variety: 'riesling',
    kg: 140,
    quality: 80,
    picked: s.week,
  });
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: false });
  s = tick(s, 2);
  for (const b of s.batches)
    s = act(s, {
      type: 'age',
      id: b.id,
      vessel: 'steel',
      targetWeeks: 1,
      autoTransfer: true,
    });
  s.reserves = Array.from({ length: 255 }, () => ({
    id: s.nextId++,
    name: 'Stored wine',
    stored: s.week,
    score: null,
    components: [{ variety: 'merlot', year: 1, quality: 70, ml: 750 }],
  }));
  s = reload(tick(s));
  assert.equal(s.reserves.length, 256);
  assert.equal(s.batches.length, 1);
  assert.equal(s.batches[0].variety, 'riesling');
  assert.equal(s.batches[0].maturationPlan!.autoTransfer, false);
  assert.equal(
    s.reserves.at(-1)!.components[0].ml + s.batches[0].liters * 1000,
    196000,
  );
});

test('techniques adjust readiness without counting processing weeks as maturation or awarding extra quality', () => {
  const untreated = createMaturationProfile('sauvignon', [], 'bordeaux', 80);
  const lees = createMaturationProfile('sauvignon', [], 'bordeaux', 80, [
    'lees_aging',
  ]);
  assert.ok(lees.routes.neutral.readyFrom < untreated.routes.neutral.readyFrom);
  assert.equal(lees.routes.neutral.maxGain, untreated.routes.neutral.maxGain);
  let s = learn(newGame(), 'lees_aging');
  s.cash = 100000;
  s.grapes.push({
    id: s.nextId++,
    variety: 'sauvignon',
    kg: 140,
    quality: 80,
    picked: s.week,
  });
  s = act(s, {
    type: 'ferment',
    id: s.grapes[0].id,
    oak: false,
    techniques: ['lees_aging'],
  });
  s = tick(s, 5);
  assert.equal(s.batches[0].age, 0);
  assert.equal(quality(s.batches[0]), 80);
  s = act(s, { type: 'age', id: s.batches[0].id, vessel: 'neutral' });
  s = tick(s);
  assert.equal(s.batches[0].age, 1);
  reload(s);
});

test('multi-generation crosses inherit numeric tendencies symmetrically and save an independent profile', () => {
  const hybrids = [
    { id: 'cross-1', parents: ['riesling', 'cabernet'] as [string, string] },
    { id: 'cross-2', parents: ['cross-1', 'riesling'] as [string, string] },
  ];
  const r = resolveMaturation('cross-2', hybrids);
  for (const key of [
    'steelWeeks',
    'woodWeeks',
    'steelGain',
    'oakGain',
    'oakLimit',
  ] as const)
    assert.equal(
      r[key],
      GRAPE_MATURATION.riesling[key] * 0.75 +
        GRAPE_MATURATION.cabernet[key] * 0.25,
    );
  assert.deepEqual(
    r,
    resolveMaturation(
      'cross-2',
      hybrids.map((h) => ({
        ...h,
        parents: [...h.parents].reverse() as [string, string],
      })),
    ),
  );
  assert.throws(() => resolveMaturation('missing'), /Missing/);
  const s = aged('chardonnay', 'neutral');
  const profile = structuredClone(s.batches[0].maturationProfile);
  const score = quality(s.batches[0]);
  s.estates[0].region = 'barossa';
  assert.deepEqual(s.batches[0].maturationProfile, profile);
  assert.equal(quality(s.batches[0]), score);
});

test('fermentation is independent of maturation and zero maturation never invents wood exposure', () => {
  for (const oak of [false, true]) {
    let s = ready('chardonnay', 140, oak);
    s = act(s, { type: 'reserve', id: s.batches[0].id });
    const part = s.reserves[0].components[0];
    assert.equal(part.fermentation, oak ? 'oak' : 'steel');
    assert.equal(part.maturation!.vessel, 'steel');
    assert.equal(part.maturation!.weeks, 0);
    const notes = tastingProfile([part], s);
    assert.equal(notes.aromas.includes('Vanilla'), oak);
    assert.match(
      notes.fermentation![0],
      oak ? /French oak/ : /stainless steel/,
    );
    assert.ok(!notes.palate.includes('butter'));
  }
});

test('mixed vessels plus legacy history survive partial bottling, reblending and reload without stacked rewards', () => {
  let s = learn(newGame(), 'oenology');
  const parts = VESSEL_IDS.map((vessel) => {
    let source = aged('merlot', vessel, 3);
    source = act(source, { type: 'reserve', id: source.batches[0].id });
    return { ...source.reserves[0].components[0], ml: 1001 };
  });
  const legacy = { variety: 'merlot', year: 1, quality: 75, ml: 1001 };
  s.reserves = [
    {
      id: s.nextId++,
      name: 'All vessels',
      stored: s.week,
      score: null,
      components: combine([...parts, legacy]),
    },
  ];
  const notes = tastingProfile(s.reserves[0].components, s);
  assert.equal(notes.aging.length, 4);
  assert.ok(tastingNotesSchema.safeParse(notes).success);
  assert.equal(notes.fermentation!.length, 2);
  const original = structuredClone(s.reserves[0].components);
  const drawn = take(s.reserves[0], 750);
  const rebuilt = combine([...drawn, ...s.reserves[0].components]);
  assert.deepEqual(rebuilt, original);
  assert.deepEqual(assess(rebuilt), assess(original));
  s.reserves[0].components = rebuilt;
  const snapshot = tastingProfile(drawn, s);
  s = act(s, {
    type: 'bottle',
    id: s.reserves[0].id,
    bottles: 1,
    line: { name: 'Mixed', design: DEFAULT_DESIGN },
  });
  assert.deepEqual(s.wines[0].tasting, snapshot);
  assert.equal(
    volume(s.wines[0].components) + volume(s.reserves[0].components),
    4004,
  );
  const bottled = structuredClone(s.wines[0]);
  s = reload(tick(s, 12));
  assert.deepEqual(s.wines[0], bottled);
});

test('new and legacy histories are not collapsed and save validation rejects inconsistent aging state', () => {
  const old = {
    variety: 'merlot',
    year: 1,
    quality: 80,
    ml: 750,
    maturation: { vessel: 'oak' as const, weeks: 2 },
  };
  const modern = {
    ...old,
    fermentation: 'steel' as const,
    maturation: {
      version: 1 as const,
      vessel: 'oak' as const,
      weeks: 2,
      oakDominant: false,
    },
  };
  assert.equal(combine([old, modern]).length, 2);
  assert.equal(
    componentSchema.safeParse({
      ...old,
      maturation: { vessel: 'oak', weeks: 12 },
    }).success,
    false,
  );
  assert.equal(
    componentSchema.safeParse({
      ...modern,
      maturation: { ...modern.maturation, weeks: 12 },
    }).success,
    true,
  );
  const s = aged('merlot', 'neutral');
  reload(s);
  for (const mutate of [
    (b: GameState['batches'][number]) => {
      delete b.maturationProfile;
    },
    (b: GameState['batches'][number]) => {
      delete b.maturationPlan;
    },
    (b: GameState['batches'][number]) => {
      b.agingProfile = 'balanced';
    },
    (b: GameState['batches'][number]) => {
      b.stage = 'ready';
    },
    (b: GameState['batches'][number]) => {
      b.age = 13;
    },
    (b: GameState['batches'][number]) => {
      b.maturationProfile!.routes.steel.readyFrom = 12;
    },
  ]) {
    const malformed = structuredClone(s);
    mutate(malformed.batches[0]);
    assert.equal(stateSchema.safeParse(malformed).success, false);
  }
});
