import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  newGame,
  serialize,
  deserialize,
  stateSchema,
} from '../src/game.ts';
import type { GameState } from '../src/game.ts';
import { VARIETIES, REGION_IDS } from '../src/catalog.ts';
import {
  combine,
  portion,
  take,
  volume,
  assess,
  componentSchema,
  DEFAULT_DESIGN,
} from '../src/winemaking.ts';
import type { WineComponent, Reserve } from '../src/winemaking.ts';
import {
  GRAPE_CHARACTERS,
  tastingProfile,
  releaseTasting,
  tastingNotesSchema,
} from '../src/wineSensory.ts';
import { learn } from './helpers.ts';

const part = (
  variety = 'pinot',
  ml = 10000,
  maturation?: WineComponent['maturation'],
): WineComponent => ({
  variety,
  ml,
  year: 1,
  quality: 75,
  ...(maturation ? { maturation } : {}),
});
const steel = { vessel: 'steel', weeks: 4 } as const;
const oak = { vessel: 'oak', weeks: 4 } as const;
const reload = (s: GameState) => {
  const loaded = deserialize(serialize(s));
  assert.deepEqual(loaded, s);
  return loaded;
};

test('every catalog grape has a usable sensory profile in every playable region', () => {
  assert.deepEqual(
    Object.keys(GRAPE_CHARACTERS).sort(),
    Object.keys(VARIETIES).sort(),
  );
  for (const region of REGION_IDS) {
    for (const variety of Object.keys(VARIETIES)) {
      const profile = tastingProfile(
        [part(variety, 10000, steel)],
        newGame(region),
      );
      assert.ok(
        tastingNotesSchema.safeParse(profile).success,
        `${region}: ${variety}`,
      );
      assert.ok(profile.aromas.length >= 3);
      assert.ok(!profile.aromas.includes('Vanilla'));
    }
  }
});

test('grape proportions drive aromas: a trace addition does not dominate a wine', () => {
  const s = newGame('burgundy');
  const pinot = tastingProfile([part('pinot')], s);
  const trace = tastingProfile([part('pinot', 9900), part('riesling', 100)], s);
  const equal = tastingProfile(
    [part('pinot', 5000), part('riesling', 5000)],
    s,
  );
  assert.deepEqual(trace.aromas, pinot.aromas);
  assert.notDeepEqual(equal.aromas, pinot.aromas);
  assert.ok(equal.aromas.includes('Lime'));
  assert.notEqual(
    tastingProfile([part('petite_sirah')], s).palate,
    pinot.palate,
  );
});

test('hybrids inherit weighted aromas through multiple generations', () => {
  const s = newGame('burgundy');
  const hybrid = (id: string, parents: [string, string]) => ({
    ...VARIETIES.pinot,
    id,
    parents,
    name: id,
    collection: 'discovery' as const,
    trait: 'finesse' as const,
    created: 1,
  });
  s.hybrids = [
    hybrid('cross-1', ['pinot', 'riesling']),
    hybrid('cross-2', ['cross-1', 'pinot']),
  ];
  assert.deepEqual(
    tastingProfile([part('cross-2')], s),
    tastingProfile([part('pinot', 7500), part('riesling', 2500)], s),
  );
});

test('actual source regions affect structure and survive changing the active estate', () => {
  const cool = newGame('mosel');
  const warm = newGame('napa');
  assert.notEqual(
    tastingProfile([part('chardonnay')], cool).palate,
    tastingProfile([part('chardonnay')], warm).palate,
  );
  const s = newGame('burgundy');
  s.estates.push({
    ...s.estates[0],
    id: 2,
    region: 'napa',
    name: 'Second estate',
  });
  const recipe = [
    part('pinot', 6000),
    { ...part('chardonnay', 4000), estateId: 2, year: 2 },
  ];
  const original = tastingProfile(recipe, s);
  assert.match(original.origins[0], /Burgundy · 60%/);
  assert.match(original.origins[1], /Napa Valley · 40%/);
  s.activeEstate = 2;
  s.region = 'napa';
  assert.deepEqual(tastingProfile(recipe, s), original);
  assert.deepEqual(tastingProfile([...recipe].reverse(), s), original);
});

test('oak and actual maturation time shape notes without inventing history', () => {
  const s = newGame('burgundy');
  const young = tastingProfile(
    [part('pinot', 10000, { vessel: 'oak', weeks: 0 })],
    s,
  );
  const aged = tastingProfile([part('pinot', 10000, oak)], s);
  const mature = tastingProfile(
    [part('pinot', 10000, { vessel: 'oak', weeks: 8 })],
    s,
  );
  const neutral = tastingProfile([part('pinot', 10000, steel)], s);
  const legacy = tastingProfile([part()], s);
  assert.ok(young.aromas.includes('Vanilla'));
  assert.ok(!young.aromas.includes('Baking spice'));
  assert.ok(aged.aromas.includes('Baking spice'));
  assert.ok(mature.aromas.includes('Toast & cedar'));
  assert.ok(!neutral.aromas.includes('Vanilla'));
  assert.match(neutral.aging[0], /stainless steel · 4 weeks/);
  assert.match(legacy.aging[0], /history unrecorded/);
  assert.ok(!legacy.aromas.includes('Vanilla'));
  const mixed = tastingProfile(
    [part('pinot', 5000, oak), part('pinot', 2500, steel), part('pinot', 2500)],
    s,
  );
  assert.equal(mixed.aging.length, 3);
  assert.match(mixed.aging[0], /50% French oak/);
  assert.match(mixed.aging[1], /25% stainless steel/);
  assert.match(mixed.aging[2], /25% aging history unrecorded/);
});

