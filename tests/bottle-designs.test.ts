import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, newGame, serialize, deserialize } from '../src/game.ts';
import {
  labelDesignSchema,
  DEFAULT_DESIGN,
  BOTTLE_FINISHES,
  LABEL_PAPERS,
} from '../src/winemaking.ts';
import type { LabelDesign } from '../src/winemaking.ts';
import {
  applyBottleLook,
  BOTTLE_LOOKS,
  labelLines,
} from '../src/bottleStudio.ts';

function readyReserve() {
  let s = act(newGame(), { type: 'harvest', id: 1 });
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: false });
  s = act(act(s, { type: 'advance' }), { type: 'advance' });
  return act(s, { type: 'reserve', id: s.batches[0].id });
}

test('every bottle design persists on releases and wine lines without changing wine or kit costs', () => {
  const base = readyReserve();
  const release = (design: typeof DEFAULT_DESIGN) =>
    act(base, {
      type: 'bottle',
      id: base.reserves[0].id,
      bottles: 2,
      line: { name: 'The orchard', design },
    });
  const classic = release(DEFAULT_DESIGN);
  for (const style of labelDesignSchema.shape.style.options)
    for (const bottle of labelDesignSchema.shape.bottle.options)
      for (const color of labelDesignSchema.shape.color.options) {
        const design = { style, bottle, color };
        const s = deserialize(serialize(release(design)));
        assert.deepEqual(s.lines[0].design, design);
        assert.deepEqual(s.wines[0].design, design);
        assert.equal(s.wines[0].quality, classic.wines[0].quality);
        assert.deepEqual(s.wines[0].components, classic.wines[0].components);
        assert.deepEqual(s.wines[0].tasting, classic.wines[0].tasting);
        assert.equal(s.cash, classic.cash);
        assert.equal(s.kits, classic.kits);
        const next = act(s, {
          type: 'bottle',
          id: s.reserves[0].id,
          bottles: 1,
          line: { id: s.lines[0].id },
        });
        const loaded = deserialize(serialize(next));
        assert.deepEqual(loaded.wines[0], s.wines[0]);
        assert.deepEqual(loaded.wines[1].design, design);
        assert.equal(loaded.wines[1].release, 2);
      }
});

test('previous label designs remain valid and unknown design values are rejected', () => {
  for (const style of ['heritage', 'estate', 'modern'])
    for (const bottle of ['shouldered', 'rounded', 'slender'])
      for (const color of ['claret', 'olive', 'ochre', 'ink'])
        assert.deepEqual(labelDesignSchema.parse({ style, bottle, color }), {
          style,
          bottle,
          color,
        });
  const s = readyReserve();
  for (const field of ['style', 'bottle', 'color', 'finish', 'paper']) {
    const design = { ...DEFAULT_DESIGN, [field]: 'unknown' };
    assert.equal(labelDesignSchema.safeParse(design).success, false);
    assert.throws(() =>
      act(s, {
        type: 'bottle',
        id: s.reserves[0].id,
        bottles: 1,
        line: { name: 'Invalid design', design },
      }),
    );
  }
});

test('finishes, paper, and personal notes survive saves and subsequent releases without affecting the wine', () => {
  const base = readyReserve();
  const bottle = (design: LabelDesign) =>
    act(base, {
      type: 'bottle',
      id: base.reserves[0].id,
      bottles: 2,
      line: { name: 'Garden after rain', design },
    });
  const plain = bottle(DEFAULT_DESIGN);
  for (const finish of Object.keys(BOTTLE_FINISHES) as NonNullable<
    LabelDesign['finish']
  >[])
    for (const paper of Object.keys(LABEL_PAPERS) as NonNullable<
      LabelDesign['paper']
    >[]) {
      const design = {
        ...DEFAULT_DESIGN,
        finish,
        paper,
        note: 'For the friends who stayed for one more glass. 🍷',
      };
      const saved = deserialize(serialize(bottle(design)));
      assert.deepEqual(saved.lines[0].design, design);
      assert.deepEqual(saved.wines[0].design, design);
      assert.deepEqual(
        { ...saved.wines[0], design: DEFAULT_DESIGN },
        plain.wines[0],
      );
      assert.equal(saved.cash, plain.cash);
      assert.equal(saved.kits, plain.kits);
      const next = deserialize(
        serialize(
          act(saved, {
            type: 'bottle',
            id: saved.reserves[0].id,
            bottles: 1,
            line: { id: saved.lines[0].id },
          }),
        ),
      );
      assert.deepEqual(next.wines[1].design, design);
      assert.deepEqual(next.wines[0], saved.wines[0]);
    }
});

test('overlong notes are rejected before consuming wine or kits', () => {
  const base = readyReserve();
  const before = serialize(base);
  assert.equal(
    labelDesignSchema.safeParse({ ...DEFAULT_DESIGN, note: 'a'.repeat(160) })
      .success,
    true,
  );
  assert.throws(() =>
    act(base, {
      type: 'bottle',
      id: base.reserves[0].id,
      bottles: 1,
      line: {
        name: 'Too long',
        design: { ...DEFAULT_DESIGN, note: 'a'.repeat(161) },
      },
    }),
  );
  assert.equal(serialize(base), before);
});

test('complete looks preserve the personal note without mutating either design', () => {
  const current = { ...DEFAULT_DESIGN, note: 'For our anniversary.' };
  for (const look of BOTTLE_LOOKS) {
    const original = structuredClone(look.design);
    const result = applyBottleLook(current, look.design);
    assert.deepEqual(result, { ...look.design, note: current.note });
    assert.equal(labelDesignSchema.safeParse(result).success, true);
    assert.deepEqual(look.design, original);
  }
  assert.deepEqual(current, {
    ...DEFAULT_DESIGN,
    note: 'For our anniversary.',
  });
});

test('back-label text wraps complete words, long names, and emoji without dropping content', () => {
  assert.deepEqual(labelLines('A wine to share', 12), ['A wine to', 'share']);
  for (const note of [
    'abcdefghijklmnop',
    '🍷'.repeat(25),
    'Été à Saint-Émilion, pour nos amis.',
  ]) {
    const lines = labelLines(note, 12);
    assert.equal(lines.join('').replace(/\s/g, ''), note.replace(/\s/g, ''));
    assert.ok(lines.every((line) => Array.from(line).length <= 12));
    assert.ok(
      lines.every((line) => !/^[\uDC00-\uDFFF]|[\uD800-\uDBFF]$/.test(line)),
    );
  }
});
