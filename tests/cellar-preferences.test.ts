import { test } from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import {
  loadCellarChoices,
  saveCellarChoices,
} from '../src/cellarPreferences.ts';
import { CELLAR_TECHNIQUE_IDS } from '../src/cellarTechniques.ts';

function browserStorage(t: TestContext) {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  });
  return values;
}

const steel = { oak: false, techniques: [] };
const all = { oak: true, techniques: [...CELLAR_TECHNIQUE_IDS] };

test('cellar choices remember each grape independently, including clearing every choice', (t) => {
  browserStorage(t);
  assert.deepEqual(
    loadCellarChoices('chardonnay', CELLAR_TECHNIQUE_IDS),
    steel,
  );
  assert.equal(saveCellarChoices('chardonnay', all), true);
  assert.deepEqual(loadCellarChoices('chardonnay', CELLAR_TECHNIQUE_IDS), all);
  assert.deepEqual(loadCellarChoices('pinot', CELLAR_TECHNIQUE_IDS), steel);
  saveCellarChoices('pinot', { oak: false, techniques: ['skin_contact'] });
  saveCellarChoices('chardonnay', steel);
  assert.deepEqual(
    loadCellarChoices('chardonnay', CELLAR_TECHNIQUE_IDS),
    steel,
  );
  assert.deepEqual(loadCellarChoices('pinot', CELLAR_TECHNIQUE_IDS), {
    oak: false,
    techniques: ['skin_contact'],
  });
});

test('remembered recipes cannot enable techniques missing from the current estate research', (t) => {
  browserStorage(t);
  saveCellarChoices('chardonnay', all);
  assert.deepEqual(loadCellarChoices('chardonnay', ['lees_aging']), {
    oak: true,
    techniques: ['lees_aging'],
  });
  assert.deepEqual(loadCellarChoices('chardonnay', []), {
    oak: true,
    techniques: [],
  });
});

test('malformed browser preferences fall back to standard steel fermentation', (t) => {
  const values = browserStorage(t);
  for (const raw of [
    '{',
    'null',
    '{}',
    JSON.stringify({ oak: 'false', techniques: [] }),
    JSON.stringify({ oak: true, techniques: ['unknown'] }),
    JSON.stringify({ oak: true, techniques: ['lees_aging', 'lees_aging'] }),
  ]) {
    values.set('terroir-cellar-choices:chardonnay', raw);
    assert.deepEqual(
      loadCellarChoices('chardonnay', CELLAR_TECHNIQUE_IDS),
      steel,
    );
  }
});

test('blocked browser storage safely falls back when loading or saving preferences', (t) => {
  browserStorage(t);
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('Storage blocked');
    },
  });
  assert.deepEqual(
    loadCellarChoices('chardonnay', CELLAR_TECHNIQUE_IDS),
    steel,
  );
  assert.equal(saveCellarChoices('chardonnay', all), false);
});
