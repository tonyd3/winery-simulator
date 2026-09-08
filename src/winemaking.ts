import { centsSchema, archivedAccountsSchema } from './finance';
import { z } from 'zod';
import { cellarTechniquesSchema, techniqueKey } from './cellarTechniques';
import { grapeCompatibility } from './blendCompatibility';
import type { GrapeLineage } from './blendCompatibility';
import { MATURATION_LIMIT, vesselSchema } from './maturation';

export const CELLAR_TASTING = { cost: 60, variation: 3 };

const count = (max = 1e9) => z.number().int().min(0).max(max);
export const labelDesignSchema = z
  .object({
    style: z.enum(['heritage', 'estate', 'modern']),
    bottle: z.enum(['shouldered', 'rounded', 'slender']),
    color: z.enum(['claret', 'olive', 'ochre', 'ink']),
  })
  .strict();
export const DEFAULT_DESIGN: LabelDesign = {
  style: 'heritage',
  bottle: 'shouldered',
  color: 'claret',
};
export const LABEL_COLORS = {
  claret: '#774b60',
  olive: '#657353',
  ochre: '#ab783f',
  ink: '#485c67',
};
// Captured when picked, before vine state resets or cellar quality gains apply.
export const harvestCharacterSchema = z
  .object({
    ripeness: z.number().finite().min(80).max(100),
    health: z.number().finite().min(0).max(100),
    sunExposure: z.number().finite().min(0).max(1),
  })
  .strict();
export const componentSchema = z
  .object({
    variety: z.string().min(1).max(32),
    estateId: z.number().int().min(1).max(8).optional(),
    year: count(10000),
    ml: count(100000000).min(1),
    quality: z.number().finite().min(0).max(100),
    techniques: cellarTechniquesSchema.optional(),
    harvest: harvestCharacterSchema.optional(),
    directCostCents: centsSchema.optional(),
    fermentation: z.enum(['oak', 'steel']).optional(),
    maturation: z
      .union([
        z
          .object({
            vessel: z.enum(['oak', 'steel']),
            weeks: count(8),
          })
          .strict(),
        z
          .object({
            version: z.literal(1),
            vessel: vesselSchema,
            weeks: count(MATURATION_LIMIT),
            oakDominant: z.boolean(),
          })
          .strict(),
      ])
      .optional(),
  })
  .strict();
export const compositionSchema = z.array(componentSchema).min(1).max(500);
export const reserveSchema = z
  .object({
    id: count(),
    name: z.string().trim().min(1).max(40),
    components: compositionSchema,
    stored: count(100000),
    score: count(100).nullable(),
  })
  .strict();
export const archiveSummarySchema = z
  .object({
    accounts: archivedAccountsSchema.optional(),
    releases: count(),
    lastRelease: count(),
    sold: count(),
    produced: count(),
    complete: z.boolean(),
    best: count(100),
  })
  .strict();
export type ArchiveSummary = z.infer<typeof archiveSummarySchema>;
export const wineLineSchema = z
  .object({
    id: count(),
    name: z.string().trim().min(1).max(40),
    founded: count(10000),
    design: labelDesignSchema,
    archive: archiveSummarySchema.optional(),
  })
  .strict();
export type LabelDesign = z.infer<typeof labelDesignSchema>;
export type WineComponent = z.infer<typeof componentSchema>;
export type Reserve = z.infer<typeof reserveSchema>;
export type WineLine = z.infer<typeof wineLineSchema>;
export const volume = (parts: WineComponent[]) =>
  parts.reduce((n, p) => n + p.ml, 0);
export const isSmallReserve = (reserve: Reserve) => {
  const ml = volume(reserve.components);
  return ml > 0 && ml < 750;
};
export const liters = (ml: number) =>
  (ml / 1000).toLocaleString('en-US', { maximumFractionDigits: 3 });
export const vintage = (parts: WineComponent[]) => {
  const years = [...new Set(parts.map((p) => p.year))].sort((a, b) => a - b);
  return years.length === 1
    ? `Year ${years[0]}`
    : `Multi-vintage · Years ${years.join(' / ')}`;
};

// Keep intrinsic quality in the recipe. Mixing an existing blend never compounds a bonus.
export function assess(
  parts: WineComponent[],
  hybrids: readonly GrapeLineage[] = [],
) {
  const total = volume(parts);
  const base = total
    ? parts.reduce((n, p) => n + p.quality * p.ml, 0) / total
    : 0;
  const harmony = grapeCompatibility(parts, hybrids);
  return {
    base,
    ...harmony,
    expected: Math.max(
      0,
      Math.min(100, Math.round(base + harmony.compatibility)),
    ),
  };
}

