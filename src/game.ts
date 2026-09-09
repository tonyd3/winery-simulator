import { parcelProvenanceSchema } from './parcelProvenance';
import {
  houseIdentitySchema,
  houseInitials,
  type HouseIdentity,
} from './houseIdentity';
import {
  vintageJournalSchema,
  estateJournal,
  journalChapter,
  rememberRelease,
  rememberMoment,
} from './vintageJournal';
import {
  centsSchema,
  financeSchema,
  releaseAccountsSchema,
  startFinance,
  recordCash,
  newAccounts,
  recordWineSale,
  archiveAccounts,
} from './finance';
import { productionCost, addProductionCost } from './winemaking';
import {
  BOTTLE_STORAGE,
  bottleStorageSchema,
  initializeBottleStorage,
  storageCapacity,
  storageExpansionCost,
  warehouseRoom,
  shelfStock,
  privateStock,
  saleStock,
  shelvesUsed,
  shelfRoom,
  suggestedShelfSpace,
} from './bottleStorage';
import type { StorageKind } from './bottleStorage';
import {
  researchComplete,
  studyDurationLimit,
  researchTerms,
  blendResearchMissing,
  breedingWeeks,
  breedingPermission,
  STUDY_SLOTS,
  studySlotCount,
  studySlotCost,
  activeStudies,
  INTRO_BREEDING,
  introductoryCrossPermission,
  breedingPreview,
} from './researchProgression';
import {
  EXPERIMENT_IDS,
  FIELD_EXPERIMENT_IDS,
  RESEARCH_EXPERIMENTS,
  RESEARCH_GOAL_IDS,
} from './catalog';
import type { ResearchExperimentId, ResearchGoalId } from './catalog';
import {
  UPGRADES,
  UPGRADE_IDS,
  upgradeActive,
  harvestInvestmentEffects,
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
  CELLAR_TECHNIQUES,
  CELLAR_TECHNIQUE_IDS,
  cellarTechniquesSchema,
  vinificationWeeks,
  vinificationStage,
  techniqueKey,
} from './cellarTechniques';
import type { CellarTechnique } from './cellarTechniques';
import {
  JUDGING,
  judgingCost,
  MARKETING,
  judgingSchema,
  judgingOutlook,
  wineAward,
  wineBenefits,
} from './promotion';
import {
  blendProfile,
  CELLAR_TASTING,
  tastingScore,
  combine,
  take,
  volume,
  isSmallReserve,
  liters,
  DEFAULT_DESIGN,
  labelDesignSchema,
  compositionSchema,
  reserveSchema,
  wineLineSchema,
} from './winemaking';
import type { LabelDesign, Reserve } from './winemaking';
import {
  BLEND_TRIAL_LIMIT,
  blendTrialSchema,
  planBlend,
} from './blendPlanning';
import {
  customerGroup,
  MARKET_SEED,
  WEEKLY_DEMAND,
  marketConditions,
  releaseInterest,
  weeklyDemandMultiplier,
} from './market';

import { qualityResponse, signedPrestige, prestigeInfluence } from './prestige';
import { tastingProfile, tastingNotesSchema } from './wineSensory';
import { harvestCharacterSchema } from './winemaking';
import {
  MATURATION_LIMIT,
  VESSELS,
  createMaturationProfile,
  maturationProfileSchema,
  maturationPlanSchema,
  maturationCost,
  maturationOutlook,
} from './maturation';
import type { MaturationVessel } from './maturation';

