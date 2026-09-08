import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  newGame,
  researchBlocked,
  serialize,
  deserialize,
  availableVarieties,
  stateSchema,
  weeklyKnowledge,
} from '../src/game.ts';
import type { GameState, ResearchId } from '../src/game.ts';
import {
  RESEARCH,
  RESEARCH_IDS,
  TECHNIQUE_IDS,
  REGIONS,
  REGION_IDS,
  VARIETIES,
  BREEDING,
  LEGACY_VARIETY_IDS,
} from '../src/catalog.ts';
import {
  researchTerms,
  researchComplete,
  blendResearchMissing,
} from '../src/researchProgression.ts';
import { UPGRADES, upgradeActive } from '../src/investments.ts';
import { DEFAULT_DESIGN, volume } from '../src/winemaking.ts';
import { learn } from './helpers.ts';
const tick = (s: GameState, weeks: number) => {
  for (let i = 0; i < weeks; i++) s = act(s, { type: 'advance' });
  return s;
};
const funded = () => ({ ...newGame(), cash: 10000000, knowledge: 100000 });
const valid = (s: GameState) => assert.deepEqual(deserialize(serialize(s)), s);
function legacy(
  s = newGame(),
  research: string[] = [],
  project: { id: string; remaining: number } | null = null,
) {
  const { grapeLicenses, ...old } = s;
  return {
    game: 'terroir',
    savedAt: 'legacy',
    state: { ...old, version: 5, research, researchProject: project },
  };
}
function reserves() {
  const s = funded();
  s.week = 20;
  s.nextId = 3;
  s.reserves = [1, 2].map((id) => ({
    id,
    name: `Lot ${id}`,
    stored: 20,
    score: null,
    components: [
      { variety: 'merlot', year: 1, estateId: 1, ml: 30000, quality: 80 },
    ],
  }));
  return s;
}
const blend = (s: GameState) =>
  act(s, {
    type: 'blend',
    name: 'Research cuvée',
    portions: [
      { id: 1, ml: 15000 },
      { id: 2, ml: 15000 },
    ],
  });

test('85 studies form an acyclic graph and every capital investment has a research prerequisite', () => {
  assert.equal(RESEARCH_IDS.length, 85);
  assert.equal(TECHNIQUE_IDS.length, 33);
  const walk = (id: ResearchId, path: ResearchId[]) => {
    assert.ok(RESEARCH[id]);
    assert.ok(!path.includes(id));
    RESEARCH[id].requires.forEach((parent) => walk(parent, [...path, id]));
  };
  for (const id of RESEARCH_IDS) {
    walk(id, []);
    assert.ok(RESEARCH[id].cost >= 1200);
    assert.ok(RESEARCH[id].weeks >= 6);
  }
  for (const upgrade of Object.values(UPGRADES).filter((u) => !u.legacy))
    assert.ok(upgrade.research && RESEARCH[upgrade.research]);
  assert.equal(RESEARCH.genomics.weeks, 72);
  assert.equal(RESEARCH.genomics.cost, 180000);
});

test('new estates begin with only their two founders and acquisition does not bypass individual studies', () => {
  for (const region of REGION_IDS) {
    const s = newGame(region);
    assert.deepEqual(
      new Set(availableVarieties(s).map(([id]) => id)),
      new Set(REGIONS[region].starters),
    );
    valid(s);
  }
  let s = funded();
  s = act(s, { type: 'acquireEstate', region: 'mosel', name: 'River site' });
  assert.equal(availableVarieties(s).length, 2);
  assert.throws(
    () => act(s, { type: 'plant', id: 25, variety: 'riesling' }),
    /individual/,
  );
});

