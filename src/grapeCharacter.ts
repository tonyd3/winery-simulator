import type { RegionId } from './catalog';
import type { GrapeLineage } from './blendCompatibility';

export type Character = {
  aromas: Record<string, number>;
  body: number;
  acidity: number;
  tannin: number;
};

function character(
  fruit: string,
  companion: string,
  accent: string,
  body: number,
  acidity: number,
  tannin: number,
): Character {
  return {
    aromas: { [fruit]: 1, [companion]: 0.85, [accent]: 0.55 },
    body,
    acidity,
    tannin,
  };
}

// Broad stylistic tendencies, not chemical measurements or guaranteed flavors.
export const GRAPE_CHARACTERS: Record<string, Character> = {
  merlot: character('Plum', 'Black cherry', 'Dried herbs', 3.5, 2.5, 3),
  chardonnay: character('Apple', 'Lemon', 'Pear', 3, 3.5, 0),
  pinot: character('Cherry', 'Raspberry', 'Violet', 2, 4, 2),
  cabernet: character(
    'Blackcurrant',
    'Black cherry',
    'Green pepper',
    4.5,
    3.5,
    4.5,
  ),
  sauvignon: character('Grapefruit', 'Gooseberry', 'Fresh herbs', 2, 4.5, 0),
  syrah: character('Blackberry', 'Plum', 'Black pepper', 4.5, 3, 4),
  riesling: character('Lime', 'Green apple', 'White flowers', 1.5, 5, 0),
  sangiovese: character('Sour cherry', 'Red plum', 'Dried herbs', 3, 4.5, 4),
  tempranillo: character('Cherry', 'Plum', 'Dried herbs', 3.5, 3, 3.5),
  malbec: character('Plum', 'Blackberry', 'Violet', 4, 3, 3.5),
  grenache: character('Strawberry', 'Raspberry', 'White pepper', 4, 2.5, 2.5),
  cabernet_franc: character('Raspberry', 'Redcurrant', 'Fresh herbs', 3, 4, 3),
  semillon: character('Lemon', 'Peach', 'Beeswax', 3.5, 2.5, 0),
  aligote: character('Lemon', 'Green apple', 'White flowers', 1.5, 4.5, 0),
  zinfandel: character('Blackberry', 'Raspberry', 'Black pepper', 4.5, 3, 3.5),
  viura: character('Apple', 'Lemon', 'White flowers', 2.5, 3.5, 0),
  torrontes: character('Peach', 'Grapefruit', 'Rose', 2.5, 3.5, 0),
  mourvedre: character('Blackberry', 'Black plum', 'Dried herbs', 4.5, 3, 4.5),
  petit_verdot: character('Blackcurrant', 'Blackberry', 'Violet', 4.5, 4, 5),
  nebbiolo: character('Cherry', 'Redcurrant', 'Rose', 3, 5, 5),
  chenin: character('Quince', 'Apple', 'White flowers', 3, 5, 0),
  gewurztraminer: character('Lychee', 'Peach', 'Rose', 4, 2, 0),
  vermentino: character('Lemon', 'Peach', 'Fresh herbs', 2.5, 4, 0),
  barbera: character('Sour cherry', 'Blackberry', 'Dried herbs', 3, 5, 2),
  gamay: character('Cherry', 'Raspberry', 'Peony', 1.5, 4.5, 1.5),
  carmenere: character('Black plum', 'Blackberry', 'Green pepper', 4, 3, 3.5),
  graciano: character('Blackberry', 'Blackcurrant', 'Violet', 3.5, 4.5, 4),
  petite_sirah: character('Blueberry', 'Blackberry', 'Black pepper', 5, 3.5, 5),
  pinot_gris: character('Pear', 'Apple', 'Ginger', 3, 3, 0),
  viognier: character('Apricot', 'Peach', 'Honeysuckle', 4, 2, 0),
  albarino: character('Lime', 'Peach', 'White flowers', 2.5, 4.5, 0),
  gruner_veltliner: character(
    'Green apple',
    'Lime',
    'White pepper',
    2.5,
    4.5,
    0,
  ),
  marsanne: character('Pear', 'Apricot', 'Honeysuckle', 4, 2.5, 0),
  roussanne: character('Pear', 'Peach', 'Chamomile', 3.5, 3.5, 0),
  aglianico: character('Black cherry', 'Plum', 'Dried herbs', 4.5, 4.5, 5),
  sagrantino: character('Blackberry', 'Black plum', 'Dried herbs', 5, 4, 5),
  corvina: character('Sour cherry', 'Red plum', 'Almond', 2.5, 4, 2.5),
  montepulciano: character('Plum', 'Black cherry', 'Dried herbs', 4, 3.5, 4),
  nero_davola: character('Black cherry', 'Plum', 'Black pepper', 4, 3.5, 3.5),
  dolcetto: character('Black cherry', 'Blackberry', 'Almond', 3, 2.5, 3),
  fiano: character('Pear', 'Lemon', 'Hazelnut', 3.5, 3.5, 0),
  verdicchio: character('Lemon', 'Green apple', 'Almond', 3, 4.5, 0),
  garganega: character('Pear', 'Lemon', 'Almond', 2.5, 3.5, 0),
  arneis: character('Pear', 'Peach', 'White flowers', 3, 3, 0),
  tannat: character('Blackberry', 'Blackcurrant', 'Black pepper', 5, 4, 5),
  carignan: character('Blackberry', 'Sour cherry', 'Dried herbs', 3.5, 4.5, 4),
  cinsault: character('Strawberry', 'Raspberry', 'Rose', 2, 3, 1.5),
  pinot_meunier: character('Raspberry', 'Cherry', 'Rose', 2.5, 3.5, 2),
  savagnin: character('Lemon', 'Green apple', 'White flowers', 3, 5, 0),
  melon: character('Lemon', 'Green apple', 'White flowers', 1.5, 4.5, 0),
  clairette: character('Apple', 'Peach', 'White flowers', 3, 2.5, 0),
  grenache_blanc: character('Pear', 'Lemon', 'Fresh herbs', 4, 3, 0),
  touriga_nacional: character(
    'Blackcurrant',
    'Blackberry',
    'Violet',
    4.5,
    4,
    4.5,
  ),
  touriga_franca: character('Blackberry', 'Plum', 'Rose', 4, 3.5, 3.5),
  baga: character('Sour cherry', 'Blackberry', 'Dried herbs', 3.5, 4.5, 4.5),
  mencia: character('Raspberry', 'Redcurrant', 'Fresh herbs', 2.5, 4, 2.5),
  bobal: character('Blackberry', 'Sour cherry', 'Dried herbs', 4, 4, 4),
  pinotage: character('Plum', 'Blackberry', 'Black pepper', 4, 3.5, 4),
  saperavi: character(
    'Blackberry',
    'Black cherry',
    'Dried herbs',
    4.5,
    4.5,
    4.5,
  ),
  assyrtiko: character('Lemon', 'Green apple', 'White flowers', 3, 5, 0),
  moschofilero: character('Lime', 'Green apple', 'Rose', 1.5, 4.5, 0),
  godello: character('Pear', 'Lemon', 'White flowers', 3, 4, 0),
  verdejo: character('Lemon', 'Peach', 'Fresh herbs', 2.5, 4, 0),
  rkatsiteli: character('Green apple', 'Quince', 'White flowers', 3, 4.5, 0),
};

