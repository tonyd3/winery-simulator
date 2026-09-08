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

test('annual expressions vary within a grape family and never reroll on viewing', () => {
  const s = newGame('bordeaux');
  const original = structuredClone(s);
  const profiles = Array.from({ length: 12 }, (_, i) =>
    tastingProfile([{ ...part('cabernet'), year: i + 1 }], s),
  );
  assert.ok(new Set(profiles.map((p) => p.aromas.join('|'))).size >= 5);
  assert.ok(new Set(profiles.map((p) => p.palate)).size >= 2);
  assert.notDeepEqual(profiles[7].aromas, profiles[8].aromas);
  for (const profile of profiles) {
    assert.ok(
      profile.aromas.some((aroma) => /blackcurrant|cassis/i.test(aroma)),
    );
    assert.ok(!profile.aromas.includes('Vanilla'));
    assert.match(profile.vintage!, /harvest conditions unrecorded/);
  }
  assert.deepEqual(s, original);
  s.week += 36;
  s.seed = 123;
  s.name = 'A renamed estate';
  assert.deepEqual(tastingProfile([part('cabernet')], s), profiles[0]);
  assert.equal(s.seed, 123);
});

const freshHarvest = { ripeness: 80, health: 95, sunExposure: 0.5 };
const ripeHarvest = { ripeness: 100, health: 95, sunExposure: 0.5 };

test('picking decisions change fruit and structure, while vine condition changes the finish', () => {
  const s = newGame();
  const profile = (harvest: WineComponent['harvest']) =>
    tastingProfile([{ ...part('cabernet'), harvest }], s);
  const fresh = profile(freshHarvest);
  const ripe = profile(ripeHarvest);
  assert.notDeepEqual(fresh.aromas, ripe.aromas);
  assert.match(fresh.palate, /bright acidity.*Fresh, lifted fruit/);
  assert.match(ripe.palate, /fresh acidity.*Generous, ripe fruit/);
  assert.match(fresh.vintage!, /fresher side.*healthy vines/);
  assert.match(ripe.vintage!, /full ripeness/);
  const stressed = profile({ ...ripeHarvest, health: 40 });
  assert.match(stressed.palate, /subdued fruit finish/);
  assert.match(stressed.vintage!, /stressed vines/);
  assert.notEqual(stressed.palate, ripe.palate);
  const shaded = profile({ ...ripeHarvest, ripeness: 90, sunExposure: 0 });
  const sunny = profile({ ...ripeHarvest, ripeness: 90, sunExposure: 1 });
  assert.notDeepEqual(shaded.aromas, sunny.aromas);
});

test('harvest character survives partial fermentation, reserves, bottling and save reload', () => {
  let s = newGame();
  s.plots[0].expansions = 1;
  s.plots[0].bearingExpansions = 1;
  const plot = { ...s.plots[0] };
  s = act(s, { type: 'harvest', id: 1 });
  const harvest = structuredClone(s.grapes[0].harvest!);
  assert.equal(harvest.ripeness, plot.growth);
  assert.equal(harvest.health, plot.health);
  assert.equal(harvest.sunExposure, 3 / 6);
  assert.equal(s.plots[0].growth, 0);
  const id = s.grapes[0].id;
  s = act(reload(s), { type: 'ferment', id, oak: false });
  assert.ok(
    s.grapes[0].kg > 0,
    'the expanded plot produces more than the two tanks can hold',
  );
  assert.deepEqual(s.grapes[0].harvest, harvest);
  assert.deepEqual(s.batches[0].harvest, harvest);
  while (s.batches[0].stage === 'fermenting') s = act(s, { type: 'advance' });
  s = act(reload(s), { type: 'reserve', id: s.batches[0].id });
  assert.deepEqual(s.reserves[0].components[0].harvest, harvest);
  const reserve = s.reserves[0];
  const preview = tastingProfile(portion(reserve.components, 7500), s);
  const withoutHarvest = structuredClone(s);
  delete withoutHarvest.reserves[0].components[0].harvest;
  const baseline = bottle(withoutHarvest, reserve.id);
  s = bottle(s, reserve.id);
  assert.deepEqual(s.wines[0].tasting, preview);
  assert.deepEqual(s.wines[0].components[0].harvest, harvest);
  assert.equal(s.wines[0].quality, baseline.wines[0].quality);
  assert.equal(s.wines[0].price, baseline.wines[0].price);
  assert.equal(s.seed, baseline.seed);
  s = bottle(reload(s), reserve.id, 1);
  assert.deepEqual(s.wines[1].tasting, preview);
  reload(s);
});

test('blends preserve different picking histories even at equal quality and vintage', () => {
  const recipe = [
    { ...part('cabernet', 8000), harvest: freshHarvest },
    { ...part('cabernet', 2000), harvest: ripeHarvest },
    part('cabernet', 1000),
  ];
  assert.equal(combine(recipe).length, 3);
  const s = newGame();
  const original = tastingProfile(recipe, s);
  assert.match(original.vintage!, /91% recorded harvest/);
  assert.match(original.vintage!, /9% harvest conditions unrecorded/);
  assert.deepEqual(tastingProfile([...recipe].reverse(), s), original);
  const reserve: Reserve = {
    id: 1,
    name: 'Picking trials',
    stored: 6,
    score: 75,
    components: combine(recipe),
  };
  const poured = take(reserve, 750);
  assert.deepEqual(
    combine([...poured, ...reserve.components]),
    combine(recipe),
  );
  const trace = tastingProfile(
    [
      { ...recipe[0], ml: 99999 },
      { ...recipe[1], ml: 1, year: 2 },
    ],
    s,
  );
  const single = tastingProfile([recipe[0]], s);
  assert.deepEqual(trace.aromas, single.aromas);
  assert.equal(trace.palate, single.palate);
});

test('all grapes and regions produce valid notes at harvest and cellar extremes', () => {
  for (const region of REGION_IDS) {
    const s = newGame(region);
    for (const variety of Object.keys(VARIETIES)) {
      for (const harvest of [
        freshHarvest,
        ripeHarvest,
        { ...ripeHarvest, health: 0 },
      ]) {
        const profile = tastingProfile(
          [
            {
              ...part(variety, 10000, { vessel: 'oak', weeks: 8 }),
              harvest,
              techniques: ['skin_contact', 'malolactic', 'lees_aging'],
            },
            { ...part(variety, 1), year: 2 },
          ],
          s,
        );
        assert.ok(
          tastingNotesSchema.safeParse(profile).success,
          `${region}/${variety}`,
        );
      }
    }
  }
});

test('old snapshots remain intact and invalid harvest metadata is rejected on import', () => {
  let s = blendedCellar();
  s = bottle(s, s.reserves.at(-1)!.id);
  delete s.wines[0].tasting!.vintage;
  s.wines[0].tasting!.aromas = ['Original recorded aroma'];
  const loaded = reload(s);
  assert.deepEqual(releaseTasting(loaded.wines[0], loaded), s.wines[0].tasting);
  for (const harvest of [
    { ...freshHarvest, ripeness: 79 },
    { ...freshHarvest, health: 101 },
    { ...freshHarvest, sunExposure: -1 },
    { ...freshHarvest, sunExposure: 2 },
    { ...freshHarvest, health: NaN },
    { ripeness: 90 },
  ]) {
    assert.equal(
      componentSchema.safeParse({ ...part(), harvest }).success,
      false,
    );
    const broken = structuredClone(s);
    Object.assign(broken.wines[0].components[0], { harvest });
    assert.equal(stateSchema.safeParse(broken).success, false);
  }
});
