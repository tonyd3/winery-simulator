import { parcelLabel } from './parcelProvenance';
import { demandContext, type DemandContext } from './game';
import { FinanceReport } from './FinanceReport';
import { VintageBook } from './VintageBook';
import { PrivateCollectionControls } from './PrivateCollectionControls';
import { WineCollection } from './WineCollection';
import { CellarFloor, tankGroupKey } from './CellarFloor';
import { qualityResponse, signedPrestige } from './prestige';
import { releaseCount, harvestAdvice } from './game';
import type { ResearchId } from './catalog';
import { Investments } from './EstateInvestments';
import { HarvestForecast } from './HarvestForecast';
import { GrapeArrival } from './GrapeArrival';
import { BatchMaturation } from './BatchMaturation';
import { VESSELS, maturationOutlook } from './maturation';
import {
  CELLAR_TECHNIQUES,
  vinificationStage,
  vinificationWeeks,
} from './cellarTechniques';
import { PlotExpansion } from './PlotExpansion';
import { CellarEquipment } from './CellarEquipment';
import { BottleStoragePanel } from './BottleStoragePanel';
import { ShelfAllocation } from './ShelfAllocation';
import { privateStock, saleStock, shelfStock } from './bottleStorage';
import { ESTATE_LIMITS } from './estates';
import { Holdings } from './Holdings';
import { useCallback, useState } from 'react';
import Reserves from './Reserves';
import { WineLines } from './WineLines';
import { BottleView, Composition, SalesCount } from './WinePresentation';
import { TastingNotes } from './TastingNotes';
import { releaseTasting } from './wineSensory';
import { vintage } from './winemaking';
import WinePromotion, { JudgingStatus } from './WinePromotion';
import { ArrowRight, ArrowUpRight, Check, Pencil, Plus } from 'lucide-react';
import { Icon, Progress, Empty, Modal } from './components';
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
  bottlePriceLimit,
  PRICE_UNLOCK_HINT,
  wholesalePrice,
  money,
  quality,
  readyToHarvest,
  readyToTend,
  tankCount,
  occupiedTankCount,
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
  initialVariety,
}: Props & { selected: number; initialVariety?: Variety }) {
  const plot = state.plots.find((p) => p.id === selected)!;
  const land = getLand(state, selected);
  const [clearing, setClearing] = useState(false);
  const choices = availableVarieties(state, land.region).sort(
    ([a], [b]) =>
      Number(REGIONS[land.region].signature.includes(b)) -
      Number(REGIONS[land.region].signature.includes(a)),
  );
  const [variety, setVariety] = useState<Variety>(
    choices.some(([id]) => id === initialVariety)
      ? initialVariety!
      : choices[0][0],
  );
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
      {plot.variety && (
        <div
          className="parcel-actions"
          role="group"
          aria-label={`${land.name} field actions`}
        >
          <button
            className="button primary wide"
            disabled={!ready || state.cash < plotHarvestCost(plot)}
            onClick={() => dispatch({ type: 'harvest', id: selected })}
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
              !readyToTend(plot, state.week) || state.cash < plotTendCost(plot)
            }
            onClick={() => dispatch({ type: 'tend', id: selected })}
          >
            <Icon name="sprout" size={17} />
            {plot.tended === state.week
              ? 'Tended this week'
              : plot.health >= 100
                ? 'Vines at full health'
                : 'Tend the vines'}
            <span className="button-price">{money(plotTendCost(plot))}</span>
          </button>
          <p className="fine-print">
            {harvested
              ? 'One harvest per parcel, per year.'
              : 'Harvest at 80%+ ripeness, before winter.'}
          </p>
        </div>
      )}
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
          {!harvested && !winter && (
            <HarvestForecast
              state={state}
              plot={plot}
              onBuild={() => navigate('improvements')}
            />
          )}
          <div className="parcel-tip">
            <Icon name={ready ? 'sun' : 'sprout'} size={19} />
            <p>{harvestAdvice(plot, state.week)}</p>
          </div>
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

