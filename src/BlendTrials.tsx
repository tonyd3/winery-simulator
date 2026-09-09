import { getEstate, getVariety } from './game';
import type { GameState } from './game';
import type { WineComponent } from './winemaking';
import { blendProfile, liters, volume } from './winemaking';
import { tastingProfile } from './wineSensory';
import { BLEND_TRIAL_LIMIT, trialAvailability } from './blendPlanning';
import type { BlendTrial } from './blendPlanning';

export function BlendTrials({
  state,
  current,
  onUse,
  onRemove,
}: {
  state: GameState;
  current: WineComponent[];
  onUse: (trial: BlendTrial) => void;
  onRemove: (slot: number) => void;
}) {
  const trials = state.blendTrials ?? [];
  if (!trials.length) return null;
  const columns = [
    { name: 'Current recipe', components: current, trial: null },
    ...trials.map((trial) => ({
      name: trial.name,
      components: trial.components,
      trial,
    })),
  ].map((c) => ({
    ...c,
    profile: c.components.length
      ? blendProfile(c.components, state.hybrids)
      : null,
    tasting: c.components.length ? tastingProfile(c.components, state) : null,
  }));
  return (
    <section className="blend-trials" aria-labelledby="blend-trials-heading">
      <div className="trial-heading">
        <div>
          <span className="eyebrow">THE TASTING NOTEBOOK</span>
          <h3 id="blend-trials-heading">Compare your bench trials.</h3>
        </div>
        <span>
          {trials.length} / {BLEND_TRIAL_LIMIT} saved
        </span>
      </div>
      <p>
        Compare proportions, character, and estimated quality. Trials save with
        your estate and use no wine, cash, or kits. A trial never fixes a
        tasting score.
      </p>
      <p className="trial-scroll-hint">
        Saved recipes beside your current bench. Scroll across on narrow
        screens.
      </p>
      <div
        className="trial-comparison-scroll"
        role="region"
        aria-label="Blend trial comparison"
        tabIndex={0}
      >
        <table className="trial-comparison">
          <caption className="visually-hidden">
            Current recipe and saved bench trials
          </caption>
          <thead>
            <tr>
              <th scope="col">Recipe</th>
              {columns.map((c, i) => (
                <th scope="col" key={i}>
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Volume</th>
              {columns.map((c, i) => (
                <td key={i}>
                  {c.profile ? `${liters(volume(c.components))} L` : '—'}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Grapes</th>
              {columns.map((c, i) => (
                <td key={i}>
                  {c.profile
                    ? c.profile.sources
                        .map(
                          (source) =>
                            `${getVariety(state, source.variety).name} Y${source.year}${state.estates.length > 1 ? ` · ${getEstate(state, source.estateId ?? 1).name}` : ''} · ${Number(source.share.toFixed(1))}%`,
                        )
                        .join(' · ')
                    : 'Select at least two lots'}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Estimated tasting</th>
              {columns.map((c, i) => (
                <td className="trial-score" key={i}>
                  {c.profile ? `${c.profile.low}–${c.profile.high}` : '—'}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Source quality</th>
              {columns.map((c, i) => (
                <td key={i}>{c.profile?.base.toFixed(1) ?? '—'}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Compatibility</th>
              {columns.map((c, i) => (
                <td key={i}>
                  {c.profile
                    ? `${c.profile.compatibility > 0 ? '+' : ''}${c.profile.compatibility.toFixed(1)} pts`
                    : '—'}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Aromas</th>
              {columns.map((c, i) => (
                <td key={i}>{c.tasting?.aromas.join(' · ') ?? '—'}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Palate</th>
              {columns.map((c, i) => (
                <td key={i}>{c.tasting?.palate ?? '—'}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Source stock</th>
              {columns.map((c, i) => {
                const unavailable = c.trial
                  ? trialAvailability(state.reserves, c.trial)
                  : null;
                return (
                  <td key={i}>
                    {c.trial ? (
                      <>
                        <p>{unavailable ?? 'Available for this recipe'}</p>
                        <button
                          className="button secondary"
                          disabled={Boolean(unavailable)}
                          onClick={() => onUse(c.trial!)}
                        >
                          Use {c.trial.name}
                        </button>
                        <button
                          className="text-button"
                          aria-label={`Remove trial ${c.trial.name}`}
                          onClick={() => onRemove(c.trial!.slot)}
                        >
                          Remove trial
                        </button>
                      </>
                    ) : (
                      <p>
                        Apply a saved recipe to adjust it here. Creating a blend
                        is a separate action.
                      </p>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
