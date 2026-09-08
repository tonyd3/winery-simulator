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
  volume,
  DEFAULT_DESIGN,
  labelDesignSchema,
  compositionSchema,
  reserveSchema,
  wineLineSchema,
} from './winemaking';
import type { LabelDesign, Reserve } from './winemaking';

export const SAVE_KEY = 'terroir.save.v1';
export const BACKUP_KEY = 'terroir.backup.v1';
export const BOTTLE_PRICE = { min: 1, max: 1000 };
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
export const UPGRADES = {
  irrigation: {
    name: 'Drip irrigation',
    cost: 1800,
    text: 'Keeps vines healthy in dry weather and adds 3 growth each week.',
    icon: 'water',
  },
  cellar: {
    name: 'Cellar extension',
    cost: 3200,
    text: 'Two more 400 L tanks. Make four vintages at a time.',
    icon: 'barrel',
  },
  tasting: {
    name: 'Tasting terrace',
    cost: 2400,
    text: 'Earn $140 per week from visitors. Sell 12 more bottles per vintage each week.',
    icon: 'glass',
  },
  lab: {
    name: 'Winemaker’s bench',
    cost: 2100,
    text: 'Temperature control adds 8 quality points to new fermentations.',
    icon: 'flask',
  },
} as const;
export type Upgrade = keyof typeof UPGRADES;
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
    id: z.number().int().min(1).max(6),
    owned: z.boolean(),
    variety: varietySchema.nullable(),
    growth: bounded(100),
    health: bounded(100),
    tended: z.number().int().min(-1).max(100000),
    harvestedYear: integer(10000),
  })
  .strict();
const grapeSchema = z
  .object({
    id: integer(),
    variety: varietySchema,
    kg: integer(600),
    quality: bounded(100),
    picked: integer(100000),
  })
  .strict();
const batchSchema = z
  .object({
    id: integer(),
    variety: varietySchema,
    liters: integer(400),
    quality: bounded(100),
    stage: z.enum(['fermenting', 'ready', 'aging']),
    remaining: integer(3),
    age: integer(8),
    oak: z.boolean(),
    year: integer(10000),
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
    version: z.literal(3),
    region: z.enum(REGION_IDS),
    legacyLand: z.boolean(),
    knowledge: integer(),
    research: z.array(z.enum(RESEARCH_IDS)).max(RESEARCH_IDS.length),
    researchProject: z
      .object({
        id: z.enum(RESEARCH_IDS),
        remaining: z.number().int().min(1).max(4),
      })
      .strict()
      .nullable(),
    hybrids: z.array(hybridSchema).max(60),
    breedingProject: z
      .object({
        result: hybridSchema,
        remaining: z.number().int().min(1).max(4),
        duration: z.number().int().min(3).max(4),
      })
      .strict()
      .nullable(),
    nextHybrid: z.number().int().min(1).max(100000),
    name: z.string().trim().min(1).max(32),
    week: z.number().int().min(1).max(100000),
    cash: bounded(),
    reputation: bounded(100),
    plots: z.array(plotSchema).length(6),
    grapes: z.array(grapeSchema).max(36),
    batches: z.array(batchSchema).max(4),
    wines: z.array(wineSchema).max(1000),
    reserves: z.array(reserveSchema).max(64),
    lines: z.array(wineLineSchema).max(1000),
    kits: integer(1000000),
    upgrades: z
      .array(z.enum(['irrigation', 'cellar', 'tasting', 'lab']))
      .max(4),
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
      new Set(s.research).size !== s.research.length ||
      s.research.some((r) =>
        RESEARCH[r].requires.some((p) => !s.research.includes(p)),
      )
    )
      fail('Invalid research progression.');
    if (
      s.researchProject &&
      (s.research.includes(s.researchProject.id) ||
        s.researchProject.remaining > RESEARCH[s.researchProject.id].weeks ||
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
    if (new Set(s.plots.map((p) => p.id)).size !== 6)
      fail('The six vineyard parcels must be unique.');
    if (new Set(s.upgrades).size !== s.upgrades.length)
      fail('Duplicate upgrades.');
    if (s.batches.length > (s.upgrades.includes('cellar') ? 4 : 2))
      fail('Too many occupied tanks.');
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
  | { type: 'advance' }
  | { type: 'research'; id: ResearchId }
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
    version: 3,
    region,
    legacyLand: false,
    knowledge: 30,
    research: [],
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
    })),
    grapes: [],
    batches: [],
    wines: [],
    reserves: [],
    lines: [],
    kits: 600,
    upgrades: [],
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
  };
}
export function getVariety(s: GameState, id: Variety): Grape {
  const grape = Object.hasOwn(VARIETIES, id)
    ? VARIETIES[id]
    : s.hybrids.find((h) => h.id === id);
  if (!grape) throw new Error('Unknown grape variety.');
  return grape;
}
export function getLand(s: GameState, id: number) {
  const land = LAND[id - 1];
  return {
    ...land,
    soil: s.legacyLand ? land.soil : REGIONS[s.region].soils[id - 1],
  };
}
export function availableVarieties(s: GameState): [Variety, Grape][] {
  const regional = REGIONS[s.region].signature;
  return [
    ...Object.entries(VARIETIES).filter(
      ([id, v]) =>
        v.collection === 'classic' ||
        regional.includes(id) ||
        s.research.includes('discovery') ||
        (v.collection === 'heritage' && s.research.includes('heritage')),
    ),
    ...s.hybrids.map((h) => [h.id, h] as [Variety, Grape]),
  ];
}
export function suitability(s: GameState, id: Variety, soil?: string) {
  const v = getVariety(s, id),
    region = REGIONS[s.region];
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
      v.finesse,
    soilMatch: soil === v.preferred,
  };
}
export const plantingCost = (s: GameState, id: Variety) =>
  Math.round(
    getVariety(s, id).planting *
      (REGIONS[s.region].signature.includes(id) ? 0.85 : 1),
  );