export function Cellar(
  props: Props & { initialTab?: 'reserves' | 'fermentation' },
) {
  const { state, dispatch } = props;
  const [tab, setTab] = useState<
    'fermentation' | 'reserves' | 'lines' | 'equipment'
  >(props.initialTab ?? 'fermentation');
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
      <section className="supply-strip" aria-label="Bottling supplies">
        <div className="supply-icon" aria-hidden="true">
          <Icon name="package" size={26} />
        </div>
        <div>
          <span className="eyebrow">BOTTLING SUPPLIES</span>
          <h2>Bottles, corks & a label of your own.</h2>
          <p>
            <b>{state.kits.toLocaleString()}</b> bottling kits in stock
            {state.deliveries.length > 0
              ? ` · ${state.deliveries.reduce((n, d) => n + d.kits, 0).toLocaleString()} arriving next week`
              : ' · New orders arrive next week'}
          </p>
        </div>
        <div className="supply-order">
          <button
            className="button primary"
            disabled={state.cash < 480}
            onClick={() => dispatch({ type: 'supplies' })}
          >
            <Plus size={16} />
            Order 600 kits <span className="button-price">$480</span>
          </button>
          {state.cash < 480 && (
            <p>Need {money(480 - state.cash)} more to order.</p>
          )}
        </div>
      </section>
      <BottleStoragePanel state={state} dispatch={dispatch} />
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
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const closeGroup = useCallback(() => setSelectedGroup(null), []);
  const used = new Set(state.batches.flatMap((b) => b.tankIds));
  const groups = [
    ...state.batches.map((batch) => ({ batch, ids: batch.tankIds })),
    ...state.cellar.tanks
      .filter((t) => !used.has(t.id))
      .map((t) => ({ batch: undefined, ids: [t.id] })),
  ].sort(
    (a, b) =>
      Number(Boolean(b.batch)) - Number(Boolean(a.batch)) ||
      Math.min(...a.ids) - Math.min(...b.ids),
  );
  return (
    <div className="operations-page">
      <div className="section-intro">
        <div>
          <span className="eyebrow">FROM GRAPE TO GLASS</span>
          <h2>At work in the cellar.</h2>
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
          </div>
          {state.grapes.map((grapes) => (
            <GrapeArrival
              key={grapes.id}
              state={state}
              grapes={grapes}
              dispatch={dispatch}
              navigate={navigate}
            />
          ))}
        </section>
      )}
      <div className="section-line">
        <h3>The cellar floor</h3>
        <span className="subtle">
          Cellar capacity stays reserved until transfer
        </span>
      </div>
      <CellarFloor state={state} groups={groups} onSelect={setSelectedGroup} />
      {groups.some((group) => tankGroupKey(group) === selectedGroup) && (
        <Modal title="Vessel & wine" onClose={closeGroup}>
          <div className="cellar-vessel-detail">
            {groups
              .filter((group) => tankGroupKey(group) === selectedGroup)
              .map(({ batch: b, ids }) => {
                const modern = b?.agingProfile === 'varietal-v1';
                const vessel =
                  b?.maturationPlan?.vessel ?? (b?.oak ? 'oak' : 'steel');
                const wooden = vessel !== 'steel';
                const outlook =
                  b?.maturationProfile && b.maturationPlan
                    ? maturationOutlook(
                        b.maturationProfile,
                        vessel,
                        b.age,
                        b.oak,
                      )
                    : undefined;
                const capacity = ids.reduce(
                  (n, id) =>
                    n + state.cellar.tanks.find((t) => t.id === id)!.capacity,
                  0,
                );
                return (
                  <div
                    className={`tank-card ${b ? 'occupied' : ''}`}
                    key={b ? `batch-${b.id}` : ids.join('-')}
                  >
                    <div className="tank-top">
                      <span className="eyebrow">
                        {modern && b?.maturationPlan && wooden
                          ? `CELLAR SLOT${ids.length > 1 ? 'S' : ''} ${ids.join(' + ')}`
                          : ids.length > 3
                            ? `${ids.length} TANKS`
                            : `TANK${ids.length > 1 ? 'S' : ''} ${ids.map((id) => String(id).padStart(2, '0')).join(' + ')}`}
                      </span>
                      <span
                        className={`status-tag ${modern ? (b?.stage === 'ready' || outlook?.readiness === 'Ready to release' ? 'ripe' : '') : b && b.stage !== 'fermenting' && b.age === 8 ? 'ripe' : ''}`}
                      >
                        {b
                          ? b.stage === 'fermenting'
                            ? vinificationStage(b)
                            : modern
                              ? b.stage === 'aging'
                                ? (outlook?.readiness ?? 'Aging')
                                : 'Ready for reserves'
                              : b.age === 8
                                ? 'Peak maturity'
                                : 'Aging automatically'
                          : 'Available'}
                      </span>
                    </div>
                    <div
                      className={`tank-illustration tank-vessels ${ids.length > 3 ? 'many-tanks' : ''}`}
                    >
                      {ids.map((id, index) => {
                        const tank = state.cellar.tanks.find(
                          (t) => t.id === id,
                        )!;
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
                            <svg
                              viewBox="0 0 180 155"
                              width="170"
                              aria-hidden="true"
                            >
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
                                fill={wooden ? '#c5a077' : '#bec5b5'}
                              />
                              <path
                                d="M98 47V133Q121 130 137 114V34Z"
                                fill={wooden ? '#ad8963' : '#a6b19f'}
                              />
                              <ellipse
                                cx="90"
                                cy="34"
                                rx="47"
                                ry="21"
                                fill={wooden ? '#d5b48c' : '#d9dece'}
                              />
                              <ellipse
                                cx="90"
                                cy="34"
                                rx="35"
                                ry="14"
                                fill={wooden ? '#bf9a72' : '#c7cebd'}
                              />
                              <path d="M83 16V8H98V17" fill="#adb8a2" />
                              <path
                                d="M43 56Q90 82 137 56M43 105Q90 133 137 105"
                                fill="none"
                                stroke={wooden ? '#81725a' : '#9da991'}
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
                              {b?.stage === 'fermenting' &&
                                vinificationStage(b) === 'Fermenting' && (
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
                        <small className="parcel-source">
                          {state.estates.length > 1 &&
                            `${getEstate(state, b.estateId ?? 1).name} · `}
                          {parcelLabel(b.parcel)}
                        </small>
                        <p className="tank-detail">
                          Year {b.year} · {b.liters} / {capacity} L ·{' '}
                          {b.maturationPlan
                            ? `${VESSELS[vessel].name} maturation`
                            : `${b.oak ? 'French oak' : 'Stainless steel'} fermentation`}
                        </p>
                        {Boolean(b.techniques?.length) && (
                          <p className="tank-techniques">
                            {b
                              .techniques!.map(
                                (id) => CELLAR_TECHNIQUES[id].name,
                              )
                              .join(' · ')}
                          </p>
                        )}
                        <div className="tank-measure">
                          <span>
                            {b.stage === 'fermenting'
                              ? `${b.remaining} ${b.remaining === 1 ? 'week' : 'weeks'} until ready for reserves`
                              : b.stage === 'aging'
                                ? modern
                                  ? `${b.age} game weeks matured`
                                  : `${b.age} / 8 weeks aged`
                                : 'Cellar plan complete'}
                          </span>
                          <b>
                            {quality(b)}
                            <small>/100</small>
                          </b>
                        </div>
                        <Progress
                          value={
                            b.stage === 'fermenting'
                              ? Math.max(
                                  0,
                                  (1 -
                                    b.remaining /
                                      vinificationWeeks(b.techniques)) *
                                    100,
                                )
                              : b.stage === 'aging'
                                ? Math.min(
                                    100,
                                    (b.age / (outlook?.readyFrom ?? 8)) * 100,
                                  )
                                : 100
                          }
                        />
                        {modern && b.stage !== 'fermenting' && (
                          <BatchMaturation
                            batch={b}
                            name={getVariety(state, b.variety).name}
                            cash={state.cash}
                            dispatch={dispatch}
                          />
                        )}
                        {!modern && b.stage !== 'fermenting' && (
                          <p className="maturation-footnote">
                            This older batch keeps its original vessel and
                            eight-week quality curve.
                          </p>
                        )}
                        <div className="tank-actions">
                          <button
                            className="button primary"
                            disabled={
                              b.stage === 'fermenting' ||
                              state.reserves.length >= ESTATE_LIMITS.reserves
                            }
                            onClick={() => {
                              if (dispatch({ type: 'reserve', id: b.id }))
                                onStored();
                            }}
                          >
                            {b.stage === 'fermenting'
                              ? `${vinificationStage(b)}…`
                              : ids.length > 1
                                ? `Move ${ids.length} tanks to reserves`
                                : 'Move to reserves'}
                            <Icon name="glass" size={15} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3>Ready for the next harvest.</h3>
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
        </Modal>
      )}
      <div className="cellar-note">
        <Icon name="help" size={17} />
        <p>
          Great wine starts with healthy, fully ripe grapes suited to their
          site. Choose maturation for each finished batch: steel for freshness,
          neutral oak for texture, or French oak for wood character. Readiness
          depends on the grape; more oak is not always better. Barrel service
          uses the same reserved cellar capacity. Transfer frees your tanks.
        </p>
      </div>
    </div>
  );
}

function WineCard({
  wine: w,
  state,
  dispatch,
  demandGroups,
}: {
  wine: Wine;
  state: GameState;
  dispatch: Dispatch;
  demandGroups: DemandContext;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(w.label);
  const [priceDraft, setPriceDraft] = useState<string | null>(null);
  const priceLimit = bottlePriceLimit(state);
  const forecast = demandForecast({ ...w, listed: true }, state, demandGroups);
  const available = saleStock(w);
  const kept = privateStock(w);
  return (
    <article className="wine-card">
      <div className="wine-card-main">
        <div className="wine-art">
          <span className="quality-seal">
            {w.quality}
            <small>POINTS</small>
          </span>
          <BottleView
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
              {kept > 0
                ? `${kept.toLocaleString()} in Private Collection · ${available.toLocaleString()} available for sale${w.listed ? ` · ${shelfStock(w).toLocaleString()} on shelf` : ' · not listed'}`
                : w.listed && w.bottles > 0
                  ? shelfStock(w) > 0
                    ? `${shelfStock(w).toLocaleString()} on the shelf · ${(w.bottles - shelfStock(w)).toLocaleString()} in warehouse`
                    : 'Waiting for shelf space · all bottles in warehouse'
                  : w.bottles === 0
                    ? 'Sold out'
                    : 'In storage · not listed'}
            </span>
          </p>
          <p className="wine-sales">
            <SalesCount wines={[w]} /> sold
          </p>
          <p className="fine-print">
            <strong>{qualityResponse(w.quality).name}.</strong>{' '}
            {qualityResponse(w.quality).text}{' '}
            {signedPrestige(qualityResponse(w.quality).retail)} Prestige per
            shop sale · {signedPrestige(qualityResponse(w.quality).wholesale)}{' '}
            wholesale.
          </p>
          {available === 0 && <JudgingStatus wine={w} />}
          <details className="wine-recipe">
            <summary>Tasting notes & provenance</summary>
            <Composition parts={w.components} state={state} />
            <TastingNotes profile={releaseTasting(w, state)} />
            <p className="fine-print">
              {w.estate} · Line established Year {w.founded}
            </p>
          </details>
          {w.bottles > 0 && (
            <PrivateCollectionControls wine={w} dispatch={dispatch} />
          )}
          {available > 0 && (
            <>
              <div className="price-heading">
                <label htmlFor={`price-${w.id}`}>Price per bottle</label>
                <div className="price-entry">
                  <span aria-hidden="true">$</span>
                  <input
                    id={`price-${w.id}`}
                    type="number"
                    min={BOTTLE_PRICE.min}
                    max={priceLimit}
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
                max={priceLimit}
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
                <span>{money(priceLimit)}</span>
              </div>
              {priceLimit < BOTTLE_PRICE.max && (
                <p className="fine-print">{PRICE_UNLOCK_HINT}</p>
              )}
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
                  bottles {w.listed ? 'next week' : 'next week after listing'}
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
              <ShelfAllocation wine={w} state={state} dispatch={dispatch} />
              <button
                className="text-button wholesale"
                onClick={() => dispatch({ type: 'wholesale', id: w.id })}
              >
                Sell {available.toLocaleString()} wholesale ·{' '}
                {money(available * wholesalePrice(w, state.reputation, state))}
                <ArrowUpRight size={13} />
              </button>
            </>
          )}
        </div>
      </div>
      {available > 0 && (
        <WinePromotion
          wine={w}
          state={state}
          dispatch={dispatch}
          demandGroups={demandGroups}
        />
      )}
    </article>
  );
}
export function Market({ state, dispatch, navigate }: Props) {
  const [tab, setTab] = useState<'stock' | 'private' | 'history'>('stock');
  const [selected, setSelected] = useState<number | null>(null);
  const closeWine = useCallback(() => setSelected(null), []);
  const selectedWine = state.wines.find((wine) => wine.id === selected);
  const stock = state.wines.filter((w) => saleStock(w) > 0);
  const collection = state.wines.filter((w) => privateStock(w) > 0);
  const keptBottles = collection.reduce((n, w) => n + privateStock(w), 0);
  const demandGroups = demandContext(state);
  return (
    <div className="market-workspace">
      {selectedWine && (
        <Modal
          title={`${selectedWine.label} · Release ${selectedWine.release}`}
          onClose={closeWine}
        >
          <div className="wine-detail">
            <WineCard
              key={selectedWine.id}
              wine={selectedWine}
              state={state}
              dispatch={dispatch}
              demandGroups={demandGroups}
            />
          </div>
        </Modal>
      )}
      <div inert={Boolean(selectedWine)}>
        <nav className="cellar-tabs" aria-label="Wine shop views">
          <button
            className={tab === 'stock' ? 'active' : ''}
            aria-current={tab === 'stock' ? 'page' : undefined}
            onClick={() => setTab('stock')}
          >
            Current wines <span>{stock.length}</span>
          </button>
          <button
            className={tab === 'private' ? 'active' : ''}
            aria-current={tab === 'private' ? 'page' : undefined}
            onClick={() => setTab('private')}
          >
            Private Collection <span>{keptBottles.toLocaleString()}</span>
          </button>
          <button
            className={tab === 'history' ? 'active' : ''}
            aria-current={tab === 'history' ? 'page' : undefined}
            onClick={() => setTab('history')}
          >
            Wine history <span>{releaseCount(state)}</span>
          </button>
        </nav>
        {tab === 'private' ? (
          <div className="operations-page">
            <div className="section-intro">
              <div>
                <span className="eyebrow">KEPT FOR YOUR OWN TABLE</span>
                <h2>Private Collection.</h2>
                <p>
                  A first vintage. A favorite blend. A bottle worth keeping.
                </p>
              </div>
              <span className="capacity-chip">
                {keptBottles.toLocaleString()}{' '}
                {keptBottles === 1 ? 'bottle' : 'bottles'} · {collection.length}{' '}
                {collection.length === 1 ? 'release' : 'releases'}
              </span>
            </div>
            <p className="private-collection-note">
              These bottles are protected from all sales and still use warehouse
              space. Open a wine to revisit its story, keep more, or return
              bottles to stock.
            </p>
            {collection.length ? (
              <WineCollection
                key="private"
                wines={collection}
                state={state}
                onSelect={setSelected}
                dispatch={dispatch}
                privateView
              />
            ) : (
              <Empty
                icon="glass"
                title="Some bottles are yours to keep."
                action={
                  stock.length ? 'Choose a wine to keep' : 'Visit the cellar'
                }
                onAction={() =>
                  stock.length ? setTab('stock') : navigate('cellar')
                }
              >
                Open a wine from Current wines, choose how many bottles to set
                aside, and select Keep bottles. Its artwork, vintage and tasting
                notes will stay here with it.
              </Empty>
            )}
          </div>
        ) : tab === 'history' ? (
          <WineLines state={state} history />
        ) : (
          <div className="operations-page">
            <div className="section-intro">
              <div>
                <span className="eyebrow">BOTTLED AT YOUR ESTATE</span>
                <h2>Your current wines.</h2>
                <p>
                  Adjust prices and shelf space here. Open a wine for its story,
                  promotion, judging and your Private Collection.
                </p>
              </div>
              <span className="capacity-chip">
                <Icon name="shop" />
                {state.stats.sold.toLocaleString()} bottles sold
              </span>
            </div>
            {bottlePriceLimit(state) < BOTTLE_PRICE.max && (
              <p className="pricing-unlock-note">{PRICE_UNLOCK_HINT}</p>
            )}
            <BottleStoragePanel state={state} dispatch={dispatch} shop />
            {stock.length ? (
              <WineCollection
                key="stock"
                wines={stock}
                state={state}
                onSelect={setSelected}
                dispatch={dispatch}
              />
            ) : collection.length ? (
              <Empty
                icon="glass"
                title="Your remaining bottles are kept for you."
                action="View Private Collection"
                onAction={() => setTab('private')}
              >
                Return bottles from your collection to stock, or bottle a new
                release in the cellar.
              </Empty>
            ) : state.wines.length ? (
              <Empty
                icon="glass"
                title="Every bottle found a home."
                action="View wine history"
                onAction={() => setTab('history')}
              >
                Your sold-out wines are kept in the archive. Bottle your
                reserves to bring a new release to the shop.
              </Empty>
            ) : (
              <Empty
                icon="glass"
                title="Your first vintage belongs here."
                action="Visit the cellar"
                onAction={() => navigate('cellar')}
              >
                Harvest your grapes, let them ferment, and bottle your wine.
                Then open the shop and share what you’ve made.
              </Empty>
            )}
            <details className="shop-guide">
              <summary>How selling, demand and distribution work</summary>
              <div className="market-guide">
                <div>
                  <Icon name="shop" />
                  <h3>The wine shop</h3>
                  <p>
                    Above 90 points, each extra point commands a larger price
                    premium. Prestige strengthens that premium. Use the
                    suggested price and sales forecast to find your market.
                    Interest fades gradually over several years. Seasons, grape
                    trends, and visitor surges or slumps move demand up and
                    down. The range allows for weekly surprises; incoming
                    judging results can lift it further.
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
                    wine demand. Review their running costs and seasonal returns
                    in Build.
                  </p>
                </div>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
export function Improvements({
  state,
  dispatch,
  navigate,
  landOpen,
  onTabChange,
  focusUpgrade,
}: Props & {
  landOpen: boolean;
  onTabChange: (open: boolean) => void;
  focusUpgrade?: import('./investments').Upgrade;
}) {
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
          focusUpgrade={focusUpgrade}
        />
      )}
    </>
  );
}
export function Journal(props: Props) {
  const [tab, setTab] = useState<'book' | 'accounts'>('book');
  return (
    <div className="journal-workspace">
      <nav className="cellar-tabs" aria-label="Journal views">
        <button
          className={tab === 'book' ? 'active' : ''}
          aria-current={tab === 'book' ? 'page' : undefined}
          onClick={() => setTab('book')}
        >
          Vintage book
        </button>
        <button
          className={tab === 'accounts' ? 'active' : ''}
          aria-current={tab === 'accounts' ? 'page' : undefined}
          onClick={() => setTab('accounts')}
        >
          Accounts & events
        </button>
      </nav>
      {tab === 'book' ? (
        <VintageBook state={props.state} dispatch={props.dispatch} />
      ) : (
        <JournalAccounts {...props} />
      )}
    </div>
  );
}
function JournalAccounts({ state }: Props) {
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
      <p className="quality-record">
        Average wine sold:{' '}
        <strong>
          {state.stats.qualitySold
            ? (state.stats.qualityPoints / state.stats.qualitySold).toFixed(1)
            : '—'}
          /100
        </strong>{' '}
        · {(state.stats.qualitySold ?? 0).toLocaleString()} bottles since
        quality tracking began. Older sales are not reconstructed.
      </p>
      <FinanceReport state={state} />
      <section className="event-history" aria-label="Estate event history">
        <div className="section-line">
          <h3>Estate events</h3>
          <span className="subtle">Latest 200 important events</span>
        </div>
        {!state.events?.length && (
          <p>Important estate events will be recorded here.</p>
        )}
        {state.events?.map((event, i) => (
          <div className="event-row" key={i}>
            <span>
              Y{calendar(event.week).year} · W{calendar(event.week).week}
            </span>
            <p>{event.text}</p>
          </div>
        ))}
      </section>
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
