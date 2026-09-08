import {
  researchComplete,
  researchTerms,
  blendResearchMissing,
  breedingWeeks,
  breedingPermission,
} from './researchProgression';
import {
  UPGRADES,
  UPGRADE_IDS,
  upgradeActive,
  investmentUpkeep,
  investmentDemand,
  upgradeBlocked,
  hospitalityForecast,
  grapeStorageWeeks,
  studyWeeks,
} from './investments';
import type { Upgrade } from './investments';
export { UPGRADES } from './investments';
export type { Upgrade } from './investments';
import {
  ESTATE_LIMITS,
  DISTRICTS,
  estateIdForPlot,
  districtForPlot,
  localPlotId,
  plotId,
  districtCost,
  acquisitionCost,
} from './estates';
import { z } from 'zod';
import {
  JUDGING,
  MARKETING,
  judgingSchema,
  wineAward,
  wineBenefits,
} from './promotion';
import {
  assess,
  CELLAR_TASTING,
  combine,
  take,
  portion,
  volume,
  DEFAULT_DESIGN,
  labelDesignSchema,
  compositionSchema,
  reserveSchema,
  wineLineSchema,
} from './winemaking';
import type { LabelDesign, Reserve } from './winemaking';
import {
  MARKET_SEED,
  WEEKLY_DEMAND,
  marketConditions,
  releaseInterest,
  weeklyDemandMultiplier,
} from './market';

export const SAVE_KEY = 'terroir.save.v1';
export const BACKUP_KEY = 'terroir.backup.v1';
export const BOTTLE_PRICE = { min: 1, max: 1000 };
export const PLOT_EXPANSION = {
  max: 4,
  step: 0.5,
  costPerHectare: 1500,
  upkeep: 15,
};
export const hectares = (area: number) =>
  area.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
