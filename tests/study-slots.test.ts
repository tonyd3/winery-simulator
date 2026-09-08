import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  newGame,
  serialize,
  deserialize,
  stateSchema,
  researchBlocked,
  upkeep,
} from '../src/game.ts';
import type { GameState } from '../src/game.ts';
import { RESEARCH, RESEARCH_IDS } from '../src/catalog.ts';
import {
  activeStudies,
  studySlotCount,
  studySlotCost,
  STUDY_SLOTS,
  researchTerms,
  researchComplete,
} from '../src/researchProgression.ts';
import { learn } from './helpers.ts';

const funded = () => ({ ...newGame(), cash: 10000000, knowledge: 100000 });
const valid = (s: GameState) => assert.deepEqual(deserialize(serialize(s)), s);
const tick = (s: GameState, weeks = 1) => {
  for (let i = 0; i < weeks; i++) s = act(s, { type: 'advance' });
  return s;
};

test('study slots are permanent purchases with escalating prices and no weekly upkeep', () => {
  let s = act(funded(), { type: 'research', id: 'ampelography' });
  const original = structuredClone(s);
  assert.equal(studySlotCount(s), 1);
  for (let slots = 2; slots <= STUDY_SLOTS.max; slots++) {
    const before = s.cash;
    assert.equal(studySlotCost(s), (slots - 1) * 5000);
    s = act(s, { type: 'buyStudySlot' });
    assert.equal(s.cash, before - (slots - 1) * 5000);
    assert.equal(s.researchSlots, slots);
    assert.deepEqual(activeStudies(s), activeStudies(original));
    assert.equal(upkeep(s), upkeep(original));
    assert.equal(s.knowledge, original.knowledge);
    assert.equal(s.week, original.week);
    assert.equal(s.seed, original.seed);
    valid(s);
  }
  const maxed = structuredClone(s);
  assert.throws(() => act(s, { type: 'buyStudySlot' }), /maximum/);
  assert.deepEqual(s, maxed);
  const poor = { ...newGame(), cash: 4999 };
  const before = structuredClone(poor);
  assert.throws(() => act(poor, { type: 'buyStudySlot' }), /need.*more/i);
  assert.deepEqual(poor, before);
  assert.equal(act({ ...poor, cash: 5000 }, { type: 'buyStudySlot' }).cash, 0);
});

test('parallel studies pay their own terms, finish together and free slots without losing another project', () => {
  let s = act(act(funded(), { type: 'buyStudySlot' }), {
    type: 'buyStudySlot',
  });
  const before = structuredClone(s);
  s = act(s, { type: 'research', id: 'ampelography' });
  assert.throws(
    () => act(s, { type: 'research', id: 'ampelography' }),
    /already in progress/,
  );
  assert.throws(
    () => act(s, { type: 'research', id: 'heritage' }),
    /Requires Vine science/,
  );
  s = act(s, { type: 'research', id: 'oenology' });
  s = act(s, { type: 'research', id: 'tourism' });
  assert.match(researchBlocked(s, 'brand_strategy')!, /slots.*occupied/);
  assert.equal(s.cash, before.cash - 1200 - 1500 - 8500);
  assert.equal(s.knowledge, before.knowledge - 40 - 35 - 90);
  s = tick(deserialize(serialize(s)), 6);
  assert.ok(s.research.includes('ampelography'));
  assert.ok(s.research.includes('oenology'));
  assert.deepEqual(
    activeStudies(s).map((p) => [p.id, p.remaining]),
    [['tourism', 6]],
  );
  assert.equal(s.researchSlots, 3);
  s = act(s, { type: 'research', id: 'heritage' });
  assert.deepEqual(
    activeStudies(s).map((p) => p.id),
    ['tourism', 'heritage'],
  );
  valid(s);
});

