import { z } from 'zod';

export const MARKETING = {
  cost: 240,
  weeks: 4,
  priceBonus: 2,
  demandBonus: 0.4,
};
export const JUDGING = { cost: 180, weeks: 2, variation: 5 };

export const judgingSchema = z
  .object({
    remaining: z.number().int().min(0).max(JUDGING.weeks),
    // The panel's result is drawn once on entry, then revealed when judging ends.
    score: z.number().int().min(0).max(100),
  })
  .strict();

export const AWARDS = [
  { name: 'Gold', minimum: 90, priceBonus: 6, demandBonus: 0.3 },
  { name: 'Silver', minimum: 85, priceBonus: 4, demandBonus: 0.2 },
  { name: 'Bronze', minimum: 80, priceBonus: 2, demandBonus: 0.1 },
] as const;

type Recognition = { judging?: z.infer<typeof judgingSchema> | null };
export function wineAward(wine: Recognition) {
  return wine.judging?.remaining === 0
    ? (AWARDS.find((award) => wine.judging!.score >= award.minimum) ?? null)
    : null;
}

export function wineBenefits(
  wine: Recognition & { marketingWeeks?: number },
  retail = true,
) {
  const award = wineAward(wine);
  const marketing = retail && (wine.marketingWeeks ?? 0) > 0;
  return {
    price: (award?.priceBonus ?? 0) + (marketing ? MARKETING.priceBonus : 0),
    demand: (award?.demandBonus ?? 0) + (marketing ? MARKETING.demandBonus : 0),
  };
}