test('individual grape studies charge local terms once, survive reload and unlock only that grape after the full duration', () => {
  let s = learn(funded(), 'ampelography');
  const terms = researchTerms(s, 'grape_cabernet');
  assert.equal(terms.cost, Math.round(RESEARCH.grape_cabernet.cost * 0.8));
  assert.equal(terms.weeks, RESEARCH.grape_cabernet.weeks - 2);
  const before = structuredClone(s);
  s = act(s, { type: 'research', id: 'grape_cabernet' });
  assert.equal(s.cash, before.cash - terms.cost);
  assert.equal(s.knowledge, before.knowledge - terms.knowledge);
  assert.equal(s.researchProject?.duration, terms.weeks);
  assert.throws(() => act(s, { type: 'research', id: 'oenology' }), /slot/);
  s = tick(deserialize(serialize(s)), terms.weeks - 1);
  assert.ok(!researchComplete(s, 'grape_cabernet'));
  s = tick(s, 1);
  assert.ok(researchComplete(s, 'grape_cabernet'));
  assert.equal(availableVarieties(s).length, 3);
  assert.ok(!researchComplete(s, 'grape_pinot'));
  assert.equal(
    act(s, { type: 'plant', id: 3, variety: 'cabernet' }).plots[2].variety,
    'cabernet',
  );
  assert.throws(
    () => act(s, { type: 'research', id: 'grape_cabernet' }),
    /Completed/,
  );
  assert.deepEqual(before.research, ['ampelography']);
  valid(s);
});

test('research can pause across reload and abandonment frees the slot without refunds or retained progress', () => {
  let s = act(funded(), { type: 'research', id: 'ampelography' });
  s = tick(s, 2);
  s = act(s, { type: 'pauseResearch', paused: true });
  const remaining = s.researchProject!.remaining;
  s = tick(deserialize(serialize(s)), 10);
  assert.equal(s.researchProject!.remaining, remaining);
  assert.throws(() => act(s, { type: 'research', id: 'oenology' }), /slot/);
  s = act(s, { type: 'pauseResearch', paused: false });
  s = tick(s, 1);
  assert.equal(s.researchProject!.remaining, remaining - 1);
  const cash = s.cash,
    knowledge = s.knowledge;
  s = act(s, { type: 'abandonResearch' });
  assert.equal(s.cash, cash);
  assert.equal(s.knowledge, knowledge);
  assert.equal(s.researchProject, null);
  assert.ok(!s.research.includes('ampelography'));
  s = act(s, { type: 'research', id: 'ampelography' });
  assert.equal(s.researchProject?.remaining, 6);
  assert.equal(s.cash, cash - 1200);
  valid(s);
});

test('tourism discoveries unlock purchases separately and a tasting room still needs an operating visitor center', () => {
  let s = funded();
  const cash = s.cash;
  assert.throws(
    () => act(s, { type: 'upgrade', upgrade: 'tasting' }),
    /Wine tourism/,
  );
  for (const id of ['tourism', 'visitor_services', 'hospitality'] as const) {
    s = act(s, { type: 'research', id });
    s = tick(s, RESEARCH[id].weeks);
  }
  assert.deepEqual(s.upgrades, []);
  assert.ok(s.cash < cash - 8500 - 22000 - 45000);
  assert.throws(
    () => act(s, { type: 'upgrade', upgrade: 'tastingRoom' }),
    /operating/,
  );
  s = act(s, { type: 'upgrade', upgrade: 'visitorCenter' });
  const before = s.cash;
  s = act(s, { type: 'upgrade', upgrade: 'tastingRoom' });
  assert.equal(s.cash, before - 50000);
  assert.ok(upgradeActive(s, 'tastingRoom'));
  valid(s);
});

test('a starting estate can unlock a two-grape blend with only the six-week foundation study', () => {
  let s = reserves();
  s.cash = newGame().cash;
  s.knowledge = newGame().knowledge;
  s.reserves[1].components[0].variety = 'cabernet';
  s = tick(s, 1);
  const before = structuredClone(s);
  s = act(s, { type: 'research', id: 'oenology' });
  assert.equal(s.cash, before.cash - 1500);
  assert.equal(s.knowledge, before.knowledge - 35);
  s = tick(s, 5);
  assert.throws(() => blend(s), /Cellar foundations/);
  s = tick(deserialize(serialize(s)), 1);
  assert.deepEqual(s.research, ['oenology']);
  s = blend(s);
  assert.equal(volume(s.reserves.at(-1)!.components), 30000);
  assert.equal(
    new Set(s.reserves.at(-1)!.components.map((p) => p.variety)).size,
    2,
  );
  valid(s);
});

