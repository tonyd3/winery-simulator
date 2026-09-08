import { useState } from 'react';
import { RESEARCH_EXPERIMENTS, REGIONS } from './catalog';
import type { ResearchId, ResearchExperimentId } from './catalog';
import type { GameState } from './game';
import {
  fieldExperimentEligible,
  cellarExperimentEligible,
  getLand,
  getVariety,
  calendar,
} from './game';
import { activeStudies } from './researchProgression';
import type { Dispatch } from './Panels';

export function ResearchExperiment({
  state,
  dispatch,
  id,
}: {
  state: GameState;
  dispatch: Dispatch;
  id: ResearchId;
}) {
  const [chosenPlot, setPlot] = useState('');
  const [chosenA, setA] = useState('');
  const [chosenB, setB] = useState('');
  if (!(id in RESEARCH_EXPERIMENTS)) return null;
  const experimentId = id as ResearchExperimentId;
  const spec = RESEARCH_EXPERIMENTS[experimentId];
  const active = activeStudies(state).find((p) => p.id === id);
  const used = state.experimentCredits.includes(experimentId);
  const plots = state.plots.filter((p) =>
    fieldExperimentEligible(state, id, p.id),
  );
  const plot = plots.find((p) => p.id === Number(chosenPlot)) ?? plots[0];
  const a = Number(chosenA),
    b = Number(chosenB);
  const paired = cellarExperimentEligible(state, [a, b]);
  return (
    <details className="research-experiment">
      <summary>
        {used
          ? 'Experiment completed'
          : `Optional experiment · save up to ${spec.bonus} study weeks`}
      </summary>
      <p>{spec.text}</p>
      {used ? (
        <p>
          This study’s one-time bonus has been used. Abandoning does not restore
          it.
        </p>
      ) : !active ? (
        <p>
          Start the study to run this experiment. The normal study path remains
          available.
        </p>
      ) : active.experiment ? (
        <>
          <p>
            <strong>{active.experiment.observed} / 3 observations</strong> ·{' '}
            {getLand(state, active.experiment.plotId).name} ·{' '}
            {getVariety(state, active.experiment.variety).name}
          </p>
          <p>
            {active.paused
              ? 'Resume the study to collect observations.'
              : calendar(state.week).season === 'Winter'
                ? 'Observations resume in the growing season.'
                : !fieldExperimentEligible(
                      state,
                      id,
                      active.experiment.plotId,
                      active.experiment.variety,
                    )
                  ? 'Observations are waiting for the original grape on matching soil with at least 70% health.'
                  : 'Collects one observation per qualifying game week.'}{' '}
            {!active.paused && 'Normal study progress continues. '}
            An unfinished experiment ends with the study.
          </p>
        </>
      ) : experimentId === 'sensory_science' ? (
        <>
          <div className="experiment-selects">
            {[
              { label: 'First reserve', value: chosenA, set: setA },
              { label: 'Second reserve', value: chosenB, set: setB },
            ].map(({ label, value, set }) => (
              <label key={label}>
                {label}
                <select value={value} onChange={(e) => set(e.target.value)}>
                  <option value="">Choose reserve…</option>
                  {state.reserves.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} · lot {r.id}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <p>
            Consumes 750 mL from each reserve (1.5 L total). Scores stay
            unchanged. No cash or knowledge charge.
          </p>
          {!paired && (
            <small>
              Choose two matching lots with recorded oak / steel treatment and
              enough wine.
            </small>
          )}
          <button
            className="button secondary"
            disabled={!paired || active.paused}
            onClick={() =>
              dispatch({ type: 'cellarExperiment', reserveIds: [a, b] })
            }
          >
            Taste comparison · use 1.5 L
          </button>
          {active.paused && <small>Resume the study first.</small>}
        </>
      ) : (
        <>
          <label>
            Observation parcel
            <select
              value={plot?.id ?? ''}
              onChange={(e) => setPlot(e.target.value)}
            >
              <option value="" disabled>
                Choose an eligible parcel…
              </option>
              {plots.map((p) => (
                <option key={p.id} value={p.id}>
                  {getLand(state, p.id).name} ·{' '}
                  {getVariety(state, p.variety!).name} ·{' '}
                  {REGIONS[getLand(state, p.id).region].name}
                </option>
              ))}
            </select>
          </label>
          <p>
            No additional charge. Care and planting keep their normal costs.
            Paused studies and winter collect no observations; losing
            eligibility pauses observation.
          </p>
          <button
            className="button secondary"
            disabled={!plot || active.paused}
            onClick={() =>
              dispatch({
                type: 'fieldExperiment',
                id: experimentId,
                plotId: plot!.id,
              })
            }
          >
            Begin field observation
          </button>
          {!plot && (
            <small>No parcel meets this experiment’s conditions yet.</small>
          )}
          {active.paused && <small>Resume the study first.</small>}
        </>
      )}
    </details>
  );
}