export const CELLAR_EQUIPMENT = {
  tankLiters: 150,
  tankCost: 1200,
  baysPerExtension: 4,
  maxBays: 256,
};
export const CELLAR_QUALITY = {
  temperatureControl: 3,
  oakMaturity: 6,
  steelMaturity: 3,
};
export const money = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
import {
  VARIETIES,
  REGIONS,
  REGION_IDS,
  RESEARCH,
  RESEARCH_IDS,
  TRAITS,
  BREEDING,
} from './catalog';
import type {
  Variety,
  Grape,
  RegionId,
  ResearchId,
  BreedingTrait,
} from './catalog';
export { VARIETIES, REGIONS, REGION_IDS, RESEARCH, RESEARCH_IDS, TRAITS };
export type { Variety, RegionId, ResearchId, BreedingTrait };
export const LAND = [
  {
    id: 1,
    name: 'South slope',
    soil: 'Clay',
    aspect: 'South-facing',
    area: '1.2',
    cost: 0,
    yield: 360,
    x: 475,
    y: 262,
  },
  {
    id: 2,
    name: 'Limestone terrace',
    soil: 'Limestone',
    aspect: 'East-facing',
    area: '0.8',
    cost: 0,
    yield: 280,
    x: 700,
    y: 377,
  },
  {
    id: 3,
    name: 'Orchard field',
    soil: 'Chalk',
    aspect: 'West-facing',
    area: '1.0',
    cost: 0,
    yield: 310,
    x: 248,
    y: 378,
  },
  {
    id: 4,
    name: 'Hilltop parcel',
    soil: 'Chalk',
    aspect: 'South-facing',
    area: '1.4',
    cost: 4200,
    yield: 420,
    x: 708,
    y: 147,
  },
  {
    id: 5,
    name: 'River meadow',
    soil: 'Clay',
    aspect: 'East-facing',
    area: '1.1',
    cost: 3500,
    yield: 340,
    x: 475,
    y: 495,
  },
  {
    id: 6,
    name: 'Old stone field',
    soil: 'Limestone',
    aspect: 'West-facing',
    area: '1.3',
    cost: 4800,
    yield: 400,
    x: 245,
    y: 147,
  },
] as const;
const bounded = (max = 1e12) => z.number().finite().min(0).max(max);
const integer = (max = 1e9) => bounded(max).int();
const varietySchema = z.string().min(1).max(32);
const hybridSchema = z
  .object({
    id: z.string().regex(/^cross-[1-9][0-9]*$/),
    name: z.string().trim().min(1).max(28),
    color: z.string().regex(/^#[0-9a-f]{6}$/i),
    wineType: z.enum(['Red', 'White']),
    planting: integer(2000),
    preferred: z.string().min(1).max(20),
    note: z.string().max(180),
    heat: z.number().min(1).max(5),
    resilience: integer(7),
    finesse: z.number().min(-2).max(8),
    yieldFactor: z.number().min(0.75).max(1.1),
    collection: z.literal('discovery'),
    parents: z.tuple([varietySchema, varietySchema]),
    trait: z.enum(['climate', 'resilience', 'finesse']),
    created: integer(100000),
  })
  .strict();
const plotSchema = z
  .object({
    id: z.number().int().min(1).max(192),
    owned: z.boolean(),
    variety: varietySchema.nullable(),
    growth: bounded(100),
    health: bounded(100),
    tended: z.number().int().min(-1).max(100000),
    harvestedYear: integer(10000),
    // Additive save fields: established rows yield now; new planted rows join next spring.
    expansions: integer(PLOT_EXPANSION.max).default(0),
    bearingExpansions: integer(PLOT_EXPANSION.max).default(0),
  })
  .strict();
const grapeSchema = z
  .object({
    id: integer(),
    variety: varietySchema,
    kg: integer(1800),
    quality: bounded(100),
    picked: integer(100000),
    estateId: z.number().int().min(1).max(8).optional(),
  })
  .strict();
const batchSchema = z
  .object({
    id: integer(),
    variety: varietySchema,
    liters: integer(1260).min(1),
    tankIds: z.array(z.number().int().min(1).max(256)).min(1).max(9),
    quality: bounded(100),
    stage: z.enum(['fermenting', 'ready', 'aging']),
    remaining: integer(3),
    age: integer(8),
    oak: z.boolean(),
    year: integer(10000),
    // Absent in older saves: preserve those batches' existing maturation curve.
    agingProfile: z.literal('balanced').optional(),
    estateId: z.number().int().min(1).max(8).optional(),
  })
  .strict();
const legacyWineSchema = z
  .object({
    id: integer(),
    variety: varietySchema,
    quality: bounded(100),
    bottles: integer(1000000),
    price: z.number().int().min(BOTTLE_PRICE.min).max(BOTTLE_PRICE.max),
    listed: z.boolean(),
    year: integer(10000),
    label: z.string().trim().min(1).max(40),
  })
  .strict();
const wineSchema = legacyWineSchema.extend({
  lineId: integer(),
  release: integer(1000).min(1),
  produced: integer(1000000).nullable(),
  // Older releases lack production totals; count their sales from this update on.
  salesSinceTracking: integer(1000000).default(0),
  marketingWeeks: integer(MARKETING.weeks).default(0),
  judging: judgingSchema.nullable().default(null),
  bottled: integer(100000),
  components: compositionSchema,
  design: labelDesignSchema,
  estate: z.string().trim().min(1).max(32),
  founded: integer(10000),
});
export const stateSchema = z
  .object({
    version: z.literal(6),
    cellar: z
      .object({
        bays: z
          .number()
          .int()
          .min(4)
          .max(CELLAR_EQUIPMENT.maxBays)
          .multipleOf(4),
        expansions: integer(63),
        tanks: z
          .array(
            z
              .object({
                id: z.number().int().min(1).max(CELLAR_EQUIPMENT.maxBays),
                // Existing saves retain the tanks they already owned.
                capacity: z.union([z.literal(150), z.literal(400)]),
              })
              .strict(),
          )
          .min(2)
          .max(CELLAR_EQUIPMENT.maxBays),
      })
      .strict(),
    estates: z
      .array(
        z
          .object({
            id: z.number().int().min(1).max(8),
            name: z.string().trim().min(1).max(32),
            region: z.enum(REGION_IDS),
            districts: z.number().int().min(1).max(4),
            founded: integer(10000).min(1),
          })
          .strict(),
      )
      .min(1)
      .max(8),
    activeEstate: z.number().int().min(1).max(8),
    region: z.enum(REGION_IDS),
    legacyLand: z.boolean(),
    knowledge: integer(),
    research: z.array(z.enum(RESEARCH_IDS)).max(RESEARCH_IDS.length),
    grapeLicenses: z
      .array(z.string().refine((id) => Object.hasOwn(VARIETIES, id)))
      .max(24),
    researchProject: z
      .object({
        id: z.enum(RESEARCH_IDS),
        remaining: z.number().int().min(1).max(96),
        duration: z.number().int().min(1).max(96).optional(),
        paused: z.boolean().default(false),
        legacyGrapes: z
          .array(z.string().refine((id) => Object.hasOwn(VARIETIES, id)))
          .max(24)
          .optional(),
      })
      .strict()
      .nullable(),
    hybrids: z.array(hybridSchema).max(60),
    breedingProject: z
      .object({
        result: hybridSchema,
        remaining: z.number().int().min(1).max(24),
        duration: z.number().int().min(3).max(24),
      })
      .strict()
      .nullable(),
    nextHybrid: z.number().int().min(1).max(100000),
    name: z.string().trim().min(1).max(32),
    week: z.number().int().min(1).max(100000),
    cash: bounded(),
    reputation: bounded(100),
    plots: z.array(plotSchema).min(6).max(192),
    grapes: z.array(grapeSchema).max(576),
    batches: z.array(batchSchema).max(CELLAR_EQUIPMENT.maxBays),
    wines: z.array(wineSchema).max(1000),
    reserves: z.array(reserveSchema).max(ESTATE_LIMITS.reserves),
    lines: z.array(wineLineSchema).max(1000),
    kits: integer(1000000),
    upgrades: z.array(z.enum(UPGRADE_IDS)).max(UPGRADE_IDS.length),
    suspendedUpgrades: z
      .array(z.enum(UPGRADE_IDS))
      .max(UPGRADE_IDS.length)
      .default([]),
    deliveries: z
      .array(
        z.object({ kits: integer(1000000), arrival: integer(100000) }).strict(),
      )
      .max(100),
    log: z
      .array(
        z
          .object({
            week: integer(100000),
            text: z.string().max(240),
            type: z.enum(['good', 'info', 'warning']),
          })
          .strict(),
      )
      .min(1)
      .max(40),
    ledger: z
      .array(
        z
          .object({
            week: integer(100000),
            label: z.string().max(100),
            amount: z.number().finite().min(-1e12).max(1e12),
          })
          .strict(),
      )
      .max(80),
    stats: z
      .object({
        harvested: integer(),
        bottled: integer(),
        sold: integer(),
        revenue: bounded(),
        best: bounded(100),
      })
      .strict(),
    // Retained for old saves; new milestones derive completion from estate progress.
    claimed: z.array(z.string().max(20)).max(5),
    nextId: integer(),
    helpWeek: z.number().int().min(-1).max(100000),
    debt: bounded(3000),
    seed: integer(4294967295),
    marketSeed: integer(4294967295).default(MARKET_SEED),
  })
  .strict()
  .superRefine((s, ctx) => {
    const fail = (message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, message });
    const known = new Set(Object.keys(VARIETIES));
    const hybridIds = new Set<string>();
    for (const h of s.hybrids) {
      if (
        known.has(h.id) ||
        hybridIds.has(h.id) ||
        Number(h.id.slice(6)) >= s.nextHybrid ||
        h.created > s.week ||
        h.parents[0] === h.parents[1] ||
        h.parents.some((p) => !known.has(p))
      )
        fail('Invalid grape lineage.');
      known.add(h.id);
      hybridIds.add(h.id);
    }
    if (
      [...s.plots, ...s.grapes, ...s.batches, ...s.wines].some(
        (x) => x.variety !== null && !known.has(x.variety),
      )
    )
      fail('Unknown grape variety.');
    if (
      REGIONS[s.region].starters.some(
        (id) => !researchComplete(s, `grape_${id}`),
      ) ||
      new Set(s.grapeLicenses).size !== s.grapeLicenses.length ||
      new Set(s.research).size !== s.research.length ||
      s.research.some((r) =>
        RESEARCH[r].requires.some((p) => !s.research.includes(p)),
      )
    )
      fail('Invalid research progression.');
    if (
      s.researchProject &&
      (researchComplete(s, s.researchProject.id) ||
        s.researchProject.remaining >
          (s.researchProject.duration ??
            RESEARCH[s.researchProject.id].weeks) ||
        (s.researchProject.duration ?? 0) >
          RESEARCH[s.researchProject.id].weeks ||
        RESEARCH[s.researchProject.id].requires.some(
          (r) => !s.research.includes(r),
        ))
    )
      fail('Invalid research project.');
    if (s.hybrids.length && !s.research.includes('breeding'))
      fail('The nursery has not been researched.');
    if (s.breedingProject) {
      const b = s.breedingProject,
        h = b.result;
      if (
        !s.research.includes('breeding') ||
        known.has(h.id) ||
        Number(h.id.slice(6)) >= s.nextHybrid ||
        h.parents[0] === h.parents[1] ||
        h.parents.some((p) => !known.has(p)) ||
        h.created > s.week ||
        b.remaining > b.duration ||
        s.hybrids.length >= 60
      )
        fail('Invalid breeding trial.');
    }
    const estateIds = new Set(s.estates.map((e) => e.id));
    if (
      s.estates.some(
        (e, i) => e.id !== i + 1 || e.founded > calendar(s.week).year,
      ) ||
      new Set(s.estates.map((e) => e.region)).size !== s.estates.length ||
      !estateIds.has(s.activeEstate) ||
      s.estates[0]?.region !== s.region
    )
      fail('Invalid estate portfolio.');
    const expectedPlots = s.estates.flatMap((e) =>
      Array.from({ length: e.districts * 6 }, (_, i) => plotId(e.id) + i),
    );
    const actualPlots = new Set(s.plots.map((p) => p.id));
    if (
      s.plots.length !== expectedPlots.length ||
      actualPlots.size !== expectedPlots.length ||
      expectedPlots.some((id) => !actualPlots.has(id))
    )
      fail('Invalid estate parcels.');
    if (
      [
        ...s.grapes,
        ...s.batches,
        ...s.reserves.flatMap((r) => r.components),
        ...s.wines.flatMap((w) => w.components),
      ].some((x) => !estateIds.has(x.estateId ?? 1))
    )
      fail('Unknown wine origin estate.');
    if (new Set(s.upgrades).size !== s.upgrades.length)
      fail('Duplicate upgrades.');
    if (
      new Set(s.suspendedUpgrades).size !== s.suspendedUpgrades.length ||
      s.suspendedUpgrades.some(
        (id) => !s.upgrades.includes(id) || id === 'cellar',
      )
    )
      fail('Invalid suspended investments.');
    if (
      s.upgrades.some(
        (id) =>
          UPGRADES[id].requires && !s.upgrades.includes(UPGRADES[id].requires!),
      )
    )
      fail('Missing investment prerequisite.');
    if (
      s.cellar.tanks.length > s.cellar.bays ||
      s.cellar.expansions * 4 > s.cellar.bays - 4 ||
      s.cellar.tanks.some((t, i) => t.id !== i + 1)
    )
      fail('Invalid cellar equipment.');
    const occupied = new Set<number>();
    for (const batch of s.batches) {
      let capacity = 0;
      for (const id of batch.tankIds) {
        const tank = s.cellar.tanks.find((t) => t.id === id);
        if (!tank || occupied.has(id)) fail('Invalid occupied tank.');
        occupied.add(id);
        capacity += tank?.capacity ?? 0;
      }
      if (batch.liters > capacity) fail('Wine exceeds its tank capacity.');
    }
    const ids = [
      ...s.grapes,
      ...s.batches,
      ...s.wines,
      ...s.reserves,
      ...s.lines,
    ].map((x) => x.id);
    if (new Set(ids).size !== ids.length || ids.some((id) => id >= s.nextId))
      fail('Invalid inventory identifiers.');
    const lineIds = new Set(s.lines.map((l) => l.id));
    const releases = new Set<string>();
    for (const lot of [...s.reserves, ...s.wines]) {
      if (
        volume(lot.components) > 100000000 ||
        lot.components.some(
          (p) => !known.has(p.variety) || p.year > calendar(s.week).year,
        )
      )
        fail('Invalid wine composition.');
    }
    if (
      s.reserves.some((r) => r.stored > s.week) ||
      s.lines.some((l) => l.founded > calendar(s.week).year)
    )
      fail('Invalid cellar dates.');
    for (const w of s.wines) {
      const release = `${w.lineId}:${w.release}`;
      if (
        !lineIds.has(w.lineId) ||
        releases.has(release) ||
        (w.produced !== null &&
          (w.bottles > w.produced ||
            volume(w.components) !== w.produced * 750)) ||
        w.bottled > s.week ||
        w.founded > calendar(w.bottled).year ||
        !w.components.some((p) => p.variety === w.variety)
      )
        fail('Invalid wine release.');
      releases.add(release);
    }
    for (const line of s.lines) {
      const numbers = s.wines
        .filter((w) => w.lineId === line.id)
        .map((w) => w.release)
        .sort((a, b) => a - b);
      if (numbers.some((n, i) => n !== i + 1))
        fail('Invalid release sequence.');
    }
    if (s.batches.some((b) => b.year > calendar(s.week).year))
      fail('Invalid harvest year.');
    if (
      s.plots.some(
        (p) =>
          p.bearingExpansions > p.expansions ||
          (!p.owned && p.expansions > 0) ||
          (!p.variety && p.bearingExpansions !== p.expansions),
      )
    )
      fail('Invalid plot expansion.');
    if (s.plots.some((p) => !p.owned && p.variety !== null))
      fail('Unowned parcels cannot be planted.');
    if (
      s.grapes.some((g) => g.picked > s.week) ||
      s.deliveries.some((d) => d.arrival < s.week)
    )
      fail('Invalid inventory dates.');
    if (
      s.batches.some((b) =>
        b.stage === 'fermenting' ? b.remaining < 1 : b.remaining !== 0,
      )
    )
      fail('Invalid fermentation progress.');
  });
export type GameState = z.infer<typeof stateSchema>;
export type Plot = GameState['plots'][number];
export type Batch = GameState['batches'][number];
export type Wine = GameState['wines'][number];

export function wineSales(wines: readonly Wine[]) {
  return {
    count: wines.reduce(
      (total, wine) =>
        total +
        (wine.produced === null
          ? (wine.salesSinceTracking ?? 0)
          : wine.produced - wine.bottles),
      0,
    ),
    complete: wines.every((wine) => wine.produced !== null),
  };
}
export type Action =
  | { type: 'expandCellar' }
  | { type: 'buyTank'; count?: number }
  | { type: 'acquireEstate'; region: RegionId; name: string }
  | { type: 'expandEstate'; id: number }
  | { type: 'visitEstate'; id: number }
  | { type: 'advance' }
  | { type: 'research'; id: ResearchId }
  | { type: 'pauseResearch'; paused: boolean }
  | { type: 'abandonResearch' }
  | {
      type: 'breed';
      parents: [Variety, Variety];
      trait: BreedingTrait;
      name: string;
    }
  | { type: 'uproot'; id: number }
  | { type: 'tend'; id: number }
  | { type: 'harvest'; id: number }
  | { type: 'buyPlot'; id: number }
  | { type: 'expandPlot'; id: number }
  | { type: 'plant'; id: number; variety: Variety }
  | { type: 'ferment'; id: number; oak: boolean }
  | { type: 'age'; id: number }
  | { type: 'reserve'; id: number }
  | { type: 'tasteReserve'; id: number }
  | { type: 'blend'; name: string; portions: { id: number; ml: number }[] }
  | {
      type: 'bottle';
      id: number;
      bottles: number;
      line: { id: number } | { name: string; design: LabelDesign };
    }
  | { type: 'sellGrapes'; id: number }
  | { type: 'supplies' }
  | { type: 'upgrade'; upgrade: Upgrade }
  | { type: 'operateUpgrade'; upgrade: Upgrade; active: boolean }
  | { type: 'price'; id: number; price: number }
  | { type: 'list'; id: number }
  | { type: 'wholesale'; id: number }
  | { type: 'marketWine'; id: number }
  | { type: 'judgeWine'; id: number }
  | { type: 'label'; id: number; name: string }
  | { type: 'rename'; name: string }
  | { type: 'work' }
  | { type: 'loan' }
  | { type: 'repay' };