test('pause, resume and abandon target only the selected study across reload and slot reuse', () => {
  let s = act(funded(), { type: 'buyStudySlot' });
  s = act(s, { type: 'research', id: 'ampelography' });
  s = act(s, { type: 'research', id: 'oenology' });
  s = act(s, { type: 'pauseResearch', id: 'oenology', paused: true });
  s = tick(deserialize(serialize(s)), 2);
  assert.deepEqual(
    activeStudies(s).map((p) => [p.id, p.remaining]),
    [
      ['ampelography', 4],
      ['oenology', 6],
    ],
  );
  assert.match(researchBlocked(s, 'tourism')!, /slots.*occupied/);
  const before = structuredClone(s);
  s = act(s, { type: 'abandonResearch', id: 'ampelography' });
  assert.equal(s.cash, before.cash);
  assert.equal(s.knowledge, before.knowledge);
  assert.deepEqual(activeStudies(s), [before.additionalResearchProjects[0]]);
  assert.throws(
    () => act(s, { type: 'pauseResearch', id: 'ampelography', paused: true }),
    /no longer/,
  );
  assert.throws(
    () => act(s, { type: 'abandonResearch', id: 'ampelography' }),
    /no longer/,
  );
  s = act(s, { type: 'research', id: 'ampelography' });
  assert.equal(s.additionalResearchProjects[0].remaining, 6);
  s = act(s, { type: 'pauseResearch', id: 'oenology', paused: false });
  s = tick(s, 6);
  assert.equal(activeStudies(s).length, 0);
  assert.ok(
    s.research.includes('ampelography') && s.research.includes('oenology'),
  );
  assert.equal(s.researchSlots, 2);
  valid(s);
});

test('the research lab accelerates every running study while nursery trials remain independent', () => {
  let s = learn(funded(), 'research_methods');
  s = act(s, { type: 'upgrade', upgrade: 'lab' });
  s = act(s, { type: 'upgrade', upgrade: 'researchLab' });
  s = act(s, { type: 'buyStudySlot' });
  s = act(s, { type: 'research', id: 'field_notebooks' });
  s = act(s, { type: 'research', id: 'grape_cabernet' });
  s = act(s, {
    type: 'breed',
    parents: ['merlot', 'sauvignon'],
    trait: 'climate',
    name: 'Parallel trial',
  });
  const before = structuredClone(s);
  s = tick(s);
  assert.deepEqual(
    activeStudies(s).map((p) => p.remaining),
    activeStudies(before).map((p) => p.remaining - 2),
  );
  assert.equal(
    s.breedingProject!.remaining,
    before.breedingProject!.remaining - 2,
  );
  s = act(s, { type: 'pauseResearch', id: 'field_notebooks', paused: true });
  s = act(s, { type: 'operateUpgrade', upgrade: 'researchLab', active: false });
  const slow = structuredClone(s);
  s = tick(s);
  assert.equal(s.researchProject!.remaining, slow.researchProject!.remaining);
  assert.equal(
    s.additionalResearchProjects[0].remaining,
    slow.additionalResearchProjects[0].remaining - 1,
  );
  assert.equal(
    s.breedingProject!.remaining,
    slow.breedingProject!.remaining - 1,
  );
  s = act(s, { type: 'operateUpgrade', upgrade: 'researchLab', active: true });
  const weeks = Math.ceil(s.additionalResearchProjects[0].remaining / 2);
  s = tick(s, weeks);
  assert.ok(researchComplete(s, 'grape_cabernet'));
  assert.ok(!researchComplete(s, 'field_notebooks'));
  assert.equal(activeStudies(s).length, 1);
  valid(s);
});

