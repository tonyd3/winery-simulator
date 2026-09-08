import { RESEARCH, VARIETIES, REGIONS, BREEDING } from './catalog';
import type { ResearchId } from './catalog';
import type { GameState } from './game';
import type { WineComponent } from './winemaking';

function legacyGrapeAccess(s: GameState, id: string) {
  const v = VARIETIES[id];
  return (
    v &&
    (v.collection === 'classic' ||
      s.estates.some((e) => REGIONS[e.region].signature.includes(id)) ||
      s.research.includes('discovery') ||
      (v.collection === 'heritage' && s.research.includes('heritage')))
  );
}
export function researchComplete(s: GameState, id: ResearchId) {
  const grape = RESEARCH[id]?.grape;
  return (
    s.research.includes(id) ||
    Boolean(
      grape &&
      (s.grapeLicenses
        ? s.grapeLicenses.includes(grape)
        : legacyGrapeAccess(s, grape)),
    )
  );
}
export function researchTerms(s: GameState, id: ResearchId) {
  const r = RESEARCH[id];
  const local = Boolean(
    r.grape && REGIONS[s.region].signature.includes(r.grape),
  );
  return {
    ...r,
    local,
    cost: Math.round(r.cost * (local ? 0.8 : 1)),
    weeks: Math.max(1, r.weeks - (local ? 2 : 0)),
  };
}
export function blendResearchMissing(
  s: GameState,
  parts: WineComponent[],
): ResearchId[] {
  const used = parts.filter((p) => p.ml > 0);
  const required: ResearchId[] = ['oenology'];
  if (new Set(used.map((p) => p.variety)).size > 1) required.push('assemblage');
  if (new Set(used.map((p) => p.year)).size > 1)
    required.push('vintage_blending');
  if (new Set(used.map((p) => p.estateId ?? 1)).size > 1)
    required.push('regional_blending');
  const colors = new Set(
    used.map(
      (p) =>
        (VARIETIES[p.variety] ?? s.hybrids.find((h) => h.id === p.variety))
          ?.wineType,
    ),
  );
  if (colors.size > 1) required.push('rose_trials');
  return required.filter((id) => !researchComplete(s, id));
}
export const breedingWeeks = (s: GameState) =>
  s.research.includes('selection') ? BREEDING.selectedWeeks : BREEDING.weeks;
export function breedingPermission(
  s: GameState,
  parents: string[],
  trait: string,
) {
  if (!s.research.includes('breeding'))
    return 'Research Cross-pollination first.';
  if (
    parents.some((p) => p.startsWith('cross-')) &&
    !s.research.includes('backcrossing')
  )
    return 'Research Generational crosses to use hybrid parents.';
  if (trait === 'finesse' && !s.research.includes('genomics'))
    return 'Research Aroma & finesse selection for the Wine quality trait.';
  return null;
}
export const researchDuration = (weeks: number) => {
  const years = Math.floor(weeks / 12),
    rest = weeks % 12;
  return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}${years ? ` · ${years} game ${years === 1 ? 'year' : 'years'}${rest ? ` ${rest}w` : ''}` : ''}`;
};