test('blend permissions check the recipe across grapes, colors, vintages and estate origins before consuming anything', () => {
  let s = reserves();
  const before = structuredClone(s);
  assert.throws(() => blend(s), /Cellar foundations/);
  assert.deepEqual(s, before);
  learn(s, 'oenology');
  assert.equal(volume(blend(s).reserves.at(-1)!.components), 30000);
  s.reserves[1].components[0].variety = 'cabernet';
  valid(blend(s));
  s.reserves[1].components.push({
    variety: 'syrah',
    year: 1,
    estateId: 1,
    ml: 15000,
    quality: 80,
  });
  const lockedRecipe = structuredClone(s);
  assert.throws(() => blend(s), /Advanced blending/);
  assert.deepEqual(s, lockedRecipe);
  learn(s, 'assemblage');
  blend(s);
  s.reserves[1].components[0].year = 2;
  assert.throws(() => blend(s), /Perpetual reserves/);
  learn(s, 'vintage_blending');
  blend(s);
  s.reserves[1].components[0].variety = 'sauvignon';
  assert.throws(() => blend(s), /Red & white/);
  learn(s, 'rose_trials');
  blend(s);
  s = act(s, { type: 'acquireEstate', region: 'mosel', name: 'River' });
  s.reserves[1].components[0].estateId = 2;
  const snapshot = structuredClone(s);
  assert.throws(() => blend(s), /Regional cuvées/);
  assert.deepEqual(s, snapshot);
  learn(s, 'regional_blending');
  valid(blend(s));
});

test('basic blending counts grapes across all selected lots, not the number of lots or source components', () => {
  const s = learn(reserves(), 'oenology');
  s.reserves[1].components[0].variety = 'cabernet';
  s.reserves.push({ ...structuredClone(s.reserves[0]), id: s.nextId++ });
  const action = {
    type: 'blend' as const,
    name: 'Three lots, two grapes',
    portions: s.reserves.map((r) => ({ id: r.id, ml: 15000 })),
  };
  valid(act(s, action));
  s.reserves[2].components[0].variety = 'syrah';
  action.portions[2].ml = 1;
  const before = structuredClone(s);
  assert.throws(() => act(s, action), /Advanced blending/);
  assert.deepEqual(s, before);
  learn(s, 'assemblage');
  valid(act(deserialize(serialize(s)), action));
});

test('nested recipes cannot hide restricted components, but legacy blends remain bottleable', () => {
  const s = reserves();
  learn(s, 'oenology');
  s.reserves[0].components.push({
    variety: 'cabernet',
    year: 2,
    estateId: 1,
    ml: 15000,
    quality: 85,
  });
  s.reserves[0].components.push({
    variety: 'syrah',
    year: 1,
    estateId: 1,
    ml: 15000,
    quality: 80,
  });
  assert.deepEqual(blendResearchMissing(s, s.reserves[0].components), [
    'assemblage',
    'vintage_blending',
  ]);
  assert.throws(() => blend(s), /Advanced blending/);
  const bottled = act(s, {
    type: 'bottle',
    id: 1,
    bottles: 10,
    line: { name: 'Legacy reserve', design: DEFAULT_DESIGN },
  });
  assert.equal(bottled.wines[0].bottles, 10);
  valid(bottled);
});

test('the Syrah and Viognier accent pairing still requires red and white blending research', () => {
  const s = learn(reserves(), 'assemblage');
  s.reserves[0].components[0].variety = 'syrah';
  s.reserves[1].components[0].variety = 'viognier';
  const action = {
    type: 'blend' as const,
    name: 'Floral lift',
    portions: [
      { id: 1, ml: 27000 },
      { id: 2, ml: 3000 },
    ],
  };
  const before = structuredClone(s);
  assert.throws(() => act(s, action), /Red & white/);
  assert.deepEqual(s, before);
  learn(s, 'rose_trials');
  valid(act(s, action));
});

