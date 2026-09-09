import { z } from 'zod';
import type { RegionId } from './catalog';
import type { GrapeLineage } from './blendCompatibility';
import type { CellarTechnique } from './cellarTechniques';
import { grapeResolver, REGIONAL_CHARACTER } from './grapeCharacter';

export const MATURATION_LIMIT = 12;
export const VESSEL_IDS = ['steel', 'neutral', 'oak'] as const;
export const vesselSchema = z.enum(VESSEL_IDS);
export type MaturationVessel = z.infer<typeof vesselSchema>;
export const VESSELS = {
  steel: {
    name: 'Stainless steel',
    cost: 0,
    description: 'Keep fruit and freshness. No added wood flavor.',
  },
  neutral: {
    name: 'Neutral oak',
    cost: 80,
    description: 'Well-used barrels. Develop texture with little wood flavor.',
  },
  oak: {
    name: 'French oak',
    cost: 180,
    description: 'Spice and toast. Too much time can overpower the fruit.',
  },
} as const;

const week = z.number().int().min(1).max(MATURATION_LIMIT);
const routeSchema = z
  .object({
    readyFrom: week,
    readyUntil: week,
    maxGain: z.number().finite().min(0).max(6),
    oakLimit: z.number().finite().min(1).max(10),
  })
  .strict()
  .refine((r) => r.readyFrom <= r.readyUntil, 'Invalid release window.');
export const maturationProfileSchema = z
  .object({
    version: z.literal(1),
    preferred: vesselSchema,
    advice: z.string().min(1).max(240),
    routes: z
      .object({ steel: routeSchema, neutral: routeSchema, oak: routeSchema })
      .strict(),
  })
  .strict();
export type MaturationProfile = z.infer<typeof maturationProfileSchema>;
export const maturationPlanSchema = z
  .object({
    vessel: vesselSchema,
    targetWeeks: week,
    autoTransfer: z.boolean(),
  })
  .strict();
export type MaturationPlan = z.infer<typeof maturationPlanSchema>;

type GrapeMaturation = {
  steelWeeks: number;
  woodWeeks: number;
  steelGain: number;
  oakGain: number;
  oakLimit: number;
  preferred: MaturationVessel;
  advice: string;
};
const profile = (
  steelWeeks: number,
  woodWeeks: number,
  steelGain: number,
  oakGain: number,
  oakLimit: number,
  preferred: MaturationVessel,
  advice: string,
): GrapeMaturation => ({
  steelWeeks,
  woodWeeks,
  steelGain,
  oakGain,
  oakLimit,
  preferred,
  advice,
});

