import type { ResearchId } from './catalog';
import { matchesSearch } from './search';
import {
  ResearchProjects,
  CurrentStudy,
  StudyAction,
} from './ResearchProjects';
import { BREEDING, grapeResearchId } from './catalog';
import { breedingWeeks, breedingPermission } from './researchProgression';
import { studyWeeks } from './investments';
import { useState } from 'react';
import {
  ArrowRight,
  FlaskConical,
  GitBranch,
  LockKeyhole,
  Search,
  Sprout,
} from 'lucide-react';
import { Icon, Progress } from './components';
import {
  REGIONS,
  TRAITS,
  VARIETIES,
  availableVarieties,
  getVariety,
  money,
  plantingCost,
  suitability,
  weeklyKnowledge,
} from './game';
import type { GameState, BreedingTrait } from './game';
import type { Dispatch, View } from './Panels';

export default function Research({
  state,
  dispatch,
  navigate,
  focusId,
}: {
  state: GameState;
  dispatch: Dispatch;
  navigate: (v: View) => void;
  focusId?: ResearchId;
}) {
  const [tab, setTab] = useState<'projects' | 'library' | 'nursery'>(
    'projects',
  );
  const [query, setQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const options = availableVarieties(state);
  const [chosenA, setParentA] = useState(options[0][0]);
  const [chosenB, setParentB] = useState(options[1][0]);
  const [trait, setTrait] = useState<BreedingTrait>('climate');
  const [name, setName] = useState('');
  const unlocked = new Set(options.map(([id]) => id));
  const parentA = unlocked.has(chosenA) ? chosenA : options[0][0];
  const parentB = unlocked.has(chosenB) ? chosenB : options[1][0];
  const trial = state.breedingProject;
  const all = [
    ...Object.entries(VARIETIES),
    ...state.hybrids.map((h) => [h.id, h] as const),
  ];
  const breedingReason = breedingPermission(state, [parentA, parentB], trait)
    ? breedingPermission(state, [parentA, parentB], trait)
    : trial
      ? 'A trial is already in progress.'
      : state.hybrids.length >= 60
        ? 'Your collection has reached 60 custom grapes.'
        : state.knowledge < BREEDING.knowledge
          ? `You need ${BREEDING.knowledge} knowledge for a trial.`
          : state.cash < BREEDING.cost
            ? `You need ${money(BREEDING.cost)} for a trial.`
            : parentA === parentB
              ? 'Choose two different parents.'
              : !name.trim()
                ? 'Give your new grape a name.'
                : null;
  return (
    <div className="research-page">
      <div className="research-overview">
        <div className="knowledge-total">
          <FlaskConical size={27} />
          <div>
            <strong data-testid="knowledge">{state.knowledge}</strong>
            <span>KNOWLEDGE</span>
          </div>
        </div>
        <p>
          +{weeklyKnowledge(state)} each week · +12 per harvest · +1 per 40
          bottles produced
          <br />
          <span>
            Study your vines. Explore new grapes. Grow something of your own.
          </span>
        </p>
        <div className="research-count">
          <b>{options.length}</b>
          <span>plantable varieties</span>
        </div>
      </div>
      <div
        className="research-tabs"
        role="tablist"
        aria-label="Research departments"
      >
        {(
          [
            ['projects', 'Research'],
            ['library', 'Grape library'],
            ['nursery', 'Breeding nursery'],
          ] as const
        ).map(([id, label]) => (
          <button
            role="tab"
            key={id}
            aria-selected={tab === id}
            onClick={() => setTab(id)}
          >
            {label}
            {id === 'nursery' && state.hybrids.length > 0 && (
              <small>{state.hybrids.length}</small>
            )}
          </button>
        ))}
      </div>
      <CurrentStudy state={state} dispatch={dispatch} />
      {tab === 'projects' && (
        <ResearchProjects state={state} dispatch={dispatch} focusId={focusId} />
      )}
      {tab === 'library' && (
        <section aria-label="Grape library">
          <div className="research-section-heading">
            <div>
              <span className="eyebrow">
                {Object.keys(VARIETIES).length} VARIETIES. YOUR OWN
                POSSIBILITIES.
              </span>
              <h2>A world of grapes.</h2>
            </div>
            <span>Fit for {REGIONS[state.region].name}</span>
          </div>
          <div className="library-toolbar">
            <label className="grape-search">
              <Search size={17} />
              <input
                aria-label="Search grape varieties"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a grape or parent…"
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
              />{' '}
              Plantable only
            </label>
          </div>
          <div className="grape-library">
            {all
              .filter(
                ([id, v]) =>
                  (!onlyAvailable || unlocked.has(id)) &&
                  matchesSearch(
                    `${v.name} ${
                      state.hybrids
                        .find((h) => h.id === id)
                        ?.parents.map((p) => getVariety(state, p).name)
                        .join(' ') || ''
                    }`,
                    query,
                  ),
              )
              .map(([id, v]) => {
                const fit = suitability(state, id),
                  hybrid = state.hybrids.find((h) => h.id === id);
                return (
                  <article
                    key={id}
                    className={`library-grape ${!unlocked.has(id) ? 'locked' : ''}`}
                  >
                    <div
                      className="varietal-dot"
                      style={{ background: v.color }}
                    >
                      <Icon name="grape" size={20} />
                    </div>
                    <div className="library-grape-name">
                      <h3>{v.name}</h3>
                      <p>
                        {hybrid
                          ? hybrid.parents
                              .map((p) => getVariety(state, p).name)
                              .join(' × ')
                          : `${v.wineType} · ${v.preferred} soil`}
                      </p>
                      <small>{v.note}</small>
                    </div>
                    <div className="library-fit">
                      <span
                        className={`fit-label fit-${fit.label.toLowerCase()}`}
                      >
                        {fit.label} climate fit
                      </span>
                      <small>
                        {fit.regional
                          ? 'Regional favorite'
                          : hybrid
                            ? 'Estate crossing'
                            : `Warmth ${v.heat}/5 · Resilience ${v.resilience}/7`}
                      </small>
                    </div>
                    <div className="library-availability">
                      {unlocked.has(id) ? (
                        <>
                          <b>{money(plantingCost(state, id))}</b>
                          <span>Ready to plant</span>
                        </>
                      ) : (
                        <>
                          <StudyAction
                            state={state}
                            dispatch={dispatch}
                            id={grapeResearchId(id)}
                          />
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
          </div>
          <p className="fine-print">
            Warmth: 1 = cool, 5 = hot. Fit changes growth and harvest quality.
            Matching soil adds 8 quality; regional favorites get another 3.
          </p>
          <button
            className="button secondary"
            onClick={() => navigate('estate')}
          >
            <Sprout size={16} />
            Go to vineyard
            <ArrowRight size={16} />
          </button>
        </section>
      )}
      {tab === 'nursery' && (
        <section aria-label="Breeding nursery">
          <div className="research-section-heading">
            <div>
              <span className="eyebrow">TWO PARENTS. A NEW POSSIBILITY.</span>
              <h2>Your estate’s next grape.</h2>
            </div>
            <GitBranch size={30} />
          </div>
          {!state.research.includes('breeding') ? (
            <div className="nursery-locked">
              <LockKeyhole size={28} />
              <h3>Open your breeding nursery</h3>
              <p>
                Complete Vine science, Nursery propagation, then
                Cross-pollination. Research and breeding can run alongside your
                winery.
              </p>
              <button
                className="button primary"
                onClick={() => setTab('projects')}
              >
                Explore research
                <ArrowRight size={16} />
              </button>
            </div>
          ) : trial ? (
            <div className="nursery-trial">
              <span className="eyebrow">NURSERY TRIAL IN PROGRESS</span>
              <h3>{trial.result.name}</h3>
              <p>
                {trial.result.parents
                  .map((p) => getVariety(state, p).name)
                  .join(' × ')}{' '}
                · {TRAITS[trial.result.trait].name}
              </p>
              <Progress value={(1 - trial.remaining / trial.duration) * 100} />
              <b>
                {studyWeeks(state, trial.remaining)}{' '}
                {studyWeeks(state, trial.remaining) === 1 ? 'week' : 'weeks'}{' '}
                until ready to plant
              </b>
              <p>
                The cross has been made. Your team is testing the seedlings.
              </p>
            </div>
          ) : (
            <form
              className="breeding-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  dispatch({
                    type: 'breed',
                    parents: [parentA, parentB],
                    trait,
                    name,
                  })
                )
                  setName('');
              }}
            >
              <div className="parent-pair">
                {[
                  { label: 'First parent', value: parentA, set: setParentA },
                  { label: 'Second parent', value: parentB, set: setParentB },
                ].map(({ label, value, set }) => (
                  <div className="parent-picker" key={label}>
                    <label>
                      {label}
                      <select
                        value={value}
                        onChange={(e) => set(e.target.value)}
                      >
                        {options.map(([id, v]) => (
                          <option value={id} key={id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p>
                      {getVariety(state, value).wineType} ·{' '}
                      {getVariety(state, value).preferred}
                    </p>
                    <span>
                      Warmth {getVariety(state, value).heat}/5 · Resilience{' '}
                      {getVariety(state, value).resilience}/7 · Finesse{' '}
                      {getVariety(state, value).finesse}
                    </span>
                  </div>
                ))}
              </div>
              <fieldset className="trait-options">
                <legend>Select for a trait</legend>
                {(
                  Object.entries(TRAITS) as [
                    BreedingTrait,
                    (typeof TRAITS)[BreedingTrait],
                  ][]
                ).map(([id, t]) => (
                  <label className={trait === id ? 'selected' : ''} key={id}>
                    <input
                      type="radio"
                      name="trait"
                      value={id}
                      disabled={
                        id === 'finesse' && !state.research.includes('genomics')
                      }
                      checked={trait === id}
                      onChange={() => setTrait(id)}
                    />
                    <span>
                      <b>{t.name}</b>
                      <small>
                        {t.text}
                        {id === 'finesse' &&
                        !state.research.includes('genomics')
                          ? ' Requires Aroma & finesse selection.'
                          : ''}
                      </small>
                    </span>
                  </label>
                ))}
              </fieldset>
              <div className="breeding-submit">
                <label>
                  Name the new variety
                  <input
                    value={name}
                    maxLength={28}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bellevue No. 1"
                    required
                  />
                </label>
                <div>
                  <span>
                    {BREEDING.knowledge} knowledge · {money(BREEDING.cost)} ·{' '}
                    {studyWeeks(state, breedingWeeks(state))} weeks
                  </span>
                  <button
                    className="button primary"
                    disabled={Boolean(breedingReason)}
                    type="submit"
                  >
                    <GitBranch size={16} />
                    Start breeding trial
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
              {breedingReason && <p className="fine-print">{breedingReason}</p>}
            </form>
          )}
          <p className="breeding-note">
            A playful model of grape breeding: years of crossing and field
            trials are compressed into weeks. Traits are fictional game values.
            Offspring inherit a parent’s soil preference and wine color; you can
            cross your estate grapes again after researching Generational
            crosses.
          </p>
          {state.hybrids.length > 0 && (
            <div className="estate-crossings">
              <h3>
                Your estate varieties <span>{state.hybrids.length}</span>
              </h3>
              {[...state.hybrids].reverse().map((h) => (
                <article key={h.id}>
                  <GitBranch size={24} />
                  <div>
                    <h4>{h.name}</h4>
                    <p>
                      {h.parents
                        .map((p) => getVariety(state, p).name)
                        .join(' × ')}
                    </p>
                    <small>
                      {TRAITS[h.trait].name} · Warmth {h.heat}/5 · Resilience{' '}
                      {h.resilience}/7 · Finesse {h.finesse} · Yield{' '}
                      {Math.round(h.yieldFactor * 100)}%
                    </small>
                  </div>
                  <button
                    className="button secondary"
                    onClick={() => navigate('estate')}
                  >
                    Plant in vineyard
                    <ArrowRight size={15} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