export const calendar = (week: number) => ({
  year: Math.floor((week - 1) / 12) + 1,
  season: ['Spring', 'Summer', 'Autumn', 'Winter'][
    Math.floor(((week - 1) % 12) / 3)
  ],
  week: ((week - 1) % 12) + 1,
});
export function newGame(
  region: RegionId = 'bordeaux',
  name = 'Domaine Bellevue',
): GameState {
  if (!REGION_IDS.includes(region)) throw new Error('Choose a wine region.');
  if (!name.trim() || name.trim().length > 32)
    throw new Error('Use an estate name between 1 and 32 characters.');
  const r = REGIONS[region];
  return {
    version: 6,
    cellar: {
      bays: 4,
      expansions: 0,
      tanks: [
        { id: 1, capacity: 150 },
        { id: 2, capacity: 150 },
      ],
    },
    estates: [{ id: 1, name: name.trim(), region, districts: 1, founded: 1 }],
    activeEstate: 1,
    region,
    legacyLand: false,
    knowledge: 30,
    research: [],
    grapeLicenses: [...r.starters],
    researchProject: null,
    hybrids: [],
    breedingProject: null,
    nextHybrid: 1,
    name: name.trim(),
    week: 6,
    cash: 12500,
    reputation: 12,
    plots: LAND.map((l) => ({
      id: l.id,
      owned: l.id <= 3,
      variety: l.id === 1 ? r.starters[0] : l.id === 2 ? r.starters[1] : null,
      growth: l.id === 1 ? 88 : l.id === 2 ? 63 : 0,
      health: l.id === 1 ? 92 : 86,
      tended: -1,
      harvestedYear: 0,
      expansions: 0,
      bearingExpansions: 0,
    })),
    grapes: [],
    batches: [],
    wines: [],
    reserves: [],
    lines: [],
    kits: 600,
    upgrades: [],
    suspendedUpgrades: [],
    deliveries: [],
    log: [
      {
        week: 6,
        text: `Welcome to ${r.name}. Your first ${VARIETIES[r.starters[0]].name} harvest is ready on the south slope.`,
        type: 'good',
      },
    ],
    ledger: [{ week: 6, label: 'Your starting capital', amount: 12500 }],
    stats: { harvested: 0, bottled: 0, sold: 0, revenue: 0, best: 0 },
    claimed: [],
    nextId: 1,
    helpWeek: -1,
    debt: 0,
    seed: 2026,
    marketSeed: MARKET_SEED,
  };
}
export function getVariety(s: GameState, id: Variety): Grape {
  const grape = Object.hasOwn(VARIETIES, id)
    ? VARIETIES[id]
    : s.hybrids.find((h) => h.id === id);
  if (!grape) throw new Error('Unknown grape variety.');
  return grape;
}
export function getEstate(
  s: Pick<GameState, 'estates' | 'activeEstate'>,
  id = s.activeEstate,
) {
  const estate = s.estates.find((e) => e.id === id);
  if (!estate) throw new Error('Estate not found.');
  return estate;
}
export function getLand(s: GameState, id: number) {
  const local = localPlotId(id),
    district = districtForPlot(id);
  const land = LAND[local - 1],
    estate = getEstate(s, estateIdForPlot(id));
  if (district >= estate.districts)
    throw new Error('Vineyard district not found.');
  const scale = plotScale(s.plots.find((p) => p.id === id)?.expansions);
  return {
    ...land,
    baseArea: Number(land.area),
    baseYield: land.yield,
    area: hectares(Number(land.area) * scale),
    yield: land.yield * scale,
    id,
    estateId: estate.id,
    region: estate.region,
    district,
    name: district
      ? `${land.name} · ${DISTRICTS[district].split(' ')[0]}`
      : land.name,
    soil:
      s.legacyLand && estate.id === 1 && district === 0
        ? land.soil
        : REGIONS[estate.region].soils[(local - 1 + district) % 6],
  };
}
export const plotScale = (expansions = 0) =>
  1 + expansions * PLOT_EXPANSION.step;
export const plotExpansionCost = (s: GameState, p: Plot) =>
  Math.round(
    getLand(s, p.id).baseArea *
      PLOT_EXPANSION.costPerHectare *
      plotScale(p.expansions),
  );
export const plotTendCost = (p: Plot) =>
  Math.round(90 * plotScale(p.expansions));
export const plotHarvestCost = (p: Plot) =>
  Math.round(180 * plotScale(p.bearingExpansions));
export const plotRemovalCost = (p: Plot) =>
  Math.round(120 * plotScale(p.expansions));
export const plotPlantingCost = (s: GameState, p: Plot, variety: Variety) =>
  Math.round(
    plantingCost(s, variety, getLand(s, p.id).region) * plotScale(p.expansions),
  );
export const harvestYield = (
  s: GameState,
  p: Plot,
  expansions = p.bearingExpansions ?? 0,
) =>
  p.variety
    ? Math.round(
        getLand(s, p.id).baseYield *
          plotScale(expansions) *
          (0.6 + p.health * 0.004) *
          getVariety(s, p.variety).yieldFactor,
      )
    : 0;
export const estatePlots = (s: GameState, id = s.activeEstate) =>
  s.plots.filter((p) => estateIdForPlot(p.id) === id);
export const estateArea = (s: GameState, id = s.activeEstate) =>
  estatePlots(s, id)
    .filter((p) => p.owned)
    .reduce((n, p) => n + Number(getLand(s, p.id).area), 0);
function newDistrict(
  estate: number,
  district: number,
  fullyOwned: boolean,
): Plot[] {
  return LAND.map((l) => ({
    id: plotId(estate, district, l.id),
    owned: fullyOwned || l.id <= 3,
    variety: null,
    growth: 0,
    health: 95,
    tended: -1,
    harvestedYear: 0,
    expansions: 0,
    bearingExpansions: 0,
  }));
}
export function availableVarieties(
  s: GameState,
  regionId: RegionId = s.region,
): [Variety, Grape][] {
  // The optional region argument remains for callers that calculate local planting costs.
  void regionId;
  return [
    ...Object.entries(VARIETIES).filter(([id]) =>
      researchComplete(s, `grape_${id}`),
    ),
    ...s.hybrids.map((h) => [h.id, h] as [Variety, Grape]),
  ];
}
export function suitability(
  s: GameState,
  id: Variety,
  soil?: string,
  regionId: RegionId = s.region,
) {
  const v = getVariety(s, id),
    region = REGIONS[regionId];
  const regional = region.signature.includes(id);
  const mismatch = Math.max(
    0,
    Math.abs(v.heat - region.heat) -
      (regional ? 1 : 0) -
      (s.research.includes('adaptation') ? 1 : 0),
  );
  return {
    regional,
    mismatch,
    label:
      mismatch <= 0.5 ? 'Excellent' : mismatch <= 1.5 ? 'Good' : 'Challenging',
    growth: Math.round(2 - mismatch * 2),
    quality:
      Math.round(3 - mismatch * 4) +
      (regional ? 3 : 0) +
      (soil === v.preferred ? 8 : 0) +
      v.finesse * 2,
    soilMatch: soil === v.preferred,
  };
}
export const plantingCost = (
  s: GameState,
  id: Variety,
  regionId: RegionId = s.region,
) =>
  Math.round(
    getVariety(s, id).planting *
      (REGIONS[regionId].signature.includes(id) ? 0.85 : 1),
  );
export const weeklyKnowledge = (s: GameState) =>
  (s.research.includes('ampelography') ? 8 : 6) +
  (s.research.includes('field_notebooks') ? 4 : 0) +
  (upgradeActive(s, 'researchLab') ? 10 : 0);
export function researchBlocked(s: GameState, id: ResearchId): string | null {
  const r = researchTerms(s, id);
  if (researchComplete(s, id)) return 'Completed';
  const missing = r.requires.find((p) => !s.research.includes(p));
  if (missing) return `Requires ${RESEARCH[missing].name}`;
  if (s.researchProject) return 'Your study slot is occupied';
  if (s.knowledge < r.knowledge)
    return `Need ${r.knowledge - s.knowledge} more knowledge`;
  if (s.cash < r.cost) return `Need ${money(r.cost - s.cash)} more`;
  return null;
}
export const tankCount = (s: Pick<GameState, 'cellar'>) =>
  s.cellar.tanks.length;
export const occupiedTankCount = (s: Pick<GameState, 'batches'>) =>
  s.batches.reduce((n, b) => n + b.tankIds.length, 0);
export const cellarExpansionCost = (s: Pick<GameState, 'cellar'>) =>
  3200 + s.cellar.expansions * 1600;
export const grapeLiters = (kg: number) => Math.floor((kg * 7) / 10);
export function fermentationPlan(
  s: Pick<GameState, 'cellar' | 'batches'>,
  kg: number,
  oak = false,
) {
  const used = new Set(s.batches.flatMap((b) => b.tankIds));
  // Fill larger legacy tanks first to avoid unnecessary processing charges.
  const free = s.cellar.tanks
    .filter((t) => !used.has(t.id))
    .sort((a, b) => b.capacity - a.capacity || a.id - b.id);
  let missing = grapeLiters(kg);
  const fills: { tankId: number; liters: number }[] = [];
  for (const tank of free) {
    if (missing <= 0) break;
    const liters = Math.min(tank.capacity, missing);
    fills.push({ tankId: tank.id, liters });
    missing -= liters;
  }
  return { fills, missing, cost: fills.length * (oak ? 320 : 140) };
}
export const upkeep = (s: GameState) =>
  85 +
  s.plots
    .filter((p) => p.owned)
    .reduce((n, p) => n + 25 + (p.expansions ?? 0) * PLOT_EXPANSION.upkeep, 0) +
  investmentUpkeep(s) +
  s.cellar.expansions * 15 +
  (s.estates.length - 1) * 100 +
  s.estates.reduce((n, e) => n + (e.districts - 1) * 35, 0) +
  (s.debt > 0 ? 60 : 0);
