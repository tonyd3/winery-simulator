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
import { DEFAULT_DESIGN } from '../src/winemaking.ts';
import { estateJournal } from '../src/vintageJournal.ts';

function reserve() {
  let s = act(newGame(), { type: 'harvest', id: 1 });
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: false });
  s = act(act(s, { type: 'advance' }), { type: 'advance' });
  return act(s, { type: 'reserve', id: s.batches[0].id });
}
const release = (s: GameState) =>
  act(s, {
    type: 'bottle',
    id: s.reserves[0].id,
    bottles: 10,
    line: s.lines.length
      ? { id: s.lines[0].id }
      : { name: 'First light', design: DEFAULT_DESIGN },
  });
const roundtrip = (s: GameState) =>
  assert.deepEqual(deserialize(serialize(s)), s);

test('house marks are cosmetic and each bottled release keeps its own mark', () => {
  const before = reserve();
  const firstMark = { motif: 'sun', color: 'olive', monogram: 'DH' } as const;
  const branded = act(before, { type: 'houseIdentity', identity: firstMark });
  assert.equal(branded.cash, before.cash);
  assert.equal(branded.week, before.week);
  assert.equal(branded.seed, before.seed);
  let s = release(branded);
  const plain = release(before);
  assert.equal(s.wines[0].quality, plain.wines[0].quality);
  assert.equal(s.wines[0].price, plain.wines[0].price);
  const original = structuredClone(s.wines[0]);
  s = act(s, {
    type: 'houseIdentity',
    identity: { motif: 'arch', color: 'ochre', monogram: 'XX' },
  });
  s = release(s);
  assert.deepEqual(s.wines[0], original);
  assert.deepEqual(s.wines[0].design.houseMark, firstMark);
  assert.equal(s.wines[1].design.houseMark?.monogram, 'XX');
  assert.deepEqual(
    s.vintageJournal!.chapters[0].keepsakes[0].design.houseMark,
    firstMark,
  );
  roundtrip(s);
});

test('year records preserve real harvests, release totals and notes after wine compaction', () => {
  let s = reserve();
  const harvest = s.stats.harvested;
  for (let i = 0; i < 8; i++) s = release(s);
  s = act(s, {
    type: 'vintageNote',
    year: 1,
    note: '  A bright first harvest.  ',
  });
  const chapter = s.vintageJournal!.chapters[0];
  assert.equal(chapter.harvestKg, harvest);
  assert.equal(chapter.harvests, 1);
  assert.equal(chapter.releases, 8);
  assert.equal(chapter.bottles, 80);
  assert.equal(chapter.keepsakes.length, 6);
  assert.equal(chapter.keepsakes[0].id, s.wines[2].id);
  assert.equal(chapter.note, 'A bright first harvest.');
  const expected = structuredClone(s.vintageJournal);
  s.wines = [];
  assert.deepEqual(estateJournal(s), expected);
  s.week = 13;
  s = act(s, { type: 'vintageNote', year: 2, note: 'The second year begins.' });
  assert.equal(s.vintageJournal!.chapters[0].note, chapter.note);
  assert.equal(s.vintageJournal!.chapters[1].year, 2);
  roundtrip(s);
});

test('older saves recover known releases without inventing harvest records', () => {
  const original = release(reserve());
  const raw = JSON.parse(serialize(original));
  delete raw.state.houseIdentity;
  delete raw.state.vintageJournal;
  let s = deserialize(JSON.stringify(raw));
  assert.equal(s.houseIdentity, null);
  assert.equal(s.vintageJournal, null);
  s = act(s, {
    type: 'vintageNote',
    year: 1,
    note: 'Recovered from the cellar.',
  });
  const chapter = s.vintageJournal!.chapters[0];
  assert.equal(chapter.harvestKg, 0);
  assert.equal(chapter.bottles, 10);
  assert.equal(chapter.keepsakes[0].name, original.wines[0].label);
  assert.equal(s.vintageJournal!.startedWeek, s.week);
  roundtrip(s);
});

test('invalid identity and year notes reject without changing the estate', () => {
  const s = reserve();
  const before = structuredClone(s);
  assert.throws(() => act(s, { type: 'vintageNote', year: 2, note: 'Future' }));
  assert.throws(() =>
    act(s, { type: 'vintageNote', year: 1, note: 'x'.repeat(601) }),
  );
  assert.throws(() =>
    act(s, {
      type: 'houseIdentity',
      identity: { motif: 'vine', color: 'claret', monogram: 'LONG' },
    }),
  );
  assert.deepEqual(s, before);
  const bad = structuredClone(s);
  bad.vintageJournal!.chapters.push(
    structuredClone(bad.vintageJournal!.chapters[0]),
  );
  assert.equal(stateSchema.safeParse(bad).success, false);
});

test('automatic initials remain saveable for expanding letters and emoji names', () => {
  for (const name of ['ß ß', '🍷 🍇']) {
    let s = reserve();
    s.name = name;
    s = act(s, {
      type: 'houseIdentity',
      identity: { motif: 'sun', color: 'ochre', monogram: '' },
    });
    s = release(s);
    assert.ok(s.wines[0].design.houseMark!.monogram.length > 0);
    roundtrip(s);
  }
});
