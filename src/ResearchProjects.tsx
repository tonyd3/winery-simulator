import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  FlaskConical,
  Search,
  Pause,
  Play,
  Plus,
} from 'lucide-react';
import { Modal, Progress } from './components';
import { money, researchBlocked } from './game';
import type { GameState } from './game';
import type { Dispatch } from './Panels';
import { RESEARCH, RESEARCH_IDS, RESEARCH_DEPARTMENTS } from './catalog';
import type { ResearchDepartment, ResearchId } from './catalog';
import {
  researchComplete,
  researchTerms,
  researchDuration,
  activeStudies,
  studySlotCount,
  studySlotCost,
  STUDY_SLOTS,
} from './researchProgression';
import { studyWeeks, upgradeActive } from './investments';
import './research.css';
import { matchesSearch } from './search';
import { ShortlistButton, StudyPayoff } from './ResearchDecisions';
import type { ResearchNavigation } from './ResearchDecisions';
import { discoveryDestination } from './researchPlanning';
import { ResearchExperiment } from './ResearchExperiments';

export function StudyAction({
  state,
  dispatch,
  id,
  onFocus,
  onDestination,
}: {
  state: GameState;
  dispatch: Dispatch;
  id: ResearchId;
} & Partial<ResearchNavigation>) {
  const r = researchTerms(state, id);
  const done = researchComplete(state, id);
  const running = activeStudies(state).find((p) => p.id === id);
  const reason = researchBlocked(state, id);
  return (
    <div className="study-purchase">
      <strong>
        {done ? 'Learned' : running ? 'Paid' : money(r.cost)}
      </strong>
      {!done && (
        <>
          <span>
            {r.knowledge} knowledge ·{' '}
            {researchDuration(studyWeeks(state, r.weeks))}
          </span>
          {r.local && (
            <small>Home-region study: 20% less cash, 2 fewer study weeks</small>
          )}
        </>
      )}
      <button
        className={`button ${done ? 'secondary' : 'primary'}`}
        disabled={done ? !onDestination : Boolean(reason)}
        aria-label={`${done ? 'Use discovery from' : running ? 'Studying' : 'Research'} ${r.name}`}
        onClick={() =>
          done
            ? onDestination?.(discoveryDestination(id))
            : dispatch({ type: 'research', id })
        }
      >
        {done ? (
          <>
            <Check size={15} /> Use discovery
          </>
        ) : running ? (
          running.paused ? (
            'Paused'
          ) : (
            'In progress'
          )
        ) : (
          <>
            Start study <ArrowRight size={15} />
          </>
        )}
      </button>
      {!done && !running && reason && (
        <small>
          {reason.startsWith('Requires ') && onFocus ? (
            <button
              className="text-button"
              onClick={() =>
                onFocus(r.requires.find((p) => !researchComplete(state, p))!)
              }
            >
              {reason} <ArrowRight size={12} />
            </button>
          ) : (
            reason
          )}
        </small>
      )}
      <ShortlistButton state={state} dispatch={dispatch} id={id} />
    </div>
  );
}

