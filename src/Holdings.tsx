import { useState } from 'react';
import { ArrowRight, MapPin, Plus, Shuffle } from 'lucide-react';
import { RegionLandscape } from './RegionLandscape';
import { generateEstateName } from './estateNames';
import {
  DISTRICTS,
  ESTATE_LIMITS,
  acquisitionCost,
  districtCost,
  districtForPlot,
  plotId,
} from './estates';
import {
  getEstate,
  estateArea,
  hectares,
  estatePlots,
  getVariety,
  REGIONS,
  REGION_IDS,
  money,
  readyToHarvest,
  tankCount,
} from './game';
import type { GameState, RegionId } from './game';
import type { Dispatch, View } from './Panels';

export function EstateToolbar({
  state,
  dispatch,
  selected,
  onSelect,
  onExpand,
}: {
  state: GameState;
  dispatch: Dispatch;
  selected: number;
  onSelect: (id: number) => void;
  onExpand: () => void;
}) {
  const estate = getEstate(state);
  const ready = estatePlots(state).filter((p) =>
    readyToHarvest(p, state.week),
  ).length;
  return (
    <section className="estate-toolbar" aria-label="Estate navigation">
      <div className="estate-switcher">
        <label htmlFor="active-estate">
          YOUR ESTATES · {state.estates.length} / {ESTATE_LIMITS.estates}
        </label>
        <select
          id="active-estate"
          value={state.activeEstate}
          onChange={(e) =>
            dispatch({ type: 'visitEstate', id: Number(e.target.value) })
          }
        >
          {state.estates.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} · {REGIONS[e.region].name}
            </option>
          ))}
        </select>
        <p>
          <MapPin size={13} /> {REGIONS[estate.region].country} ·{' '}
          {hectares(estateArea(state))} ha owned
          {ready > 0 && ` · ${ready} ready to harvest`}
        </p>
      </div>
      <nav className="district-tabs" aria-label="Vineyard districts">
        {DISTRICTS.slice(0, estate.districts).map((name, i) => (
          <button
            key={name}
            className={districtForPlot(selected) === i ? 'active' : ''}
            aria-current={districtForPlot(selected) === i ? 'page' : undefined}
            onClick={() => onSelect(plotId(estate.id, i))}
          >
            {name}
          </button>
        ))}
      </nav>
      <button className="button secondary" onClick={onExpand}>
        Expand your holdings <Plus size={16} />
      </button>
    </section>
  );
}

