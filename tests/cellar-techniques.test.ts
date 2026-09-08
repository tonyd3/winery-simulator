import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  newGame,
  fermentationPlan,
  serialize,
  deserialize,
  stateSchema,
  quality,
} from '../src/game.ts';
import type { Action, GameState } from '../src/game.ts';
import {
  CELLAR_TECHNIQUE_IDS,
  vinificationStage,
  vinificationWeeks,
} from '../src/cellarTechniques.ts';
import type { CellarTechnique } from '../src/cellarTechniques.ts';
import { RESEARCH } from '../src/catalog.ts';
import {
  combine,
  portion,
  take,
  assess,
  DEFAULT_DESIGN,
  componentSchema,
} from '../src/winemaking.ts';
import type { WineComponent } from '../src/winemaking.ts';
import { tastingProfile, releaseTasting } from '../src/wineSensory.ts';
import { learn } from './helpers.ts';

const all = [...CELLAR_TECHNIQUE_IDS];
function grapes() {
  const s = { ...newGame(), cash: 100000, knowledge: 1000 };
  s.grapes = [
    {
      id: s.nextId++,
      variety: 'sauvignon',
      kg: 538,
      quality: 78,
      picked: s.week,
      estateId: 1,
    },
  ];
  return s;
}
const tick = (s: GameState, weeks = 1) => {
  for (let i = 0; i < weeks; i++) s = act(s, { type: 'advance' });
  return s;
};
const reload = (s: GameState) => {
  const loaded = deserialize(serialize(s));
  assert.deepEqual(loaded, s);
  return loaded;
};
const start = (s: GameState, techniques: CellarTechnique[] = all) =>
  act(s, { type: 'ferment', id: s.grapes[0].id, oak: false, techniques });

test('each cellar technique requires its completed research, including paid studies still in progress', () => {
  for (const id of all) {
    let s = grapes();
    assert.throws(
      () => act(s, { type: 'research', id }),
      /Requires Cellar foundations/,
    );
    learn(s, 'oenology');
    const before = structuredClone(s);
    assert.throws(() => start(s, [id]), /Research/);
    assert.deepEqual(s, before);
    s = act(s, { type: 'research', id });
    assert.equal(s.cash, before.cash - RESEARCH[id].cost);
    assert.equal(s.knowledge, before.knowledge - RESEARCH[id].knowledge);
    assert.throws(() => start(s, [id]), /Research/);
    s = tick(s, RESEARCH[id].weeks);
    assert.ok(s.research.includes(id));
    // A new harvest after study completion, since the original grapes expired.
    s.grapes = [{ ...before.grapes[0], picked: s.week }];
    assert.deepEqual(reload(start(s, [id])).batches[0].techniques, [id]);
  }
});

test('all eight recipes have consistent prices and ordered phases, with early storage and aging blocked', () => {
  for (let mask = 0; mask < 8; mask++) {
    const techniques = all.filter((_, i) => mask & (1 << i));
    let s = learn(grapes(), ...all);
    const original = structuredClone(s);
    const plan = fermentationPlan(s, 538, false, techniques);
    assert.equal(
      plan.cost,
      280 + (mask & 1 ? 80 : 0) + (mask & 2 ? 120 : 0) + (mask & 4 ? 100 : 0),
    );
    assert.equal(
      fermentationPlan(s, 538, true, techniques).cost,
      plan.cost + 360,
    );
    s = start(s, [...techniques].reverse());
    assert.equal(s.cash, original.cash - plan.cost);
    assert.equal(s.batches[0].liters, 300);
    assert.equal(s.grapes[0].kg, 109);
    assert.equal(s.grapes[0].picked, original.grapes[0].picked);
    assert.equal(s.grapes[0].quality, original.grapes[0].quality);
    assert.deepEqual(s.batches[0].techniques, techniques);
    assert.equal(s.batches[0].remaining, plan.weeks);
    const phases = [
      'Fermenting',
      'Fermenting',
      ...(mask & 1 ? ['Skin contact'] : []),
      ...(mask & 2
        ? ['Malolactic fermentation', 'Malolactic fermentation']
        : []),
      ...(mask & 4 ? ['Lees aging', 'Lees aging', 'Lees aging'] : []),
    ];
    for (const phase of phases) {
      s = reload(s);
      const b = s.batches[0];
      assert.equal(vinificationStage(b), phase);
      assert.equal(quality(b), 78);
      assert.throws(() => act(s, { type: 'reserve', id: b.id }), /finish/);
      assert.throws(() => act(s, { type: 'age', id: b.id }), /finished/);
      s = tick(s);
    }
    assert.equal(s.batches[0].stage, 'ready');
    assert.equal(s.batches[0].age, 0);
    assert.equal(s.batches[0].remaining, 0);
    assert.equal(vinificationStage(s.batches[0]), 'Ready for reserves');
    s = act(s, { type: 'reserve', id: s.batches[0].id });
    assert.deepEqual(s.reserves[0].components[0].techniques, techniques);
    assert.equal(s.reserves[0].components[0].quality, 78);
    reload(s);
  }
});

