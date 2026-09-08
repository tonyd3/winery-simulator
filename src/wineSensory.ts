import { z } from 'zod';
import { CELLAR_TECHNIQUES, CELLAR_TECHNIQUE_IDS } from './cellarTechniques';
import type { CellarTechnique } from './cellarTechniques';
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
    techniques: z.array(z.string().min(1).max(140)).max(3).optional(),
    vintage: z.string().min(1).max(240).optional(),
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

// Related expressions of the same fruit, from fresher to riper. These describe
// game style, not measured compounds, sweetness, or extra bottle maturation.
const FRUIT_EXPRESSIONS: Record<string, [string, string, string]> = {
  Plum: ['Fresh plum', 'Plum', 'Plum compote'],
  'Black plum': ['Fresh black plum', 'Black plum', 'Ripe black plum'],
  'Red plum': ['Tart red plum', 'Red plum', 'Ripe red plum'],
  'Black cherry': [
    'Fresh black cherry',
    'Black cherry',
    'Black cherry preserve',
  ],
  Cherry: ['Fresh cherry', 'Cherry', 'Ripe cherry'],
  'Sour cherry': ['Tart cherry', 'Sour cherry', 'Morello cherry'],
  Blackcurrant: ['Fresh blackcurrant', 'Blackcurrant', 'Cassis'],
  Blackberry: ['Fresh blackberry', 'Blackberry', 'Blackberry preserve'],
  Blueberry: ['Fresh blueberry', 'Blueberry', 'Ripe blueberry'],
  Raspberry: ['Fresh raspberry', 'Raspberry', 'Raspberry preserve'],
  Strawberry: ['Wild strawberry', 'Strawberry', 'Ripe strawberry'],
  Redcurrant: ['Tart redcurrant', 'Redcurrant', 'Ripe redcurrant'],
  Apple: ['Green apple', 'Apple', 'Yellow apple'],
  'Green apple': ['Crisp green apple', 'Green apple', 'Ripe apple'],
  Pear: ['Crisp pear', 'Pear', 'Ripe pear'],
  Quince: ['Fresh quince', 'Quince', 'Ripe quince'],
  Lemon: ['Lemon zest', 'Lemon', 'Ripe lemon'],
  Lime: ['Lime zest', 'Lime', 'Ripe lime'],
  Grapefruit: ['Grapefruit zest', 'Grapefruit', 'Pink grapefruit'],
  Gooseberry: ['Tart gooseberry', 'Gooseberry', 'Ripe gooseberry'],
  Peach: ['White peach', 'Peach', 'Yellow peach'],
  Apricot: ['Fresh apricot', 'Apricot', 'Ripe apricot'],
  Lychee: ['Fresh lychee', 'Lychee', 'Ripe lychee'],
  'Orchard fruit': [
    'Crisp orchard fruit',
    'Orchard fruit',
    'Ripe orchard fruit',
  ],
  Fruit: ['Fresh fruit', 'Fruit', 'Ripe fruit'],
};

// A separate, stateless hash: viewing notes never advances simulation randomness.
function expressionSeed(key: string) {
  let hash = 2166136261;
  for (const char of key) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
  hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
  hash ^= hash >>> 16;
  return (hash >>> 0) / 0xffffffff;
}

