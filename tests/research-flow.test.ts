import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  newGame,
  serialize,
  deserialize,
  stateSchema,
  availableVarieties,
  fieldExperimentEligible,
  cellarExperimentEligible,
  getVariety,
} from '../src/game.ts';
import type { GameState } from '../src/game.ts';
import { RESEARCH, REGION_IDS, REGIONS, VARIETIES } from '../src/catalog.ts';
import {
  INTRO_BREEDING,
  breedingPreview,
  activeStudies,
} from '../src/researchProgression.ts';
import {
  researchPlan,
  researchPath,
  discoveryDestination,
  firstBlendRecipe,
} from '../src/researchPlanning.ts';
import { volume, blendProfile } from '../src/winemaking.ts';
import { learn } from './helpers.ts';

const funded = () => ({ ...newGame(), cash: 1000000, knowledge: 10000 });

test('every region offers a compatible first blend with a founding grape and a complete study path', () => {
  for (const region of REGION_IDS) {
    const s = newGame(region, 'First blend');
    const recipe = firstBlendRecipe(s);
    assert.equal(
      VARIETIES[recipe[0].id].wineType,
      VARIETIES[recipe[1].id].wineType,
    );
    assert.ok(
      recipe.some((grape) => REGIONS[region].starters.includes(grape.id)),
    );
    assert.ok(
      blendProfile(
        recipe.map((grape) => ({
          variety: grape.id,
          ml: 1500,
          quality: 80,
          year: 1,
          estateId: 1,
        })),
      ).compatibility > 0,
    );
    const plan = researchPlan(s, 'first_blend');
    for (const grape of recipe.filter((grape) => !grape.available)) {
      assert.ok(plan.path.includes(grape.study));
      for (const prerequisite of RESEARCH[grape.study].requires)
        assert.ok(plan.path.includes(prerequisite));
    }
    for (const study of plan.remaining) learn(s, study);
    assert.equal(researchPlan(s, 'first_blend').ready, true);
    assert.ok(firstBlendRecipe(s).every((grape) => grape.available));
    s.researchGoal = 'first_blend';
    assert.equal(deserialize(serialize(s))?.researchGoal, 'first_blend');
  }
});

test('Cellar foundations alone does not claim Bordeaux blend ingredients are unlocked', () => {
  const s = learn(newGame(), 'oenology');
  const plan = researchPlan(s, 'first_blend');
  assert.equal(plan.ready, false);
  assert.ok(plan.remaining.includes('grape_cabernet'));
  assert.ok(plan.cash > 0);
});
const tick = (s: GameState, count: number) => {
  for (let i = 0; i < count; i++) s = act(s, { type: 'advance' });
  return s;
};
const roundtrip = (s: GameState) => {
  const restored = deserialize(serialize(s));
  assert.deepEqual(restored, s);
  return restored;
};
const introAction = {
  type: 'breed',
  introductory: true,
  parents: ['merlot', 'sauvignon'] as [string, string],
  trait: 'climate',
  name: 'First light',
} as const;

function matchedReserves() {
  const s = learn(funded(), 'sensory_science');
  // Keep this study unlearned, with its prerequisite in place.
  s.research = s.research.filter((id) => id !== 'sensory_science');
  s.nextId = 3;
  s.reserves = [1, 2].map((id) => ({
    id,
    name: `Comparison ${id}`,
    stored: s.week,
    score: 80,
    components: [
      {
        variety: 'merlot',
        year: 1,
        estateId: 1,
        ml: 3000,
        quality: 80,
        techniques: [],
        maturation: {
          vessel: id === 1 ? ('oak' as const) : ('steel' as const),
          weeks: 2,
        },
      },
    ],
  }));
  return act(s, { type: 'research', id: 'sensory_science' });
}

test('outcome planning includes unpaid prerequisites and facility dependencies once', () => {
  const s = funded();
  const p = researchPlan(s, 'tasting_room');
  assert.deepEqual(p.path, ['tourism', 'visitor_services', 'hospitality']);
  assert.deepEqual(p.investments, ['visitorCenter', 'tastingRoom']);
  assert.equal(p.researchCash, 75500);
  assert.equal(p.investmentCash, 85000);
  assert.equal(p.cash, 160500);
  assert.equal(p.operatingUpkeep, 2200);
  assert.equal(p.minimumWeeks, 66);
  assert.deepEqual(researchPath(['breeding', 'adaptation']), [
    'ampelography',
    'heritage',
    'breeding',
    'adaptation',
  ]);
});

