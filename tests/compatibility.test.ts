import { learn, allGrapes } from './helpers.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  deserialize,
  newGame,
  serialize,
  VARIETIES,
} from '../src/game.ts';
import {
  assess,
  blendProfile,
  combine,
  DEFAULT_DESIGN,
} from '../src/winemaking.ts';
import { BLEND_COMPATIBILITY } from '../src/blendCompatibility.ts';
import type { GrapeLineage } from '../src/blendCompatibility.ts';
import type { WineComponent } from '../src/winemaking.ts';

const recipe = (
  a: string,
  b: string,
  share = 50,
  quality = 80,
): WineComponent[] => [
  { variety: a, year: 1, ml: share * 1000, quality },
  { variety: b, year: 2, ml: (100 - share) * 1000, quality },
];
const close = (actual: number, expected: number) =>
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

test('identical quality and proportions produce distinct complementary, neutral, and conflicting wines', () => {
  for (const [a, b] of [
    ['merlot', 'cabernet'],
    ['syrah', 'grenache'],
    ['sauvignon', 'semillon'],
  ])
    assert.equal(assess(recipe(a, b)).expected, 84);
  assert.equal(assess(recipe('chardonnay', 'aligote')).expected, 80);
  assert.equal(assess(recipe('pinot', 'cabernet')).expected, 76);
  assert.equal(assess(recipe('riesling', 'cabernet')).expected, 74);
});

test('small additions have small effects and harmony cannot hide inferior source quality', () => {
  const values = [99, 90, 75, 50].map(
    (share) => assess(recipe('merlot', 'cabernet', share)).compatibility,
  );
  assert.ok(values[0] < 0.2);
  assert.ok(values.every((n, i) => i === 0 || n > values[i - 1]));
  assert.equal(values.at(-1), 4);
  assert.ok(assess(recipe('riesling', 'cabernet', 99)).compatibility > -0.25);
  const diluted = recipe('merlot', 'cabernet');
  diluted[1].quality = 40;
  assert.equal(assess(diluted).expected, 64);
  assert.ok(assess(diluted).expected < assess([diluted[0]]).expected);
});

test('Petit Verdot supports a Bordeaux blend as an accent but can dominate it', () => {
  const small = assess(recipe('merlot', 'petit_verdot', 90));
  const large = assess(recipe('merlot', 'petit_verdot', 50));
  close(small.compatibility, 1.44);
  assert.equal(large.compatibility, -2);
  assert.match(small.pairs[0].reason, /accent/);
  assert.match(large.pairs[0].reason, /dominating/);
  const below = assess(recipe('merlot', 'petit_verdot', 80.01));
  const above = assess(recipe('merlot', 'petit_verdot', 79.99));
  assert.ok(Math.abs(below.compatibility - above.compatibility) < 0.01);
});

test('new grapes offer complementary recipes without erasing delicate-style clashes', () => {
  for (const [a, b] of [
    ['gamay', 'pinot'],
    ['carmenere', 'merlot'],
    ['graciano', 'tempranillo'],
    ['petite_sirah', 'zinfandel'],
    ['pinot_gris', 'chardonnay'],
    ['albarino', 'vermentino'],
    ['gruner_veltliner', 'riesling'],
    ['marsanne', 'roussanne'],
    ['viognier', 'roussanne'],
  ])
    assert.ok(assess(recipe(a, b)).compatibility > 0, `${a} / ${b}`);
  assert.ok(assess(recipe('gamay', 'petite_sirah')).compatibility < 0);
  assert.ok(assess(recipe('pinot', 'petite_sirah')).compatibility < 0);
  assert.ok(blendProfile(recipe('marsanne', 'roussanne', 50, 75)).high < 90);
});

