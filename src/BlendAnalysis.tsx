import { ArrowRight, Check, Wine } from 'lucide-react';
import { Modal } from './components';
import { getVariety, getEstate, money } from './game';
import type { GameState } from './game';
import type { Dispatch } from './Panels';
import {
  blendProfile,
  CELLAR_TASTING,
  liters,
  vintage,
  volume,
} from './winemaking';
import type { Reserve, WineComponent } from './winemaking';

const signedPoints = (value: number) => {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? '+' : rounded < 0 ? '−' : ''}${Math.abs(rounded).toFixed(1)}`;
};

export function BlendAnalysis({
  parts,
  state,
  score = null,
  expanded = false,
  stored = false,
}: {
  parts: WineComponent[];
  state: GameState;
  score?: number | null;
  expanded?: boolean;
  stored?: boolean;
}) {
  const profile = blendProfile(parts, state.hybrids);
  if (!profile.dominant) return null;
  const strongest = profile.sources[0];
  const fixed = score !== null;
  return (
    <div className="blend-analysis">
      <div
        className={`blend-score ${fixed ? 'scored' : ''}`}
        aria-live="polite"
      >
        <div>
          <span className="eyebrow">
            {fixed ? 'CELLAR TASTING SCORE' : 'ESTIMATED TASTING'}
          </span>
          <strong key={score}>
            {fixed ? score : `${profile.low}–${profile.high}`}
            <small> / 100</small>
          </strong>
        </div>
        {fixed ? <Check size={24} /> : <Wine size={26} />}
      </div>
      <dl className="score-breakdown">
        <div>
          <dt>Weighted source quality</dt>
          <dd>{profile.base.toFixed(1)}</dd>
        </div>
        <div>
          <dt>Grape compatibility</dt>
          <dd>{signedPoints(profile.compatibility)} pts</dd>
        </div>
        <div>
          <dt>Cellar tasting</dt>
          <dd>{fixed ? 'Final' : `±${CELLAR_TASTING.variation}`}</dd>
        </div>
      </dl>
      {fixed && (
        <p className="fine-print">
          Recipe analysis uses current blending rules. This lot’s recorded score
          stays fixed.
        </p>
      )}
      <details className="blend-guidance" open={expanded}>
        <summary>Source quality & blending advice</summary>
        <table className="blend-source-table">
          <caption>
            Each source’s share and quality before pairing effects.
          </caption>
          <thead>
            <tr>
              <th scope="col">Source</th>
              <th scope="col">Share</th>
              <th scope="col">Quality</th>
            </tr>
          </thead>
          <tbody>
            {profile.sources.map((source) => (
              <tr
                key={`${source.variety}:${source.year}:${source.estateId ?? 1}`}
              >
                <th scope="row">
                  {getVariety(state, source.variety).name}
                  <small>
                    Year {source.year}
                    {state.estates.length > 1 &&
                      ` · ${getEstate(state, source.estateId ?? 1).name}`}
                  </small>
                </th>
                <td>{source.share.toFixed(1)}%</td>
                <td>{source.quality.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {profile.pairs.length > 0 && (
          <section className="grape-pairings" aria-label="Grape pairings">
            <h4>How these grapes work together</h4>
            <p>
              Pair effects at your chosen proportions · −6 to +4 points overall.
            </p>
            <ul>
              {profile.pairs.slice(0, 6).map((pair) => (
                <li key={pair.grapes.join(':')}>
                  <div className="pairing-heading">
                    <strong>
                      {pair.grapes
                        .map((id) => getVariety(state, id).name)
                        .join(' + ')}
                    </strong>
                    <span>{signedPoints(pair.effect)} pts</span>
                  </div>
                  <p>
                    <b>
                      {pair.affinity > 0
                        ? 'Complementary'
                        : pair.affinity < 0
                          ? 'Tension'
                          : 'Neutral'}
                      .
                    </b>{' '}
                    {pair.reason}
                  </p>
                </li>
              ))}
            </ul>
            {profile.pairs.length > 6 && (
              <p>
                Showing the 6 largest effects. All {profile.pairs.length}{' '}
                pairings count toward the total.
              </p>
            )}
          </section>
        )}
        <ul className="blend-advice">
          {profile.varietyCount === 1 ? (
            <li>
              A single grape stands on source quality. Mixing its vintages adds
              no pairing bonus; it can still make an exceptional wine.
            </li>
          ) : (
            <>
              <li>
                Small additions have small effects. Adding more grapes does not
                automatically improve a blend; compare both compatibility and
                source quality as you adjust the recipe.
              </li>
              <li>
                {getVariety(state, strongest.variety).name}, Year{' '}
                {strongest.year}, is your highest-quality source at{' '}
                {strongest.quality.toFixed(1)} points. More of it lifts the
                base, but can change the pairing effects.
              </li>
            </>
          )}
        </ul>
        <p className="fine-print">
          {stored
            ? 'Stored wine cannot be unmixed. Use these notes for your next recipe.'
            : 'Adjust the selected liters to compare recipes before creating your blend.'}{' '}
          Storage preserves quality; aging in the tank before storage improves
          it.
        </p>
      </details>
    </div>
  );
}

export function BlendTasting({
  reserve,
  state,
  dispatch,
  onClose,
  onBottle,
}: {
  reserve: Reserve;
  state: GameState;
  dispatch: Dispatch;
  onClose: () => void;
  onBottle: () => void;
}) {
  const affordable = state.cash >= CELLAR_TASTING.cost;
  return (
    <Modal title="The tasting table" onClose={onClose}>
      <div className="blend-tasting">
        <span className="eyebrow">
          LOT {String(reserve.id).padStart(2, '0')} ·{' '}
          {vintage(reserve.components)}
        </span>
        <h3>{reserve.name}</h3>
        <p className="tasting-volume">
          {liters(volume(reserve.components))} L in reserves
        </p>
        <BlendAnalysis
          parts={reserve.components}
          state={state}
          score={reserve.score}
          expanded
          stored
        />
        <div className="tasting-decision">
          {reserve.score === null ? (
            <>
              <p>
                A cellar tasting fixes this lot’s score before bottling. It
                costs {money(CELLAR_TASTING.cost)}, takes no game time, and uses
                no wine or kits.
              </p>
              <button
                className="button primary wide"
                disabled={!affordable}
                onClick={() =>
                  dispatch({ type: 'tasteReserve', id: reserve.id })
                }
              >
                <Wine size={16} /> Taste & score · {money(CELLAR_TASTING.cost)}
              </button>
              {!affordable && (
                <p className="fine-print">
                  You need {money(CELLAR_TASTING.cost - state.cash)} more for a
                  tasting.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="tasting-confirmed">
                <Check size={16} /> Score saved. All bottles from this lot keep{' '}
                {reserve.score} points.
              </p>
              <button
                className="button primary wide"
                disabled={volume(reserve.components) < 750}
                onClick={onBottle}
              >
                Bottle this reserve <ArrowRight size={16} />
              </button>
              {volume(reserve.components) < 750 && (
                <p className="fine-print">
                  Less than 750 mL remains. Use it in another blend to fill a
                  bottle.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