test('plans exclude paid studies and owned purchases, retaining contracted remaining time', () => {
  let s = learn(funded(), 'oenology');
  s = act(s, { type: 'research', id: 'cellar_control' });
  s = tick(s, 2);
  let p = researchPlan(s, 'fermentation');
  assert.equal(p.researchCash, 0);
  assert.equal(p.knowledge, 0);
  assert.equal(p.sequentialWeeks, 10);
  assert.equal(p.cash, 18000);
  s.upgrades = ['lab', 'researchLab'];
  p = researchPlan(s, 'fermentation');
  assert.equal(p.sequentialWeeks, 5);
  assert.equal(p.cash, 0);
  s.suspendedUpgrades = ['lab'];
  assert.equal(researchPlan(s, 'fermentation').sequentialWeeks, 10);
});

test('the introductory route requires 3000 cash, 80 knowledge, and 14 base weeks', () => {
  const p = researchPlan(newGame(), 'first_cross');
  assert.equal(p.cash, 3000);
  assert.equal(p.knowledge, 80);
  assert.equal(p.sequentialWeeks, 6);
  assert.equal(p.trial?.weeks, 8);
});

test('quality-breeding plans include the full trial and recognize paid and completed trials', () => {
  let s = learn(funded(), 'genomics');
  const plan = researchPlan(s, 'fine_grapes');
  assert.equal(plan.cash, 7500);
  assert.equal(plan.knowledge, 160);
  assert.equal(plan.trial?.weeks, 18);
  assert.equal(plan.ready, false);
  s = act(s, { ...introAction, introductory: false, trait: 'finesse' });
  s = tick(s, 3);
  assert.equal(researchPlan(s, 'fine_grapes').cash, 0);
  assert.equal(researchPlan(s, 'fine_grapes').trial?.weeks, 15);
  s = tick(s, 15);
  assert.equal(researchPlan(s, 'fine_grapes').trial, null);
  assert.equal(researchPlan(s, 'fine_grapes').ready, true);
  roundtrip(s);
});

test('one introductory cross charges once, survives reload, and becomes a plantable grape', () => {
  let s = learn(funded(), 'ampelography');
  const before = structuredClone(s);
  s = act(s, introAction);
  assert.equal(s.cash, before.cash - INTRO_BREEDING.cost);
  assert.equal(s.knowledge, before.knowledge - 40);
  assert.equal(s.breedingProject?.duration, 8);
  assert.equal(s.introCrossId, s.breedingProject?.result.id);
  const result = structuredClone(s.breedingProject!.result);
  roundtrip(s);
  assert.throws(() => act(s, introAction), /progress/);
  s = tick(roundtrip(s), 8);
  assert.equal(s.hybrids[0].id, result.id);
  assert.equal(s.hybrids[0].heat, result.heat);
  assert.ok(availableVarieties(s).some(([id]) => id === result.id));
  assert.ok(s.unseenDiscoveries.includes(result.id));
  assert.equal(researchPlan(s, 'first_cross').ready, true);
  assert.throws(
    () => act(s, { ...introAction, name: 'Second light' }),
    /already been used/,
  );
  assert.throws(
    () => act(s, { ...introAction, introductory: false, name: 'Second light' }),
    /Cross-pollination/,
  );
  s = act(s, { type: 'plant', id: 3, variety: result.id });
  assert.equal(s.plots[2].variety, result.id);
  roundtrip(s);
});

test('introductory access cannot bypass founders, Vine science, or advanced traits', () => {
  const s = funded();
  const before = serialize(s).split('"state":')[1];
  assert.throws(() => act(s, introAction), /Vine science/);
  learn(s, 'ampelography');
  s.grapeLicenses.push('cabernet');
  assert.throws(
    () => act(s, { ...introAction, parents: ['merlot', 'cabernet'] }),
    /founding/,
  );
  assert.throws(
    () => act(s, { ...introAction, trait: 'finesse' }),
    /adaptation or hardier/,
  );
  assert.equal(s.cash, 1000000);
  assert.equal(s.hybrids.length, 0);
  assert.ok(before);
});

