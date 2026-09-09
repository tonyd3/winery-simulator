import {
  RESEARCH,
  VARIETIES,
  REGIONS,
  BREEDING,
  LEGACY_VARIETY_IDS,
} from './catalog';
import type { ResearchId } from './catalog';
import type { GameState } from './game';
import type { WineComponent } from './winemaking';

export const STUDY_SLOTS = { max: 8, costStep: 5000 };
export const studySlotCount = (s: Pick<GameState, 'researchSlots'>) =>
  s.researchSlots ?? 1;
export const studySlotCost = (s: Pick<GameState, 'researchSlots'>) =>
  studySlotCount(s) * STUDY_SLOTS.costStep;
export const activeStudies = (
  s: Pick<GameState, 'researchProject' | 'additionalResearchProjects'>,
) => [
  ...(s.researchProject ? [s.researchProject] : []),
  ...(s.additionalResearchProjects ?? []),
];

function legacyGrapeAccess(s: GameState, id: string) {
  const v = VARIETIES[id];
  return (
    v &&
    LEGACY_VARIETY_IDS.includes(id) &&
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
  if (new Set(used.map((p) => p.variety)).size > 2) required.push('assemblage');
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
export const INTRO_BREEDING = { cost: 1800, knowledge: 40, weeks: 8 };
export function introductoryCrossAvailable(s: GameState) {
  return !s.introCrossId && !s.hybrids.length && !s.breedingProject;
}
export function introductoryCrossPermission(
  s: GameState,
  parents: string[],
  trait: string,
) {
  if (!introductoryCrossAvailable(s))
    return 'Your introductory cross has already been used.';
  if (!s.research.includes('ampelography'))
    return 'Research Vine science first.';
  if (
    parents.length !== 2 ||
    new Set(parents).size !== 2 ||
    parents.some((id) => !REGIONS[s.region].starters.includes(id))
  )
    return 'The introductory cross uses your two founding grapes.';
  if (trait !== 'climate' && trait !== 'resilience')
    return 'Choose regional adaptation or hardier vines for the introductory cross.';
  return null;
}

// This is also the player-facing preview. Only the inherited parent's color and
// soil are random, and those are rolled together when the trial is purchased.
export function breedingPreview(
  s: GameState,
  parents: string[],
  trait: string,
) {
  const [a, b] = parents.map(
    (id) => VARIETIES[id] ?? s.hybrids.find((h) => h.id === id)!,
  );
  const meanHeat = (a.heat + b.heat) / 2;
  const clamp = (n: number, low: number, high: number) =>
    Math.max(low, Math.min(high, n));
  return {
    heat:
      trait === 'climate'
        ? meanHeat +
          Math.sign(REGIONS[s.region].heat - meanHeat) *
            Math.min(1, Math.abs(REGIONS[s.region].heat - meanHeat))
        : meanHeat,
    resilience: clamp(
      Math.round((a.resilience + b.resilience) / 2) +
        (trait === 'resilience' ? 2 : trait === 'finesse' ? -1 : 0),
      0,
      7,
    ),
    finesse: clamp(
      Math.round((a.finesse + b.finesse) / 2) +
        (trait === 'finesse' ? 3 : trait === 'resilience' ? -1 : 0),
      -2,
      8,
    ),
    yieldFactor: clamp(
      Math.round(
        ((a.yieldFactor + b.yieldFactor) / 2 -
          (trait === 'finesse' ? 0.08 : trait === 'climate' ? 0.03 : 0)) *
          100,
      ) / 100,
      0.75,
      1.1,
    ),
    planting: Math.min(1400, Math.round((a.planting + b.planting) / 2) + 150),
  };
}
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
export const researchDuration = (weeks: number) =>
  `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;

// Paid studies from before the pacing update keep their original clock.
const previousStudyWeeks: Partial<Record<ResearchId, number>> = {
  tourism: 12,
  visitor_services: 22,
  hospitality: 32,
  heritage: 10,
  breeding: 24,
  selection: 40,
  backcrossing: 52,
  genomics: 72,
  assemblage: 14,
  rose_trials: 24,
};
export const studyDurationLimit = (id: ResearchId) =>
  Math.max(RESEARCH[id].weeks, previousStudyWeeks[id] ?? 0);
