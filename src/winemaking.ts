import { z } from 'zod';

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
export const componentSchema = z
  .object({
    variety: z.string().min(1).max(32),
    year: count(10000),
    ml: count(100000000).min(1),
    quality: z.number().finite().min(0).max(100),
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
export const wineLineSchema = z
  .object({
    id: count(),
    name: z.string().trim().min(1).max(40),
    founded: count(10000),
    design: labelDesignSchema,
  })
  .strict();
export type LabelDesign = z.infer<typeof labelDesignSchema>;
export type WineComponent = z.infer<typeof componentSchema>;
export type Reserve = z.infer<typeof reserveSchema>;
export type WineLine = z.infer<typeof wineLineSchema>;
export const volume = (parts: WineComponent[]) =>
  parts.reduce((n, p) => n + p.ml, 0);
export const liters = (ml: number) =>
  (ml / 1000).toLocaleString('en-US', { maximumFractionDigits: 3 });
export const vintage = (parts: WineComponent[]) => {
  const years = [...new Set(parts.map((p) => p.year))].sort((a, b) => a - b);
  return years.length === 1
    ? `Year ${years[0]}`
    : `Multi-vintage · Years ${years.join(' / ')}`;
};

// Keep intrinsic quality in the recipe. Mixing an existing blend never compounds a bonus.
export function assess(parts: WineComponent[]) {
  const total = volume(parts);
  if (!total) return { base: 0, balance: 0, expected: 0 };
  const base = parts.reduce((n, p) => n + p.quality * p.ml, 0) / total;
  const grapes = new Map<string, number>();
  for (const p of parts)
    grapes.set(p.variety, (grapes.get(p.variety) ?? 0) + p.ml);
  const balance = Math.min(
    3,
    Math.floor((1 - Math.max(...grapes.values()) / total) * 6 + 1e-9),
  );
  return { base, balance, expected: Math.min(100, Math.round(base + balance)) };
}

export function blendProfile(parts: WineComponent[]) {
  const total = volume(parts);
  const score = assess(parts);
  const sources = new Map<
    string,
    { variety: string; year: number; ml: number; qualityTotal: number }
  >();
  const grapes = new Map<string, number>();
  for (const part of parts) {
    const key = `${part.variety}:${part.year}`;
    const source = sources.get(key) ?? {
      variety: part.variety,
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
        year: source.year,
        quality: source.qualityTotal / source.ml,
        share: (source.ml / total) * 100,
      }))
      .sort((a, b) => b.quality - a.quality || b.share - a.share),
    dominant: dominant
      ? { variety: dominant[0], share: (dominant[1] / total) * 100 }
      : null,
    // Round down so a displayed target actually crosses the balance threshold.
    nextBalanceTarget:
      score.balance < 3
        ? Math.floor((1 - (score.balance + 1) / 6) * 1000 + 1e-9) / 10
        : null,
    varietyCount: grapes.size,
  };
}

export function combine(parts: WineComponent[]): WineComponent[] {
  const grouped = new Map<string, WineComponent>();
  for (const part of parts) {
    const key = `${part.variety}:${part.year}:${part.quality}`;
    const existing = grouped.get(key);
    if (existing) existing.ml += part.ml;
    else grouped.set(key, { ...part });
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
  return allocated;
}
export function take(reserve: Reserve, ml: number): WineComponent[] {
  const taken = portion(reserve.components, ml);
  reserve.components = reserve.components
    .map((p, i) => ({ ...p, ml: p.ml - taken[i].ml }))
    .filter((p) => p.ml > 0);
  return taken.filter((p) => p.ml > 0);
}
