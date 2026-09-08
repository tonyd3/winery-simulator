import { useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { grapeResearchId, REGIONS, VARIETIES } from './catalog';
import type { RegionId } from './catalog';
import {
  availableVarieties,
  getEstate,
  getVariety,
  money,
  plantingCost,
  researchBlocked,
  suitability,
} from './game';
import type { GameState } from './game';
import type { Dispatch } from './Panels';
import { Icon } from './components';
import { matchesSearch } from './search';
import { StudyAction } from './ResearchProjects';
import { researchTerms } from './researchProgression';
import { studyWeeks } from './investments';
import type { ResearchNavigation } from './ResearchDecisions';

export function GrapeLibrary({
  state,
  dispatch,
  onFocus,
  onDestination,
}: { state: GameState; dispatch: Dispatch } & ResearchNavigation) {
  const [query, setQuery] = useState(''),
    [color, setColor] = useState('all'),
    [soil, setSoil] = useState('all');
  const [fitFilter, setFit] = useState('all'),
    [availability, setAvailability] = useState('all'),
    [sort, setSort] = useState('name');
  const [region, setRegion] = useState<RegionId>(getEstate(state).region);
  const unlocked = new Set(availableVarieties(state).map(([id]) => id));
  const all = [
    ...Object.entries(VARIETIES),
    ...state.hybrids.map((h) => [h.id, h] as const),
  ];
  const soils = [...new Set(all.map(([, v]) => v.preferred))].sort();
  const terms = (id: string) =>
    unlocked.has(id)
      ? { cost: 0, weeks: 0 }
      : researchTerms(state, grapeResearchId(id));
  const rows = all
    .filter(([id, v]) => {
      const parents =
        state.hybrids
          .find((h) => h.id === id)
          ?.parents.map((p) => getVariety(state, p).name)
          .join(' ') ?? '';
      return (
        matchesSearch(`${v.name} ${v.note} ${parents}`, query) &&
        (color === 'all' || v.wineType === color) &&
        (soil === 'all' || soil === v.preferred) &&
        (fitFilter === 'all' ||
          suitability(state, id, undefined, region).label === fitFilter) &&
        (availability === 'all' ||
          (availability === 'plantable'
            ? unlocked.has(id)
            : availability === 'undiscovered'
              ? !unlocked.has(id)
              : !unlocked.has(id) &&
                !researchBlocked(state, grapeResearchId(id))))
      );
    })
    .sort(([a, av], [b, bv]) => {
      const value =
        sort === 'cost'
          ? terms(a).cost - terms(b).cost
          : sort === 'duration'
            ? studyWeeks(state, terms(a).weeks) -
              studyWeeks(state, terms(b).weeks)
            : sort === 'fit'
              ? suitability(state, a, undefined, region).mismatch -
                suitability(state, b, undefined, region).mismatch
              : sort === 'finesse'
                ? bv.finesse - av.finesse
                : sort === 'yield'
                  ? bv.yieldFactor - av.yieldFactor
                  : 0;
      return value || av.name.localeCompare(bv.name);
    });
  return (
    <section aria-label="Grape library">
      <div className="research-section-heading">
        <h2>Find your next grape.</h2>
        <span>
          {rows.length} / {all.length} varieties
        </span>
      </div>
      <div className="library-filters">
        <label className="grape-search">
          <Search size={16} />
          <input
            aria-label="Search grape varieties"
            placeholder="Find a grape, style or parent…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          Fit for estate
          <select
            aria-label="Grape climate region"
            value={region}
            onChange={(e) => setRegion(e.target.value as RegionId)}
          >
            {state.estates.map((e) => (
              <option key={e.id} value={e.region}>
                {REGIONS[e.region].name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Wine color
          <select value={color} onChange={(e) => setColor(e.target.value)}>
            <option value="all">All colors</option>
            <option>Red</option>
            <option>White</option>
          </select>
        </label>
        <label>
          Preferred soil
          <select value={soil} onChange={(e) => setSoil(e.target.value)}>
            <option value="all">Any soil</option>
            {soils.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Climate fit
          <select value={fitFilter} onChange={(e) => setFit(e.target.value)}>
            <option value="all">Any fit</option>
            {['Excellent', 'Good', 'Challenging'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Availability
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            <option value="all">All varieties</option>
            <option value="plantable">Plantable</option>
            <option value="undiscovered">Not discovered</option>
            <option value="ready">Can study now</option>
          </select>
        </label>
        <label>
          Sort grapes
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="name">Name</option>
            <option value="cost">Study cost: lowest</option>
            <option value="duration">Study duration: shortest</option>
            <option value="fit">Climate fit: best</option>
            <option value="finesse">Finesse: highest</option>
            <option value="yield">Yield: highest</option>
          </select>
        </label>
        <button
          className="text-button"
          onClick={() => {
            setQuery('');
            setColor('all');
            setSoil('all');
            setFit('all');
            setAvailability('all');
            setSort('name');
          }}
        >
          Clear filters
        </button>
      </div>
      <p className="fine-print">
        Climate and planting prices are for {REGIONS[region].name}; study
        discounts always use your home region. Finesse contributes twice its
        value to harvest quality; yield is relative to the parcel’s base crop.
      </p>
      <div className="grape-library">
        {rows.map(([id, v]) => {
          const fit = suitability(state, id, undefined, region),
            hybrid = state.hybrids.find((h) => h.id === id);
          return (
            <article key={id} className="library-grape" aria-label={v.name}>
              <div className="varietal-dot" style={{ background: v.color }}>
                <Icon name="grape" size={20} />
              </div>
              <div className="library-grape-name">
                <h3>{v.name}</h3>
                <p>
                  {v.wineType} · {v.preferred} soil
                  {hybrid
                    ? ` · ${hybrid.parents.map((p) => getVariety(state, p).name).join(' × ')}`
                    : ''}
                </p>
                <small>{v.note}</small>
                <dl className="grape-traits">
                  <div>
                    <dt>Finesse</dt>
                    <dd>{v.finesse}</dd>
                  </div>
                  <div>
                    <dt>Yield</dt>
                    <dd>{Math.round(v.yieldFactor * 100)}%</dd>
                  </div>
                  <div>
                    <dt>Resilience</dt>
                    <dd>{v.resilience}/7</dd>
                  </div>
                </dl>
                <small className="grape-planting-price">
                  Planting: {money(plantingCost(state, id, region))} /
                  unexpanded parcel
                </small>
              </div>
              <div className="library-fit">
                <span className={`fit-label fit-${fit.label.toLowerCase()}`}>
                  {fit.label} climate fit
                </span>
                <small>
                  Warmth {v.heat}/5{fit.regional ? ' · Regional favorite' : ''}
                </small>
                <small>
                  {fit.growth >= 0 ? '+' : ''}
                  {fit.growth} growth/week from climate
                </small>
              </div>
              <div className="library-availability">
                {unlocked.has(id) ? (
                  <>
                    <span>Ready to plant</span>
                    <button
                      className="button secondary"
                      onClick={() =>
                        onDestination({
                          view: 'estate',
                          label: 'Choose a parcel',
                          grape: id,
                        })
                      }
                    >
                      Choose a parcel <ArrowRight size={14} />
                    </button>
                  </>
                ) : (
                  <StudyAction
                    state={state}
                    dispatch={dispatch}
                    id={grapeResearchId(id)}
                    onFocus={onFocus}
                    onDestination={onDestination}
                  />
                )}
              </div>
            </article>
          );
        })}
        {!rows.length && (
          <p>
            No grapes match. Try a different soil, climate fit, or availability.
          </p>
        )}
      </div>
      <p className="fine-print">
        Warmth: 1 = cool, 5 = hot. Matching soil adds 8 quality; regional
        favorites add another 3. Planting larger, expanded parcels costs more.
      </p>
    </section>
  );
}