export function Holdings({
  state,
  dispatch,
  navigate,
}: {
  state: GameState;
  dispatch: Dispatch;
  navigate: (view: View) => void;
}) {
  const available = REGION_IDS.filter(
    (id) => !state.estates.some((e) => e.region === id),
  );
  const [choice, setChoice] = useState<RegionId>(available[0] ?? state.region);
  const region = available.includes(choice)
    ? choice
    : (available[0] ?? state.region);
  const [name, setName] = useState(`${REGIONS[region].name} Estate`);
  const cost = acquisitionCost(state.estates.length),
    r = REGIONS[region];
  const nameError = !name.trim()
    ? 'Name your new estate.'
    : state.estates.some(
          (e) => e.name.toLowerCase() === name.trim().toLowerCase(),
        )
      ? 'Choose a distinct estate name.'
      : '';
  const visit = (id: number) => {
    if (dispatch({ type: 'visitEstate', id })) navigate('estate');
  };
  return (
    <div className="holdings-page operations-page">
      <div className="section-intro">
        <div>
          <span className="eyebrow">YOUR WINE ESTATES</span>
          <h2>Land & estates.</h2>
          <p>
            Grow your vineyards at home, or put down roots in another region.
          </p>
        </div>
      </div>
      <dl className="holdings-totals">
        <div>
          <dt>Regional estates</dt>
          <dd>
            {state.estates.length}
            <small> / 8</small>
          </dd>
        </div>
        <div>
          <dt>Land under ownership</dt>
          <dd>
            {hectares(
              state.estates.reduce((n, e) => n + estateArea(state, e.id), 0),
            )}
            <small> ha</small>
          </dd>
        </div>
        <div>
          <dt>Shared cellar</dt>
          <dd>
            {tankCount(state)}
            <small> tanks</small>
          </dd>
        </div>
      </dl>
      <p className="holdings-scope">
        One wine business. All estates share funds, research, equipment,
        reserves, and wine lines. Every vineyard grows each week, with its own
        regional climate and soil.
      </p>
      <div className="holdings-list">
        {state.estates.map((estate) => {
          const plots = estatePlots(state, estate.id),
            ready = plots.filter((p) => readyToHarvest(p, state.week)).length;
          const full = estate.districts === ESTATE_LIMITS.districts,
            price = districtCost(estate.districts);
          return (
            <article className="holding-row" key={estate.id}>
              <div className="holding-landscape">
                <RegionLandscape region={estate.region} />
              </div>
              <div className="holding-description">
                <span className="eyebrow">
                  {REGIONS[estate.region].name} ·{' '}
                  {estate.id === 1
                    ? 'HOME ESTATE'
                    : `ESTABLISHED Y${estate.founded}`}
                </span>
                <h3>{estate.name}</h3>
                <p>
                  {hectares(estateArea(state, estate.id))} ha ·{' '}
                  {plots.filter((p) => p.owned).length} parcels ·{' '}
                  {estate.districts} / 4 districts
                  {ready > 0 && ` · ${ready} harvest ready`}
                </p>
                <button
                  className="text-button"
                  onClick={() => visit(estate.id)}
                >
                  Manage {estate.name} <ArrowRight size={14} />
                </button>
              </div>
              <div className="holding-expansion">
                <button
                  className="button secondary"
                  disabled={full || state.cash < price}
                  onClick={() => {
                    if (dispatch({ type: 'expandEstate', id: estate.id }))
                      navigate('estate');
                  }}
                >
                  {full
                    ? 'All districts acquired'
                    : `Add district · ${money(price)}`}
                  {!full && <Plus size={15} />}
                </button>
                <p>
                  {full
                    ? '27.2 ha available across all four districts.'
                    : '6.8 ha · 6 empty parcels · land only'}
                </p>
                {!full && (
                  <small>
                    +{money(185)} / week · Vines purchased separately
                    {state.cash < price &&
                      ` · Need ${money(price - state.cash)} more`}
                  </small>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {available.length > 0 ? (
        <section
          className="estate-acquisition"
          aria-label="Acquire a regional estate"
        >
          <div className="acquisition-landscape">
            <RegionLandscape region={region} />
            <span>
              {r.name}
              <small>{r.country}</small>
            </span>
          </div>
          <div className="acquisition-form">
            <span className="eyebrow">A NEW REGIONAL ESTATE</span>
            <h3>Choose your next terroir.</h3>
            <label className="field-label" htmlFor="acquisition-region">
              Wine region
            </label>
            <select
              id="acquisition-region"
              value={region}
              onChange={(e) => {
                const id = e.target.value as RegionId;
                setChoice(id);
                setName(`${REGIONS[id].name} Estate`);
              }}
            >
              {available.map((id) => (
                <option key={id} value={id}>
                  {REGIONS[id].name} · {REGIONS[id].country}
                </option>
              ))}
            </select>
            <p className="acquisition-grapes">
              Regional favorites:{' '}
              {r.signature.map((id) => getVariety(state, id).name).join(', ')}.
            </p>
            <div className="estate-name-label">
              <label className="field-label" htmlFor="new-estate-name">
                Name your new estate
              </label>
              <button
                className="text-button"
                aria-label="Generate new estate name"
                onClick={() => setName(generateEstateName(region, name))}
              >
                <Shuffle size={13} /> Generate
              </button>
            </div>
            <input
              id="new-estate-name"
              value={name}
              maxLength={32}
              onChange={(e) => setName(e.target.value)}
            />
            <p>
              Includes 3 ha of empty land, with three neighboring parcels
              available to buy. Cellar space and tanks are purchased separately.
              Plant vines to begin production.
            </p>
            <div className="acquisition-cost">
              <strong>{money(cost)}</strong>
              <span>+{money(175)} weekly upkeep</span>
            </div>
            <button
              className="button primary wide"
              disabled={state.cash < cost || Boolean(nameError)}
              onClick={() => {
                if (dispatch({ type: 'acquireEstate', region, name }))
                  navigate('estate');
              }}
            >
              Acquire estate <ArrowRight size={16} />
            </button>
            {(nameError || state.cash < cost) && (
              <p className="fine-print">
                {nameError ||
                  `Need ${money(cost - state.cash)} more to acquire this estate.`}
              </p>
            )}
          </div>
        </section>
      ) : (
        <p className="holdings-complete">
          Your estates span all eight regions. Continue expanding their vineyard
          districts and planting the land you own.
        </p>
      )}
    </div>
  );
}
