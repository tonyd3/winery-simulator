import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  availableVarieties,
  calendar,
  deserialize,
  newGame,
  serialize,
  stateSchema,
  suitability,
} from '../src/game.ts';
import type { GameState } from '../src/game.ts';
import {
  LEGACY_VARIETY_IDS,
  RESEARCH,
  REGION_IDS,
  VARIETIES,
  grapeResearchId,
} from '../src/catalog.ts';
import { researchComplete, researchTerms } from '../src/researchProgression.ts';
import { matchesSearch } from '../src/search.ts';
import { allGrapes, bottleBatch, learn } from './helpers.ts';

const previousAdditions = [
  'gamay',
  'carmenere',
  'graciano',
  'petite_sirah',
  'pinot_gris',
  'viognier',
  'albarino',
  'gruner_veltliner',
  'marsanne',
  'roussanne',
];
const additions = [
  ...previousAdditions,
  'aglianico',
  'sagrantino',
  'corvina',
  'montepulciano',
  'nero_davola',
  'dolcetto',
  'fiano',
  'verdicchio',
  'garganega',
  'arneis',
  'tannat',
  'carignan',
  'cinsault',
  'pinot_meunier',
  'savagnin',
  'melon',
  'clairette',
  'grenache_blanc',
];
const tick = (s: GameState, weeks = 1) => {
  for (let i = 0; i < weeks; i++) s = act(s, { type: 'advance' });
  return s;
};
const reload = (s: GameState) => {
  const loaded = deserialize(serialize(s));
  assert.deepEqual(loaded, s);
  return loaded;
};

test('each new grape requires a paid individual study, persists mid-study, and completes the production and sales loop', () => {
  for (const variety of additions) {
    let s = { ...newGame(), cash: 1000000, knowledge: 10000 };
    const id = grapeResearchId(variety);
    assert.throws(() => act(s, { type: 'research', id }), /Requires/);
    assert.throws(
      () => act(s, { type: 'plant', id: 3, variety }),
      /individual/,
    );
    learn(s, ...RESEARCH[id].requires);
    const terms = researchTerms(s, id),
      before = structuredClone(s);
    s = act(s, { type: 'research', id });
    assert.equal(s.cash, before.cash - terms.cost);
    assert.equal(s.knowledge, before.knowledge - terms.knowledge);
    s = tick(reload(s), terms.weeks - 1);
    assert.equal(researchComplete(s, id), false);
    s = tick(s);
    assert.equal(researchComplete(s, id), true);
    assert.equal(availableVarieties(s).length, 3);
    for (const other of additions.filter((v) => v !== variety))
      assert.equal(researchComplete(s, grapeResearchId(other)), false);
    s = act(reload(s), { type: 'plant', id: 3, variety });
    for (let i = 0; i < 36 && s.plots[2].growth < 80; i++) {
      if (calendar(s.week).season !== 'Winter')
        s = act(s, { type: 'tend', id: 3 });
      s = tick(s);
    }
    s = act(s, { type: 'harvest', id: 3 });
    assert.equal(s.grapes[0].variety, variety);
    assert.ok(s.grapes[0].kg > 0);
    s = act(reload(s), { type: 'ferment', id: s.grapes[0].id, oak: false });
    s = tick(s, 2);
    s = bottleBatch(reload(s), s.batches[0].id);
    assert.equal(s.wines[0].variety, variety);
    const bottles = s.wines[0].bottles;
    s = act(s, { type: 'list', id: s.wines[0].id });
    s = tick(s);
    assert.ok(s.stats.sold > 0);
    assert.equal(s.wines[0].bottles + s.stats.sold, bottles);
    reload(s);
  }
});

