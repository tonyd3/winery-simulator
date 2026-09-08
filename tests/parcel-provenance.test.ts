import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  act,
  newGame,
  getLand,
  serialize,
  deserialize,
  stateSchema,
} from '../src/game.ts';
import type { GameState } from '../src/game.ts';
import {
  combine,
  portion,
  take,
  volume,
  tastingScore,
  blendProfile,
  DEFAULT_DESIGN,
} from '../src/winemaking.ts';
import type { WineComponent, Reserve } from '../src/winemaking.ts';
import { parcelLabel } from '../src/parcelProvenance.ts';
import { Composition } from '../src/WinePresentation.tsx';
import { GrapeArrival } from '../src/GrapeArrival.tsx';
import { BlendAnalysis } from '../src/BlendAnalysis.tsx';
import { tastingProfile } from '../src/wineSensory.ts';
import { learn } from './helpers.ts';

const reload = (s: GameState) => {
  assert.deepEqual(deserialize(serialize(s)), s);
  return deserialize(serialize(s));
};
function sites() {
  let s = newGame();
  s.cash = 2000000;
  s = act(s, {
    type: 'acquireEstate',
    region: 'mosel',
    name: 'Weingut Horizon',
  });
  s = act(s, { type: 'expandEstate', id: 2 });
  s = act(s, { type: 'buyPlot', id: 31 });
  learn(s, 'grape_riesling', 'vintage_blending');
  for (const id of [25, 26, 31]) {
    s = act(s, { type: 'plant', id, variety: 'riesling' });
    const plot = s.plots.find((p) => p.id === id)!;
    plot.growth = 100;
    plot.health = 100;
    s = act(s, { type: 'harvest', id });
  }
  return reload(s);
}
const south = { id: 25, name: 'South slope', soil: 'Slate' };
const terrace = { id: 26, name: 'Limestone terrace', soil: 'Chalk' };
const part = (parcel: WineComponent['parcel'], ml = 10000): WineComponent => ({
  variety: 'riesling',
  estateId: 2,
  year: 1,
  quality: 80,
  ml,
  ...(parcel ? { parcel } : {}),
});

test('harvest captures the actual region soil and district-qualified parcel name', () => {
  const s = sites();
  for (const [i, id] of [25, 26, 31].entries()) {
    const land = getLand(s, id);
    assert.deepEqual(s.grapes[i].parcel, {
      id,
      name: land.name,
      soil: land.soil,
    });
    assert.equal(s.grapes[i].estateId, 2);
  }
  assert.deepEqual(s.grapes[0].parcel, south);
  assert.deepEqual(s.grapes[1].parcel, terrace);
  assert.equal(s.grapes[2].parcel!.name, 'South slope · Upper');
  const legacy = newGame();
  legacy.legacyLand = true;
  assert.equal(
    act(legacy, { type: 'harvest', id: 1 }).grapes[0].parcel!.soil,
    getLand(legacy, 1).soil,
  );
});

test('partial fermentation, maturation, reblending and partial bottling retain parcel records', () => {
  let s = sites();
  // A larger crop forces fermentation to leave a grape remainder.
  s.grapes[0].kg = 900;
  const grape = s.grapes[0];
  s = reload(act(s, { type: 'ferment', id: grape.id, oak: false }));
  assert.ok(s.grapes.some((g) => g.id === grape.id));
  assert.deepEqual(s.grapes.find((g) => g.id === grape.id)!.parcel, south);
  assert.deepEqual(s.batches[0].parcel, south);
  s = act(act(s, { type: 'advance' }), { type: 'advance' });
  s = act(s, {
    type: 'age',
    id: s.batches[0].id,
    vessel: 'steel',
    targetWeeks: 1,
    autoTransfer: true,
  });
  s = reload(act(s, { type: 'advance' }));
  const first = s.reserves.at(-1)!;
  assert.deepEqual(first.components[0].parcel, south);
  // A second parcel with otherwise identical wine must remain separate.
  s.reserves.push({
    ...structuredClone(first),
    id: s.nextId++,
    components: [{ ...first.components[0], parcel: terrace }],
  });
  s = act(s, {
    type: 'blend',
    name: 'Parcel blend',
    portions: s.reserves.slice(-2).map((r) => ({ id: r.id, ml: 30000 })),
  });
  let reserve = s.reserves.at(-1)!;
  assert.equal(reserve.components.length, 2);
  s = act(s, {
    type: 'blend',
    name: 'Reblended parcels',
    portions: [
      { id: reserve.id, ml: 15000 },
      { id: first.id, ml: 15000 },
    ],
  });
  reserve = s.reserves.at(-1)!;
  assert.equal(reserve.components.length, 2);
  s = reload(
    act(s, {
      type: 'bottle',
      id: reserve.id,
      bottles: 7,
      line: { name: 'Mosel parcels', design: DEFAULT_DESIGN },
    }),
  );
  const wine = s.wines.at(-1)!;
  assert.deepEqual(
    new Set(wine.components.map((p) => p.parcel!.id)),
    new Set([25, 26]),
  );
  assert.equal(volume(wine.components), 5250);
  assert.deepEqual(
    new Set(
      s.reserves
        .find((r) => r.id === reserve.id)!
        .components.map((p) => p.parcel!.id),
    ),
    new Set([25, 26]),
  );
  const recorded = structuredClone(wine);
  s = act(s, { type: 'uproot', id: 25 });
  s = act(s, { type: 'visitEstate', id: 1 });
  s = reload(s);
  assert.deepEqual(s.wines.at(-1), recorded);
});

