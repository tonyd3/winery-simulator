import { additionalLandUpkeep } from './investments';
import { Plus } from 'lucide-react';
import {
  calendar,
  CELLAR_EQUIPMENT,
  getLand,
  getVariety,
  grapeLiters,
  harvestYield,
  hectares,
  money,
  PLOT_EXPANSION,
  plotExpansionCost,
  plotScale,
} from './game';
import type { GameState, Plot } from './game';
import type { Dispatch } from './Panels';

export function PlotExpansion({
  state,
  plot,
  dispatch,
}: {
  state: GameState;
  plot: Plot;
  dispatch: Dispatch;
}) {
  const land = getLand(state, plot.id);
  const level = plot.expansions ?? 0;
  const bearing = plot.bearingExpansions ?? 0;
  const full = level >= PLOT_EXPANSION.max;
  const nextLevel = Math.min(level + 1, PLOT_EXPANSION.max);
  const cost = plotExpansionCost(state, plot);
  const pending = level > bearing;
  const nextYield = harvestYield(state, plot, nextLevel);
  const currentYield = harvestYield(state, plot);
  return (
    <section className="plot-expansion" aria-label="Plot expansion">
      <div className="plot-expansion-heading">
        <h3>Grow more here.</h3>
        <small>
          {level} / {PLOT_EXPANSION.max} expansions
        </small>
      </div>
      {plot.variety && (
        <p className="plot-yield">
          <strong>{currentYield.toLocaleString()} kg</strong> ·{' '}
          {grapeLiters(currentYield).toLocaleString()} L from established{' '}
          {getVariety(state, plot.variety).name} vines at current health.
        </p>
      )}
      {pending && (
        <p className="plot-expansion-pending">
          New rows join the crop in Year {calendar(state.week).year + 1}. Once
          established, this plot can yield{' '}
          {harvestYield(state, plot, level).toLocaleString()} kg at current
          health.
        </p>
      )}
      {!full && (
        <>
          <dl className="plot-expansion-preview">
            <div>
              <dt>Plot area</dt>
              <dd>
                {land.area} → {hectares(land.baseArea * plotScale(nextLevel))}{' '}
                ha
              </dd>
            </div>
            {plot.variety && (
              <div>
                <dt>Yield once established</dt>
                <dd>
                  {harvestYield(state, plot, level).toLocaleString()} →{' '}
                  {nextYield.toLocaleString()} kg
                </dd>
              </div>
            )}
            {plot.variety && (
              <div>
                <dt>Wine / 150 L tanks</dt>
                <dd>
                  {grapeLiters(nextYield).toLocaleString()} L /{' '}
                  {Math.ceil(
                    grapeLiters(nextYield) / CELLAR_EQUIPMENT.tankLiters,
                  )}{' '}
                  tanks
                </dd>
              </div>
            )}
          </dl>
          <p>
            {plot.variety
              ? `Includes more ${getVariety(state, plot.variety).name} vines, producing from next spring. This year's crop stays unchanged.`
              : 'Add land to this parcel, then plant the larger area with your chosen grape.'}{' '}
            +
            {money(
              additionalLandUpkeep(
                state,
                PLOT_EXPANSION.upkeep,
                land.baseArea * PLOT_EXPANSION.step,
              ),
            )}{' '}
            weekly upkeep, including vineyard programs.
          </p>
        </>
      )}
      <button
        className="button secondary wide"
        disabled={full || state.cash < cost}
        onClick={() => dispatch({ type: 'expandPlot', id: plot.id })}
      >
        {full ? 'Plot fully expanded' : 'Expand plot'}
        {!full && (
          <>
            <span className="button-price">{money(cost)}</span>
            <Plus size={15} />
          </>
        )}
      </button>
      {!full && state.cash < cost && (
        <p className="plot-expansion-pending">
          Need {money(cost - state.cash)} more.
        </p>
      )}
      <p className="plot-expansion-footnote">
        {full ? 'Three times the original area. ' : ''}Vine care, planting and
        harvest costs scale with size. Plan enough cellar tanks for the larger
        crop.
      </p>
    </section>
  );
}
