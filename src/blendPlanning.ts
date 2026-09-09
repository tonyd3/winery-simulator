import { z } from 'zod';
import { ESTATE_LIMITS } from './estates';
import { combine, compositionSchema, portion, volume } from './winemaking';
import type { Reserve } from './winemaking';

export const BLEND_TRIAL_LIMIT = 3;
export const BLEND_VOLUME_LIMIT = 100000000;
export type BlendPortion = { id: number; ml: number };
export const blendTrialSchema = z
  .object({
    slot: z
      .number()
      .int()
      .min(0)
      .max(BLEND_TRIAL_LIMIT - 1),
    name: z.string().trim().min(1).max(40),
    created: z.number().int().min(1).max(100000),
    portions: z
      .array(
        z
          .object({
            id: z.number().int().min(0).max(1e9),
            ml: z.number().int().min(1).max(BLEND_VOLUME_LIMIT),
          })
          .strict(),
      )
      .min(2)
      .max(ESTATE_LIMITS.reserves),
    components: compositionSchema,
  })
  .strict()
  .superRefine((trial, ctx) => {
    if (
      new Set(trial.portions.map((p) => p.id)).size !== trial.portions.length ||
      trial.portions.reduce((sum, p) => sum + p.ml, 0) !==
        volume(trial.components) ||
      volume(trial.components) > BLEND_VOLUME_LIMIT
    )
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid trial recipe.',
      });
  });
export type BlendTrial = z.infer<typeof blendTrialSchema>;

// Shared by the preview, saved trials, and the production action. Planning is read-only.
export function planBlend(
  reserves: readonly Reserve[],
  portions: readonly BlendPortion[],
) {
  if (
    portions.length < 2 ||
    portions.length > ESTATE_LIMITS.reserves ||
    new Set(portions.map((p) => p.id)).size !== portions.length
  )
    throw new Error('Select at least two different reserve lots.');
  const selected = portions.map(({ id, ml }) => {
    const lot = reserves.find((r) => r.id === id);
    if (!lot) throw new Error(`Lot ${id} is no longer in reserves.`);
    if (!Number.isInteger(ml) || ml < 1 || ml > volume(lot.components))
      throw new Error(`Choose an available volume from lot ${id}.`);
    return { lot, ml };
  });
  const components = combine(
    selected.flatMap(({ lot, ml }) =>
      portion(lot.components, ml).filter((p) => p.ml > 0),
    ),
  );
  if (volume(components) > BLEND_VOLUME_LIMIT || components.length > 500)
    throw new Error('This blend exceeds the cellar’s recipe capacity.');
  return { selected, components };
}

// Integer largest-remainder allocation: totals remain exact to the milliliter.
function distribute(total: number, weights: readonly number[]) {
  const sum = weights.reduce((n, weight) => n + weight, 0);
  const result = weights.map((weight) => Math.floor((total * weight) / sum));
  let left = total - result.reduce((n, amount) => n + amount, 0);
  const order = weights
    .map((weight, i) => ({ i, remainder: (total * weight) % sum }))
    .sort((a, b) => b.remainder - a.remainder || a.i - b.i);
  for (const { i } of order) if (left-- > 0) result[i]++;
  return result;
}
export function recipePercentages(portions: readonly BlendPortion[]) {
  const weights = portions.map((p) =>
    Number.isInteger(p.ml) && p.ml > 0 ? p.ml : 1,
  );
  return distribute(10000, weights).map((n) => String(n / 100));
}
export function percentWeights(values: readonly string[]) {
  const weights = values.map((value) => {
    const n = Number(value);
    if (
      !value.trim() ||
      !Number.isFinite(n) ||
      n <= 0 ||
      n > 100 ||
      Math.abs(n * 100 - Math.round(n * 100)) > 0.000001
    )
      throw new Error(
        'Use positive percentages with up to two decimal places.',
      );
    return Math.round(n * 100);
  });
  if (weights.length < 2 || weights.reduce((n, p) => n + p, 0) !== 10000)
    throw new Error('Recipe percentages must add up to 100%.');
  return weights;
}
export function maximumBlendVolume(
  lots: readonly Reserve[],
  weights: readonly number[],
) {
  if (
    lots.length !== weights.length ||
    weights.length < 2 ||
    weights.some((w) => !Number.isInteger(w) || w <= 0) ||
    weights.reduce((sum, w) => sum + w, 0) !== 10000
  )
    throw new Error('Choose a valid percentage for each source lot.');
  return Math.min(
    BLEND_VOLUME_LIMIT,
    ...lots.map((lot, i) =>
      Math.floor((volume(lot.components) * 10000) / weights[i]),
    ),
  );
}
export function allocateBlend(
  lots: readonly Reserve[],
  weights: readonly number[],
  ml: number,
) {
  maximumBlendVolume(lots, weights);
  if (!Number.isInteger(ml) || ml < 1 || ml > BLEND_VOLUME_LIMIT)
    throw new Error('Choose a batch size between 0.001 and 100,000 L.');
  const portions = distribute(ml, weights).map((amount, i) => ({
    id: lots[i].id,
    ml: amount,
  }));
  planBlend(lots, portions);
  return portions;
}
export function trialAvailability(
  reserves: readonly Reserve[],
  trial: BlendTrial,
) {
  try {
    planBlend(reserves, trial.portions);
    return null;
  } catch (error) {
    return error instanceof Error
      ? error.message
      : 'Source wine is unavailable.';
  }
}
