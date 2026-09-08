import { z } from 'zod';
import { REGIONS } from './catalog';
import type { RegionId } from './catalog';
import type { GameState, Wine } from './game';
import type { WineComponent } from './winemaking';

type Character = {
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
};

const REGIONAL_CHARACTER: Record<
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

export const tastingNotesSchema = z
  .object({
    aromas: z.array(z.string().min(1).max(40)).min(1).max(5),
    palate: z.string().min(1).max(240),
    origins: z.array(z.string().min(1).max(140)).min(1).max(8),
    aging: z.array(z.string().min(1).max(140)).min(1).max(3),
  })
  .strict();
export type TastingProfile = z.infer<typeof tastingNotesSchema>;
type Context = Pick<GameState, 'estates' | 'hybrids'>;

const emptyCharacter = (): Character => ({
  aromas: {},
  body: 0,
  acidity: 0,
  tannin: 0,
});
function addCharacter(target: Character, source: Character, weight: number) {
  for (const [aroma, strength] of Object.entries(source.aromas))
    target.aromas[aroma] = (target.aromas[aroma] ?? 0) + strength * weight;
  target.body += source.body * weight;
  target.acidity += source.acidity * weight;
  target.tannin += source.tannin * weight;
}

// Resolve ancestry once per profile, including crosses of earlier hybrids.
function grapeResolver(hybrids: Context['hybrids']) {
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

const percentage = (share: number) =>
  share < 0.01 ? '<1%' : `${Math.round(share * 100)}%`;

/** Descriptive only: consumes no game RNG and never changes quality or pricing. */
export function tastingProfile(
  parts: WineComponent[],
  state: Context,
): TastingProfile {
  const total = parts.reduce((n, p) => n + p.ml, 0);
  if (total <= 0) throw new Error('A tasting profile needs some wine.');
  const resolve = grapeResolver(state.hybrids);
  const result = emptyCharacter();
  const regions = new Map<RegionId, number>();
  const vessels = new Map<
    'oak' | 'steel',
    { ml: number; min: number; max: number }
  >();
  let unknown = 0;
  let heat = 0;
  let oakAroma = 0;
  let oakAge = 0;
  for (const part of parts) {
    if (part.ml <= 0) continue;
    const share = part.ml / total;
    addCharacter(result, resolve(part.variety), share);
    // Old recipes without an estate ID came from the original estate, never the active view.
    const estate = state.estates.find((e) => e.id === (part.estateId ?? 1));
    if (!estate) throw new Error('The wine’s source estate is missing.');
    const region = estate.region;
    regions.set(region, (regions.get(region) ?? 0) + part.ml);
    result.body += REGIONAL_CHARACTER[region].body * share;
    result.acidity += REGIONAL_CHARACTER[region].acidity * share;
    heat += REGIONS[region].heat * share;
    const maturation = part.maturation;
    if (!maturation) {
      unknown += part.ml;
      continue;
    }
    const recorded = vessels.get(maturation.vessel);
    vessels.set(maturation.vessel, {
      ml: (recorded?.ml ?? 0) + part.ml,
      min: Math.min(recorded?.min ?? maturation.weeks, maturation.weeks),
      max: Math.max(recorded?.max ?? maturation.weeks, maturation.weeks),
    });
    if (maturation.vessel === 'oak') {
      oakAroma += share * (0.4 + maturation.weeks * 0.12);
      oakAge += share * maturation.weeks;
    }
  }
  const ranked = Object.entries(result.aromas).sort(
    ([a, x], [b, y]) => y - x || a.localeCompare(b),
  );
  const aromas = ranked
    .filter(([, weight]) => weight >= Math.max(0.12, ranked[0][1] * 0.2))
    .slice(0, oakAroma >= 0.6 ? 3 : 4)
    .map(([name]) => name);
  if (oakAroma >= 0.15) aromas.push('Vanilla');
  if (oakAroma >= 0.6)
    aromas.push(oakAge >= 6 ? 'Toast & cedar' : 'Baking spice');
  const body =
    result.body < 2.5
      ? 'Light-bodied'
      : result.body < 3.75
        ? 'Medium-bodied'
        : 'Full-bodied';
  const acidity =
    result.acidity < 2.8 ? 'gentle' : result.acidity < 3.8 ? 'fresh' : 'bright';
  const tannin = Math.max(0, result.tannin - oakAge * 0.05);
  const texture =
    tannin < 0.5
      ? 'little tannin'
      : tannin < 2.5
        ? 'delicate tannins'
        : tannin < 3.8
          ? 'supple tannins'
          : 'firm tannins';
  const fruit =
    heat < 2
      ? 'Bright, fresh fruit'
      : heat < 4
        ? 'Rounded, ripe fruit'
        : 'Rich, sun-ripened fruit';
  const palate = `${body}, with ${acidity} acidity and ${texture}. ${fruit}${oakAge >= 2 ? ' and a gently rounded oak texture' : ''}.`;
  const origins = [...regions]
    .sort(([a, x], [b, y]) => y - x || a.localeCompare(b))
    .map(
      ([region, ml]) =>
        `${REGIONS[region].name} · ${percentage(ml / total)}. ${REGIONAL_CHARACTER[region].note}.`,
    );
  const aging = [...vessels]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([vessel, record]) => {
      const weeks =
        record.min === record.max
          ? String(record.min)
          : `${record.min}–${record.max}`;
      return `${percentage(record.ml / total)} ${vessel === 'oak' ? 'French oak' : 'stainless steel'} · ${weeks} ${record.max === 1 && record.min === 1 ? 'week' : 'weeks'} of maturation${record.max === 0 ? ' after fermentation' : ''}.`;
    });
  if (unknown)
    aging.push(
      `${percentage(unknown / total)} aging history unrecorded. Grape and region estimates only for this portion.`,
    );
  return { aromas: aromas.slice(0, 5), palate, origins, aging };
}

export function releaseTasting(wine: Wine, state: Context): TastingProfile {
  return wine.tasting ?? tastingProfile(wine.components, state);
}