test('recipe validation and affordability reject atomically; old batches preserve their timing', () => {
  const s = learn(grapes(), ...all);
  for (const techniques of [['skin_contact', 'skin_contact'], ['fake']]) {
    const before = structuredClone(s);
    assert.throws(
      () =>
        act(s, {
          type: 'ferment',
          id: s.grapes[0].id,
          oak: false,
          techniques,
        } as Action),
      /valid cellar techniques/,
    );
    assert.deepEqual(s, before);
  }
  const poor = { ...s, cash: 579 };
  assert.throws(() => start(poor), /need.*more/i);
  assert.equal(poor.grapes[0].kg, 538);
  assert.equal(poor.batches.length, 0);
  assert.equal(start({ ...s, cash: 580 }).cash, 0);
  const active = start(s);
  for (const techniques of [['fake'], ['skin_contact', 'skin_contact'], []]) {
    const bad = structuredClone(active);
    (bad.batches[0] as unknown as { techniques: string[] }).techniques =
      techniques;
    assert.equal(stateSchema.safeParse(bad).success, false);
  }
  let legacy = start(s, []);
  delete legacy.batches[0].techniques;
  legacy.batches[0].remaining = 3;
  legacy = tick(reload(legacy), 3);
  assert.equal(legacy.batches[0].stage, 'ready');
  legacy = act(legacy, { type: 'reserve', id: legacy.batches[0].id });
  assert.equal(legacy.reserves[0].components[0].techniques, undefined);
  reload(legacy);
});

test('techniques alter style in proportion to their wine without compounding quality or losing treatment history', () => {
  const s = newGame();
  const base: WineComponent = {
    variety: 'sauvignon',
    year: 1,
    ml: 100000,
    quality: 78,
    maturation: { vessel: 'steel', weeks: 0 },
    techniques: [],
  };
  const profile = (techniques: CellarTechnique[]) =>
    tastingProfile([{ ...base, techniques }], s);
  assert.match(
    profile([]).palate,
    /Light-bodied.*bright acidity.*little tannin/,
  );
  assert.match(profile(['skin_contact']).palate, /delicate tannins/);
  assert.match(profile(['malolactic']).palate, /fresh acidity/);
  assert.match(profile(['lees_aging']).palate, /Medium-bodied/);
  assert.ok(profile(['lees_aging']).aromas.includes('Bread dough'));
  const treated = { ...base, techniques: all };
  const mixed = combine([
    base,
    treated,
    { ...treated, techniques: [...all].reverse() },
  ]);
  assert.equal(mixed.length, 2);
  assert.equal(assess(mixed).base, 78);
  const notes = tastingProfile(mixed, s);
  assert.equal(notes.techniques?.length, 3);
  assert.ok(notes.techniques?.every((t) => t.includes('67%')));
  assert.equal(
    tastingProfile(
      [
        { ...base, ml: 99999 },
        { ...treated, ml: 1 },
      ],
      s,
    ).palate,
    profile([]).palate,
  );
  assert.deepEqual(
    tastingProfile(
      [
        { ...base, ml: 99999 },
        { ...treated, ml: 1 },
      ],
      s,
    ).aromas,
    profile([]).aromas,
  );
  assert.deepEqual(
    portion(mixed, 150000).map((p) => p.techniques),
    mixed.map((p) => p.techniques),
  );
  const reserve = {
    id: 1,
    name: 'Mixed',
    components: mixed,
    stored: 1,
    score: null,
  };
  const removed = take(reserve, 750);
  assert.deepEqual(
    removed.map((p) => p.techniques),
    reserve.components.map((p) => p.techniques),
  );
  assert.equal(
    componentSchema.safeParse({ ...base, techniques: ['unknown'] }).success,
    false,
  );
});

test('reserve blending, partial bottling and reload retain techniques and a stable release tasting snapshot', () => {
  let s = tick(start(learn(grapes(), ...all)), vinificationWeeks(all));
  s = act(s, { type: 'age', id: s.batches[0].id });
  s = tick(s, 2);
  s = act(s, { type: 'reserve', id: s.batches[0].id });
  const reference = structuredClone(s.reserves[0]);
  reference.id = s.nextId++;
  reference.components[0].techniques = [];
  s.reserves.push(reference);
  s = act(s, {
    type: 'blend',
    name: 'Two styles',
    portions: s.reserves.map((r) => ({ id: r.id, ml: 150000 })),
  });
  const reserve = s.reserves.at(-1)!;
  assert.equal(reserve.components.length, 2);
  const forecast = tastingProfile(reserve.components, s);
  assert.ok(forecast.techniques?.every((t) => t.includes('50%')));
  s = act(s, {
    type: 'bottle',
    id: reserve.id,
    bottles: 100,
    line: { name: 'Technique release', design: DEFAULT_DESIGN },
  });
  s = reload(s);
  assert.deepEqual(s.wines[0].tasting, forecast);
  assert.equal(s.wines[0].components.length, 2);
  assert.equal(s.reserves.at(-1)!.components.length, 2);
  const snapshot = structuredClone(s.wines[0].tasting);
  s = tick(s, 3);
  assert.deepEqual(releaseTasting(s.wines[0], s), snapshot);
});
