import type { DemandContext } from './game';
import { Clock3, Megaphone, Trophy } from 'lucide-react';
import {
  judgingBlocked,
  marketingBlocked,
  money,
  demandForecast,
} from './game';
import type { GameState, Wine } from './game';
import type { Dispatch } from './Panels';
import {
  AWARDS,
  JUDGING,
  MARKETING,
  wineAward,
  judgingOutlook,
} from './promotion';

export function JudgingStatus({ wine }: { wine: Wine }) {
  const judging = wine.judging;
  if (!judging) return null;
  const award = wineAward(wine);
  return (
    <span className={`judging-status ${award?.name.toLowerCase() ?? ''}`}>
      {judging.remaining > 0 ? <Clock3 size={14} /> : <Trophy size={14} />}
      {judging.remaining > 0
        ? `With the judges · ${judging.remaining} ${judging.remaining === 1 ? 'week' : 'weeks'} to go`
        : `${award ? `${award.name} medal` : 'Reviewed · no medal'} · ${judging.score} panel points`}
    </span>
  );
}

export default function WinePromotion({
  wine,
  state,
  dispatch,
  demandGroups,
}: {
  wine: Wine;
  state: GameState;
  dispatch: Dispatch;
  demandGroups: DemandContext;
}) {
  const marketingReason = marketingBlocked(state, wine);
  const judgingReason = judgingBlocked(state, wine);
  const baseline = demandForecast(
    { ...wine, marketingWeeks: 0 },
    state,
    demandGroups,
  );
  const promoted = demandForecast(
    { ...wine, marketingWeeks: MARKETING.weeks },
    state,
    demandGroups,
  );
  const extraLow = Math.max(0, promoted.low - baseline.high);
  const extraHigh = Math.max(0, promoted.high - baseline.low);
  const judging = judgingOutlook(wine.quality);
  const active = (wine.marketingWeeks ?? 0) > 0;
  const award = wineAward(wine);
  return (
    <section
      className="wine-promotion"
      aria-label={`Marketing and judging for ${wine.label} release ${wine.release}`}
    >
      <div className="promotion-option">
        <h4>
          <Megaphone size={16} /> Spread the word
        </h4>
        <p>
          A {MARKETING.weeks}-week campaign: +
          {Math.round(MARKETING.demandBonus * 100)}% demand and +
          {money(MARKETING.priceBonus)} suggested shop price for this release.
        </p>
        {!active && wine.bottles > 0 && wine.listed && (
          <p>
            {baseline.low >= wine.bottles
              ? 'This stock is already forecast to sell out next week without a campaign. '
              : `Next week at your current price: ${extraLow}–${extraHigh} additional bottles forecast. `}
            The fee needs {Math.ceil(MARKETING.cost / wine.price)} additional
            sales over {MARKETING.weeks} weeks to recover at this price.
            Estimates exclude judging changes and later price changes.
          </p>
        )}
        <button
          className="button secondary wide"
          disabled={Boolean(marketingReason)}
          onClick={() => dispatch({ type: 'marketWine', id: wine.id })}
        >
          {active
            ? `Campaign active · ${wine.marketingWeeks} ${wine.marketingWeeks === 1 ? 'week' : 'weeks'} left`
            : `Send for marketing · ${money(MARKETING.cost)}`}
        </button>
        {marketingReason && !active && <small>{marketingReason}.</small>}
        {active && !wine.listed && (
          <small>
            List this wine to benefit. Campaign weeks still pass while the
            listing is paused.
          </small>
        )}
      </div>
      <div className="promotion-option">
        <h4>
          <Trophy size={16} /> An independent verdict
        </h4>
        {wine.judging ? (
          <>
            <JudgingStatus wine={wine} />
            <p>
              {wine.judging.remaining > 0
                ? 'The panel is tasting your wine. Results and any medal will stay with this release.'
                : award
                  ? `This release permanently earns +${money(award.priceBonus)} suggested price and +${Math.round(award.demandBonus * 100)}% demand.`
                  : 'The panel did not award a medal. Your original wine score is preserved; price and demand are unchanged.'}
            </p>
          </>
        ) : (
          <>
            <p>
              Results in {JUDGING.weeks} weeks. Medals bring lasting price and
              demand bonuses. One entry per release; a medal isn’t guaranteed.
            </p>
            <p>
              Possible panel score: {judging.low}–{judging.high}/100.{' '}
              {judging.medalPossible
                ? 'Bronze requires 80 points; higher scores unlock silver and gold.'
                : 'No medal is possible for this wine. Improve a future release before entering.'}
            </p>
            <button
              className="button secondary wide"
              disabled={Boolean(judgingReason)}
              onClick={() => dispatch({ type: 'judgeWine', id: wine.id })}
            >
              Send for judging · {money(JUDGING.cost)}
            </button>
            {judgingReason && <small>{judgingReason}.</small>}
          </>
        )}
        <details className="judging-guide">
          <summary>Medals & rewards</summary>
          <p>
            The panel scores within ±{JUDGING.variation} points of your wine’s
            original rating.
          </p>
          <ul>
            {AWARDS.map((medal) => (
              <li key={medal.name}>
                <strong>
                  {medal.name} · {medal.minimum}+
                </strong>
                <span>
                  +{money(medal.priceBonus)} price · +
                  {Math.round(medal.demandBonus * 100)}% demand
                </span>
              </li>
            ))}
          </ul>
        </details>
      </div>
      <p className="promotion-footnote">
        Use the suggested price above to update your shelf price. Campaigns
        reach shop customers; medals also improve wholesale offers.
      </p>
    </section>
  );
}