export function blendProfile(
  parts: WineComponent[],
  hybrids: readonly GrapeLineage[] = [],
) {
  const total = volume(parts);
  const score = assess(parts, hybrids);
  const sources = new Map<
    string,
    {
      variety: string;
      year: number;
      ml: number;
      qualityTotal: number;
      estateId?: number;
    }
  >();
  const grapes = new Map<string, number>();
  for (const part of parts) {
    const key = `${part.variety}:${part.year}:${part.estateId ?? 1}`;
    const source = sources.get(key) ?? {
      variety: part.variety,
      ...(part.estateId !== undefined ? { estateId: part.estateId } : {}),
      year: part.year,
      ml: 0,
      qualityTotal: 0,
    };
    source.ml += part.ml;
    source.qualityTotal += part.quality * part.ml;
    sources.set(key, source);
    grapes.set(part.variety, (grapes.get(part.variety) ?? 0) + part.ml);
  }
  const dominant = [...grapes].sort((a, b) => b[1] - a[1])[0];
  return {
    ...score,
    low: Math.max(0, score.expected - CELLAR_TASTING.variation),
    high: Math.min(100, score.expected + CELLAR_TASTING.variation),
    sources: [...sources.values()]
      .map((source) => ({
        variety: source.variety,
        ...(source.estateId !== undefined ? { estateId: source.estateId } : {}),
        year: source.year,
        quality: source.qualityTotal / source.ml,
        share: (source.ml / total) * 100,
      }))
      .sort((a, b) => b.quality - a.quality || b.share - a.share),
    dominant: dominant
      ? { variety: dominant[0], share: (dominant[1] / total) * 100 }
      : null,
    varietyCount: grapes.size,
  };
}

export function combine(parts: WineComponent[]): WineComponent[] {
  const grouped = new Map<string, WineComponent>();
  for (const part of parts) {
    const aging = part.maturation;
    const harvest = part.harvest;
    const maturationKey = aging
      ? `${aging.vessel}:${aging.weeks}:${'version' in aging ? `${aging.version}:${aging.oakDominant}` : 'legacy'}`
      : 'unrecorded';
    const key = `${part.variety}:${part.year}:${part.quality}:${part.estateId ?? 1}:${maturationKey}:${part.fermentation ?? 'unrecorded'}:${part.techniques ? techniqueKey(part.techniques) : 'unrecorded'}:${harvest ? `${harvest.ripeness}:${harvest.health}:${harvest.sunExposure}` : 'unrecorded'}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.ml += part.ml;
      if (
        existing.directCostCents !== undefined &&
        part.directCostCents !== undefined
      )
        existing.directCostCents += part.directCostCents;
      else delete existing.directCostCents;
    } else grouped.set(key, { ...part });
  }
  return [...grouped.values()].sort(
    (a, b) =>
      b.ml - a.ml || a.variety.localeCompare(b.variety) || a.year - b.year,
  );
}

// Largest-remainder allocation conserves every milliliter, including partial bottles.
export function portion(parts: WineComponent[], ml: number): WineComponent[] {
  const total = volume(parts);
  if (!Number.isInteger(ml) || ml < 0 || ml > total)
    throw new Error('Choose an available volume.');
  const allocated = parts.map((p) => ({
    ...p,
    ml: Math.floor((p.ml * ml) / total),
  }));
  let left = ml - volume(allocated);
  const order = parts
    .map((p, i) => ({ i, remainder: (p.ml * ml) % total }))
    .sort((a, b) => b.remainder - a.remainder);
  for (const { i } of order) if (left-- > 0) allocated[i].ml++;
  for (const [i, part] of allocated.entries()) {
    if (parts[i].directCostCents !== undefined)
      part.directCostCents = Math.round(
        (parts[i].directCostCents! * part.ml) / parts[i].ml,
      );
  }
  return allocated;
}
export function take(reserve: Reserve, ml: number): WineComponent[] {
  const taken = portion(reserve.components, ml);
  reserve.components = reserve.components
    .map((p, i) => ({
      ...p,
      ml: p.ml - taken[i].ml,
      ...(p.directCostCents !== undefined
        ? { directCostCents: p.directCostCents - taken[i].directCostCents! }
        : {}),
    }))
    .filter((p) => p.ml > 0);
  return taken.filter((p) => p.ml > 0);
}

export function productionCost(parts: WineComponent[]): number | null {
  return parts.every((p) => p.directCostCents !== undefined)
    ? parts.reduce((n, p) => n + p.directCostCents!, 0)
    : null;
}
export function addProductionCost(parts: WineComponent[], cents: number) {
  const total = volume(parts);
  let allocated = 0;
  for (const [i, part] of parts.entries()) {
    const cost =
      i === parts.length - 1
        ? cents - allocated
        : Math.floor((cents * part.ml) / total);
    allocated += cost;
    if (part.directCostCents !== undefined) part.directCostCents += cost;
  }
}
