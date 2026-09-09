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
  'petite_sirah',
  'carmenere',
  'aglianico',
  'sagrantino',
  'montepulciano',
  'nero_davola',
  'tannat',
  'touriga_nacional',
  'baga',
  'bobal',
  'pinotage',
  'saperavi',
]);
const aromatic = new Set([
  'riesling',
  'gewurztraminer',
  'torrontes',
  'viognier',
  'moschofilero',
]);
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
  [
    pairKey('gamay', 'pinot'),
    {
      affinity: 3,
      reason: 'Light berry fruit complements Pinot Noir’s delicate character.',
    },
  ],
  [
    pairKey('carmenere', 'merlot'),
    {
      affinity: 3,
      reason: 'Herbal spice gains softer, rounded fruit from Merlot.',
    },
  ],
  [
    pairKey('carmenere', 'cabernet'),
    {
      affinity: 3,
      reason: 'Dark fruit and herbal detail meet Cabernet’s firm structure.',
    },
  ],
  [
    pairKey('graciano', 'tempranillo'),
    {
      affinity: 4,
      reason:
        'Graciano brings freshness and aromatic detail to Tempranillo’s savory fruit.',
    },
  ],
  [
    pairKey('graciano', 'grenache'),
    {
      affinity: 3,
      reason: 'Lively acidity balances Grenache’s generous fruit.',
    },
  ],
  [
    pairKey('petite_sirah', 'zinfandel'),
    {
      affinity: 3,
      reason:
        'Firm tannins and deep color support Zinfandel’s exuberant fruit.',
    },
  ],
  [
    pairKey('pinot_gris', 'chardonnay'),
    {
      affinity: 2,
      reason: 'Orchard fruit and rounded textures form a gentle white blend.',
    },
  ],
  [
    pairKey('albarino', 'vermentino'),
    {
      affinity: 2,
      reason:
        'Citrus character and fresh acidity keep this white blend lively.',
    },
  ],
  [
    pairKey('gruner_veltliner', 'riesling'),
    {
      affinity: 2,
      reason:
        'Peppery orchard fruit adds detail to Riesling’s bright aromatics.',
    },
  ],
  [
    pairKey('marsanne', 'roussanne'),
    {
      affinity: 4,
      reason:
        'Marsanne supplies body while Roussanne adds fragrance and finesse.',
    },
  ],
  [
    pairKey('marsanne', 'viognier'),
    {
      affinity: 3,
      reason:
        'Rounded texture carries Viognier’s floral and stone-fruit perfume.',
    },
  ],
  [
    pairKey('roussanne', 'viognier'),
    {
      affinity: 3,
      reason: 'Fragrant Rhône whites combine floral lift with finer texture.',
    },
  ],
  [
    pairKey('aglianico', 'merlot'),
    {
      affinity: 2,
      reason: 'Aglianico’s firm structure gains softer plum fruit from Merlot.',
    },
  ],
  [
    pairKey('sagrantino', 'sangiovese'),
    {
      affinity: 3,
      reason:
        'Sagrantino adds depth and tannin to Sangiovese’s bright cherry fruit.',
    },
  ],
  [
    pairKey('corvina', 'sangiovese'),
    {
      affinity: 2,
      reason:
        'Fresh cherry styles meet, with Sangiovese adding a firmer backbone.',
    },
  ],
  [
    pairKey('montepulciano', 'sangiovese'),
    {
      affinity: 3,
      reason:
        'Montepulciano’s rounded dark fruit balances Sangiovese’s lively acidity.',
    },
  ],
  [
    pairKey('nero_davola', 'syrah'),
    {
      affinity: 3,
      reason: 'Dark cherry and plum combine with Syrah’s peppery depth.',
    },
  ],
  [
    pairKey('dolcetto', 'barbera'),
    {
      affinity: 2,
      reason:
        'Barbera brings acidity to Dolcetto’s dark fruit and almond character.',
    },
  ],
  [
    pairKey('fiano', 'vermentino'),
    {
      affinity: 2,
      reason: 'Fiano’s rounded pear and nutty detail gain a fresh citrus edge.',
    },
  ],
  [
    pairKey('verdicchio', 'garganega'),
    {
      affinity: 2,
      reason:
        'Verdicchio’s bright acidity lifts Garganega’s softer orchard fruit.',
    },
  ],
  [
    pairKey('garganega', 'chardonnay'),
    {
      affinity: 3,
      reason:
        'Garganega’s floral and almond detail complements Chardonnay’s orchard fruit.',
    },
  ],
  [
    pairKey('arneis', 'pinot_gris'),
    {
      affinity: 2,
      reason:
        'Soft pear and peach aromas form a rounded, gently floral white blend.',
    },
  ],
  [
    pairKey('tannat', 'cabernet_franc'),
    {
      affinity: 3,
      reason:
        'Tannat supplies deep color and tannin while Cabernet Franc adds fragrant lift.',
    },
  ],
  [
    pairKey('carignan', 'grenache'),
    {
      affinity: 3,
      reason: 'Carignan’s savory freshness balances Grenache’s generous fruit.',
    },
  ],
  [
    pairKey('carignan', 'syrah'),
    {
      affinity: 2,
      reason: 'Savory dark fruit meets Syrah’s pepper and fuller texture.',
    },
  ],
  [
    pairKey('cinsault', 'grenache'),
    {
      affinity: 3,
      reason:
        'Cinsault adds fragrance and a lighter touch to Grenache’s ripe fruit.',
    },
  ],
  [
    pairKey('cinsault', 'syrah'),
    {
      affinity: 2,
      reason:
        'Cinsault’s red-berry perfume softens Syrah’s darker, peppery style.',
    },
  ],
  [
    pairKey('pinot_meunier', 'pinot'),
    {
      affinity: 3,
      reason:
        'Supple Meunier fruit rounds out Pinot Noir’s bright, delicate character.',
    },
  ],
  [
    pairKey('savagnin', 'chardonnay'),
    {
      affinity: 3,
      reason:
        'Savagnin’s lively acidity gives Chardonnay’s orchard fruit a firmer outline.',
    },
  ],
  [
    pairKey('melon', 'chenin'),
    {
      affinity: 2,
      reason:
        'Melon’s subtle citrus keeps Chenin’s quince and apple character fresh.',
    },
  ],
  [
    pairKey('clairette', 'grenache_blanc'),
    {
      affinity: 3,
      reason:
        'Clairette’s floral lift complements Grenache Blanc’s generous body.',
    },
  ],
  [
    pairKey('grenache_blanc', 'roussanne'),
    {
      affinity: 3,
      reason:
        'Grenache Blanc provides body while Roussanne brings fragrance and detail.',
    },
  ],
  [
    pairKey('touriga_nacional', 'touriga_franca'),
    {
      affinity: 4,
      reason:
        'Touriga Nacional supplies structure while Touriga Franca adds floral lift and rounded fruit.',
    },
  ],
  [
    pairKey('touriga_franca', 'tempranillo'),
    {
      affinity: 3,
      reason:
        'Touriga Franca’s floral fruit complements Tempranillo’s savory structure.',
    },
  ],
  [
    pairKey('baga', 'touriga_nacional'),
    {
      affinity: 2,
      reason:
        'Baga’s bright acidity meets Touriga Nacional’s dark fruit and perfume.',
    },
  ],
  [
    pairKey('mencia', 'cabernet_franc'),
    {
      affinity: 2,
      reason:
        'Fragrant red fruit and fresh herbs create a lively, finely structured blend.',
    },
  ],
  [
    pairKey('bobal', 'tempranillo'),
    {
      affinity: 3,
      reason:
        'Bobal’s fresh dark fruit adds depth to Tempranillo’s savory cherry style.',
    },
  ],
  [
    pairKey('pinotage', 'merlot'),
    {
      affinity: 3,
      reason:
        'Merlot’s supple plum fruit softens Pinotage’s firmer, spicy character.',
    },
  ],
  [
    pairKey('saperavi', 'cabernet'),
    {
      affinity: 3,
      reason:
        'Saperavi brings vivid acidity and dark fruit to Cabernet’s firm framework.',
    },
  ],
  [
    pairKey('assyrtiko', 'moschofilero'),
    {
      affinity: 3,
      reason:
        'Assyrtiko’s citrus structure supports Moschofilero’s delicate floral perfume.',
    },
  ],
  [
    pairKey('moschofilero', 'riesling'),
    {
      affinity: 2,
      reason:
        'Rose perfume joins Riesling’s lively citrus in a light, aromatic white.',
    },
  ],
  [
    pairKey('godello', 'albarino'),
    {
      affinity: 3,
      reason:
        'Godello’s rounded pear texture gains a bright citrus edge from Albariño.',
    },
  ],
  [
    pairKey('verdejo', 'sauvignon'),
    {
      affinity: 3,
      reason:
        'Verdejo’s rounded citrus fruit balances Sauvignon Blanc’s sharper herbal freshness.',
    },
  ],
  [
    pairKey('rkatsiteli', 'chenin'),
    {
      affinity: 2,
      reason:
        'Fresh apple and quince combine with Chenin’s acidity for a firm, textured white.',
    },
  ],
]);

