import { VARIETIES } from './catalog';

// Pairings are inspired by wine traditions; weights and thresholds are game balance.
export const BLEND_COMPATIBILITY = { min: -6, max: 4 };
export type GrapeLineage = { id: string; parents: [string, string] };
type Rule = { affinity: number; reason: string };
const bordeaux = new Set(['merlot', 'cabernet', 'cabernet_franc', 'malbec']);
const rhone = new Set(['grenache', 'syrah', 'mourvedre']);
const powerful = new Set([
  'cabernet',
  'syrah',
  'malbec',
  'petit_verdot',
  'zinfandel',
  'mourvedre',
]);
const aromatic = new Set(['riesling', 'gewurztraminer', 'torrontes']);
const pairKey = (a: string, b: string) => [a, b].sort().join(':');
const partners = new Map<string, Rule>([
  [
    pairKey('sauvignon', 'semillon'),
    {
      affinity: 4,
      reason: 'Fresh aromatics and a rounder texture complement each other.',
    },
  ],
  [
    pairKey('sangiovese', 'merlot'),
    {
      affinity: 3,
      reason: 'Bright cherry character meets softer, rounded fruit.',
    },
  ],
  [
    pairKey('sangiovese', 'cabernet'),
    {
      affinity: 3,
      reason: 'Lively fruit and firm structure build a fuller style.',
    },
  ],
  [
    pairKey('tempranillo', 'grenache'),
    {
      affinity: 3,
      reason: 'Savory structure gains generous fruit and warmth.',
    },
  ],
]);

function pairing(a: string, b: string, petitVerdotShare: number): Rule {
  if (a === b)
    return {
      affinity: 0,
      reason: 'Shared ancestry adds no new pairing effect.',
    };
  const partner = a === 'petit_verdot' ? b : b === 'petit_verdot' ? a : null;
  if (partner && bordeaux.has(partner)) {
    return {
      affinity: Math.max(-6, 4 - Math.max(0, petitVerdotShare - 0.2) * 20),
      reason:
        petitVerdotShare <= 0.2
          ? 'Petit Verdot adds structure as an accent. Above 20% of the recipe, its intensity starts to dominate.'
          : 'Petit Verdot is dominating this recipe. Reduce its share toward 20% or less for a supporting role.',
    };
  }
  if (bordeaux.has(a) && bordeaux.has(b))
    return {
      affinity: a === 'malbec' || b === 'malbec' ? 3 : 4,
      reason:
        'Bordeaux grapes bring rounded fruit, structure, and aromatic detail.',
    };
  if (rhone.has(a) && rhone.has(b))
    return {
      affinity: 4,
      reason:
        'A Rhône pairing: generous fruit, spice, and structure work together.',
    };
  const known = partners.get(pairKey(a, b));
  if (known) return known;
  if ((a === 'pinot' && powerful.has(b)) || (b === 'pinot' && powerful.has(a)))
    return {
      affinity: -4,
      reason:
        'The more powerful grape can overwhelm Pinot Noir’s delicate character. A smaller addition softens the clash.',
    };
  const typeA = VARIETIES[a]?.wineType,
    typeB = VARIETIES[b]?.wineType;
  if (
    typeA &&
    typeB &&
    typeA !== typeB &&
    pairKey(a, b) !== pairKey('pinot', 'chardonnay')
  )
    return {
      affinity: aromatic.has(a) || aromatic.has(b) ? -6 : -3,
      reason:
        'These red and white styles pull in different directions in this cellar’s still-wine model. Smaller additions reduce the tension.',
    };
  return {
    affinity: 0,
    reason:
      'An experimental pairing with no automatic bonus or penalty. Source quality still counts.',
  };
}

export function grapeCompatibility(
  components: { variety: string; ml: number }[],
  hybrids: readonly GrapeLineage[] = [],
) {
  const amounts = new Map<string, number>();
  for (const p of components)
    if (p.ml > 0) amounts.set(p.variety, (amounts.get(p.variety) ?? 0) + p.ml);
  const total = [...amounts.values()].reduce((n, ml) => n + ml, 0);
  const grapes = [...amounts].sort(([a], [b]) => a.localeCompare(b));
  const lineage = new Map(hybrids.map((h) => [h.id, h.parents]));
  const memo = new Map<string, Map<string, number>>();
  function ancestry(
    id: string,
    visiting = new Set<string>(),
  ): Map<string, number> {
    const cached = memo.get(id);
    if (cached) return cached;
    const parents = lineage.get(id);
    if (!parents || visiting.has(id)) return new Map([[id, 1]]);
    const next = new Set(visiting).add(id),
      result = new Map<string, number>();
    for (const parent of parents)
      for (const [grape, share] of ancestry(parent, next))
        result.set(grape, (result.get(grape) ?? 0) + share / 2);
    memo.set(id, result);
    return result;
  }
  const petitVerdotShare = grapes.reduce(
    (n, [id, ml]) => n + ((ancestry(id).get('petit_verdot') ?? 0) * ml) / total,
    0,
  );
  const pairs: {
    grapes: [string, string];
    affinity: number;
    weight: number;
    reason: string;
  }[] = [];
  for (let i = 0; i < grapes.length; i++) {
    for (let j = i + 1; j < grapes.length; j++) {
      const [a, mlA] = grapes[i],
        [b, mlB] = grapes[j];
      let affinity = 0;
      for (const [parentA, shareA] of ancestry(a))
        for (const [parentB, shareB] of ancestry(b))
          affinity +=
            pairing(parentA, parentB, petitVerdotShare).affinity *
            shareA *
            shareB;
      pairs.push({
        grapes: [a, b],
        affinity,
        weight: (mlA / total) * (mlB / total),
        reason:
          lineage.has(a) || lineage.has(b)
            ? 'This cross inherits its parents’ pairing tendencies, weighted through its ancestry. Shared ancestry adds no extra bonus.'
            : pairing(a, b, petitVerdotShare).reason,
      });
    }
  }
  const weight = pairs.reduce((n, p) => n + p.weight, 0);
  // Tiny additions have tiny effects. More grapes never stack unbounded bonuses.
  const scale = weight ? Math.min(1, 4 * weight) / weight : 0;
  const effects = pairs
    .map((p) => ({ ...p, effect: p.affinity * p.weight * scale }))
    .sort(
      (a, b) => Math.abs(b.effect) - Math.abs(a.effect) || b.weight - a.weight,
    );
  const adjustment = effects.reduce((n, p) => n + p.effect, 0);
  return {
    compatibility: Math.max(
      BLEND_COMPATIBILITY.min,
      Math.min(BLEND_COMPATIBILITY.max, adjustment),
    ),
    pairs: effects,
  };
}