// Deliberate game profiles, not appellation rules or real-world cellar schedules.
export const GRAPE_MATURATION: Record<string, GrapeMaturation> = {
  merlot: profile(
    2,
    3,
    5,
    6,
    6,
    'neutral',
    'Neutral or measured French oak suits its rounded fruit. Steel gives an earlier, fresher release.',
  ),
  chardonnay: profile(
    1,
    3,
    6,
    6,
    5,
    'steel',
    'Two strong directions: crisp and fresh in steel, or richer in oak. Lees and malolactic conversion are separate choices.',
  ),
  pinot: profile(
    2,
    3,
    5,
    6,
    5,
    'neutral',
    'Preserve its perfume in neutral oak, or add measured French oak. Delicate fruit can still reward patience.',
  ),
  cabernet: profile(
    3,
    5,
    4,
    6,
    8,
    'oak',
    'Firm structure rewards patience in French or neutral oak. Steel supports a fresher release with less integration.',
  ),
  sauvignon: profile(
    1,
    3,
    6,
    5,
    4,
    'steel',
    'Steel preserves citrus and herbs. Neutral or measured French oak offers a textured, Bordeaux-inspired alternative.',
  ),
  syrah: profile(
    2,
    4,
    5,
    6,
    7,
    'neutral',
    'Develop its dark fruit and pepper in neutral or French oak. Keep the wood in balance with the wine.',
  ),
  riesling: profile(
    1,
    2,
    6,
    3,
    2,
    'steel',
    'Steel or neutral oak preserves floral character. Strong oak can mask it; early release does not limit bottle-aging potential.',
  ),
  sangiovese: profile(
    2,
    4,
    5,
    6,
    6,
    'neutral',
    'Neutral oak develops structure with restrained wood flavor. French oak is a richer alternative.',
  ),
  tempranillo: profile(
    2,
    4,
    5,
    6,
    7,
    'oak',
    'Neutral or French oak supports a developed style. Steel keeps a young, fruit-led expression.',
  ),
  malbec: profile(
    2,
    3,
    5,
    6,
    6,
    'neutral',
    'Neutral or French oak develops texture. Steel preserves a juicy, earlier style.',
  ),
  grenache: profile(
    2,
    3,
    6,
    5,
    4,
    'neutral',
    'Favor fruit in neutral oak or steel. Use French oak carefully so wood does not cover its red-fruit character.',
  ),
  cabernet_franc: profile(
    2,
    3,
    6,
    5,
    5,
    'neutral',
    'Keep its floral and herbal lift in neutral oak or steel. Concentrated lots can support measured French oak.',
  ),
  semillon: profile(
    1,
    3,
    6,
    6,
    5,
    'steel',
    'Steel gives a fresh, unwooded style; oak offers a textured Bordeaux direction. Unwooded wine can still age in bottle.',
  ),
  aligote: profile(
    1,
    2,
    6,
    4,
    3,
    'steel',
    'Steel emphasizes freshness. Neutral oak and lees offer more texture without strong wood flavor.',
  ),
  zinfandel: profile(
    2,
    3,
    5,
    6,
    6,
    'neutral',
    'Neutral or French oak suits a developed style; steel keeps the fruit forward. Richness does not prevent over-oaking.',
  ),
  viura: profile(
    1,
    4,
    6,
    6,
    7,
    'steel',
    'Choose fresh steel or a patient wood-matured style. Both are valid directions for white Rioja-inspired wine.',
  ),
  torrontes: profile(
    1,
    2,
    6,
    3,
    2,
    'steel',
    'Preserve floral perfume in steel. Neutral oak adds a texture option; strong new-oak flavor can obscure the grape.',
  ),
  mourvedre: profile(
    3,
    5,
    4,
    6,
    7,
    'neutral',
    'Give firm structure time in neutral oak. Concentrated lots can support French oak without making wood the main flavor.',
  ),
  petit_verdot: profile(
    3,
    5,
    4,
    6,
    8,
    'oak',
    'Firm tannins reward a patient oak plan. Maturation and its role as a blending accent remain separate decisions.',
  ),
  nebbiolo: profile(
    3,
    5,
    4,
    6,
    6,
    'neutral',
    'Long development and restrained wood can coexist. Neutral oak preserves floral detail; French oak needs a measured duration.',
  ),
  chenin: profile(
    2,
    3,
    6,
    6,
    5,
    'steel',
    'Steel or neutral oak preserves freshness. Measured French oak supports a richer dry style.',
  ),
  gewurztraminer: profile(
    1,
    2,
    6,
    3,
    2,
    'neutral',
    'Steel or neutral oak keeps perfume central. Full body alone does not make strong oak flavor desirable.',
  ),
  vermentino: profile(
    1,
    2,
    6,
    4,
    3,
    'steel',
    'Steel keeps citrus and freshness. Neutral oak or lees offers a fuller alternative.',
  ),
  barbera: profile(
    2,
    3,
    6,
    5,
    5,
    'steel',
    'Steel and neutral oak suit its juicy style. Acidity is not tannin; French oak is an optional richer direction.',
  ),
  gamay: profile(
    1,
    2,
    6,
    4,
    3,
    'steel',
    'Keep lively fruit in steel, or allow more texture in neutral oak. French oak needs restraint.',
  ),
  carmenere: profile(
    2,
    3,
    5,
    6,
    6,
    'neutral',
    'Neutral or French oak develops texture. Preserve the fruit and herbs; oak cannot repair underripe grapes.',
  ),
  graciano: profile(
    2,
    4,
    5,
    6,
    6,
    'neutral',
    'Neutral or French oak can balance its aromatic intensity and firm structure. Concentrated lots reward more time.',
  ),
  petite_sirah: profile(
    3,
    5,
    4,
    6,
    8,
    'oak',
    'Firm tannins benefit from patient maturation. Even a powerful wine can be overwhelmed by too much oak.',
  ),
  pinot_gris: profile(
    1,
    2,
    6,
    5,
    4,
    'steel',
    'Choose a light Pinot Grigio direction in steel or a more textured Pinot Gris direction in neutral oak.',
  ),
  viognier: profile(
    2,
    3,
    6,
    5,
    4,
    'neutral',
    'Steel or neutral oak keeps apricot and floral aromas clear. Measured French oak can support a richer style.',
  ),
  albarino: profile(
    1,
    2,
    6,
    5,
    4,
    'steel',
    'Steel preserves freshness. Lees, neutral oak, or careful French oak can create a more textured wine.',
  ),
  gruner_veltliner: profile(
    1,
    2,
    6,
    5,
    4,
    'steel',
    'Steel or neutral oak preserves its fresh, peppery character. Richer lots can support a longer wood-matured style.',
  ),
  marsanne: profile(
    2,
    3,
    6,
    6,
    5,
    'neutral',
    'Neutral oak or steel supports its texture. French oak can add depth while freshness still matters.',
  ),
  roussanne: profile(
    2,
    3,
    6,
    6,
    5,
    'neutral',
    'Develop texture in neutral or measured French oak. Steel remains a good route for aromatic clarity.',
  ),
  aglianico: profile(
    3,
    5,
    4,
    6,
    7,
    'neutral',
    'Give its firm structure time in neutral or measured French oak. Steel offers an earlier, less integrated style.',
  ),
  sagrantino: profile(
    3,
    5,
    4,
    6,
    8,
    'neutral',
    'Patient neutral or French oak suits its powerful tannins. Concentration still does not justify unlimited wood exposure.',
  ),
  corvina: profile(
    1,
    3,
    6,
    5,
    4,
    'steel',
    'Steel preserves fresh cherry; neutral oak offers more development. This route does not simulate dried-grape styles.',
  ),
  montepulciano: profile(
    2,
    4,
    5,
    6,
    6,
    'neutral',
    'Neutral or French oak develops its dark fruit and structure. Steel keeps a more immediate, juicy style.',
  ),
  nero_davola: profile(
    2,
    3,
    5,
    6,
    6,
    'neutral',
    'Neutral or measured French oak rounds its dark fruit. Steel gives a fresh, earlier release.',
  ),
  dolcetto: profile(
    1,
    2,
    6,
    4,
    3,
    'steel',
    'Favor an early, fruit-led release in steel or neutral oak. Keep French oak restrained around its cherry and almond character.',
  ),
  fiano: profile(
    2,
    3,
    6,
    5,
    4,
    'neutral',
    'Steel preserves freshness; neutral oak or lees develops texture. Use French oak carefully around its delicate aromas.',
  ),
  verdicchio: profile(
    1,
    3,
    6,
    5,
    4,
    'steel',
    'Keep citrus and freshness in steel, or develop texture in neutral oak. Measured French oak supports a richer direction.',
  ),
  garganega: profile(
    1,
    2,
    6,
    5,
    4,
    'steel',
    'Steel keeps pear and citrus clear. Neutral oak or lees adds texture; French oak is an optional richer style.',
  ),
  arneis: profile(
    1,
    2,
    6,
    4,
    3,
    'steel',
    'Preserve pear and floral character in steel. Neutral oak offers texture without a strong wood signature.',
  ),
  tannat: profile(
    3,
    5,
    4,
    6,
    8,
    'oak',
    'Firm tannins reward time in French or neutral oak. Powerful fruit can still be overwhelmed by excessive oak.',
  ),
  carignan: profile(
    2,
    4,
    5,
    6,
    6,
    'neutral',
    'Neutral oak develops structure while preserving fruit and herbs. Steel and measured French oak offer other directions.',
  ),
  cinsault: profile(
    1,
    2,
    6,
    4,
    3,
    'steel',
    'Steel or neutral oak preserves its light red fruit and perfume. French oak needs restraint.',
  ),
  pinot_meunier: profile(
    1,
    2,
    6,
    5,
    4,
    'neutral',
    'Preserve red fruit in steel or neutral oak, with measured French oak as an alternative. This is a still-wine plan.',
  ),
  savagnin: profile(
    2,
    4,
    6,
    5,
    5,
    'neutral',
    'Choose fresh steel or patient neutral oak. Wood alone does not create oxidative or vin jaune character.',
  ),
  melon: profile(
    1,
    2,
    6,
    3,
    2,
    'steel',
    'Steel preserves its light citrus character. Lees or neutral oak adds texture; conspicuous French oak can mask the fruit.',
  ),
  clairette: profile(
    1,
    2,
    6,
    4,
    3,
    'steel',
    'Keep freshness and delicate fruit in steel. Neutral oak offers texture without making wood the main flavor.',
  ),
  grenache_blanc: profile(
    2,
    3,
    6,
    5,
    4,
    'neutral',
    'Steel or neutral oak balances texture and freshness. Measured French oak can add depth without covering pear and herbs.',
  ),
  touriga_nacional: profile(
    3,
    5,
    4,
    6,
    8,
    'oak',
    'Firm tannins welcome patient oak maturation. Neutral barrels preserve more of its violet perfume.',
  ),
  touriga_franca: profile(
    2,
    4,
    5,
    6,
    6,
    'neutral',
    'Neutral oak develops a rounded texture while keeping its flowers and fruit clear.',
  ),
  baga: profile(
    3,
    5,
    4,
    6,
    6,
    'neutral',
    'Give firm tannins time in neutral oak. French oak is an option, but keep the tart fruit in view.',
  ),
  mencia: profile(
    2,
    3,
    6,
    5,
    4,
    'neutral',
    'Steel keeps the red berries lively; neutral oak gives gentle texture without masking the herbs.',
  ),
  bobal: profile(
    2,
    4,
    5,
    6,
    7,
    'neutral',
    'Neutral oak rounds the firm fruit. Steel gives a fresher release; French oak adds a richer finish.',
  ),
  pinotage: profile(
    2,
    4,
    5,
    6,
    7,
    'oak',
    'Measured French oak supports its dark fruit and spice. Neutral oak keeps a more direct fruit character.',
  ),
  saperavi: profile(
    3,
    5,
    4,
    6,
    8,
    'oak',
    'Patient oak maturation integrates firm tannins. Neutral barrels retain the clearest dark-fruit character.',
  ),
  assyrtiko: profile(
    2,
    3,
    6,
    5,
    4,
    'steel',
    'Steel emphasizes citrus and acidity. Neutral oak offers more texture; strong wood can mask the fruit.',
  ),
  moschofilero: profile(
    1,
    2,
    6,
    3,
    2,
    'steel',
    'Release from steel while its rose and citrus are vivid. Strong French oak can overwhelm its delicate perfume.',
  ),
  godello: profile(
    2,
    3,
    6,
    6,
    5,
    'neutral',
    'Steel preserves fresh pear and lemon. Neutral or measured French oak builds a rounder texture.',
  ),
  verdejo: profile(
    1,
    3,
    6,
    4,
    3,
    'steel',
    'Steel keeps citrus and herbs vivid. Neutral oak adds texture; use French oak sparingly.',
  ),
  rkatsiteli: profile(
    2,
    3,
    6,
    5,
    4,
    'neutral',
    'Steel gives a bright apple-led wine; neutral oak rounds its texture. Skin contact is a separate cellar choice.',
  ),
};

