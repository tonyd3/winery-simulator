import type { ResearchId } from './catalog';
import { Investments } from './EstateInvestments';
import { grapeStorageWeeks } from './investments';
import { PlotExpansion } from './PlotExpansion';
import { CellarEquipment } from './CellarEquipment';
import { ESTATE_LIMITS } from './estates';
import { Holdings } from './Holdings';
import { useState } from 'react';
import Reserves, { WineLines } from './Reserves';
import { WineBottle, Composition, SalesCount } from './WinePresentation';
import { vintage } from './winemaking';
import WinePromotion from './WinePromotion';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  Pencil,
  Plus,
} from 'lucide-react';
import { Icon, Progress, Empty } from './components';
import {
  availableVarieties,
  getVariety,
  getLand,
  getEstate,
  suitability,
  plotPlantingCost,
  plotHarvestCost,
  plotTendCost,
  plotRemovalCost,
  REGIONS,
  calendar,
  demandForecast,
  retailPrice,
  BOTTLE_PRICE,
  CELLAR_QUALITY,
  wholesalePrice,
  grapeLiters,
  money,
  quality,
  readyToHarvest,
  tankCount,
  occupiedTankCount,
  fermentationPlan,
  upkeep,
} from './game';
import type { GameState, Action, Variety, Wine } from './game';
export type Dispatch = (action: Action) => boolean;
export type View =
  'estate' | 'cellar' | 'market' | 'improvements' | 'research' | 'journal';
type Props = {
  state: GameState;
  dispatch: Dispatch;
  navigate: (view: View, study?: ResearchId) => void;
};

