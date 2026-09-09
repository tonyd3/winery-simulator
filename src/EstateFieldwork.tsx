import { Icon, Progress } from './components';
import {
  calendar,
  estatePlots,
  fieldWorkPlan,
  getEstate,
  getLand,
  getVariety,
  harvestQuality,
  money,
  readyToHarvest,
} from './game';
import type { GameState } from './game';
import type { Dispatch } from './Panels';
import './fieldwork.css';

export function EstateFieldwork({
  state,
  dispatch,
  selected,
  onSelect,
}: {
  state: GameState;
  dispatch: Dispatch;
  selected: number;
  onSelect: (id: number) => void;
}) {
  const plots = estatePlots(state).filter((p) => p.owned && p.variety);
  const harvest = fieldWorkPlan(state, 'harvestAll');
  const tend = fieldWorkPlan(state, 'tendAll');
  const date = calendar(state.week);
  return (
    <section className="estate-fieldwork" aria-label="Estate fieldwork">
      <div className="fieldwork-heading">
        <div>
          <h2>In the vines</h2>
          <p>{getEstate(state).name} · All vineyard districts</p>
        </div>
        <div className="fieldwork-actions">
          <div>
            <button
              className="button secondary"
              disabled={Boolean(tend.blocked)}
              aria-describedby="tend-all-status"
              onClick={() => dispatch({ type: 'tendAll' })}
            >
              <Icon name="sprout" size={16} /> Tend all
              {tend.plots.length > 0 && <span>{money(tend.cost)}</span>}
            </button>
            <small id="tend-all-status">
              {tend.blocked ??
                `${tend.plots.length} ${tend.plots.length === 1 ? 'parcel needs' : 'parcels need'} care`}
            </small>
          </div>
          <div>
            <button
              className="button primary"
              disabled={Boolean(harvest.blocked)}
              aria-describedby="harvest-all-status"
              onClick={() => dispatch({ type: 'harvestAll' })}
            >
              <Icon name="grape" size={16} /> Harvest all ready
              {harvest.plots.length > 0 && <span>{money(harvest.cost)}</span>}
            </button>
            <small id="harvest-all-status">
              {harvest.blocked ??
                `${harvest.plots.length} ${harvest.plots.length === 1 ? 'parcel' : 'parcels'} at 80%+ ripeness`}
            </small>
          </div>
        </div>
      </div>
      {plots.length ? (
        <div className="fieldwork-parcels">
          {plots.map((plot) => {
            const land = getLand(state, plot.id);
            const harvested = plot.harvestedYear === date.year;
            const dormant = date.season === 'Winter';
            const ready = Boolean(readyToHarvest(plot, state.week));
            return (
              <button
                key={plot.id}
                className="fieldwork-parcel"
                aria-pressed={plot.id === selected}
                onClick={() => onSelect(plot.id)}
              >
                <span className="fieldwork-name">
                  <strong>{land.name}</strong>
                  <small>{getVariety(state, plot.variety!).name}</small>
                </span>
                <span className="fieldwork-meter">
                  <span>
                    <span>Ripeness</span>
                    <strong>
                      {harvested
                        ? 'Harvested'
                        : dormant
                          ? 'Dormant'
                          : `${Math.round(plot.growth)}%${ready ? ' · Ready' : ''}`}
                    </strong>
                  </span>
                  <Progress
                    value={harvested || dormant ? 0 : plot.growth}
                    gold={ready}
                  />
                </span>
                <span className="fieldwork-meter">
                  <span>
                    <span>Vine health</span>
                    <strong>
                      {Math.round(plot.health)}%
                      {plot.tended === state.week ? ' · Tended' : ''}
                    </strong>
                  </span>
                  <Progress value={plot.health} />
                </span>
                <span className="fieldwork-quality">
                  <span>Est. grape quality</span>
                  {harvested || dormant ? (
                    <span className="fieldwork-quality-status">
                      {harvested ? 'Harvested' : 'Dormant'}
                    </span>
                  ) : (
                    <strong>
                      {harvestQuality(state, plot)}
                      <small> / 100</small>
                    </strong>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="fine-print">
          Plant a parcel to begin tending and harvesting.
        </p>
      )}
      <p className="fine-print">
        Quality is estimated at current conditions. Tending restores up to 16
        health points, once per week. Harvesting picks every ready parcel now;
        waiting for 100% ripeness can improve quality. Fresh lots stay separate
        in the cellar.
      </p>
    </section>
  );
}