export function CurrentStudies({
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: Dispatch;
}) {
  const studies = activeStudies(state);
  const slots = studySlotCount(state);
  const cost = studySlotCost(state);
  const atLimit = slots >= STUDY_SLOTS.max;
  return (
    <section className="current-research" aria-label="Current research">
      <div className="study-capacity">
        <div>
          <h3>
            {studies.length} / {slots} study slots occupied
          </h3>
          <details className="study-help">
            <summary>How studies work</summary>
            <p>
              Cash and knowledge are paid upfront. Studies run in parallel;
              paused studies keep their slots. Nursery trials run separately.
              Abandoning loses progress with no refund. Additional study slots
              become progressively more expensive.
            </p>
          </details>
        </div>
        <div className="study-slot-purchase">
          <button
            className="button secondary"
            disabled={atLimit || state.cash < cost}
            onClick={() => dispatch({ type: 'buyStudySlot' })}
          >
            <Plus size={15} />
            {atLimit
              ? 'All study slots added'
              : `Add study slot · ${money(cost)}`}
          </button>
          <small>
            {atLimit
              ? `Maximum of ${STUDY_SLOTS.max} study slots`
              : state.cash < cost
                ? `Need ${money(cost - state.cash)} more · No weekly upkeep`
                : `No weekly upkeep · Up to ${STUDY_SLOTS.max} slots`}
          </small>
        </div>
      </div>
      {studies.length > 0 && (
        <div className="study-list">
          {studies.map((active) => (
            <ActiveStudy
              key={active.id}
              state={state}
              dispatch={dispatch}
              active={active}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ActiveStudy({
  state,
  dispatch,
  active,
}: {
  state: GameState;
  dispatch: Dispatch;
  active: NonNullable<GameState['researchProject']>;
}) {
  const [abandon, setAbandon] = useState(false);
  const weeks = studyWeeks(state, active.remaining);
  return (
    <>
      <section
        className="active-study current-study"
        aria-label={`${RESEARCH[active.id].name} study`}
      >
        <FlaskConical size={26} />
        <div>
          <b>{RESEARCH[active.id].name}</b>
          <span>
            {active.paused ? 'Paused · ' : ''}
            {researchDuration(weeks)} remaining
            {upgradeActive(state, 'researchLab') ? ' at current lab speed' : ''}
          </span>
          <Progress
            value={
              (1 -
                active.remaining /
                  (active.duration ?? RESEARCH[active.id].weeks)) *
              100
            }
          />
          {active.legacyGrapes?.length ? (
            <small>
              Existing collection study: its original grape unlocks are
              preserved.
            </small>
          ) : null}
          <ResearchExperiment
            state={state}
            dispatch={dispatch}
            id={active.id}
          />
        </div>
        <div className="study-controls">
          <button
            className="button secondary"
            aria-label={`${active.paused ? 'Resume' : 'Pause'} ${RESEARCH[active.id].name}`}
            onClick={() =>
              dispatch({
                type: 'pauseResearch',
                id: active.id,
                paused: !active.paused,
              })
            }
          >
            {active.paused ? <Play size={14} /> : <Pause size={14} />}{' '}
            {active.paused ? 'Resume study' : 'Pause study'}
          </button>
          <button
            className="text-button"
            aria-label={`Abandon ${RESEARCH[active.id].name}`}
            onClick={() => setAbandon(true)}
          >
            Abandon study
          </button>
        </div>
      </section>
      {abandon && (
        <Modal title="Abandon this study?" onClose={() => setAbandon(false)}>
          <p>
            All progress on {RESEARCH[active.id].name} will be lost. Cash and
            knowledge are not refunded. Starting it again requires the full
            price and duration.
          </p>
          <div className="study-controls">
            <button
              className="button secondary"
              onClick={() => setAbandon(false)}
            >
              Keep studying
            </button>
            <button
              className="button primary"
              onClick={() => {
                if (dispatch({ type: 'abandonResearch', id: active.id }))
                  setAbandon(false);
              }}
            >
              Abandon without refund
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

export function ResearchProjects({
  state,
  dispatch,
  focusId,
  onFocus,
  onDestination,
}: {
  state: GameState;
  dispatch: Dispatch;
  focusId?: ResearchId;
} & ResearchNavigation) {
  const [selectedId, setSelectedId] = useState(focusId);
  const focusedRow = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (selectedId) focusedRow.current?.focus({ preventScroll: true });
  }, [selectedId]);
  const [department, setDepartment] = useState<ResearchDepartment>(
    focusId ? RESEARCH[focusId].department : 'vineyard',
  );
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const rows = RESEARCH_IDS.filter((id) => {
    const r = RESEARCH[id],
      done = researchComplete(state, id);
    const matches = selectedId
      ? id === selectedId
      : query.trim()
        ? matchesSearch(
            `${r.name} ${r.text} ${r.requires.map((p) => RESEARCH[p].name).join(' ')}`,
            query,
          )
        : r.department === department;
    return (
      matches &&
      (selectedId ||
        status === 'all' ||
        (status === 'learned'
          ? done
          : status === 'ready'
            ? !researchBlocked(state, id)
            : !done))
    );
  });
  return (
    <section aria-label="Research projects">
      <nav className="research-branches" aria-label="Research branches">
        {Object.entries(RESEARCH_DEPARTMENTS).map(([id, label]) => {
          const ids = RESEARCH_IDS.filter((r) => RESEARCH[r].department === id);
          return (
            <button
              key={id}
              className={department === id && !query ? 'active' : ''}
              aria-pressed={department === id && !query}
              onClick={() => {
                setDepartment(id as ResearchDepartment);
                setQuery('');
                setSelectedId(undefined);
              }}
            >
              {label}
              <small>
                {ids.filter((r) => researchComplete(state, r)).length} /{' '}
                {ids.length}
              </small>
            </button>
          );
        })}
      </nav>
      <div className="research-tools">
        <label className="grape-search">
          <Search size={17} />
          <input
            aria-label="Search all research"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedId(undefined);
            }}
            placeholder="Find a technique, grape or unlock…"
          />
        </label>
        <label>
          Show{' '}
          <select
            aria-label="Research availability"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setSelectedId(undefined);
            }}
          >
            <option value="all">All studies</option>
            <option value="ready">Can start now</option>
            <option value="unlearned">Not learned</option>
            <option value="learned">Learned</option>
          </select>
        </label>
      </div>
      {selectedId && (
        <div className="research-focus">
          <span>Viewing one study</span>
          <button
            className="text-button"
            onClick={() => {
              setSelectedId(undefined);
              setQuery('');
              setStatus('all');
            }}
          >
            Back to {RESEARCH_DEPARTMENTS[department]}
          </button>
        </div>
      )}
      <div className="research-ledger">
        {rows.map((id) => {
          const r = RESEARCH[id],
            done = researchComplete(state, id);
          return (
            <article
              className={`research-row ${done ? 'learned' : ''}`}
              key={id}
              aria-label={r.name}
              ref={id === selectedId ? focusedRow : undefined}
              tabIndex={id === selectedId ? -1 : undefined}
            >
              <div className="study-description">
                <span className="eyebrow">
                  {RESEARCH_DEPARTMENTS[r.department]}
                </span>
                <h3>{r.name}</h3>
                <p>{r.text}</p>
                <div className="study-prerequisites">
                  {r.requires.length ? (
                    <>
                      <span>Requires</span>
                      {r.requires.map((p) => (
                        <button
                          className={`text-button ${researchComplete(state, p) ? 'learned' : ''}`}
                          key={p}
                          onClick={() => {
                            onFocus(p);
                          }}
                        >
                          {researchComplete(state, p) && <Check size={12} />}{' '}
                          {RESEARCH[p].name} <ArrowRight size={12} />
                        </button>
                      ))}
                    </>
                  ) : (
                    <span>Foundation · no prior study</span>
                  )}
                </div>
                <StudyPayoff
                  state={state}
                  id={id}
                  onDestination={onDestination}
                />
                {!activeStudies(state).some((p) => p.id === id) && !done && (
                  <ResearchExperiment
                    state={state}
                    dispatch={dispatch}
                    id={id}
                  />
                )}
              </div>
              <StudyAction
                state={state}
                dispatch={dispatch}
                id={id}
                onDestination={onDestination}
              />
            </article>
          );
        })}
      </div>
      {!rows.length && (
        <p className="study-slot">
          No studies match these filters. Try all studies or another branch.
        </p>
      )}
    </section>
  );
}
