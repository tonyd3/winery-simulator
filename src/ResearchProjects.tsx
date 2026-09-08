import { useState } from 'react';
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
import { studyWeeks } from './investments';
import './research.css';
import { matchesSearch } from './search';

export function StudyAction({
  state,
  dispatch,
  id,
}: {
  state: GameState;
  dispatch: Dispatch;
  id: ResearchId;
}) {
  const r = researchTerms(state, id);
  const done = researchComplete(state, id);
  const running = activeStudies(state).find((p) => p.id === id);
  const reason = researchBlocked(state, id);
  return (
    <div className="study-purchase">
      <strong>{done ? 'Learned' : money(r.cost)}</strong>
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
        disabled={Boolean(reason)}
        aria-label={`${done ? 'Completed' : running ? 'Studying' : 'Research'} ${r.name}`}
        onClick={() => dispatch({ type: 'research', id })}
      >
        {done ? (
          <>
            <Check size={15} /> Completed
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
      {!done && !running && reason && <small>{reason}</small>}
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
          <p>
            Studies run in parallel. Cash and knowledge are paid upfront. Paused
            studies keep their slots; nursery trials run separately.
          </p>
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
                : `One-time cost · No weekly upkeep · Up to ${STUDY_SLOTS.max} slots`}
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
            {state.upgrades.includes('researchLab')
              ? ' at current lab speed'
              : ''}
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
}: {
  state: GameState;
  dispatch: Dispatch;
  focusId?: ResearchId;
}) {
  const [department, setDepartment] = useState<ResearchDepartment>(
    focusId ? RESEARCH[focusId].department : 'vineyard',
  );
  const [query, setQuery] = useState(focusId ? RESEARCH[focusId].name : '');
  const [status, setStatus] = useState('all');
  const completed = RESEARCH_IDS.filter((id) =>
    researchComplete(state, id),
  ).length;
  const rows = RESEARCH_IDS.filter((id) => {
    const r = RESEARCH[id],
      done = researchComplete(state, id);
    const matches = query.trim()
      ? matchesSearch(
          `${r.name} ${r.text} ${r.requires.map((p) => RESEARCH[p].name).join(' ')}`,
          query,
        )
      : r.department === department;
    return (
      matches &&
      (status === 'all' ||
        (status === 'learned'
          ? done
          : status === 'ready'
            ? !researchBlocked(state, id)
            : !done))
    );
  });
  return (
    <section aria-label="Research projects">
      <div className="research-section-heading">
        <div>
          <span className="eyebrow">
            THE WINEMAKER’S NOTEBOOK · {RESEARCH_IDS.length} DISCOVERIES
          </span>
          <h2>Build your body of knowledge.</h2>
        </div>
        <span>
          {completed} / {RESEARCH_IDS.length} learned, including known grapes
        </span>
      </div>
      <p className="research-principles">
        A discovery unlocks the right to invest; buildings, staff and planting
        are paid separately. A game year lasts 12 weeks. Choose a direction your
        estate can afford to pursue.
      </p>
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
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a technique, grape or unlock…"
          />
        </label>
        <label>
          Show{' '}
          <select
            aria-label="Research availability"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All studies</option>
            <option value="ready">Affordable now</option>
            <option value="unlearned">Not learned</option>
            <option value="learned">Learned</option>
          </select>
        </label>
      </div>
      <div className="research-ledger">
        {rows.map((id) => {
          const r = RESEARCH[id],
            done = researchComplete(state, id);
          return (
            <article
              className={`research-row ${done ? 'learned' : ''}`}
              key={id}
              aria-label={r.name}
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
                            setQuery(RESEARCH[p].name);
                            setStatus('all');
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
              </div>
              <StudyAction state={state} dispatch={dispatch} id={id} />
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