export function resolveMaturation(
  variety: string,
  hybrids: readonly GrapeLineage[] = [],
): GrapeMaturation {
  const parents = new Map(hybrids.map((h) => [h.id, h.parents]));
  const cache = new Map<string, GrapeMaturation>();
  function resolve(id: string, visiting = new Set<string>()): GrapeMaturation {
    if (Object.hasOwn(GRAPE_MATURATION, id)) return GRAPE_MATURATION[id];
    if (cache.has(id)) return cache.get(id)!;
    const lineage = parents.get(id);
    if (!lineage || visiting.has(id))
      throw new Error('Missing grape maturation profile.');
    const next = new Set(visiting).add(id);
    const [a, b] = lineage.map((parent) => resolve(parent, next));
    const result: GrapeMaturation = {
      steelWeeks: (a.steelWeeks + b.steelWeeks) / 2,
      woodWeeks: (a.woodWeeks + b.woodWeeks) / 2,
      steelGain: (a.steelGain + b.steelGain) / 2,
      oakGain: (a.oakGain + b.oakGain) / 2,
      oakLimit: (a.oakLimit + b.oakLimit) / 2,
      preferred: a.preferred === b.preferred ? a.preferred : 'neutral',
      advice:
        'This cross inherits its parents’ development time and sensitivity to oak through its full ancestry. Choose freshness or a more developed texture.',
    };
    cache.set(id, result);
    return result;
  }
  return resolve(variety);
}

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));
const round = (n: number) => Math.round(n * 100) / 100;