export const fairPrice = (
  wine: Pick<Wine, 'quality'> &
    Partial<Pick<Wine, 'marketingWeeks' | 'judging'>>,
  reputation: number,
  retail = true,
) => {
  // Exceptional scores command an accelerating premium, amplified by reputation.
  const premium =
    6 * Math.max(0, wine.quality - 90) ** 2 * (0.6 + reputation * 0.008);
  return Math.min(
    BOTTLE_PRICE.max,
    Math.round(7 + wine.quality * 0.24 + reputation * 0.055 + premium) +
      wineBenefits(wine, retail).price,
  );
};
export const retailPrice = (
  wine: Pick<Wine, 'quality'> &
    Partial<Pick<Wine, 'marketingWeeks' | 'judging'>>,
  s: GameState,
) =>
  Math.min(
    BOTTLE_PRICE.max,
    Math.round(
      fairPrice(wine, s.reputation) *
        (upgradeActive(s, 'sommelier') && wine.quality >= 80 ? 1.08 : 1),
    ),
  );
export const wholesalePrice = (wine: Wine, reputation: number, s?: GameState) =>
  Math.round(
    fairPrice(wine, reputation, false) *
      0.6 *
      (s && upgradeActive(s, 'exportOffice') && wine.quality >= 85 ? 1.08 : 1),
  );

export function marketingBlocked(s: GameState, wine: Wine) {
  if (!wine.bottles) return 'This release is sold out';
  if ((wine.marketingWeeks ?? 0) > 0) return 'A campaign is already running';
  if (!wine.listed) return 'List this wine to start a campaign';
  if (s.cash < MARKETING.cost)
    return `Need ${money(MARKETING.cost - s.cash)} more`;
  return null;
}
export function judgingBlocked(s: GameState, wine: Wine) {
  if (wine.judging) return 'Each release can enter judging only once';
  if (!wine.bottles) return 'This release is sold out';
  if (s.cash < JUDGING.cost) return `Need ${money(JUDGING.cost - s.cash)} more`;
  return null;
}
function demandOutlook(wine: Wine, s: GameState) {
  const market = marketConditions(wine, s);
  const ratio = wine.price / retailPrice(wine, s);
  const rate =
    !wine.listed || !wine.bottles
      ? 0
      : (18 + s.reputation * 0.55 + (upgradeActive(s, 'tasting') ? 12 : 0)) *
        (1 + wineBenefits(wine).demand) *
        investmentDemand(wine, s) *
        releaseInterest(s.week - wine.bottled) *
        Math.max(0, 2.1 - ratio * 1.1) *
        market.multiplier;
  return { rate, market };
}
const demandCount = (wine: Wine, rate: number) =>
  Math.min(wine.bottles, Math.max(0, Math.floor(rate)));

export function demandForecast(wine: Wine, s: GameState) {
  const { rate, market } = demandOutlook(wine, s);
  return {
    low: demandCount(wine, rate * WEEKLY_DEMAND.min),
    high: demandCount(wine, rate * WEEKLY_DEMAND.max),
    outlook: market.outlook,
  };
}

export function demand(wine: Wine, s: GameState) {
  const { rate } = demandOutlook(wine, s);
  return demandCount(wine, rate * weeklyDemandMultiplier(wine, s));
}
export const quality = (b: Batch) => {
  const gain =
    b.agingProfile === 'balanced'
      ? (b.oak ? CELLAR_QUALITY.oakMaturity : CELLAR_QUALITY.steelMaturity) *
        Math.sqrt(Math.min(8, b.age) / 8)
      : b.age * (b.oak ? 2.5 : 1.2);
  return Math.min(100, Math.round(b.quality + gain));
};
export const harvestQuality = (s: GameState, p: Plot) =>
  Math.max(
    0,
    Math.min(
      100,
      Math.round(
        -10 +
          p.health * 0.4 +
          p.growth * 0.3 +
          (upgradeActive(s, 'sorting') ? 2 : 0) +
          suitability(
            s,
            p.variety!,
            getLand(s, p.id).soil,
            getLand(s, p.id).region,
          ).quality,
      ),
    ),
  );
export const readyToHarvest = (p: Plot, week: number) =>
  p.owned &&
  p.variety &&
  p.growth >= 80 &&
  p.harvestedYear !== calendar(week).year &&
  calendar(week).season !== 'Winter';
export const missions = (s: GameState) =>
  [
    {
      id: 'harvest',
      title: 'From the vine',
      text: 'Bring in your first grape harvest.',
      done: s.stats.harvested > 0,
    },
    {
      id: 'vintage',
      title: 'Your first vintage',
      text: 'Bottle a wine from your own grapes.',
      done: s.stats.bottled > 0,
    },
    {
      id: 'sales',
      title: 'A taste of success',
      text: 'Sell 100 bottles of your wine.',
      done: s.stats.sold >= 100,
    },
    {
      id: 'land',
      title: 'Room to grow',
      text: 'Expand your estate to four parcels.',
      done: s.plots.filter((p) => p.owned).length >= 4,
    },
    {
      id: 'quality',
      title: 'Something exceptional',
      text: 'Bottle a vintage rated 90 or above.',
      done: s.stats.best >= 90,
    },
  ].map((m) => ({ ...m, done: m.done || s.claimed.includes(m.id) }));
function note(
  s: GameState,
  text: string,
  type: 'good' | 'info' | 'warning' = 'info',
) {
  s.log.unshift({ week: s.week, text, type });
  s.log = s.log.slice(0, 40);
}
function transaction(s: GameState, label: string, amount: number) {
  s.cash += amount;
  s.ledger.unshift({ week: s.week, label, amount });
  s.ledger = s.ledger.slice(0, 80);
}
function spend(s: GameState, label: string, amount: number) {
  if (s.cash < amount)
    throw new Error(
      `You need ${money(amount - s.cash)} more for ${label.toLowerCase()}.`,
    );
  transaction(s, label, -amount);
}
function random(s: GameState) {
  s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0;
  return s.seed / 4294967296;
}
function scoreReserve(s: GameState, reserve: Reserve) {
  if (reserve.score === null)
    reserve.score = Math.max(
      0,
      Math.min(
        100,
        assess(reserve.components, s.hybrids).expected +
          Math.floor(random(s) * (CELLAR_TASTING.variation * 2 + 1)) -
          CELLAR_TASTING.variation,
      ),
    );
  return reserve.score;
}
export function weather(week: number, region: RegionId = 'bordeaux') {
  const season = calendar(week).season;
  const kinds =
    season === 'Winter'
      ? ['Frosty', 'Overcast', 'Light rain']
      : season === 'Summer'
        ? ['Sunshine', 'Dry spell', 'Sunshine']
        : ['Sunshine', 'Light rain', 'Overcast'];
  const name = kinds[(week * 7 + Math.floor(week / 3)) % 3];
  return {
    name,
    temp:
      (season === 'Summer'
        ? 26
        : season === 'Winter'
          ? 7
          : season === 'Autumn'
            ? 18
            : 17) +
      (week % 4) +
      (REGIONS[region].heat - 3) * 2,
  };
}

