import { ArrowRight, Bookmark, X, ArrowUp, ArrowDown } from 'lucide-react';
import { RESEARCH, RESEARCH_GOAL_IDS } from './catalog';
import type { ResearchId, ResearchGoalId } from './catalog';
import type { GameState } from './game';
import { money, researchBlocked, plantingCost } from './game';
import type { Dispatch } from './Panels';
import {
  RESEARCH_GOALS,
  researchPlan,
  goalDestination,
  studyInvestments,
  investmentPath,
} from './researchPlanning';
import type { ResearchDestination } from './researchPlanning';
import {
  activeStudies,
  researchComplete,
  researchTerms,
} from './researchProgression';
import {
  UPGRADES,
  upgradeActive,
  studyWeeks,
  operatingCost,
} from './investments';

export type ResearchNavigation = {
  onFocus: (id: ResearchId) => void;
  onDestination: (destination: ResearchDestination) => void;
};

export function OutcomePlanner({
  state,
  dispatch,
  onFocus,
  onDestination,
}: { state: GameState; dispatch: Dispatch } & ResearchNavigation) {
  const selected = state.researchGoal;
  const plan = selected ? researchPlan(state, selected) : null;
  return (
    <details className="research-planner">
      <summary>
        Plan toward an outcome
        {selected && <span> · {RESEARCH_GOALS[selected].name}</span>}
      </summary>
      <div className="research-plan-body">
        <label>
          What would you like to do?
          <select
            aria-label="Research outcome"
            value={selected ?? ''}
            onChange={(e) =>
              dispatch({
                type: 'planResearch',
                goal: (e.target.value || null) as ResearchGoalId | null,
              })
            }
          >
            <option value="">Choose an outcome…</option>
            {RESEARCH_GOAL_IDS.map((id) => (
              <option key={id} value={id}>
                {RESEARCH_GOALS[id].name}
              </option>
            ))}
          </select>
        </label>
        {plan && (
          <>
            <dl className="research-plan-totals">
              <div>
                <dt>Remaining upfront cost</dt>
                <dd>{money(plan.cash)}</dd>
                <small>
                  {money(plan.researchCash)} research ·{' '}
                  {money(plan.investmentCash)} purchases
                  {plan.trial ? ` · ${money(plan.trial.cost)} trial` : ''}
                </small>
              </div>
              <div>
                <dt>Knowledge still to spend</dt>
                <dd>{plan.knowledge}</dd>
                <small>Active studies are already paid.</small>
              </div>
              <div>
                <dt>Research time at current lab speed</dt>
                <dd>{plan.sequentialWeeks} weeks</dd>
                <small>
                  Studied one at a time. {plan.minimumWeeks} weeks along the
                  longest prerequisite path with enough free slots.
                  {plan.trial
                    ? ` Then ${plan.trial.weeks} trial weeks${plan.trial.running ? ' (already underway)' : ''}.`
                    : ''}
                </small>
              </div>
            </dl>
            <p className="fine-print">
              Time excludes earning funds or knowledge, unrelated studies or
              nursery trials, and pauses. Future lab purchases and optional
              experiment bonuses are not assumed.{' '}
              {plan.operatingUpkeep > 0 &&
                `These facilities cost ${money(plan.operatingUpkeep)}/week together while operating; estate upkeep is additional.`}
            </p>
            <ol className="research-path">
              {plan.path.map((id) => {
                const r = researchTerms(state, id),
                  active = activeStudies(state).find((p) => p.id === id),
                  done = researchComplete(state, id);
                return (
                  <li key={id}>
                    <button className="text-button" onClick={() => onFocus(id)}>
                      {r.name} <ArrowRight size={13} />
                    </button>
                    <span>
                      {done
                        ? 'Learned'
                        : active
                          ? `${active.paused ? 'Paused' : 'Studying'} · ${studyWeeks(state, active.remaining)} weeks left`
                          : `${money(r.cost)} · ${r.knowledge} knowledge · ${studyWeeks(state, r.weeks)} weeks`}
                    </span>
                  </li>
                );
              })}
              {plan.investments.map((id) => (
                <li key={id}>
                  <button
                    className="text-button"
                    onClick={() =>
                      onDestination({
                        view: 'improvements',
                        investment: id,
                        label: `View ${UPGRADES[id].name}`,
                      })
                    }
                  >
                    {UPGRADES[id].name} <ArrowRight size={13} />
                  </button>
                  <span>
                    {upgradeActive(state, id)
                      ? 'Operating'
                      : state.upgrades.includes(id)
                        ? 'Owned · needs to resume'
                        : money(UPGRADES[id].cost)}{' '}
                    · {money(operatingCost(state, id))}/week
                  </span>
                </li>
              ))}
            </ol>
            {plan.ready && <p>Ready to use.</p>}
            <button
              className="button secondary"
              onClick={() => onDestination(goalDestination(selected!))}
            >
              {goalDestination(selected!).label} <ArrowRight size={14} />
            </button>
          </>
        )}
      </div>
    </details>
  );
}

