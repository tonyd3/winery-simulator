import type { GameState } from './game';
import type { WineComponent } from './winemaking';

export const CELLAR_STYLES = {
  fresh: 'Fruit-forward wines',
  rounded: 'Round, textured wines',
  structured: 'Skin-contact wines',
  oak: 'Oak-influenced wines',
} as const;
export type CellarStyle = keyof typeof CELLAR_STYLES;
const styles = Object.keys(CELLAR_STYLES) as CellarStyle[];

// A visible twelve-sale-week cycle gives cellar decisions time to reach market.
export function stylePreference(s: Pick<GameState, 'week' | 'marketSeed'>) {
  const index = Math.floor(s.week / 12) % styles.length;
  return {
    style: styles[index],
    label: CELLAR_STYLES[styles[index]],
    next: CELLAR_STYLES[styles[(index + 1) % styles.length]],
    weeks: 12 - (s.week % 12),
  };
}

export function cellarStyleShares(parts: WineComponent[]) {
  const total = parts.reduce((sum, part) => sum + part.ml, 0);
  const result = { fresh: 0, rounded: 0, structured: 0, oak: 0 };
  if (!total) return result;
  for (const part of parts) {
    const maturation = part.maturation;
    const rounded =
      (part.techniques?.includes('malolactic') ? 0.6 : 0) +
      (part.techniques?.includes('lees_aging') ? 0.8 : 0) +
      (maturation?.vessel === 'neutral'
        ? Math.min(0.8, maturation.weeks * 0.2)
        : 0);
    const structured = part.techniques?.includes('skin_contact') ? 1 : 0;
    const oak = Math.min(
      1,
      (part.fermentation === 'oak' ? 0.35 : 0) +
        (maturation?.vessel === 'oak' ? maturation.weeks * 0.25 : 0),
    );
    const treatments = rounded + structured + oak;
    const profile = {
      fresh: Math.max(0, 1 - treatments),
      rounded,
      structured,
      oak,
    };
    const weight = part.ml / total / Math.max(1, treatments);
    for (const style of styles) result[style] += profile[style] * weight;
  }
  return result;
}

export function styleMarket(
  parts: WineComponent[],
  s: Pick<GameState, 'week' | 'marketSeed'>,
) {
  const preference = stylePreference(s);
  const affinity = cellarStyleShares(parts)[preference.style];
  return { ...preference, multiplier: 0.85 + 0.6 * affinity };
}