// All gameplay changes pass through this pure transition, including timer ticks.
// Failed actions leave the original state untouched.
export function act(current: GameState, action: Action): GameState {
  // A development hot update can retain an estate from the previous schema.
  const s =
    (current.version as number) < 6
      ? deserialize(serialize(current))
      : structuredClone(current);
  const getPlot = (id: number) => {
    const p = s.plots.find((p) => p.id === id);
    if (!p) throw new Error('Parcel not found.');
    return p;
  };
  const getGrapes = (id: number) => {
    const g = s.grapes.find((g) => g.id === id);
    if (!g) throw new Error('Grape lot not found.');
    return g;
  };
  const getBatch = (id: number) => {
    const b = s.batches.find((b) => b.id === id);
    if (!b) throw new Error('Wine batch not found.');
    return b;
  };
  const getWine = (id: number) => {
    const w = s.wines.find((w) => w.id === id);
    if (!w) throw new Error('Vintage not found.');
    return w;
  };
  switch (action.type) {
    case 'visitEstate': {
      getEstate(s, action.id);
      s.activeEstate = action.id;
      break;
    }
    case 'acquireEstate': {
      if (!REGION_IDS.includes(action.region))
        throw new Error('Choose a wine region.');
      if (
        s.estates.length >= ESTATE_LIMITS.estates ||
        s.estates.some((e) => e.region === action.region)
      )
        throw new Error(
          'You already have an estate in this region. Expand its vineyards instead.',
        );
      const name = action.name.trim();
      if (!name || name.length > 32)
        throw new Error('Use an estate name between 1 and 32 characters.');
      if (s.estates.some((e) => e.name.toLowerCase() === name.toLowerCase()))
        throw new Error('Give this estate a distinct name.');
      spend(
        s,
        `${REGIONS[action.region].name} estate acquisition`,
        acquisitionCost(s.estates.length),
      );
      const id = s.estates.length + 1;
      s.estates.push({
        id,
        name,
        region: action.region,
        districts: 1,
        founded: calendar(s.week).year,
      });
      s.plots.push(...newDistrict(id, 0, false));
      s.activeEstate = id;
      note(
        s,
        `${name} acquired in ${REGIONS[action.region].name}. Three empty parcels are ready. Buy cellar space and tanks separately.`,
        'good',
      );
      break;
    }
    case 'expandEstate': {
      const estate = getEstate(s, action.id);
      if (estate.districts >= ESTATE_LIMITS.districts)
        throw new Error(
          'This estate has all four vineyard districts. Acquire an estate in another region to grow further.',
        );
      spend(
        s,
        `${estate.name} vineyard expansion`,
        districtCost(estate.districts),
      );
      s.plots.push(...newDistrict(estate.id, estate.districts, true));
      estate.districts++;
      s.activeEstate = estate.id;
      note(
        s,
        `${estate.name} expanded by 6.8 ha. Six empty parcels are ready; cellar space and tanks are purchased separately. Weekly upkeep increases by $185.`,
        'good',
      );
      break;
    }
    case 'advance': {
      if (s.week >= 100000)
        throw new Error(
          'This estate has reached the end of its calendar. Export your save to keep its history.',
        );
      s.week++;
      s.knowledge = Math.min(1e9, s.knowledge + weeklyKnowledge(s));
      if (
        s.researchProject &&
        !s.researchProject.paused &&
        (s.researchProject.remaining -= upgradeActive(s, 'researchLab')
          ? 2
          : 1) <= 0
      ) {
        const id = s.researchProject.id;
        s.research.push(id);
        s.grapeLicenses = [
          ...new Set([
            ...s.grapeLicenses,
            ...(s.researchProject.legacyGrapes ?? []),
          ]),
        ];
        s.researchProject = null;
        note(s, `${RESEARCH[id].name} completed. ${RESEARCH[id].text}`, 'good');
      }
      if (
        s.breedingProject &&
        (s.breedingProject.remaining -= upgradeActive(s, 'researchLab')
          ? 2
          : 1) <= 0
      ) {
        const h = s.breedingProject.result;
        h.created = s.week;
        s.hybrids.push(h);
        s.breedingProject = null;
        note(
          s,
          `${h.name} passed its nursery trial. Your new estate grape is ready to plant.`,
          'good',
        );
      }
      const date = calendar(s.week);
      for (const p of s.plots.filter((p) => p.owned && p.variety)) {
        const region = getLand(s, p.id).region;
        const sky = weather(s.week, region);
        if (date.week === 1) {
          p.bearingExpansions = p.expansions ?? 0;
          p.growth = 12;
          note(
            s,
            `Bud break on ${getLand(s, p.id).name.toLowerCase()}. A new vintage begins.`,
          );
        }
        if (date.week === 10 && p.growth > 0 && p.harvestedYear !== date.year) {
          p.growth = 0;
          note(
            s,
            `Winter arrived. Unpicked fruit on ${getLand(s, p.id).name.toLowerCase()} was lost.`,
            'warning',
          );
        }
        if (date.season !== 'Winter' && p.harvestedYear !== date.year) {
          const previous = p.growth;
          const fit = suitability(s, p.variety!, undefined, region);
          const resilience = Math.min(
            7,
            getVariety(s, p.variety!).resilience +
              (s.research.includes('selection') ? 2 : 0),
          );
          p.growth = Math.min(
            100,
            p.growth +
              9 +
              Math.round(random(s) * 5) +
              (upgradeActive(s, 'irrigation') ? 3 : 0) +
              (upgradeActive(s, 'viticulturist') ? 2 : 0) +
              fit.growth,
          );
          p.health = Math.max(
            20,
            p.health -
              Math.max(
                upgradeActive(s, 'viticulturist') ? 0 : 1,
                (sky.name === 'Dry spell' && !upgradeActive(s, 'irrigation')
                  ? 9
                  : 2) +
                  fit.mismatch -
                  Math.floor(resilience / 2) -
                  (upgradeActive(s, 'viticulturist') ? 1 : 0),
              ),
          );
          if (previous < 80 && p.growth >= 80)
            note(
              s,
              `${getLand(s, p.id).name}: ${getVariety(s, p.variety!).name} is ready to harvest.`,
              'good',
            );
        }
      }
      s.grapes = s.grapes.filter((g) => {
        if (s.week - g.picked >= grapeStorageWeeks(s)) {
          note(
            s,
            `${g.kg} kg of ${getVariety(s, g.variety).name} spoiled. Process fresh grapes within ${grapeStorageWeeks(s)} weeks.`,
            'warning',
          );
          return false;
        }
        return true;
      });
      for (const b of s.batches) {
        if (b.stage === 'fermenting') {
          b.remaining--;
          if (b.remaining === 0) {
            b.stage = 'ready';
            note(
              s,
              `${getVariety(s, b.variety).name} finished fermenting. Age it or bottle it.`,
              'good',
            );
          }
        } else if (b.stage === 'aging' && b.age < 8) {
          b.age++;
          if (b.age === 8)
            note(
              s,
              `${getVariety(s, b.variety).name} has reached peak maturity. Ready for bottling.`,
              'good',
            );
        }
      }
      for (const d of s.deliveries.filter((d) => d.arrival <= s.week)) {
        s.kits += d.kits;
        note(s, `${d.kits} bottling kits arrived at the cellar.`, 'good');
      }
      s.deliveries = s.deliveries.filter((d) => d.arrival > s.week);
      let sales = 0;
      let bottles = 0;
      for (const w of s.wines) {
        if (
          w.judging &&
          w.judging.remaining > 0 &&
          --w.judging.remaining === 0
        ) {
          const award = wineAward(w);
          note(
            s,
            `${w.label}: the panel scored ${w.judging.score}/100. ${award ? `${award.name} medal! Suggested price +${money(award.priceBonus)} and demand +${Math.round(award.demandBonus * 100)}%.` : 'Reviewed without a medal. No price or demand bonus.'}`,
            award ? 'good' : 'info',
          );
        }
        // Use the forecast's starting week for the same market and shopper roll.
        // Newly resolved judging still applies to this sale as before.
        const count = demand(w, current);
        if (w.produced === null)
          w.salesSinceTracking = (w.salesSinceTracking ?? 0) + count;
        w.bottles -= count;
        sales += count * w.price;
        bottles += count;
        if ((w.marketingWeeks ?? 0) > 0 && --w.marketingWeeks === 0)
          note(
            s,
            `${w.label}'s marketing campaign has ended. Its temporary shop price and demand boost has expired.`,
          );
      }
      if (bottles) {
        transaction(s, 'Wine shop sales', sales);
        s.stats.sold += bottles;
        s.stats.revenue += sales;
        s.reputation = Math.min(100, s.reputation + bottles * 0.04);
        note(
          s,
          `${bottles} bottles found a home. ${money(sales)} in wine sales.`,
          'good',
        );
      }
      const visitors = hospitalityForecast(current);
      if (visitors.revenue) {
        transaction(s, 'Hospitality income', visitors.revenue);
        s.stats.revenue += visitors.revenue;
      }
      const bill = upkeep(s);
      if (s.cash < bill) {
        const running = s.upgrades.filter(
          (id) => id !== 'cellar' && upgradeActive(s, id),
        );
        if (running.length) {
          s.suspendedUpgrades = s.upgrades.filter((id) => id !== 'cellar');
          note(
            s,
            'Running costs exhausted available funds. Investments are suspended; 25% maintenance remains. Resume them in Build when finances recover.',
            'warning',
          );
        }
        const assistance = Math.max(350, bill - s.cash);
        transaction(s, 'Emergency vineyard work', assistance);
        s.reputation = Math.max(0, s.reputation - 2);
        note(
          s,
          `A local grower paid ${money(assistance)} for your help. Your estate lost 2 reputation while you were away.`,
          'warning',
        );
      }
      transaction(s, 'Weekly estate upkeep', -bill);
      break;
    }
    case 'research': {
      if (!RESEARCH_IDS.includes(action.id))
        throw new Error('Unknown research project.');
      const blocked = researchBlocked(s, action.id);
      if (blocked) throw new Error(blocked);
      const r = researchTerms(s, action.id);
      spend(s, r.name, r.cost);
      s.knowledge -= r.knowledge;
      s.researchProject = {
        id: action.id,
        remaining: r.weeks,
        duration: r.weeks,
        paused: false,
      };
      note(s, `${r.name} started. Results in ${studyWeeks(s, r.weeks)} weeks.`);
      break;
    }
    case 'pauseResearch': {
      if (!s.researchProject) throw new Error('No study is in progress.');
      s.researchProject.paused = action.paused;
      note(
        s,
        `${RESEARCH[s.researchProject.id].name} ${action.paused ? 'paused' : 'resumed'}.`,
      );
      break;
    }
    case 'abandonResearch': {
      if (!s.researchProject) throw new Error('No study is in progress.');
      note(
        s,
        `${RESEARCH[s.researchProject.id].name} abandoned. Cash and knowledge are not refunded.`,
      );
      s.researchProject = null;
      break;
    }
    case 'breed': {
      if (!s.research.includes('breeding'))
        throw new Error('Research Cross-pollination first.');
      if (s.breedingProject)
        throw new Error('Your nursery already has a trial in progress.');
      if (s.hybrids.length >= 60)
        throw new Error('Your estate collection is full (60 custom grapes).');
      const name = action.name.trim();
      if (!name || name.length > 28)
        throw new Error('Name your grape using 1–28 characters.');
      if (
        [...Object.values(VARIETIES), ...s.hybrids].some(
          (v) => v.name.toLowerCase() === name.toLowerCase(),
        )
      )
        throw new Error('Choose a unique grape name.');
      const available = new Set(availableVarieties(s).map(([id]) => id));
      if (
        action.parents.length !== 2 ||
        action.parents[0] === action.parents[1] ||
        action.parents.some((p) => !available.has(p))
      )
        throw new Error('Choose two different, unlocked parent varieties.');
      if (!Object.hasOwn(TRAITS, action.trait))
        throw new Error('Choose a breeding trait.');
      const permission = breedingPermission(s, action.parents, action.trait);
      if (permission) throw new Error(permission);
      if (s.knowledge < BREEDING.knowledge)
        throw new Error(
          `A breeding trial needs ${BREEDING.knowledge} knowledge.`,
        );
      spend(s, 'Breeding trial', BREEDING.cost);
      s.knowledge -= BREEDING.knowledge;
      const [a, b] = action.parents.map((p) => getVariety(s, p));
      const trait = action.trait;
      const meanHeat = (a.heat + b.heat) / 2;
      const heat =
        trait === 'climate'
          ? meanHeat +
            Math.sign(REGIONS[s.region].heat - meanHeat) *
              Math.min(1, Math.abs(REGIONS[s.region].heat - meanHeat))
          : meanHeat;
      const duration = breedingWeeks(s);
      // Draw inheritance now and persist the result so reloads cannot reroll a trial.
      const inherited = random(s) < 0.5 ? a : b;
      const result = {
        id: `cross-${s.nextHybrid++}`,
        name,
        color: inherited.color,
        wineType: inherited.wineType,
        planting: Math.min(
          1400,
          Math.round((a.planting + b.planting) / 2) + 150,
        ),
        preferred: inherited.preferred,
        note: `An estate crossing selected for ${TRAITS[trait].name.toLowerCase()}.`,
        heat,
        resilience: Math.max(
          0,
          Math.min(
            7,
            Math.round((a.resilience + b.resilience) / 2) +
              (trait === 'resilience' ? 2 : trait === 'finesse' ? -1 : 0),
          ),
        ),
        finesse: Math.max(
          -2,
          Math.min(
            8,
            Math.round((a.finesse + b.finesse) / 2) +
              (trait === 'finesse' ? 3 : trait === 'resilience' ? -1 : 0),
          ),
        ),
        yieldFactor: Math.max(
          0.75,
          Math.min(
            1.1,
            Math.round(
              ((a.yieldFactor + b.yieldFactor) / 2 -
                (trait === 'finesse' ? 0.08 : trait === 'climate' ? 0.03 : 0)) *
                100,
            ) / 100,
          ),
        ),
        collection: 'discovery' as const,
        parents: action.parents,
        trait,
        created: s.week,
      };
      s.breedingProject = { result, remaining: duration, duration };
      note(
        s,
        `${name}: ${a.name} × ${b.name} trial started. Ready in ${studyWeeks(s, duration)} weeks.`,
      );
      break;
    }
    case 'uproot': {
      const p = getPlot(action.id);
      if (!p.owned || !p.variety)
        throw new Error('Choose a planted parcel you own.');
      spend(s, 'Vine removal', plotRemovalCost(p));
      p.bearingExpansions = p.expansions ?? 0;
      p.variety = null;
      p.growth = 0;
      p.health = 95;
      p.tended = -1;
      // Retain harvestedYear: replanting must not create a second harvest this year.
      note(s, `${getLand(s, p.id).name} cleared. Choose new vines to plant.`);
      break;
    }
    case 'tend': {
      const p = getPlot(action.id);
      if (!p.owned || !p.variety || calendar(s.week).season === 'Winter')
        throw new Error('Choose a planted parcel during the growing season.');
      if (p.tended === s.week)
        throw new Error('These vines have already been tended this week.');
      spend(s, 'Vine care', plotTendCost(p));
      p.health = Math.min(100, p.health + 16);
      p.tended = s.week;
      note(
        s,
        `${getLand(s, p.id).name}: vines pruned and tended. Health improved.`,
        'good',
      );
      break;
    }
    case 'harvest': {
      const p = getPlot(action.id);
      if (!readyToHarvest(p, s.week))
        throw new Error(
          'Grapes need at least 80% ripeness and can be harvested once per year.',
        );
      const land = getLand(s, p.id);
      if (s.grapes.length >= 576)
        throw new Error('Process or sell some fresh grapes before harvesting.');
      spend(s, 'Harvest crew', plotHarvestCost(p));
      const q = harvestQuality(s, p);
      const kg = harvestYield(s, p);
      s.grapes.push({
        id: s.nextId++,
        variety: p.variety!,
        kg,
        quality: q,
        picked: s.week,
        estateId: land.estateId,
      });
      p.harvestedYear = calendar(s.week).year;
      p.growth = 0;
      s.stats.harvested += kg;
      s.knowledge = Math.min(1e9, s.knowledge + 12);
      note(
        s,
        `${kg} kg of ${getVariety(s, p.variety!).name} harvested at ${q}/100 quality. Your cellar is waiting.`,
        'good',
      );
      break;
    }
    case 'expandPlot': {
      const p = getPlot(action.id);
      if (!p.owned) throw new Error('Buy this parcel before expanding it.');
      if ((p.expansions ?? 0) >= PLOT_EXPANSION.max)
        throw new Error(
          'This plot has reached its maximum size. Plant another parcel to grow more.',
        );
      spend(
        s,
        `${getLand(s, p.id).name} plot expansion`,
        plotExpansionCost(s, p),
      );
      p.expansions = (p.expansions ?? 0) + 1;
      p.bearingExpansions = p.variety
        ? (p.bearingExpansions ?? 0)
        : p.expansions;
      note(
        s,
        `${getLand(s, p.id).name} expanded to ${getLand(s, p.id).area} ha. ${p.variety ? `New rows of ${getVariety(s, p.variety).name} will produce from Year ${calendar(s.week).year + 1}.` : 'Plant vines across the larger parcel when ready.'} Upkeep +$15/week.`,
        'good',
      );
      break;
    }
    case 'buyPlot': {
      const p = getPlot(action.id);
      if (p.owned) throw new Error('You already own this parcel.');
      spend(s, getLand(s, p.id).name, getLand(s, p.id).cost);
      p.owned = true;
      note(
        s,
        `${getLand(s, p.id).name} is now part of your estate. Choose a grape variety to plant.`,
        'good',
      );
      break;
    }
    case 'plant': {
      const p = getPlot(action.id);
      if (!p.owned || p.variety)
        throw new Error('Select an empty parcel you own.');
      if (
        !availableVarieties(s, getLand(s, p.id).region).some(
          ([id]) => id === action.variety,
        )
      )
        throw new Error(
          'Research this grape’s individual field study before planting.',
        );
      spend(
        s,
        `${getVariety(s, action.variety).name} vines`,
        plotPlantingCost(s, p, action.variety),
      );
      p.variety = action.variety;
      p.bearingExpansions = p.expansions ?? 0;
      p.growth = 15;
      p.health = 95;
      note(
        s,
        `${getVariety(s, action.variety).name} planted on ${getLand(s, p.id).name.toLowerCase()}. Vines grow each week.`,
        'good',
      );
      break;
    }
    case 'ferment': {
      const g = getGrapes(action.id);
      if (grapeLiters(g.kg) < 1)
        throw new Error('There are not enough grapes to ferment.');
      const plan = fermentationPlan(s, g.kg, action.oak);
      if (plan.missing > 0)
        throw new Error(
          `Not enough empty tanks: ${plan.missing} L still needs space. Move finished wine to reserves or buy more tanks.`,
        );
      spend(
        s,
        action.oak ? 'French oak vinification' : 'Stainless steel vinification',
        plan.cost,
      );
      s.batches.push({
        id: s.nextId++,
        variety: g.variety,
        liters: grapeLiters(g.kg),
        tankIds: plan.fills.map((f) => f.tankId),
        quality: Math.min(
          100,
          g.quality +
            (upgradeActive(s, 'lab') ? CELLAR_QUALITY.temperatureControl : 0),
        ),
        stage: 'fermenting',
        remaining: 2,
        age: 0,
        oak: action.oak,
        year: calendar(g.picked).year,
        agingProfile: 'balanced',
        ...(g.estateId !== undefined ? { estateId: g.estateId } : {}),
      });
      s.grapes = s.grapes.filter((x) => x.id !== g.id);
      note(
        s,
        `${getVariety(s, g.variety).name} is fermenting across ${plan.fills.length} tank${plan.fills.length === 1 ? '' : 's'}. Ready in 2 weeks.`,
        'good',
      );
      break;
    }
    case 'age': {
      const b = getBatch(action.id);
      if (b.stage !== 'ready')
        throw new Error('Only finished fermentations can begin aging.');
      b.stage = 'aging';
      note(
        s,
        `${getVariety(s, b.variety).name} is maturing. Quality improves each week, up to 8 weeks.`,
      );
      break;
    }
    case 'reserve': {
      const b = getBatch(action.id);
      if (b.stage === 'fermenting')
        throw new Error('Let fermentation finish before storing wine.');
      if (s.reserves.length >= ESTATE_LIMITS.reserves)
        throw new Error(
          'Your 256 reserve spaces are full. Blend or bottle a lot to make room.',
        );
      s.reserves.push({
        id: s.nextId++,
        name: `${getVariety(s, b.variety).name} ${b.oak ? 'Réserve' : 'Estate'}`.slice(
          0,
          40,
        ),
        stored: s.week,
        score: null,
        components: [
          {
            variety: b.variety,
            year: b.year,
            ml: b.liters * 1000,
            quality: quality(b),
            ...(b.estateId !== undefined ? { estateId: b.estateId } : {}),
          },
        ],
      });
      s.batches = s.batches.filter((x) => x.id !== b.id);
      note(
        s,
        `${b.liters} L moved into reserves. ${b.tankIds.length} tank${b.tankIds.length === 1 ? ' is' : 's are'} free for your next harvest.`,
        'good',
      );
      break;
    }
    case 'blend': {
      const name = action.name.trim();
      if (!name || name.length > 40)
        throw new Error('Name your blend using 1–40 characters.');
      if (
        action.portions.length < 2 ||
        action.portions.length > ESTATE_LIMITS.reserves ||
        new Set(action.portions.map((p) => p.id)).size !==
          action.portions.length
      )
        throw new Error('Select at least two different reserve lots.');
      const selected = action.portions.map((p) => {
        const lot = s.reserves.find((r) => r.id === p.id);
        if (!lot) throw new Error('Reserve lot not found.');
        if (
          !Number.isInteger(p.ml) ||
          p.ml < 1 ||
          p.ml > volume(lot.components)
        )
          throw new Error('Choose an available volume from each reserve.');
        return { lot, ml: p.ml };
      });
      const missing = blendResearchMissing(
        s,
        selected.flatMap(({ lot, ml }) =>
          portion(lot.components, ml).filter((p) => p.ml > 0),
        ),
      );
      if (missing.length)
        throw new Error(
          `Research ${missing.map((id) => RESEARCH[id].name).join(', ')} before creating this blend.`,
        );
      const components = combine(
        selected.flatMap(({ lot, ml }) => take(lot, ml)),
      );
      if (volume(components) > 100000000 || components.length > 500)
        throw new Error('This blend exceeds the cellar’s recipe capacity.');
      s.reserves = s.reserves.filter((r) => volume(r.components) > 0);
      if (s.reserves.length >= ESTATE_LIMITS.reserves)
        throw new Error(
          'Use a whole reserve lot to free a space for this blend.',
        );
      s.reserves.push({
        id: s.nextId++,
        name,
        components,
        stored: s.week,
        score: null,
      });
      note(
        s,
        `${name} blended from ${selected.length} reserve lots. Ready to bottle or keep for a future vintage.`,
        'good',
      );
      break;
    }
    case 'tasteReserve': {
      const reserve = s.reserves.find((r) => r.id === action.id);
      if (!reserve) throw new Error('Reserve lot not found.');
      if (reserve.score !== null)
        throw new Error('This lot already has a final tasting score.');
      spend(s, `${reserve.name} cellar tasting`, CELLAR_TASTING.cost);
      const score = scoreReserve(s, reserve);
      note(
        s,
        `${reserve.name} scored ${score}/100 in the cellar tasting. Bottles from this lot will keep that score.`,
        'good',
      );
      break;
    }
    case 'bottle': {
      const r = s.reserves.find((r) => r.id === action.id);
      if (!r)
        throw new Error('Move finished wine into reserves before bottling.');
      const count = action.bottles;
      if (
        !Number.isInteger(count) ||
        count < 1 ||
        count > 1000000 ||
        count * 750 > volume(r.components)
      )
        throw new Error('Choose a bottle count that fits your reserve.');
      if (s.kits < count)
        throw new Error(
          `You need ${count - s.kits} more bottling kits. Order supplies in the cellar.`,
        );
      if (s.wines.length >= 1000)
        throw new Error(
          'Your estate archive has reached 1,000 releases. Export your estate to preserve its history.',
        );
      let line;
      if ('id' in action.line) {
        const lineId = action.line.id;
        line = s.lines.find((l) => l.id === lineId);
        if (!line) throw new Error('Wine line not found.');
      } else {
        const name = action.line.name.trim();
        if (!name || name.length > 40)
          throw new Error('Name your wine line using 1–40 characters.');
        if (
          s.lines.some(
            (l) => l.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
          )
        )
          throw new Error(
            'This wine line already exists. Select it from existing lines.',
          );
        const design = labelDesignSchema.safeParse(action.line.design);
        if (!design.success)
          throw new Error('Choose a bottle and label design.');
        line = {
          id: s.nextId++,
          name,
          founded: calendar(s.week).year,
          design: design.data,
        };
        s.lines.push(line);
      }
      // Assess once per stored lot; partial bottlings and reloads keep that score.
      const q = scoreReserve(s, r);
      const components = combine(take(r, count * 750));
      const release = s.wines.filter((w) => w.lineId === line.id).length + 1;
      s.kits -= count;
      s.wines.push({
        id: s.nextId++,
        variety: components[0].variety,
        quality: q,
        bottles: count,
        produced: count,
        salesSinceTracking: 0,
        marketingWeeks: 0,
        judging: null,
        price: retailPrice({ quality: q }, s),
        listed: false,
        year: Math.max(...components.map((p) => p.year)),
        label: line.name,
        lineId: line.id,
        release,
        components,
        bottled: s.week,
        design: { ...line.design },
        estate: s.name,
        founded: line.founded,
      });
      s.reserves = s.reserves.filter((r) => volume(r.components) > 0);
      // Reward volume, so splitting one lot into tiny releases cannot farm knowledge.
      const knowledge =
        Math.floor((s.stats.bottled + count) / 40) -
        Math.floor(s.stats.bottled / 40);
      s.stats.bottled += count;
      s.knowledge = Math.min(1e9, s.knowledge + knowledge);
      s.stats.best = Math.max(s.stats.best, q);
      note(
        s,
        `${count} bottles of ${line.name}, release ${release}, rated ${q}/100. Set your price in the wine shop.`,
        'good',
      );
      break;
    }
    case 'sellGrapes': {
      const g = getGrapes(action.id);
      const revenue = g.kg * 3;
      transaction(s, 'Grape wholesale', revenue);
      s.stats.revenue += revenue;
      s.grapes = s.grapes.filter((x) => x.id !== g.id);
      note(
        s,
        `Fresh grapes sold to a neighboring winemaker for ${money(revenue)}.`,
        'good',
      );
      break;
    }
    case 'supplies': {
      if (
        s.deliveries.length >= 100 ||
        s.kits + s.deliveries.reduce((n, d) => n + d.kits, 0) > 999400
      )
        throw new Error('Your supply storage is full.');
      spend(s, '600 bottling kits', 480);
      s.deliveries.push({ kits: 600, arrival: s.week + 1 });
      note(s, '600 bottles, corks, and labels ordered. Delivery next week.');
      break;
    }
    case 'expandCellar': {
      if (s.cellar.bays >= CELLAR_EQUIPMENT.maxBays)
        throw new Error('Your cellar has reached its maximum floor space.');
      spend(s, 'Cellar floor expansion', cellarExpansionCost(s));
      s.cellar.bays += CELLAR_EQUIPMENT.baysPerExtension;
      s.cellar.expansions++;
      note(
        s,
        'Cellar expanded by four empty tank bays. Buy tanks to equip them. Weekly upkeep increases by $15.',
        'good',
      );
      break;
    }
    case 'buyTank': {
      const count = action.count ?? 1;
      if (
        !Number.isInteger(count) ||
        count < 1 ||
        count > CELLAR_EQUIPMENT.maxBays
      )
        throw new Error('Choose a valid number of tanks.');
      if (s.cellar.tanks.length + count > s.cellar.bays)
        throw new Error('Expand the cellar floor before buying more tanks.');
      spend(
        s,
        `${count} × 150 L fermentation tank`,
        count * CELLAR_EQUIPMENT.tankCost,
      );
      for (let i = 0; i < count; i++)
        s.cellar.tanks.push({ id: s.cellar.tanks.length + 1, capacity: 150 });
      note(
        s,
        `${count} new 150 L tank${count === 1 ? '' : 's'} installed in your cellar.`,
        'good',
      );
      break;
    }
    case 'upgrade': {
      if (action.upgrade === 'cellar')
        throw new Error(
          'Use the cellar equipment controls to buy floor space and tanks separately.',
        );
      if (s.upgrades.includes(action.upgrade))
        throw new Error('This upgrade is already installed.');
      const blocked = upgradeBlocked(s, action.upgrade);
      if (blocked) throw new Error(blocked);
      const u = UPGRADES[action.upgrade];
      spend(s, u.name, u.cost);
      s.upgrades.push(action.upgrade);
      note(
        s,
        `${u.name} is operating. Running cost ${money(u.upkeep)} per week.`,
        'good',
      );
      break;
    }
    case 'operateUpgrade': {
      const id = action.upgrade;
      if (!s.upgrades.includes(id) || id === 'cellar')
        throw new Error('Choose an owned investment.');
      const u = UPGRADES[id];
      const suspended = s.suspendedUpgrades ?? [];
      if (action.active) {
        if (upgradeActive(s, id))
          throw new Error('This investment is already operating.');
        if (u.requires && !upgradeActive(s, u.requires))
          throw new Error(`Resume ${UPGRADES[u.requires].name} first.`);
        s.suspendedUpgrades = suspended.filter((x) => x !== id);
        if (s.cash < upkeep(s))
          throw new Error(
            'Keep enough funds for one full week of estate upkeep before resuming.',
          );
      } else {
        if (suspended.includes(id))
          throw new Error('This investment is already suspended.');
        s.suspendedUpgrades = [...suspended, id];
        // Explicitly suspend dependents too; reopening the parent never silently
        // restarts expensive facilities or salaries.
        for (const other of s.upgrades) {
          if (
            other !== 'cellar' &&
            !upgradeActive(s, other) &&
            !s.suspendedUpgrades.includes(other)
          )
            s.suspendedUpgrades.push(other);
        }
      }
      note(
        s,
        `${u.name} ${action.active ? 'resumed' : 'suspended'}. ${action.active ? 'Full running costs and benefits apply.' : 'Benefits stop; 25% maintenance remains. Dependent investments also suspend.'}`,
      );
      break;
    }
    case 'price': {
      const w = getWine(action.id);
      if (
        !Number.isInteger(action.price) ||
        action.price < BOTTLE_PRICE.min ||
        action.price > BOTTLE_PRICE.max
      )
        throw new Error(
          `Choose a whole-dollar price between ${money(BOTTLE_PRICE.min)} and ${money(BOTTLE_PRICE.max)}.`,
        );
      w.price = action.price;
      break;
    }
    case 'list': {
      const w = getWine(action.id);
      w.listed = !w.listed;
      note(
        s,
        `${w.label} ${w.listed ? 'is on sale. Customers arrive each week.' : 'has been removed from the shop.'}`,
      );
      break;
    }
    case 'marketWine': {
      const w = getWine(action.id);
      const blocked = marketingBlocked(s, w);
      if (blocked) throw new Error(blocked);
      spend(s, `${w.label} marketing`, MARKETING.cost);
      w.marketingWeeks = MARKETING.weeks;
      note(
        s,
        `${w.label}'s campaign is live for ${MARKETING.weeks} weeks: shop demand +40% and suggested price +${money(MARKETING.priceBonus)}. Adjust your shelf price if you wish.`,
        'good',
      );
      break;
    }
    case 'judgeWine': {
      const w = getWine(action.id);
      const blocked = judgingBlocked(s, w);
      if (blocked) throw new Error(blocked);
      spend(s, `${w.label} judging entry`, JUDGING.cost);
      w.judging = {
        remaining: JUDGING.weeks,
        score: Math.max(
          0,
          Math.min(
            100,
            Math.round(w.quality) +
              Math.floor(random(s) * (JUDGING.variation * 2 + 1)) -
              JUDGING.variation,
          ),
        ),
      };
      note(
        s,
        `${w.label} entered independent judging. Results in ${JUDGING.weeks} weeks.`,
      );
      break;
    }
    case 'wholesale': {
      const w = getWine(action.id);
      if (!w.bottles) throw new Error('This vintage is sold out.');
      const revenue = w.bottles * wholesalePrice(w, s.reputation, s);
      transaction(s, `${w.label} wholesale`, revenue);
      s.stats.sold += w.bottles;
      s.stats.revenue += revenue;
      s.reputation = Math.min(100, s.reputation + w.bottles * 0.01);
      if (w.produced === null)
        w.salesSinceTracking = (w.salesSinceTracking ?? 0) + w.bottles;
      w.bottles = 0;
      note(
        s,
        `A distributor bought the remaining ${w.label} for ${money(revenue)}.`,
        'good',
      );
      break;
    }
    case 'rename': {
      const name = action.name.trim();
      if (!name || name.length > 32)
        throw new Error('Use an estate name between 1 and 32 characters.');
      s.name = name;
      s.estates[0].name = name;
      break;
    }
    case 'label': {
      const name = action.name.trim();
      if (!name || name.length > 40)
        throw new Error('Use a label between 1 and 40 characters.');
      getWine(action.id).label = name;
      break;
    }
    case 'work': {
      if (s.helpWeek === s.week)
        throw new Error(
          'You have already helped a neighboring grower this week.',
        );
      transaction(s, 'Neighboring vineyard work', 250);
      s.helpWeek = s.week;
      note(s, 'An afternoon helping a neighbor earned you $250.', 'good');
      break;
    }
    case 'loan': {
      if (s.debt) throw new Error('Repay your existing loan first.');
      s.debt = 3000;
      transaction(s, 'Small business loan', 3000);
      note(
        s,
        '$3,000 loan received. Interest adds $60 to weekly upkeep until repaid.',
      );
      break;
    }
    case 'repay': {
      if (!s.debt) throw new Error('You have no outstanding loan.');
      spend(s, 'Loan repayment', s.debt);
      s.debt = 0;
      note(s, 'Your business loan is fully repaid.', 'good');
      break;
    }
    default:
      throw new Error('Unknown game action.');
  }
  if (serialize(s).length > 2_000_000)
    throw new Error(
      'This action would exceed your save’s archive capacity. Export your estate to preserve its history.',
    );
  return s;
}