test('combining and taking tiny portions preserve distinct maturation histories and every milliliter', () => {
  const recipe = [
    part('pinot', 1001, oak),
    part('pinot', 1000, steel),
    part('pinot', 500),
    part('pinot', 999, { vessel: 'oak', weeks: 8 }),
  ];
  const reserve: Reserve = {
    id: 1,
    name: 'Mixed cellar',
    components: combine(recipe),
    stored: 6,
    score: null,
  };
  assert.equal(reserve.components.length, 4);
  const preview = portion(reserve.components, 750);
  const taken = take(reserve, 750);
  assert.deepEqual(preview, taken);
  assert.equal(volume(taken), 750);
  assert.equal(volume(reserve.components), 2750);
  assert.deepEqual(combine([...taken, ...reserve.components]), combine(recipe));
  assert.deepEqual(
    assess(recipe),
    assess(recipe.map(({ maturation: _, ...p }) => p)),
  );
});

function blendedCellar() {
  let s = learn(newGame('burgundy'), 'vintage_blending');
  s.batches = [
    {
      id: 1,
      tankIds: [1],
      variety: 'pinot',
      liters: 100,
      quality: 75,
      stage: 'ready',
      remaining: 0,
      age: 4,
      oak: true,
      year: 1,
    },
    {
      id: 2,
      tankIds: [2],
      variety: 'pinot',
      liters: 100,
      quality: 75,
      stage: 'ready',
      remaining: 0,
      age: 0,
      oak: false,
      year: 1,
    },
  ];
  s.nextId = 3;
  s = act(s, { type: 'reserve', id: 1 });
  s = act(s, { type: 'reserve', id: 2 });
  assert.deepEqual(s.reserves[0].components[0].maturation, oak);
  assert.deepEqual(s.reserves[1].components[0].maturation, {
    vessel: 'steel',
    weeks: 0,
  });
  return act(reload(s), {
    type: 'blend',
    name: 'Two vessels',
    portions: [
      { id: 3, ml: 70001 },
      { id: 4, ml: 29999 },
    ],
  });
}
const bottle = (s: GameState, id: number, bottles = 10) =>
  act(s, {
    type: 'bottle',
    id,
    bottles,
    line: s.lines.length
      ? { id: s.lines[0].id }
      : { name: 'Two vessels', design: DEFAULT_DESIGN },
  });

test('the bottling preview matches a saved snapshot through blending, partial releases, and reloads', () => {
  let s = blendedCellar();
  const reserve = s.reserves.at(-1)!;
  const preview = tastingProfile(
    portion(reserve.components, 7500).filter((p) => p.ml > 0),
    s,
  );
  s = bottle(s, reserve.id);
  assert.deepEqual(s.wines[0].tasting, preview);
  assert.equal(volume(s.reserves.at(-1)!.components), 92500);
  s = bottle(reload(s), reserve.id, 1);
  assert.equal(s.wines[1].lineId, s.wines[0].lineId);
  assert.equal(s.wines[1].quality, s.wines[0].quality);
  const saved = structuredClone(s.wines[0].tasting);
  for (let i = 0; i < 12; i++) s = act(s, { type: 'advance' });
  s = reload(s);
  assert.deepEqual(releaseTasting(s.wines[0], s), saved);
  // Frozen release notes are used even if future catalog/context data changes.
  s.estates[0].region = 'barossa';
  assert.deepEqual(releaseTasting(s.wines[0], s), saved);
  assert.deepEqual(s.reserves.at(-1)!.components[0].maturation, oak);
});

test('legacy saves load without maturation or snapshots, and descriptive notes consume no scoring randomness', () => {
  const recorded = blendedCellar();
  const legacy = structuredClone(recorded);
  for (const r of legacy.reserves)
    for (const p of r.components) delete p.maturation;
  const a = bottle(recorded, recorded.reserves.at(-1)!.id);
  const b = bottle(legacy, legacy.reserves.at(-1)!.id);
  assert.equal(a.seed, b.seed);
  assert.equal(a.wines[0].quality, b.wines[0].quality);
  assert.equal(a.wines[0].price, b.wines[0].price);
  delete b.wines[0].tasting;
  const loaded = reload(b);
  assert.match(
    releaseTasting(loaded.wines[0], loaded).aging[0],
    /history unrecorded/,
  );
});

test('maturation metadata cannot change the dominant grape when a lot is split across vessels', () => {
  const s = newGame();
  s.reserves = [
    {
      id: 1,
      name: 'Dominant Merlot',
      stored: 6,
      score: 75,
      components: combine([
        part('merlot', 3000, oak),
        part('merlot', 3000, steel),
        part('chardonnay', 4000, steel),
      ]),
    },
  ];
  s.nextId = 2;
  const bottled = bottle(s, 1);
  assert.equal(bottled.wines[0].variety, 'merlot');
});

test('save validation rejects malformed maturation and tasting snapshots', () => {
  for (const maturation of [
    { vessel: 'oak', weeks: -1 },
    { vessel: 'oak', weeks: 9 },
    { vessel: 'oak', weeks: 1.5 },
    { vessel: 'barrel', weeks: 1 },
  ])
    assert.equal(
      componentSchema.safeParse({ ...part(), maturation }).success,
      false,
    );
  const s = blendedCellar();
  const bottled = bottle(s, s.reserves.at(-1)!.id);
  assert.ok(stateSchema.safeParse(bottled).success);
  const broken = structuredClone(bottled);
  broken.wines[0].tasting!.aromas = [];
  assert.equal(stateSchema.safeParse(broken).success, false);
});