/** Snapshot all routes when the harvest is processed, so later balance changes cannot alter it. */
export function createMaturationProfile(
  variety: string,
  hybrids: readonly GrapeLineage[],
  region: RegionId,
  fruitQuality: number,
  techniques: readonly CellarTechnique[] = [],
): MaturationProfile {
  const grape = resolveMaturation(variety, hybrids);
  const character = grapeResolver(hybrids)(variety);
  const skin = techniques.includes('skin_contact');
  const mlf = techniques.includes('malolactic');
  const lees = techniques.includes('lees_aging');
  const bodyChange =
    REGIONAL_CHARACTER[region].body +
    (skin ? 0.35 : 0) +
    (mlf ? 0.25 : 0) +
    (lees ? 0.5 : 0);
  const acidity =
    character.acidity + REGIONAL_CHARACTER[region].acidity - (mlf ? 1 : 0);
  const woodTime =
    (skin ? 1 : 0) -
    (mlf && character.tannin >= 3 ? 1 : 0) -
    (lees && character.tannin < 1 ? 1 : 0);
  const oakLimit = round(
    clamp(
      grape.oakLimit + bodyChange * 0.4 + (fruitQuality - 80) * 0.025,
      1,
      10,
    ),
  );
  const routes = Object.fromEntries(
    VESSEL_IDS.map((vessel) => {
      const readyFrom = clamp(
        Math.round(
          vessel === 'steel' ? grape.steelWeeks : grape.woodWeeks + woodTime,
        ),
        1,
        8,
      );
      const width =
        vessel === 'steel'
          ? 1
          : 2 + Number(character.tannin >= 4 || acidity >= 4.5);
      return [
        vessel,
        {
          readyFrom,
          readyUntil: Math.min(10, readyFrom + width),
          maxGain: round(
            vessel === 'steel'
              ? grape.steelGain
              : vessel === 'oak'
                ? grape.oakGain
                : 6,
          ),
          oakLimit,
        },
      ];
    }),
  ) as MaturationProfile['routes'];
  return {
    version: 1,
    preferred: grape.preferred,
    advice: grape.advice,
    routes,
  };
}