test('introductory inheritance and preview agree in every starting region', () => {
  for (const region of REGION_IDS)
    for (const trait of ['climate', 'resilience'] as const) {
      const s = learn(
        { ...newGame(region), cash: 100000, knowledge: 1000 },
        'ampelography',
      );
      const parents = [...REGIONS[region].starters] as [string, string];
      const preview = breedingPreview(s, parents, trait);
      const next = act(s, {
        type: 'breed',
        introductory: true,
        parents,
        trait,
        name: 'Regional trial',
      });
      const child = next.breedingProject!.result;
      for (const key of [
        'heat',
        'resilience',
        'finesse',
        'yieldFactor',
        'planting',
      ] as const)
        assert.equal(child[key], preview[key]);
      assert.ok(
        parents.some((id) => {
          const p = getVariety(s, id);
          return (
            p.preferred === child.preferred && p.wineType === child.wineType
          );
        }),
      );
      roundtrip(next);
    }
});

test('introductory hybrids keep the full repeated-cross and hybrid-parent gates', () => {
  let s = tick(act(learn(funded(), 'ampelography'), introAction), 8);
  s = learn(s, 'breeding');
  assert.throws(
    () =>
      act(s, {
        ...introAction,
        introductory: false,
        parents: [s.hybrids[0].id, 'merlot'],
        name: 'Next generation',
      }),
    /Generational/,
  );
  const next = act(s, {
    ...introAction,
    introductory: false,
    name: 'Full trial',
  });
  assert.equal(next.breedingProject?.duration, 24);
  assert.equal(next.cash, s.cash - 7500);
  roundtrip(next);
});

test('old version-six saves default the new fields without touching research contracts', () => {
  let s = act(learn(funded(), 'ampelography'), {
    type: 'research',
    id: 'heritage',
  });
  const envelope = JSON.parse(serialize(s));
  for (const key of [
    'researchGoal',
    'researchShortlist',
    'unseenDiscoveries',
    'experimentCredits',
    'introCrossId',
  ])
    delete envelope.state[key];
  const restored = deserialize(JSON.stringify(envelope));
  assert.deepEqual(restored.researchProject, s.researchProject);
  assert.deepEqual(restored.researchShortlist, []);
  assert.equal(restored.introCrossId, null);
  assert.deepEqual(restored.unseenDiscoveries, []);
});

test('persistent completion notices retain concurrent results and dismiss individually', () => {
  let s = funded();
  s = act(s, { type: 'buyStudySlot' });
  s = act(s, { type: 'research', id: 'ampelography' });
  s = act(s, { type: 'research', id: 'oenology' });
  s = tick(s, 6);
  assert.deepEqual(s.unseenDiscoveries, ['ampelography', 'oenology']);
  assert.equal(activeStudies(s).length, 0);
  s = tick(roundtrip(s), 2);
  assert.equal(s.unseenDiscoveries.length, 2);
  s = act(s, { type: 'dismissDiscovery', id: 'ampelography' });
  assert.deepEqual(s.unseenDiscoveries, ['oenology']);
  roundtrip(s);
  assert.deepEqual(discoveryDestination('assemblage'), {
    view: 'cellar',
    label: 'Open reserves & blending',
    reserves: true,
  });
  assert.equal(discoveryDestination('grape_cabernet').grape, 'cabernet');
  assert.equal(discoveryDestination('tourism').investment, 'tasting');
  assert.equal(discoveryDestination('discovery').library, true);
  assert.equal(
    discoveryDestination('sensory_science').study,
    'sommelier_training',
  );
});

test('shortlists persist ordering without auto-starting or charging and remove on explicit start', () => {
  let s = funded();
  const cash = s.cash;
  for (const id of ['ampelography', 'oenology', 'tourism'] as const)
    s = act(s, { type: 'shortlistResearch', id, add: true });
  s = act(s, { type: 'moveShortlist', id: 'tourism', direction: -1 });
  assert.deepEqual(s.researchShortlist, [
    'ampelography',
    'tourism',
    'oenology',
  ]);
  assert.equal(s.cash, cash);
  s = act(s, { type: 'planResearch', goal: 'tasting_room' });
  roundtrip(s);
  s = act(s, { type: 'research', id: 'ampelography' });
  assert.deepEqual(s.researchShortlist, ['tourism', 'oenology']);
  s = tick(s, 6);
  assert.equal(activeStudies(s).length, 0);
  assert.equal(s.researchShortlist.length, 2);
  assert.throws(
    () => act(s, { type: 'shortlistResearch', id: 'ampelography', add: true }),
    /learned/,
  );
  assert.throws(
    () => act(s, { type: 'shortlistResearch', id: 'tourism', add: true }),
    /already/,
  );
  assert.throws(
    () => act(s, { type: 'moveShortlist', id: 'tourism', direction: -1 }),
    /further/,
  );
  roundtrip(s);
});