test('old version-six saves and hot updates retain their paid study with one included slot', () => {
  let s = act(funded(), { type: 'research', id: 'ampelography' });
  s = act(tick(s, 2), { type: 'pauseResearch', paused: true });
  const { researchSlots, additionalResearchProjects, ...old } = s;
  const loaded = deserialize(serialize(old as GameState));
  assert.deepEqual(loaded, s);
  assert.equal(studySlotCount(old as GameState), 1);
  assert.deepEqual(activeStudies(old as GameState), [s.researchProject]);
  const hot = act(old as GameState, { type: 'buyStudySlot' });
  assert.deepEqual(hot.researchProject, s.researchProject);
  assert.equal(hot.researchSlots, 2);
  assert.deepEqual(hot.additionalResearchProjects, []);
  valid(hot);
});

test('paid legacy collection studies keep their promised grape unlocks beside a new study', () => {
  const old: any = newGame();
  delete old.grapeLicenses;
  delete old.researchSlots;
  delete old.additionalResearchProjects;
  old.version = 5;
  old.research = ['ampelography'];
  old.researchProject = { id: 'heritage', remaining: 2 };
  let s = deserialize(serialize(old));
  s.cash = 100000;
  s.knowledge = 1000;
  const promised = s.researchProject!.legacyGrapes!;
  assert.ok(promised.length > 0);
  s = act(s, { type: 'buyStudySlot' });
  s = act(s, { type: 'research', id: 'tourism' });
  s = tick(deserialize(serialize(s)), 2);
  assert.ok(promised.every((id) => s.grapeLicenses.includes(id)));
  assert.deepEqual(
    activeStudies(s).map((p) => [p.id, p.remaining]),
    [['tourism', 10]],
  );
  valid(s);
});

test('save validation rejects duplicate, over-capacity, completed and invalid additional studies', () => {
  let s = act(funded(), { type: 'buyStudySlot' });
  s = act(s, { type: 'research', id: 'ampelography' });
  s = act(s, { type: 'research', id: 'oenology' });
  const corruptions = [
    (x: any) => (x.researchSlots = 0),
    (x: any) => (x.researchSlots = 9),
    (x: any) => (x.researchSlots = 1.5),
    (x: any) => (x.researchSlots = 1),
    (x: any) => delete x.researchSlots,
    (x: any) => (x.additionalResearchProjects[0].id = 'ampelography'),
    (x: any) => (x.additionalResearchProjects[0].id = 'heritage'),
    (x: any) => (x.additionalResearchProjects[0].remaining = 0),
    (x: any) => (x.additionalResearchProjects[0].remaining = 7),
    (x: any) => (x.additionalResearchProjects[0].duration = 97),
    (x: any) => x.research.push('oenology'),
  ];
  for (const corrupt of corruptions) {
    const bad = structuredClone(s);
    corrupt(bad);
    assert.equal(stateSchema.safeParse(bad).success, false);
    assert.throws(() => deserialize(serialize(bad)), /compatible/);
  }
  valid(s);
});

test('all eight slots advance after reload and full capacity rejects further starts', () => {
  let s = learn(funded(), 'heritage', 'discovery');
  while (s.researchSlots < STUDY_SLOTS.max)
    s = act(s, { type: 'buyStudySlot' });
  const eligible = RESEARCH_IDS.filter((id) => !researchBlocked(s, id));
  assert.ok(eligible.length > 8);
  for (const id of eligible.slice(0, 8)) s = act(s, { type: 'research', id });
  const before = structuredClone(s);
  assert.throws(
    () => act(s, { type: 'research', id: eligible[8] }),
    /slots.*occupied/,
  );
  assert.deepEqual(s, before);
  s = tick(deserialize(serialize(s)));
  assert.deepEqual(
    activeStudies(s).map((p) => p.remaining),
    activeStudies(before).map((p) => p.remaining - 1),
  );
  assert.equal(s.additionalResearchProjects.length, 7);
  assert.equal(s.cash, before.cash - upkeep(before));
  for (const p of activeStudies(s))
    assert.equal(p.duration, researchTerms(s, p.id).weeks);
  assert.ok(activeStudies(s).every((p) => p.remaining < RESEARCH[p.id].weeks));
  valid(s);
});