export function ShortlistButton({
  state,
  dispatch,
  id,
}: {
  state: GameState;
  dispatch: Dispatch;
  id: ResearchId;
}) {
  if (
    researchComplete(state, id) ||
    activeStudies(state).some((p) => p.id === id)
  )
    return null;
  const saved = state.researchShortlist.includes(id);
  return (
    <button
      className="text-button"
      disabled={!saved && state.researchShortlist.length >= 5}
      aria-label={`${saved ? 'Remove' : 'Save'} ${RESEARCH[id].name} ${saved ? 'from' : 'to'} shortlist`}
      onClick={() => dispatch({ type: 'shortlistResearch', id, add: !saved })}
    >
      <Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />
      {saved
        ? 'Saved for later'
        : state.researchShortlist.length >= 5
          ? 'Shortlist full (5)'
          : 'Study next'}
    </button>
  );
}

export function StudyShortlist({
  state,
  dispatch,
  onFocus,
}: {
  state: GameState;
  dispatch: Dispatch;
  onFocus: (id: ResearchId) => void;
}) {
  if (!state.researchShortlist.length) return null;
  return (
    <details className="research-shortlist" open>
      <summary>Study next · {state.researchShortlist.length} / 5</summary>
      <p>
        Saved plans only. Each study starts and charges its price when you
        choose Start study.
      </p>
      <ol>
        {state.researchShortlist.map((id, index) => {
          const reason = researchBlocked(state, id),
            r = researchTerms(state, id);
          return (
            <li key={id}>
              <div>
                <button className="text-button" onClick={() => onFocus(id)}>
                  {r.name} <ArrowRight size={13} />
                </button>
                <small>
                  {money(r.cost)} · {r.knowledge} knowledge ·{' '}
                  {studyWeeks(state, r.weeks)} weeks
                  {reason ? ` · ${reason}` : ''}
                </small>
              </div>
              <div className="shortlist-actions">
                <button
                  className="button secondary"
                  disabled={Boolean(reason)}
                  onClick={() => dispatch({ type: 'research', id })}
                  aria-label={`Start shortlisted ${r.name}`}
                >
                  Start study
                </button>
                <button
                  className="icon-button"
                  aria-label={`Move ${r.name} earlier`}
                  disabled={index === 0}
                  onClick={() =>
                    dispatch({ type: 'moveShortlist', id, direction: -1 })
                  }
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  className="icon-button"
                  aria-label={`Move ${r.name} later`}
                  disabled={index === state.researchShortlist.length - 1}
                  onClick={() =>
                    dispatch({ type: 'moveShortlist', id, direction: 1 })
                  }
                >
                  <ArrowDown size={15} />
                </button>
                <button
                  className="icon-button"
                  aria-label={`Remove ${r.name} from shortlist`}
                  onClick={() =>
                    dispatch({ type: 'shortlistResearch', id, add: false })
                  }
                >
                  <X size={15} />
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </details>
  );
}

export function StudyPayoff({
  state,
  id,
  onDestination,
}: {
  state: GameState;
  id: ResearchId;
  onDestination: ResearchNavigation['onDestination'];
}) {
  const investments = studyInvestments(id),
    grape = RESEARCH[id].grape;
  if (grape)
    return (
      <p className="study-payoff">
        Unlocks this grape for planting and, after Cross-pollination, breeding.
        Planting from {money(plantingCost(state, grape))} per unexpanded parcel
        in your home region.
      </p>
    );
  if (!investments.length)
    return (
      <small className="study-effect">
        {[
          'ampelography',
          'adaptation',
          'selection',
          'field_notebooks',
        ].includes(id)
          ? 'Estate benefit applies on completion.'
          : 'Unlocks a new choice or further study; no automatic building purchase.'}
      </small>
    );
  return (
    <div className="study-payoff">
      {investments.map((u) => {
        const upgrade = UPGRADES[u],
          chain = investmentPath(u).filter((p) => p !== u);
        return (
          <div key={u}>
            <strong>After discovery: {upgrade.name}</strong>
            <p>{upgrade.text}</p>
            <span>
              {state.upgrades.includes(u)
                ? 'Already owned'
                : `${money(upgrade.cost)} to ${upgrade.kind === 'team' ? 'hire' : 'build'}`}{' '}
              · {money(operatingCost(state, u))}/week operating
            </span>
            {chain.length > 0 && (
              <small>
                Also needs{' '}
                {chain
                  .map(
                    (p) =>
                      `${UPGRADES[p].name} (${state.upgrades.includes(p) ? 'owned' : money(UPGRADES[p].cost)}; ${money(operatingCost(state, p))}/week)`,
                  )
                  .join(', ')}{' '}
                operating. Their research is separate.
              </small>
            )}
            <button
              className="text-button"
              onClick={() =>
                onDestination({
                  view: 'improvements',
                  investment: u,
                  label: `View ${upgrade.name}`,
                })
              }
            >
              View investment <ArrowRight size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
