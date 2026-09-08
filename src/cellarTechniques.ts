import { z } from 'zod';

export const CELLAR_TECHNIQUE_IDS = [
  'skin_contact',
  'malolactic',
  'lees_aging',
] as const;
export type CellarTechnique = (typeof CELLAR_TECHNIQUE_IDS)[number];
export const cellarTechniquesSchema = z
  .array(z.enum(CELLAR_TECHNIQUE_IDS))
  .max(CELLAR_TECHNIQUE_IDS.length)
  .refine(
    (ids) => new Set(ids).size === ids.length,
    'Choose each technique once.',
  );

// Compressed game time, not a real cellar schedule. These change style, not quality.
export const CELLAR_TECHNIQUES = {
  skin_contact: {
    name: 'Skin contact',
    weeks: 1,
    perTank: 40,
    description:
      'More body and tannin. Keep white grapes on their skins; extend contact for reds.',
  },
  malolactic: {
    name: 'Malolactic fermentation',
    weeks: 2,
    perTank: 60,
    description:
      'Softer acidity and a rounder body as sharp malic acid becomes gentler lactic acid.',
  },
  lees_aging: {
    name: 'Lees aging',
    weeks: 3,
    perTank: 50,
    description:
      'Fuller texture and bread-dough notes from resting on fine yeast sediment.',
  },
} as const;

export const vinificationWeeks = (
  techniques: readonly CellarTechnique[] = [],
) =>
  2 + techniques.reduce((weeks, id) => weeks + CELLAR_TECHNIQUES[id].weeks, 0);

export function vinificationStage(batch: {
  remaining: number;
  techniques?: CellarTechnique[];
}) {
  let elapsed = vinificationWeeks(batch.techniques) - batch.remaining;
  if (elapsed < 2) return 'Fermenting';
  elapsed -= 2;
  for (const id of CELLAR_TECHNIQUE_IDS) {
    if (!batch.techniques?.includes(id)) continue;
    if (elapsed < CELLAR_TECHNIQUES[id].weeks)
      return CELLAR_TECHNIQUES[id].name;
    elapsed -= CELLAR_TECHNIQUES[id].weeks;
  }
  return 'Ready for reserves';
}

export const techniqueKey = (techniques: readonly CellarTechnique[] = []) =>
  CELLAR_TECHNIQUE_IDS.filter((id) => techniques.includes(id)).join(',');