export function PlotInspector({
  state,
  dispatch,
  selected,
  navigate,
}: Props & { selected: number }) {
  const plot = state.plots.find((p) => p.id === selected)!;
  const land = getLand(state, selected);
  const [clearing, setClearing] = useState(false);
  const choices = availableVarieties(state, land.region).sort(
    ([a], [b]) =>
      Number(REGIONS[land.region].signature.includes(b)) -
      Number(REGIONS[land.region].signature.includes(a)),
  );
  const [variety, setVariety] = useState<Variety>(choices[0][0]);
  const ready = readyToHarvest(plot, state.week);
  const harvested = plot.harvestedYear === calendar(state.week).year;
  const winter = calendar(state.week).season === 'Winter';
  return (
    <aside
      className="plot-inspector"
      id="parcel-inspector"
      tabIndex={0}
      aria-labelledby="parcel-title"
    >
      <div className="eyebrow">
        PARCEL {String(selected).padStart(2, '0')}
        <span className={`status-tag ${ready ? 'ripe' : ''}`}>
          {plot.owned
            ? ready
              ? 'Harvest ready'
              : plot.variety
                ? harvested
                  ? 'Resting'
                  : winter
                    ? 'Dormant'
                    : 'Growing'
                : 'Unplanted'
            : 'For sale'}
        </span>
      </div>
      <h2 id="parcel-title">{land.name}</h2>
      <p className="inspector-subtitle">
        {land.area} hectares · {land.aspect}
      </p>
      <div className={`grape-summary ${!plot.variety ? 'unplanted' : ''}`}>
        <div className="grape-medallion">
          <Icon name={plot.variety ? 'grape' : 'sprout'} size={35} />
        </div>
        <div>
          <small>
            {plot.variety
              ? 'GRAPE VARIETY'
              : plot.owned
                ? 'A BLANK CANVAS'
                : 'YOUR NEXT CHAPTER'}
          </small>
          <h3>
            {plot.variety
              ? getVariety(state, plot.variety).name
              : plot.owned
                ? 'Ready for new vines'
                : 'Room to grow'}
          </h3>
          <span>
            {plot.variety
              ? `${getVariety(state, plot.variety).wineType} wine grape`
              : `${land.soil} soil · ${land.yield} kg base yield`}
          </span>
        </div>
      </div>
      <div className="soil-row">
        <span>
          <Icon name="leaf" size={16} /> Soil type
        </span>
        <b>{land.soil}</b>
      </div>
      {(plot.variety || plot.owned) && (
        <div className="parcel-fit">
          <span
            className={`fit-label fit-${suitability(state, plot.variety || variety, undefined, land.region).label.toLowerCase()}`}
          >
            {
              suitability(
                state,
                plot.variety || variety,
                undefined,
                land.region,
              ).label
            }{' '}
            climate fit
          </span>
          <small>
            {REGIONS[land.region].name} ·{' '}
            {suitability(state, plot.variety || variety, undefined, land.region)
              .regional
              ? 'Regional favorite'
              : 'Imported / estate variety'}
          </small>
          <span>
            {suitability(state, plot.variety || variety, undefined, land.region)
              .growth >= 0
              ? '+'
              : ''}
            {
              suitability(
                state,
                plot.variety || variety,
                undefined,
                land.region,
              ).growth
            }{' '}
            growth / week ·{' '}
            {suitability(state, plot.variety || variety, land.soil, land.region)
              .quality >= 0
              ? '+'
              : ''}
            {
              suitability(
                state,
                plot.variety || variety,
                land.soil,
                land.region,
              ).quality
            }{' '}
            harvest quality
          </span>
        </div>
      )}
      {plot.variety ? (
        <>
          <div className="meter">
            <div>
              <span>Grape ripeness</span>
              <b>{harvested ? 'Harvested' : `${Math.round(plot.growth)}%`}</b>
            </div>
            <Progress value={plot.growth} gold={Boolean(ready)} />
          </div>
          <div className="meter">
            <div>
              <span>Vine health</span>
              <b>
                {Math.round(plot.health)}%{' '}
                <span className="subtle">
                  {plot.health > 80 ? 'Healthy' : 'Needs care'}
                </span>
              </b>
            </div>
            <Progress value={plot.health} />
          </div>
          <div className="parcel-tip">
            <Icon name={ready ? 'sun' : 'sprout'} size={19} />
            <p>
              {ready
                ? 'A promising harvest. Pick now, or leave the grapes a little longer for more ripeness.'
                : harvested
                  ? 'A well-earned rest. These vines will grow again next spring.'
                  : winter
                    ? 'The vineyard is resting. Bud break begins in spring.'
                    : 'A little care goes a long way. Tend your vines to improve the quality of your next harvest.'}
            </p>
          </div>
          <button
            className="button primary wide"
            disabled={!ready || state.cash < plotHarvestCost(plot)}
            onClick={() => {
              if (dispatch({ type: 'harvest', id: selected }))
                navigate('cellar');
            }}
          >
            <Icon name="grape" size={17} />
            {harvested
              ? 'Harvest complete'
              : ready
                ? 'Harvest grapes'
                : 'Waiting for ripeness'}
            {ready && (
              <span className="button-price">
                {money(plotHarvestCost(plot))}
              </span>
            )}
          </button>
          <button
            className="button secondary wide"
            disabled={
              winter ||
              harvested ||
              plot.tended === state.week ||
              state.cash < plotTendCost(plot)
            }
            onClick={() => dispatch({ type: 'tend', id: selected })}
          >
            <Icon name="sprout" size={17} />
            {plot.tended === state.week ? 'Tended this week' : 'Tend the vines'}
            <span className="button-price">{money(plotTendCost(plot))}</span>
          </button>
          <p className="fine-print">
            {harvested
              ? 'One harvest per parcel, per year.'
              : 'Harvest at 80%+ ripeness, before winter.'}
          </p>
          {clearing ? (
            <div className="replant-confirm">
              <p>
                Remove these vines for {money(plotRemovalCost(plot))}? Any
                unpicked crop is lost. New vines are purchased separately.
              </p>
              <button
                className="button secondary wide"
                disabled={state.cash < plotRemovalCost(plot)}
                onClick={() => {
                  if (dispatch({ type: 'uproot', id: selected }))
                    setClearing(false);
                }}
              >
                Remove vines · {money(plotRemovalCost(plot))}
              </button>
              <button
                className="text-button"
                onClick={() => setClearing(false)}
              >
                Keep these vines
              </button>
            </div>
          ) : (
            <button
              className="text-button replant-link"
              onClick={() => setClearing(true)}
            >
              Replace grape variety
            </button>
          )}
        </>
      ) : plot.owned ? (
        <>
          <label className="field-label" htmlFor="variety">
            Choose your grape variety
          </label>
          <select
            id="variety"
            value={variety}
            onChange={(e) => setVariety(e.target.value as Variety)}
          >
            {choices.map(([id, v]) => (
              <option key={id} value={id}>
                {v.name} · {money(plotPlantingCost(state, plot, id))}
                {REGIONS[land.region].signature.includes(id) ? ' · Local' : ''}
              </option>
            ))}
          </select>
          <p className="variety-note">{getVariety(state, variety).note}</p>
          <div className="parcel-tip">
            <Icon name="leaf" size={18} />
            <p>
              {getVariety(state, variety).preferred === land.soil
                ? 'A natural match. This soil gives your grapes an 8-point quality bonus.'
                : `This grape prefers ${getVariety(state, variety).preferred.toLowerCase()} soil. It will grow here, with no soil quality bonus.`}
            </p>
          </div>
          <button
            className="button primary wide"
            disabled={state.cash < plotPlantingCost(state, plot, variety)}
            onClick={() => dispatch({ type: 'plant', id: selected, variety })}
          >
            <Plus size={17} />
            Plant vines
            <span className="button-price">
              {money(plotPlantingCost(state, plot, variety))}
            </span>
          </button>
          <p className="fine-print">
            New vines start at 15% growth. One harvest per parcel each year.
          </p>
          <button className="text-button" onClick={() => navigate('research')}>
            Explore grapes & research <ArrowRight size={14} />
          </button>
        </>
      ) : (
        <>
          <p className="land-description">
            A quiet piece of the valley with {land.soil.toLowerCase()}{' '}
            underfoot. Make it part of your estate and plant something
            wonderful.
          </p>
          <div className="parcel-tip">
            <Icon name="grape" size={20} />
            <p>
              Best paired with{' '}
              {choices.find(([, v]) => v.preferred === land.soil)?.[1].name ||
                'a variety from your grape library'}
              . Purchase includes the land; vines are planted separately.
            </p>
          </div>
          <button
            className="button primary wide"
            disabled={state.cash < land.cost}
            onClick={() => dispatch({ type: 'buyPlot', id: selected })}
          >
            Buy this parcel
            <span className="button-price">{money(land.cost)}</span>
          </button>
          <p className="fine-print">Adds $25 to weekly estate upkeep.</p>
          {state.cash < land.cost && (
            <p className="fine-print">
              Need {money(land.cost - state.cash)} more to buy this parcel.
            </p>
          )}
        </>
      )}
      {plot.owned && (
        <PlotExpansion state={state} plot={plot} dispatch={dispatch} />
      )}
      <div className="inspector-bottom">
        <span className="tiny-dot" /> Part of{' '}
        {getEstate(state, land.estateId).name}
      </div>
    </aside>
  );
}