test('combining and taking wine preserve parcel shares, unknown portions and quantities', () => {
  const parts = [
    part(south, 3000),
    part(terrace, 2000),
    part(undefined, 1000),
    part(south, 1000),
  ];
  const before = structuredClone(parts);
  const combined = combine(parts);
  assert.equal(combined.length, 3);
  assert.equal(combined.find((p) => p.parcel?.id === 25)!.ml, 4000);
  assert.equal(combined.find((p) => !p.parcel)!.ml, 1000);
  const source: Reserve = {
    id: 1,
    name: 'Mixed origins',
    components: combined,
    score: null,
    stored: 1,
  };
  const bottled = take(source, 750);
  assert.equal(volume(bottled) + volume(source.components), 7000);
  assert.deepEqual(
    bottled,
    portion(combined, 750).filter((p) => p.ml > 0),
  );
  assert.deepEqual(parts, before);
  assert.equal(
    combine([part(south), part({ ...south, soil: 'Clay' })]).length,
    2,
  );
});

test('parcel metadata changes source detail without changing quality or sensory rules', () => {
  const known = [part(south, 3000), { ...part(terrace, 1000), quality: 70 }];
  const unknown = known.map(({ parcel, ...p }) => p);
  assert.equal(tastingScore(known), tastingScore(unknown));
  const profile = blendProfile(known);
  assert.equal(profile.base, 77.5);
  assert.deepEqual(
    profile.sources.map((s) => [s.parcel?.id, s.share, s.quality]),
    [
      [25, 75, 80],
      [26, 25, 70],
    ],
  );
  assert.deepEqual(
    tastingProfile(known, sites()),
    tastingProfile(unknown, sites()),
  );
});

test('old saves retain missing origins without inventing parcel details', () => {
  let s = act(newGame(), { type: 'harvest', id: 1 });
  delete s.grapes[0].parcel;
  s = reload(act(s, { type: 'ferment', id: s.grapes[0].id, oak: false }));
  assert.equal(s.batches[0].parcel, undefined);
  s = act(act(s, { type: 'advance' }), { type: 'advance' });
  s = act(s, { type: 'reserve', id: s.batches[0].id });
  assert.equal(s.reserves[0].components[0].parcel, undefined);
  s = reload(
    act(s, {
      type: 'bottle',
      id: s.reserves[0].id,
      bottles: 1,
      line: { name: 'Old parcel', design: DEFAULT_DESIGN },
    }),
  );
  assert.equal(s.wines[0].components[0].parcel, undefined);
  assert.equal(parcelLabel(undefined), 'Parcel unrecorded');
});

test('save validation rejects invalid, foreign and unowned parcel references at every stage', () => {
  let s = sites();
  for (const parcel of [
    { ...south, id: 1 },
    { ...south, id: 28 },
    { ...south, id: 37 },
    { ...south, id: 193 },
    { ...south, name: '' },
    { ...south, soil: '' },
  ]) {
    const invalid = structuredClone(s);
    invalid.grapes[0].parcel = parcel;
    assert.equal(stateSchema.safeParse(invalid).success, false);
  }
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: false });
  let invalid = structuredClone(s);
  invalid.batches[0].parcel!.id = 1;
  assert.equal(stateSchema.safeParse(invalid).success, false);
  s = act(act(s, { type: 'advance' }), { type: 'advance' });
  s = act(s, { type: 'reserve', id: s.batches[0].id });
  invalid = structuredClone(s);
  invalid.reserves[0].components[0].parcel!.id = 1;
  assert.equal(stateSchema.safeParse(invalid).success, false);
  s = act(s, {
    type: 'bottle',
    id: s.reserves[0].id,
    bottles: 1,
    line: { name: 'Valid origin', design: DEFAULT_DESIGN },
  });
  invalid = structuredClone(s);
  invalid.wines[0].components[0].parcel!.id = 1;
  assert.equal(stateSchema.safeParse(invalid).success, false);
});

test('shared provenance renders distinct parcels, soil, estate, shares and legacy fallback', () => {
  const s = sites();
  const parts = [part(south, 7500), part(terrace, 2000), part(undefined, 500)];
  for (const element of [
    createElement(Composition, { parts, state: s }),
    createElement(BlendAnalysis, { parts, state: s, expanded: true }),
  ]) {
    const html = renderToStaticMarkup(element);
    assert.match(html, /South slope · Slate soil/);
    assert.match(html, /Limestone terrace · Chalk soil/);
    assert.match(html, /Weingut Horizon/);
    assert.match(html, /Parcel unrecorded/);
    assert.match(html, /75(?:\.0)?(?:<!-- -->)?%/);
  }
  const fresh = renderToStaticMarkup(
    createElement(GrapeArrival, {
      state: s,
      grapes: s.grapes[2],
      dispatch: () => {},
      navigate: () => {},
    }),
  );
  assert.match(fresh, /South slope · Upper/);
  assert.match(fresh, /soil/);
});