test('legacy collection rewards remove newly plantable grapes from the shortlist', () => {
  let s = learn(funded(), 'ampelography');
  s.researchProject = {
    id: 'heritage',
    remaining: 1,
    duration: 8,
    paused: false,
    legacyGrapes: ['riesling'],
  };
  s = act(s, { type: 'shortlistResearch', id: 'grape_riesling', add: true });
  roundtrip(s);
  s = tick(s, 1);
  assert.deepEqual(s.researchShortlist, []);
  assert.ok(s.grapeLicenses.includes('riesling'));
  roundtrip(s);
});

test('field observation counts only qualifying, unpaused growing weeks and awards once', () => {
  let s = learn(funded(), 'ampelography');
  s.week = 1;
  s = act(s, { type: 'research', id: 'soil_mapping' });
  assert.equal(fieldExperimentEligible(s, 'soil_mapping', 1), true);
  const cash = s.cash,
    knowledge = s.knowledge;
  s = act(s, { type: 'fieldExperiment', id: 'soil_mapping', plotId: 1 });
  assert.equal(s.cash, cash);
  assert.equal(s.knowledge, knowledge);
  s = tick(s, 1);
  assert.equal(s.researchProject?.experiment?.observed, 1);
  roundtrip(s);
  s = act(s, { type: 'pauseResearch', id: 'soil_mapping', paused: true });
  s = tick(s, 1);
  assert.equal(s.researchProject?.experiment?.observed, 1);
  s = act(s, { type: 'pauseResearch', id: 'soil_mapping', paused: false });
  s.plots[0].health = 50;
  s = tick(s, 1);
  assert.equal(s.researchProject?.experiment?.observed, 1);
  s.plots[0].health = 95;
  s = tick(s, 2);
  assert.deepEqual(s.experimentCredits, ['soil_mapping']);
  assert.equal(s.researchProject?.remaining, 5);
  assert.equal(s.researchProject?.experiment, undefined);
  s = act(s, { type: 'abandonResearch', id: 'soil_mapping' });
  s = act(roundtrip(s), { type: 'research', id: 'soil_mapping' });
  assert.equal(s.researchProject?.remaining, 12);
  assert.throws(
    () => act(s, { type: 'fieldExperiment', id: 'soil_mapping', plotId: 1 }),
    /once/,
  );
  roundtrip(s);
});

test('winter, changed grapes, and climate mismatch determine field eligibility', () => {
  let s = act(learn(funded(), 'heritage'), {
    type: 'research',
    id: 'adaptation',
  });
  assert.equal(fieldExperimentEligible(s, 'adaptation', 1), false);
  assert.throws(
    () => act(s, { type: 'fieldExperiment', id: 'adaptation', plotId: 1 }),
    /healthy parcel/,
  );
  s = learn(funded(), 'ampelography');
  s.week = 9;
  s = act(s, { type: 'research', id: 'soil_mapping' });
  s = act(s, { type: 'fieldExperiment', id: 'soil_mapping', plotId: 1 });
  s = tick(s, 3);
  assert.equal(s.researchProject?.experiment?.observed, 0);
  s.plots[0].variety = 'sauvignon';
  s = tick(s, 1);
  assert.equal(s.researchProject?.experiment?.observed, 0);
  roundtrip(s);
});

test('a healthy imported grape earns the climate observation bonus once', () => {
  let s = learn(funded(), 'heritage');
  s.week = 1;
  s.grapeLicenses.push('gewurztraminer');
  s.plots[0].variety = 'gewurztraminer';
  s.plots[0].health = 100;
  s = act(s, { type: 'research', id: 'adaptation' });
  assert.equal(fieldExperimentEligible(s, 'adaptation', 1), true);
  s = act(s, { type: 'fieldExperiment', id: 'adaptation', plotId: 1 });
  s = tick(s, 3);
  assert.equal(s.researchProject?.remaining, 11);
  assert.deepEqual(s.experimentCredits, ['adaptation']);
  roundtrip(s);
});