export const weeklyKnowledge = (s: GameState) =>
  s.research.includes('ampelography') ? 8 : 6;
export function researchBlocked(s: GameState, id: ResearchId): string | null {
  const r = RESEARCH[id];
  if (s.research.includes(id)) return 'Completed';
  if (s.researchProject) return 'Finish your current research';
  const missing = r.requires.find((p) => !s.research.includes(p));
  if (missing) return `Requires ${RESEARCH[missing].name}`;
  if (s.knowledge < r.knowledge)
    return `Need ${r.knowledge - s.knowledge} more knowledge`;
  if (s.cash < r.cost) return `Need ${money(r.cost - s.cash)} more`;
  return null;
}
export const tankCount = (s: GameState) =>
  s.upgrades.includes('cellar') ? 4 : 2;
export const grapeLiters = (kg: number) => Math.floor((kg * 7) / 10);
export const upkeep = (s: GameState) =>
  85 +
  s.plots.filter((p) => p.owned).length * 25 +
  s.upgrades.length * 15 +
  (s.debt > 0 ? 60 : 0);
export const fairPrice = (
  wine: Pick<Wine, 'quality'> &
    Partial<Pick<Wine, 'marketingWeeks' | 'judging'>>,
  reputation: number,
  retail = true,
) =>
  Math.round(7 + wine.quality * 0.24 + reputation * 0.055) +
  wineBenefits(wine, retail).price;
