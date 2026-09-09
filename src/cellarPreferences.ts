import { z } from 'zod';
import { cellarTechniquesSchema } from './cellarTechniques';

const cellarChoicesSchema = z.object({
  oak: z.boolean(),
  techniques: cellarTechniquesSchema,
});
export type CellarChoices = z.infer<typeof cellarChoicesSchema>;

const preferenceKey = (variety: string) =>
  `terroir-cellar-choices:${encodeURIComponent(variety)}`;

export function loadCellarChoices(
  variety: string,
  research: readonly string[],
): CellarChoices {
  try {
    const raw = localStorage.getItem(preferenceKey(variety));
    const saved = cellarChoicesSchema.safeParse(raw ? JSON.parse(raw) : null);
    if (saved.success)
      return {
        oak: saved.data.oak,
        techniques: saved.data.techniques.filter((id) => research.includes(id)),
      };
  } catch {
    // Corrupt or unavailable preferences must never prevent fermentation.
  }
  return { oak: false, techniques: [] };
}

export function saveCellarChoices(variety: string, choices: CellarChoices) {
  try {
    localStorage.setItem(preferenceKey(variety), JSON.stringify(choices));
    return true;
  } catch {
    return false;
  }
}