test('French and Italian additions have useful blends while powerful reds still clash with delicate grapes', () => {
  for (const [a, b] of [
    ['aglianico', 'merlot'],
    ['sagrantino', 'sangiovese'],
    ['corvina', 'sangiovese'],
    ['montepulciano', 'sangiovese'],
    ['nero_davola', 'syrah'],
    ['dolcetto', 'barbera'],
    ['fiano', 'vermentino'],
    ['verdicchio', 'garganega'],
    ['garganega', 'chardonnay'],
    ['arneis', 'pinot_gris'],
    ['tannat', 'cabernet_franc'],
    ['carignan', 'grenache'],
    ['carignan', 'syrah'],
    ['cinsault', 'grenache'],
    ['cinsault', 'syrah'],
    ['pinot_meunier', 'pinot'],
    ['savagnin', 'chardonnay'],
    ['melon', 'chenin'],
    ['clairette', 'grenache_blanc'],
    ['grenache_blanc', 'roussanne'],
  ]) {
    assert.ok(assess(recipe(a, b)).compatibility > 0, `${a} / ${b}`);
    assert.ok(assess(recipe(a, b, 99)).compatibility < 0.2);
    assert.ok(blendProfile(recipe(a, b, 50, 75)).high < 90);
  }
  for (const variety of [
    'aglianico',
    'sagrantino',
    'montepulciano',
    'nero_davola',
    'tannat',
  ]) {
    assert.ok(assess(recipe('pinot', variety)).compatibility < 0);
    assert.ok(assess(recipe('gamay', variety)).compatibility < 0);
  }
  assert.ok(assess(recipe('pinot_meunier', 'chardonnay')).compatibility < 0);
});

test('Viognier lifts Syrah in small proportions, dominates larger blends, and passes its accent through ancestry', () => {
  const accent = assess(recipe('syrah', 'viognier', 90));
  close(accent.compatibility, 1.08);
  assert.match(accent.pairs[0].reason, /accent/);
  assert.ok(assess(recipe('syrah', 'viognier', 50)).compatibility < 0);
  assert.ok(
    Math.abs(
      assess(recipe('syrah', 'viognier', 85.01)).compatibility -
        assess(recipe('syrah', 'viognier', 84.99)).compatibility,
    ) < 0.01,
  );
  const hybrids: GrapeLineage[] = [
    { id: 'cross-1', parents: ['viognier', 'syrah'] },
  ];
  // A 20% share of this cross contributes 10% Viognier ancestry.
  close(assess(recipe('syrah', 'cross-1', 80), hybrids).compatibility, 0.96);
  assert.ok(assess(recipe('syrah', 'cross-1', 10), hybrids).compatibility < 0);
});

test('recipe order, vintage splits, volume scale and recombination preserve pairing effects', () => {
  const parts = recipe('merlot', 'cabernet', 60);
  const baseline = assess(parts);
  assert.deepEqual(assess([...parts].reverse()), baseline);
  assert.deepEqual(
    assess(parts.map((p) => ({ ...p, ml: p.ml * 3 }))),
    baseline,
  );
  const split = parts.flatMap((p) => [
    { ...p, ml: p.ml / 2 },
    { ...p, ml: p.ml / 2, year: p.year + 1 },
  ]);
  assert.deepEqual(assess(split), baseline);
  assert.deepEqual(assess(combine([...split, ...parts])), baseline);
  assert.equal(assess(recipe('merlot', 'merlot')).compatibility, 0);
  assert.equal(assess([]).expected, 0);
});

test('a third grape changes the whole recipe without stacking full pairing bonuses', () => {
  const gsm = ['grenache', 'syrah', 'mourvedre'].map((variety) => ({
    variety,
    year: 1,
    ml: 10000,
    quality: 80,
  }));
  close(assess(gsm).compatibility, 4);
  const clash = assess([
    ...gsm,
    { variety: 'riesling', year: 1, ml: 30000, quality: 80 },
  ]);
  assert.ok(clash.compatibility < 0);
  close(
    clash.pairs.reduce((n, p) => n + p.effect, 0),
    clash.compatibility,
  );
  assert.equal(clash.pairs.length, 6);
});

test('all catalog pairings stay symmetric and bounded across source quality and proportions', () => {
  for (const a of Object.keys(VARIETIES))
    for (const b of Object.keys(VARIETIES)) {
      for (const share of [1, 20, 50, 80, 99]) {
        const parts = recipe(a, b, share);
        const profile = blendProfile(parts);
        assert.ok(
          profile.compatibility >= BLEND_COMPATIBILITY.min &&
            profile.compatibility <= BLEND_COMPATIBILITY.max,
        );
        close(
          profile.compatibility,
          assess([...parts].reverse()).compatibility,
        );
        for (const quality of [0, 100]) {
          const edge = blendProfile(parts.map((p) => ({ ...p, quality })));
          assert.ok(
            edge.low >= 0 &&
              edge.low <= edge.expected &&
              edge.expected <= edge.high &&
              edge.high <= 100,
          );
        }
      }
    }
});