test('poor research actions cannot spend money, knowledge or alter RNG and unknown grapes cannot be studied', () => {
  const s = newGame(),
    before = structuredClone(s);
  assert.match(researchBlocked(s, 'ampelography')!, /knowledge/);
  assert.throws(
    () => act(s, { type: 'research', id: 'ampelography' }),
    /knowledge/,
  );
  assert.throws(
    () => act(s, { type: 'research', id: 'grape_unknown' }),
    /Unknown/,
  );
  assert.throws(() => act(s, { type: 'research', id: 'genomics' }), /Requires/);
  assert.deepEqual(s, before);
  const poor = { ...s, knowledge: 1000, cash: 0 };
  assert.throws(() => act(poor, { type: 'research', id: 'tourism' }), /more/);
});

test('legacy research keeps original grape access, paid collection rewards and remaining study time', () => {
  let s = deserialize(
    JSON.stringify(
      legacy(newGame('bordeaux'), ['ampelography'], {
        id: 'heritage',
        remaining: 2,
      }),
    ),
  );
  assert.equal(s.version, 6);
  assert.equal(s.grapeLicenses.length, 8);
  assert.equal(s.researchProject?.remaining, 2);
  assert.equal(s.researchProject?.duration, 3);
  s = tick(deserialize(serialize(s)), 2);
  assert.ok(s.research.includes('heritage'));
  for (const id of LEGACY_VARIETY_IDS)
    if (VARIETIES[id].collection === 'heritage')
      assert.ok(researchComplete(s, `grape_${id}`));
  assert.ok(!researchComplete(s, 'grape_nebbiolo'));
  valid(s);
  const world = deserialize(
    JSON.stringify(
      legacy(newGame(), ['ampelography', 'heritage'], {
        id: 'discovery',
        remaining: 1,
      }),
    ),
  );
  assert.equal(availableVarieties(tick(world, 1)).length, 24);
  const learned = deserialize(
    JSON.stringify(
      legacy(newGame(), ['ampelography', 'heritage', 'discovery']),
    ),
  );
  assert.equal(availableVarieties(learned).length, 24);
  assert.deepEqual(learned.plots, newGame().plots);
});

test('legacy facilities keep operating and can resume without retroactive discovery fees', () => {
  const old = newGame();
  old.cash = 50000;
  old.upgrades = ['tasting'];
  old.suspendedUpgrades = ['tasting'];
  const s = deserialize(JSON.stringify(legacy(old)));
  assert.ok(!s.research.includes('tourism'));
  assert.equal(s.cash, old.cash);
  const resumed = act(s, {
    type: 'operateUpgrade',
    upgrade: 'tasting',
    active: true,
  });
  assert.ok(upgradeActive(resumed, 'tasting'));
  assert.equal(resumed.cash, s.cash);
  valid(resumed);
});

test('advanced breeding traits and hybrid parents require separate discoveries; field notebooks actually generate knowledge', () => {
  let s = learn(funded(), 'breeding');
  s.grapeLicenses.push('cabernet');
  const action = {
    type: 'breed' as const,
    parents: ['merlot', 'cabernet'] as [string, string],
    trait: 'finesse' as const,
    name: 'Fine trial',
  };
  assert.throws(() => act(s, action), /Aroma & finesse/);
  s = act(s, { ...action, trait: 'climate' });
  assert.equal(s.breedingProject!.duration, BREEDING.weeks);
  s = tick(s, 24);
  assert.equal(s.hybrids.length, 1);
  assert.throws(
    () =>
      act(s, {
        ...action,
        name: 'Second generation',
        parents: [s.hybrids[0].id, 'merlot'],
        trait: 'climate',
      }),
    /Generational/,
  );
  const before = weeklyKnowledge(s);
  learn(s, 'field_notebooks');
  assert.equal(weeklyKnowledge(s), before + 4);
  valid(s);
});