test('every added variety can become a breeding parent and produce persistent, plantable offspring', () => {
  for (const variety of additions) {
    let s = learn(
      allGrapes({ ...newGame(), cash: 1000000, knowledge: 10000 }),
      'breeding',
    );
    s = act(s, {
      type: 'breed',
      parents: [variety, 'merlot'],
      trait: 'climate',
      name: `Trial ${variety}`,
    });
    const duration = s.breedingProject!.duration;
    s = tick(reload(s), duration - 1);
    assert.equal(s.hybrids.length, 0);
    s = tick(s);
    assert.deepEqual(s.hybrids[0].parents, [variety, 'merlot']);
    s = act(reload(s), { type: 'plant', id: 3, variety: s.hybrids[0].id });
    assert.equal(s.plots[2].variety, s.hybrids[0].id);
    reload(s);
  }
});

test('expanded licenses round-trip while existing saves keep their original access', () => {
  reload(allGrapes(newGame()));
  const previousCatalog = newGame();
  previousCatalog.grapeLicenses = [...LEGACY_VARIETY_IDS, ...previousAdditions];
  assert.equal(availableVarieties(reload(previousCatalog)).length, 34);
  for (const id of additions.slice(previousAdditions.length))
    assert.equal(researchComplete(previousCatalog, grapeResearchId(id)), false);
  for (const region of REGION_IDS) {
    const current = newGame(region);
    current.grapeLicenses = [...LEGACY_VARIETY_IDS];
    assert.equal(availableVarieties(reload(current)).length, 24);
    const { grapeLicenses, ...old } = current;
    for (const research of [[], ['ampelography', 'heritage', 'discovery']]) {
      const s = deserialize(
        JSON.stringify({
          game: 'terroir',
          savedAt: 'legacy',
          state: { ...old, version: 5, research },
        }),
      );
      for (const id of additions)
        assert.equal(researchComplete(s, grapeResearchId(id)), false);
      assert.ok(
        availableVarieties(s).every(([id]) => LEGACY_VARIETY_IDS.includes(id)),
      );
      reload(s);
    }
  }
  const invalid = newGame();
  invalid.grapeLicenses.push('unknown_grape');
  assert.equal(stateSchema.safeParse(invalid).success, false);
});

test('new regional favorites receive local advantages but remain individually locked and grow abroad after study', () => {
  for (const [region, variety] of [
    ['burgundy', 'gamay'],
    ['napa', 'petite_sirah'],
    ['rioja', 'graciano'],
    ['barossa', 'viognier'],
    ['barossa', 'marsanne'],
    ['barossa', 'roussanne'],
  ] as const) {
    const s = newGame(region),
      id = grapeResearchId(variety);
    assert.equal(researchComplete(s, id), false);
    assert.equal(
      researchTerms(s, id).cost,
      Math.round(RESEARCH[id].cost * 0.8),
    );
    assert.equal(researchTerms(s, id).weeks, RESEARCH[id].weeks - 2);
    assert.ok(suitability(s, variety).regional);
    const abroad = learn(newGame('mosel'), id);
    assert.equal(
      act(abroad, { type: 'plant', id: 3, variety }).plots[2].variety,
      variety,
    );
  }
});

test('grape and research search accepts accents, ASCII spelling, alternate names and surrounding spaces', () => {
  for (const [id, query] of [
    ['carmenere', 'CARMENERE'],
    ['albarino', ' albarino '],
    ['gruner_veltliner', 'gruner'],
    ['pinot_gris', 'pinot grigio'],
    ['petite_sirah', 'durif'],
    ['nero_davola', " NERO D'AVOLA "],
    ['nero_davola', 'nero d’avola'],
    ['cinsault', 'cinsaut'],
    ['pinot_meunier', 'meunier'],
    ['melon', 'melon de bourgogne'],
  ]) {
    assert.ok(matchesSearch(VARIETIES[id].name, query));
    assert.ok(matchesSearch(RESEARCH[grapeResearchId(id)].name, query));
    assert.ok(matchesSearch(VARIETIES[id].name, VARIETIES[id].name));
    assert.equal(matchesSearch(VARIETIES[id].name, 'not a grape'), false);
  }
});