export const SAVE_KEY = 'terroir.save.v1';
export const BACKUP_KEY = 'terroir.backup.v1';
export const BOTTLE_PRICE = { min: 1, max: 10_000 };
export const PLOT_EXPANSION = {
  max: 4,
  step: 0.5,
  costPerHectare: 3000,
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
  LEGACY_VARIETY_IDS,
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
    cost: 16800,
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
    cost: 14000,
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
    cost: 14000,
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
    cost: 16800,
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
    cost: 14000,
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
    cost: 19200,
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
const researchProjectSchema = z
  .object({
    id: z.enum(RESEARCH_IDS),
    remaining: z.number().int().min(1).max(96),
    duration: z.number().int().min(1).max(96).optional(),
    paused: z.boolean().default(false),
    experiment: z
      .object({
        plotId: z.number().int().min(1).max(192),
        variety: z.string(),
        observed: z.number().int().min(0).max(2),
        started: z.number().int().min(1).max(100000),
      })
      .strict()
      .optional(),
    legacyGrapes: z
      .array(z.string().refine((id) => Object.hasOwn(VARIETIES, id)))
      .max(24)
      .optional(),
  })
  .strict()
  .transform((project) =>
    project.duration === undefined
      ? { ...project, duration: studyDurationLimit(project.id) }
      : project,
  );
const grapeSchema = z
  .object({
    id: integer(),
    variety: varietySchema,
    kg: integer(1800),
    quality: bounded(100),
    directCostCents: centsSchema.optional(),
    picked: integer(100000),
    harvest: harvestCharacterSchema.optional(),
    parcel: parcelProvenanceSchema.optional(),
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
    directCostCents: centsSchema.optional(),
    stage: z.enum(['fermenting', 'ready', 'aging']),
    remaining: integer(8),
    techniques: cellarTechniquesSchema.optional(),
    age: integer(MATURATION_LIMIT),
    oak: z.boolean(),
    year: integer(10000),
    harvest: harvestCharacterSchema.optional(),
    parcel: parcelProvenanceSchema.optional(),
    // Absent in older saves: preserve those batches' existing maturation curve.
    agingProfile: z.enum(['balanced', 'varietal-v1']).optional(),
    maturationProfile: maturationProfileSchema.optional(),
    maturationPlan: maturationPlanSchema.optional(),
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
  // Absent in older saves; private stock is a subset of unsold bottles.
  privateBottles: integer(1000000).optional(),
  shelfSpace: integer(12000).nullable().default(null),
  accounts: releaseAccountsSchema.optional(),
  lineId: integer(),
  release: integer().min(1),
  produced: integer(1000000).nullable(),
  // Older releases lack production totals; count their sales from this update on.
  salesSinceTracking: integer(1000000).default(0),
  marketingWeeks: integer(MARKETING.weeks).default(0),
  judging: judgingSchema.nullable().default(null),
  bottled: integer(100000),
  components: compositionSchema,
  tasting: tastingNotesSchema.optional(),
  design: labelDesignSchema,
  estate: z.string().trim().min(1).max(32),
  founded: integer(10000),
});
const eventSchema = z
  .object({
    week: integer(100000),
    text: z.string().max(240),
    type: z.enum(['good', 'info', 'warning']),
  })
  .strict();
export const stateSchema = z
  .object({
    version: z.literal(6),
    bottleStorage: bottleStorageSchema.default({ warehouse: 0, shelves: 0 }),
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
      .max(Object.keys(VARIETIES).length),
    // Keep the original study field so existing saves retain their paid project.
    researchProject: researchProjectSchema.nullable(),
    researchSlots: z.number().int().min(1).max(STUDY_SLOTS.max).default(1),
    additionalResearchProjects: z
      .array(researchProjectSchema)
      .max(STUDY_SLOTS.max - 1)
      .default([]),
    researchGoal: z.enum(RESEARCH_GOAL_IDS).nullable().default(null),
    researchShortlist: z.array(z.enum(RESEARCH_IDS)).max(5).default([]),
    unseenDiscoveries: z
      .array(z.string().max(60))
      .max(RESEARCH_IDS.length + 60)
      .default([]),
    experimentCredits: z
      .array(z.enum(EXPERIMENT_IDS))
      .max(EXPERIMENT_IDS.length)
      .default([]),
    introCrossId: z
      .string()
      .regex(/^cross-[1-9]\d*$/)
      .nullable()
      .default(null),
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
    houseIdentity: houseIdentitySchema.nullable().default(null),
    vintageJournal: vintageJournalSchema.nullable().default(null),
    cash: bounded(),
    finance: financeSchema.nullable().default(null),
    kitCostCents: centsSchema.nullable().default(null),
    bankruptcy: z
      .object({ week: integer(100000), bill: bounded(), unpaid: bounded() })
      .strict()
      .nullable()
      .default(null),
    // The saved field name stays compatible; it now stores uncapped Prestige.
    reputation: z.number().finite().min(0),
    plots: z.array(plotSchema).min(6).max(192),
    grapes: z.array(grapeSchema).max(576),
    batches: z.array(batchSchema).max(CELLAR_EQUIPMENT.maxBays),
    wines: z.array(wineSchema).max(1000),
    reserves: z.array(reserveSchema).max(ESTATE_LIMITS.reserves),
    blendTrials: z.array(blendTrialSchema).max(BLEND_TRIAL_LIMIT).default([]),
    lines: z.array(wineLineSchema).max(1000),
    kits: integer(1000000),
    upgrades: z.array(z.enum(UPGRADE_IDS)).max(UPGRADE_IDS.length),
    suspendedUpgrades: z
      .array(z.enum(UPGRADE_IDS))
      .max(UPGRADE_IDS.length)
      .default([]),
    // Investments operated during this week still owe one full bill.
    operatedUpgrades: z
      .array(z.enum(UPGRADE_IDS))
      .max(UPGRADE_IDS.length)
      .default([]),
    deliveries: z
      .array(
        z
          .object({
            kits: integer(1000000),
            arrival: integer(100000),
            costCents: centsSchema.optional(),
          })
          .strict(),
      )
      .max(100),
    events: z.array(eventSchema).max(200).default([]),
    pendingEvents: integer(200).default(0),
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
        qualitySold: integer().default(0),
        qualityPoints: bounded(1e11).default(0),
      })
      .strict(),
    // Legacy save metadata only; no gameplay reads or writes achievements.
    claimed: z.array(z.string().max(20)).max(5).optional(),
    nextId: integer(),
    // Retired financial support metadata; retained only for legacy saves.
    helpWeek: z.number().int().min(-1).max(100000).optional(),
    debt: bounded(3000).optional(),
    seed: integer(4294967295),
    marketSeed: integer(4294967295).default(MARKET_SEED),
  })
  .strict()
  .transform(initializeBottleStorage)
  .superRefine((s, ctx) => {
    const fail = (message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, message });
    if (shelvesUsed(s) > storageCapacity(s, 'shelves'))
      fail('Shelf allocations exceed the available shop space.');
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
    const studies = activeStudies(s);
    if (
      new Set(s.researchShortlist).size !== s.researchShortlist.length ||
      s.researchShortlist.some(
        (id) => researchComplete(s, id) || studies.some((p) => p.id === id),
      )
    )
      fail('Invalid research shortlist.');
    if (
      new Set(s.unseenDiscoveries).size !== s.unseenDiscoveries.length ||
      s.unseenDiscoveries.some(
        (id) => !s.research.includes(id as ResearchId) && !hybridIds.has(id),
      )
    )
      fail('Invalid discovery notices.');
    if (
      new Set(s.experimentCredits).size !== s.experimentCredits.length ||
      s.experimentCredits.some((id) =>
        RESEARCH[id].requires.some((p) => !s.research.includes(p)),
      )
    )
      fail('Invalid research experiments.');
    if (
      studies.length > s.researchSlots ||
      new Set(studies.map((p) => p.id)).size !== studies.length ||
      studies.some(
        (p) =>
          researchComplete(s, p.id) ||
          p.remaining > (p.duration ?? studyDurationLimit(p.id)) ||
          (p.duration ?? 0) > studyDurationLimit(p.id) ||
          RESEARCH[p.id].requires.some((r) => !s.research.includes(r)),
      )
    )
      fail('Invalid research project.');
    for (const project of studies) {
      const e = project.experiment;
      if (
        e &&
        (!(FIELD_EXPERIMENT_IDS as readonly string[]).includes(project.id) ||
          s.experimentCredits.includes(project.id as ResearchExperimentId) ||
          !s.plots.some((p) => p.id === e.plotId && p.owned) ||
          !known.has(e.variety) ||
          e.started > s.week ||
          e.observed > s.week - e.started)
      )
        fail('Invalid field experiment.');
    }
    const intro =
      s.hybrids.find((h) => h.id === s.introCrossId) ??
      (s.breedingProject?.result.id === s.introCrossId
        ? s.breedingProject.result
        : null);
    if (
      s.introCrossId &&
      (!intro ||
        !s.research.includes('ampelography') ||
        intro.trait === 'finesse' ||
        intro.parents.some((p) => !REGIONS[s.region].starters.includes(p)))
    )
      fail('Invalid introductory cross.');
    if (
      s.hybrids.some((h) => h.id !== s.introCrossId) &&
      !s.research.includes('breeding')
    )
      fail('The nursery has not been researched.');
    if (s.breedingProject) {
      const b = s.breedingProject,
        h = b.result;
      if (
        (!s.research.includes('breeding') && h.id !== s.introCrossId) ||
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
    const wineOrigins = [
      ...s.grapes,
      ...s.batches,
      ...s.reserves.flatMap((r) => r.components),
      ...s.blendTrials.flatMap((trial) => trial.components),
      ...s.wines.flatMap((w) => w.components),
    ];
    if (wineOrigins.some((x) => !estateIds.has(x.estateId ?? 1)))
      fail('Unknown wine origin estate.');
    const ownedPlots = new Set(s.plots.filter((p) => p.owned).map((p) => p.id));
    if (
      wineOrigins.some(
        ({ parcel, estateId }) =>
          parcel &&
          (estateIdForPlot(parcel.id) !== (estateId ?? 1) ||
            !ownedPlots.has(parcel.id)),
      )
    )
      fail('Invalid wine origin parcel.');
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
      new Set(s.operatedUpgrades).size !== s.operatedUpgrades.length ||
      s.operatedUpgrades.some((id) => !s.upgrades.includes(id))
    )
      fail('Invalid operated investments.');
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
      if (batch.agingProfile === 'varietal-v1') {
        if (
          !batch.maturationProfile ||
          (batch.stage === 'aging') !== Boolean(batch.maturationPlan) ||
          (batch.stage !== 'aging' && batch.age !== 0)
        )
          fail('Invalid maturation plan.');
      } else if (
        batch.maturationProfile ||
        batch.maturationPlan ||
        batch.age > 8
      ) {
        fail('Invalid legacy maturation.');
      }
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
    if (
      new Set(s.blendTrials.map((trial) => trial.slot)).size !==
        s.blendTrials.length ||
      s.blendTrials.some(
        (trial) =>
          trial.created > s.week ||
          trial.portions.some((p) => p.id >= s.nextId),
      )
    )
      fail('Invalid blend trial records.');
    const releases = new Set<string>();
    for (const lot of [...s.reserves, ...s.wines, ...s.blendTrials]) {
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
      if (privateStock(w) > w.bottles)
        fail('Private collection exceeds remaining bottles.');
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
      const archived = line.archive?.releases ?? 0;
      const total = archived + numbers.length;
      if (
        Math.max(0, line.archive?.lastRelease ?? 0, ...numbers) !== total ||
        numbers.some((n) => n > total)
      )
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
        b.stage === 'fermenting'
          ? b.remaining < 1 ||
            b.remaining > (b.techniques ? vinificationWeeks(b.techniques) : 3)
          : b.remaining !== 0,
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
export const releaseCount = (s: GameState) =>
  s.wines.length +
  s.lines.reduce((n, line) => n + (line.archive?.releases ?? 0), 0);

function compactWineHistory(s: GameState) {
  if (s.wines.length < 900) return;
  const archived = new Set<number>();
  for (const wine of s.wines) {
    if (s.wines.length - archived.size < 750) break;
    if (wine.bottles > 0 || (wine.judging?.remaining ?? 0) > 0) continue;
    const line = s.lines.find((l) => l.id === wine.lineId)!;
    const summary = (line.archive ??= {
      releases: 0,
      lastRelease: 0,
      sold: 0,
      produced: 0,
      complete: true,
      best: 0,
    });
    summary.accounts = archiveAccounts(
      wine,
      summary.accounts,
      summary.releases,
    );
    summary.releases++;
    summary.lastRelease = Math.max(summary.lastRelease, wine.release);
    summary.sold += wineSales([wine]).count;
    summary.produced += wine.produced ?? 0;
    summary.complete &&= wine.produced !== null;
    summary.best = Math.max(summary.best, wine.quality);
    archived.add(wine.id);
  }
  s.wines = s.wines.filter((w) => !archived.has(w.id));
}

export type Action =
  | { type: 'houseIdentity'; identity: HouseIdentity }
  | { type: 'vintageNote'; year: number; note: string }
  | { type: 'planResearch'; goal: ResearchGoalId | null }
  | { type: 'shortlistResearch'; id: ResearchId; add: boolean }
  | { type: 'moveShortlist'; id: ResearchId; direction: -1 | 1 }
  | { type: 'dismissDiscovery'; id: string }
  | {
      type: 'fieldExperiment';
      id: (typeof FIELD_EXPERIMENT_IDS)[number];
      plotId: number;
    }
  | { type: 'cellarExperiment'; reserveIds: [number, number] }
  | { type: 'expandCellar' }
  | { type: 'expandBottleStorage'; kind: StorageKind }
  | { type: 'shelfSpace'; id: number; bottles: number }
  | { type: 'buyTank'; count?: number }
  | { type: 'acquireEstate'; region: RegionId; name: string }
  | { type: 'expandEstate'; id: number }
  | { type: 'visitEstate'; id: number }
  | { type: 'advance' }
  | { type: 'acknowledgeEvents' }
  | { type: 'research'; id: ResearchId }
  | { type: 'buyStudySlot' }
  | { type: 'pauseResearch'; id?: ResearchId; paused: boolean }
  | { type: 'abandonResearch'; id?: ResearchId }
  | {
      type: 'breed';
      parents: [Variety, Variety];
      trait: BreedingTrait;
      name: string;
      introductory?: boolean;
    }
  | { type: 'uproot'; id: number }
  | { type: 'tend'; id: number }
  | { type: 'harvest'; id: number }
  | { type: 'harvestAll' | 'tendAll' }
  | { type: 'buyPlot'; id: number }
  | { type: 'expandPlot'; id: number }
  | { type: 'plant'; id: number; variety: Variety }
  | {
      type: 'ferment';
      id: number;
      oak: boolean;
      techniques?: CellarTechnique[];
    }
  | {
      type: 'age';
      id: number;
      vessel?: MaturationVessel;
      targetWeeks?: number;
      autoTransfer?: boolean;
    }
  | { type: 'reserve'; id: number }
  | { type: 'tasteReserve'; id: number }
  | { type: 'discardSmallReserves'; lots: { id: number; ml: number }[] }
  | { type: 'blend'; name: string; portions: { id: number; ml: number }[] }
  | {
      type: 'saveBlendTrial';
      name: string;
      portions: { id: number; ml: number }[];
    }
  | { type: 'removeBlendTrial'; slot: number }
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
  | { type: 'list'; id: number; bottles?: number }
  | { type: 'wholesale'; id: number }
  | { type: 'collectWine' | 'returnWine'; id: number; bottles: number }
  | { type: 'marketWine'; id: number }
  | { type: 'judgeWine'; id: number }
  | { type: 'label'; id: number; name: string }
  | { type: 'rename'; name: string };

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
    houseIdentity: null,
    vintageJournal: { startedWeek: 6, chapters: [] },
    bottleStorage: { warehouse: 0, shelves: 0 },
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
    researchSlots: 1,
    additionalResearchProjects: [],
    researchGoal: null,
    researchShortlist: [],
    unseenDiscoveries: [],
    experimentCredits: [],
    introCrossId: null,
    hybrids: [],
    breedingProject: null,
    nextHybrid: 1,
    name: name.trim(),
    week: 6,
    cash: 12500,
    bankruptcy: null,
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
    blendTrials: [],
    lines: [],
    kits: 600,
    kitCostCents: 0,
    finance: startFinance(6, 12500),
    upgrades: [],
    suspendedUpgrades: [],
    operatedUpgrades: [],
    deliveries: [],
    events: [],
    pendingEvents: 0,
    log: [
      {
        week: 6,
        text: `Welcome to ${r.name}. Your first ${VARIETIES[r.starters[0]].name} harvest is ready on the south slope.`,
        type: 'good',
      },
    ],
    ledger: [{ week: 6, label: 'Your starting capital', amount: 12500 }],
    stats: {
      harvested: 0,
      bottled: 0,
      sold: 0,
      revenue: 0,
      best: 0,
      qualitySold: 0,
      qualityPoints: 0,
    },
    nextId: 1,
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
          getVariety(s, p.variety).yieldFactor *
          harvestInvestmentEffects(s, p).yieldMultiplier,
      )
    : 0;
export const estatePlots = (s: GameState, id = s.activeEstate) =>
  s.plots.filter((p) => estateIdForPlot(p.id) === id);
export const estateArea = (s: GameState, id = s.activeEstate) =>
  estatePlots(s, id)
    .filter((p) => p.owned)
    .reduce((n, p) => n + Number(getLand(s, p.id).area), 0);
function newDistrict(estate: number, district: number): Plot[] {
  return LAND.map((l) => ({
    id: plotId(estate, district, l.id),
    owned: district === 0 && l.id <= 3,
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
  const studies = activeStudies(s);
  if (studies.some((p) => p.id === id))
    return 'This study is already in progress';
  if (studies.length >= studySlotCount(s))
    return 'All study slots are occupied';
  if (s.knowledge < r.knowledge)
    return `Need ${r.knowledge - s.knowledge} more knowledge`;
  if (s.cash < r.cost) return `Need ${money(r.cost - s.cash)} more`;
  return null;
}

export function fieldExperimentEligible(
  s: GameState,
  id: string,
  plotId: number,
  variety?: string,
) {
  const p = s.plots.find((p) => p.id === plotId);
  if (
    !p?.owned ||
    !p.variety ||
    (variety && p.variety !== variety) ||
    p.health < 70
  )
    return false;
  const land = getLand(s, p.id);
  const fit = suitability(s, p.variety, land.soil, land.region);
  return fit.soilMatch && (id !== 'adaptation' || fit.mismatch > 0.5);
}
export function cellarExperimentEligible(s: GameState, ids: number[]) {
  if (ids.length !== 2 || new Set(ids).size !== 2) return false;
  const lots = ids.map((id) => s.reserves.find((r) => r.id === id));
  if (
    lots.some(
      (r) => !r || r.components.length !== 1 || volume(r.components) < 750,
    )
  )
    return false;
  const [a, b] = lots.map((r) => r!.components[0]);
  return Boolean(
    a.maturation &&
    b.maturation &&
    a.techniques &&
    b.techniques &&
    a.variety === b.variety &&
    a.year === b.year &&
    (a.estateId ?? 1) === (b.estateId ?? 1) &&
    a.maturation.vessel !== b.maturation.vessel &&
    a.maturation.weeks === b.maturation.weeks &&
    techniqueKey(a.techniques) === techniqueKey(b.techniques),
  );
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
  techniques: readonly CellarTechnique[] = [],
) {
  const used = new Set(s.batches.flatMap((b) => b.tankIds));
  // Fill larger legacy tanks first to avoid unnecessary processing charges.
  const free = s.cellar.tanks
    .filter((t) => !used.has(t.id))
    .sort((a, b) => b.capacity - a.capacity || a.id - b.id);
  const totalLiters = grapeLiters(kg);
  let missing = totalLiters;
  const fills: { tankId: number; liters: number }[] = [];
  for (const tank of free) {
    if (missing <= 0) break;
    const liters = Math.min(tank.capacity, missing);
    fills.push({ tankId: tank.id, liters });
    missing -= liters;
  }
  const liters = totalLiters - missing;
  // Convert the unprocessed yield back to whole kg so later batches retain
  // exactly the original whole-liter yield, without rounding each split down.
  const remainingKg = liters === 0 ? kg : Math.ceil((missing * 10) / 7);
  return {
    fills,
    liters,
    missing,
    remainingKg,
    cost:
      fills.length *
      ((oak ? 320 : 140) +
        techniques.reduce(
          (cost, id) => cost + CELLAR_TECHNIQUES[id].perTank,
          0,
        )),
    weeks: vinificationWeeks(techniques),
  };
}
export const upkeep = (s: GameState) =>
  85 +
  s.plots
    .filter((p) => p.owned)
    .reduce((n, p) => n + 25 + (p.expansions ?? 0) * PLOT_EXPANSION.upkeep, 0) +
  investmentUpkeep(s) +
  s.cellar.expansions * 15 +
  (s.estates.length - 1) * 100 +
  s.estates.reduce((n, e) => n + (e.districts - 1) * 35, 0);
export const fairPrice = (
  wine: Pick<Wine, 'quality'> &
    Partial<Pick<Wine, 'marketingWeeks' | 'judging'>>,
  prestige: number,
  retail = true,
) => {
  // Wine quality keeps its 100-point scale; estate Prestige has diminishing influence.
  const influence = prestigeInfluence(prestige);
  const premium =
    6 * Math.max(0, wine.quality - 90) ** 2 * (0.6 + influence * 0.008);
  return Math.min(
    BOTTLE_PRICE.max,
    Math.round(7 + wine.quality * 0.24 + influence * 0.055 + premium) +
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
export const wholesalePrice = (wine: Wine, prestige: number, s?: GameState) =>
  Math.round(
    fairPrice(wine, prestige, false) *
      0.6 *
      (s && upgradeActive(s, 'exportOffice') && wine.quality >= 85 ? 1.08 : 1),
  );

export function marketingBlocked(s: GameState, wine: Wine) {
  if (!wine.bottles) return 'This release is sold out';
  if (!saleStock(wine))
    return 'Return bottles from your Private Collection before marketing';
  if ((wine.marketingWeeks ?? 0) > 0) return 'A campaign is already running';
  if (!wine.listed) return 'List this wine to start a campaign';
  if (s.cash < MARKETING.cost)
    return `Need ${money(MARKETING.cost - s.cash)} more`;
  return null;
}
export function judgingBlocked(s: GameState, wine: Wine) {
  if (wine.judging) return 'Each release can enter judging only once';
  if (!wine.bottles) return 'This release is sold out';
  if (!judgingOutlook(wine.quality).medalPossible)
    return 'This rating cannot reach the 80-point medal threshold';
  const cost = judgingCost(wine);
  if (s.cash < cost) return `Need ${money(cost - s.cash)} more`;
  return null;
}
function demandOutlook(wine: Wine, s: GameState) {
  const market = marketConditions(wine, s);
  const ratio = wine.price / retailPrice(wine, s);
  const rate =
    !wine.listed || !saleStock(wine)
      ? 0
      : (18 +
          prestigeInfluence(s.reputation) * 0.55 +
          (upgradeActive(s, 'tasting') ? 12 : 0)) *
        (1 + wineBenefits(wine).demand) *
        investmentDemand(wine, s) *
        releaseInterest(s.week - wine.bottled) *
        Math.max(0, 2.1 - ratio * 1.1) *
        market.multiplier;
  return { rate, market };
}
const demandCount = (wine: Wine, rate: number) =>
  Math.min(saleStock(wine), Math.max(0, Math.floor(rate)));

// Build once per render or weekly sale; no mutable-state cache is retained.
export function demandContext(s: GameState) {
  const groups = new Map<string, { stock: number; wines: Wine[] }>();
  const byId = new Map<number, Wine>();
  for (const wine of s.wines) {
    byId.set(wine.id, wine);
    if (!shelfStock(wine)) continue;
    const key = customerGroup(wine);
    const group = groups.get(key) ?? { stock: 0, wines: [] };
    group.stock += saleStock(wine);
    group.wines.push(wine);
    groups.set(key, group);
  }
  return { groups, byId, shelfUsed: shelvesUsed(s) };
}
export type DemandContext = ReturnType<typeof demandContext>;

export function demandForecast(
  wine: Wine,
  s: GameState,
  context = demandContext(s),
) {
  const outlook = demandOutlook(wine, s);
  const key = customerGroup(wine);
  const existing = context.byId.get(wine.id);
  const previousStock =
    existing && shelfStock(existing) && customerGroup(existing) === key
      ? saleStock(existing)
      : 0;
  const stock =
    (context.groups.get(key)?.stock ?? 0) - previousStock + saleStock(wine);
  const rate = stock ? (outlook.rate * saleStock(wine)) / stock : 0;
  const available = Math.min(
    saleStock(wine),
    Math.max(
      0,
      storageCapacity(s, 'shelves') -
        context.shelfUsed +
        (existing ? shelfStock(existing) : 0),
    ),
    wine.shelfSpace ||
      (!existing?.listed && wine.listed ? suggestedShelfSpace(s, wine) : 0),
  );
  return {
    low: Math.min(available, demandCount(wine, rate * WEEKLY_DEMAND.min)),
    high: Math.min(available, Math.ceil(rate * WEEKLY_DEMAND.max)),
    outlook: outlook.market.outlook,
  };
}

export function weeklySales(s: GameState) {
  const sales = new Map<number, number>();
  for (const group of demandContext(s).groups.values()) {
    let preceding = 0;
    const roll = weeklyDemandMultiplier(group.wines[0], s);
    for (const wine of group.wines.sort((a, b) => a.id - b.id)) {
      const rate =
        (demandOutlook(wine, s).rate * saleStock(wine)) / group.stock;
      // Cumulative rounding preserves the group's total for one-bottle releases.
      sales.set(
        wine.id,
        Math.min(
          shelfStock(wine),
          Math.max(
            0,
            Math.floor((preceding + rate) * roll + 1e-9) -
              Math.floor(preceding * roll + 1e-9),
          ),
        ),
      );
      preceding += rate;
    }
  }
  return sales;
}
export function demand(wine: Wine, s: GameState) {
  if (!wine.listed || !saleStock(wine)) return 0;
  // Public single-release queries support a counterfactual wine without changing s.
  const existing = s.wines.find((w) => w.id === wine.id);
  if (!existing?.listed && !wine.shelfSpace)
    wine = { ...wine, shelfSpace: suggestedShelfSpace(s, wine) };
  const wines = s.wines.filter((w) => w.id !== wine.id);
  wines.push(wine);
  return weeklySales({ ...s, wines }).get(wine.id) ?? 0;
}
export const quality = (b: Batch) => {
  if (b.agingProfile === 'varietal-v1' && b.maturationProfile) {
    const outlook = maturationOutlook(
      b.maturationProfile,
      b.maturationPlan?.vessel ?? 'steel',
      b.age,
      b.oak,
    );
    return Math.max(
      0,
      Math.min(100, Math.round(b.quality + outlook.adjustment)),
    );
  }
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
          vintageWeatherQuality(s.week, getLand(s, p.id).region) +
          harvestInvestmentEffects(s, p).quality +
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
export const readyToTend = (p: Plot, week: number) =>
  p.owned &&
  Boolean(p.variety) &&
  p.health < 100 &&
  p.tended !== week &&
  p.harvestedYear !== calendar(week).year &&
  calendar(week).season !== 'Winter';

export function fieldWorkPlan(s: GameState, type: 'harvestAll' | 'tendAll') {
  const harvesting = type === 'harvestAll';
  const plots = estatePlots(s).filter((p) =>
    harvesting ? readyToHarvest(p, s.week) : readyToTend(p, s.week),
  );
  const cost = plots.reduce(
    (sum, p) => sum + (harvesting ? plotHarvestCost(p) : plotTendCost(p)),
    0,
  );
  const blocked = !plots.length
    ? harvesting
      ? 'No parcels are ready to harvest.'
      : 'No vines need tending this week.'
    : harvesting && s.grapes.length + plots.length > 576
      ? 'Process or sell fresh grapes to make room for every harvest.'
      : s.cash < cost
        ? `Need ${money(cost - s.cash)} more for all parcels.`
        : null;
  return { plots, cost, blocked };
}
export function harvestAdvice(plot: Plot, week: number) {
  if (readyToHarvest(plot, week)) {
    if (calendar(week).week === 9)
      return 'Last chance to harvest. Winter arrives next week and all unpicked fruit will be lost.';
    if (plot.growth >= 100)
      return 'These grapes are fully ripe. Waiting cannot add ripeness, and declining vine health can reduce quality. Harvest when your cellar has room.';
    return 'Ready to pick. More ripeness can improve quality, but watch vine health and harvest before winter.';
  }
  if (plot.harvestedYear === calendar(week).year)
    return 'A well-earned rest. These vines will grow again next spring.';
  if (calendar(week).season === 'Winter')
    return 'The vineyard is resting. Bud break begins in spring.';
  return 'Tend your vines to improve the quality of your next harvest.';
}

function note(
  s: GameState,
  text: string,
  type: 'good' | 'info' | 'warning' = 'info',
  important = type === 'warning',
) {
  s.log.unshift({ week: s.week, text, type });
  s.log = s.log.slice(0, 40);
  if (important) {
    s.events = [{ week: s.week, text, type }, ...(s.events ?? [])].slice(
      0,
      200,
    );
    s.pendingEvents = Math.min(200, (s.pendingEvents ?? 0) + 1);
  }
}
function trackQualitySales(s: GameState, wine: Wine, count: number) {
  s.stats.qualitySold = (s.stats.qualitySold ?? 0) + count;
  s.stats.qualityPoints = (s.stats.qualityPoints ?? 0) + count * wine.quality;
}
function transaction(
  s: GameState,
  label: string,
  amount: number,
  investment = false,
) {
  recordCash(s, amount, investment);
  s.cash += amount;
  s.ledger.unshift({ week: s.week, label, amount });
  s.ledger = s.ledger.slice(0, 80);
}
function debit(
  s: GameState,
  label: string,
  amount: number,
  investment: boolean,
) {
  if (s.cash < amount)
    throw new Error(
      `You need ${money(amount - s.cash)} more for ${label.toLowerCase()}.`,
    );
  transaction(s, label, -amount, investment);
}
function random(s: GameState) {
  s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0;
  return s.seed / 4294967296;
}
function scoreReserve(s: GameState, reserve: Reserve) {
  if (reserve.score === null)
    reserve.score = tastingScore(reserve.components, s.hybrids);
  return reserve.score;
}
// Calendar-based weather is independent of action order and survives reloads
// without consuming the random stream used for breeding and tasting.
function weatherRoll(week: number, region: RegionId, channel: string) {
  let hash = 2166136261;
  for (const char of `${region}:${week}:${channel}`)
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  hash = Math.imul(hash ^ (hash >>> 16), 0x21f0aaad);
  hash = Math.imul(hash ^ (hash >>> 15), 0x735a2d97);
  return ((hash ^ (hash >>> 15)) >>> 0) / 4294967296;
}

export function weather(week: number, region: RegionId = 'bordeaux') {
  const season = calendar(week).season;
  const kinds =
    season === 'Winter'
      ? ['Frosty', 'Overcast', 'Light rain']
      : season === 'Summer'
        ? ['Sunshine', 'Dry spell', 'Sunshine']
        : ['Sunshine', 'Light rain', 'Overcast'];
  const name =
    kinds[Math.floor(weatherRoll(week, region, 'sky') * kinds.length)];
  return {
    name,
    growth:
      name === 'Sunshine'
        ? 1
        : name === 'Dry spell'
          ? -2
          : name === 'Overcast'
            ? -1
            : 0,
    temp:
      (season === 'Summer'
        ? 26
        : season === 'Winter'
          ? 7
          : season === 'Autumn'
            ? 18
            : 17) +
      Math.floor(weatherRoll(week, region, 'temperature') * 8) -
      2 +
      (REGIONS[region].heat - 3) * 2,
  };
}

function vintageWeatherQuality(week: number, region: RegionId) {
  const date = calendar(week);
  const firstWeek = (date.year - 1) * 12 + 1;
  let conditions = 0;
  // Spring and summer establish the vintage. Freeze the adjustment for autumn
  // so waiting a week cannot reroll it; never include weather still to come.
  for (let i = 0; i < Math.min(date.week, 6); i++)
    conditions += weather(firstWeek + i, region).growth;
  return Math.max(-3, Math.min(3, Math.round(conditions / 2)));
}

// All gameplay changes pass through this pure transition, including timer ticks.
// Failed actions leave the original state untouched.
export function act(current: GameState, action: Action): GameState {
  if (current.bankruptcy)
    throw new Error('This estate is bankrupt. Start a new game to continue.');
  // A development hot update can retain an estate from the previous schema.
  const s =
    (current.version as number) < 6 ||
    !current.bottleStorage ||
    current.wines.some((w) => w.shelfSpace == null)
      ? deserialize(serialize(current))
      : structuredClone(current);
  s.researchSlots ??= 1;
  s.additionalResearchProjects ??= [];
  s.researchGoal ??= null;
  s.researchShortlist ??= [];
  s.unseenDiscoveries ??= [];
  s.experimentCredits ??= [];
  s.introCrossId ??= null;
  s.blendTrials ??= [];
  s.operatedUpgrades ??= [];
  s.houseIdentity ??= null;
  s.vintageJournal = estateJournal(s);
  const setStudies = (projects: z.infer<typeof researchProjectSchema>[]) => {
    s.researchProject = projects[0] ?? null;
    s.additionalResearchProjects = projects.slice(1);
  };
  const getStudy = (id?: ResearchId) => {
    const studies = activeStudies(s);
    const project =
      id === undefined ? studies[0] : studies.find((p) => p.id === id);
    if (!project) throw new Error('This study is no longer in progress.');
    return project;
  };
  const completeStudy = (project: z.infer<typeof researchProjectSchema>) => {
    const id = project.id;
    s.research.push(id);
    s.unseenDiscoveries.push(id);
    s.grapeLicenses = [
      ...new Set([...s.grapeLicenses, ...(project.legacyGrapes ?? [])]),
    ];
    s.researchShortlist = s.researchShortlist.filter(
      (planned) => !researchComplete(s, planned),
    );
    note(
      s,
      `${RESEARCH[id].name} completed. ${RESEARCH[id].text}`,
      'good',
      true,
    );
  };
  const creditExperiment = (
    project: z.infer<typeof researchProjectSchema>,
    id: ResearchExperimentId,
  ) => {
    s.experimentCredits.push(id);
    const saved = Math.min(project.remaining, RESEARCH_EXPERIMENTS[id].bonus);
    project.remaining -= saved;
    delete project.experiment;
    note(
      s,
      `${RESEARCH_EXPERIMENTS[id].name} finished. ${saved} study weeks saved on ${RESEARCH[id].name}.`,
      'good',
    );
  };
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
  const storeBatch = (b: Batch) => {
    if (b.stage === 'fermenting')
      throw new Error(
        'Let fermentation and any cellar techniques finish before storing wine.',
      );
    if (s.reserves.length >= ESTATE_LIMITS.reserves)
      throw new Error(
        'Your 256 reserve spaces are full. Blend, bottle, or clear small leftovers to make room.',
      );
    const modern = b.agingProfile === 'varietal-v1';
    const vessel = modern
      ? (b.maturationPlan?.vessel ?? 'steel')
      : b.oak
        ? 'oak'
        : 'steel';
    s.reserves.push({
      id: s.nextId++,
      name: `${getVariety(s, b.variety).name} ${vessel === 'steel' ? 'Estate' : 'Réserve'}`.slice(
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
          ...(b.harvest ? { harvest: { ...b.harvest } } : {}),
          ...(b.parcel ? { parcel: { ...b.parcel } } : {}),
          ...(b.directCostCents !== undefined
            ? { directCostCents: b.directCostCents }
            : {}),
          maturation: modern
            ? {
                version: 1,
                vessel,
                weeks: b.age,
                oakDominant: maturationOutlook(
                  b.maturationProfile!,
                  vessel,
                  b.age,
                  b.oak,
                ).overOaked,
              }
            : { vessel: b.oak ? 'oak' : 'steel', weeks: b.age },
          ...(modern
            ? { fermentation: b.oak ? ('oak' as const) : ('steel' as const) }
            : {}),
          ...(b.techniques ? { techniques: [...b.techniques] } : {}),
          ...(b.estateId !== undefined ? { estateId: b.estateId } : {}),
        },
      ],
    });
    s.batches = s.batches.filter((x) => x.id !== b.id);
    note(
      s,
      `${b.liters} L moved into reserves. ${b.tankIds.length} tank${b.tankIds.length === 1 ? ' is' : 's are'} free for your next harvest.`,
      'good',
      action.type === 'advance',
    );
  };
  const getWine = (id: number) => {
    const w = s.wines.find((w) => w.id === id);
    if (!w) throw new Error('Vintage not found.');
    return w;
  };
  const investment = [
    'research',
    'breed',
    'plant',
    'buyPlot',
    'expandPlot',
    'acquireEstate',
    'expandEstate',
    'expandCellar',
    'buyTank',
    'buyStudySlot',
    'upgrade',
  ].includes(action.type);
  const spend = (state: GameState, label: string, amount: number) =>
    debit(state, label, amount, investment);
  switch (action.type) {
    case 'houseIdentity': {
      const identity = houseIdentitySchema.safeParse(action.identity);
      if (!identity.success)
        throw new Error('Choose an emblem, ink and up to three initials.');
      s.houseIdentity = identity.data;
      break;
    }
    case 'vintageNote': {
      if (
        !Number.isInteger(action.year) ||
        action.year < 1 ||
        action.year > calendar(s.week).year ||
        typeof action.note !== 'string' ||
        action.note.trim().length > 600
      )
        throw new Error('Choose a recorded year and use up to 600 characters.');
      journalChapter(s.vintageJournal, action.year).note = action.note.trim();
      break;
    }
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
      s.plots.push(...newDistrict(id, 0));
      s.activeEstate = id;
      rememberMoment(
        s.vintageJournal,
        s.week,
        `${name} acquired in ${REGIONS[action.region].name}.`,
      );
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
      s.plots.push(...newDistrict(estate.id, estate.districts));
      estate.districts++;
      s.activeEstate = estate.id;
      note(
        s,
        `${estate.name} has a new district. All six parcels must be purchased separately before planting. District upkeep increases by $35/week, plus $25/week for each parcel you buy.`,
        'good',
      );
      break;
    }
    case 'acknowledgeEvents':
      s.pendingEvents = 0;
      break;
    case 'advance': {
      if (s.week >= 100000)
        throw new Error(
          'This estate has reached the end of its calendar. Export your save to keep its history.',
        );
      s.week++;
      s.knowledge = Math.min(1e9, s.knowledge + weeklyKnowledge(s));
      const studySpeed = upgradeActive(s, 'researchLab') ? 2 : 1;
      setStudies(
        activeStudies(s).filter((project) => {
          if (project.paused) return true;
          project.remaining -= studySpeed;
          if (project.experiment && project.remaining > 0) {
            const e = project.experiment;
            if (
              calendar(s.week).season !== 'Winter' &&
              fieldExperimentEligible(s, project.id, e.plotId, e.variety)
            )
              e.observed++;
            if (e.observed >= 3)
              creditExperiment(project, project.id as ResearchExperimentId);
          }
          if (project.remaining > 0) return true;
          completeStudy(project);
          return false;
        }),
      );
      if (
        s.breedingProject &&
        (s.breedingProject.remaining -= upgradeActive(s, 'researchLab')
          ? 2
          : 1) <= 0
      ) {
        const h = s.breedingProject.result;
        h.created = s.week;
        s.hybrids.push(h);
        s.unseenDiscoveries.push(h.id);
        s.breedingProject = null;
        note(
          s,
          `${h.name} passed its nursery trial. Your new estate grape is ready to plant.`,
          'good',
          true,
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
              sky.growth +
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
      if (date.week === 9) {
        const remaining = s.plots.filter((p) => readyToHarvest(p, s.week));
        if (remaining.length)
          note(
            s,
            `Last harvest week: ${remaining.length} ripe parcel${remaining.length === 1 ? '' : 's'} will lose unpicked fruit when winter arrives next week.`,
            'warning',
          );
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
          const previousStage = vinificationStage(b);
          b.remaining--;
          if (b.remaining === 0) {
            const needsPlan = b.agingProfile === 'varietal-v1';
            b.stage = needsPlan ? 'ready' : 'aging';
            note(
              s,
              `${getVariety(s, b.variety).name} finished ${b.techniques?.length ? 'its cellar plan' : 'fermenting'}. ${needsPlan ? 'Choose a maturation plan or move it to reserves.' : 'Maturation has begun automatically; store it whenever you are ready.'}`,
              'good',
              true,
            );
          } else if (vinificationStage(b) !== previousStage) {
            note(
              s,
              `${getVariety(s, b.variety).name}: ${vinificationStage(b)} has begun. ${b.remaining} weeks until ready for reserves.`,
            );
          }
        } else if (b.stage === 'aging' || b.agingProfile !== 'varietal-v1') {
          if (
            b.agingProfile === 'varietal-v1' &&
            b.maturationProfile &&
            b.maturationPlan
          ) {
            const plan = b.maturationPlan;
            const previous = maturationOutlook(
              b.maturationProfile,
              plan.vessel,
              b.age,
              b.oak,
            );
            b.age = Math.min(MATURATION_LIMIT, b.age + 1);
            const current = maturationOutlook(
              b.maturationProfile,
              plan.vessel,
              b.age,
              b.oak,
            );
            if (b.age === current.readyFrom)
              note(
                s,
                `${getVariety(s, b.variety).name} is ready to release from ${VESSELS[plan.vessel].name.toLowerCase()}.`,
                'good',
                true,
              );
            if (!previous.overOaked && current.overOaked)
              note(
                s,
                `${getVariety(s, b.variety).name}: oak is becoming dominant. Move it to reserves to stop further exposure.`,
                'warning',
              );
            if (plan.autoTransfer && b.age >= plan.targetWeeks) {
              if (s.reserves.length < ESTATE_LIMITS.reserves) storeBatch(b);
              else {
                plan.autoTransfer = false;
                note(
                  s,
                  `${getVariety(s, b.variety).name} could not move to reserves: all 256 spaces are full. Its automatic transfer has stopped; free a space and transfer it manually. Aging continues in its vessels.`,
                  'warning',
                );
              }
            }
          } else if (b.age < 8) {
            b.stage = 'aging';
            b.age++;
            if (b.age === 8)
              note(
                s,
                `${getVariety(s, b.variety).name} has reached peak maturity. Ready for bottling.`,
                'good',
                true,
              );
          }
        }
      }
      for (const d of s.deliveries.filter((d) => d.arrival <= s.week)) {
        s.kitCostCents =
          d.costCents !== undefined && (s.kits === 0 || s.kitCostCents != null)
            ? (s.kits === 0 ? 0 : s.kitCostCents!) + d.costCents
            : null;
        s.kits += d.kits;
        note(s, `${d.kits} bottling kits arrived at the cellar.`, 'good');
      }
      s.deliveries = s.deliveries.filter((d) => d.arrival > s.week);
      let sales = 0;
      let bottles = 0;
      let prestige = 0;
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
      }
      const sellingState = { ...current, wines: structuredClone(s.wines) };
      const saleCounts = weeklySales(sellingState);
      for (const w of s.wines) {
        // Use the forecast's starting week for the same market and shopper roll.
        // Newly resolved judging still applies to this sale as before.
        const count = saleCounts.get(w.id) ?? 0;
        if (w.produced === null)
          w.salesSinceTracking = (w.salesSinceTracking ?? 0) + count;
        recordWineSale(w, count, count * w.price);
        w.bottles -= count;
        if (!saleStock(w)) {
          w.listed = false;
          w.shelfSpace = 0;
        }
        sales += count * w.price;
        bottles += count;
        prestige += count * qualityResponse(w.quality).retail;
        trackQualitySales(s, w, count);
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
        const previousPrestige = s.reputation;
        s.reputation = Math.max(
          0,
          Number((s.reputation + prestige).toFixed(2)),
        );
        note(
          s,
          `${bottles} bottles found a home. ${money(sales)} in wine sales. ${signedPrestige(s.reputation - previousPrestige)} Prestige from their quality.`,
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
        s.bankruptcy = { week: s.week, bill, unpaid: bill - s.cash };
        if (s.cash > 0) transaction(s, 'Final estate upkeep payment', -s.cash);
        note(
          s,
          `Bankruptcy: unable to pay ${money(s.bankruptcy.unpaid)} of the ${money(bill)} weekly upkeep. This estate has closed.`,
          'warning',
        );
        break;
      }
      transaction(s, 'Weekly estate upkeep', -bill);
      s.operatedUpgrades = [];
      break;
    }
    case 'planResearch': {
      if (action.goal !== null && !RESEARCH_GOAL_IDS.includes(action.goal))
        throw new Error('Choose a research outcome.');
      s.researchGoal = action.goal;
      break;
    }
    case 'shortlistResearch': {
      if (!RESEARCH_IDS.includes(action.id)) throw new Error('Unknown study.');
      if (!action.add)
        s.researchShortlist = s.researchShortlist.filter(
          (id) => id !== action.id,
        );
      else {
        if (
          researchComplete(s, action.id) ||
          activeStudies(s).some((p) => p.id === action.id)
        )
          throw new Error('This study is already learned or underway.');
        if (s.researchShortlist.includes(action.id))
          throw new Error('This study is already on your shortlist.');
        if (s.researchShortlist.length >= 5)
          throw new Error('Your shortlist holds up to five studies.');
        s.researchShortlist.push(action.id);
      }
      break;
    }
    case 'moveShortlist': {
      const from = s.researchShortlist.indexOf(action.id),
        to = from + action.direction;
      if (
        from < 0 ||
        ![-1, 1].includes(action.direction) ||
        to < 0 ||
        to >= s.researchShortlist.length
      )
        throw new Error('This study cannot move further.');
      [s.researchShortlist[from], s.researchShortlist[to]] = [
        s.researchShortlist[to],
        s.researchShortlist[from],
      ];
      break;
    }
    case 'dismissDiscovery': {
      s.unseenDiscoveries = s.unseenDiscoveries.filter(
        (id) => id !== action.id,
      );
      break;
    }
    case 'fieldExperiment': {
      if (!FIELD_EXPERIMENT_IDS.includes(action.id))
        throw new Error('Choose a field experiment.');
      const project = getStudy(action.id);
      if (
        project.paused ||
        project.experiment ||
        s.experimentCredits.includes(action.id)
      )
        throw new Error(
          'Resume the study, or finish its existing experiment first. Each bonus is available once.',
        );
      if (!fieldExperimentEligible(s, action.id, action.plotId))
        throw new Error(
          'Choose a healthy parcel on matching soil for this experiment.',
        );
      project.experiment = {
        plotId: action.plotId,
        variety: getPlot(action.plotId).variety!,
        observed: 0,
        started: s.week,
      };
      note(
        s,
        `${RESEARCH_EXPERIMENTS[action.id].name} started. Observe three growing-season weeks while the study runs.`,
      );
      break;
    }
    case 'cellarExperiment': {
      const project = getStudy('sensory_science');
      if (project.paused || s.experimentCredits.includes('sensory_science'))
        throw new Error(
          'Resume Sensory science; its comparison bonus is available once.',
        );
      if (!cellarExperimentEligible(s, action.reserveIds))
        throw new Error(
          'Choose matching oak and steel reserves with at least 750 mL each.',
        );
      for (const id of action.reserveIds)
        take(
          s.reserves.find((r) => r.id === id)!,
          750,
        );
      s.reserves = s.reserves.filter((r) => volume(r.components) > 0);
      creditExperiment(project, 'sensory_science');
      if (project.remaining <= 0) {
        completeStudy(project);
        setStudies(activeStudies(s).filter((p) => p.id !== project.id));
      }
      break;
    }
    case 'buyStudySlot': {
      if (studySlotCount(s) >= STUDY_SLOTS.max)
        throw new Error(
          `Your estate already has the maximum of ${STUDY_SLOTS.max} study slots.`,
        );
      spend(s, 'Additional study slot', studySlotCost(s));
      s.researchSlots++;
      note(
        s,
        `Study slot added. Your estate can now run ${s.researchSlots} studies at once.`,
        'good',
      );
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
      s.researchShortlist = s.researchShortlist.filter(
        (id) => id !== action.id,
      );
      setStudies([
        ...activeStudies(s),
        {
          id: action.id,
          remaining: r.weeks,
          duration: r.weeks,
          paused: false,
        },
      ]);
      note(s, `${r.name} started. Results in ${studyWeeks(s, r.weeks)} weeks.`);
      break;
    }
    case 'pauseResearch': {
      const project = getStudy(action.id);
      project.paused = action.paused;
      note(
        s,
        `${RESEARCH[project.id].name} ${action.paused ? 'paused' : 'resumed'}.`,
      );
      break;
    }
    case 'abandonResearch': {
      const project = getStudy(action.id);
      note(
        s,
        `${RESEARCH[project.id].name} abandoned. Cash and knowledge are not refunded.`,
      );
      setStudies(activeStudies(s).filter((p) => p.id !== project.id));
      break;
    }
    case 'breed': {
      if (!action.introductory && !s.research.includes('breeding'))
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
      const permission = action.introductory
        ? introductoryCrossPermission(s, action.parents, action.trait)
        : breedingPermission(s, action.parents, action.trait);
      if (permission) throw new Error(permission);
      const terms = action.introductory ? INTRO_BREEDING : BREEDING;
      if (s.knowledge < terms.knowledge)
        throw new Error(`A breeding trial needs ${terms.knowledge} knowledge.`);
      spend(
        s,
        action.introductory ? 'Introductory breeding trial' : 'Breeding trial',
        terms.cost,
      );
      s.knowledge -= terms.knowledge;
      const [a, b] = action.parents.map((p) => getVariety(s, p));
      const trait = action.trait;
      const duration = action.introductory
        ? INTRO_BREEDING.weeks
        : breedingWeeks(s);
      // Draw inheritance now and persist the result so reloads cannot reroll a trial.
      const inherited = random(s) < 0.5 ? a : b;
      const result = {
        id: `cross-${s.nextHybrid++}`,
        name,
        color: inherited.color,
        wineType: inherited.wineType,
        preferred: inherited.preferred,
        note: `An estate crossing selected for ${TRAITS[trait].name.toLowerCase()}.`,
        ...breedingPreview(s, action.parents, trait),
        collection: 'discovery' as const,
        parents: action.parents,
        trait,
        created: s.week,
      };
      s.breedingProject = { result, remaining: duration, duration };
      if (action.introductory) s.introCrossId = result.id;
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
    case 'harvestAll':
    case 'tendAll': {
      const plan = fieldWorkPlan(s, action.type);
      if (plan.blocked) throw new Error(plan.blocked);
      const type = action.type === 'harvestAll' ? 'harvest' : 'tend';
      // Each action uses the normal accounting and provenance path. No partial
      // result reaches the caller if any parcel fails validation.
      let result = s;
      for (const p of plan.plots) result = act(result, { type, id: p.id });
      note(
        result,
        `${plan.plots.length} ${plan.plots.length === 1 ? 'parcel' : 'parcels'} ${type === 'harvest' ? 'harvested' : 'tended'} at ${getEstate(s).name} for ${money(plan.cost)}.`,
        'good',
      );
      return result;
    }
    case 'tend': {
      const p = getPlot(action.id);
      if (!p.owned || !p.variety || calendar(s.week).season === 'Winter')
        throw new Error('Choose a planted parcel during the growing season.');
      if (p.tended === s.week)
        throw new Error('These vines have already been tended this week.');
      if (!readyToTend(p, s.week))
        throw new Error('These vines are resting or already at full health.');
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
      const growingWeeks = calendar(s.week).week;
      const sunnyWeeks = Array.from(
        { length: growingWeeks },
        (_, i) => weather(s.week - i, land.region).name,
      ).filter((sky) => sky === 'Sunshine' || sky === 'Dry spell').length;
      s.grapes.push({
        id: s.nextId++,
        variety: p.variety!,
        kg,
        quality: q,
        directCostCents: plotHarvestCost(p) * 100,
        picked: s.week,
        harvest: {
          ripeness: p.growth,
          health: p.health,
          sunExposure: sunnyWeeks / growingWeeks,
        },
        estateId: land.estateId,
        parcel: { id: land.id, name: land.name, soil: land.soil },
      });
      p.harvestedYear = calendar(s.week).year;
      p.growth = 0;
      s.stats.harvested += kg;
      const chapter = journalChapter(s.vintageJournal, calendar(s.week).year);
      chapter.harvestKg += kg;
      chapter.harvests++;
      if (chapter.harvests === 1)
        rememberMoment(
          s.vintageJournal,
          s.week,
          `The first pick: ${kg} kg of ${getVariety(s, p.variety!).name} from ${land.name}.`,
        );
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
      const requested = cellarTechniquesSchema.safeParse(
        action.techniques ?? [],
      );
      if (!requested.success)
        throw new Error('Choose valid cellar techniques, once each.');
      const techniques = CELLAR_TECHNIQUE_IDS.filter((id) =>
        requested.data.includes(id),
      );
      for (const id of techniques)
        if (!s.research.includes(id))
          throw new Error(
            `Research ${CELLAR_TECHNIQUES[id].name} before using it.`,
          );
      if (grapeLiters(g.kg) < 1)
        throw new Error('There are not enough grapes to ferment.');
      const plan = fermentationPlan(s, g.kg, action.oak, techniques);
      if (plan.liters === 0)
        throw new Error(
          'No empty tanks available. Move finished wine to reserves or buy more tanks.',
        );
      spend(
        s,
        action.oak ? 'French oak vinification' : 'Stainless steel vinification',
        plan.cost,
      );
      const harvestCost =
        g.directCostCents === undefined
          ? undefined
          : Math.round((g.directCostCents * (g.kg - plan.remainingKg)) / g.kg);
      s.batches.push({
        id: s.nextId++,
        variety: g.variety,
        liters: plan.liters,
        tankIds: plan.fills.map((f) => f.tankId),
        quality: Math.min(
          100,
          g.quality +
            (upgradeActive(s, 'lab') ? CELLAR_QUALITY.temperatureControl : 0),
        ),
        ...(harvestCost !== undefined
          ? { directCostCents: harvestCost + plan.cost * 100 }
          : {}),
        stage: 'fermenting',
        remaining: plan.weeks,
        techniques,
        age: 0,
        oak: action.oak,
        year: calendar(g.picked).year,
        ...(g.harvest ? { harvest: { ...g.harvest } } : {}),
        ...(g.parcel ? { parcel: { ...g.parcel } } : {}),
        agingProfile: 'varietal-v1',
        maturationProfile: createMaturationProfile(
          g.variety,
          s.hybrids,
          getEstate(s, g.estateId ?? 1).region,
          g.quality,
          techniques,
        ),
        ...(g.estateId !== undefined ? { estateId: g.estateId } : {}),
      });
      if (plan.remainingKg > 0) {
        g.kg = plan.remainingKg;
        if (harvestCost !== undefined) g.directCostCents! -= harvestCost;
      } else s.grapes = s.grapes.filter((x) => x.id !== g.id);
      note(
        s,
        `${plan.liters} L of ${getVariety(s, g.variety).name} is fermenting across ${plan.fills.length} tank${plan.fills.length === 1 ? '' : 's'}. Ready in ${plan.weeks} weeks.${techniques.length ? ` Cellar plan: ${techniques.map((id) => CELLAR_TECHNIQUES[id].name).join(', ')}.` : ''}${plan.remainingKg > 0 ? ` ${plan.remainingKg} kg of grapes remain to process or sell before they spoil.` : ''}`,
        'good',
      );
      break;
    }
    case 'age': {
      const b = getBatch(action.id);
      if (
        b.stage === 'fermenting' ||
        (b.agingProfile === 'varietal-v1' && b.stage !== 'ready')
      )
        throw new Error(
          'Only finished fermentations and cellar techniques can begin further aging.',
        );
      if (b.agingProfile === 'varietal-v1' && b.maturationProfile) {
        const vessel = action.vessel ?? b.maturationProfile.preferred;
        const selection = maturationPlanSchema.safeParse({
          vessel,
          targetWeeks:
            action.targetWeeks ?? b.maturationProfile.routes[vessel]?.readyFrom,
          autoTransfer: action.autoTransfer ?? false,
        });
        if (!selection.success)
          throw new Error(
            'Choose a vessel and 1–12 whole game weeks of maturation.',
          );
        const cost = maturationCost(selection.data.vessel, b.tankIds.length);
        if (cost > 0)
          spend(s, `${VESSELS[selection.data.vessel].name} maturation`, cost);
        if (b.directCostCents !== undefined) b.directCostCents += cost * 100;
        b.maturationPlan = selection.data;
        b.stage = 'aging';
        note(
          s,
          `${getVariety(s, b.variety).name} is maturing in ${VESSELS[selection.data.vessel].name.toLowerCase()}.${selection.data.autoTransfer ? ` Automatic transfer to reserves after ${selection.data.targetWeeks} game weeks.` : ' Move it to reserves when ready to release.'}`,
        );
      } else {
        if (
          action.vessel !== undefined ||
          action.targetWeeks !== undefined ||
          action.autoTransfer !== undefined
        )
          throw new Error(
            'This older batch keeps its original vessel and eight-week aging plan.',
          );
        b.stage = 'aging';
        note(
          s,
          `${getVariety(s, b.variety).name} is maturing on its original eight-week aging curve.`,
        );
      }
      break;
    }
    case 'reserve': {
      storeBatch(getBatch(action.id));
      break;
    }
    case 'discardSmallReserves': {
      const ids = new Set(action.lots.map((lot) => lot.id));
      if (
        !action.lots.length ||
        action.lots.length > ESTATE_LIMITS.reserves ||
        ids.size !== action.lots.length
      )
        throw new Error('Choose different small reserve lots to clear.');
      let total = 0;
      for (const { id, ml } of action.lots) {
        const lot = s.reserves.find((r) => r.id === id);
        if (!lot || volume(lot.components) !== ml)
          throw new Error(
            'These reserves have changed. Review the leftovers again.',
          );
        if (!isSmallReserve(lot))
          throw new Error(
            'Only leftovers smaller than one 750 mL bottle can be cleared.',
          );
        total += ml;
      }
      s.reserves = s.reserves.filter((r) => !ids.has(r.id));
      note(
        s,
        `Discarded ${liters(total)} L of small leftovers, freeing ${ids.size} reserve ${ids.size === 1 ? 'space' : 'spaces'}.`,
      );
      break;
    }
    case 'saveBlendTrial': {
      if (s.blendTrials.length >= BLEND_TRIAL_LIMIT)
        throw new Error(
          'Your three trial spaces are full. Remove a trial to save another.',
        );
      const name = action.name.trim();
      if (!name || name.length > 40)
        throw new Error('Name your trial using 1–40 characters.');
      const { components } = planBlend(s.reserves, action.portions);
      const slot = Array.from({ length: BLEND_TRIAL_LIMIT }, (_, i) => i).find(
        (i) => !s.blendTrials.some((trial) => trial.slot === i),
      )!;
      s.blendTrials.push({
        slot,
        name,
        created: s.week,
        portions: structuredClone(action.portions),
        components,
      });
      note(
        s,
        `${name} saved as a bench trial. No wine, cash, or kits were used.`,
      );
      break;
    }
    case 'removeBlendTrial': {
      if (!s.blendTrials.some((trial) => trial.slot === action.slot))
        throw new Error('This bench trial is no longer saved.');
      s.blendTrials = s.blendTrials.filter(
        (trial) => trial.slot !== action.slot,
      );
      break;
    }
    case 'blend': {
      const name = action.name.trim();
      if (!name || name.length > 40)
        throw new Error('Name your blend using 1–40 characters.');
      const { selected, components: preview } = planBlend(
        s.reserves,
        action.portions,
      );
      const missing = blendResearchMissing(s, preview);
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
      addProductionCost(reserve.components, CELLAR_TASTING.cost * 100);
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
      compactWineHistory(s);
      if (s.wines.length >= 1000)
        throw new Error(
          'There are 1,000 active releases. Sell some stock or wait for pending judging before bottling again.',
        );
      if (count > warehouseRoom(s))
        throw new Error(
          `Your warehouse has room for ${warehouseRoom(s).toLocaleString()} more bottles. Sell some stock or expand the warehouse before bottling.`,
        );
      let line;
      if ('id' in action.line) {
        const lineId = action.line.id;
        line = s.lines.find((l) => l.id === lineId);
        if (!line) throw new Error('Wine line not found.');
      } else {
        if (s.lines.length >= 1000)
          throw new Error(
            'Your estate has 1,000 wine lines. Select an existing line for this release.',
          );
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
      const release =
        Math.max(
          line.archive?.lastRelease ?? 0,
          ...s.wines.filter((w) => w.lineId === line.id).map((w) => w.release),
          0,
        ) + 1;
      const kitCost =
        s.kitCostCents != null
          ? Math.round((s.kitCostCents * count) / s.kits)
          : null;
      const liquidCost = productionCost(components);
      const accounts = newAccounts(
        kitCost !== null && liquidCost !== null ? kitCost + liquidCost : null,
      );
      s.kitCostCents = kitCost !== null ? s.kitCostCents! - kitCost : null;
      s.kits -= count;
      if (!s.kits) s.kitCostCents = 0;
      s.wines.push({
        id: s.nextId++,
        variety: blendProfile(components, s.hybrids).dominant!.variety,
        quality: q,
        bottles: count,
        produced: count,
        accounts,
        salesSinceTracking: 0,
        marketingWeeks: 0,
        judging: null,
        price: retailPrice({ quality: q }, s),
        listed: false,
        shelfSpace: 0,
        year: Math.max(...components.map((p) => p.year)),
        label: line.name,
        lineId: line.id,
        release,
        components,
        bottled: s.week,
        tasting: tastingProfile(components, s),
        design: {
          ...line.design,
          ...(s.houseIdentity
            ? {
                houseMark: {
                  ...s.houseIdentity,
                  monogram: houseInitials(s.name, s.houseIdentity),
                },
              }
            : {}),
        },
        estate: s.name,
        founded: line.founded,
      });
      s.reserves = s.reserves.filter((r) => volume(r.components) > 0);
      rememberRelease(
        s.vintageJournal,
        s.wines.at(-1)!,
        getVariety(s, s.wines.at(-1)!.variety).wineType === 'White',
      );
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
      s.deliveries.push({ kits: 600, arrival: s.week + 1, costCents: 48000 });
      note(s, '600 bottles, corks, and labels ordered. Delivery next week.');
      break;
    }
    case 'expandBottleStorage': {
      if (action.kind !== 'warehouse' && action.kind !== 'shelves')
        throw new Error('Choose warehouse storage or shop shelves.');
      const kind = action.kind;
      const terms = BOTTLE_STORAGE[kind];
      if (s.bottleStorage[kind] >= terms.maxExpansions)
        throw new Error('This storage has reached its maximum capacity.');
      const label =
        kind === 'warehouse'
          ? 'Wine warehouse expansion'
          : 'Wine shop shelving';
      debit(s, label, storageExpansionCost(s, kind), true);
      s.bottleStorage[kind]++;
      note(
        s,
        `${label} added: room for ${terms.step} more bottles. No additional weekly upkeep.`,
        'good',
      );
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
      s.operatedUpgrades.push(action.upgrade);
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
        if (!s.operatedUpgrades.includes(id)) s.operatedUpgrades.push(id);
      } else {
        if (suspended.includes(id))
          throw new Error('This investment is already suspended.');
        // Preserve the current full bill for the facility and any operating
        // dependents before their benefits are switched off.
        for (const other of s.upgrades) {
          if (upgradeActive(s, other) && !s.operatedUpgrades.includes(other))
            s.operatedUpgrades.push(other);
        }
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
        `${u.name} ${action.active ? 'resumed' : 'suspended'}. ${action.active ? 'Full running costs and benefits apply.' : 'Benefits stop. This week’s full bill remains; 25% maintenance starts after it. Dependent investments also suspend.'}`,
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
      if (w.listed) {
        w.listed = false;
        w.shelfSpace = 0;
      } else {
        if (!saleStock(w))
          throw new Error(
            privateStock(w)
              ? 'Return bottles from your Private Collection before listing.'
              : 'This release is sold out.',
          );
        const count = action.bottles ?? suggestedShelfSpace(s, w);
        if (
          !Number.isInteger(count) ||
          count < 1 ||
          count > saleStock(w) ||
          count > shelfRoom(s)
        )
          throw new Error(
            `Choose 1–${Math.min(saleStock(w), shelfRoom(s))} bottles for this shelf. Free space from another listing or add shelves in the wine shop.`,
          );
        w.shelfSpace = count;
        w.listed = true;
      }
      note(
        s,
        `${w.label} ${w.listed ? `is on sale with ${w.shelfSpace} shelf spaces. Stock refills automatically each week.` : 'has been removed from the shop. Its shelf space is free; all bottles stay in storage.'}`,
      );
      break;
    }
    case 'shelfSpace': {
      const w = getWine(action.id);
      if (!w.listed || !saleStock(w))
        throw new Error('List this wine before adjusting its shelf space.');
      const max = Math.min(saleStock(w), shelfRoom(s) + shelfStock(w));
      if (
        !Number.isInteger(action.bottles) ||
        action.bottles < 1 ||
        action.bottles > max
      )
        throw new Error(
          `Choose 1–${max} shelf spaces. Reduce another listing or add more shelves.`,
        );
      w.shelfSpace = action.bottles;
      break;
    }
    case 'marketWine': {
      const w = getWine(action.id);
      const blocked = marketingBlocked(s, w);
      if (blocked) throw new Error(blocked);
      spend(s, `${w.label} marketing`, MARKETING.cost);
      (w.accounts ??= newAccounts()).promotionCents += MARKETING.cost * 100;
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
      const cost = judgingCost(w);
      spend(s, `${w.label} judging entry`, cost);
      (w.accounts ??= newAccounts()).promotionCents += cost * 100;
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
    case 'collectWine':
    case 'returnWine': {
      const w = getWine(action.id);
      const keeping = action.type === 'collectWine';
      const max = keeping ? saleStock(w) : privateStock(w);
      if (
        !Number.isInteger(action.bottles) ||
        action.bottles < 1 ||
        action.bottles > max
      )
        throw new Error(
          `Choose 1–${max} bottles to ${keeping ? 'keep' : 'return'}.`,
        );
      w.privateBottles =
        privateStock(w) + (keeping ? action.bottles : -action.bottles);
      // Returning bottles never starts a listing or expands its allocation.
      w.shelfSpace = Math.min(w.shelfSpace ?? 0, saleStock(w));
      if (!saleStock(w)) w.listed = false;
      note(
        s,
        `${action.bottles} ${action.bottles === 1 ? 'bottle' : 'bottles'} of ${w.label} ${keeping ? 'saved to your Private Collection. Protected from all sales.' : 'returned to selling stock.'}`,
        'good',
      );
      break;
    }
    case 'wholesale': {
      const w = getWine(action.id);
      const count = saleStock(w);
      if (!count)
        throw new Error(
          privateStock(w)
            ? 'All remaining bottles are in your Private Collection.'
            : 'This vintage is sold out.',
        );
      const revenue = count * wholesalePrice(w, s.reputation, s);
      transaction(s, `${w.label} wholesale`, revenue);
      recordWineSale(w, count, revenue);
      s.stats.sold += count;
      s.stats.revenue += revenue;
      s.reputation = Number(
        (s.reputation + count * qualityResponse(w.quality).wholesale).toFixed(
          2,
        ),
      );
      trackQualitySales(s, w, count);
      if (w.produced === null)
        w.salesSinceTracking = (w.salesSinceTracking ?? 0) + count;
      w.bottles -= count;
      w.listed = false;
      w.shelfSpace = 0;
      note(
        s,
        `A distributor bought ${count} bottles of ${w.label} for ${money(revenue)}.`,
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
  const envelope = {
    game: 'terroir',
    savedAt: new Date().toISOString(),
    state: s,
  };
  const readable = JSON.stringify(envelope, null, 2);
  return readable.length <= 2_000_000 ? readable : JSON.stringify(envelope);
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
    const grapeLicenses = LEGACY_VARIETY_IDS.filter(
      (id) =>
        VARIETIES[id].collection === 'classic' ||
        regional.has(id) ||
        old.research.includes('discovery') ||
        (VARIETIES[id].collection === 'heritage' &&
          old.research.includes('heritage')),
    );
    const legacyGrapes =
      project?.id === 'discovery'
        ? [...LEGACY_VARIETY_IDS]
        : project?.id === 'heritage'
          ? LEGACY_VARIETY_IDS.filter(
              (id) => VARIETIES[id].collection === 'heritage',
            )
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
  if (serialize(result.data.state).length > 2_000_000)
    throw new Error(
      'This save cannot fit after migration. Your current estate is safe; keep the original export.',
    );
  return result.data.state;
}
