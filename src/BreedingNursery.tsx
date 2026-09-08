import { useState } from 'react';
import { ArrowRight, GitBranch } from 'lucide-react';
import { BREEDING, REGIONS, TRAITS, VARIETIES } from './catalog';
import { availableVarieties, getVariety, money } from './game';
import type { BreedingTrait, GameState } from './game';
import {
  breedingPermission,
  breedingPreview,
  breedingWeeks,
  INTRO_BREEDING,
  introductoryCrossAvailable,
  introductoryCrossPermission,
} from './researchProgression';
import { studyWeeks } from './investments';
import { Progress } from './components';
import type { Dispatch } from './Panels';
import type { ResearchNavigation } from './ResearchDecisions';

export function BreedingNursery({
  state,
  dispatch,
  onFocus,
  onDestination,
}: { state: GameState; dispatch: Dispatch } & ResearchNavigation) {
  const introAvailable = introductoryCrossAvailable(state);
  const [fullTrial, setFullTrial] = useState(false);
  const introductory =
    introAvailable && (!fullTrial || !state.research.includes('breeding'));
  const choices = introductory
    ? REGIONS[state.region].starters.map(
        (id) => [id, getVariety(state, id)] as const,
      )
    : availableVarieties(state);
  const [a, setA] = useState(''),
    [b, setB] = useState(''),
    [name, setName] = useState('');
  const [trait, setTrait] = useState<BreedingTrait>('climate');
  const parentA = choices.some(([id]) => id === a) ? a : choices[0][0];
  const parentB = choices.some(([id]) => id === b) ? b : choices[1][0];
  const selectedTrait = introductory && trait === 'finesse' ? 'climate' : trait;
  const terms = introductory
    ? INTRO_BREEDING
    : { ...BREEDING, weeks: breedingWeeks(state) };
  const trial = state.breedingProject;
  const preview = breedingPreview(state, [parentA, parentB], selectedTrait);
  const permission = introductory
    ? introductoryCrossPermission(state, [parentA, parentB], selectedTrait)
    : breedingPermission(state, [parentA, parentB], selectedTrait);
  const duplicate = [...Object.values(VARIETIES), ...state.hybrids].some(
    (v) => v.name.toLocaleLowerCase() === name.trim().toLocaleLowerCase(),
  );
  const reason =
    permission ||
    (state.hybrids.length >= 60
      ? 'Your collection has reached 60 custom grapes.'
      : parentA === parentB
        ? 'Choose two different parents.'
        : !name.trim()
          ? 'Give your new grape a name.'
          : duplicate
            ? 'Choose a unique grape name.'
            : state.knowledge < terms.knowledge
              ? `Need ${terms.knowledge - state.knowledge} more knowledge.`
              : state.cash < terms.cost
                ? `Need ${money(terms.cost - state.cash)} more.`
                : null);
  const locked =
    !state.research.includes('breeding') &&
    (!introAvailable || !state.research.includes('ampelography'));
  return (
    <section aria-label="Breeding nursery">
      <div className="research-section-heading">
        <h2>Your estate’s next grape.</h2>
        <GitBranch size={25} />
      </div>
      {trial ? (
        <div className="nursery-trial">
          <span className="eyebrow">
            {trial.result.id === state.introCrossId
              ? 'INTRODUCTORY CROSS'
              : 'NURSERY TRIAL'}{' '}
            IN PROGRESS
          </span>
          <h3>{trial.result.name}</h3>
          <p>
            {trial.result.parents
              .map((p) => getVariety(state, p).name)
              .join(' × ')}{' '}
            · {TRAITS[trial.result.trait].name}
          </p>
          <Progress value={(1 - trial.remaining / trial.duration) * 100} />
          <b>{studyWeeks(state, trial.remaining)} weeks until ready to plant</b>
          <p>Inheritance is fixed. Your team is testing the seedlings.</p>
        </div>
      ) : locked ? (
        <div className="nursery-locked">
          <GitBranch size={25} />
          <h3>
            {introAvailable
              ? 'Start with your founding grapes.'
              : 'Continue your breeding work.'}
          </h3>
          <p>
            {introAvailable
              ? `Vine science opens a one-time introductory cross: ${money(INTRO_BREEDING.cost)}, ${INTRO_BREEDING.knowledge} knowledge and ${INTRO_BREEDING.weeks} weeks. Cross your two founding grapes for climate adaptation or hardiness.`
              : 'Your introductory cross is complete. Study Cross-pollination to run further trials with any two learned grapes.'}
          </p>
          <button
            className="button primary"
            onClick={() =>
              onFocus(introAvailable ? 'ampelography' : 'breeding')
            }
          >
            View {introAvailable ? 'Vine science' : 'Cross-pollination'}{' '}
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <form
          className="breeding-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (
              !reason &&
              dispatch({
                type: 'breed',
                parents: [parentA, parentB],
                trait: selectedTrait,
                name,
                introductory,
              })
            )
              setName('');
          }}
        >
          {introAvailable && (
            <div className="introductory-cross">
              <strong>One introductory cross for your estate</strong>
              <p>
                {money(INTRO_BREEDING.cost)} · {INTRO_BREEDING.knowledge}{' '}
                knowledge · {studyWeeks(state, INTRO_BREEDING.weeks)} weeks.
                Founding grapes only. Further trials require Cross-pollination
                and use its normal terms.
              </p>
              {state.research.includes('breeding') && (
                <label>
                  <input
                    type="checkbox"
                    checked={fullTrial}
                    onChange={(e) => setFullTrial(e.target.checked)}
                  />{' '}
                  Use a full nursery trial instead
                </label>
              )}
            </div>
          )}
          <div className="parent-pair">
            {[
              { label: 'First parent', value: parentA, set: setA },
              { label: 'Second parent', value: parentB, set: setB },
            ].map(({ label, value, set }) => (
              <div className="parent-picker" key={label}>
                <label>
                  {label}
                  <select value={value} onChange={(e) => set(e.target.value)}>
                    {choices.map(([id, v]) => (
                      <option key={id} value={id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </label>
                <p>
                  {getVariety(state, value).wineType} ·{' '}
                  {getVariety(state, value).preferred} soil
                </p>
                <span>
                  Warmth {getVariety(state, value).heat}/5 · Resilience{' '}
                  {getVariety(state, value).resilience}/7 · Finesse{' '}
                  {getVariety(state, value).finesse} · Yield{' '}
                  {Math.round(getVariety(state, value).yieldFactor * 100)}%
                </span>
              </div>
            ))}
          </div>
          <fieldset className="trait-options">
            <legend>Select for a trait</legend>
            {Object.entries(TRAITS).map(([id, t]) => (
              <label
                className={selectedTrait === id ? 'selected' : ''}
                key={id}
              >
                <input
                  type="radio"
                  name="trait"
                  value={id}
                  checked={selectedTrait === id}
                  disabled={
                    id === 'finesse' &&
                    (introductory || !state.research.includes('genomics'))
                  }
                  onChange={() => setTrait(id as BreedingTrait)}
                />
                <span>
                  <b>{t.name}</b>
                  <small>
                    {t.text}
                    {id === 'finesse' &&
                    (introductory || !state.research.includes('genomics'))
                      ? ' Available in full trials after Aroma & finesse selection.'
                      : ''}
                  </small>
                </span>
              </label>
            ))}
          </fieldset>
          <div className="breeding-preview" aria-label="Offspring preview">
            <h3>Expected offspring</h3>
            <dl className="grape-traits">
              <div>
                <dt>Warmth</dt>
                <dd>{preview.heat}/5</dd>
              </div>
              <div>
                <dt>Resilience</dt>
                <dd>{preview.resilience}/7</dd>
              </div>
              <div>
                <dt>Finesse</dt>
                <dd>{preview.finesse}</dd>
              </div>
              <div>
                <dt>Yield</dt>
                <dd>{Math.round(preview.yieldFactor * 100)}%</dd>
              </div>
              <div>
                <dt>Planting</dt>
                <dd>{money(preview.planting)}</dd>
              </div>
            </dl>
            <p>
              Color and soil are inherited together from one parent, with an
              equal chance of each: {getVariety(state, parentA).wineType} /{' '}
              {getVariety(state, parentA).preferred} or{' '}
              {getVariety(state, parentB).wineType} /{' '}
              {getVariety(state, parentB).preferred}. Other traits above are
              fixed by this pairing and selection. Planting price is per
              unexpanded parcel.
            </p>
          </div>
          <div className="breeding-submit">
            <label>
              Name the new variety
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={28}
                placeholder="e.g. Bellevue No. 1"
                required
              />
            </label>
            <div>
              <span>
                {terms.knowledge} knowledge · {money(terms.cost)} ·{' '}
                {studyWeeks(state, terms.weeks)} weeks
              </span>
              <button
                className="button primary"
                disabled={Boolean(reason)}
                type="submit"
              >
                <GitBranch size={15} />
                {introductory
                  ? 'Start introductory cross'
                  : 'Start breeding trial'}{' '}
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
          {reason && <p className="fine-print">{reason}</p>}
          {!introductory && permission && (
            <button
              type="button"
              className="text-button"
              onClick={() =>
                onFocus(
                  selectedTrait === 'finesse' ? 'genomics' : 'backcrossing',
                )
              }
            >
              View required study <ArrowRight size={14} />
            </button>
          )}
        </form>
      )}
      <p className="breeding-note">
        A fictional breeding model: real years of crossing and field trials are
        compressed into game weeks. Each trial pays upfront; its inheritance is
        saved when it starts. Hybrid parents require Generational crosses.
      </p>
      {state.hybrids.length > 0 && (
        <div className="estate-crossings">
          <h3>
            Your estate varieties <span>{state.hybrids.length} / 60</span>
          </h3>
          {[...state.hybrids].reverse().map((h) => (
            <article key={h.id}>
              <GitBranch size={22} />
              <div>
                <h4>{h.name}</h4>
                <p>
                  {h.parents.map((p) => getVariety(state, p).name).join(' × ')}
                </p>
                <small>
                  {TRAITS[h.trait].name} · Warmth {h.heat}/5 · Resilience{' '}
                  {h.resilience}/7 · Finesse {h.finesse} · Yield{' '}
                  {Math.round(h.yieldFactor * 100)}%
                </small>
              </div>
              <button
                className="button secondary"
                onClick={() =>
                  onDestination({
                    view: 'estate',
                    label: 'Choose a parcel',
                    grape: h.id,
                  })
                }
              >
                Choose a parcel <ArrowRight size={14} />
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
