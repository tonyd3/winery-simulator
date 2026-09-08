import { ArrowRight } from 'lucide-react';
import { harvestQuality, harvestYield } from './game';
import type { GameState, Plot } from './game';
import {
  harvestInvestmentEffects,
  UPGRADES,
  upgradeActive,
} from './investments';
import './harvest.css';

export function HarvestForecast({
  state,
  plot,
  onBuild,
}: {
  state: GameState;
  plot: Plot;
  onBuild: () => void;
}) {
  const effects = harvestInvestmentEffects(state, plot);
  const investments = state.upgrades.filter((id) => UPGRADES[id].harvest);
  return (
    <section className="harvest-forecast" aria-label="Harvest forecast">
      <div className="harvest-estimate">
        <span>Estimated grape quality</span>
        <strong>
          {harvestQuality(state, plot)}
          <small> / 100</small>
        </strong>
      </div>
      <p>
        {harvestYield(state, plot).toLocaleString('en-US')} kg at current health
        and ripeness
        {effects.yieldMultiplier !== 1
          ? ` · ${Math.abs(Math.round((effects.yieldMultiplier - 1) * 100))}% ${effects.yieldMultiplier > 1 ? 'more' : 'less'} from vineyard programs`
          : ''}
        .{plot.growth < 80 ? ' Harvest unlocks at 80% ripeness.' : ''}
      </p>
      {investments.length > 0 && (
        <details className="harvest-upgrades">
          <summary>
            Upgrade contribution: +{effects.quality}{' '}
            {effects.quality === 1 ? 'point' : 'points'}
          </summary>
          <p>Included above, up to the 100-point quality limit.</p>
          <ul>
            {investments.map((id) => {
              const u = UPGRADES[id];
              const effect = u.harvest!;
              const status = !upgradeActive(state, id)
                ? 'Suspended'
                : plot.health < (effect.minHealth ?? 0)
                  ? `Needs ${effect.minHealth}% vine health`
                  : plot.growth < (effect.minRipeness ?? 0)
                    ? `Needs ${effect.minRipeness}% ripeness`
                    : `+${effect.quality} ${effect.quality === 1 ? 'point' : 'points'}`;
              return (
                <li key={id}>
                  <span>{u.name}</span>
                  <b>{status}</b>
                </li>
              );
            })}
          </ul>
        </details>
      )}
      <button className="text-button" onClick={onBuild}>
        Improve grape quality <ArrowRight size={14} />
      </button>
    </section>
  );
}
