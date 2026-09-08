import {
  RESEARCH,
  RESEARCH_IDS,
  RESEARCH_GOAL_IDS,
  VARIETIES,
  BREEDING,
} from './catalog';
import type { ResearchGoalId, ResearchId } from './catalog';
import type { GameState } from './game';
import {
  UPGRADES,
  UPGRADE_IDS,
  studyWeeks,
  upgradeActive,
} from './investments';
import type { Upgrade } from './investments';
import {
  activeStudies,
  researchComplete,
  researchTerms,
  INTRO_BREEDING,
} from './researchProgression';

export const RESEARCH_GOALS: Record<
  ResearchGoalId,
  { name: string; study: ResearchId; investment?: Upgrade }
> = {
  first_cross: { name: 'Create my first grape', study: 'ampelography' },
  tasting_room: {
    name: 'Open a tasting room',
    study: 'hospitality',
    investment: 'tastingRoom',
  },
  vintages: { name: 'Blend different vintages', study: 'vintage_blending' },
  fermentation: {
    name: 'Improve fermentation quality',
    study: 'cellar_control',
    investment: 'lab',
  },
  rare_grapes: { name: 'Explore rare grape studies', study: 'discovery' },
  fine_grapes: { name: 'Breed for wine quality', study: 'genomics' },
};
export { RESEARCH_GOAL_IDS };

export function investmentPath(
  id: Upgrade,
  result = new Set<Upgrade>(),
): Upgrade[] {
  const parent = UPGRADES[id].requires;
  if (parent) investmentPath(parent, result);
  result.add(id);
  return [...result];
}
export const studyInvestments = (id: ResearchId) =>
  UPGRADE_IDS.filter((u) => !UPGRADES[u].legacy && UPGRADES[u].research === id);

export function researchPath(targets: ResearchId[]): ResearchId[] {
  const path = new Set<ResearchId>();
  const visit = (id: ResearchId) => {
    if (path.has(id)) return;
    RESEARCH[id].requires.forEach(visit);
    path.add(id);
  };
  targets.forEach(visit);
  return [...path];
}

export function researchPlan(s: GameState, goalId: ResearchGoalId) {
  const goal = RESEARCH_GOALS[goalId];
  const investments = goal.investment ? investmentPath(goal.investment) : [];
  const firstCrossDone = goalId === 'first_cross' && s.hybrids.length > 0;
  const path = researchPath([
    goal.study,
    ...investments.flatMap((id) =>
      UPGRADES[id].research ? [UPGRADES[id].research!] : [],
    ),
  ]);
  const studies = activeStudies(s);
  const remaining = path.filter((id) => !researchComplete(s, id));
  const unpaid = remaining.filter((id) => !studies.some((p) => p.id === id));
  const missingInvestments = investments.filter(
    (id) => !s.upgrades.includes(id),
  );
  const weeks = (id: ResearchId) =>
    researchComplete(s, id)
      ? 0
      : studyWeeks(
          s,
          studies.find((p) => p.id === id)?.remaining ??
            researchTerms(s, id).weeks,
        );
  const longest = (id: ResearchId): number =>
    weeks(id) + Math.max(0, ...RESEARCH[id].requires.map(longest));
  const finesseDone =
    goalId === 'fine_grapes' && s.hybrids.some((h) => h.trait === 'finesse');
  const trialNeeded =
    (goalId === 'first_cross' && !firstCrossDone) ||
    (goalId === 'fine_grapes' && !finesseDone);
  const activeTrial =
    goalId === 'first_cross'
      ? s.breedingProject
      : goalId === 'fine_grapes' &&
          s.breedingProject?.result.trait === 'finesse'
        ? s.breedingProject
        : null;
  const trialTerms =
    goalId === 'first_cross'
      ? INTRO_BREEDING
      : { ...BREEDING, weeks: BREEDING.selectedWeeks };
  const trial = trialNeeded
    ? {
        cost: activeTrial ? 0 : trialTerms.cost,
        knowledge: activeTrial ? 0 : trialTerms.knowledge,
        weeks: studyWeeks(s, activeTrial?.remaining ?? trialTerms.weeks),
        running: Boolean(activeTrial),
      }
    : null;
  const researchCash = unpaid.reduce(
    (n, id) => n + researchTerms(s, id).cost,
    0,
  );
  const investmentCash = missingInvestments.reduce(
    (n, id) => n + UPGRADES[id].cost,
    0,
  );
  return {
    goal,
    path,
    investments,
    missingInvestments,
    remaining,
    researchCash,
    investmentCash,
    trial,
    cash: researchCash + investmentCash + (trial?.cost ?? 0),
    knowledge:
      unpaid.reduce((n, id) => n + researchTerms(s, id).knowledge, 0) +
      (trial?.knowledge ?? 0),
    sequentialWeeks: remaining.reduce((n, id) => n + weeks(id), 0),
    minimumWeeks: Math.max(0, ...path.map(longest)),
    operatingUpkeep: investments.reduce((n, id) => n + UPGRADES[id].upkeep, 0),
    ready:
      firstCrossDone ||
      finesseDone ||
      (!trialNeeded &&
        !remaining.length &&
        investments.every((id) => upgradeActive(s, id))),
  };
}

export type ResearchDestination = {
  view: 'estate' | 'cellar' | 'improvements' | 'research';
  label: string;
  study?: ResearchId;
  nursery?: boolean;
  library?: boolean;
  reserves?: boolean;
  investment?: Upgrade;
  grape?: string;
};
export function discoveryDestination(id: string): ResearchDestination {
  if (id.startsWith('cross-'))
    return { view: 'estate', label: 'Choose a parcel', grape: id };
  const study = RESEARCH[id as ResearchId];
  if (study?.grape && VARIETIES[study.grape])
    return { view: 'estate', label: 'Choose a parcel', grape: study.grape };
  const investment = studyInvestments(id as ResearchId)[0];
  if (investment)
    return {
      view: 'improvements',
      label: `View ${UPGRADES[investment].name}`,
      investment,
    };
  if (['heritage', 'discovery'].includes(id))
    return { view: 'research', label: 'Explore grape library', library: true };
  if (id === 'sensory_science')
    return {
      view: 'research',
      label: 'View Sommelier training',
      study: 'sommelier_training',
    };
  if (
    [
      'ampelography',
      'breeding',
      'selection',
      'backcrossing',
      'genomics',
    ].includes(id)
  )
    return { view: 'research', label: 'Open breeding nursery', nursery: true };
  if (
    [
      'oenology',
      'assemblage',
      'vintage_blending',
      'regional_blending',
      'rose_trials',
    ].includes(id)
  )
    return {
      view: 'cellar',
      label: 'Open reserves & blending',
      reserves: true,
    };
  if (['skin_contact', 'malolactic', 'lees_aging'].includes(id))
    return { view: 'cellar', label: 'Plan a new batch' };
  return {
    view: 'research',
    label: 'Explore next studies',
    study:
      RESEARCH_IDS.find((next) =>
        RESEARCH[next].requires.includes(id as ResearchId),
      ) ?? (id as ResearchId),
  };
}

export function goalDestination(id: ResearchGoalId): ResearchDestination {
  if (id === 'first_cross' || id === 'fine_grapes')
    return { view: 'research', label: 'Open breeding nursery', nursery: true };
  return discoveryDestination(RESEARCH_GOALS[id].study);
}
