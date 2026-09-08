import { z } from 'zod';
import type { GameState, Wine } from './game';
import type { ArchiveSummary } from './winemaking';

export const centsSchema = z.number().int().min(0).max(1e14);
const totalsSchema = z
  .object({
    income: centsSchema,
    operating: centsSchema,
    investment: centsSchema,
  })
  .strict();
export const financeSchema = z
  .object({
    startedWeek: z.number().int().min(1).max(100000),
    openingCash: z.number().finite().min(0).max(1e12),
    totals: totalsSchema,
    seasons: z
      .array(
        totalsSchema
          .extend({ season: z.number().int().min(0).max(33333) })
          .strict(),
      )
      .max(40),
  })
  .strict();
export const releaseAccountsSchema = z
  .object({
    costCents: centsSchema.nullable(),
    revenueCents: centsSchema,
    promotionCents: centsSchema,
    sold: z.number().int().min(0).max(1e9),
  })
  .strict();
export const archivedAccountsSchema = z
  .object({
    revenueCents: centsSchema,
    costCents: centsSchema,
    promotionCents: centsSchema,
    complete: z.boolean(),
  })
  .strict();
export const emptyTotals = () => ({ income: 0, operating: 0, investment: 0 });
export const newAccounts = (costCents: number | null = null) => ({
  costCents,
  revenueCents: 0,
  promotionCents: 0,
  sold: 0,
});
export function startFinance(
  week: number,
  cash: number,
): z.infer<typeof financeSchema> {
  return {
    startedWeek: week,
    openingCash: cash,
    totals: emptyTotals(),
    seasons: [],
  };
}
export function recordCash(s: GameState, amount: number, investment = false) {
  const finance = (s.finance ??= startFinance(s.week, s.cash));
  const season = Math.floor((s.week - 1) / 3);
  if (finance.seasons[0]?.season !== season) {
    finance.seasons.unshift({ season, ...emptyTotals() });
    finance.seasons = finance.seasons.slice(0, 40);
  }
  const category =
    amount >= 0 ? 'income' : investment ? 'investment' : 'operating';
  const cents = Math.round(Math.abs(amount) * 100);
  finance.totals[category] += cents;
  finance.seasons[0][category] += cents;
}
export function recordWineSale(wine: Wine, count: number, revenue: number) {
  if (!count) return;
  const accounts = (wine.accounts ??= newAccounts());
  accounts.sold += count;
  accounts.revenueCents += Math.round(revenue * 100);
}
export function releaseResult(wine: Wine) {
  const accounts = wine.accounts ?? newAccounts();
  const productionCost = accounts.costCents;
  const soldCost =
    productionCost !== null && wine.produced
      ? Math.round((productionCost * accounts.sold) / wine.produced)
      : null;
  return {
    revenueCents: accounts.revenueCents,
    costCents: soldCost,
    promotionCents: accounts.promotionCents,
    inventoryCents:
      productionCost !== null && soldCost !== null
        ? productionCost - soldCost
        : null,
    marginCents:
      soldCost !== null
        ? accounts.revenueCents - soldCost - accounts.promotionCents
        : null,
  };
}
export function releaseFacts(wine: Wine) {
  const result = releaseResult(wine);
  const recordedSold = wine.accounts?.sold ?? 0;
  const salesComplete =
    wine.produced !== null && recordedSold === wine.produced - wine.bottles;
  const profitCents = salesComplete ? result.marginCents : null;
  return {
    ...result,
    profitCents,
    averagePriceCents:
      recordedSold > 0 ? result.revenueCents / recordedSold : null,
    profitPerBottleCents:
      recordedSold > 0 && profitCents !== null
        ? profitCents / recordedSold
        : null,
    soldPercent:
      wine.produced !== null && wine.produced > 0
        ? ((wine.produced - wine.bottles) / wine.produced) * 100
        : null,
  };
}

export function wineLineResult(
  releases: readonly Wine[],
  archive?: ArchiveSummary,
) {
  const archived = archive?.accounts;
  let profitCents: number | null = archive
    ? archived?.complete
      ? archived.revenueCents - archived.costCents - archived.promotionCents
      : null
    : 0;
  let best = archive?.best ?? null;
  for (const wine of releases) {
    const result = releaseFacts(wine);
    profitCents =
      profitCents !== null && result.profitCents !== null
        ? profitCents + result.profitCents
        : null;
    best = Math.max(best ?? 0, wine.quality);
  }
  return { profitCents, best };
}

export function archiveAccounts(
  wine: Wine,
  previous?: z.infer<typeof archivedAccountsSchema>,
  priorReleases = 0,
) {
  const result = releaseResult(wine);
  return {
    revenueCents: (previous?.revenueCents ?? 0) + result.revenueCents,
    costCents: (previous?.costCents ?? 0) + (result.costCents ?? 0),
    promotionCents: (previous?.promotionCents ?? 0) + result.promotionCents,
    complete:
      (previous?.complete ?? priorReleases === 0) && result.costCents !== null,
  };
}
