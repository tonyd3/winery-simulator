import { styleMarket } from './styleMarket';
import { VARIETIES } from './catalog';
import type { GameState, Wine } from './game';

export const MARKET_SEED = 2026;
export const WEEKLY_DEMAND = { min: 0.65, max: 1.35 };

// Independent random streams keep pricing, renaming, and cellar actions from
// rerolling shoppers. The saved market seed and calendar reproduce every week.
function noise(seed: number, channel: string, period: number) {
  let hash = seed >>> 0;
  for (const char of `${channel}:${period}`) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  }
  hash = Math.imul(hash ^ (hash >>> 16), 0x21f0aaad);
  hash = Math.imul(hash ^ (hash >>> 15), 0x735a2d97);
  return ((hash ^ (hash >>> 15)) >>> 0) / 4294967296;
}

function trend(seed: number, channel: string, week: number, duration: number) {
  const period = Math.floor(week / duration);
  const fraction = (week % duration) / duration;
  const blend = fraction * fraction * (3 - 2 * fraction);
  return (
    noise(seed, channel, period) * (1 - blend) +
    noise(seed, channel, period + 1) * blend
  );
}

export function releaseInterest(weeksSinceBottling: number) {
  // Launch interest halves every 36 weeks above the lasting 20% audience.
  return 0.2 + 0.8 * 2 ** (-Math.max(0, weeksSinceBottling) / 36);
}

// Each source contributes proportionally; the dominant grape is only a label.
export function customerShares(wine: Wine) {
  const total = wine.components.reduce((sum, part) => sum + part.ml, 0);
  const shares = new Map<string, number>();
  for (const part of wine.components) {
    const key = `${part.variety}:${part.year}`;
    shares.set(key, (shares.get(key) ?? 0) + part.ml / total);
  }
  return shares;
}

export function customerDemandMultiplier(key: string, s: GameState) {
  return (
    WEEKLY_DEMAND.min +
    (WEEKLY_DEMAND.max - WEEKLY_DEMAND.min) *
      noise(s.marketSeed ?? MARKET_SEED, `wine:${key}`, s.week + 1)
  );
}

export function weeklyDemandMultiplier(wine: Wine, s: GameState) {
  return [...customerShares(wine)].reduce(
    (sum, [key, share]) => sum + share * customerDemandMultiplier(key, s),
    0,
  );
}

export function marketConditions(wine: Wine, s: GameState) {
  const style = styleMarket(wine.components, s);
  const seed = s.marketSeed ?? MARKET_SEED;
  const week = s.week + 1;
  const total = wine.components.reduce((sum, part) => sum + part.ml, 0);
  let whiteShare = 0;
  let popularity = 0;
  for (const part of wine.components) {
    const grape = Object.hasOwn(VARIETIES, part.variety)
      ? VARIETIES[part.variety]
      : s.hybrids.find((hybrid) => hybrid.id === part.variety);
    const share = part.ml / total;
    if (grape?.wineType === 'White') whiteShare += share;
    popularity += share * (0.7 + 0.6 * trend(seed, part.variety, week, 12));
  }
  const traffic = 0.75 + 0.5 * trend(seed, 'shop-traffic', week, 18);
  const season =
    1 + 0.18 * (2 * whiteShare - 1) * Math.cos((2 * Math.PI * (week - 5)) / 12);
  const eventPeriod = Math.floor((week - 1) / 3);
  const eventRoll = noise(seed, 'market-event', eventPeriod);
  const event =
    eventRoll < 0.14
      ? { label: 'Wine fair brings extra buyers', multiplier: 1.45 }
      : eventRoll < 0.28
        ? { label: 'Quiet tourism slows shop visits', multiplier: 0.65 }
        : null;
  const eventWeeks = 3 - ((week - 1) % 3);
  const influences = [
    {
      multiplier: traffic,
      label: traffic >= 1 ? 'Busy wine market' : 'Quieter wine market',
    },
    {
      multiplier: popularity,
      label:
        popularity >= 1
          ? 'These grapes are popular'
          : 'Less demand for these grapes',
    },
    {
      multiplier: season,
      label:
        season >= 1
          ? 'Seasonal tastes favor this wine'
          : 'Seasonal tastes favor other wines',
    },
  ];
  const strongest = influences.reduce((a, b) =>
    Math.abs(Math.log(a.multiplier)) >= Math.abs(Math.log(b.multiplier))
      ? a
      : b,
  );
  return {
    traffic,
    style,
    popularity,
    season,
    event: event ? { ...event, weeks: eventWeeks } : null,
    multiplier:
      traffic *
      popularity *
      season *
      style.multiplier *
      (event?.multiplier ?? 1),
    outlook: event
      ? `${event.label} · ${eventWeeks} ${eventWeeks === 1 ? 'week' : 'weeks'}`
      : strongest.label,
  };
}