test('new cross-pollination studies are later investments and take the full 36 weeks before opening the nursery', () => {
  let s = learn(funded(), 'heritage');
  const before = structuredClone(s);
  const trial = {
    type: 'breed' as const,
    parents: ['merlot', 'sauvignon'] as [string, string],
    trait: 'climate' as const,
    name: 'Later nursery',
  };
  assert.throws(
    () => act({ ...s, cash: 37999 }, { type: 'research', id: 'breeding' }),
    /funds|Need|cash/i,
  );
  s = act(s, { type: 'research', id: 'breeding' });
  assert.equal(s.cash, before.cash - 38000);
  assert.equal(s.knowledge, before.knowledge - 320);
  assert.equal(s.researchProject?.duration, 36);
  s = tick(deserialize(serialize(s)), 35);
  assert.throws(() => act(s, trial), /Cross-pollination/);
  s = tick(s, 1);
  s = act(s, trial);
  assert.equal(s.breedingProject?.duration, 24);
  valid(s);
});

test('paid version-six breeding and assemblage studies retain their terms and completed unlocks', () => {
  for (const [id, duration] of [
    ['breeding', 24],
    ['assemblage', 14],
  ] as const) {
    let s = learn(
      reserves(),
      id === 'breeding' ? 'heritage' : 'oenology',
    );
    s.researchProject = { id, duration, remaining: 2, paused: true };
    const loaded = deserialize(serialize(s));
    assert.deepEqual(loaded, s);
    assert.equal(tick(loaded, 3).researchProject?.remaining, 2);
    s = act(loaded, { type: 'pauseResearch', id, paused: false });
    s = tick(s, 1);
    assert.ok(!s.research.includes(id));
    s = tick(deserialize(serialize(s)), 1);
    assert.ok(s.research.includes(id));
    assert.deepEqual(s.reserves, loaded.reserves);
    valid(s);
  }
});

test('save validation rejects malformed long studies and duplicate licenses rather than repairing corrupt progression', () => {
  const s = act(funded(), { type: 'research', id: 'oenology' });
  for (const corrupt of [
    (x: any) => (x.researchProject.remaining = 97),
    (x: any) => (x.researchProject.duration = 5),
    (x: any) => (x.researchProject.duration = 90),
    (x: any) => x.grapeLicenses.push(x.grapeLicenses[0]),
    (x: any) => (x.research = ['genomics']),
    (x: any) => (x.grapeLicenses = []),
    (x: any) => delete x.grapeLicenses,
  ]) {
    const bad = structuredClone(s);
    corrupt(bad);
    assert.equal(stateSchema.safeParse(bad).success, false);
  }
  assert.throws(
    () => deserialize(JSON.stringify(legacy(newGame(), ['breeding']))),
    /Invalid legacy/,
  );
});

test('an action after a hot update migrates old in-memory estates before writing new research', () => {
  const old = legacy().state as unknown as GameState;
  old.knowledge = 40;
  assert.equal(availableVarieties(old).length, 8);
  const next = act(old, { type: 'research', id: 'ampelography' });
  assert.equal(next.version, 6);
  assert.equal(next.researchProject?.remaining, 6);
  valid(next);
});

test('a paid legacy breeding trial retains its original remaining time and saved offspring', () => {
  let s = learn(funded(), 'genomics');
  s = act(s, {
    type: 'breed',
    parents: ['merlot', 'sauvignon'],
    trait: 'finesse',
    name: 'Old nursery trial',
  });
  s.breedingProject!.duration = 4;
  s.breedingProject!.remaining = 2;
  const offspring = structuredClone(s.breedingProject!.result);
  const loaded = deserialize(
    JSON.stringify(legacy(s, ['ampelography', 'breeding'])),
  );
  assert.deepEqual(loaded.breedingProject, s.breedingProject);
  assert.equal(tick(loaded, 1).hybrids.length, 0);
  const ready = tick(deserialize(serialize(loaded)), 2);
  assert.deepEqual(
    { ...ready.hybrids[0], created: offspring.created },
    offspring,
  );
  valid(ready);
});