export function Cellar(props: Props) {
  const [tab, setTab] = useState<
    'fermentation' | 'reserves' | 'lines' | 'equipment'
  >('fermentation');
  return (
    <div className="cellar-workspace">
      <nav className="cellar-tabs" aria-label="Cellar departments">
        {(
          [
            ['fermentation', 'Fermentation'],
            ['reserves', 'Reserves & blending'],
            ['lines', 'Wine lines'],
            ['equipment', 'Space & tanks'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            aria-current={tab === id ? 'page' : undefined}
            className={tab === id ? 'active' : ''}
            onClick={() => setTab(id)}
          >
            {label}
            {id === 'reserves' && <span>{props.state.reserves.length}</span>}
          </button>
        ))}
      </nav>
      {tab === 'fermentation' ? (
        <Fermentation
          {...props}
          onStored={() => setTab('reserves')}
          onEquipment={() => setTab('equipment')}
        />
      ) : tab === 'reserves' ? (
        <Reserves
          state={props.state}
          dispatch={props.dispatch}
          onResearch={(id) => props.navigate('research', id)}
        />
      ) : tab === 'equipment' ? (
        <div className="operations-page">
          <CellarEquipment state={props.state} dispatch={props.dispatch} />
        </div>
      ) : (
        <WineLines state={props.state} />
      )}
    </div>
  );
}
function Fermentation({
  state,
  dispatch,
  navigate,
  onStored,
  onEquipment,
}: Props & { onStored: () => void; onEquipment: () => void }) {
  const [oak, setOak] = useState(false);
  const used = new Set(state.batches.flatMap((b) => b.tankIds));
  const groups = [
    ...state.batches.map((batch) => ({ batch, ids: batch.tankIds })),
    ...state.cellar.tanks
      .filter((t) => !used.has(t.id))
      .map((t) => ({ batch: undefined, ids: [t.id] })),
  ].sort((a, b) => Math.min(...a.ids) - Math.min(...b.ids));
  return (
    <div className="operations-page">
      <div className="section-intro">
        <div>
          <span className="eyebrow">FROM GRAPE TO GLASS</span>
          <h2>Good wine takes its time.</h2>
          <p>
            Make room for the next harvest. Give this one room to become
            something.
          </p>
        </div>
        <span className="capacity-chip">
          <Icon name="barrel" />
          {occupiedTankCount(state)} / {tankCount(state)} tanks occupied
        </span>
      </div>
      <div className="cellar-equipment-link">
        <span>
          {state.cellar.bays - tankCount(state)} empty bays · New tanks hold 150
          L each
        </span>
        <button className="text-button" onClick={onEquipment}>
          Buy tanks & expand cellar <ArrowRight size={15} />
        </button>
      </div>
      {state.grapes.length > 0 && (
        <section className="grape-arrivals">
          <div className="section-line">
            <h3>
              Fresh from the vineyard{' '}
              <span className="count">{state.grapes.length}</span>
            </h3>
            <label className="oak-toggle">
              <input
                type="checkbox"
                checked={oak}
                onChange={(e) => setOak(e.target.checked)}
              />{' '}
              French oak · $320 per tank{' '}
              <span className="subtle">/ steel · $140 per tank</span>
            </label>
          </div>
          {state.grapes.map((g) => {
            const plan = fermentationPlan(state, g.kg, oak);
            return (
              <div className="arrival" key={g.id}>
                <div className="arrival-icon">
                  <Icon name="grape" size={27} />
                </div>
                <div className="arrival-description">
                  <h4>{getVariety(state, g.variety).name}</h4>
                  {state.estates.length > 1 && (
                    <small>{getEstate(state, g.estateId ?? 1).name}</small>
                  )}
                  <p>
                    {g.kg} kg · {g.quality}/100 quality · makes{' '}
                    {grapeLiters(g.kg)} L
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
                    disabled={plan.missing > 0 || state.cash < plan.cost}
                    onClick={() => dispatch({ type: 'ferment', id: g.id, oak })}
                  >
                    {plan.missing > 0
                      ? 'More tanks needed'
                      : `Ferment · ${money(plan.cost)}`}
                    <ArrowRight size={16} />
                  </button>
                  <small>
                    {plan.missing > 0
                      ? `Need ${plan.missing} L more empty tank capacity`
                      : `${plan.fills.length} tank${plan.fills.length === 1 ? '' : 's'} · ${plan.fills.map((f) => `${f.liters} L`).join(' + ')}`}
                  </small>
                  {plan.missing === 0 && state.cash < plan.cost && (
                    <small>Need {money(plan.cost - state.cash)} more</small>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}
      <div className="section-line">
        <h3>The cellar floor</h3>
        <span className="subtle">
          Each harvest stays together through fermentation & aging
        </span>
      </div>
      <div className="tank-grid">
        {groups.map(({ batch: b, ids }) => {
          const capacity = ids.reduce(
            (n, id) =>
              n + state.cellar.tanks.find((t) => t.id === id)!.capacity,
            0,
          );
          return (
            <div
              className={`tank-card ${b ? 'occupied' : ''}`}
              key={ids.join('-')}
            >
              <div className="tank-top">
                <span className="eyebrow">
                  {ids.length > 3
                    ? `${ids.length} TANKS`
                    : `TANK${ids.length > 1 ? 'S' : ''} ${ids.map((id) => String(id).padStart(2, '0')).join(' + ')}`}
                </span>
                <span
                  className={`status-tag ${b?.stage === 'ready' ? 'ripe' : ''}`}
                >
                  {b
                    ? b.stage === 'fermenting'
                      ? 'Fermenting'
                      : b.stage === 'aging'
                        ? 'Aging'
                        : 'Ready for reserves'
                    : 'Available'}
                </span>
              </div>
              <div
                className={`tank-illustration tank-vessels ${ids.length > 3 ? 'many-tanks' : ''}`}
              >
                {ids.map((id, index) => {
                  const tank = state.cellar.tanks.find((t) => t.id === id)!;
                  const earlierCapacity = ids
                    .slice(0, index)
                    .reduce(
                      (n, earlier) =>
                        n +
                        state.cellar.tanks.find((t) => t.id === earlier)!
                          .capacity,
                      0,
                    );
                  const filled = b
                    ? Math.min(
                        tank.capacity,
                        Math.max(0, b.liters - earlierCapacity),
                      )
                    : 0;
                  return (
                    <div className="tank-vessel" key={id}>
                      <svg viewBox="0 0 180 155" width="170" aria-hidden="true">
                        <ellipse
                          cx="95"
                          cy="139"
                          rx="56"
                          ry="9"
                          fill="#413e2f0c"
                        />
                        <path
                          d="M53 116v24M127 116v24"
                          stroke="#999d89"
                          strokeWidth="6"
                        />
                        <path
                          d="M43 34V114Q90 146 137 114V34"
                          fill={b?.oak ? '#c5a077' : '#bec5b5'}
                        />
                        <path
                          d="M98 47V133Q121 130 137 114V34Z"
                          fill={b?.oak ? '#ad8963' : '#a6b19f'}
                        />
                        <ellipse
                          cx="90"
                          cy="34"
                          rx="47"
                          ry="21"
                          fill={b?.oak ? '#d5b48c' : '#d9dece'}
                        />
                        <ellipse
                          cx="90"
                          cy="34"
                          rx="35"
                          ry="14"
                          fill={b?.oak ? '#bf9a72' : '#c7cebd'}
                        />
                        <path d="M83 16V8H98V17" fill="#adb8a2" />
                        <path
                          d="M43 56Q90 82 137 56M43 105Q90 133 137 105"
                          fill="none"
                          stroke={b?.oak ? '#81725a' : '#9da991'}
                          strokeWidth="4"
                        />
                        <rect
                          x="64"
                          y="73"
                          width="31"
                          height="29"
                          rx="3"
                          fill="#f5f2df"
                        />
                        <text
                          x="79"
                          y="85"
                          textAnchor="middle"
                          fontSize="6"
                          fill="#817c65"
                        >
                          TERROIR
                        </text>
                        <text
                          x="79"
                          y="95"
                          textAnchor="middle"
                          fontSize="7"
                          fill="#817c65"
                        >
                          {b ? `Y${b.year}` : 'EMPTY'}
                        </text>
                        <path
                          d="M119 105h15v7"
                          stroke="#6f7f6a"
                          strokeWidth="4"
                          fill="none"
                        />
                        {b?.stage === 'fermenting' && (
                          <g className="ferment-bubbles" fill="#b5bf9e">
                            <circle cx="81" cy="2" r="3" />
                            <circle cx="99" cy="-4" r="2" />
                          </g>
                        )}
                      </svg>
                      {b && (
                        <small>
                          #{id} · {filled} / {tank.capacity} L
                        </small>
                      )}
                    </div>
                  );
                })}
              </div>
              {b ? (
                <>
                  <h3>{getVariety(state, b.variety).name}</h3>
                  <p className="tank-detail">
                    Year {b.year} · {b.liters} / {capacity} L ·{' '}
                    {b.oak ? 'French oak' : 'Stainless steel'}
                  </p>
                  <div className="tank-measure">
                    <span>
                      {b.stage === 'fermenting'
                        ? `${b.remaining} weeks remaining`
                        : b.stage === 'aging'
                          ? `${b.age} / 8 weeks aged`
                          : 'Fermentation complete'}
                    </span>
                    <b>
                      {quality(b)}
                      <small>/100</small>
                    </b>
                  </div>
                  <Progress
                    value={
                      b.stage === 'fermenting'
                        ? (2 - b.remaining) * 50
                        : b.stage === 'aging'
                          ? (b.age / 8) * 100
                          : 100
                    }
                  />
                  <div className="tank-actions">
                    {b.stage === 'ready' && (
                      <button
                        className="button secondary"
                        onClick={() => dispatch({ type: 'age', id: b.id })}
                      >
                        {ids.length > 1
                          ? `Age all ${ids.length} tanks`
                          : 'Let it age'}
                      </button>
                    )}
                    <button
                      className="button primary"
                      disabled={
                        b.stage === 'fermenting' ||
                        state.reserves.length >= ESTATE_LIMITS.reserves
                      }
                      onClick={() => {
                        if (dispatch({ type: 'reserve', id: b.id })) onStored();
                      }}
                    >
                      {b.stage === 'fermenting'
                        ? 'Fermenting…'
                        : ids.length > 1
                          ? `Move ${ids.length} tanks to reserves`
                          : 'Move to reserves'}
                      <Icon name="glass" size={15} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3>A little breathing room.</h3>
                  <p className="tank-detail">
                    {capacity} L available · Harvest grapes to start a new
                    batch.
                  </p>
                  <button
                    className="text-button"
                    onClick={() => navigate('estate')}
                  >
                    Back to the vineyard <ArrowUpRight size={15} />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="supply-strip">
        <div className="supply-icon">
          <Icon name="package" size={26} />
        </div>
        <div>
          <h3>Bottles, corks & a label of your own.</h3>
          <p>
            <b>{state.kits}</b> bottling kits in stock
            {state.deliveries.length > 0
              ? ` · ${state.deliveries.reduce((n, d) => n + d.kits, 0)} arriving next week`
              : ' · New orders arrive next week'}
          </p>
        </div>
        <button
          className="button secondary"
          disabled={state.cash < 480}
          onClick={() => dispatch({ type: 'supplies' })}
        >
          <Plus size={16} />
          600 kits · $480
        </button>
      </div>
      <div className="cellar-note">
        <Icon name="help" size={17} />
        <p>
          Great wine starts with healthy, fully ripe grapes suited to their
          site. New batches gain up to {CELLAR_QUALITY.oakMaturity} points from
          oak aging or {CELLAR_QUALITY.steelMaturity} in steel over 8 weeks.
          Move finished wine to reserves to free all of its tanks.
        </p>
      </div>
    </div>
  );
}

function WineCard({
  wine: w,
  state,
  dispatch,
}: {
  wine: Wine;
  state: GameState;
  dispatch: Dispatch;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(w.label);
  const [priceDraft, setPriceDraft] = useState<string | null>(null);
  const forecast = demandForecast({ ...w, listed: true }, state);
  return (
    <article className="wine-card">
      <div className="wine-card-main">
        <div className="wine-art">
          <span className="quality-seal">
            {w.quality}
            <small>POINTS</small>
          </span>
          <WineBottle
            name={w.label}
            estate={w.estate}
            design={w.design}
            founded={w.founded}
            year={vintage(w.components)}
            release={w.release}
            white={getVariety(state, w.variety).wineType === 'White'}
          />
        </div>
        <div className="wine-card-body">
          <div className="eyebrow">
            {vintage(w.components)} · RELEASE{' '}
            {String(w.release).padStart(2, '0')}
          </div>
          {editing ? (
            <form
              className="inline-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (dispatch({ type: 'label', id: w.id, name }))
                  setEditing(false);
              }}
            >
              <input
                aria-label="Wine label"
                value={name}
                maxLength={40}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <button aria-label="Save wine label" className="icon-button">
                <Check size={17} />
              </button>
            </form>
          ) : (
            <h3>
              {w.label}
              <button
                className="icon-button"
                aria-label={`Rename ${w.label}`}
                onClick={() => setEditing(true)}
              >
                <Pencil size={13} />
              </button>
            </h3>
          )}
          <p>
            {w.bottles.toLocaleString()} bottles remaining{' '}
            <span className="subtle">
              ·{' '}
              {w.listed && w.bottles > 0
                ? 'On the shelf'
                : w.bottles === 0
                  ? 'Sold out'
                  : 'Not yet listed'}
            </span>
          </p>
          <p className="wine-sales">
            <SalesCount wines={[w]} /> sold
          </p>
          <details className="wine-recipe">
            <summary>Blend & provenance</summary>
            <Composition parts={w.components} state={state} />
            <p className="fine-print">
              {w.estate} · Line established Year {w.founded}
            </p>
          </details>
          {w.bottles > 0 && (
            <>
              <div className="price-heading">
                <label htmlFor={`price-${w.id}`}>Price per bottle</label>
                <div className="price-entry">
                  <span aria-hidden="true">$</span>
                  <input
                    id={`price-${w.id}`}
                    type="number"
                    min={BOTTLE_PRICE.min}
                    max={BOTTLE_PRICE.max}
                    step="1"
                    required
                    aria-label={`Price per bottle for ${w.label} release ${w.release}`}
                    aria-describedby={`price-limits-${w.id}`}
                    value={priceDraft ?? String(w.price)}
                    onChange={(e) => {
                      const value = e.target.valueAsNumber;
                      if (
                        e.target.validity.valid &&
                        Number.isInteger(value) &&
                        dispatch({ type: 'price', id: w.id, price: value })
                      )
                        setPriceDraft(null);
                      else setPriceDraft(e.target.value);
                    }}
                    onBlur={() => setPriceDraft(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (e.currentTarget.reportValidity())
                          e.currentTarget.blur();
                      }
                    }}
                  />
                </div>
              </div>
              <input
                aria-label={`Adjust price for ${w.label} release ${w.release}`}
                type="range"
                min={BOTTLE_PRICE.min}
                max={BOTTLE_PRICE.max}
                step="1"
                value={w.price}
                aria-valuetext={money(w.price)}
                onChange={(e) => {
                  setPriceDraft(null);
                  dispatch({
                    type: 'price',
                    id: w.id,
                    price: Number(e.target.value),
                  });
                }}
              />
              <div className="price-limits" id={`price-limits-${w.id}`}>
                <span>{money(BOTTLE_PRICE.min)}</span>
                <span>{money(BOTTLE_PRICE.max)}</span>
              </div>
              <div className="price-guide">
                <button
                  className="text-button"
                  title="Use this suggested shelf price"
                  aria-label={`Use suggested price for ${w.label} release ${w.release}`}
                  onClick={() =>
                    dispatch({
                      type: 'price',
                      id: w.id,
                      price: retailPrice(w, state),
                    })
                  }
                >
                  Suggested: {money(retailPrice(w, state))}{' '}
                  <ArrowUpRight size={12} />
                </button>
                <span>
                  {forecast.low === forecast.high
                    ? forecast.low
                    : `${forecast.low}–${forecast.high}`}{' '}
                  bottles next week
                </span>
              </div>
              <p className="fine-print">
                {state.week - w.bottled} week
                {state.week - w.bottled === 1 ? '' : 's'} since bottling ·
                Interest tapers over years.
              </p>
              <p className="fine-print">
                {forecast.outlook}. Weekly sales vary.
              </p>
              <button
                className={`button ${w.listed ? 'secondary' : 'primary'} wide`}
                onClick={() => dispatch({ type: 'list', id: w.id })}
              >
                {w.listed ? (
                  <>
                    <Check size={16} />
                    On sale · Pause listing
                  </>
                ) : (
                  <>
                    List in the wine shop
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
              <button
                className="text-button wholesale"
                onClick={() => dispatch({ type: 'wholesale', id: w.id })}
              >
                Sell all wholesale ·{' '}
                {money(w.bottles * wholesalePrice(w, state.reputation, state))}
                <ArrowUpRight size={13} />
              </button>
            </>
          )}
        </div>
      </div>
      {w.bottles > 0 && (
        <WinePromotion wine={w} state={state} dispatch={dispatch} />
      )}
    </article>
  );
}
export function Market({ state, dispatch, navigate }: Props) {
  const [tab, setTab] = useState<'stock' | 'history'>('stock');
  const stock = state.wines.filter((w) => w.bottles > 0);
  return (
    <div className="market-workspace">
      <nav className="cellar-tabs" aria-label="Wine shop views">
        <button
          className={tab === 'stock' ? 'active' : ''}
          aria-current={tab === 'stock' ? 'page' : undefined}
          onClick={() => setTab('stock')}
        >
          Current wines <span>{stock.length}</span>
        </button>
        <button
          className={tab === 'history' ? 'active' : ''}
          aria-current={tab === 'history' ? 'page' : undefined}
          onClick={() => setTab('history')}
        >
          Wine history <span>{state.wines.length}</span>
        </button>
      </nav>
      {tab === 'history' ? (
        <WineLines state={state} history />
      ) : (
        <div className="operations-page">
          <div className="section-intro">
            <div>
              <span className="eyebrow">A VINTAGE WORTH SHARING</span>
              <h2>From your estate, to their table.</h2>
              <p>Set your price. Build your reputation. Find your regulars.</p>
            </div>
            <span className="capacity-chip">
              <Icon name="shop" />
              {state.stats.sold.toLocaleString()} bottles sold
            </span>
          </div>
          {stock.length ? (
            <div className="wine-grid">
              {[...stock].reverse().map((w) => (
                <WineCard
                  key={w.id}
                  wine={w}
                  state={state}
                  dispatch={dispatch}
                />
              ))}
            </div>
          ) : state.wines.length ? (
            <Empty
              icon="glass"
              title="Every bottle found a home."
              action="View wine history"
              onAction={() => setTab('history')}
            >
              Your sold-out wines are kept in the archive. Bottle your reserves
              to bring a new release to the shop.
            </Empty>
          ) : (
            <Empty
              icon="glass"
              title="Your first vintage belongs here."
              action="Visit the cellar"
              onAction={() => navigate('cellar')}
            >
              Harvest your grapes, let them ferment, and bottle your wine. Then
              open the shop and share what you’ve made.
            </Empty>
          )}
          <div className="market-guide">
            <div>
              <Icon name="shop" />
              <h3>The wine shop</h3>
              <p>
                Above 90 points, each extra point commands a larger price
                premium. Reputation strengthens that premium. Use the suggested
                price and sales forecast to find your market. Interest fades
                gradually over several years. Seasons, grape trends, and visitor
                surges or slumps move demand up and down. The range allows for
                weekly surprises; incoming judging results can lift it further.
              </p>
            </div>
            <div>
              <Icon name="package" />
              <h3>A distributor’s offer</h3>
              <p>
                Distributors pay 60% of suggested value, including medals.
                Temporary marketing boosts apply only to the wine shop.
              </p>
            </div>
            <div>
              <Icon name="glass" />
              <h3>A place at your table</h3>
              <p>
                Visitor facilities and specialist teams can raise income and
                wine demand. Review their running costs and seasonal returns in
                Build.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export function Improvements({
  state,
  dispatch,
  navigate,
  landOpen,
  onTabChange,
}: Props & { landOpen: boolean; onTabChange: (open: boolean) => void }) {
  return (
    <>
      <nav className="cellar-tabs" aria-label="Build departments">
        <button
          className={!landOpen ? 'active' : ''}
          aria-current={!landOpen ? 'page' : undefined}
          onClick={() => onTabChange(false)}
        >
          Buildings & equipment
        </button>
        <button
          className={landOpen ? 'active' : ''}
          aria-current={landOpen ? 'page' : undefined}
          onClick={() => onTabChange(true)}
        >
          Land & estates
        </button>
      </nav>
      {landOpen ? (
        <Holdings state={state} dispatch={dispatch} navigate={navigate} />
      ) : (
        <Investments
          state={state}
          dispatch={dispatch}
          onLand={() => onTabChange(true)}
          onResearch={(id) => navigate('research', id)}
        />
      )}
    </>
  );
}
export function Journal({ state }: Props) {
  return (
    <div className="operations-page">
      <div className="section-intro">
        <div>
          <span className="eyebrow">THE BUSINESS OF GOOD WINE</span>
          <h2>Every season tells a story.</h2>
          <p>Keep an eye on the numbers. Make room for the next chapter.</p>
        </div>
      </div>
      <div className="journal-stats">
        <div>
          <small>AVAILABLE FUNDS</small>
          <strong>{money(state.cash)}</strong>
        </div>
        <div>
          <small>LIFETIME REVENUE</small>
          <strong>{money(state.stats.revenue)}</strong>
        </div>
        <div>
          <small>WEEKLY UPKEEP</small>
          <strong>{money(upkeep(state))}</strong>
        </div>
        <div>
          <small>BEST VINTAGE</small>
          <strong>
            {state.stats.best || '—'}
            <small> / 100</small>
          </strong>
        </div>
      </div>
      <section>
        <div className="section-line">
          <h3>The estate ledger</h3>
          <span className="subtle">Latest 80 transactions</span>
        </div>
        <div className="ledger">
          {state.ledger.map((l, i) => (
            <div className="ledger-row" key={i}>
              <span>
                Y{calendar(l.week).year} · W{calendar(l.week).week}
              </span>
              <b>{l.label}</b>
              <strong className={l.amount > 0 ? 'positive' : ''}>
                {l.amount > 0 ? '+' : '−'}
                {money(Math.abs(l.amount))}
              </strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