function vintageCharacter(
  base: Character,
  part: WineComponent,
  region: RegionId,
) {
  const key = `${region}:${part.year}`;
  const variation = expressionSeed(key) * 2 - 1;
  const harvest = part.harvest;
  const ripeness = harvest
    ? (harvest.ripeness - 90) / 10 + (harvest.sunExposure - 0.5) * 0.6
    : 0;
  const tone = ripeness + variation * 0.65;
  const aromas: Record<string, number> = {};
  for (const [aroma, strength] of Object.entries(base.aromas)) {
    const expression = FRUIT_EXPRESSIONS[aroma];
    const fruitTone = tone + (expressionSeed(`${key}:${aroma}`) - 0.5) * 0.5;
    const name = expression
      ? expression[fruitTone < -0.3 ? 0 : fruitTone > 0.3 ? 2 : 1]
      : aroma;
    // Shift prominence within the grape's own vocabulary. Floral/herbal notes
    // come forward in fresher picks; ripe fruit leads in later picks.
    const emphasis = 0.8 + expressionSeed(`${aroma}:${key}`) * 0.4;
    const weight = strength * emphasis * (expression ? 1 : 1 - tone * 0.2);
    aromas[name] = (aromas[name] ?? 0) + weight;
  }
  return {
    aromas,
    expression: tone,
    body: base.body + ripeness * 0.3,
    acidity: base.acidity - ripeness * 0.65,
    tannin: base.tannin * (1 - ripeness * 0.08),
  };
}

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
  let fruitExpression = 0;
  let oakAroma = 0;
  let oakAge = 0;
  let sourceQuality = 0;
  let harvestMl = 0;
  let ripenessTotal = 0;
  let healthTotal = 0;
  const techniques = new Map<CellarTechnique, number>();
  for (const part of parts) {
    if (part.ml <= 0) continue;
    const share = part.ml / total;
    // Old recipes without an estate ID came from the original estate, never the active view.
    const estate = state.estates.find((e) => e.id === (part.estateId ?? 1));
    if (!estate) throw new Error('The wine’s source estate is missing.');
    const region = estate.region;
    const character = vintageCharacter(resolve(part.variety), part, region);
    addCharacter(result, character, share);
    fruitExpression +=
      (character.expression + (REGIONS[region].heat - 3) * 0.15) * share;
    sourceQuality += part.quality * share;
    if (part.harvest) {
      harvestMl += part.ml;
      ripenessTotal += part.harvest.ripeness * part.ml;
      healthTotal += part.harvest.health * part.ml;
    }
    for (const id of part.techniques ?? [])
      techniques.set(id, (techniques.get(id) ?? 0) + part.ml);
    if (part.techniques?.includes('skin_contact')) {
      result.body += 0.35 * share;
      result.tannin += 0.75 * share;
    }
    if (part.techniques?.includes('malolactic')) {
      result.acidity -= share;
      result.body += 0.25 * share;
    }
    if (part.techniques?.includes('lees_aging')) {
      result.body += 0.5 * share;
      result.aromas['Bread dough'] =
        (result.aromas['Bread dough'] ?? 0) + 0.7 * share;
    }
    regions.set(region, (regions.get(region) ?? 0) + part.ml);
    result.body += REGIONAL_CHARACTER[region].body * share;
    result.acidity += REGIONAL_CHARACTER[region].acidity * share;
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
    fruitExpression < -0.3
      ? 'Fresh, lifted fruit'
      : fruitExpression > 0.3
        ? 'Generous, ripe fruit'
        : 'Juicy, rounded fruit';
  const finish =
    harvestMl / total >= 0.5 && healthTotal / harvestMl < 60
      ? 'A softer, subdued fruit finish'
      : sourceQuality < 55
        ? 'A light, straightforward finish'
        : sourceQuality < 75
          ? 'A clear, fruit-led finish'
          : sourceQuality < 90
            ? 'Focused fruit with a lingering finish'
            : 'Layered fruit with a long finish';
  const palate = `${body}, with ${acidity} acidity and ${texture}. ${fruit}${oakAge >= 2 ? ' and a gently rounded oak texture' : ''}. ${finish}.`;
  const picking = harvestMl
    ? `${percentage(harvestMl / total)} recorded harvest: ${ripenessTotal / harvestMl < 88 ? 'picked on the fresher side' : ripenessTotal / harvestMl >= 96 ? 'picked at full ripeness' : 'picked with balanced ripeness'}, ${healthTotal / harvestMl < 60 ? 'with stressed vines muting the fruit' : healthTotal / harvestMl < 85 ? 'with some vine stress' : 'from healthy vines'}.`
    : '';
  const vintage = [
    picking,
    harvestMl < total
      ? `${percentage((total - harvestMl) / total)} harvest conditions unrecorded; vintage character is estimated.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');
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
      `${percentage(unknown / total)} aging history unrecorded. No oak or maturation assumed for this portion.`,
    );
  return {
    aromas: aromas.slice(0, 5),
    palate,
    origins,
    aging,
    vintage,
    ...(techniques.size
      ? {
          techniques: CELLAR_TECHNIQUE_IDS.filter((id) =>
            techniques.has(id),
          ).map(
            (id) =>
              `${CELLAR_TECHNIQUES[id].name} · ${percentage(techniques.get(id)! / total)} of this wine.`,
          ),
        }
      : {}),
  };
}

export function releaseTasting(wine: Wine, state: Context): TastingProfile {
  return wine.tasting ?? tastingProfile(wine.components, state);
}