export const maturationCost = (vessel: MaturationVessel, tankCount: number) =>
  VESSELS[vessel].cost * tankCount;
export const oakExposure = (
  vessel: MaturationVessel,
  weeks: number,
  oakFermentation = false,
) => (vessel === 'oak' ? weeks : 0) + (oakFermentation ? 1.5 : 0);

export function maturationOutlook(
  profile: MaturationProfile,
  vessel: MaturationVessel,
  age: number,
  oakFermentation = false,
) {
  const route = profile.routes[vessel];
  const exposure = oakExposure(vessel, age, oakFermentation);
  const penalty = Math.min(8, Math.max(0, exposure - route.oakLimit) * 1.5);
  const gain =
    route.maxGain * Math.sqrt(Math.min(age, route.readyFrom) / route.readyFrom);
  return {
    ...route,
    adjustment: gain - penalty,
    overOaked: penalty > 0,
    readiness:
      age < route.readyFrom
        ? 'Developing'
        : age <= route.readyUntil
          ? 'Ready to release'
          : 'Release window passed',
    oak:
      penalty > 0
        ? 'Oak becoming dominant'
        : exposure === 0
          ? vessel === 'neutral' && age > 0
            ? 'Very little wood flavor'
            : 'No added oak flavor'
          : exposure < 2
            ? 'Subtle oak'
            : exposure < 4
              ? 'Noticeable oak'
              : 'Pronounced oak',
  };
}