export function serialize(s: GameState) {
  return JSON.stringify(
    { game: 'terroir', savedAt: new Date().toISOString(), state: s },
    null,
    2,
  );
}
export function deserialize(raw: string): GameState {
  if (raw.length > 2_000_000) throw new Error('Save file is too large.');
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(
      'This file is not valid JSON. Your current estate is safe.',
    );
  }
  // Keep the original storage key and migrate old estates without resetting assets.
  if (
    data &&
    typeof data === 'object' &&
    'state' in data &&
    data.state &&
    typeof data.state === 'object' &&
    'version' in data.state &&
    data.state.version === 1
  ) {
    const old = data.state;
    data = {
      ...data,
      state: {
        ...old,
        version: 2,
        region: 'bordeaux',
        legacyLand: true,
        knowledge: 30,
        research: [],
        researchProject: null,
        hybrids: [],
        breedingProject: null,
        nextHybrid: 1,
      },
    };
  }
  const legacyEnvelope = z
    .object({
      state: z
        .object({
          version: z.literal(2),
          wines: z.array(legacyWineSchema).max(1000),
          nextId: integer(),
          name: z.string().trim().min(1).max(32),
          week: z.number().int().min(1).max(100000),
        })
        .passthrough(),
    })
    .passthrough()
    .safeParse(data);
  if (legacyEnvelope.success) {
    const old = legacyEnvelope.data.state;
    let nextId = old.nextId;
    const lines: z.infer<typeof wineLineSchema>[] = [];
    const wines = old.wines.map((w) => {
      let line = lines.find((l) => l.name === w.label);
      if (!line) {
        line = {
          id: nextId++,
          name: w.label,
          founded: Math.min(w.year, calendar(old.week).year),
          design: { ...DEFAULT_DESIGN },
        };
        lines.push(line);
      }
      return {
        ...w,
        lineId: line.id,
        release:
          old.wines
            .slice(0, old.wines.indexOf(w))
            .filter((x) => x.label === w.label).length + 1,
        produced: null,
        bottled: old.week,
        design: { ...line.design },
        estate: old.name,
        founded: line.founded,
        // Legacy saves did not record initial quantities of already sold bottles.
        components: [
          {
            variety: w.variety,
            year: w.year,
            ml: Math.max(1, w.bottles) * 750,
            quality: w.quality,
          },
        ],
      };
    });
    data = {
      ...legacyEnvelope.data,
      state: { ...old, version: 3, nextId, lines, reserves: [], wines },
    };
  }
  const previous = z
    .object({
      state: z
        .object({
          version: z.literal(3),
          name: z.string(),
          region: z.enum(REGION_IDS),
        })
        .passthrough(),
    })
    .passthrough()
    .safeParse(data);
  if (previous.success) {
    const old = previous.data.state;
    data = {
      ...previous.data,
      state: {
        ...old,
        version: 4,
        activeEstate: 1,
        estates: [
          {
            id: 1,
            name: old.name,
            region: old.region,
            districts: 1,
            founded: 1,
          },
        ],
      },
    };
  }
  const oldCellar = z
    .object({
      state: z
        .object({
          version: z.literal(4),
          estates: z
            .array(
              z
                .object({ districts: z.number().int().min(1).max(4) })
                .passthrough(),
            )
            .min(1)
            .max(8),
          upgrades: z.array(z.string()).max(4),
          batches: z.array(z.object({}).passthrough()).max(66),
        })
        .passthrough(),
    })
    .passthrough()
    .safeParse(data);
  if (oldCellar.success) {
    const old = oldCellar.data.state;
    const count =
      old.estates.reduce((n, e) => n + e.districts * 2, 0) +
      (old.upgrades.includes('cellar') ? 2 : 0);
    data = {
      ...oldCellar.data,
      state: {
        ...old,
        version: 5,
        cellar: {
          bays: Math.max(4, Math.ceil(count / 4) * 4),
          expansions: 0,
          tanks: Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            capacity: 400,
          })),
        },
        batches: old.batches.map((batch, i) => ({
          ...batch,
          tankIds: [i + 1],
        })),
      },
    };
  }
  const legacyResearch = z
    .object({
      state: z
        .object({
          version: z.literal(5),
          region: z.enum(REGION_IDS),
          estates: z.array(
            z.object({ region: z.enum(REGION_IDS) }).passthrough(),
          ),
          research: z.array(
            z.enum([
              'ampelography',
              'heritage',
              'adaptation',
              'breeding',
              'discovery',
              'selection',
            ]),
          ),
          researchProject: z
            .object({
              id: z.enum([
                'ampelography',
                'heritage',
                'adaptation',
                'breeding',
                'discovery',
                'selection',
              ]),
              remaining: z.number().int().min(1).max(4),
            })
            .strict()
            .nullable(),
        })
        .passthrough(),
    })
    .passthrough()
    .safeParse(data);
  if (legacyResearch.success) {
    const old = legacyResearch.data.state;
    const oldPrerequisites: Record<string, string[]> = {
      ampelography: [],
      heritage: ['ampelography'],
      adaptation: ['ampelography'],
      breeding: ['ampelography'],
      discovery: ['heritage'],
      selection: ['breeding'],
    };
    const oldWeeks: Record<string, number> = {
      ampelography: 2,
      heritage: 3,
      adaptation: 3,
      breeding: 3,
      discovery: 3,
      selection: 4,
    };
    const project = old.researchProject;
    if (
      new Set(old.research).size !== old.research.length ||
      old.research.some((id) =>
        oldPrerequisites[id].some(
          (p) => !old.research.includes(p as (typeof old.research)[number]),
        ),
      ) ||
      (project &&
        (old.research.includes(project.id) ||
          project.remaining > oldWeeks[project.id] ||
          oldPrerequisites[project.id].some(
            (p) => !old.research.includes(p as (typeof old.research)[number]),
          )))
    )
      throw new Error(
        'Invalid legacy research progression. Your current estate is safe.',
      );
    const learned = new Set<ResearchId>();
    const add = (id: ResearchId) => {
      RESEARCH[id].requires.forEach(add);
      learned.add(id);
    };
    old.research.forEach(add);
    if (project) RESEARCH[project.id].requires.forEach(add);
    const regional = new Set(
      old.estates.flatMap((e) => REGIONS[e.region].signature),
    );
    const grapeLicenses = Object.entries(VARIETIES)
      .filter(
        ([id, v]) =>
          v.collection === 'classic' ||
          regional.has(id) ||
          old.research.includes('discovery') ||
          (v.collection === 'heritage' && old.research.includes('heritage')),
      )
      .map(([id]) => id);
    const legacyGrapes =
      project?.id === 'discovery'
        ? Object.keys(VARIETIES)
        : project?.id === 'heritage'
          ? Object.entries(VARIETIES)
              .filter(([, v]) => v.collection === 'heritage')
              .map(([id]) => id)
          : [];
    data = {
      ...legacyResearch.data,
      state: {
        ...old,
        version: 6,
        grapeLicenses,
        research: [...learned],
        researchProject: project
          ? {
              ...project,
              duration: oldWeeks[project.id],
              paused: false,
              legacyGrapes,
            }
          : null,
      },
    };
  }
  const result = z
    .object({
      game: z.literal('terroir'),
      savedAt: z.string(),
      state: stateSchema,
    })
    .safeParse(data);
  if (!result.success)
    throw new Error(
      'This is not a compatible Terroir save. Your current estate is safe.',
    );
  return result.data.state;
}
