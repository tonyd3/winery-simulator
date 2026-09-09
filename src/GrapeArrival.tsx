import { parcelLabel } from './parcelProvenance';
import { useState } from 'react';
import { ArrowRight, Clock3 } from 'lucide-react';
import { Icon } from './components';
import {
  fermentationPlan,
  getEstate,
  getVariety,
  grapeLiters,
  money,
} from './game';
import type { GameState } from './game';
import type { Dispatch, View } from './Panels';
import type { ResearchId } from './catalog';
import { grapeStorageWeeks } from './investments';
import { CELLAR_TECHNIQUES, CELLAR_TECHNIQUE_IDS } from './cellarTechniques';
import { loadCellarChoices, saveCellarChoices } from './cellarPreferences';
import type { CellarChoices } from './cellarPreferences';
import { resolveMaturation } from './maturation';

export function GrapeArrival({
  state,
  grapes: g,
  dispatch,
  navigate,
}: {
  state: GameState;
  grapes: GameState['grapes'][number];
  dispatch: Dispatch;
  navigate: (view: View, study?: ResearchId) => void;
}) {
  const [choices, setChoices] = useState(() =>
    loadCellarChoices(g.variety, state.research),
  );
  const [remembered, setRemembered] = useState(true);
  const available = CELLAR_TECHNIQUE_IDS.filter((id) =>
    state.research.includes(id),
  );
  const { oak } = choices;
  const techniques = choices.techniques.filter((id) => available.includes(id));
  const selectedCount = techniques.length + Number(oak);
  function choose(next: CellarChoices) {
    setChoices(next);
    setRemembered(saveCellarChoices(g.variety, next));
  }
  const plan = fermentationPlan(state, g.kg, oak, techniques);
  const name = getVariety(state, g.variety).name;
  return (
    <section className="grape-lot" aria-label={`${name} harvest ${g.id}`}>
      <div className="arrival">
        <div className="arrival-icon">
          <Icon name="grape" size={27} />
        </div>
        <div className="arrival-description">
          <h4>{name}</h4>
          {state.estates.length > 1 && (
            <small>{getEstate(state, g.estateId ?? 1).name}</small>
          )}
          <small className="parcel-source">{parcelLabel(g.parcel)}</small>
          <p>
            {g.kg} kg · {g.quality}/100 quality · makes {grapeLiters(g.kg)} L
          </p>
          <span className="warning-text">
            <Clock3 size={12} />{' '}
            {state.week - g.picked >= grapeStorageWeeks(state)
              ? 'Process now — refrigeration stopped'
              : `Process within ${grapeStorageWeeks(state) - (state.week - g.picked)} weeks`}
          </span>
        </div>
        <button
          className="text-button"
          onClick={() => dispatch({ type: 'sellGrapes', id: g.id })}
        >
          Sell grapes · {money(g.kg * 3)}
        </button>
        <div className="fermentation-order">
          <button
            className="button primary"
            disabled={plan.liters === 0 || state.cash < plan.cost}
            onClick={() =>
              dispatch({ type: 'ferment', id: g.id, oak, techniques })
            }
          >
            {plan.liters === 0
              ? grapeLiters(g.kg) === 0
                ? 'Not enough grapes'
                : 'No empty tanks'
              : plan.missing > 0
                ? `Ferment ${plan.liters} L · ${money(plan.cost)}`
                : `Ferment · ${money(plan.cost)}`}
            <ArrowRight size={16} />
          </button>
          <small>
            {plan.liters === 0
              ? grapeLiters(g.kg) === 0
                ? 'Sell this small remainder'
                : 'Move finished wine to reserves or buy more tanks'
              : `${plan.fills.length} tank${plan.fills.length === 1 ? '' : 's'} · ${plan.fills.map((f) => `${f.liters} L`).join(' + ')} · ${plan.weeks} weeks until reserves`}
          </small>
          {plan.liters > 0 && plan.remainingKg > 0 && (
            <small>{plan.remainingKg} kg will remain to process or sell</small>
          )}
          {plan.liters > 0 && state.cash < plan.cost && (
            <small>Need {money(plan.cost - state.cash)} more</small>
          )}
        </div>
      </div>
      <details className="cellar-recipe">
        <summary>
          Cellar techniques{' '}
          <span>
            {selectedCount
              ? `${selectedCount} selected${oak ? ' · French oak' : ''}`
              : 'Standard fermentation'}{' '}
            · {plan.weeks} weeks
          </span>
        </summary>
        <p className="cellar-recipe-intro">
          Ferment in steel for {money(140)} per tank, or choose oak fermentation
          below. Choose a separate maturation vessel when this cellar plan
          finishes. Extra steps change character and keep the tanks occupied.
        </p>
        <div className="cellar-recipe-shortcuts">
          <div className="cellar-recipe-actions">
            <button
              type="button"
              className="button secondary"
              disabled={oak && techniques.length === available.length}
              onClick={() => choose({ oak: true, techniques: available })}
            >
              Select all available
            </button>
            <button
              type="button"
              className="text-button"
              disabled={selectedCount === 0}
              onClick={() => choose({ oak: false, techniques: [] })}
            >
              Clear all
            </button>
          </div>
          <p role="status">
            {remembered
              ? `Choices are remembered for ${name} in this browser.`
              : 'Choices apply to this harvest, but could not be remembered in this browser.'}
          </p>
        </div>
        <div className="cellar-technique">
          <label>
            <input
              type="checkbox"
              checked={oak}
              onChange={(event) =>
                choose({ oak: event.target.checked, techniques })
              }
              aria-label={`French oak fermentation for ${name}`}
            />
            <span>
              <strong>French oak fermentation</strong>
              <span>
                Add a little wood character during fermentation. Subsequent
                maturation is chosen separately.
              </span>
            </span>
          </label>
          <div className="cellar-technique-terms">+{money(180)} per tank</div>
        </div>
        <p className="fermentation-advice">
          {resolveMaturation(g.variety, state.hybrids).advice}
        </p>
        <div className="cellar-technique-list">
          {CELLAR_TECHNIQUE_IDS.map((id) => {
            const technique = CELLAR_TECHNIQUES[id];
            const unlocked = state.research.includes(id);
            return (
              <div className="cellar-technique" key={id}>
                <label>
                  <input
                    type="checkbox"
                    aria-label={technique.name}
                    disabled={!unlocked}
                    checked={techniques.includes(id)}
                    onChange={(event) =>
                      choose({
                        oak,
                        techniques: event.target.checked
                          ? [...techniques, id]
                          : techniques.filter((value) => value !== id),
                      })
                    }
                  />
                  <span>
                    <strong>{technique.name}</strong>
                    <span>{technique.description}</span>
                  </span>
                </label>
                <div className="cellar-technique-terms">
                  <span>
                    +{technique.weeks}{' '}
                    {technique.weeks === 1 ? 'week' : 'weeks'} · +
                    {money(technique.perTank)} per tank
                  </span>
                  {!unlocked && (
                    <button
                      className="text-button"
                      aria-label={`Study ${technique.name}`}
                      onClick={() => navigate('research', id)}
                    >
                      Study to unlock <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="cellar-recipe-total">
          2 weeks fermentation
          {CELLAR_TECHNIQUE_IDS.filter((id) => techniques.includes(id))
            .map((id) => ` → ${CELLAR_TECHNIQUES[id].name}`)
            .join('')}
          {' · '}
          {plan.weeks} weeks total
          {plan.liters > 0
            ? ` · ${money(plan.cost)} for ${plan.liters} L, including ${oak ? 'oak' : 'steel'}`
            : ''}
          .
        </p>
      </details>
    </section>
  );
}