test('a cellar comparison consumes exact samples, saves time once and preserves scores', () => {
  let s = matchedReserves();
  s.reserves.forEach((r) => (r.components[0].directCostCents = 1200));
  const before = structuredClone(s);
  assert.equal(cellarExperimentEligible(s, [1, 2]), true);
  s = act(s, { type: 'cellarExperiment', reserveIds: [1, 2] });
  assert.equal(s.researchProject?.remaining, 7);
  assert.equal(s.cash, before.cash);
  assert.equal(s.knowledge, before.knowledge);
  assert.deepEqual(
    s.reserves.map((r) => volume(r.components)),
    [2250, 2250],
  );
  assert.deepEqual(
    s.reserves.map((r) => r.score),
    [80, 80],
  );
  assert.deepEqual(
    s.reserves.map((r) => r.components[0].directCostCents),
    [900, 900],
  );
  assert.throws(
    () => act(s, { type: 'cellarExperiment', reserveIds: [1, 2] }),
    /once/,
  );
  roundtrip(s);
});

test('comparison rejects incompatible or stale lots atomically', () => {
  const s = matchedReserves();
  const cases = [
    (x: GameState) => (x.reserves[1].components[0].year = 0),
    (x: GameState) => (x.reserves[1].components[0].ml = 749),
    (x: GameState) => (x.reserves[1].components[0].maturation!.vessel = 'oak'),
    (x: GameState) => (x.reserves[1].components[0].maturation!.weeks = 3),
    (x: GameState) =>
      (x.reserves[1].components[0].techniques = ['skin_contact']),
  ];
  for (const mutate of cases) {
    const bad = structuredClone(s);
    mutate(bad);
    const before = structuredClone(bad);
    assert.throws(
      () => act(bad, { type: 'cellarExperiment', reserveIds: [1, 2] }),
      /matching/,
    );
    assert.deepEqual(bad, before);
  }
  assert.throws(
    () => act(s, { type: 'cellarExperiment', reserveIds: [1, 1] }),
    /matching/,
  );
});

test('experiment completion frees only its study slot and removes empty sample reserves', () => {
  let s = matchedReserves();
  s = tick(s, 8);
  s = act(s, { type: 'buyStudySlot' });
  s = act(s, { type: 'research', id: 'ampelography' });
  s = act(s, { type: 'acknowledgeEvents' });
  s.reserves.forEach((r) => (r.components[0].ml = 750));
  s = act(s, { type: 'cellarExperiment', reserveIds: [1, 2] });
  assert.deepEqual(s.reserves, []);
  assert.ok(s.research.includes('sensory_science'));
  assert.ok(s.unseenDiscoveries.includes('sensory_science'));
  assert.equal(activeStudies(s)[0].id, 'ampelography');
  assert.equal(activeStudies(s)[0].remaining, 6);
  assert.equal(s.pendingEvents, 1);
  assert.match(s.events[0].text, /Sensory science completed/);
  const events = structuredClone(s.events);
  s = act(s, { type: 'acknowledgeEvents' });
  assert.equal(s.pendingEvents, 0);
  assert.ok(s.unseenDiscoveries.includes('sensory_science'));
  s = act(s, { type: 'dismissDiscovery', id: 'sensory_science' });
  assert.ok(!s.unseenDiscoveries.includes('sensory_science'));
  assert.deepEqual(s.events, events);
  roundtrip(s);
});

test('save validation rejects forged notices, trials, queues, and experiment progress', () => {
  const base = act(learn(funded(), 'ampelography'), introAction);
  for (const mutate of [
    (s: GameState) => (s.introCrossId = 'cross-99'),
    (s: GameState) => (s.breedingProject!.result.trait = 'finesse'),
    (s: GameState) => (s.unseenDiscoveries = ['tourism']),
    (s: GameState) => (s.researchShortlist = ['tourism', 'tourism']),
    (s: GameState) => (s.experimentCredits = ['soil_mapping', 'soil_mapping']),
  ]) {
    const bad = structuredClone(base);
    mutate(bad);
    assert.equal(stateSchema.safeParse(bad).success, false);
  }
  const s = act(learn(funded(), 'ampelography'), {
    type: 'research',
    id: 'soil_mapping',
  });
  s.researchProject!.experiment = {
    plotId: 1,
    variety: 'merlot',
    observed: 2,
    started: s.week,
  };
  assert.equal(stateSchema.safeParse(s).success, false);
});