export const wholesalePrice = (wine: Wine, reputation: number) =>
  Math.round(fairPrice(wine, reputation, false) * 0.6);

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
export function demand(wine: Wine, s: GameState) {
  if (!wine.listed || !wine.bottles) return 0;
  const ratio = wine.price / fairPrice(wine, s.reputation);
  return Math.min(
    wine.bottles,
    Math.max(
      0,
      Math.floor(
        (18 + s.reputation * 0.55 + (s.upgrades.includes('tasting') ? 12 : 0)) *
          (1 + wineBenefits(wine).demand) *
          (2.1 - ratio * 1.1),
      ),
    ),
  );
}
export const quality = (b: Batch) =>
  Math.min(100, Math.round(b.quality + b.age * (b.oak ? 2.5 : 1.2)));
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
        assess(reserve.components).expected +
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
  const s = structuredClone(current);
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
    case 'advance': {
      if (s.week >= 100000)
        throw new Error(
          'This estate has reached the end of its calendar. Export your save to keep its history.',
        );
      s.week++;
      s.knowledge = Math.min(1e9, s.knowledge + weeklyKnowledge(s));
      if (s.researchProject && --s.researchProject.remaining === 0) {
        const id = s.researchProject.id;
        s.research.push(id);
        s.researchProject = null;
        note(s, `${RESEARCH[id].name} completed. ${RESEARCH[id].text}`, 'good');
      }
      if (s.breedingProject && --s.breedingProject.remaining === 0) {
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
      const sky = weather(s.week, s.region);
      for (const p of s.plots.filter((p) => p.owned && p.variety)) {
        if (date.week === 1) {
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
          const fit = suitability(s, p.variety!);
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
              (s.upgrades.includes('irrigation') ? 3 : 0) +
              fit.growth,
          );
          p.health = Math.max(
            20,
            p.health -
              Math.max(
                1,
                (sky.name === 'Dry spell' && !s.upgrades.includes('irrigation')
                  ? 9
                  : 2) +
                  fit.mismatch -
                  Math.floor(resilience / 2),
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
        if (s.week - g.picked >= 3) {
          note(
            s,
            `${g.kg} kg of ${getVariety(s, g.variety).name} spoiled. Process fresh grapes within 3 weeks.`,
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
        const count = demand(w, s);
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
      if (s.upgrades.includes('tasting')) {
        transaction(s, 'Tasting terrace visitors', 140);
        s.stats.revenue += 140;
      }
      const bill = upkeep(s);
      if (s.cash < bill) {
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
      const r = RESEARCH[action.id];
      spend(s, r.name, r.cost);
      s.knowledge -= r.knowledge;
      s.researchProject = { id: action.id, remaining: r.weeks };
      note(s, `${r.name} started. Results in ${r.weeks} weeks.`);
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
      if (s.knowledge < 60)
        throw new Error('A breeding trial needs 60 knowledge.');
      spend(s, 'Breeding trial', 900);
      s.knowledge -= 60;
      const [a, b] = action.parents.map((p) => getVariety(s, p));
      const trait = action.trait;
      const meanHeat = (a.heat + b.heat) / 2;
      const heat =
        trait === 'climate'
          ? meanHeat +
            Math.sign(REGIONS[s.region].heat - meanHeat) *
              Math.min(1, Math.abs(REGIONS[s.region].heat - meanHeat))
          : meanHeat;
      const duration = s.research.includes('selection') ? 3 : 4;
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
        `${name}: ${a.name} × ${b.name} trial started. Ready in ${duration} weeks.`,
      );
      break;
    }
    case 'uproot': {
      const p = getPlot(action.id);
      if (!p.owned || !p.variety)
        throw new Error('Choose a planted parcel you own.');
      spend(s, 'Vine removal', 120);
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
      spend(s, 'Vine care', 90);
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
      spend(s, 'Harvest crew', 180);
      const q = Math.min(
        100,
        Math.round(
          35 +
            p.health * 0.32 +
            p.growth * 0.19 +
            suitability(s, p.variety!, land.soil).quality,
        ),
      );
      const kg = Math.round(
        land.yield *
          (0.6 + p.health * 0.004) *
          getVariety(s, p.variety!).yieldFactor,
      );
      s.grapes.push({
        id: s.nextId++,
        variety: p.variety!,
        kg,
        quality: q,
        picked: s.week,
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
      if (!availableVarieties(s).some(([id]) => id === action.variety))
        throw new Error('Research this grape collection before planting.');
      spend(
        s,
        `${getVariety(s, action.variety).name} vines`,
        plantingCost(s, action.variety),
      );
      p.variety = action.variety;
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
      if (s.batches.length >= tankCount(s))
        throw new Error(
          'All tanks are occupied. Bottle a batch or extend your cellar.',
        );
      spend(
        s,
        action.oak ? 'French oak vinification' : 'Stainless steel vinification',
        action.oak ? 320 : 140,
      );
      s.batches.push({
        id: s.nextId++,
        variety: g.variety,
        liters: grapeLiters(g.kg),
        quality: Math.min(
          100,
          g.quality + (s.upgrades.includes('lab') ? 8 : 0),
        ),
        stage: 'fermenting',
        remaining: 2,
        age: 0,
        oak: action.oak,
        year: calendar(g.picked).year,
      });
      s.grapes = s.grapes.filter((x) => x.id !== g.id);
      note(
        s,
        `${getVariety(s, g.variety).name} is fermenting. Ready in 2 weeks.`,
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
      if (s.reserves.length >= 64)
        throw new Error(
          'Your 64 reserve spaces are full. Blend or bottle a lot to make room.',
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
          },
        ],
      });
      s.batches = s.batches.filter((x) => x.id !== b.id);
      note(
        s,
        `${b.liters} L moved into reserves. The tank is free for your next harvest.`,
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
        action.portions.length > 64 ||
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
      const components = combine(
        selected.flatMap(({ lot, ml }) => take(lot, ml)),
      );
      if (volume(components) > 100000000 || components.length > 500)
        throw new Error('This blend exceeds the cellar’s recipe capacity.');
      s.reserves = s.reserves.filter((r) => volume(r.components) > 0);
      if (s.reserves.length >= 64)
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
        price: fairPrice({ quality: q }, s.reputation),
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
    case 'upgrade': {
      if (s.upgrades.includes(action.upgrade))
        throw new Error('This upgrade is already installed.');
      const u = UPGRADES[action.upgrade];
      if (!u) throw new Error('Unknown upgrade.');
      spend(s, u.name, u.cost);
      s.upgrades.push(action.upgrade);
      note(s, `${u.name} is ready. ${u.text}`, 'good');
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
      const revenue = w.bottles * wholesalePrice(w, s.reputation);
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