test('hybrids inherit weighted pairing traits across generations, including shared ancestry and accents', () => {
  const hybrids: GrapeLineage[] = [
    { id: 'cross-1', parents: ['merlot', 'cabernet'] },
    { id: 'cross-2', parents: ['merlot', 'riesling'] },
    { id: 'cross-3', parents: ['cross-1', 'cross-2'] },
    { id: 'cross-4', parents: ['petit_verdot', 'merlot'] },
  ];
  assert.equal(
    assess(recipe('cross-1', 'cabernet_franc'), hybrids).compatibility,
    4,
  );
  assert.equal(
    assess(recipe('cross-2', 'cabernet_franc'), hybrids).compatibility,
    -1,
  );
  assert.equal(
    assess(recipe('cross-3', 'cabernet_franc'), hybrids).compatibility,
    1.5,
  );
  assert.equal(assess(recipe('cross-1', 'merlot'), hybrids).compatibility, 2);
  assert.equal(assess(recipe('cross-1', 'cross-1'), hybrids).compatibility, 0);
  close(assess(recipe('cross-4', 'merlot', 20), hybrids).compatibility, 1.28);
  assert.ok(assess(recipe('cross-4', 'merlot', 90), hybrids).compatibility < 0);
  assert.match(
    assess(recipe('cross-3', 'cabernet_franc'), hybrids).pairs[0].reason,
    /ancestry/,
  );
});

test('hybrid preview, tasting, direct bottling and saved releases use the same recipe score', () => {
  let s = newGame();
  allGrapes(s);
  learn(s, 'genomics');
  s.cash = 100000;
  s.knowledge = 500;
  s = act(s, {
    type: 'breed',
    name: 'Pairing trial',
    parents: ['merlot', 'cabernet'],
    trait: 'finesse',
  });
  for (let i = 0; i < 18; i++) s = act(s, { type: 'advance' });
  s.reserves = [
    {
      id: s.nextId++,
      name: 'Inherited harmony',
      stored: s.week,
      score: null,
      components: recipe(s.hybrids[0].id, 'cabernet_franc').map((p) => ({
        ...p,
        year: 1,
      })),
    },
  ];
  s = deserialize(serialize(s));
  const id = s.reserves[0].id,
    profile = blendProfile(s.reserves[0].components, s.hybrids);
  const bottle = (state: typeof s) =>
    act(state, {
      type: 'bottle',
      id,
      bottles: 1,
      line: { name: 'Family reserve', design: DEFAULT_DESIGN },
    });
  const normal = bottle(s),
    tasted = act(s, { type: 'tasteReserve', id });
  assert.equal(profile.expected, 84);
  assert.equal(tasted.reserves[0].score, normal.wines[0].quality);
  assert.ok(
    normal.wines[0].quality >= profile.low &&
      normal.wines[0].quality <= profile.high,
  );
  const released = bottle(deserialize(serialize(tasted)));
  assert.equal(released.wines[0].quality, tasted.reserves[0].score);
  assert.deepEqual(deserialize(serialize(released)), released);
  // A historic tasting is final even when current recipe rules disagree.
  s.reserves[0].score = 94;
  assert.equal(bottle(deserialize(serialize(s))).wines[0].quality, 94);
});

test('blending ordinary or poor source wines cannot guarantee a 90-point result', () => {
  const parts = recipe('merlot', 'cabernet', 50, 80);
  assert.ok(blendProfile(parts).high < 90);
  assert.ok(blendProfile(parts.map((p) => ({ ...p, quality: 60 }))).high < 70);
});

test('new world grapes provide balanced recipes and preserve powerful-style clashes', () => {
  for (const [a, b] of [
    ['touriga_nacional', 'touriga_franca'],
    ['touriga_franca', 'tempranillo'],
    ['baga', 'touriga_nacional'],
    ['mencia', 'cabernet_franc'],
    ['bobal', 'tempranillo'],
    ['pinotage', 'merlot'],
    ['saperavi', 'cabernet'],
    ['assyrtiko', 'moschofilero'],
    ['moschofilero', 'riesling'],
    ['godello', 'albarino'],
    ['verdejo', 'sauvignon'],
    ['rkatsiteli', 'chenin'],
  ])
    assert.ok(assess(recipe(a, b)).compatibility > 0, `${a} / ${b}`);
  for (const powerful of [
    'touriga_nacional',
    'baga',
    'bobal',
    'pinotage',
    'saperavi',
  ]) {
    assert.ok(assess(recipe(powerful, 'pinot')).compatibility < 0);
    assert.ok(assess(recipe(powerful, 'gamay')).compatibility < 0);
  }
  assert.ok(assess(recipe('moschofilero', 'cabernet')).compatibility < 0);
});