function pairing(
  a: string,
  b: string,
  petitVerdotShare: number,
  viognierShare: number,
): Rule {
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
  if (pairKey(a, b) === pairKey('syrah', 'viognier'))
    return {
      affinity: Math.max(-6, 3 - Math.max(0, viognierShare - 0.15) * 20),
      reason:
        viognierShare <= 0.15
          ? 'Viognier adds floral lift as an accent to Syrah. Above 15% of the recipe, its perfume starts to dominate.'
          : 'Viognier’s perfume is dominating this recipe. Reduce its share toward 15% or less to support Syrah.',
    };
  const known = partners.get(pairKey(a, b));
  if (known) return known;
  if ((a === 'gamay' && powerful.has(b)) || (b === 'gamay' && powerful.has(a)))
    return {
      affinity: -3,
      reason:
        'Firm, powerful reds can overwhelm Gamay’s light berry character. Smaller additions soften the clash.',
    };
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
  const shareOf = (variety: string) =>
    grapes.reduce(
      (n, [id, ml]) => n + ((ancestry(id).get(variety) ?? 0) * ml) / total,
      0,
    );
  const petitVerdotShare = shareOf('petit_verdot');
  const viognierShare = shareOf('viognier');
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
            pairing(parentA, parentB, petitVerdotShare, viognierShare)
              .affinity *
            shareA *
            shareB;
      pairs.push({
        grapes: [a, b],
        affinity,
        weight: (mlA / total) * (mlB / total),
        reason:
          lineage.has(a) || lineage.has(b)
            ? 'This cross inherits its parents’ pairing tendencies, weighted through its ancestry. Shared ancestry adds no extra bonus.'
            : pairing(a, b, petitVerdotShare, viognierShare).reason,
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