export const REGIONAL_CHARACTER: Record<
  RegionId,
  { note: string; body: number; acidity: number }
> = {
  bordeaux: {
    note: 'Maritime freshness and rounded fruit',
    body: 0,
    acidity: 0.1,
  },
  burgundy: {
    note: 'Cool seasons favor bright fruit and freshness',
    body: -0.25,
    acidity: 0.5,
  },
  napa: {
    note: 'Warm days favor ripe fruit and a generous body',
    body: 0.4,
    acidity: -0.2,
  },
  mosel: {
    note: 'Cool river slopes favor a light, lively style',
    body: -0.4,
    acidity: 0.7,
  },
  tuscany: {
    note: 'Sunny hills favor ripe fruit with a fresh edge',
    body: 0.1,
    acidity: 0.15,
  },
  rioja: {
    note: 'Continental seasons favor fruit and freshness',
    body: 0,
    acidity: 0.2,
  },
  mendoza: {
    note: 'Sunshine and cool nights favor fullness and lift',
    body: 0.2,
    acidity: 0.35,
  },
  barossa: {
    note: 'Long, warm seasons favor rich, sun-ripened fruit',
    body: 0.65,
    acidity: -0.5,
  },
};

export const emptyCharacter = (): Character => ({
  aromas: {},
  body: 0,
  acidity: 0,
  tannin: 0,
});
export function addCharacter(
  target: Character,
  source: Character,
  weight: number,
) {
  for (const [aroma, strength] of Object.entries(source.aromas))
    target.aromas[aroma] = (target.aromas[aroma] ?? 0) + strength * weight;
  target.body += source.body * weight;
  target.acidity += source.acidity * weight;
  target.tannin += source.tannin * weight;
}

// Resolve ancestry once per profile, including crosses of earlier hybrids.
export function grapeResolver(hybrids: readonly GrapeLineage[]) {
  const parents = new Map(hybrids.map((h) => [h.id, h.parents]));
  const cache = new Map<string, Character>();
  function resolve(id: string, visiting = new Set<string>()): Character {
    if (GRAPE_CHARACTERS[id]) return GRAPE_CHARACTERS[id];
    if (cache.has(id)) return cache.get(id)!;
    const lineage = parents.get(id);
    if (!lineage || visiting.has(id))
      return character('Fruit', 'Orchard fruit', 'Floral notes', 3, 3, 2);
    const next = new Set(visiting).add(id);
    const result = emptyCharacter();
    for (const parent of lineage)
      addCharacter(result, resolve(parent, next), 0.5);
    cache.set(id, result);
    return result;
  }
  return resolve;
}
